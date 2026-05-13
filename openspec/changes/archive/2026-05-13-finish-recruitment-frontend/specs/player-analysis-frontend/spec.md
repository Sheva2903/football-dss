## ADDED Requirements

### Requirement: Player analysis frontend SHALL provide a real analysis page
The frontend SHALL provide a working player-analysis page at `/players/:id` instead of a placeholder route.

#### Scenario: Player analysis route loads real content
- **WHEN** a user opens `/players/:id`
- **THEN** the system SHALL render player-analysis content backed by existing backend APIs

### Requirement: Player analysis frontend SHALL load player summary context
The analysis page SHALL load and display the selected player's core summary information from the player detail endpoint.

#### Scenario: Player identity and context are shown
- **WHEN** the player detail request succeeds
- **THEN** the system SHALL render the selected player's identity and key contextual fields in the analysis page

### Requirement: Player analysis frontend SHALL explain the DSS score in readable sections
The analysis page SHALL use the score explanation endpoint to present the DSS score and its components in a readable explanation flow.

#### Scenario: Score explanation is rendered for the selected player
- **WHEN** the score explanation request succeeds
- **THEN** the system SHALL show readable score breakdown content for the selected player

### Requirement: Player analysis frontend SHALL show evidence context for the active scouting lens
The analysis page SHALL present evidence-window and reliability context in a readable form tied to the active scouting lens.

#### Scenario: Evidence context is visible in analysis
- **WHEN** the analysis page loads score explanation data
- **THEN** the system SHALL show the evidence-window and reliability context used for that analysis

### Requirement: Player analysis frontend SHALL show similar alternatives as a usable comparison section
The analysis page SHALL display similar alternatives returned by the backend in a readable comparison section.

#### Scenario: Similar alternatives are available
- **WHEN** the similar alternatives request succeeds
- **THEN** the system SHALL render alternatives in a form that allows practical comparison and follow-up navigation

### Requirement: Player analysis frontend SHALL support player-to-player pivoting
The analysis page SHALL let users move from one player to another through the alternatives section.

#### Scenario: User pivots from one player to an alternative
- **WHEN** a user selects an alternative from the analysis page
- **THEN** the system SHALL navigate to that alternative player's analysis route

### Requirement: Player analysis frontend SHALL support return to discovery
The analysis page SHALL allow the user to return to the discovery experience.

#### Scenario: User returns from analysis to discovery
- **WHEN** a user chooses to go back from the analysis page
- **THEN** the system SHALL navigate back to the discovery page

### Requirement: Player analysis frontend SHALL remain readable during loading, empty, and error states
The analysis page SHALL render readable loading, empty, and error states while its data is being fetched or if requests fail.

#### Scenario: Analysis data is unavailable
- **WHEN** player detail, score explanation, or alternatives are loading, empty, or fail
- **THEN** the system SHALL render a corresponding readable state instead of a placeholder or broken UI
