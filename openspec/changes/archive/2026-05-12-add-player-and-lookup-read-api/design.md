## Context

The project now has a working warehouse refresh and recruitment mart, so the next backend value is to expose a clean read API on top of that data. Phase 5 is intentionally narrower than later ranking and explanation work: it should expose basic lookup and player endpoints without pulling in full shortlist logic, score explanation, or recommendation behavior.

The current foundation already provides `api/v1`, centralized error handling, Zod availability, Swagger wiring, and a live mart. This change should build on that foundation with a lightweight module shape that matches the project's learning goals instead of introducing enterprise-style layering too early.

## Goals / Non-Goals

**Goals:**
- Add `GET /api/v1/clubs` and `GET /api/v1/lookups/positions` as simple lookup endpoints.
- Add `GET /api/v1/players` and `GET /api/v1/players/:id` as stable read endpoints.
- Use Zod for query/path validation.
- Read player-facing API data primarily from `mart.player_ranking`, enriching it with player identity and latest club context from warehouse tables.
- Document the new endpoints in Swagger/OpenAPI.
- Keep the implementation lightweight and feature-based.

**Non-Goals:**
- Add ranking/shortlist-specific endpoints in this change.
- Add score explanation or recommendation endpoints in this change.
- Introduce controller/service layers unless implementation pressure proves they are necessary.
- Redesign the mart or scoring model.

## Decisions

### 1. Use a lightweight feature-based module structure
- **Decision:** Use per-feature files such as `players.routes.js`, `players.repository.js`, and `players.schemas.js`, plus similarly light files for lookups.
- **Why:** This keeps responsibilities visible without adding thin controller/service layers that do not yet carry meaningful logic.
- **Alternative considered:** Full controller/service/repository decomposition from the start.
- **Why not:** Too much structure for a read-focused personal project phase.

### 2. Use the recruitment mart as the main read source for player endpoints
- **Decision:** Base player list and detail reads on `mart.player_ranking` instead of raw fact tables.
- **Why:** The mart already expresses the rankable DSS-ready player set and contains the core metrics the API should expose.
- **Alternative considered:** Query raw warehouse facts directly for player endpoints.
- **Why not:** It would bypass the analytical model just built for this purpose and make later ranking API behavior less consistent.

### 3. Enrich player reads with latest club context from valuations
- **Decision:** Derive club context through a latest-club join using `warehouse.fact_player_valuations` and `warehouse.dim_clubs`.
- **Why:** Club is not stored directly in the mart, but the client-facing player endpoints still need club identity in a current/latest sense.
- **Alternative considered:** Omit club from Phase 5 player responses.
- **Why not:** That would make player reads less useful for the recruiting workflow.

### 4. Keep lookup endpoints simple and frontend-friendly
- **Decision:** Expose clubs from `warehouse.dim_clubs` and positions from a distinct query over the current rankable player set.
- **Why:** Clubs are a warehouse lookup, while positions are most useful when they reflect the current mart-backed player pool.
- **Alternative considered:** Use only warehouse dimensions for all lookups.
- **Why not:** Position values from the raw dimension table can drift from the current rankable read set.

### 5. Validate request input at the route boundary with Zod
- **Decision:** Validate list filters and player id params with Zod before repository queries run.
- **Why:** This keeps invalid inputs from leaking into query construction and keeps route behavior consistent with the existing foundation.
- **Alternative considered:** Manual checks inline in route handlers.
- **Why not:** Repeats old ad hoc patterns the project is moving away from.

## Risks / Trade-offs

- **Risk:** Player list query construction may become messy as filters grow.**  
  **Mitigation:** Keep SQL-building logic in the repository and whitelist supported sort fields.

- **Risk:** Club derivation logic could be misunderstood or duplicated later.**  
  **Mitigation:** Centralize the latest-club join pattern in repository SQL and keep it explicit.

- **Risk:** Even lightweight module separation can still drift into unnecessary abstraction.**  
  **Mitigation:** Start with route + schema + repository only, and add more layers only if real orchestration pressure appears.

## Migration Plan

1. Add lightweight lookup and player modules.
2. Register the new routes under the existing `api/v1` router.
3. Add Zod schemas for query/path validation.
4. Add repository SQL queries for clubs, positions, player list, and player detail.
5. Add Swagger documentation for the new endpoints.
6. Verify stable JSON responses and 400 behavior for invalid inputs.

Rollback is straightforward: remove the new modules and route registration. No schema change is required for this phase.

## Open Questions

- Exact response shape details (for example whether player detail returns `{ item: ... }` or a direct object) can remain implementation-level decisions as long as they stay stable and consistent.
- Pagination metadata for the player list should likely be included, but the final exact shape can be settled during implementation.
