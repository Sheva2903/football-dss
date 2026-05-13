## 1. Discovery page restructuring

- [x] 1.1 Remove the database/live status box from the discovery header and simplify the top action area
- [x] 1.2 Rework the discovery-page layout so filters do not dominate the page structure
- [x] 1.3 Move shortlist out of the left sidebar and rebuild it as a longer dedicated section with clearer scanability
- [x] 1.4 Improve rankings-page structure and typography so player, club, market, and DSS information are easier to read

## 2. Player analysis page

- [x] 2.1 Replace the `/players/:id` placeholder with a real analysis page shell
- [x] 2.2 Load player summary data from `GET /api/v1/players/:id` and render the key identity/context fields
- [x] 2.3 Load score explanation data from `GET /api/v1/players/:id/score-explanation` and render readable explanation sections
- [x] 2.4 Load similar alternatives data from `GET /api/v1/players/:id/similar-alternatives` and render them as a usable comparison section
- [x] 2.5 Add player-to-player pivoting from alternatives and a clear route back to discovery

## 3. State handling and readability

- [x] 3.1 Make discovery loading, empty, and error states clearer and more readable
- [x] 3.2 Add readable loading, empty, and error states to the player analysis page
- [x] 3.3 Keep evidence-window and reliability context understandable across both FE pages and their API-driven views
- [x] 3.4 Tighten spacing, hierarchy, and responsive behavior so both pages remain usable without fine-grained visual polish

## 4. Verification

- [x] 4.1 Run `npm run build` in `frontend/` and fix any build issues
- [x] 4.2 Run `npm run lint` in `frontend/` and fix any lint issues
