## 1. Rankings module setup

- [x] 1.1 Add a lightweight rankings module with route, repository, and schema files
- [x] 1.2 Register the new rankings routes under the existing `api/v1` router

## 2. Rankings query validation

- [x] 2.1 Add Zod validation for rankings query parameters including evidence window and reliability level defaults
- [x] 2.2 Add validation for supported ranking filters such as position, club, age, budget, pagination, and sorting

## 3. Rankings repository query

- [x] 3.1 Implement the rankings repository query over `mart.player_ranking`
- [x] 3.2 Resolve active-window columns from the shared evidence-window constants
- [x] 3.3 Apply reliability thresholds for the selected evidence window and reliability level
- [x] 3.4 Add latest-club enrichment and any identity joins needed for ranking responses
- [x] 3.5 Return explanation-friendly score columns and active-window evidence columns in ranking responses

## 4. Shortlist API behavior

- [x] 4.1 Add `GET /api/v1/rankings` with stable JSON responses
- [x] 4.2 Add `GET /api/v1/shortlists` as a wrapper over the ranking query
- [x] 4.3 Apply shortlist-oriented defaults without duplicating ranking logic

## 5. API behavior and docs

- [x] 5.1 Return 400 responses with useful validation errors for invalid ranking filters
- [x] 5.2 Document the rankings and shortlist endpoints in Swagger/OpenAPI

## 6. Verification

- [x] 6.1 Verify the rankings endpoint works with default evidence and reliability settings
- [x] 6.2 Verify the rankings endpoint applies supported filters successfully
- [x] 6.3 Verify the shortlist endpoint works with shortlist defaults and stable JSON responses
- [x] 6.4 Verify invalid ranking filters return 400 responses with useful errors
