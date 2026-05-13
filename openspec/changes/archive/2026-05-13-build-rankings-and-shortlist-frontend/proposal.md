## Why

The backend MVP now exposes the core discovery APIs, but there is no usable frontend for recruiter workflows. We need the first frontend slice now so rankings and shortlists can be explored as an actual scouting tool instead of only through Swagger and raw JSON.

## What Changes

- Build the first user-facing frontend flow in the existing React + Vite app.
- Replace the starter page with a recruiter discovery experience rooted at `/`.
- Add frontend routing and shared app shell needed for the discovery flow.
- Add a rankings view backed by `GET /api/v1/rankings` with explicit filters, sorting, and pagination.
- Add a dedicated shortlist section backed by `GET /api/v1/shortlists` instead of treating shortlist as only a ranking variant.
- Add lookup-driven filter controls using clubs and positions endpoints.
- Add navigation from discovery results into player analysis routes at `/players/:id`.
- Apply `frontend/DESIGN.md` to produce an internal scouting interface rather than a marketing page.

## Capabilities

### New Capabilities
- `rankings-shortlist-frontend`: A recruiter-facing discovery page that loads lookup data, applies ranking filters, displays rankings, shows a dedicated shortlist section, and links users into player analysis routes.
- `frontend-shell-routing`: The frontend app shell, route structure, and shared API wiring needed to support recruiter pages at `/` and `/players/:id`.

### Modified Capabilities
- None.

## Impact

- Affected code: `frontend/src/*`, frontend routing, shared API utilities, and frontend styling.
- Dependencies: add `react-router` or equivalent lightweight router support for frontend routes.
- Systems: browser UI will become the primary way to use rankings and shortlist APIs.
- Backend APIs are reused as-is; this change does not alter backend contracts.
