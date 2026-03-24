"""
Project Sentinel — db-vector MCP Server

RAG/DB interface. Routes semantic queries to ChromaDB and
structured queries to PostgreSQL on behalf of the Inference Node.
The Lorekeeper and Fact-Extractor agents communicate through this server.

Usage:
    python server.py --port 8011

Dependencies:
    pip install -r requirements.txt
"""

import argparse
import logging
import os
from typing import Any

import chromadb
import psycopg2
import psycopg2.extras
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("db-vector")

# -------------------------------------------------------------------
# Configuration
# -------------------------------------------------------------------

POSTGRES_DSN = (
    f"host={os.environ.get('PGHOST', 'localhost')} "
    f"port={os.environ.get('PGPORT', '5432')} "
    f"dbname={os.environ.get('PGDATABASE', 'sentinel_world')} "
    f"user={os.environ.get('PGUSER', 'sentinel_admin')} "
    f"password={os.environ.get('PGPASSWORD', '')}"
)

CHROMA_HOST = os.environ.get("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.environ.get("CHROMA_PORT", "8000"))

app = FastAPI(
    title="Sentinel db-vector MCP Server",
    description="RAG/DB interface for Project Sentinel.",
    version="0.1.0",
)

# -------------------------------------------------------------------
# Database Connections (lazy initialization)
# -------------------------------------------------------------------

_pg_conn = None
_chroma_client = None

def get_pg():
    global _pg_conn
    if _pg_conn is None or _pg_conn.closed:
        _pg_conn = psycopg2.connect(POSTGRES_DSN)
    return _pg_conn

def get_chroma():
    global _chroma_client
    if _chroma_client is None:
        _chroma_client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)
    return _chroma_client

# -------------------------------------------------------------------
# MCP Endpoints
# -------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "server": "db-vector", "version": "0.1.0"}


@app.post("/tools/query_lore")
async def query_lore(body: dict):
    """
    Semantic search over ChromaDB lore collections.
    Returns ranked results with Core namespace prioritized.
    """
    query_text = body.get("query")
    top_k = body.get("top_k", 8)
    namespace_filter = body.get("namespace")  # "core", "community", or None for both

    if not query_text:
        raise HTTPException(status_code=422, detail={"code": "MISSING_QUERY", "detail": "query field is required."})

    try:
        chroma = get_chroma()
        collection = chroma.get_or_create_collection("sentinel_lore")

        where = {"namespace": namespace_filter} if namespace_filter else None
        results = collection.query(
            query_texts=[query_text],
            n_results=top_k,
            where=where,
            include=["documents", "metadatas", "distances"],
        )

        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        ranked = sorted(
            zip(documents, metadatas, distances),
            key=lambda x: (-(x[1].get("priority", 5)), x[2]),
        )

        return {
            "results": [
                {"document": doc, "metadata": meta, "distance": dist}
                for doc, meta, dist in ranked
            ]
        }
    except Exception as e:
        logger.error(f"query_lore failed: {e}")
        raise HTTPException(status_code=500, detail={"code": "CHROMA_ERROR", "detail": str(e)})


@app.post("/tools/upsert_entity")
async def upsert_entity(body: dict):
    """
    Upsert an entity record into PostgreSQL and update its ChromaDB embedding.
    Only allowed for community namespace unless authorized.
    """
    entity_type = body.get("entity_type")
    name = body.get("name")
    data = body.get("data", {})

    if not entity_type or not name:
        raise HTTPException(status_code=422, detail={"code": "MISSING_FIELDS", "detail": "entity_type and name are required."})

    table_map = {
        "character": "characters",
        "location": "locations",
        "faction": "factions",
        "item": "items",
    }

    table = table_map.get(entity_type)
    if not table:
        raise HTTPException(status_code=422, detail={"code": "UNKNOWN_ENTITY_TYPE", "detail": f"Unknown entity_type: {entity_type}"})

    try:
        conn = get_pg()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(f"SELECT id, unique_id FROM {table} WHERE lower(name) = lower(%s)", (name,))
            existing = cur.fetchone()

            if existing:
                set_clauses = ", ".join([f"{k} = %s" for k in data.keys() if k not in ("unique_id", "namespace", "created_at", "canon")])
                values = [v for k, v in data.items() if k not in ("unique_id", "namespace", "created_at", "canon")]
                values.append(existing["id"])
                if set_clauses:
                    cur.execute(f"UPDATE {table} SET {set_clauses}, updated_at = NOW() WHERE id = %s", values)
                conn.commit()
                return {"status": "updated", "id": existing["id"], "unique_id": str(existing["unique_id"])}
            else:
                columns = ["name"] + [k for k in data.keys() if k not in ("unique_id", "created_at")]
                placeholders = ", ".join(["%s"] * len(columns))
                values = [name] + [data[k] for k in data.keys() if k not in ("unique_id", "created_at")]
                cur.execute(
                    f"INSERT INTO {table} ({', '.join(columns)}) VALUES ({placeholders}) RETURNING id, unique_id",
                    values,
                )
                row = cur.fetchone()
                conn.commit()
                return {"status": "created", "id": row["id"], "unique_id": str(row["unique_id"])}
    except Exception as e:
        logger.error(f"upsert_entity failed: {e}")
        raise HTTPException(status_code=500, detail={"code": "DB_ERROR", "detail": str(e)})


@app.post("/tools/search_context")
async def search_context(body: dict):
    """
    Assembles the full Lorekeeper context package for the DM:
    live PostgreSQL state + ranked ChromaDB lore.
    """
    current_location = body.get("current_location", "")
    player_name = body.get("player_name", "")
    query_text = body.get("query_text", "")
    top_k = body.get("top_k", 6)

    context = {}

    try:
        conn = get_pg()
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("SELECT * FROM characters WHERE lower(current_location) = lower(%s) AND status = 'alive'", (current_location,))
            context["present_characters"] = cur.fetchall()

            cur.execute("SELECT * FROM locations WHERE lower(name) = lower(%s)", (current_location,))
            context["current_location_data"] = cur.fetchone()

            cur.execute("SELECT * FROM factions ORDER BY ABS(player_relation) DESC LIMIT 5")
            context["active_factions"] = cur.fetchall()

            cur.execute("SELECT * FROM items WHERE lower(owned_by) = lower(%s) OR lower(location) = lower(%s)", (player_name, current_location))
            context["nearby_items"] = cur.fetchall()
    except Exception as e:
        logger.warning(f"PostgreSQL context fetch failed: {e}")

    if query_text:
        try:
            chroma = get_chroma()
            collection = chroma.get_or_create_collection("sentinel_lore")
            results = collection.query(query_texts=[query_text], n_results=top_k, include=["documents", "metadatas"])
            context["lore_context"] = [
                {"document": doc, "metadata": meta}
                for doc, meta in zip(results["documents"][0], results["metadatas"][0])
            ]
        except Exception as e:
            logger.warning(f"ChromaDB context fetch failed: {e}")

    return context

# -------------------------------------------------------------------
# Entry Point
# -------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sentinel db-vector MCP Server")
    parser.add_argument("--port", type=int, default=8011)
    parser.add_argument("--host", type=str, default="127.0.0.1")
    args = parser.parse_args()
    logger.info(f"Starting db-vector on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)
