## ADDED Requirements

### Requirement: Warehouse schema SHALL exist for DSS source data
The system SHALL create a PostgreSQL `warehouse` schema to hold normalized source data for the football DSS pipeline.

#### Scenario: Warehouse namespace is created
- **WHEN** database migrations are applied
- **THEN** the database SHALL contain a `warehouse` schema

### Requirement: Warehouse schema SHALL define core dimension tables
The system SHALL create dimension tables for date, competitions, clubs, and players within the `warehouse` schema.

#### Scenario: Core dimensions are available after migration
- **WHEN** migrations complete successfully
- **THEN** the database SHALL contain `warehouse.dim_date`, `warehouse.dim_competitions`, `warehouse.dim_clubs`, and `warehouse.dim_players`

### Requirement: Warehouse schema SHALL define core fact tables
The system SHALL create fact tables for matches, player performance, and player valuations within the `warehouse` schema.

#### Scenario: Core facts are available after migration
- **WHEN** migrations complete successfully
- **THEN** the database SHALL contain `warehouse.fact_matches`, `warehouse.fact_player_performance`, and `warehouse.fact_player_valuations`

### Requirement: Warehouse schema SHALL enforce key relational constraints
The system SHALL define primary keys and foreign-key relationships needed to preserve the integrity of the initial warehouse model.

#### Scenario: Fact tables reference required dimensions
- **WHEN** the warehouse tables are created
- **THEN** fact tables SHALL include the primary key and foreign-key relationships required by the initial DSS warehouse design

### Requirement: Warehouse schema SHALL include indexes needed for initial ETL and read paths
The system SHALL create baseline indexes for the initial warehouse model so later ETL and mart work do not start from an unindexed schema.

#### Scenario: Baseline indexes exist after migration
- **WHEN** migrations complete successfully
- **THEN** the warehouse schema SHALL include the indexes defined for the initial ETL and read access paths
