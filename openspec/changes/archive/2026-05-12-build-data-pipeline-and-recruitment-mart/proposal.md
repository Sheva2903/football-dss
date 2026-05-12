## Why

The backend now has the initial foundation and `warehouse` schema, but it still cannot load football data or produce the analytical read model that the DSS depends on. The next step is to make the database useful by importing the source CSVs and rebuilding the player recruitment mart that powers ranking and recommendation features.

## What Changes

- Add a repeatable ETL pipeline that copies the required football CSV datasets into this repo and loads them into the `warehouse.*` tables.
- Add database-driven ETL scripts for dimensions and facts, with clear logging for row counts and failures.
- Add the `mart` schema and SQL-backed mart build flow for `mart.player_features` and `mart.player_ranking`.
- Preserve the reference DSS evidence windows, eligibility rules, and score formulas first so later API work can be validated against known logic.
- Add refresh scripts that rebuild the warehouse-loaded analytical model in a predictable way.

## Capabilities

### New Capabilities
- `warehouse-etl`: Load the required football CSV data into the warehouse schema through repeatable backend ETL scripts.
- `player-recruitment-mart`: Build the analytical player recruitment mart, including player features, ranking outputs, evidence windows, and DSS score columns.

### Modified Capabilities
- None.

## Impact

- Affected code: ETL scripts, SQL files, migration scripts for `mart`, shared constants for evidence windows, and pipeline orchestration scripts.
- Affected database: populates `warehouse.*` tables and introduces `mart.*` analytical tables.
- Affected data assets: adds the required CSV source datasets into this repo under the planned source-data location.
- Follow-on work enabled: player APIs, ranking/shortlist APIs, score explanation, and similar-alternatives recommendation.
