## ADDED Requirements

### Requirement: Warehouse ETL SHALL load the required football source datasets from this repository
The system SHALL load the required football CSV datasets from this repository's source-data location rather than depending on the old DSS repository at runtime.

#### Scenario: Local source datasets are used for ETL
- **WHEN** the warehouse refresh pipeline runs
- **THEN** it SHALL read the required source CSV files from this repository's configured source-data path

### Requirement: Warehouse ETL SHALL populate the core warehouse dimensions and facts
The system SHALL transform the required football source data into the existing `warehouse.dim_date`, `warehouse.dim_competitions`, `warehouse.dim_clubs`, `warehouse.dim_players`, `warehouse.fact_matches`, `warehouse.fact_player_performance`, and `warehouse.fact_player_valuations` tables.

#### Scenario: Warehouse tables are populated after ETL
- **WHEN** the ETL pipeline completes successfully
- **THEN** the required warehouse dimension and fact tables SHALL contain imported football data

### Requirement: Warehouse ETL SHALL preserve the reference import integrity rules
The system SHALL preserve the reference ETL behavior needed to build a consistent warehouse, including stable competition identifiers, normalized dates, numeric coercion, and support for clubs or players that appear in fact sources but are missing from primary dimension source files.

#### Scenario: Missing clubs or players do not block warehouse loading
- **WHEN** a match or appearance references a club or player missing from the main club or player CSV file
- **THEN** the ETL pipeline SHALL still preserve the usable record set needed for warehouse loading according to the reference import strategy

### Requirement: Warehouse ETL SHALL be repeatable on a local database
The system SHALL provide a repeatable warehouse refresh flow that can be rerun on the local database without requiring manual table recreation.

#### Scenario: Warehouse refresh can be rerun
- **WHEN** the warehouse refresh command is executed more than once
- **THEN** the warehouse load flow SHALL complete successfully without requiring manual schema repair steps

### Requirement: Warehouse ETL SHALL log execution outcome clearly
The system SHALL log enough information to show ETL progress, including source reading steps and successful table-load completion.

#### Scenario: ETL logs make load progress visible
- **WHEN** the ETL pipeline runs
- **THEN** the execution logs SHALL make the main import steps and completion state visible to the operator
