## ADDED Requirements

### Requirement: Lookup read API SHALL expose a clubs endpoint
The system SHALL expose a clubs lookup endpoint under the versioned API that returns stable club identity data from the current backend data model.

#### Scenario: Clubs lookup succeeds
- **WHEN** a client requests the clubs lookup endpoint
- **THEN** the API SHALL return a successful JSON response containing club lookup data

### Requirement: Lookup read API SHALL expose a positions endpoint
The system SHALL expose a positions lookup endpoint under the versioned API that returns stable position values for the current player read surface.

#### Scenario: Positions lookup succeeds
- **WHEN** a client requests the positions lookup endpoint
- **THEN** the API SHALL return a successful JSON response containing position lookup values

### Requirement: Lookup read API SHALL return stable JSON responses
The system SHALL keep lookup responses structurally stable so frontend consumers can rely on their shape.

#### Scenario: Lookup response shape is predictable
- **WHEN** a lookup endpoint responds successfully
- **THEN** the JSON structure SHALL be consistent across requests of the same endpoint
