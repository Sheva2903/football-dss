## ADDED Requirements

### Requirement: Player recruitment mart SHALL create a dedicated analytical schema
The system SHALL create and use a PostgreSQL `mart` schema for recruitment-oriented analytical tables.

#### Scenario: Mart schema exists after mart setup
- **WHEN** the mart setup or refresh flow runs successfully
- **THEN** the database SHALL contain a `mart` schema

### Requirement: Player recruitment mart SHALL build player feature rows from warehouse data
The system SHALL build `mart.player_features` as a player-level analytical table derived from the warehouse model.

#### Scenario: Player features table is rebuilt
- **WHEN** the mart refresh flow completes successfully
- **THEN** the database SHALL contain `mart.player_features` with recruitment-oriented player feature columns derived from warehouse data

### Requirement: Player recruitment mart SHALL build ranked player output from player features
The system SHALL build `mart.player_ranking` as the ranked recruitment read model derived from `mart.player_features`.

#### Scenario: Player ranking table is rebuilt
- **WHEN** the mart refresh flow completes successfully
- **THEN** the database SHALL contain `mart.player_ranking` sorted by the DSS ranking logic

### Requirement: Player recruitment mart SHALL preserve the reference evidence-window model
The system SHALL preserve the reference evidence windows `last_season`, `last_3_seasons`, and `last_5_seasons`, including their recent-minutes, recent-appearances, reliability-score, and smart-value-index outputs.

#### Scenario: Window-specific columns exist in ranked output
- **WHEN** the ranking table is rebuilt
- **THEN** the ranked output SHALL include the window-specific columns required by the reference evidence-window model

### Requirement: Player recruitment mart SHALL preserve the first-pass DSS score logic
The system SHALL preserve the reference-style player eligibility rules, component scores, and first-pass final DSS score composition before any later redesign.

#### Scenario: Ranked output includes preserved score components
- **WHEN** the ranking table is rebuilt
- **THEN** the ranked output SHALL include the preserved component scores and final DSS score fields used by the reference DSS logic

### Requirement: Player recruitment mart SHALL be refreshable after warehouse loading
The system SHALL provide a repeatable mart refresh flow that rebuilds the analytical recruitment tables after warehouse data has been loaded.

#### Scenario: Mart refresh can be rerun after warehouse load
- **WHEN** the mart refresh command is executed after warehouse data is present
- **THEN** the analytical recruitment tables SHALL be rebuilt without requiring manual table recreation

### Requirement: Player recruitment mart SHALL validate key output sanity
The system SHALL verify that the rebuilt mart produces non-empty analytical outputs and preserves key ranking invariants needed by later API work.

#### Scenario: Mart rebuild detects invalid output state
- **WHEN** the mart rebuild produces empty or structurally invalid ranked output
- **THEN** the refresh flow SHALL fail clearly instead of reporting a successful mart build
