# Reconcile check-ins Task Specification

## Basic Information

- Task ID: T7
- Task name: Reconcile check-ins
- Automation level: L1
- Task owner: CPVC event operations coordinator
- Human deadline: Complete after check-in closes or at the configured reconciliation checkpoint.

## 1. Task Description

Reconcile event-day check-in records with the forecast and resource plan, remove duplicate or invalid check-ins, and produce the verified actual-attendance record for evaluation.

## 2. Inputs

- Check-in records and event-lifecycle timestamps.
- T3 forecast package and T4 resource plan.
- Approved rules for duplicate, late, canceled, or invalid check-ins.
- Resource-use or inventory consumption records, when available.

## 3. Outputs

- Verified actual-attendance count and reconciliation breakdown.
- Exception list for duplicate, missing, late, or disputed records.
- Resource-use comparison and source timestamps.
- Handoff to T8 with the verified actuals and unresolved exceptions.

## 4. Planned Tools

### reconcile_checkins

- Tool purpose: Apply approved reconciliation rules and compare check-in records with planning outputs.
- Inputs and outputs: Receives check-in and planning records; returns verified counts, exceptions, and resource-use comparison.
- Implementation route: Read-only check-in integration plus deterministic reconciliation rules.
- Integration approach: Preserve raw source references while exposing only aggregate results to T8 when individual records are not needed.
- Task role: Reconcile records; do not erase source records or resolve disputed attendance without human review.
- Timeout: 5 minutes.
- Maximum retries: 1.
- Retry only when: A source read fails transiently and no partial result was committed.
- Failure handoff: CPVC event operations coordinator receives the source error, checkpoint, and partial-result status.

## 5. Stop and Handoff Rules

Stop if source records are incomplete, duplicate handling is ambiguous, or reconciliation would change source data. Preserve exceptions for human resolution and pass the verified portion to T8 only when the workflow permits partial evaluation.
