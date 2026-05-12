## 1. Source data setup

- [x] 1.1 Copy the required football CSV datasets into the repository's `data/source/` location
- [x] 1.2 Add any configuration/constants needed for resolving the local source-data path and evidence-window settings

## 2. Warehouse ETL

- [x] 2.1 Implement the warehouse extraction and transform flow for competitions, clubs, players, matches, player performance, and player valuations
- [x] 2.2 Implement repeatable warehouse load scripts that populate the current `warehouse.*` tables from the local CSV data
- [x] 2.3 Add clear ETL logging for source reads, table loads, and successful completion

## 3. Mart setup

- [x] 3.1 Add the migration that creates the `mart` schema
- [x] 3.2 Add the SQL-backed build flow for `mart.player_features`
- [x] 3.3 Add the SQL-backed build flow for `mart.player_ranking` with preserved evidence windows, eligibility rules, and DSS score formulas
- [x] 3.4 Add mart validation checks for non-empty outputs and key ranking invariants

## 4. Pipeline orchestration

- [x] 4.1 Add refresh scripts that rerun the warehouse ETL and mart build flows predictably
- [x] 4.2 Update package scripts or command entrypoints for warehouse refresh, mart refresh, and full pipeline refresh

## 5. Verification

- [x] 5.1 Verify the warehouse refresh populates the expected `warehouse.*` tables with non-zero row counts
- [x] 5.2 Verify the mart refresh creates `mart.player_features` and `mart.player_ranking` successfully
- [x] 5.3 Verify the ranked mart output preserves the expected score columns and sorts by `final_dss_score`
