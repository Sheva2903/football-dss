# score-explanation-read-api Specification

## Purpose
TBD - created by archiving change add-score-explanation-api. Update Purpose after archive.
## Requirements
### Requirement: Score explanation read API SHALL expose a player score explanation endpoint
The system SHALL expose a score explanation endpoint under the versioned API for an individual player backed by the current recruitment mart and related warehouse joins.

#### Scenario: Score explanation endpoint succeeds for a valid player
- **WHEN** a client requests the score explanation endpoint for an existing player with valid input
- **THEN** the API SHALL return a successful JSON response containing that player's score explanation data

### Requirement: Score explanation read API SHALL support explanation context selection
The system SHALL support `evidenceWindow` values `last_season`, `last_3_seasons`, and `last_5_seasons` and reliability levels `Low`, `Medium`, and `High` as validated explanation query inputs with defaults.

#### Scenario: Score explanation applies selected explanation context
- **WHEN** a client requests the score explanation endpoint with a supported evidence window and reliability level
- **THEN** the API SHALL use that context to return the active evidence fields and reliability threshold information in the response

### Requirement: Score explanation read API SHALL return explanation-friendly score breakdown fields
The system SHALL return enough structured score context for the player to be explained from the API response alone.

#### Scenario: Score explanation includes score components and evidence
- **WHEN** a client requests the score explanation endpoint successfully
- **THEN** the response SHALL include player identity fields, final DSS score, component scores, active-window evidence fields, and reliability context

### Requirement: Score explanation read API SHALL surface score formula context
The system SHALL expose the score formula context used by the DSS so clients can understand how the final score is composed.

#### Scenario: Score explanation includes formula context
- **WHEN** a client requests the score explanation endpoint successfully
- **THEN** the response SHALL include the score weights or equivalent structured formula information used to interpret the final DSS score

### Requirement: Score explanation read API SHALL reject invalid explanation input
The system SHALL validate player id and explanation query parameters before repository queries run.

#### Scenario: Invalid explanation input is rejected
- **WHEN** a client sends an invalid player id or unsupported explanation query parameter
- **THEN** the API SHALL return a 400 response with useful validation error information

### Requirement: Score explanation read API SHALL return not found for missing players
The system SHALL return a not-found response when the requested player id does not exist in the explanation read surface.

#### Scenario: Missing player explanation returns not found
- **WHEN** a client requests the score explanation endpoint for a validly formatted but missing player id
- **THEN** the API SHALL return a 404 response indicating that the player was not found

