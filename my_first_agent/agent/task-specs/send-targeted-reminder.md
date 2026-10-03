# Send targeted reminder Task Specification

## Basic Information

- Task ID: T5
- Task name: Send targeted reminder
- Automation level: L1
- Task owner: CPVC communications coordinator
- Human deadline: Send only during the approved reminder window.

## 1. Task Description

Send an approved, targeted reminder only to recipients returned as eligible by D2. Record delivery outcomes and avoid duplicate or unauthorized messages.

## 2. Inputs

- D2 yes decision and eligible recipient set.
- Approved reminder content and event details.
- Participant communication preferences and provider routing information.
- Prior delivery status to prevent duplicate sends.

## 3. Outputs

- Delivery record for each attempted recipient: sent, delivered, failed, or not sent.
- Message timestamp, provider response, and response window.
- Handoff to T6 with aggregate reminder status; delivery failures remain visible as exceptions.

## 4. Planned Tools

### send_targeted_reminder

- Tool purpose: Submit the approved reminder to the communication provider for each D2-eligible recipient.
- Inputs and outputs: Receives minimal recipient routing data and approved content; returns provider message IDs and delivery outcomes.
- Implementation route: Approved email or messaging provider integration.
- Integration approach: Use an idempotency key per event, reminder window, and recipient to prevent duplicates.
- Task role: Execute an already-authorized send; do not expand the recipient set or alter consent.
- Timeout: 3 minutes per provider batch.
- Maximum retries: 2.
- Retry only when: The provider confirms that no message was accepted and the failure is transient.
- Failure handoff: CPVC communications coordinator receives provider responses and the affected recipients; uncertain sends are marked unknown, not sent again automatically.

## 5. Stop and Handoff Rules

Stop if D2 is not yes, content is not approved, or provider acceptance is uncertain. Pass all outcomes to T6 without claiming that failed or unknown messages were delivered.
