-- -------------------------------------------------------------------
-- Project Sentinel — Community Pack Registry
-- Migration 002: Tracks registered community content packs
-- -------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS community_packs (
    id           SERIAL PRIMARY KEY,
    pack_id      TEXT NOT NULL UNIQUE,
    author       TEXT NOT NULL,
    version      TEXT NOT NULL,
    description  TEXT NOT NULL,
    manifest     JSONB NOT NULL,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active       BOOLEAN NOT NULL DEFAULT TRUE
);

-- Community lore document index (mirrors ChromaDB metadata)
CREATE TABLE IF NOT EXISTS community_lore_index (
    id          SERIAL PRIMARY KEY,
    pack_id     TEXT NOT NULL REFERENCES community_packs(pack_id),
    file_path   TEXT NOT NULL,
    chroma_id   TEXT NOT NULL,
    priority    INTEGER NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 9),
    indexed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_lore_pack ON community_lore_index(pack_id);
