## Context

The project now has the full backend data pipeline and a basic read API for players and lookups. However, the current `/players` endpoint is still an entity-style read surface. Phase 6 is the first phase where the API should expose the backend's actual DSS output: ranked candidate lists and shortlist views driven by the recruitment mart.

This phase should stay narrower than later explanation and recommendation work. It should surface ranking and shortlist results, not narrative explanation or similarity logic. It should also build on the lightweight module style already chosen in Phase 5 rather than introducing unnecessary controller/service layers.

## Goals / Non-Goals

**Goals:**
- Add `GET /api/v1/rankings` for DSS ranking results.
- Add `GET /api/v1/shortlists` as a shortlist-oriented wrapper over the same ranking logic.
- Expose `evidenceWindow` and `reliabilityLevel` as validated filters with defaults.
- Apply ranking filters such as position, club, age, budget, pagination, and ranking-oriented sorting.
- Return explanation-friendly columns directly in the ranking responses.
- Document the new endpoints in Swagger/OpenAPI.

**Non-Goals:**
- Add the dedicated score explanation endpoint in this change.
- Add recommendation or similarity behavior in this change.
- Redesign the DSS score formula or mart columns.
- Introduce controller/service layers unless real orchestration pressure appears during implementation.

## Decisions

### 1. Add a dedicated rankings module instead of stretching the players module further
- **Decision:** Build a dedicated `rankings` module with route, repository, and schema files.
- **Why:** `/players` is now a generic entity-oriented API. Rankings and shortlists are a different public interface: DSS output rather than generic player browsing.
- **Alternative considered:** Keep expanding the players module with ranking behavior.
- **Why not:** It would blur the boundary between entity reads and decision-support reads.

### 2. Keep shortlist as a wrapper over the ranking query, not a separate algorithm
- **Decision:** Implement shortlist reads on top of the same ranking query path with more opinionated defaults.
- **Why:** A shortlist is not a different model; it is a constrained recruiting-friendly view of the ranking output.
- **Alternative considered:** Build a separate shortlist query path with duplicated logic.
- **Why not:** That would duplicate ranking logic and create drift.

### 3. Resolve evidence-window behavior through a whitelist map
- **Decision:** Map `evidenceWindow` to known mart columns using the shared evidence-window constants rather than accepting raw column names from input.
- **Why:** This keeps the API safe and keeps the query logic aligned to the known mart contract.
- **Alternative considered:** Accept generic column selections or raw query inputs.
- **Why not:** Unsafe and harder to reason about.

### 4. Treat reliability level as a filter label that resolves to a recent-minutes threshold
- **Decision:** Convert `Low` / `Medium` / `High` into a minimum recent-minutes threshold for the active evidence window.
- **Why:** That matches the reference DSS behavior and keeps the public API intuitive.
- **Alternative considered:** Ask clients to provide numeric reliability thresholds directly.
- **Why not:** That exposes internal mechanics and weakens consistency.

### 5. Include explanation-friendly columns directly in the ranking response
- **Decision:** Return not only `finalDssScore` but also the key component scores and active-window evidence columns in list responses.
- **Why:** This phase should expose enough information for consumers to understand the ranking output without waiting for the dedicated explanation endpoint.
- **Alternative considered:** Return only final score and basic identity fields.
- **Why not:** Too opaque for a DSS interface.

## Risks / Trade-offs

- **Risk:** Rankings may feel redundant with `/players` if the distinction is not kept clear.**  
  **Mitigation:** Keep `/players` as an entity read API and `/rankings` as the DSS ranking output API with evidence/reliability semantics.

- **Risk:** Dynamic evidence-window column selection can make repository SQL hard to follow.**  
  **Mitigation:** Keep all dynamic column resolution in a small, explicit whitelist-driven section of the repository.

- **Risk:** Shortlist semantics could sprawl into ad hoc business logic.**  
  **Mitigation:** Keep shortlist intentionally thin: reuse the ranking query and adjust only defaults or presentation-oriented constraints.

## Migration Plan

1. Add a lightweight rankings module.
2. Add validation for ranking and shortlist query parameters.
3. Implement a ranking repository query over `mart.player_ranking` with active-window and reliability filtering.
4. Add the shortlist route as a wrapper over the ranking query.
5. Register the new routes under `api/v1`.
6. Add Swagger documentation and verify the responses.

Rollback is straightforward: remove the new module and route registration. No schema change is required in this phase.

## Open Questions

- The exact shortlist defaults (for example default limit and whether to add stricter defaults like `maxBudget`) can be finalized during implementation.
- The exact ranking response shape can be settled during implementation as long as it remains stable and includes explanation-friendly score columns.
