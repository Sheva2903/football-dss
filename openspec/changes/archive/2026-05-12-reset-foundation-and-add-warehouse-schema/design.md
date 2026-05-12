## Context

The current repo has working Express basics and a reusable Postgres container setup, but its active backend model is still a toy schema that does not match the real football DSS. The reference DSS uses a warehouse-and-mart data flow, and later ETL, ranking, and recommendation work depends on that structure existing first.

This change covers the smallest coherent reset needed before feature work can continue: establish a real backend foundation and create the initial warehouse schema through migrations.

## Goals / Non-Goals

**Goals:**
- Replace toy-domain assumptions with a backend foundation aligned to the DSS rebuild.
- Introduce migration-backed schema management instead of ad hoc schema creation as the main path.
- Create the initial `warehouse` schema and its core dimension/fact tables close to the reference DSS model.
- Keep the app runnable while preparing for later ETL, mart, and analytical API work.

**Non-Goals:**
- Implement CSV import in this change.
- Build mart tables in this change.
- Add ranking, shortlist, or recommendation endpoints in this change.
- Finalize every package or module shape for future phases beyond what is needed for the foundation.

## Decisions

### 1. Controlled reset instead of gradual extension of the toy schema
- **Decision:** Retire the current `clubs/players/player_stats` schema as the target architecture and rebuild around the real warehouse model.
- **Why:** The toy schema conflicts with the warehouse-and-mart design needed for the actual DSS.
- **Alternative considered:** Evolve the toy schema incrementally.
- **Why not:** It would create confusion and rework because the domain model is wrong at the foundation level.

### 2. Keep the current Express repo and Postgres container setup
- **Decision:** Reuse the current repo and `docker-compose.yaml` Postgres service.
- **Why:** The container setup is already sufficient; the problem is the database contents and backend shape, not the infrastructure.
- **Alternative considered:** Start a fresh repo or new database container.
- **Why not:** Extra churn with little learning value.

### 3. Use hybrid persistence boundaries from the start
- **Decision:** Use Sequelize for migration tooling and simple DB integration, while keeping analytical SQL explicit.
- **Why:** This matches the project learning goal: learn Sequelize without hiding SQL-heavy backend logic.
- **Alternative considered:** Use Sequelize models and ORM flows everywhere.
- **Why not:** It would obscure warehouse design and later mart logic.

### 4. Introduce `api/v1`, env validation, and centralized error handling now
- **Decision:** Build a small but real backend foundation before further domain work.
- **Why:** Later endpoints should not be built on top of the current ad hoc route structure and manual validation style.
- **Alternative considered:** Delay foundation cleanup until after schema work.
- **Why not:** It would spread migration work across unrelated future changes.

### 5. Create the initial warehouse schema close to the reference DSS
- **Decision:** Add migrations for `warehouse.dim_date`, `warehouse.dim_competitions`, `warehouse.dim_clubs`, `warehouse.dim_players`, `warehouse.fact_matches`, `warehouse.fact_player_performance`, and `warehouse.fact_player_valuations`.
- **Why:** These tables are the minimum stable base for later ETL and mart work and align with the reference DSS.
- **Alternative considered:** Simplify to a smaller custom schema first.
- **Why not:** It would break comparability with the reference logic and create avoidable redesign later.

## Risks / Trade-offs

- **Risk:** Combining foundation reset and warehouse schema work could make the change too broad.  
  **Mitigation:** Keep scope strict: no ETL, no mart, no analytical endpoints.

- **Risk:** Existing routes or scripts may temporarily break during the reset.  
  **Mitigation:** Keep a minimal health path working and move deliberately from toy schema assumptions to the new baseline.

- **Risk:** Sequelize setup may tempt overuse of ORM abstractions.  
  **Mitigation:** Use Sequelize only where this change needs it: migrations and basic DB integration.

## Migration Plan

1. Add foundational dependencies and base backend wiring.
2. Introduce migration tooling and configuration.
3. Add warehouse schema/table migrations and indexes.
4. Retire or isolate toy schema usage so later work builds only on the real model.
5. Verify the app boots and migrations run from an empty database.

Rollback strategy for this phase is simple: revert the code change and reset the local database volume if needed.

## Open Questions

- Exact package choices for Swagger and logging can remain implementation-level decisions as long as the change preserves the intended boundaries.
- Some warehouse indexes may be tuned again once ETL queries and mart build queries exist.
