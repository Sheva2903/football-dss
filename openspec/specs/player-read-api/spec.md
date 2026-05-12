## ADDED Requirements

### Requirement: Player read API SHALL expose a player list endpoint
The system SHALL expose a player list endpoint under the versioned API backed by the current recruitment mart and related warehouse joins.

#### Scenario: Player list succeeds with stable JSON
- **WHEN** a client requests the player list endpoint with valid query parameters
- **THEN** the API SHALL return a successful JSON response containing player list data in a stable structure

### Requirement: Player read API SHALL expose a player detail endpoint
The system SHALL expose a player detail endpoint under the versioned API for a single player backed by the current recruitment mart and related warehouse joins.

#### Scenario: Player detail succeeds for an existing player
- **WHEN** a client requests the player detail endpoint for an existing player id
- **THEN** the API SHALL return a successful JSON response containing that player's detail data

### Requirement: Player read API SHALL validate request input before querying
The system SHALL validate player list filters and player id parameters before executing repository queries.

#### Scenario: Invalid query parameters are rejected
- **WHEN** a client sends invalid player list query parameters
- **THEN** the API SHALL return a 400 response with useful validation error information

#### Scenario: Invalid player id is rejected
- **WHEN** a client sends an invalid player id parameter
- **THEN** the API SHALL return a 400 response with useful validation error information

### Requirement: Player read API SHALL return not found for missing players
The system SHALL distinguish between invalid player ids and valid-but-missing players.

#### Scenario: Missing player returns not found
- **WHEN** a client requests the player detail endpoint for a valid player id that does not exist in the current read model
- **THEN** the API SHALL return a 404 response

### Requirement: Player read API SHALL support the initial player filters needed by Phase 5
The system SHALL support the initial player list filters needed for the read API phase, including position, club, age, market value, pagination, and supported sorting.

#### Scenario: Filtered player list succeeds
- **WHEN** a client requests the player list endpoint with supported filters and sorting options
- **THEN** the API SHALL apply those supported filters and sorting rules to the player read result
