# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

This is an **AI-powered RPG World Engine** — a fully automated, persistent RPG interface where an AI Dungeon Master narrates the world and automatically updates world state (characters, locations, factions, items) after each player turn.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5-mini)
- **Frontend**: React + Vite + Tailwind + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (DM AI + world update routes)
│   └── rpg-engine/         # React frontend (game console UI)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── integrations-openai-ai-server/  # OpenAI client via Replit AI
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Database Schema

- `world_state` — global world tracking (location, weather, time, tension 0-10)
- `sessions` — game sessions (active/inactive)
- `turns` — session turn log (player action + DM narrative + world_update JSON)
- `characters` — NPCs, player, enemies with status/health/location
- `locations` — discovered/undiscovered locations with danger rating
- `factions` — factions with player relation (-10 to 10) and power
- `items` — items with rarity, magical flag, owner/location

## AI Architecture

### DM Persona (`artifacts/api-server/src/lib/dm-ai.ts`)
- Uses `gpt-5-mini` via Replit AI Integrations proxy
- System prompt embeds: world context, recent turns, known entities
- Every response includes a `<world_update>` JSON block
- `processDmTurn()` — processes a player action, returns narrative + parsed updates
- `generateWorldIntro()` — generates a new world opening with entities

### World Updater (`artifacts/api-server/src/lib/world-updater.ts`)
- `applyWorldUpdate()` — upserts characters/locations/factions/items from AI response
- `getWorldContext()` — builds current world state for the DM prompt

## API Routes

- `GET /api/world` — world state summary
- `GET /api/session` — active session with full turn log
- `POST /api/session/new` — start a new session (AI generates opening)
- `POST /api/session` — submit a player turn (AI DM responds + updates world)
- `GET /api/characters` — all characters
- `GET /api/locations` — all locations
- `GET /api/factions` — all factions
- `GET /api/items` — all items

## Frontend Pages

- `/` — Game Console: left sidebar (world state + tabbed entity lists) + right narrative panel + input
- Start Screen shown when no active session

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Development

- Run codegen: `pnpm --filter @workspace/api-spec run codegen`
- Push DB schema: `pnpm --filter @workspace/db run push`
- Start API server: workflow `artifacts/api-server: API Server`
- Start frontend: workflow `artifacts/rpg-engine: web`
