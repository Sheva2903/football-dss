# Frontend Implementation Plan

## Goal
Build an internal scouting frontend in `frontend/` that sits on top of the existing backend and follows `frontend/DESIGN.md` as the visual system.

## Locked decisions
- Frontend type: internal scouting tool
- Scope: two-page recruiter flow first
- Frontend routes: `/` and `/players/:id`
- Backend remains the source of truth
- Use the existing APIs; do not redesign backend behavior in the frontend
- Keep the first version read-only
- Use a minimal custom stack: React + Vite + React Router + native `fetch` + plain CSS
- Do not add Axios for v1

## Primary workflow
1. Review ranked candidates and shortlist-style results
2. Narrow the pool with filters
3. Select a player from rankings or shortlist
4. Move into player analysis
5. Inspect score explanation
6. Review similar cheaper alternatives
7. Pivot into another candidate from the alternatives list

## MVP page shape
Two pages with a clear broad-to-deep flow:

### 1. Rankings / Shortlist page
Purpose: broad scouting and candidate discovery

Main areas:
- Evidence window selector
- Reliability level selector
- Position filter
- Club filter
- Age range filter
- Budget filter
- Sort selector
- Rankings table/list
- Pagination
- Dedicated shortlist section
- Summary stats

### 2. Player Analysis page
Purpose: deep inspection of one selected player

Main areas:
- Selected player summary
- Market value / production / minutes overview
- Score explanation breakdown
- Evidence window comparison cards
- Similar alternatives list
- Jump-to-analysis behavior for selected alternatives

## Backend endpoints to use
- `GET /api/v1/health`
- `GET /api/v1/clubs`
- `GET /api/v1/lookups/positions`
- `GET /api/v1/rankings`
- `GET /api/v1/shortlists`
- `GET /api/v1/players/:id`
- `GET /api/v1/players/:id/score-explanation`
- `GET /api/v1/players/:id/similar-alternatives`
- `GET /api/v1/docs` as an external docs link only

## Frontend state model
- `lookups`: clubs + positions
- `draftFilters`: local form state
- `activeFilters`: applied query state
- `rankings`: items + pagination + loading/error
- `shortlist`: dedicated section data + loading/error
- `selectedPlayerId`
- `playerAnalysis`: detail + explanation + alternatives + loading/error
- route state via React Router

## Data rules
- Filters apply explicitly, not on every keystroke
- Rankings/shortlist page owns discovery filters
- Shortlist is a dedicated section, not just a visual variant of rankings
- Moving to player analysis happens from a selected player
- Same evidence window and reliability level drive rankings, explanation, and alternatives
- Alternatives default to same-position mode first
- Selecting an alternative can open that player in the analysis page directly

## Design translation from DESIGN.md
Apply the design language to a dense tool, not a landing page:
- near-white canvas with ink-black hierarchy
- strong typography contrast with mono labels for technical metadata
- subtle hairline borders and stacked shadows
- restrained but visible gradient atmosphere in hero/header areas only
- dark polarity-flipped sections only where they improve hierarchy
- no generic dashboard styling

## Implementation phases

### Phase 1 — App shell + routing
- Replace Vite starter
- Build shared page frame
- Add shared tokens in CSS
- Add a small native `fetch` API helper
- Add React Router routes for `/` and `/players/:id`

### Phase 2 — Rankings / Shortlist page
- Load health and lookup data
- Build filter form
- Build rankings list
- Build dedicated shortlist section from `/api/v1/shortlists`
- Add pagination and player-selection behavior

### Phase 3 — Player Analysis page
- Build selected player summary
- Wire player detail endpoint
- Wire score explanation endpoint
- Render formula and component breakdown

### Phase 4 — Alternatives flow
- Wire similar alternatives endpoint
- Add same-position toggle
- Support jump-to-player from alternative cards
- Keep analysis page state coherent when pivoting players

### Phase 5 — Finish + verify
- Empty states
- Error states
- Responsive cleanup
- Build validation
- Frontend lint pass

## Verification
- Frontend loads against running backend
- Rankings filters change backend query results
- Selecting a player opens or updates the analysis page correctly
- Explanation reflects evidence window and reliability level
- Alternatives update correctly and allow pivoting
- `npm run build` passes
- `npm run lint` passes

## Non-goals for this version
- Auth
- Editing data
- Saved shortlists
- Complex charts
- Complex nested routing
- State management library

## Remaining risk
No product blocker is left for MVP.
The remaining work is technical implementation: API wiring, styling, and verification.
