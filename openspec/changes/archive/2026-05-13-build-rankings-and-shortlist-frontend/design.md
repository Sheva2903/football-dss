## Context

The backend MVP already exposes the recruiter discovery APIs for rankings, shortlists, clubs, positions, and player detail routes, but the frontend is still the default Vite starter. The current frontend work needs to establish the first real product surface while staying aligned with two decisions already locked in planning: the app is an internal scouting tool, and the MVP frontend flow is split into two pages, with this change covering the discovery page at `/` and the shell/routing needed to move into `/players/:id` later.

This change crosses multiple frontend concerns at once: routing, shared API access, discovery-page state, shortlist presentation, and visual system translation from `frontend/DESIGN.md`. It also introduces a new dependency for routing. That makes a design document useful before implementation.

## Goals / Non-Goals

**Goals:**
- Replace the Vite starter with a recruiter-facing frontend shell.
- Add real frontend routes for `/` and `/players/:id`.
- Implement the discovery page at `/` using the existing rankings, shortlist, and lookup APIs.
- Keep shortlist as a dedicated discovery section instead of collapsing it into the rankings list.
- Establish a small shared API layer and page-level state shape that later player-analysis work can reuse.
- Translate `frontend/DESIGN.md` into a data-dense internal tool rather than a marketing page.

**Non-Goals:**
- Implement the full player analysis page contents.
- Introduce frontend auth, persistence, or saved shortlists.
- Add a heavy client-state library, component framework, or charting system.
- Change backend contracts or add frontend-owned business logic.

## Decisions

### 1. Use React Router with two explicit app routes
- **Decision:** Add React Router and define `/` for discovery and `/players/:id` as the player-analysis route target.
- **Why:** The user explicitly locked in a two-page flow. Using real routes gives direct navigation, clean separation of concerns, and a stable base for the second frontend change.
- **Alternative considered:** Keep a single-page app with local page state. Rejected because it blurs discovery and analysis concerns and conflicts with the chosen route structure.

### 2. Keep data access in a minimal native fetch helper
- **Decision:** Use a small shared API utility built on native `fetch`.
- **Why:** Current frontend needs are read-heavy and mostly GET requests. A thin wrapper is enough for query building, JSON parsing, and error normalization without adding Axios.
- **Alternative considered:** Axios. Rejected because it adds dependency weight without solving a current problem.

### 3. Use page-level React state instead of a global store
- **Decision:** Keep lookup, filter, rankings, shortlist, and selected-player state in page-level React hooks.
- **Why:** The discovery flow is bounded and understandable without Redux, Zustand, or context-heavy abstractions. This keeps the code visible and easy to refactor once the player-analysis page exists.
- **Alternative considered:** Introduce a client-state library now. Rejected as premature for the current scope.

### 4. Treat shortlist as a dedicated section with its own fetch
- **Decision:** Render shortlist in a separate section on the discovery page and fetch it from `/api/v1/shortlists`.
- **Why:** The backend already models shortlist as a dedicated endpoint. Preserving that distinction in the UI gives recruiters a clearer “action layer” on top of broad rankings.
- **Alternative considered:** Derive shortlist visually from rankings only. Rejected because it hides backend intent and weakens the page structure.

### 5. Keep filters explicit and shared across rankings and shortlist
- **Decision:** Use draft filter state for form editing and active filter state for applied queries. Rankings and shortlist both use the active scouting lens, with shortlist still retaining its endpoint-specific defaults.
- **Why:** Explicit apply behavior is calmer for a recruiter workbench and avoids refetching on every keystroke. Sharing the scouting lens keeps both discovery sections coherent.
- **Alternative considered:** Instant refetch on input change. Rejected because it would create noisier interactions and extra requests.

### 6. Translate the design system into a dense tool layout
- **Decision:** Reuse the typography, ink/light surface system, mono metadata labels, subtle borders, and restrained atmospheric gradient from `frontend/DESIGN.md`, but apply them to a workbench layout instead of a landing page.
- **Why:** The visual system is strong, but the product is operational. The UI should feel deliberate and branded without pretending to be marketing.
- **Alternative considered:** Use generic dashboard styling or a UI kit. Rejected because it would ignore the provided design direction.

### 7. Navigate into player analysis from rankings and shortlist cards
- **Decision:** Discovery results should link to `/players/:id` instead of embedding deep analysis on the same page.
- **Why:** This preserves the broad-to-deep workflow already agreed during planning and avoids half-implementing the second page in the first change.
- **Alternative considered:** Inline right-side analysis panel on page one. Rejected because it reintroduces the one-page workbench shape we intentionally moved away from.

## Risks / Trade-offs

- **[Risk]** The design language in `frontend/DESIGN.md` is strong and marketing-derived, which could overwhelm a dense data UI. → **Mitigation:** keep gradients and dramatic styling mostly in shell/header moments while using restrained cards and typographic hierarchy for the working surface.
- **[Risk]** Sharing the same filters across rankings and shortlist could create confusion if shortlist defaults differ from rankings defaults. → **Mitigation:** keep shortlist endpoint behavior intact and make shortlist visually separate so users understand it is a curated companion section.
- **[Risk]** Adding routing now introduces unfinished `/players/:id` behavior before the second frontend change lands. → **Mitigation:** include a minimal analysis-route placeholder or shell that can safely receive navigation until the full page is implemented.
- **[Risk]** Page-level state may need refactoring when the second page becomes richer. → **Mitigation:** keep API and query helpers separate from page components so extraction later is straightforward.

## Migration Plan

1. Add router dependency and wire the root app to route-based rendering.
2. Replace the Vite starter UI with the shared app shell and discovery page.
3. Add shared API helper functions for health, lookups, rankings, and shortlists.
4. Implement the discovery page filters, rankings list, shortlist section, and navigation links.
5. Add a minimal `/players/:id` route target so routing is valid before the second change.
6. Verify frontend build and lint before implementation is considered complete.

Rollback is simple: revert the frontend change set because no backend contract or data migration is introduced.

## Open Questions

- None for this change. The main product-shape decisions for the discovery slice have already been locked in planning.
