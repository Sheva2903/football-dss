## Why

The current Express project is still a learning scaffold built around a toy `clubs/players/player_stats` schema, while the real football DSS is based on a warehouse-and-mart data model. Before building ETL, ranking, and recommendation features, the backend needs a clean foundation and a real database shape that match the system we actually want to build.

## What Changes

- Reset the backend foundation so the app uses an `api/v1` structure, centralized error handling, environment validation, and dependencies suited for the real DSS backend.
- Retire the current toy schema usage and stop treating the existing player/club routes as the target domain model.
- Add Sequelize migration support for controlled schema evolution.
- Create the initial `warehouse` schema and core dimension/fact tables needed for the DSS pipeline.
- Add the indexes and migration structure needed for later ETL and mart work.

## Capabilities

### New Capabilities
- `backend-foundation`: Establish the base Express backend structure, validation, error handling, and migration tooling for the DSS rebuild.
- `warehouse-schema`: Define the initial PostgreSQL warehouse schema and migration-backed table creation for the football DSS pipeline.

### Modified Capabilities
- None.

## Impact

- Affected code: app bootstrap, routing structure, environment config, database setup, and migration workflow.
- Affected database: replaces reliance on the current toy schema with the first real `warehouse.*` schema.
- Affected dependencies: adds Sequelize migration tooling, validation, logging, and API-documentation-related packages.
- Follow-on work enabled: CSV import, mart build, ranking endpoints, and recommendation services.
