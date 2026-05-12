## Why

The backend now exposes player, lookup, ranking, and shortlist reads, but it still does not explain how an individual player's DSS score is formed. Phase 7 adds the first explainability endpoint so clients can understand score components and recent evidence directly from the API instead of reverse-engineering mart columns themselves.

## What Changes

- Add `GET /api/v1/players/:id/score-explanation` under the versioned API.
- Return player identity, latest club context, market value, final DSS score, and component scores.
- Return active evidence-window fields and reliability context using the existing shared evidence-window constants.
- Include explanation-friendly breakdown fields so consumers can understand why the player scored as they did.
- Validate path and query input and document the endpoint in Swagger/OpenAPI.

## Capabilities

### New Capabilities
- `score-explanation-read-api`: Expose a player score explanation endpoint backed by the recruitment mart and related warehouse joins.

### Modified Capabilities
- None.

## Impact

- Affected code: new score explanation module or player-module extension, validation schemas, repository query, API route registration, and Swagger docs.
- Affected APIs: adds `GET /api/v1/players/:id/score-explanation`.
- Affected database usage: reads from `mart.player_ranking` plus joins for player identity and latest club context.
