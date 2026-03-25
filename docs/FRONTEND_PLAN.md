# Project Sentinel — Frontend Plan

**Status:** Planning | **Author:** Claude Code | **Date:** 2026-03-25

This document is the authoritative plan for the Project Sentinel frontend. It covers
technology decisions, visual design system, component architecture, data flow, and
phased implementation. Nothing in here should be built without reviewing this document
first — and this document should be updated when decisions change.

---

## 1. Decision Log

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | No SSR needed for a single-player client app; Vite's HMR and build speed win over CRA or Next.js; React 18 concurrent features are useful for streaming text |
| Language | TypeScript | Consistent with existing repo; schema-driven UI especially benefits from typed interfaces |
| Styling | Tailwind CSS v4 | Full design control required for diegetic aesthetic; Chakra/MUI steer you toward their look |
| Component primitives | shadcn/ui | Unstyled Radix UI components styled entirely with Tailwind; no component library lock-in; fully owned code |
| State management | Zustand | Minimal boilerplate; ideal for live world-state updates; no context hell |
| Real-time | SSE (EventSource) | Single-player DM text stream is one-directional; SSE is simpler and sufficient; WebSockets reserved for future multiplayer |
| API | REST + SSE | World state reads/writes via REST; DM narrative stream via SSE |
| Build origin | Clean build | No fork; we own the architecture from day one |
| Backend contract | Agnostic | Frontend talks to a versioned REST/SSE API; Django or Node behind it is irrelevant to the frontend |
| Maps (v1) | Text/ASCII + SVG | Diegetic, genre-appropriate, zero dependencies; full canvas maps are a later phase |

---

## 2. Visual Design System

### 2.1 Emotional Target

The interface is an artifact from within the universe. It should feel like a grimoire,
a ship's log, or a scholar's codex — aged, intentional, and alive. When a new location
is discovered, the panel should feel like a page turning. When the DM types, it should
feel like ink flowing.

### 2.2 Color Palette

```
Background (primary)     --color-void:       #0d0d0f   Deep near-black
Background (panels)      --color-parchment:  #111318   Slightly lifted dark
Background (cards)       --color-codex:      #16191f   Card surfaces
Border                   --color-border:     #2a2d35   Subtle separation
Text (primary)           --color-ink:        #e8e4d9   Warm off-white
Text (secondary)         --color-dust:       #8a8578   Muted warm grey
Accent (gold)            --color-amber:      #c9973a   Discovery, highlights, headers
Accent (green)           --color-leyline:    #4a8c6f   Active/alive states
Accent (red)             --color-blood:      #8c3a3a   Danger, damage, warnings
Accent (blue)            --color-ether:      #3a6a8c   Magic, arcane, system messages
Stream cursor            --color-cursor:     #c9973a   Blinking amber during DM stream
```

### 2.3 Typography

```
Narrative / DM text      Crimson Pro (serif) — the voice of the world
UI labels / panels       Inter (sans-serif) — clear, readable chrome
Code / schema output     JetBrains Mono (mono) — system messages, seeds, IDs
Display / world name     Cinzel (serif, small caps) — world identity in top bar
```

All fonts loaded via Google Fonts or self-hosted. Fallback stacks defined for each.

### 2.4 Motion Principles

- **DM text**: Typewriter character stream — no reveal animation, just the cursor
  advancing. The stream IS the animation.
- **Panel updates**: When world state changes, the affected card fades slightly then
  resolves — a 150ms opacity pulse. Not a slide or bounce. It breathes.
- **Discovery**: When a new entity (NPC, location, faction) appears for the first time,
  its card slides in from the bottom of its list with a 200ms ease-out. Subsequent
  updates are the pulse only.
- **No parallax, no particles, no hero animations.** Every motion serves information.
- Respect `prefers-reduced-motion` — all animations disabled when set.

### 2.5 Texture

A subtle grain overlay (SVG noise filter, CSS-only) sits on the panel backgrounds at
~4% opacity. Enough to evoke aged parchment on close inspection, invisible at a glance.

---

## 3. Layout

