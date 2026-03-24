-- -------------------------------------------------------------------
-- Project Sentinel — Initial World State Schema
-- Migration 001: Core tables for structured world state
-- -------------------------------------------------------------------

-- Active sessions
CREATE TABLE IF NOT EXISTS sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    world_name  TEXT NOT NULL,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    world_seed  TEXT,
    turn_count  INTEGER NOT NULL DEFAULT 0
);

-- World meta-state
CREATE TABLE IF NOT EXISTS world_state (
    id               SERIAL PRIMARY KEY,
    session_id       UUID REFERENCES sessions(id),
    world_name       TEXT NOT NULL DEFAULT 'Unknown Realm',
    current_era      TEXT NOT NULL DEFAULT 'The Beginning',
    current_location TEXT NOT NULL DEFAULT 'Nowhere',
    weather          TEXT NOT NULL DEFAULT 'Calm',
    time_of_day      TEXT NOT NULL DEFAULT 'Dawn',
    tension          INTEGER NOT NULL DEFAULT 0 CHECK (tension BETWEEN 0 AND 10),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Turn log
CREATE TABLE IF NOT EXISTS turns (
    id             SERIAL PRIMARY KEY,
    session_id     UUID NOT NULL REFERENCES sessions(id),
    turn_number    INTEGER NOT NULL,
    player_action  TEXT NOT NULL,
    narrative      TEXT NOT NULL,
    world_updates  JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Characters (NPCs, player, enemies)
CREATE TABLE IF NOT EXISTS characters (
    id               SERIAL PRIMARY KEY,
    unique_id        UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    namespace        TEXT NOT NULL DEFAULT 'core' CHECK (namespace IN ('core', 'community')),
    name             TEXT NOT NULL,
    role             TEXT NOT NULL DEFAULT 'npc' CHECK (role IN ('player', 'npc', 'enemy', 'ally')),
    class            TEXT,
    race             TEXT,
    level            INTEGER DEFAULT 1,
    health           INTEGER DEFAULT 100,
    max_health       INTEGER DEFAULT 100,
    current_location TEXT,
    description      TEXT,
    traits           TEXT[],
    status           TEXT NOT NULL DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'unknown', 'missing')),
    canon            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id               SERIAL PRIMARY KEY,
    unique_id        UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    namespace        TEXT NOT NULL DEFAULT 'core',
    name             TEXT NOT NULL,
    type             TEXT NOT NULL DEFAULT 'area',
    description      TEXT NOT NULL,
    region           TEXT,
    discovered       BOOLEAN NOT NULL DEFAULT FALSE,
    danger           INTEGER DEFAULT 0 CHECK (danger BETWEEN 0 AND 10),
    notable_features TEXT[],
    canon            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Factions
CREATE TABLE IF NOT EXISTS factions (
    id               SERIAL PRIMARY KEY,
    unique_id        UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    namespace        TEXT NOT NULL DEFAULT 'core',
    name             TEXT NOT NULL,
    description      TEXT NOT NULL,
    alignment        TEXT,
    power            INTEGER DEFAULT 5 CHECK (power BETWEEN 0 AND 10),
    player_relation  INTEGER DEFAULT 0 CHECK (player_relation BETWEEN -10 AND 10),
    goals            TEXT[],
    canon            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Items
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    unique_id   UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
    namespace   TEXT NOT NULL DEFAULT 'core',
    name        TEXT NOT NULL,
    type        TEXT NOT NULL DEFAULT 'misc' CHECK (type IN ('weapon', 'armor', 'potion', 'artifact', 'misc', 'key')),
    description TEXT NOT NULL,
    rarity      TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'legendary', 'artifact')),
    owned_by    TEXT,
    location    TEXT,
    magical     BOOLEAN NOT NULL DEFAULT FALSE,
    canon       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_turns_session ON turns(session_id, turn_number);
CREATE INDEX IF NOT EXISTS idx_characters_name ON characters(lower(name));
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(lower(name));
CREATE INDEX IF NOT EXISTS idx_factions_name ON factions(lower(name));
CREATE INDEX IF NOT EXISTS idx_items_name ON items(lower(name));
