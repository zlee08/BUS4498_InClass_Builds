# Is a reminder due and allowed Task Specification

## Basic Information

- Task ID: D2
- Task name: Is a reminder due and allowed?
- Automation level: L1
- Task owner: CPVC communications coordinator
- Human deadline: Evaluate at the configured reminder checkpoint before T5.

## 1. Task Description

Determine whether a targeted reminder is due and permitted under the event schedule, communication policy, participant preferences, and message-frequency limits.

## 2. Inputs

- T4 resource plan and planning-run timestamp.
- Registration/confirmation status from the validated T2 dataset.
- Reminder schedule, consent/preferences, quiet hours, and maximum-message rules.
- Prior reminder delivery and response records.

## 3. Outputs

- Decision: yes or no.
- Eligible recipient set or an explicit empty-recipient result, without unnecessary personal data.
- Decision record with policy checks, timestamp, and reason.
- Route to T5 when yes; route to T6 when no.

## 4. Planned Tools

### check_reminder_eligibility

- Tool purpose: Apply reminder timing, consent, preference, quiet-hour, and frequency rules.
- Inputs and outputs: Receives minimized participant status and policy configuration; returns eligibility decision, recipient identifiers, and rule results.
- Implementation route: Deterministic communication-policy rules.
- Integration approach: Use only T2-approved fields and pass the minimum recipient data needed to T5.
- Task role: Decide eligibility under fixed rules; do not draft or send messages.
- Timeout: 2 minutes.
- Maximum retries: 0.
- Retry only when: Not applicable; technical failure requires handoff.
- Failure handoff: CPVC communications coordinator receives the failed policy check and the planned reminder checkpoint.

## 5. Stop and Handoff Rules

Treat missing consent, preference, or delivery history as not eligible until resolved. Never route to T5 on an incomplete policy evaluation.
