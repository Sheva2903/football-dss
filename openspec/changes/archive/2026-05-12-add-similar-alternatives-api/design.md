## Context

The backend now exposes player detail, rankings, shortlist, and score explanation reads over `mart.player_ranking`, but it still does not expose the old DSS recommender outcome: cheaper similar alternatives for a target player. The reference Python recommender builds a candidate pool from mart data, applies an evidence window, computes feature similarity, filters candidates by business constraints, and ranks them with a combined alternative score.

This phase is narrower than a generic recommendation platform. It should reproduce the old DSS ideas closely first, keep the logic explainable, and stay inside the current Express backend. Unlike the previous read-heavy phases, this endpoint needs more than a direct SQL query because the similarity computation belongs in Node rather than buried in SQL.

## Goals / Non-Goals

**Goals:**
- Add `GET /api/v1/players/:id/similar-alternatives`.
- Load the target player and candidate pool from `mart.player_ranking` plus related warehouse joins.
- Apply evidence-window and reliability-level context consistently with the rest of the API.
- Preserve the reference-style business filters: cheaper than target, optional same-position restriction, age range, budget cap, minimum reliability threshold, and minimum similarity threshold.
- Compute `similarityScore`, `affordabilityScore`, and `alternativeScore` in Node.
- Return explanation-friendly response fields so one sample result can be understood from the API response alone.

**Non-Goals:**
- Redesign the recommendation algorithm beyond what is needed to port the reference behavior.
- Add ML infrastructure, model persistence, or background recommendation jobs.
- Materialize recommendation results in the database.
- Build saved scenarios, recruiting workflows, or write endpoints.

## Decisions

### 1. Keep the endpoint under `/players/:id` but move the algorithm into a dedicated Node service
- **Decision:** Expose the API from the player-facing surface while implementing the similarity logic in a small service layer in Node.
- **Why:** The endpoint is player-specific, but the algorithm is complex enough that it should not live entirely in routes or repositories.
- **Alternative considered:** Put the whole recommender directly inside the players repository.
- **Why not:** That would mix SQL loading concerns with feature engineering and similarity scoring.

### 2. Reuse mart data and latest-club enrichment as the recommendation source of truth
- **Decision:** Read both the target player and candidate pool from `mart.player_ranking` joined with player and latest-club context.
- **Why:** The mart already contains the analytical features and scores the recommender needs, and Phase 8 should stay consistent with prior read endpoints.
- **Alternative considered:** Rebuild a separate candidate dataset from warehouse facts.
- **Why not:** Unnecessary duplication and higher implementation cost.

### 3. Implement similarity in plain Node instead of introducing a heavy ML dependency
- **Decision:** Compute normalized feature vectors and cosine-style similarity in Node with existing project dependencies.
- **Why:** The project does not currently include ML packages, and the reference behavior can be reproduced without adding a heavier dependency surface.
- **Alternative considered:** Add a JavaScript ML/nearest-neighbor library.
- **Why not:** Extra dependency weight is not justified for this MVP slice.

### 4. Apply active-window projection before similarity and scoring
- **Decision:** Map the selected evidence window to active fields such as recent minutes, recent appearances, reliability score, and smart value index before building candidate features.
- **Why:** This mirrors the reference recommender and keeps the API consistent with rankings and score explanation.
- **Alternative considered:** Always recommend using the mart default `last_3_seasons` window only.
- **Why not:** It would ignore the project-wide decision that evidence context should be user-selectable.

### 5. Keep recommendation output explanation-friendly and deterministic
- **Decision:** Return a target summary, applied filters, and candidate rows with structured score fields and key reasons rather than opaque recommendation labels.
- **Why:** The endpoint should be understandable from API output alone and easy to verify during development.
- **Alternative considered:** Return only candidate ids and final alternative scores.
- **Why not:** Too opaque for a DSS product.

## Risks / Trade-offs

- **Risk:** Hand-rolled similarity math may not match the reference recommender exactly.**  
  **Mitigation:** Preserve the same feature set, active-window projection, business filters, and score formulas first; keep the implementation explicit and test against sample outputs.

- **Risk:** Loading a large candidate pool on every request may be heavier than prior endpoints.**  
  **Mitigation:** Keep the first version simple, use the mart as the source, and consider later optimization only if real performance pressure appears.

- **Risk:** Recommendation filters can sprawl into too many user-tunable knobs.**  
  **Mitigation:** Start with the reference-style filters only and keep defaults opinionated.

## Migration Plan

1. Add route and validation for `GET /api/v1/players/:id/similar-alternatives`.
2. Add repository reads for the target player and candidate pool with latest-club enrichment.
3. Add a Node recommendation service that projects the active evidence window, computes similarity, applies filters, and ranks alternatives.
4. Document the endpoint and add a small integration test for a known player flow.

Rollback is straightforward: remove the new endpoint and recommendation service code. No database migration is required.

## Open Questions

- The exact default result limit and minimum similarity threshold can be finalized during implementation as long as they stay close to the reference recommender.
- Whether to include short deterministic recommendation reasons per candidate can be decided during implementation if it stays simple and stable.
