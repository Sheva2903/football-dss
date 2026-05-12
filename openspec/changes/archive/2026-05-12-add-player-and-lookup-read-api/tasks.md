## 1. Lookup API

- [x] 1.1 Add a lightweight lookups module with route and repository files
- [x] 1.2 Implement `GET /api/v1/clubs` from the warehouse clubs dimension
- [x] 1.3 Implement `GET /api/v1/lookups/positions` from the current rankable player set

## 2. Player API structure

- [x] 2.1 Add a lightweight players module with route, repository, and schema files
- [x] 2.2 Add Zod schemas for player list query validation and player id param validation
- [x] 2.3 Register the new lookup and player routes under the existing `api/v1` router

## 3. Player read queries

- [x] 3.1 Implement the player list repository query using `mart.player_ranking` as the base read model
- [x] 3.2 Add latest-club enrichment for player reads from valuation and club data
- [x] 3.3 Implement supported player list filters for position, club, age, market value, pagination, and whitelisted sorting
- [x] 3.4 Implement the player detail repository query for a single player

## 4. API behavior and docs

- [x] 4.1 Return stable JSON response shapes for lookup and player endpoints
- [x] 4.2 Return 400 responses with useful validation errors for invalid inputs and 404 for missing players
- [x] 4.3 Document the new lookup and player endpoints in Swagger/OpenAPI

## 5. Verification

- [x] 5.1 Verify the lookup endpoints return stable JSON successfully
- [x] 5.2 Verify the player list and player detail endpoints return stable JSON successfully
- [x] 5.3 Verify invalid player filters and invalid ids return 400 responses with useful errors
