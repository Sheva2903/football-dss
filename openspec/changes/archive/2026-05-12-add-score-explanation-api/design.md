## Context

The backend now exposes player detail, rankings, and shortlist reads over `mart.player_ranking`, but it does not yet expose a dedicated explainability surface for one player. The Phase 7 endpoint should stay narrow: it should explain one player's existing DSS score using current mart columns and the shared evidence-window constants, without redesigning the score formula or introducing recommendation logic.

The project has already settled on a lightweight module style. Because this endpoint is nested under `/players/:id`, the simplest implementation is to extend the existing players module with one additional route, schema handling, and repository query rather than introducing a separate top-level module for a single nested player read.

## Goals / Non-Goals

**Goals:**
- Add `GET /api/v1/players/:id/score-explanation`.
- Return player identity, latest club context, market value, final DSS score, and key component scores.
- Support `evidenceWindow` and `reliabilityLevel` as validated query inputs with defaults so the explanation can surface active-window evidence and reliability context consistently with the rest of the API.
- Return explanation-friendly structured fields so clients can understand the score without reverse-engineering mart columns.
- Reuse existing constants and route/repository patterns where possible.

**Non-Goals:**
- Change the mart scoring formula or rebuild mart tables.
- Add recommendation or similar-player behavior.
- Generate free-form narrative text that depends on heavy templating or AI logic.
- Introduce controller/service layers unless implementation pressure appears.

## Decisions

### 1. Extend the players module instead of creating a separate score-explanation module
- **Decision:** Add the endpoint to `src/modules/players/`.
- **Why:** The endpoint is a nested player-specific read, and the project currently favors lightweight route + schema + repository modules.
- **Alternative considered:** Create a dedicated explainability module.
- **Why not:** It adds extra structure for one endpoint without improving the current API shape.

### 2. Treat evidence window and reliability level as explanation context, not a player-selection filter
- **Decision:** Validate `evidenceWindow` and `reliabilityLevel` query parameters and use them to choose which recent evidence columns and reliability threshold to display.
- **Why:** The player is already selected by id. These parameters should control how the explanation is framed, not whether the player exists.
- **Alternative considered:** Ignore reliability level or support evidence window only.
- **Why not:** It would make the explanation API inconsistent with the ranking surfaces and would hide useful threshold context.

### 3. Reuse the existing latest-club and mart-read patterns
- **Decision:** Use the same latest-club enrichment pattern already used by player detail and rankings.
- **Why:** It keeps identity and club context consistent across read endpoints.
- **Alternative considered:** Return explanation data without club context.
- **Why not:** That would make the explanation response less useful for recruiting use cases.

### 4. Return structured explanation blocks instead of only raw columns
- **Decision:** Return grouped fields such as `player`, `score`, `components`, `evidence`, `reliability`, and `formula`.
- **Why:** The endpoint should be explainable from the API response alone, and grouped data is easier for clients to consume than a flat list of mart columns.
- **Alternative considered:** Reuse the flat `/players/:id` response shape and append extra fields.
- **Why not:** That would blur the difference between player detail and score explanation.

## Risks / Trade-offs

- **Risk:** The explanation endpoint could drift into duplicating the player detail endpoint.**  
  **Mitigation:** Keep the response centered on score breakdown, active evidence context, and formula fields rather than general catalog detail.

- **Risk:** Query-driven evidence-window column selection can make the repository query harder to read.**  
  **Mitigation:** Keep the dynamic column resolution small and whitelist-driven via the shared constants.

- **Risk:** Explanation wording may become brittle if it tries to do too much narrative generation.**  
  **Mitigation:** Return stable structured explanation fields first and keep text snippets minimal and deterministic.

## Migration Plan

1. Extend the players route with a score explanation endpoint.
2. Add validation schemas for player id plus explanation query defaults.
3. Add a repository query over `mart.player_ranking` with active-window evidence selection and reliability-threshold context.
4. Document the endpoint in Swagger and verify 200/400/404 behavior.

Rollback is straightforward: remove the added route, schema, and repository function. No schema migration is required.

## Open Questions

- Whether to include short deterministic explanation sentences in v1 or keep the response fully structured can be finalized during implementation.
- Whether the response should expose the full final-score formula numerically or as labeled weights only can be finalized during implementation as long as the score components remain clear.
