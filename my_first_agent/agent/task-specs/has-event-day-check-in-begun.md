# Has event-day check-in begun Task Specification

## Basic Information

- Task ID: D3
- Task name: Has event-day check-in begun?
- Automation level: L1
- Task owner: CPVC event operations coordinator
- Human deadline: Evaluate at the event-day check-in checkpoint.

## 1. Task Description

Determine whether event-day check-in has started so the workflow can switch from planning to reconciliation.

## 2. Inputs

- Event date and current lifecycle status.
- Check-in system status and first-check-in timestamp, if present.
- T6 brief publication status and any operations status flag.

## 3. Outputs

- Decision: yes or no.
- Decision record with event-day timestamp and evidence used.
- Route to T7 when yes; route to the next scheduled planning run or C1 when no.

## 4. Planned Tools

### check_checkin_window

- Tool purpose: Apply event-date and check-in-status rules.
- Inputs and outputs: Receives event status and check-in signals; returns a yes/no decision with evidence.
- Implementation route: Deterministic event-lifecycle rules and read-only check-in status lookup.
- Integration approach: Run at the event-day checkpoint and preserve the observed status timestamp.
- Task role: Route the workflow; do not alter check-in records.
- Timeout: 1 minute.
- Maximum retries: 0.
- Retry only when: Not applicable; technical failure requires handoff.
- Failure handoff: CPVC event operations coordinator receives the missing signal and observed event status.

## 5. Stop and Handoff Rules

If the event status is inconsistent or the check-in signal is unavailable, stop routing and notify the operations coordinator. Do not assume that check-in has begun.
