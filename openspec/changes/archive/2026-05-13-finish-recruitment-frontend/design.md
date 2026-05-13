## Context

The frontend now has working routing, API wiring, and an initial discovery page, but the current UI is still closer to a technical scaffold than a comfortably usable recruiting tool. The concrete issues are visible in the current screens: the header includes a database/live badge that adds noise rather than clarity, shortlist is squeezed into the left sidebar instead of being treated as a primary recruiter surface, and the `/players/:id` route is still only a placeholder.

This change finishes the product-level frontend flow using the APIs that already exist. The main constraint is practical: the UI needs to become readable and useful without turning this phase into a visual-design exercise. Clarity, structure, and scanability matter more than color refinement or micro-polish.

## Goals / Non-Goals

**Goals:**
- Make the discovery page readable enough for practical recruiter use.
- Remove distracting UI that does not help the user make decisions.
- Promote shortlist into a clearer, longer section instead of a small left-rail block.
- Keep rankings easy to scan with stronger hierarchy and clearer layout.
- Replace the player-analysis placeholder with a real page backed by the existing player APIs.
- Make the two-page frontend clearly demonstrate the backend APIs it uses.
- Preserve the current lightweight frontend stack and reuse existing backend contracts.

**Non-Goals:**
- Rebrand the app or spend this change on palette experimentation.
- Add charts, advanced data visualization, or design-heavy motion.
- Introduce new frontend infrastructure such as a state library or component framework.
- Change backend endpoints or scoring logic.

## Decisions

### 1. Optimize for readability before visual expressiveness
- **Decision:** Keep the UI visually clean and presentable, but make layout clarity and information hierarchy the primary success criteria.
- **Why:** The user explicitly asked for a lookable but practical UI, with no need to over-focus on color palette or tiny refinements.
- **Alternative considered:** Spend this change on stronger visual styling. Rejected because the bigger current problem is usability, not branding.

### 2. Simplify the header and remove the database/live badge
- **Decision:** Remove the database/live status box from the primary header and keep only actions that help the user work, such as refresh and API docs where appropriate.
- **Why:** The live-status badge consumes prime space without helping the recruiter make a better decision.
- **Alternative considered:** Keep the badge but demote its styling. Rejected because the clearer solution is to remove it entirely.

### 3. Rebuild the discovery page around top controls + long shortlist + rankings
- **Decision:** Replace the current sidebar-heavy composition with a clearer reading flow: compact controls, a dedicated long shortlist section, and a more table-like rankings area.
- **Why:** Shortlist is a top-level recruiter output and should not feel secondary to the filters column. A longer section also improves scanability and comparison.
- **Alternative considered:** Keep shortlist in the left sidebar and just restyle it. Rejected because the structure itself is the problem.

### 4. Keep filters compact and supportive instead of dominating the page
- **Decision:** Retain the current filter capabilities, but reorganize them into a cleaner and less dominant layout so they support discovery rather than compete with it.
- **Why:** The page should read as candidate discovery first, filtering second.
- **Alternative considered:** Preserve the large left-side filter block. Rejected because it makes the page feel cramped and pushes important results away.

### 5. Implement the player analysis route as the second real working page
- **Decision:** Turn `/players/:id` into a complete analysis page using `GET /api/v1/players/:id`, `GET /api/v1/players/:id/score-explanation`, and `GET /api/v1/players/:id/similar-alternatives`.
- **Why:** The frontend is not truly usable until the user can move from discovery into deeper analysis without hitting a placeholder.
- **Alternative considered:** Keep the placeholder and refine discovery only. Rejected because the user asked to finish the frontend, not just tidy the first page.

### 6. Present analysis in sections that map to recruiter questions
- **Decision:** Structure the analysis page around practical questions: who is the player, why is the score strong or weak, what evidence supports it, and who are the alternatives.
- **Why:** This mirrors how the backend responses are already shaped and improves comprehension without inventing new abstractions.
- **Alternative considered:** Dump API responses into generic cards. Rejected because it would remain technically complete but not readable.

### 7. Reuse the current stack and fetch layer
- **Decision:** Keep React Router, native `fetch`, and plain CSS. Extend the existing helper layer instead of adding new frontend tooling.
- **Why:** This work is about completing the product flow, not changing the technical foundation.
- **Alternative considered:** Introduce additional libraries for layout or state. Rejected as unnecessary for this scope.

## Risks / Trade-offs

- **[Risk]** A clarity-first UI may feel visually plain in some areas. → **Mitigation:** keep typography, spacing, and section structure strong enough that the app still feels deliberate and finished.
- **[Risk]** Moving shortlist into a longer section may increase page length. → **Mitigation:** make the page flow sequentially and use clearer sectioning so longer reading feels intentional, not cluttered.
- **[Risk]** The analysis page could become too dense if every backend field is surfaced. → **Mitigation:** prioritize explanation-friendly fields and keep raw/detail fields secondary.
- **[Risk]** Finishing both discovery and analysis in one change increases implementation surface. → **Mitigation:** keep the UX simple, avoid new infrastructure, and reuse existing data helpers.

## Migration Plan

1. Rework discovery-page layout and remove header noise.
2. Keep discovery page API usage explicit around `GET /api/v1/clubs`, `GET /api/v1/lookups/positions`, `GET /api/v1/rankings`, and `GET /api/v1/shortlists`.
3. Move shortlist into its own longer section and rebalance filters/rankings composition.
4. Implement the full player-analysis route using `GET /api/v1/players/:id`, `GET /api/v1/players/:id/score-explanation`, and `GET /api/v1/players/:id/similar-alternatives`.
5. Tighten empty/loading/error states so both pages remain readable during failures.
6. Validate the final frontend with build and lint.

Rollback remains simple: revert the frontend change set. No backend schema or API migration is involved.

## Open Questions

- None. The product direction for this change is clear: finish the frontend for usability and readability rather than push deeper visual refinement.
