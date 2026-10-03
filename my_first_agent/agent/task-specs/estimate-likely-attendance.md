# Estimate likely attendance Task Specification

## Basic Information

- Task ID: T3
- Task name: Estimate likely attendance
- Automation level: L2
- Task owner: CPVC planning coordinator
- Human deadline: Complete during the planning run before D1 evaluates confidence.

## 1. Task Description

Estimate expected attendance from the validated planning dataset, using current confirmations, cancellations, historical attendance behavior, and event capacity. Report uncertainty explicitly.

## 2. Inputs

- Validated planning dataset from T2.
- Approved historical attendance rates for comparable events.
- Event capacity, event date, registration status, confirmation behavior, and cancellation counts.
- Any T2 warnings that affect sample size, freshness, or comparability.

## 3. Outputs

- Point estimate of likely attendance.
- Lower and upper attendance bounds, confidence level, sample-size indicator, and assumptions.
- Forecast status: usable, usable with warnings, or insufficient evidence.
- Handoff to D1 with the complete forecast package.

## 4. Planned Tools

### estimate_attendance

- Tool purpose: Apply the approved attendance-estimation method and calculate uncertainty measures.
- Inputs and outputs: Receives validated records and approved historical rates; returns point estimate, bounds, confidence, and assumptions.
- Implementation route: Approved forecasting function using the workflow’s configured model and statistical calculations.
- Integration approach: Use only T2-approved fields and preserve the input snapshot identifier in the forecast.
- Task role: Produce a forecast; do not decide whether confidence is sufficient.
- Timeout: 8 minutes.
- Maximum retries: 2.
- Retry only when: The configured forecasting service fails transiently; do not retry unchanged insufficient evidence.
- Failure handoff: CPVC planning coordinator receives the inputs, error, and last valid forecast.

## 5. Stop and Handoff Rules

Stop if T2 did not pass or if the calculation cannot produce bounds. Send the forecast package to D1, including all uncertainty and data-quality warnings.
