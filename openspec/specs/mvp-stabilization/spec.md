# mvp-stabilization Specification

## Purpose
TBD - created by archiving change stabilize-mvp-test-pass-and-cleanup. Update Purpose after archive.
## Requirements
### Requirement: MVP stabilization SHALL provide a usable verification command
The system SHALL provide a real developer-facing verification command for the current integration test surface instead of a placeholder test script.

#### Scenario: Verification command runs the integration checks
- **WHEN** a developer runs the documented test command for the backend
- **THEN** the project SHALL execute the current MVP verification tests rather than returning a placeholder message

### Requirement: MVP stabilization SHALL document the canonical run flow
The system SHALL provide a concise top-level run guide covering the implemented backend workflow.

#### Scenario: Run guide covers core workflow
- **WHEN** a developer reads the top-level backend run guide
- **THEN** it SHALL explain how to start dependencies, run migrations, refresh warehouse and mart data, start the API, open Swagger, and run the verification command

### Requirement: MVP stabilization SHALL preserve high-value MVP endpoint verification
The system SHALL keep high-value integration verification for the core MVP endpoint surface.

#### Scenario: Core endpoint verification remains available
- **WHEN** a developer runs the verification command
- **THEN** the backend SHALL verify the core MVP read surfaces needed for the finished project

### Requirement: MVP stabilization SHALL keep the repo free of leftover implementation artifacts
The system SHALL remove or tighten temporary, misleading, or inconsistent developer-facing artifacts that remain from earlier build phases.

#### Scenario: Developer-facing artifacts reflect actual behavior
- **WHEN** a developer uses the documented scripts and entry points
- **THEN** they SHALL reflect the actual implemented backend behavior instead of placeholder or stale workflow information

