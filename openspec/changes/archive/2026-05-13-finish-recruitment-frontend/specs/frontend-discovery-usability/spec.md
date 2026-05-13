## ADDED Requirements

### Requirement: Discovery frontend SHALL prioritize readable recruiter scanning
The frontend SHALL present the main discovery experience in a readable structure where filters, shortlist, and rankings are easy to scan without the page feeling dominated by decorative or secondary UI.

#### Scenario: Discovery page opens with readable section hierarchy
- **WHEN** a user opens the discovery page
- **THEN** the system SHALL render a clear section hierarchy for discovery controls, shortlist, and rankings

### Requirement: Discovery frontend SHALL remove non-essential live-status UI from the main header
The frontend SHALL not display the database/live status badge in the primary discovery header.

#### Scenario: Discovery header avoids live-status noise
- **WHEN** a user views the discovery page header
- **THEN** the system SHALL not show the database/live status box in that header area

### Requirement: Discovery frontend SHALL render shortlist as a dedicated long section
The frontend SHALL render shortlist as a dedicated section that is visually more substantial than a small sidebar list.

#### Scenario: Shortlist is promoted beyond the sidebar pattern
- **WHEN** shortlist results are available
- **THEN** the system SHALL display them in a dedicated longer section instead of a compressed left-rail block

### Requirement: Discovery frontend SHALL keep current filter capabilities while improving readability
The frontend SHALL preserve the current ranking filter capabilities while presenting them in a clearer and less dominant layout.

#### Scenario: Recruiter applies supported discovery filters
- **WHEN** a user changes supported evidence, reliability, position, club, age, budget, or sorting filters and applies them
- **THEN** the system SHALL refresh discovery results using those supported filter values

### Requirement: Discovery frontend SHALL keep rankings readable as a decision surface
The frontend SHALL present ranking results with strong scanability for player identity, club, market value, and DSS context.

#### Scenario: Rankings are shown as recruiter-readable results
- **WHEN** the rankings request succeeds
- **THEN** the system SHALL render ranking results in a format that clearly exposes player, club, market, and score information

### Requirement: Discovery frontend SHALL preserve navigation into player analysis
The frontend SHALL allow users to move from shortlist or rankings into the player analysis route.

#### Scenario: Discovery result opens player analysis
- **WHEN** a user selects a shortlist item or ranking result
- **THEN** the system SHALL navigate to `/players/:id` for that player

### Requirement: Discovery frontend SHALL remain usable during loading, empty, and error states
The frontend SHALL render readable loading, empty, and error states for discovery sections.

#### Scenario: Discovery data is unavailable or empty
- **WHEN** shortlist or rankings are loading, empty, or fail to load
- **THEN** the system SHALL render a corresponding readable state instead of broken or ambiguous UI
