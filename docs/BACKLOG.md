# Project Sentinel — Backlog

Items that need to be addressed but were not part of current planning or implementation.
Agents: append discovered items under the appropriate section using the format below.
Completed items should be removed by the end-session workflow, not left to accumulate.

---

## Format

```
- [ ] Short description of the item
      _Discovered: YYYY-MM-DD | Context: brief note on where/why this surfaced_
```

---

## High Priority — Do Soon

- [ ] Fix esbuild platform overrides in `pnpm-workspace.yaml` that strip all non-linux-x64 binaries
      _Discovered: 2026-03-25 | Context: inherited from Replit's linux-only server assumption; breaks builds on macOS and Windows_

- [ ] Remove `lib/integrations/integrations-openai-ai-server` and replace with project's own LLM orchestration
      _Discovered: 2026-03-25 | Context: core DM AI (every player turn, every world update) currently routes through Replit's AI Integrations proxy (gpt-5-mini); proxy disappears with Replit; project already has its own LLM orchestration design — this just needs to be properly wired in_

---

## Replit Dependency Audit & Removal

This block requires a planning session before any code is touched. Do not act on these items
without an approved plan.

- [ ] Remove `.replit`, `.replitignore`, and `replit.md` — Replit infrastructure files with no project value
      _Discovered: 2026-03-25 | Context: Replit app builder artifacts; safe to delete_

- [ ] Remove `@replit/vite-plugin-cartographer` and `@replit/vite-plugin-dev-banner` from both vite configs and package.json
      _Discovered: 2026-03-25 | Context: dead code outside Replit (gated on REPL_ID env var that is never set); safe to remove_

- [ ] Decide on replacement for `@replit/vite-plugin-runtime-error-modal`
      _Discovered: 2026-03-25 | Context: used unconditionally in both vite configs; provides browser error overlay DX; candidate replacement is vite-plugin-checker_

- [ ] Remove `@replit/*` entries from `pnpm-workspace.yaml` catalog, minimumReleaseAgeExclude, and overrides
      _Discovered: 2026-03-25 | Context: tied to Replit package trust model; safe once plugins are removed_

- [ ] Audit `stripe-replit-sync` package — determine if Stripe integration is Replit-platform-specific and plan replacement or removal
      _Discovered: 2026-03-25 | Context: package appears in minimumReleaseAgeExclude; suggests Stripe payment logic may be tied to Replit's payment integration; needs investigation_

- [ ] Evaluate `artifacts/mockup-sandbox` — Replit scaffolding or intentional artifact?
      _Discovered: 2026-03-25 | Context: has same Replit vite plugins as rpg-engine but is never referenced anywhere in the project; likely safe to delete but needs confirmation_

- [ ] Audit and update README.md, CONTRIBUTING.md, QUICKSTART.md to remove remaining Replit references
      _Discovered: 2026-03-25 | Context: README credits Replit as a core tool; no longer accurate_

---

## Architecture & Structure

- [ ] Decide where sentinel-ui lives in the repo — proposed `apps/sentinel-ui/` under pnpm workspace
      _Discovered: 2026-03-25 | Context: frontend plan written (docs/FRONTEND_PLAN.md); repo placement is the remaining open question before Phase 1 scaffold_

- [ ] Decide whether Django backend exists or if a Node/Express stub is needed for frontend dev
      _Discovered: 2026-03-25 | Context: frontend API contract is defined; backend language is undecided; stub needed to unblock Phase 2_

- [ ] Define world seed format
      _Discovered: 2026-03-25 | Context: needed before share modal and TopBar world identity can be built; seed is the shareable unit of a campaign_

- [ ] Clarify DM persona: prompt prefix, model selector, or both
      _Discovered: 2026-03-25 | Context: persona selector is in the TopBar design; implementation depends on how the LLM orchestration layer exposes it_

- [ ] Restructure artifact directory layout away from Replit conventions
      _Discovered: 2026-03-25 | Context: `artifacts/`, `lib/` hierarchy and `@workspace/` filter names follow Replit monorepo patterns; should reflect project's own organization once frontend scaffold placement is decided_

---

## Developer Experience

- [ ] Add `just start-session` and `just end-session` recipes
      _Discovered: 2026-03-25 | Context: requested — git sync, backlog echo at session start; commit/push and backlog update at session end_

- [ ] Add `scripts/backlog.sh` to support add/remove/list operations on this file
      _Discovered: 2026-03-25 | Context: needed to back the session lifecycle just recipes_

- [ ] Add targeted tests: just recipe smoke tests, backlog script manipulation tests, script executability checks
      _Discovered: 2026-03-25 | Context: assessed as valuable at current stage; not yet implemented_

- [ ] Add machine-readable requirements manifest (Brewfile or .tool-versions) for `just`, `chezmoi`, and other non-npm tools
      _Discovered: 2026-03-25 | Context: docs list prerequisites but no single install command exists for a new contributor_

- [ ] Update `replit.md` content into a proper `docs/WORKSPACE.md` contributor context document
      _Discovered: 2026-03-25 | Context: the AI workspace context file has useful project structure info that should live in docs, not a Replit-named file_
