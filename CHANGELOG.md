# Changelog

All notable changes to Project Sentinel are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/). Project Sentinel uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Schema changes deserve special attention.** Any modification to files in `schemas/` that removes or renames a required field is a **breaking change** and warrants a major version bump. Community pack authors (`community.json` maintainers) must be notified before breaking schema changes ship.

---

## [Unreleased]

### Added
- `docs/QUICKSTART.md` — Zero to Hero in 5 minutes guide for new contributors
- `ROADMAP.md` — v0.1 → v1.0 feature roadmap with open contributor bounties
- `SECURITY.md` — vulnerability reporting policy and MCP server attack surface documentation
- `CODE_OF_CONDUCT.md` — Contributor Covenant 2.1
- `CHANGELOG.md` — this file
- `.github/CODEOWNERS` — automatic PR review routing by contributor pathway
- `ARCHITECTURE.md` — Mermaid diagrams: Architecture Node Graph, Full Update Pipeline, Sentinel Airlock
- `README.md` — Shields.io badges (License, Python, Node, PRs Welcome, MCP Powered)
- `README.md` — Rewritten opening paragraph and Mermaid Core Loop diagram
- `docs/` directory for extended documentation

---

## [0.1.0] — 2026-03-24

Initial working prototype. The schema gate holds. The loop runs.

### Added
- Three-node distributed architecture: Inference Node, MCP Bridge, Infrastructure Node
- `schemas/apply_world_update.schema.json` — JSON Schema Draft 2020-12 contract governing all AI-to-filesystem writes
- `schemas/community_manifest.schema.json` — Community content pack gateway schema
- `mcp-servers/fs-manager/` — Zero-touch filesystem MCP server with path validation, protected field enforcement, and schema-gated CRUD
- `mcp-servers/db-vector/` — PostgreSQL + ChromaDB query routing MCP server
- `mcp-servers/git-sync/` — Atomic Git commit MCP server for version snapshotting after each world update
- `infrastructure/docker-compose.yml` — PostgreSQL 16 + ChromaDB stack with Tailscale IP binding support
- `infrastructure/.env.example` — Environment variable template with security annotations
- `infrastructure/migrations/` — SQL migration scripts for initial world state schema
- `data/` — Hybrid storage layer: `lore/` (Markdown) + `state/` (JSON) with Core/Community namespace separation
- `ARCHITECTURE.md` — Core vs. Community framework, namespace rules, protected fields, node roles, and update pipeline
- `CONTRIBUTING.md` — Three contributor pathways: Lore-Smith, Schema-Architect, Technician
- `.github/ISSUE_TEMPLATE/lore_entry.md` — Lore-Smith issue template
- `.github/ISSUE_TEMPLATE/schema_refinement.md` — Schema-Architect issue template
- `.github/ISSUE_TEMPLATE/mcp_tool.md` — Technician issue template
- `.github/PULL_REQUEST_TEMPLATE.md` — PR template with AI-assisted disclosure requirements
- `artifacts/rpg-engine/` — React + Vite reference frontend (game console UI)
- `artifacts/api-server/` — Express 5 reference backend with DM persona and world updater
- `lib/` — Shared TypeScript libraries (api-client, api-spec, api-zod, db, integrations-openai)

### Architecture decisions
- The Inference Node is granted **zero** direct filesystem access. All writes are mediated by MCP servers.
- `session_id` must be UUID format — enforced at schema level, not application level.
- Community content is namespace-separated at both the filesystem and ChromaDB metadata level.
- Core state fields (`unique_id`, `world_seed`, `namespace`, `created_at`, `canon`) are immutable by any community payload.

---

[Unreleased]: https://github.com/russalo/present/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/russalo/present/releases/tag/v0.1.0
