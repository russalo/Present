# Project Sentinel

**Autonomous, Persistent RPG World Engine.**

Project Sentinel is a distributed, "Zero-Touch" role-playing environment. It separates high-level LLM orchestration (Inference Node) from strict world-state management (Infrastructure Node) using the Model Context Protocol (MCP).

**The user's only interface is the narrative. The system handles the infrastructure.**

---

## Architecture Skeleton

Sentinel operates on a strict separation of concerns to enable seamless remote play via a Tailscale mesh network.

1. **Inference Node** (`/world-engine`): Houses the DM, Fact-Extractor, and Lorekeeper agents. It evaluates user input, queries the world state, and outputs rich narrative alongside machine-readable `<world_update>` tags.
2. **Infrastructure Node** (`/infrastructure`): The Linux-based storage layer. It manages the PostgreSQL/Vector database, background simulations, and a Git-backed hybrid filesystem (JSON for state, Markdown for lore).
3. **The MCP Bridge** (`/mcp-servers`): The Inference Node *never* touches files directly. It issues structured requests to local MCP servers on the Infrastructure Node, which validate and execute filesystem, database, and git operations.

```text
project-sentinel/
├── data/                      # Hybrid Storage Layer
│   ├── lore/                  # Human-readable narrative (Markdown)
│   │   ├── codex/             # World building, locations, histories
│   │   └── sessions/          # Play session transcripts and logs
│   └── state/                 # Machine-readable current world state (JSON)
│       ├── entities/          # NPCs, players, and items
│       └── factions/          # Faction standings and resources
├── infrastructure/            # Node Backbone (The Brawn)
│   ├── docker/                # Compose files for PostgreSQL & pgvector
│   ├── migrations/            # SQL scripts for DB schema initialization
│   └── tailscale/             # Mesh network configurations and ACLs
├── mcp-servers/               # The Bridge (Model Context Protocol)
│   ├── db-vector/             # RAG/DB interface (query routing, vector search)
│   ├── fs-manager/            # Zero-Touch file handler for /data CRUD
│   └── git-sync/              # Automated version control and state snapshotting
├── schemas/                   # Shared JSON Schema contracts
│   └── apply_world_update.schema.json
├── world-engine/              # Inference & Orchestration (The Brain)
│   ├── agents/                # Prompt boundaries and persona definitions
│   │   ├── dm.yaml            # Storyteller and rule arbiter
│   │   ├── fact-extractor.yaml# Parses narrative into <world_update> events
│   │   └── lorekeeper.yaml    # Manages RAG context injection
│   ├── orchestrator/          # The Core Loop (Action -> Narrative -> Extract -> Update)
│   └── simulation/            # Background world progression and cron-events
├── .github/
│   └── ISSUE_TEMPLATE/        # Contributor templates (Lore-Smith, Technician, Architect)
├── ARCHITECTURE.md            # Core vs. Community framework and namespace rules
├── CONTRIBUTING.md            # Contributor pathways and coding standards
├── folder_structure.json      # Machine-readable repo manifest
└── README.md
```

---

## The Core Loop

```
Player Action
     │
     ▼
DM Agent (Inference Node)
     │  generates narrative
     ▼
Fact-Extractor Agent
     │  parses <world_update> JSON tag
     ▼
MCP Server Router
     │
     ├── fs-manager  ──► /data/state/*.json  (entity/faction mutations)
     ├── fs-manager  ──► /data/lore/*.md     (session log appends)
     ├── db-vector   ──► PostgreSQL + ChromaDB (structured queries + RAG)
     └── git-sync    ──► Local Git commit     (version snapshot)
     │
     ▼
Updated World State loaded into next DM context window
```

1. **Action**: User inputs a role-play action via the Client Node.
2. **Narrative**: DM Agent generates the story response.
3. **Extraction**: Fact-Extractor parses the response for state changes.
4. **Trigger**: System generates a structured `<world_update>` JSON payload.
5. **Execution**: Relevant MCP server (Filesystem/DB) consumes the payload and updates the Infrastructure.
6. **Sync**: Git-Sync MCP commits the change to version control.
7. **Reload**: Updated world state is injected into the next DM context window.

---

## Getting Started (Bridge Initialization)

### Prerequisites

- Docker and Docker Compose
- Python 3.11+
- Tailscale (for multi-node deployments)
- A Tailscale account with both nodes authenticated

### 1. Configure Environment

```bash
cp infrastructure/.env.example infrastructure/.env
# Edit .env with your credentials and Tailscale IP
```

### 2. Spin Up the Infrastructure Node

```bash
cd infrastructure
docker-compose up -d

# Verify both services are healthy
docker-compose ps
```

### 3. Start the MCP Bridge

```bash
# Filesystem manager — handles /data CRUD with schema validation
python -m mcp_servers.fs_manager --port 8000

# Vector DB interface — routes queries to PostgreSQL and ChromaDB
python -m mcp_servers.db_vector --port 8001

# Git sync — automated versioning after each world update
python -m mcp_servers.git_sync --port 8002
```

### 4. Initialize the Inference Loop

```bash
cd world-engine
python orchestrator/main.py
```

---

## Core Principles

- **Automation First** — The world updates itself. Zero manual file handling.
- **Modularity Always** — Every subsystem is independently replaceable.
- **Human-Readable** — Lore stored in Markdown; state stored in JSON.
- **AI-Native** — Personas, pipelines, and tools designed for LLM orchestration.
- **Schema-Enforced** — The Inference Node is *never* granted raw filesystem access.
- **Community-Friendly** — Plug-and-play via the `community.json` gateway manifest.

---

## Live Demo

A fully functional reference implementation of Project Sentinel (React frontend + Express backend + PostgreSQL) is available at the repository root. See the `artifacts/` directory.

---

## License

MIT — Build worlds. Share them.
