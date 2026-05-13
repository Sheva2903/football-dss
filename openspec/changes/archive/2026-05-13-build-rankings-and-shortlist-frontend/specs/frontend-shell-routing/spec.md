## ADDED Requirements

### Requirement: Frontend shell SHALL provide route-based navigation for recruiter pages
The frontend SHALL provide route-based navigation for the recruiter application, with the discovery page available at `/` and player-analysis navigation targets available at `/players/:id`.

#### Scenario: Discovery route loads
- **WHEN** a user opens the frontend root route `/`
- **THEN** the system SHALL render the recruiter discovery page instead of the default Vite starter content

#### Scenario: Player-analysis route is addressable
- **WHEN** a user navigates to `/players/:id`
- **THEN** the system SHALL render a valid frontend route target for that player identifier

### Requirement: Frontend shell SHALL expose shared recruiter navigation controls
The frontend SHALL expose a shared application shell that makes recruiter navigation and global actions available across recruiter pages.

#### Scenario: Shell renders recruiter-wide controls
- **WHEN** a user views the discovery page
- **THEN** the system SHALL show shared shell elements such as the app heading and access to API documentation

### Requirement: Frontend shell SHALL centralize backend request handling
The frontend SHALL use shared request helpers for backend communication rather than scattering raw request construction across unrelated components.

#### Scenario: Discovery page loads through shared request utilities
- **WHEN** the discovery page requests health, lookup, ranking, or shortlist data
- **THEN** the system SHALL perform those requests through shared frontend API utilities