### 3.1 Primary Layout (desktop, ≥1280px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚔ SENTINEL    THE SHATTERED EXPANSE              [Oracle DM ▾] [≡] │  ← TopBar
├─────────────────┬───────────────────────────────┬───────────────────┤
│                 │                               │                   │
│  WORLD STATE    │         NARRATIVE             │  [Codex][Inv][⚔] │  ← RightPanel tabs
│                 │                               │                   │
│  ◈ Thornwatch   │  The innkeeper slides a cup   │  CODEX            │
│  ◈ The Breach   │  of something dark across     │                   │
│                 │  the bar. "You look like      │  ▸ Thornwatch     │
│  CHARACTERS     │  someone who's seen the       │  ▸ The Breach     │
│  ◉ Mira Osse    │  Breach," she says, not       │  ▸ The Grey Pact  │
│  ◎ The Keeper   │  looking up. ▌                │                   │
│                 │  ─────────────────────────    │  QUESTS           │
│  FACTIONS       │                               │  ◈ Find the Seal  │
│  ▸ Grey Pact    │  > I ask her what she knows   │  ○ Learn origins  │
│  ▸ The Ashen    │    about the Breach           │                   │
│                 │                               │                   │
│  WORLD          │                               │                   │
│  Day 3 of 365   │                               │                   │
│  Tension: High  │                               │                   │
│                 │                               │                   │
├─────────────────┴───────────────────────────────┴───────────────────┤
│  >  _____________________________________________  [Roll ⚄] [Map ◎] │  ← CommandBar
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Panel Proportions

```
Left panel:    280px fixed (collapsible to 48px icon rail)
Center panel:  flex-1 (takes all remaining space)
Right panel:   320px fixed (collapsible to 48px icon rail)
TopBar:        48px
CommandBar:    64px
```

### 3.3 Responsive Behavior

```
≥1280px   Three-column layout (above)
≥768px    Left panel collapses to icon rail; right panel full
<768px    Single column; panels become bottom sheets / drawer overlays
```

Focus Mode (keyboard shortcut `F`): Both side panels collapse. Pure narrative.
The world still updates in the background — indicators pulse on the icon rails.

---

## 4. Component Architecture

```
src/
├── main.tsx
├── App.tsx                          Root; mounts AppShell, initializes stores
│
├── components/
│   ├── shell/
│   │   ├── AppShell.tsx             Layout skeleton; manages panel collapse state
│   │   ├── TopBar.tsx               World identity + session controls + DM persona
│   │   ├── CommandBar.tsx           Input field + quick action buttons
│   │   └── StatusIndicator.tsx      Connection state (SSE live / reconnecting)
│   │
│   ├── narrative/
│   │   ├── NarrativeScroll.tsx      Scrolling message history; auto-scrolls on new messages
│   │   ├── DMMessage.tsx            Streams DM text; typewriter cursor during stream
│   │   ├── PlayerMessage.tsx        Echo of player input
│   │   └── SystemMessage.tsx        World events, schema changes, session events
│   │
│   ├── world-state/                 Left panel — everything the world knows
│   │   ├── WorldStateDashboard.tsx  Container; subscribes to worldStore
│   │   ├── LocationList.tsx         Known locations with discovery state
│   │   ├── CharacterList.tsx        NPCs encountered; status indicators
│   │   ├── FactionList.tsx          Factions with disposition meters
│   │   └── WorldMetrics.tsx         Time, tension, active effects
│   │
│   ├── panels/                      Right panel tabs
│   │   ├── PanelRouter.tsx          Tab controller
│   │   ├── CodexPanel.tsx           Browsable wiki of discovered entities
│   │   ├── InventoryPanel.tsx       Player items with schema-driven properties
│   │   ├── QuestLogPanel.tsx        Active + completed quests
│   │   └── MapPanel.tsx             ASCII/SVG world map; fog of war
│   │
│   ├── schema/                      Schema-driven rendering engine
│   │   ├── SchemaRenderer.tsx       Generic entity renderer; dispatches to typed views
│   │   ├── EntityCard.tsx           Base card for any schema entity
│   │   ├── PropertyList.tsx         Key/value renderer for schema properties
│   │   └── SchemaRegistry.ts        Maps entity type → component; extensible per genre
│   │
│   └── ui/                          shadcn/ui primitives (owned, Tailwind-styled)
│       ├── Button.tsx
│       ├── ScrollArea.tsx
│       ├── Tabs.tsx
│       ├── Tooltip.tsx
│       ├── Sheet.tsx                Mobile panel drawer
│       └── Badge.tsx
│
├── stores/
│   ├── worldStore.ts                Zustand: locations, NPCs, factions, time, metrics
│   ├── chatStore.ts                 Zustand: messages[], isStreaming, streamBuffer
│   ├── playerStore.ts               Zustand: character, inventory, quests
│   └── uiStore.ts                   Zustand: panel collapse, active tab, focus mode
│
├── hooks/
│   ├── useDMStream.ts               Opens/manages SSE connection; writes to chatStore
│   ├── useWorldSync.ts              Polls or subscribes to world state REST endpoint
│   └── useCommandHistory.ts        Up/down arrow command history in input
│
├── api/
│   ├── client.ts                    Base fetch wrapper; auth headers, error handling
│   ├── world.ts                     GET /world, GET /world/state, GET /entities/:id
│   ├── session.ts                   POST /session/action, POST /session/save
│   └── stream.ts                    EventSource factory for /stream/narrative
│
├── schema/
│   ├── types.ts                     TypeScript interfaces mirroring MCP server schemas
│   └── registry.ts                  SchemaRegistry singleton; genre overrides
│
└── styles/
    ├── globals.css                  Tailwind base + CSS custom properties (palette above)
    └── fonts.css                    Font-face declarations
```

