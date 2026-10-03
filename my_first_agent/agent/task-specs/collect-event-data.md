# Collect event data Task Specification

## Basic Information

- Task ID: T1
- Task name: Collect event data
- Automation level: L1
- Task owner: CPVC planning coordinator
- Human deadline: Complete before the scheduled planning run.

## 1. Task Description

Collect the current event, registration, cancellation, confirmation, and historical attendance inputs needed for planning. Preserve source timestamps and distinguish missing data from zero values.

## 2. Inputs

- Event record: event date, capacity, location, and current lifecycle status from the event-management system.
- Registration and cancellation records: current participant records, cancellations, and confirmation responses from the registration system.
- Historical attendance inputs: approved historical attendance rates for comparable events.
- Planning-run context: run timestamp and the last successful collection timestamp.

## 3. Outputs

- Dated planning snapshot containing the retrieved inputs, source timestamps, record counts, and any missing or stale fields.
- Collection status indicating complete, partially complete, or failed.
- Handoff to T2 with the snapshot and collection warnings; do not invent missing values.

## 4. Planned Tools

### retrieve_event_data

- Tool purpose: Read the event-management, registration, and approved historical-attendance sources.
- Inputs and outputs: Receives the event identifier and run timestamp; returns source records, counts, timestamps, and retrieval errors.
- Implementation route: Direct system integrations or approved read-only exports.
- Integration approach: Query each source independently and combine results using the event identifier.
- Task role: Gather facts only; do not validate privacy or make attendance decisions.
- Timeout: 5 minutes per source.
- Maximum retries: 2.
- Retry only when: The source reports a transient timeout or connection failure.
- Failure handoff: CPVC planning coordinator receives the source, error, and last successful timestamp.

## 5. Stop and Handoff Rules

Stop when all available sources have been read or a source failure has been recorded. Never mark collection complete when a required source is unavailable. Pass the snapshot to T2 for validation.
