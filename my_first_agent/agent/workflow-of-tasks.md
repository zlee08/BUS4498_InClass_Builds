# Workflow of Tasks

*Replace all bracketed prompts with information specific to your proposed system. Delete instructional text that does not belong in your final specification. Add or remove task sections as needed. Every task shown in the general workflow must have a corresponding task specification below.*

## 1. Workflow Overview
### 1.1 Workflow Goal
This workflow supports the system goal defined in `my_first_agent/README.md`.

### 1.2 Workflow Trigger

The workflow starts when an organizer requests an updated attendance estimate or when the scheduled daily planning run occurs during the registration period. It also starts at the event-day check-in window so the system can reconcile forecasts with actual attendance.

### 1.3 Completion Condition at Runtime

A planning run is complete when the system has produced a dated attendance estimate with an uncertainty range, generated a resource recommendation, recorded any required organizer decision, and either sent an allowed targeted reminder or determined that no reminder is needed. The event lifecycle is complete after check-in data is reconciled and the forecast-accuracy summary is saved.

### 1.4 General Workflow

The system collects current registrations, cancellations, confirmation responses, event details, and relevant historical attendance rates. It validates data quality, removes unnecessary personal information from the planning dataset, estimates likely attendance with an uncertainty range, and translates that estimate into recommended quantities for food, drinks, and swag. The workflow produces an organizer-facing brief that identifies the estimate, confidence level, assumptions, and recommended actions.

If the data is incomplete, stale, inconsistent, or below the confidence threshold, the system routes the assumptions and proposed estimate to an organizer for review before publishing the recommendation. If a participant update is needed and the participant has not exceeded the communication limit, the system sends one targeted confirmation or reminder; otherwise, it records that no message is needed. On event day, check-ins are reconciled with the latest forecast, and the system records forecast error and resource-planning performance for future events.


### 1.5 Workflow Diagram

```mermaid
flowchart TD
    T1["T1: Collect event data"] --> T2["T2: Validate data and privacy"]
    T2 --> T3["T3: Estimate likely attendance"]
    T3 --> D1{"D1: Is forecast confidence sufficient?"}

    D1 -->|Yes| T4["T4: Generate resource plan"]
    D1 -->|No| H1["H1: Organizer reviews assumptions"]
    H1 --> T3

    T4 --> D2{"D2: Is a reminder due and allowed?"}
    D2 -->|Yes| T5["T5: Send targeted reminder"]
    D2 -->|No| T6["T6: Publish organizer brief"]
    T5 --> T6

    T6 --> D3{"D3: Has event-day check-in begun?"}
    D3 -->|No| C1(["C1: Planning run complete; schedule next run"])
    D3 -->|Yes| T7["T7: Reconcile check-ins"]

    T7 --> T8["T8: Evaluate forecast accuracy"]
    T8 --> C2(["C2: Event lifecycle complete"])
```

