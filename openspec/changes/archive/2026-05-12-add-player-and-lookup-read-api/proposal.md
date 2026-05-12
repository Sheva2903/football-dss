## Why

The backend now has a working warehouse load and recruitment mart, but there is still no usable read API on top of that data. The next step is to expose a small, stable HTTP surface for lookups and player reads so the project can move from data preparation into actual backend consumption.

## What Changes

- Add lookup endpoints for clubs and positions under the versioned API.
- Add player list and player detail read endpoints backed by the current mart and warehouse model.
- Validate player and lookup request inputs with Zod.
- Document the new endpoints in Swagger/OpenAPI.
- Keep the module structure lightweight and feature-based instead of introducing extra controller/service layers too early.

## Capabilities

### New Capabilities
- `lookup-read-api`: Expose read endpoints for basic lookup data needed by the DSS client, starting with clubs and positions.
- `player-read-api`: Expose player list and player detail endpoints backed by the current recruitment mart and related warehouse joins.

### Modified Capabilities
- None.

## Impact

- Affected code: API route registration, new lookup/player modules, request validation schemas, repository SQL queries, and Swagger docs.
- Affected database usage: reads from `mart.player_ranking`, `warehouse.dim_players`, `warehouse.dim_clubs`, and latest-club valuation joins.
- Follow-on work enabled: ranking/shortlist endpoints, score explanation, and similar-alternatives API work.
