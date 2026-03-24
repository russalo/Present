# Project Sentinel — Zero to Hero in 5 Minutes

Welcome, Technician. This guide gets the **Infrastructure Node** running on your local machine and proves — with a live API call — that the schema-enforcement layer actually works. No Tailscale required for local development.

> **What you'll have at the end:** A running PostgreSQL database, a ChromaDB vector store, and a live MCP server that validates AI-generated world updates against a JSON Schema contract before touching a single file.

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| [Docker](https://docs.docker.com/get-docker/) + Docker Compose | Latest | Runs PostgreSQL and ChromaDB containers |
| [Python](https://www.python.org/downloads/) | **3.11+** | Runs the MCP servers (strict type hints require 3.11) |
| [Git](https://git-scm.com/) | Any | Clones the repo |
| [Tailscale](https://tailscale.com/download) | Any | **Optional** — only needed for multi-machine deployments |

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/russalo/present.git project-sentinel
cd project-sentinel
```

> **Why this is cool:** The repo is a pnpm monorepo with TypeScript artifacts and Python MCP servers living side by side. You only need Python for the Infrastructure Node — the TypeScript frontend is a separate concern you can ignore entirely to start.

---

## Step 2: Configure Your Environment

```bash
cp infrastructure/.env.example infrastructure/.env
```

Open `infrastructure/.env` and set a real PostgreSQL password. This is the **only** required change for local development:

```bash
# infrastructure/.env — change this one line:
POSTGRES_PASSWORD=my_local_dev_password
```

Everything else defaults to `127.0.0.1` (local-only), which is exactly right during development.

> **Why this is cool:** The `TAILSCALE_BIND_IP` variable means the same `.env` works for both local dev (`127.0.0.1`) and a real multi-node mesh deployment (a Tailscale IP like `100.x.y.z`). Zero config drift between environments.

---

## Step 3: Boot the Infrastructure Node

```bash
cd infrastructure
docker compose up -d
```

Verify both services are healthy:

```bash
docker compose ps
```

Expected output — both showing **healthy**:

```
NAME                  STATUS
sentinel-postgres     Up (healthy)
sentinel-chromadb     Up (healthy)
```

If they're still starting up, wait 20 seconds and check again. You can also hit ChromaDB's heartbeat directly:

```bash
curl http://127.0.0.1:8000/api/v1/heartbeat
# Expected: {"nanosecond heartbeat": <timestamp>}
```

> **Why this is cool:** PostgreSQL handles rigid relational state (entity inventories, faction resources, coordinates). ChromaDB is the semantic memory — it lets the Lorekeeper agent search through thousands of Markdown lore entries by *meaning*, not just keywords. When a player mentions "the old lighthouse", the system already knows about it.

---

## Step 4: Start the fs-manager MCP Server

Open a new terminal tab and run:

```bash
cd mcp-servers/fs-manager
pip install -r requirements.txt
python server.py --port 8010 --dev
```

The `--dev` flag enables verbose logging so you can see every validation decision in real time.

Expected output:

```
INFO  Starting fs-manager on 127.0.0.1:8010
INFO  Application startup complete.
```

Confirm it's alive:

```bash
curl http://127.0.0.1:8010/health
# Expected: {"status":"ok","server":"fs-manager","version":"0.1.0"}
```

> **Why this is cool:** This server is the entire security boundary between the LLM and your filesystem. The AI *never* gets a shell. It can only call this validated API. Every write is gated by a JSON Schema contract before any file is touched.

---

## Step 5: Hello World — Prove the Schema Gate Works

Two API calls. One succeeds, one gets rejected instantly. Both are educational.

### ✅ Valid World Update

```bash
curl -s -X POST http://127.0.0.1:8010/tools/apply_world_update \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "123e4567-e89b-12d3-a456-426614174000",
    "log_entry": "The adventurer Kael steps into the torch-lit tavern of Trog, scanning for familiar faces among the evening crowd.",
    "updates": [
      {
        "target_file": "data/state/core/entities/kael.json",
        "operation": "create",
        "data": {
          "name": "Kael",
          "location": "Trog Tavern",
          "status": "active"
        }
      }
    ],
    "metadata": {
      "agent": "fact-extractor",
      "turn_number": 1,
      "confidence": 0.95
    }
  }' | python3 -m json.tool
```

Expected response:

```json
{
  "success": true,
  "session_id": "123e4567-e89b-12d3-a456-426614174000",
  "results": [
    {
      "status": "created",
      "path": "data/state/core/entities/kael.json"
    }
  ]
}
```

Verify both files appeared on disk:

```bash
# The entity state file:
cat data/state/core/entities/kael.json

# The auto-appended session log:
cat data/lore/core/sessions/123e4567-e89b-12d3-a456-426614174000.md
```

Both were written atomically by the MCP server. The Inference Node never touched the filesystem directly.

---

### ❌ Malformed Payload — Watch the Airlock Reject It

```bash
curl -s -X POST http://127.0.0.1:8010/tools/apply_world_update \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "not-a-valid-uuid",
    "log_entry": "Hi",
    "updates": []
  }' | python3 -m json.tool
```

Expected response (HTTP 422):

```json
{
  "detail": {
    "code": "VALIDATION_ERROR",
    "detail": "'not-a-valid-uuid' is not a 'uuid'",
    "path": ["session_id"]
  }
}
```

> **Why this matters:** This payload has three violations simultaneously — `session_id` is not a UUID, `log_entry` is under the 10-character minimum, and `updates` is empty (minimum 1 item). The schema validator catches all of this *before a single file is opened*. Malformed AI output cannot corrupt world state.

---

## You're In. What's Next?

| Want to... | Go here |
|---|---|
| Understand the full three-node architecture | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Add lore, schemas, or MCP tools | [`CONTRIBUTING.md`](../CONTRIBUTING.md) |
| Run the React + Express frontend demo | [`artifacts/rpg-engine/`](../artifacts/rpg-engine/) |
| Start the db-vector or git-sync MCP servers | `mcp-servers/db-vector/` and `mcp-servers/git-sync/` |
| See the full project roadmap | [`ROADMAP.md`](../ROADMAP.md) |
| Export a world state as a `.spak` package | `ARCHITECTURE.md` → Sentinel Porter section |

---

*Questions? Open an issue using the [Technician template](../.github/ISSUE_TEMPLATE/mcp_tool.md).*
