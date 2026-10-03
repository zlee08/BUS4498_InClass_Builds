# Evaluate forecast accuracy Task Specification

## Basic Information

- Task ID: T8
- Task name: Evaluate forecast accuracy
- Automation level: L2
- Task owner: CPVC planning coordinator
- Human deadline: Complete after T7 reconciliation.

## 1. Task Description

Compare the attendance forecast with verified actual attendance and summarize forecast error, resource-planning variance, reminder response, and exceptions for the next planning cycle.

## 2. Inputs

- T3 forecast point estimate, bounds, confidence, and assumptions.
- T7 verified actual-attendance count and reconciliation exceptions.
- T4 resource plan and actual resource-use records.
- T5 reminder delivery and response outcomes, when a reminder was sent.
- Event identifier, event date, and source timestamps.

## 3. Outputs

- Forecast accuracy report with absolute error, direction of error, and error relative to capacity or attendance.
- Resource variance summary comparing planned and actual use.
- Reminder response and delivery summary, with unknown outcomes kept separate.
- Lessons, data-quality exceptions, and versioned inputs for the next planning run.
- Handoff to C2 as the event-lifecycle evaluation output.

## 4. Planned Tools

### evaluate_forecast_accuracy

- Tool purpose: Calculate forecast error and summarize planning, resource, and communication outcomes.
- Inputs and outputs: Receives forecast, verified actuals, plan, resource use, and delivery results; returns a versioned evaluation report.
- Implementation route: Approved statistical calculations and aggregate reporting function.
- Integration approach: Join records by event identifier and forecast version; exclude unresolved records from definitive metrics and label them.
- Task role: Evaluate outcomes; do not rewrite the original forecast or retroactively change check-ins.
- Timeout: 5 minutes.
- Maximum retries: 2.
- Retry only when: A calculation or report service fails transiently; do not retry unresolved data exceptions as technical errors.
- Failure handoff: CPVC planning coordinator receives the input identifiers, failed metric, and partial-report status.

## 5. Stop and Handoff Rules

Stop if T7 has no verified actuals or if the forecast and event cannot be matched confidently. Preserve the original inputs and report the evaluation as pending rather than fabricating accuracy measures.
