# Workspace — Project Sentinel

Developer context document. Covers stack, structure, database schema, AI
architecture, and API routes for contributors and AI coding agents.

---

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own
dependencies.

This is an **AI-powered RPG World Engine** — a fully automated, persistent RPG
interface where an AI Dungeon Master narrates the world and automatically
updates world state (characters, locations, factions, items) after each player
turn.

---

## Stack

| Concern | Choice | Notes |
|---|---|---|
| Monorepo | pnpm workspaces | `apps/*`, `artifacts/*`, `lib/*` |
| Node.js | 24 | |
| Package manager | pnpm | |
| TypeScript | 5.9 | |
| API framework | Express 5 | `artifacts/api-server/` |
| Database | PostgreSQL + Drizzle ORM | |
| Validation | Zod (`zod/v4`), `drizzle-zod` | |
| API codegen | Orval (from OpenAPI spec) | |
| Build | esbuild (CJS bundle) | |
| LLM orchestration | Project's own (see `lib/`) | Replit AI proxy removed — see BACKLOG |
| Frontend | React 19 + Vite + Tailwind v4 | `apps/sentinel-ui/` (`@sentinel/ui`) |
| Styling | Tailwind CSS v4 + Framer Motion | Diegetic design system |
| State | Zustand | 5 stores: world, chat, player, ui, persona |
| Routing | Wouter | Client-side, `/create` + `/` |

---

## Structure

```text
project-sentinel/
├── apps/
│   └── sentinel-ui/        # React frontend (@sentinel/ui)
├── artifacts/
│   └── api-server/         # Express API server (DM AI + world update routes)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations/       # LLM and external service clients
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `world_state` | Global world tracking (location, weather, time, tension 0–10) |
| `sessions` | Game sessions (active/inactive) |
| `turns` | Session turn log (player action + DM narrative + world_update JSON) |
| `characters` | NPCs, player, enemies with status/health/location |
| `locations` | Discovered/undiscovered locations with danger rating |
| `factions` | Factions with player relation (−10 to 10) and power |
| `items` | Items with rarity, magical flag, owner/location |

---

## AI Architecture

### DM Persona (`artifacts/api-server/src/lib/dm-ai.ts`)

- LLM client: project's own orchestration (Replit AI proxy replaced — see BACKLOG)
- System prompt embeds: world context, recent turns, known entities
- Every response includes a `<world_update>` JSON block
- `processDmTurn()` — processes a player action, returns narrative + parsed updates
- `generateWorldIntro()` — generates a new world opening with entities

### World Updater (`artifacts/api-server/src/lib/world-updater.ts`)

- `applyWorldUpdate()` — upserts characters/locations/factions/items from AI response
- `getWorldContext()` — builds current world state for the DM prompt

### DM Persona System (frontend)

Two-layer system: **Persona Type** (genre-locked, set at world creation) +
**Mood** (always changeable). See `apps/sentinel-ui/src/stores/personaStore.js`
and `docs/FRONTEND_PLAN.md`.

---

## API Routes

### Core game endpoints (`artifacts/api-server/`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/world` | World state summary |
| `GET` | `/api/session` | Active session with full turn log |
| `POST` | `/api/session/new` | Start a new session (AI generates opening) |
| `POST` | `/api/session` | Submit a player turn (AI DM responds + updates world) |
| `GET` | `/api/characters` | All characters |
| `GET` | `/api/locations` | All locations |
| `GET` | `/api/factions` | All factions |
| `GET` | `/api/items` | All items |
| `GET` | `/api/stream` | SSE DM narrative stream |

### World creation / persona endpoints (stubs in `artifacts/api-server/`)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/v1/dm/personas` | `DmPersona[]` — id, name, compatibleGenres, moods, description |
| `POST` | `/api/v1/dm/persona` | Set persona type (when unlocked) |
| `POST` | `/api/v1/dm/persona/mood` | Set mood (always allowed) |
| `POST` | `/api/v1/world/seed/preview` | Live seed preview during world creation |
| `POST` | `/api/v1/world/create` | Lock seed, create session, navigate to game |
| `GET` | `/api/v1/world/seed` | Locked seed (public fields only) for active session |

---

## Frontend Pages

| Route | Page | Description |
|---|---|---|
| `/create` | `WorldCreation` | Pre-game form: genre, tone, region, persona, mood, modifiers + live seed preview |
| `/` | `AppShell` | 5-panel game console: left world state + center narrative + right panels |

---

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The
root `tsconfig.json` lists all packages as project references.

---

## Development

```bash
# Generate API client code
pnpm --filter @workspace/api-spec run codegen

# Push DB schema
pnpm --filter @workspace/db run push

# Start API server (dev)
just dev-backend

# Start frontend (dev)
just dev-frontend
```

For full cloud stack (PostgreSQL + ChromaDB + MCP servers):

```bash
just env      # generate infrastructure/.env for your OS
just up       # start Docker services
just health   # verify all services
```
