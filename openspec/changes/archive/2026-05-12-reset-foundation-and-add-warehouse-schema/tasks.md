## 1. Foundation reset

- [x] 1.1 Remove or retire the current toy-schema-first route and schema assumptions from the active backend flow
- [x] 1.2 Add the foundational dependencies needed for migrations, validation, logging, and API documentation
- [x] 1.3 Restructure the app bootstrap around `/api/v1`, a versioned health endpoint, and centralized error handling
- [x] 1.4 Replace ad hoc environment loading with validated runtime configuration

## 2. Migration tooling

- [x] 2.1 Configure Sequelize and Sequelize CLI for migration-based schema management
- [x] 2.2 Add the initial migration that creates the `warehouse` schema

## 3. Warehouse schema

- [x] 3.1 Add dimension-table migrations for date, competitions, clubs, and players
- [x] 3.2 Add fact-table migrations for matches, player performance, and player valuations
- [x] 3.3 Add required relational constraints and baseline indexes for the initial warehouse model

## 4. Verification

- [x] 4.1 Verify the application boots and the versioned health endpoint works against the new foundation
- [x] 4.2 Verify migrations run cleanly from an empty database and produce the expected `warehouse.*` tables
