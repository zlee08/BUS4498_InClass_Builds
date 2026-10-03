# Validate data and privacy Task Specification

## Basic Information

- Task ID: T2
- Task name: Validate data and privacy
- Automation level: L1
- Task owner: CPVC privacy/data steward
- Human deadline: Complete before T3 begins or before the next planning run.

## 1. Task Description

Check the T1 planning snapshot for completeness, freshness, duplicates, valid ranges, and minimum-necessary use of participant information. Remove or mask fields that are not needed for planning.

## 2. Inputs

- T1 planning snapshot with source timestamps, record counts, and collection warnings.
- Event capacity and lifecycle status.
- Approved privacy rules and the minimum data fields required for forecasting and reminders.

## 3. Outputs

- Validated planning dataset containing only approved planning fields.
- Validation report listing corrected values, excluded records, stale sources, missing fields, and privacy exceptions.
- Validation status: passed, passed with warnings, or blocked.
- Handoff to T3 when usable; handoff to the CPVC privacy/data steward when a privacy rule is unclear or required data is missing.

## 4. Planned Tools

### validate_and_minimize_data

- Tool purpose: Apply deterministic data-quality and privacy checks to the T1 snapshot.
- Inputs and outputs: Receives the snapshot and approved rules; returns the minimized dataset and validation report.
- Implementation route: Validation rules in the planning workflow plus an approved data-cleaning function.
- Integration approach: Run checks before any forecasting or participant communication step.
- Task role: Validate and minimize; never infer consent or override a privacy exception.
- Timeout: 5 minutes.
- Maximum retries: 1.
- Retry only when: The validation service fails transiently; do not retry rule failures as if they were technical failures.
- Failure handoff: CPVC privacy/data steward receives the blocked field, rule, source, and recommended human decision.

## 5. Stop and Handoff Rules

Stop if required fields cannot be validated, a privacy exception is unresolved, or records cannot be minimized safely. Do not pass blocked data to T3 or T5.