---

## 5. Data Flow

### 5.1 Player Action Flow

```
Player types → CommandBar
  → POST /session/action { input: "...", session_id }
  → Backend processes via LLM orchestration + MCP servers
  → SSE stream /stream/narrative opens
  → useDMStream appends characters to chatStore.streamBuffer
  → DMMessage renders stream with typewriter cursor
  → Stream ends → message committed to chatStore.messages[]
  → POST response includes world_state_delta
  → worldStore patched with delta
  → Affected panels pulse-animate
```

### 5.2 World State Sync

World state does not poll. It updates on action response deltas.
On session load, a single GET /world/state hydrates all stores.
If a desync is detected (session resume, reconnect), a full hydration fires again.

### 5.3 SSE Connection Lifecycle

```
Session start → useDMStream opens EventSource
  event: "narrative.chunk" → append to streamBuffer
  event: "narrative.end"   → commit message, clear buffer
  event: "world.delta"     → patch worldStore
  event: "system"          → SystemMessage in chat
  connection lost           → auto-reconnect with exponential backoff (1s, 2s, 4s, max 30s)
  reconnected              → StatusIndicator updates; no message lost (sequence IDs)
```

---

## 6. Schema-Driven Rendering

This is the mechanism that makes the UI adapt to any genre without code changes.

Each entity in the world state has a `type` field matching a schema registered in the
MCP server (e.g., `location`, `npc`, `faction`, `item`, `quest`). The frontend
`SchemaRegistry` maps these types to render components.

```typescript
// schema/registry.ts
const defaultRegistry: SchemaRegistry = {
  location:  LocationCard,
  npc:       CharacterCard,
  faction:   FactionCard,
  item:      ItemCard,
  quest:     QuestCard,
};

// For a sci-fi world, genre overrides swap in themed variants:
const scifiOverrides: Partial<SchemaRegistry> = {
  location:  StarSystemCard,
  faction:   CorporationCard,
};
```

`SchemaRenderer` receives any entity object, looks up its type in the registry,
and renders the appropriate component. Unknown types fall back to the generic
`EntityCard` which renders `PropertyList` — all properties displayed as key/value.
Nothing breaks when a new entity type is introduced in the schema.

The `PropertyList` component handles nested objects, arrays, and enum values
with appropriate formatting — arrays become comma lists or badges, enums become
color-coded badges, nested objects are collapsible.

---

## 7. The Map Panel

V1 maps are text-based and diegetic. A world region is represented as a grid of
ASCII symbols styled with CSS character classes:

```
  ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙
  ∙ ∙ ▲ ▲ ∙ ∙ ∙ ∙ ∙ ∙    ▲ = mountains
  ∙ ∙ ▲ ∙ ∙ ◈ ∙ ∙ ∙ ∙    ◈ = player location
  ∙ ∙ ∙ ∙ ≈ ≈ ∙ ∙ ∙ ∙    ≈ = water
  ∙ ✦ ∙ ∙ ≈ ∙ ∙ ∙ ∙ ∙    ✦ = discovered location
  ∙ ∙ ∙ ∙ ∙ ∙ ? ∙ ∙ ∙    ? = heard of but not visited
  ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙ ∙    ∙ = unexplored / fog
```

