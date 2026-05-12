## Context

The project now has a real backend foundation and the initial `warehouse` schema, but those tables are empty and there is no analytical read model yet. The old DSS already proved out a practical flow: load football CSVs into PostgreSQL, normalize them into warehouse dimensions/facts, then build a recruitment-oriented mart that powers ranking and later recommendation logic.

This change covers the first complete data slice after the backend reset: make the repository self-contained with source datasets, load those datasets into `warehouse.*`, and build the `mart.player_features` and `mart.player_ranking` tables that later API work will read from.

## Goals / Non-Goals

**Goals:**
- Copy the required football CSV datasets into this repo under the planned source-data location.
- Add repeatable ETL scripts that load those datasets into the current `warehouse.*` tables.
- Keep the ETL database-driven, with Node orchestrating file discovery, validation, transactions, and logging.
- Add the `mart` schema and build the recruitment mart close to the reference DSS first.
- Preserve the reference evidence windows, reliability thresholds, eligibility rules, and DSS score formulas so later API work can be checked against known behavior.
- Add refresh commands that make the full data pipeline rerunnable on a clean or existing local database.

**Non-Goals:**
- Build read APIs in this change.
- Add score explanation or recommendation endpoints in this change.
- Redesign the DSS score model or recommender logic in this change.
- Introduce background jobs, schedulers, or staging schemas.

## Decisions

### 1. Merge ETL and mart into one proposal but keep implementation boundaries clear
- **Decision:** Treat phase 3 and phase 4 as one coherent OpenSpec change.
- **Why:** The mart has no value without loaded warehouse data, and the ETL has no product value yet without the mart.
- **Alternative considered:** Separate ETL and mart into two changes.
- **Why not:** More process overhead without reducing much technical risk, since the mart SQL is directly coupled to the warehouse load shape.

### 2. Keep the repo self-contained by copying required CSVs locally
- **Decision:** Copy the required source CSV files from the old DSS into this repo under `data/source/`.
- **Why:** The new backend should be runnable without depending on another local repository path.
- **Alternative considered:** Keep reading files from `/home/sheva/hcmut/sem252/dw`.
- **Why not:** Hidden runtime dependency and worse portability.

### 3. Reimplement the ETL in Node, but preserve the reference transformation rules
- **Decision:** Port the old ETL logic into backend scripts while preserving its input files, normalization rules, and missing-club/missing-player handling.
- **Why:** The reference ETL already encodes the real domain assumptions we want to preserve first.
- **Alternative considered:** Invent a new simpler import shape.
- **Why not:** It would break comparability with the old DSS and force unnecessary redesign before the MVP is working.

### 4. Keep transformations database-driven where possible
- **Decision:** Use Node scripts to orchestrate ETL and mart refresh, but keep bulk inserts, truncation, SQL creation, and mart calculations explicit and set-based.
- **Why:** This matches the project learning goal and keeps the analytical logic visible.
- **Alternative considered:** Row-by-row ORM-style imports and ORM-built mart logic.
- **Why not:** Slower, less transparent, and worse for learning SQL-backed backend work.

### 5. Keep the mart SQL explicit and close to the reference DSS first
- **Decision:** Build `mart.player_features` and `mart.player_ranking` from explicit SQL files/scripts, carrying over the first-pass formulas and evidence-window logic.
- **Why:** The mart is the heart of the DSS, and its logic should stay reviewable and explainable.
- **Alternative considered:** Hide ranking logic in service code or redesign the formulas now.
- **Why not:** It increases ambiguity and makes later API verification harder.

### 6. Preserve the current evidence windows and score model first
- **Decision:** Preserve `last_season`, `last_3_seasons`, and `last_5_seasons`, with the same reliability thresholds and score composition from the reference DSS.
- **Why:** The goal right now is a faithful backend rebuild, not score experimentation.
- **Alternative considered:** Simplify or redesign the scoring system during the port.
- **Why not:** That would make it impossible to separate implementation errors from intentional scoring changes.

## Risks / Trade-offs

- **Risk:** ETL and mart together may still be broad.**  
  **Mitigation:** Keep the change focused on scripts, SQL, and verification only—no API work.

- **Risk:** Source CSVs may contain inconsistencies such as clubs or players missing from primary dimension files.**  
  **Mitigation:** Preserve the reference strategy of creating stub clubs/players from match and appearance data when needed.

- **Risk:** Large CSV imports can become slow or memory-heavy.**  
  **Mitigation:** Use bulk-oriented loading and chunked operations rather than row-by-row ORM inserts.

- **Risk:** Porting the mart formulas inaccurately would pollute every later API feature.**  
  **Mitigation:** Keep the SQL close to the reference logic first and add mart validation checks in the refresh flow.

## Migration Plan

1. Copy the required source CSVs into `data/source/`.
2. Add ETL scripts and any supporting SQL/helpers needed to load `warehouse.*` from those files.
3. Add a migration that creates the `mart` schema.
4. Add SQL/scripts that rebuild `mart.player_features` and `mart.player_ranking`.
5. Add pipeline commands that refresh the warehouse load and mart build in sequence.
6. Verify row counts, table existence, and mart output sanity on a clean local database.

Rollback strategy is to revert the code, drop the `mart` schema, and reload the local database from a known empty state if needed.

## Open Questions

- Whether to use a dedicated CSV parsing library or PostgreSQL `COPY`-style loading can be decided at implementation time as long as the resulting import remains repeatable and bulk-oriented.
- Exact validation thresholds for mart sanity checks can be tuned during implementation, but the core reference requirements and formulas should stay unchanged in this change.
