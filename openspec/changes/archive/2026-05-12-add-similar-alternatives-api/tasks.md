## 1. Route and validation setup

- [x] 1.1 Add `GET /api/v1/players/:id/similar-alternatives` to the player-facing API
- [x] 1.2 Add validation for recommendation query parameters including evidence window, reliability level, age range, budget, same-position behavior, result limit, and minimum similarity threshold
- [x] 1.3 Reuse or extend player id validation for the similar-alternatives route

## 2. Candidate loading and recommendation service

- [x] 2.1 Add repository reads for the target player and recommendation candidate pool from `mart.player_ranking`
- [x] 2.2 Reuse latest-club enrichment and related identity joins for recommendation data
- [x] 2.3 Add a Node recommendation service that projects the active evidence window into similarity features
- [x] 2.4 Compute similarity scores and preserve the reference-style business filters in the recommendation pipeline
- [x] 2.5 Compute affordability and alternative scores and rank the final alternatives list

## 3. Response shaping

- [x] 3.1 Return a structured response containing target summary, applied filter context, and explanation-friendly alternatives rows
- [x] 3.2 Return 404 when the target player id is valid but not found in the recommendation read surface
- [x] 3.3 Return stable empty results when no candidates satisfy the recommendation filters
- [x] 3.4 Return 400 responses with useful validation errors for invalid recommendation input

## 4. Documentation and verification

- [x] 4.1 Document the similar-alternatives endpoint in Swagger/OpenAPI
- [x] 4.2 Verify the endpoint returns plausible alternatives for an existing player with default recommendation context
- [x] 4.3 Verify supported filters such as evidence window, reliability level, and budget affect the recommendation result
- [x] 4.4 Verify invalid input returns 400 and missing players return 404