Cells the player hasn't discovered are fog (∙). The map data lives in the world state
store and is a schema field on the world object. Hovering a symbol shows a tooltip
with the location name and status.

Full SVG/canvas map rendering is a later phase (post-1.0).

---

## 8. API Contract

The frontend is backend-agnostic. It expects these endpoints. Whether they are served
by Django or a Node service is irrelevant to the frontend codebase.

```
GET    /api/v1/world/state              → Full world state hydration on session load
GET    /api/v1/entities/:type           → Paginated entity list for a given type
GET    /api/v1/entities/:type/:id       → Single entity detail

POST   /api/v1/session/action           → Player input; returns world_state_delta
POST   /api/v1/session/save             → Persist current state
POST   /api/v1/session/load             → Load a saved state
GET    /api/v1/session/history          → Message history for current session

GET    /api/v1/stream/narrative         → SSE endpoint; streams DM response + world events

GET    /api/v1/schema/registry          → Returns available entity types and their schemas
                                          (used to hydrate SchemaRegistry at boot)

GET    /api/v1/dm/personas              → Available DM voice/style options
POST   /api/v1/dm/persona               → Set active DM persona for session
```

All responses use a consistent envelope:
```json
{ "ok": true, "data": { ... } }
{ "ok": false, "error": { "code": "...", "message": "..." } }
```

---

## 9. Implementation Phases

### Phase 1 — Shell & Design System
- Vite + React 18 + TypeScript project scaffold
- Tailwind v4 configured with full palette and typography
- shadcn/ui primitives installed (ScrollArea, Tabs, Tooltip, Sheet, Badge, Button)
- AppShell with three-column layout
- TopBar, CommandBar (static — no API yet)
- Panel collapse/expand with keyboard shortcut `F` for focus mode
- Storybook or local fixture page for component development

### Phase 2 — Chat & DM Stream
- chatStore (Zustand)
- NarrativeScroll, DMMessage (typewriter cursor), PlayerMessage, SystemMessage
- useDMStream hook against real or mock SSE endpoint
- CommandBar wired: input → chatStore → NarrativeScroll
- Auto-scroll with user-override (scroll up to pause, new message resumes)

### Phase 3 — World State Left Panel
- worldStore + playerStore (Zustand)
- useWorldSync hook
- WorldStateDashboard with LocationList, CharacterList, FactionList, WorldMetrics
- Discovery animation (slide-in for new entities, pulse for updates)
- Panel collapse to icon rail

### Phase 4 — Schema-Driven Right Panel
- SchemaRegistry + SchemaRenderer
- CodexPanel (browsable entity wiki)
- InventoryPanel
- QuestLogPanel
- API /schema/registry endpoint hydrates registry at boot
- Unknown types gracefully fall back to EntityCard + PropertyList

### Phase 5 — Map Panel
- MapPanel V1: text/ASCII map from world state
- Fog-of-war rendering (discovered vs. unknown cells)
- Location tooltips
- Player position indicator

### Phase 6 — Polish & Diegetic Depth
- Grain texture overlay
- Font loading + FOUT prevention
- `prefers-reduced-motion` media query pass
- StatusIndicator (SSE connection health)
- Responsive layout (tablet/mobile drawer panels)
- DM persona selector wired to API
- World seed display + share modal

---

## 10. What We Are Explicitly Not Building Yet

- Multiplayer or session sharing (read-only seed/state export is a later feature)
- Full SVG/canvas maps
- Audio or ambient sound
- Authentication / user accounts
- Leaderboards, achievements, social features
- A mobile-native app

These are not decisions against those features. They are decisions to not distract
from the core: a text-first, immersive, schema-driven single-player experience.

---

## 11. Open Questions (to resolve before Phase 1 kickoff)

- [ ] Where does the frontend live in the repo? Proposed: `apps/sentinel-ui/` under a pnpm workspace
- [ ] Does the Django backend exist yet, or do we need a Node/Express stub for frontend development?
- [ ] What is the world seed format? Needs to be defined before the share modal and TopBar world identity can be finalized
- [ ] DM persona: is this a prompt prefix, a model selector, or both?
