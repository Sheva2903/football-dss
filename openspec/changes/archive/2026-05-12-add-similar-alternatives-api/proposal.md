## Why

The backend now exposes player detail, rankings, shortlist, and score explanation reads, but it still lacks the final DSS outcome: recommending realistic cheaper alternatives for a target player. Phase 8 completes the MVP by turning the old similarity recommender into an API surface that clients can query directly from the rebuilt Express backend.

## What Changes

- Add `GET /api/v1/players/:id/similar-alternatives` under the versioned API.
- Load a recommendation candidate pool from `mart.player_ranking` plus related warehouse joins.
- Implement the similarity pipeline in Node using the same reference-style feature set and business filters as the old DSS.
- Support recommendation-oriented filters such as evidence window, reliability level, budget, age range, same-position behavior, and result limit.
- Return explanation-friendly recommendation fields including similarity, affordability, and combined alternative score.
- Document the endpoint and algorithm inputs in Swagger/OpenAPI.

## Capabilities

### New Capabilities
- `similar-alternatives-read-api`: Expose a player-specific similar-alternatives endpoint backed by mart data and a Node-based recommender pipeline.

### Modified Capabilities
- None.

## Impact

- Affected code: new recommendation logic in the backend, request validation, player route extension or recommendation module wiring, repository reads for target/candidate data, and Swagger docs.
- Affected APIs: adds `GET /api/v1/players/:id/similar-alternatives`.
- Affected dependencies: likely introduces or confirms use of a numeric similarity implementation in Node.
- Affected database usage: reads from `mart.player_ranking` with identity and latest-club enrichment for both the target player and candidate pool.
