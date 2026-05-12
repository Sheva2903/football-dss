## Why

The backend now exposes basic player and lookup reads, but it still does not expose the core DSS output: ranked candidate lists and shortlist views. Phase 6 turns the recruitment mart into decision-support endpoints so clients can ask for ranked candidates with evidence-window and reliability controls instead of manually reconstructing that logic from generic player reads.

## What Changes

- Add a rankings endpoint over `mart.player_ranking` for DSS-oriented candidate lists.
- Add a shortlist endpoint as a recruiting-focused wrapper over the ranking query.
- Expose `evidenceWindow` and `reliabilityLevel` as validated query filters with sensible defaults.
- Return explanation-friendly score columns directly in ranking responses.
- Keep the implementation lightweight and feature-based, matching the current route + schema + repository style.

## Capabilities

### New Capabilities
- `rankings-read-api`: Expose a ranked DSS player list endpoint with evidence-window, reliability, and recruitment-oriented filters.
- `shortlist-read-api`: Expose a shortlist endpoint built on the same ranking logic but with more opinionated shortlist defaults.

### Modified Capabilities
- None.

## Impact

- Affected code: new rankings module, route registration, request validation schemas, repository SQL, and Swagger docs.
- Affected database usage: reads from `mart.player_ranking` plus warehouse joins for player identity and latest club context.
- Follow-on work enabled: score explanation and similar-alternatives recommendation can build on the same ranking concepts and filters.
