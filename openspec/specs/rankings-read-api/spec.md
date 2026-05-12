# rankings-read-api Specification

## Purpose
TBD - created by archiving change add-rankings-and-shortlist-api. Update Purpose after archive.
## Requirements
### Requirement: Rankings read API SHALL expose a rankings endpoint
The system SHALL expose a rankings endpoint under the versioned API backed by the current recruitment mart and related warehouse joins.

#### Scenario: Rankings endpoint succeeds with defaults
- **WHEN** a client requests the rankings endpoint without overriding evidence or reliability settings
- **THEN** the API SHALL return a successful JSON response using the default evidence-window and reliability settings

### Requirement: Rankings read API SHALL support evidence-window selection
The system SHALL support the evidence windows `last_season`, `last_3_seasons`, and `last_5_seasons` as validated ranking filters.

#### Scenario: Rankings endpoint applies selected evidence window
- **WHEN** a client requests the rankings endpoint with a supported evidence-window value
- **THEN** the API SHALL use the active mart columns for that evidence window in the returned ranking result

### Requirement: Rankings read API SHALL support reliability-level filtering
The system SHALL support `Low`, `Medium`, and `High` reliability levels as validated ranking filters.

#### Scenario: Rankings endpoint applies selected reliability level
- **WHEN** a client requests the rankings endpoint with a supported reliability-level value
- **THEN** the API SHALL apply the corresponding reliability filter for the selected evidence window

### Requirement: Rankings read API SHALL support the initial ranking filters
The system SHALL support the initial DSS ranking filters needed for this phase, including position, club, age, budget, pagination, and supported sorting.

#### Scenario: Rankings endpoint applies supported filters
- **WHEN** a client requests the rankings endpoint with supported filters and sorting options
- **THEN** the API SHALL apply those supported filters and sorting rules to the ranking result

### Requirement: Rankings read API SHALL return explanation-friendly ranking fields
The system SHALL return key score fields and active-window evidence fields in ranking responses, not just the final DSS score.

#### Scenario: Ranking response includes score context
- **WHEN** a client requests the rankings endpoint successfully
- **THEN** the response SHALL include the key score fields and active-window evidence fields defined for the ranking surface

### Requirement: Rankings read API SHALL reject invalid ranking filters
The system SHALL validate rankings query parameters before repository queries run.

#### Scenario: Invalid ranking query parameters are rejected
- **WHEN** a client sends invalid rankings query parameters
- **THEN** the API SHALL return a 400 response with useful validation error information

