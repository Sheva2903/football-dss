## ADDED Requirements

### Requirement: Shortlist read API SHALL expose a shortlist endpoint
The system SHALL expose a shortlist endpoint under the versioned API built on the same ranking logic as the rankings endpoint.

#### Scenario: Shortlist endpoint succeeds
- **WHEN** a client requests the shortlist endpoint with valid input
- **THEN** the API SHALL return a successful JSON response containing shortlist data

### Requirement: Shortlist read API SHALL preserve ranking semantics
The system SHALL use the same core DSS ranking logic as the rankings endpoint instead of a separate shortlist algorithm.

#### Scenario: Shortlist uses ranking-based results
- **WHEN** the shortlist endpoint is executed
- **THEN** the result SHALL be derived from the same ranking logic used by the rankings endpoint

### Requirement: Shortlist read API SHALL apply shortlist-oriented defaults
The system SHALL apply shortlist-oriented defaults such as a tighter default limit while still allowing supported overrides.

#### Scenario: Shortlist uses shortlist defaults
- **WHEN** a client requests the shortlist endpoint without overriding shortlist-specific defaults
- **THEN** the API SHALL use the configured shortlist defaults in the response

### Requirement: Shortlist read API SHALL return stable JSON responses
The system SHALL keep shortlist responses structurally stable so frontend consumers can rely on their shape.

#### Scenario: Shortlist response shape is predictable
- **WHEN** the shortlist endpoint responds successfully
- **THEN** the JSON structure SHALL be consistent across requests of the same endpoint
