## Context

The backend now has its full MVP feature set: warehouse ETL, mart build, player and lookup reads, rankings, shortlist, score explanation, and similar alternatives. What remains is not another product capability but a stabilization pass that makes the repository easier to run, verify, and hand off without relying on development-session context.

The current repo already has several integration tests, but the test command in `package.json` is still a placeholder and the project does not yet have a top-level run guide. This phase should stay small and practical: tighten the script surface, add only high-value missing tests, clean up implementation artifacts, and document the canonical run flow.

## Goals / Non-Goals

**Goals:**
- Add any missing high-value integration coverage for the core MVP read surfaces and key run flows.
- Replace placeholder or misleading developer commands with real usable scripts.
- Add a concise top-level run guide covering database setup, ETL refresh, mart refresh, API start, Swagger access, and tests.
- Clean up temporary or inconsistent code artifacts introduced during the earlier phases.
- Keep the repo self-contained and easy to verify from scratch.

**Non-Goals:**
- Add new product endpoints or business capabilities.
- Rewrite existing modules just for style.
- Introduce a large test framework migration or broad test-suite expansion.
- Redesign the project structure now that the MVP is complete.

## Decisions

### 1. Keep testing focused on backbone flows, not full coverage
- **Decision:** Add only the missing high-value integration checks for the final MVP surface and keep the test scope selective.
- **Why:** The project explicitly chose small, high-value integration tests over exhaustive testing.
- **Alternative considered:** Add broad test coverage for every query shape and helper path.
- **Why not:** Too much work for a learning MVP and out of scope for a stabilization pass.

### 2. Make `package.json` scripts reflect the actual project workflow
- **Decision:** Replace placeholder commands with real commands for tests and keep the existing migrate/pipeline/server commands aligned with the implemented repo structure.
- **Why:** The run flow should be discoverable from standard scripts, not only from memory.
- **Alternative considered:** Leave the placeholder script and rely only on manual commands.
- **Why not:** Misleading and incomplete for a finished MVP.

### 3. Add one concise top-level run document instead of spreading instructions around
- **Decision:** Add or tighten a single top-level README-oriented run flow.
- **Why:** The backend should be runnable from one obvious entry point.
- **Alternative considered:** Keep instructions only in build-plan or phase docs.
- **Why not:** Those are planning artifacts, not the operational entry point for using the repo.

### 4. Prefer cleanup by removal, not by adding wrappers or abstractions
- **Decision:** Remove or tighten any leftover artifacts directly rather than hiding them behind new abstraction layers.
- **Why:** This matches the project’s simplicity rule and keeps the final MVP easy to inspect.
- **Alternative considered:** Add more helpers to smooth over inconsistencies.
- **Why not:** Unnecessary complexity at the finish line.

## Risks / Trade-offs

- **Risk:** The stabilization phase could sprawl into broad refactoring.**  
  **Mitigation:** Limit changes to tests, scripts, docs, and clearly justified cleanup tied to MVP verification.

- **Risk:** New documentation may drift from actual commands if not verified.**  
  **Mitigation:** Verify the documented commands during implementation and keep the run guide concise.

- **Risk:** Cleanup changes may accidentally alter behavior late in the project.**  
  **Mitigation:** Keep changes surgical and back them with the integration checks.

## Migration Plan

1. Review current scripts, docs, and tests to identify the smallest missing stabilization work.
2. Add the missing high-value tests and ensure a real test command exists.
3. Add or tighten the top-level run guide and verify the documented commands.
4. Remove or fix leftover implementation artifacts discovered during the pass.

Rollback is straightforward: revert the stabilization edits. No schema change is required.

## Open Questions

- Whether a small pipeline verification script should be added in this phase or whether endpoint integration coverage is sufficient can be decided during implementation.
- The exact README structure can be finalized during implementation as long as the core run flow is clear and verified.
