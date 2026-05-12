## 1. Route and validation setup

- [x] 1.1 Add `GET /api/v1/players/:id/score-explanation` to the players routes
- [x] 1.2 Add validation for explanation query parameters with `evidenceWindow` and `reliabilityLevel` defaults
- [x] 1.3 Reuse or extend player id validation for the score explanation route

## 2. Score explanation repository query

- [x] 2.1 Add a repository function to load one player's score explanation from `mart.player_ranking`
- [x] 2.2 Resolve active evidence columns from the shared evidence-window constants
- [x] 2.3 Resolve reliability threshold context for the selected evidence window and reliability level
- [x] 2.4 Reuse latest-club enrichment and related identity joins for the explanation response

## 3. Response shaping

- [x] 3.1 Return structured explanation blocks for player, score, components, evidence, reliability, and formula
- [x] 3.2 Return 404 when the player id is valid but not found in the explanation read surface
- [x] 3.3 Return 400 responses with useful validation errors for invalid explanation input

## 4. Documentation and verification

- [x] 4.1 Document the score explanation endpoint in Swagger/OpenAPI
- [x] 4.2 Verify the endpoint works for an existing player with default explanation context
- [x] 4.3 Verify the endpoint applies supported evidence window and reliability level inputs
- [x] 4.4 Verify invalid explanation input returns 400 and missing players return 404
