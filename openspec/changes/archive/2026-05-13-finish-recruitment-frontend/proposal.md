## Why

The frontend now has the basic plumbing, but it is not yet clear or complete enough to be used comfortably as a real recruiter tool. We need to finish the frontend now by making the discovery page easier to read, removing distracting UI, and turning the player analysis route into a real working page.

## What Changes

- Finish the frontend as a usable recruiter-facing product rather than a partial shell.
- Keep the frontend as a two-page flow:
  - Discovery page at `/`
  - Player Analysis page at `/players/:id`
- Rework the discovery page layout for clarity and reading comfort instead of sidebar-heavy density.
- Remove the database/live status box from the header.
- Move shortlist out of the left sidebar and render it as a longer dedicated section with clearer scanability.
- Improve rankings-page readability, information hierarchy, and spacing without over-investing in color refinement.
- Replace the `/players/:id` placeholder with a real player analysis page.
- Use the existing backend APIs explicitly as the frontend data contract:
  - Discovery page: `GET /api/v1/clubs`, `GET /api/v1/lookups/positions`, `GET /api/v1/rankings`, `GET /api/v1/shortlists`
  - Player Analysis page: `GET /api/v1/players/:id`, `GET /api/v1/players/:id/score-explanation`, `GET /api/v1/players/:id/similar-alternatives`
- Preserve the current lightweight frontend stack and focus the work on UX clarity, layout, and real usage flow.

## Capabilities

### New Capabilities
- `frontend-discovery-usability`: A readable discovery page that uses clubs, positions, rankings, and shortlist APIs to support practical recruiting use.
- `player-analysis-frontend`: A real player analysis page that uses player detail, score explanation, and similar alternatives APIs in a usable frontend flow.

### Modified Capabilities
- None.

## Impact

- Affected code: `frontend/src/*`, especially discovery-page layout, player-analysis route, shared presentation utilities, and CSS.
- Systems: the browser frontend becomes a usable primary interface for both candidate discovery and player analysis.
- Backend APIs reused explicitly:
  - `GET /api/v1/clubs`
  - `GET /api/v1/lookups/positions`
  - `GET /api/v1/rankings`
  - `GET /api/v1/shortlists`
  - `GET /api/v1/players/:id`
  - `GET /api/v1/players/:id/score-explanation`
  - `GET /api/v1/players/:id/similar-alternatives`
- No backend contract changes are required.
