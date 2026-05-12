## ADDED Requirements

### Requirement: Similar alternatives read API SHALL expose a player-specific alternatives endpoint
The system SHALL expose a similar-alternatives endpoint under the versioned API for an individual player backed by mart data and related warehouse joins.

#### Scenario: Similar alternatives endpoint succeeds for a valid player
- **WHEN** a client requests the similar-alternatives endpoint for an existing player with valid input
- **THEN** the API SHALL return a successful JSON response containing the target player summary and recommended alternatives

### Requirement: Similar alternatives read API SHALL support recommendation context selection
The system SHALL support `evidenceWindow` values `last_season`, `last_3_seasons`, and `last_5_seasons` and reliability levels `Low`, `Medium`, and `High` as validated recommendation query inputs with defaults.

#### Scenario: Similar alternatives applies selected context
- **WHEN** a client requests the similar-alternatives endpoint with a supported evidence window and reliability level
- **THEN** the API SHALL use that context to build active-window features and reliability-threshold filtering for the recommendation result

### Requirement: Similar alternatives read API SHALL preserve the initial business filters
The system SHALL preserve the initial recommendation filters needed for this phase, including cheaper-than-target filtering, optional same-position filtering, optional budget cap, age range, minimum similarity threshold, and result limit.

#### Scenario: Similar alternatives applies supported recommendation filters
- **WHEN** a client requests the similar-alternatives endpoint with supported recommendation filters
- **THEN** the API SHALL apply those supported filters to the candidate pool before ranking the alternatives

### Requirement: Similar alternatives read API SHALL return explanation-friendly recommendation scores
The system SHALL return structured recommendation rows that include similarity, affordability, and combined alternative scores along with key identity and evidence fields.

#### Scenario: Similar alternatives includes recommendation score context
- **WHEN** a client requests the similar-alternatives endpoint successfully
- **THEN** the response SHALL include target summary fields, applied filter context, and candidate rows with explanation-friendly score fields

### Requirement: Similar alternatives read API SHALL reject invalid recommendation input
The system SHALL validate player id and recommendation query parameters before recommendation work begins.

#### Scenario: Invalid recommendation input is rejected
- **WHEN** a client sends an invalid player id or unsupported recommendation query parameter
- **THEN** the API SHALL return a 400 response with useful validation error information

### Requirement: Similar alternatives read API SHALL return not found for missing target players
The system SHALL return a not-found response when the requested player id does not exist in the recommendation read surface.

#### Scenario: Missing target player returns not found
- **WHEN** a client requests the similar-alternatives endpoint for a validly formatted but missing player id
- **THEN** the API SHALL return a 404 response indicating that the player was not found

### Requirement: Similar alternatives read API SHALL return stable empty results when no candidates match
The system SHALL return a successful stable JSON response when the target player exists but no candidates satisfy the recommendation filters.

#### Scenario: No alternatives match the filters
- **WHEN** a client requests the similar-alternatives endpoint for an existing player and the filtered candidate pool becomes empty
- **THEN** the API SHALL return a 200 response with the target summary, applied filter context, and an empty alternatives list
