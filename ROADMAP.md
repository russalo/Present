# Project Sentinel — Roadmap

> **"The world runs. You just play in it."**

This is the path from a working prototype to a fully decentralized, community-driven RPG multiverse. Every unchecked box is an **open bounty** — a concrete feature waiting for a contributor to claim it.

Pick your pathway: [Lore-Smith](#-the-multiverse-community) · [Schema-Architect](#-the-brawn-infrastructure) · [Technician](#-the-bridge-mcp-servers)

---

## v0.1 — Baseline *(current)*

The core engine is alive. The schema gate holds. The loop runs.

- [x] Three-node architecture (Inference · MCP Bridge · Infrastructure)
- [x] `apply_world_update` JSON Schema contract (`schemas/`)
- [x] `fs-manager` MCP server — zero-touch file CRUD with path validation
- [x] `db-vector` MCP server — PostgreSQL + ChromaDB query routing
- [x] `git-sync` MCP server — atomic Git commits after every world update
- [x] Docker Compose stack (PostgreSQL 16 + ChromaDB)
- [x] Core vs. Community namespace separation (`ARCHITECTURE.md`)
- [x] `community.json` gateway manifest schema
- [x] Three contributor issue templates (Lore-Smith, Schema-Architect, Technician)
- [x] React + Express reference implementation (`artifacts/`)

---

## v0.2 — The Foundation Solidifies

*Goal: Make the engine contributor-safe and production-honest.*

### 🏋️ The Brawn (Infrastructure)
*Open to: Schema-Architects, Technicians*

- [ ] **Auto-migrating schemas** — A CLI script that reads `schema_version` from `data/state/core/` and applies sequential migration scripts from `/infrastructure/migrations/` automatically on startup. No manual SQL on deploy.
- [ ] **SQLite fallback mode** — Allow single-machine deployments without Docker by swapping PostgreSQL for SQLite. Lowers the barrier to entry from "I need Docker" to "I need Python."
- [ ] **Health dashboard** — A `/status` endpoint aggregating health across all three MCP servers and both Docker services into a single JSON response.
- [ ] **Automated backup cron** — A shell script that exports a timestamped PostgreSQL dump + `/data/` snapshot to a local `/backups/` directory on a configurable schedule.

### 🌉 The Bridge (MCP Servers)
*Open to: Technicians*

- [ ] **Schema version negotiation** — `fs-manager` reads `schema_version` from incoming payloads and rejects payloads from mismatched engine versions with a clear upgrade message.
- [ ] **Audit log endpoint** — `GET /tools/audit_log?session_id=<uuid>` returns the last N operations performed against a session, queryable from the Inference Node for debugging.
- [ ] **Rate limiting** — Per-session write rate limits on `fs-manager` to prevent runaway LLM loops from flooding the filesystem during a generation failure.

### 🧠 The Brain (Agents)
*Open to: Technicians, Schema-Architects*

- [ ] **CI pipeline** — GitHub Actions workflow running `pnpm typecheck`, Python `ruff` lint, and JSON Schema validation on every PR. The schema gate must never ship broken.
- [ ] **Fact-Extractor prompt v1** — The first official `agents/fact-extractor.yaml` prompt definition that reliably extracts `<world_update>` JSON from DM narrative output.

---

## v0.3 — The World Breathes

*Goal: The world updates itself even when no one is playing.*

### 🏋️ The Brawn (Infrastructure)
*Open to: Schema-Architects, Technicians*

- [ ] **pgvector semantic deduplication** — Before inserting a new lore fact into ChromaDB, query for cosine similarity. If a near-identical fact exists (>0.95), merge rather than duplicate. Keeps the RAG index clean over thousands of sessions.
- [ ] **Entity relationship graph** — A dedicated `relationships` table in PostgreSQL tracking directional relationships between entities (e.g., `kael TRUSTS innkeeper`, `faction_A IS_AT_WAR_WITH faction_B`).

### 🌉 The Bridge (MCP Servers)
*Open to: Technicians*

- [ ] **`discord-broadcaster` MCP** — An optional MCP server that posts a formatted summary of each `log_entry` to a configurable Discord webhook after every world update. Sessions become live-streamed stories.
- [ ] **`combat-roller` MCP** — A stateless MCP tool that accepts a dice expression (`3d6+2`) and a target DC and returns a structured roll result. Moves randomness out of the LLM and into a deterministic system.
- [ ] **`weather-oracle` MCP** — Hooks into Open-Meteo (no API key required) to inject real atmospheric conditions into the DM's context. If it's stormy outside your window, it's stormy in Trog.

### 🧠 The Brain (Agents)
*Open to: Technicians, Schema-Architects*

- [ ] **Background simulation cron** — A scheduled job (APScheduler) that ticks the world forward every N minutes: faction resources decay, NPC mood states shift, time-of-day advances. The world doesn't freeze between sessions.
- [ ] **Lorekeeper RAG v1** — The first production `agents/lorekeeper.yaml` prompt that queries `db-vector` for semantically relevant codex entries and injects them into the DM context window before each turn.

---

## v0.5 — The Multiverse Stirs

*Goal: A world state can leave one machine and arrive on another.*

### 🏋️ The Brawn (Infrastructure)
*Open to: Schema-Architects, Technicians*

- [ ] **`.spak` export pipeline** — The Sentinel Porter CLI (`porter export`) that runs The Veil scrubber (PII tokenization), excludes raw session logs, and bundles `data/state/` + `data/lore/codex/` into a deterministic `.tar.gz` archive.
- [ ] **Airlock import validator** — The Sentinel Porter CLI (`porter import <file.spak>`) running the full Airlock pipeline: isolated extraction → JSON Schema validation → path sanitization → vector re-embedding → version migration.

### 🌉 The Bridge (MCP Servers)
*Open to: Technicians*

- [ ] **`porter-airlock` MCP** — Expose the import/export pipeline as an MCP tool so the Inference Node can trigger a world export mid-session (e.g., "checkpoint this world state before the battle").
- [ ] **Multi-session `db-vector` partitioning** — Namespace ChromaDB collections by `session_id` so multiple parallel campaigns can share one Infrastructure Node without RAG cross-contamination.

### 🧠 The Brain (Agents)
*Open to: Technicians*

- [ ] **Multi-NPC faction war simulation** — A simulation module that evaluates faction resource levels and relationship graphs each tick and autonomously generates `<world_update>` payloads for battles, diplomatic events, and resource changes — no player input required.
- [ ] **Fact-Extractor confidence calibration** — Track Fact-Extractor `confidence` scores over time per agent and surface a calibration report. Low-confidence extractions are flagged for human review before being committed.

### 🌍 The Multiverse (Community)
*Open to: Lore-Smiths, Schema-Architects*

- [ ] **`trog-core-v1` expansion pack** — The first official Core expansion: a complete `community.json` manifest for the city of Trog, including 10 named NPCs, 5 factions, 3 locations, and a starter lore codex. The reference implementation for all future community packs.
- [ ] **Community pack validation CI** — A GitHub Actions job that validates any PR touching `data/community/` against the `community_manifest.schema.json` schema automatically.

---

## v1.0 — The Multiverse

*Goal: Any Sentinel world can be discovered, installed, and played by anyone.*

### 🌍 The Multiverse (Community)
*Open to: All pathways*

- [ ] **`.spak` registry** — A community-hosted index of published world states. Contributors submit a `registry.json` entry pointing to their `.spak` URL. The Porter CLI supports `porter search` and `porter install <world-name>`.
- [ ] **World divergence tracking** — When a community pack forks a Core world, track the divergence point in `manifest.json`. The registry displays a "forked from Trog Core v1.2 at turn 847" provenance chain.
- [ ] **Sentinel Forge (web UI)** — A read-only web dashboard that renders the world state (entities, factions, relationships) as an interactive graph. No write access — purely a visualization layer for spectators and DMs.
- [ ] **Plugin API v1** — A stable, versioned MCP tool registration API that allows community MCP servers to self-register with the Bridge router. Third-party tools become installable plugins, not forks.
- [ ] **Sentinel Charter** — A governance document ratified by the community defining rules for Core namespace stewardship, schema deprecation timelines, and the process for elevating a community pack to official Core canon.

---

## How to Claim a Bounty

1. **Find** an unchecked item that matches your pathway (Lore-Smith / Schema-Architect / Technician)
2. **Open an issue** using the matching [issue template](/.github/ISSUE_TEMPLATE/) to signal your intent
3. **Reference this roadmap item** in your issue title (e.g., `[Roadmap v0.3] discord-broadcaster MCP`)
4. **Submit a PR** following the guidelines in [CONTRIBUTING.md](CONTRIBUTING.md)

The Core Team will tag claimed bounties with `in-progress` to prevent duplicate effort.

---

*Sentinel runs. The world waits. What will you build?*
