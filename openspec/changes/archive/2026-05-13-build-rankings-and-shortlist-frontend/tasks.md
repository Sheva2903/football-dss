## 1. Frontend shell and routing

- [x] 1.1 Add React Router to the frontend package and wire the app root to route-based rendering
- [x] 1.2 Replace the Vite starter app with a shared recruiter shell aligned to `frontend/DESIGN.md`
- [x] 1.3 Add routes for `/` and `/players/:id`, including a minimal valid placeholder for the player-analysis route
- [x] 1.4 Add shared frontend API helpers for health, lookups, rankings, and shortlists using native `fetch`

## 2. Discovery page data flow

- [x] 2.1 Load health, clubs, and positions data when the discovery page opens
- [x] 2.2 Implement explicit draft-vs-applied filter state for evidence window, reliability level, position, club, age, budget, and sort options
- [x] 2.3 Request rankings from `/api/v1/rankings` with applied filters, sorting, and pagination
- [x] 2.4 Request shortlist data from `/api/v1/shortlists` using the active scouting lens while preserving shortlist endpoint behavior

## 3. Discovery page UI

- [x] 3.1 Build the filter panel and summary/header UI for the recruiter discovery page
- [x] 3.2 Build the rankings results surface with player identity, club, market value, DSS score context, and pagination controls
- [x] 3.3 Build the dedicated shortlist section separate from the rankings surface
- [x] 3.4 Add navigation from rankings rows and shortlist items into `/players/:id`

## 4. States and verification

- [x] 4.1 Add loading, empty, and error states for lookup, rankings, and shortlist sections
- [x] 4.2 Validate responsive behavior and interaction polish for the discovery flow
- [x] 4.3 Run `npm run build` in `frontend/` and fix any build issues
- [x] 4.4 Run `npm run lint` in `frontend/` and fix any lint issues
