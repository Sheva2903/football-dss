## ADDED Requirements

### Requirement: Rankings and shortlist frontend SHALL provide a recruiter discovery page
The frontend SHALL provide a recruiter discovery page that combines broad candidate exploration with a dedicated shortlist section.

#### Scenario: Discovery page renders both discovery surfaces
- **WHEN** a user opens the discovery page
- **THEN** the system SHALL show a rankings surface and a separate shortlist surface on the same page

### Requirement: Rankings and shortlist frontend SHALL load lookup-driven filters
The discovery page SHALL load clubs and positions from backend lookup endpoints and use them in recruiter filter controls.

#### Scenario: Lookup filters are populated from backend data
- **WHEN** the discovery page loads successfully
- **THEN** the system SHALL populate club and position filter controls using backend lookup responses

### Requirement: Rankings and shortlist frontend SHALL apply an explicit scouting lens
The discovery page SHALL let users edit filters locally and apply them explicitly to refresh rankings and shortlist data.

#### Scenario: Filters apply on explicit action
- **WHEN** a user changes the scouting filters and submits the filter action
- **THEN** the system SHALL request refreshed discovery data using the applied filter values

### Requirement: Rankings and shortlist frontend SHALL display ranking results from the rankings API
The discovery page SHALL display rankings returned by the backend rankings endpoint, including summary fields needed for recruiter scanning.

#### Scenario: Rankings results are shown with recruiter-facing summary fields
- **WHEN** the rankings request succeeds
- **THEN** the system SHALL render ranking rows that expose the returned player identity, club, market value, and DSS score context

### Requirement: Rankings and shortlist frontend SHALL display shortlist as a dedicated section
The discovery page SHALL display shortlist results in a dedicated section backed by the shortlist endpoint rather than only as a visual variant of rankings.

#### Scenario: Shortlist is rendered as a separate discovery section
- **WHEN** the shortlist request succeeds
- **THEN** the system SHALL render shortlist results in a separate section distinct from the rankings list

### Requirement: Rankings and shortlist frontend SHALL support pagination for ranking results
The discovery page SHALL let users move through ranking pages without losing the current applied scouting lens.

#### Scenario: Ranking pagination preserves the applied filters
- **WHEN** a user requests the next or previous rankings page
- **THEN** the system SHALL request rankings using the current applied filter values and the new pagination offset

### Requirement: Rankings and shortlist frontend SHALL navigate users into player analysis
The discovery page SHALL let users move from rankings or shortlist results into the player-analysis route for a selected player.

#### Scenario: Discovery selection opens player analysis route
- **WHEN** a user activates a ranking row or shortlist item
- **THEN** the system SHALL navigate to `/players/:id` for the selected player

### Requirement: Rankings and shortlist frontend SHALL present stable loading, empty, and error states
The discovery page SHALL present clear loading, empty, and error states for recruiter-facing data sections.

#### Scenario: Ranking or shortlist data is unavailable
- **WHEN** a discovery request is loading, returns no items, or fails
- **THEN** the system SHALL render a corresponding loading, empty, or error state instead of broken UI
