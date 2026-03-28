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

- [ ] `just install` does not install Django backend dependencies — a fresh clone that runs `just install` then `just dev-django` will fail with missing packages; `just install-django` must be run manually and is easy to miss
      _Discovered: 2026-03-28 | Context: install recipe only covers pnpm + MCP server pip installs; Django pip install is a separate manual step not chained in_

- [ ] `world-engine/orchestrator/main.py` is referenced in README Getting Started and may not exist on disk — verify the file exists and the Inference Node can actually be launched as documented
      _Discovered: 2026-03-28 | Context: README instructs `python orchestrator/main.py` but world-engine/ was scaffolded as a skeleton; no confirmation the entry point was created_

---

## Architecture & Structure

- [ ] `scripts/check-structure.sh` only verifies that `backend/` exists at the top level — does not check for `backend/sentinel/`, `backend/api/`, `backend/manage.py`, or `backend/requirements.txt`; structure drift inside the backend directory will go undetected
      _Discovered: 2026-03-28 | Context: check-structure.sh was written before Django backend existed; now that backend/ has meaningful internal structure it should be included in the manifest check_

- [ ] **Auth strategy decision (future):** three clear paths — (1) simple API key middleware for single-player public deployment, (2) DRF TokenAuthentication + Django User model for multi-user, (3) outsourced JWT (Auth0/Clerk/Supabase) if password management is unwanted. SSE streaming endpoint has no conflict with any of these — auth middleware runs before the stream opens. Decision not needed for 1.0.
      _Discovered: 2026-03-27 | Context: discussed during Django backend planning; single-player for 1.0 means no auth required now_

- [ ] **DRF adoption decision (future):** not needed for 1.0. Worthwhile if: (a) multi-user auth is added, (b) entity CRUD grows beyond list/read, (c) `_serialize_*` helpers in views.py become a maintenance burden. SSE endpoint will always be raw Django regardless of DRF adoption.
      _Discovered: 2026-03-27 | Context: discussed during Django backend planning_

---

## Developer Experience

- [ ] Django backend startup fails silently when `infrastructure/.env` is missing — no clear error message or fallback documentation; a new contributor running `just dev-django` without running `just env` first gets a cryptic database connection error
      _Discovered: 2026-03-28 | Context: settings.py loads .env via python-dotenv with no validation; should either check env vars at startup or document the required pre-step more prominently_

- [ ] Add unit and integration tests for `apps/sentinel-ui/` — Zustand stores, API client, and key components
      _Discovered: 2026-03-26 | Context: flagged in PR #5 review; no tests exist for any of the 8 frontend phases; recommend vitest + @testing-library/react_

- [ ] Add machine-readable requirements manifest (Brewfile or .tool-versions) for `just`, `chezmoi`, and other non-npm tools
      _Discovered: 2026-03-25 | Context: docs list prerequisites but no single install command exists for a new contributor_
