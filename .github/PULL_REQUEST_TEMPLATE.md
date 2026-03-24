# Pull Request

## Contributor Pathway

<!-- Select your track. This determines the review criteria applied to your PR. -->

- [ ] 📜 **Lore-Smith** — Narrative and lore additions (`/data/lore/community/`)
- [ ] 📐 **Schema-Architect** — JSON state model changes (`/schemas/`, `/data/state/`)
- [ ] ⚙️ **Technician** — MCP server or infrastructure changes (`/mcp-servers/`, `/infrastructure/`)

## Summary

<!-- What does this PR do? Be specific. Link the related issue with "Closes #XXX". -->

Closes #

## Changes Made

<!-- List the files changed and what was done to each. -->

- 
- 

## AI-Assisted

<!-- Per the CONTRIBUTING.md AI-First PR Rule: -->

- [ ] This PR contains AI-assisted code/content (add `[AI-Assisted]` to the PR title above)
- [ ] All AI-generated logic has been reviewed and understood by the submitter
- [ ] If AI-assisted, automated tests have been provided

## Testing

<!-- How was this tested locally? -->

- [ ] Docker Compose infrastructure spun up successfully (`docker-compose up -d`)
- [ ] MCP server started and accepted valid payloads
- [ ] Schema validation rejected invalid/malformed payloads
- [ ] For lore entries: ChromaDB indexing verified locally
- [ ] For schema changes: `fs-manager` validated new fields correctly
- [ ] Automated tests pass (`pytest mcp-servers/<name>/tests/`)

## Schema Validation

<!-- For Technicians and Schema-Architects only: -->

- [ ] New/modified JSON Schema uses `additionalProperties: false`
- [ ] File path inputs are protected by regex (no directory traversal possible)
- [ ] Protected fields (`unique_id`, `world_seed`, `namespace`, `created_at`, `canon`) are untouched

## Breaking Changes

- [ ] This PR contains breaking changes
  - If yes, describe the migration path:
