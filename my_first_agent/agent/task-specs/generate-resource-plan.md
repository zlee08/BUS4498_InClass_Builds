# Generate resource plan Task Specification

## Basic Information

- Task ID: T4
- Task name: Generate resource plan
- Automation level: L2
- Task owner: CPVC planning coordinator
- Human deadline: Complete after a usable T3 forecast or an explicit H1 approval.

## 1. Task Description

Translate the approved attendance forecast into recommended resource quantities, including a documented safety margin and the risks of overage or shortage.

## 2. Inputs

- T3 forecast package and D1 decision record.
- H1 approval and corrected assumptions when D1 was no.
- Event capacity and approved resource-per-attendee rules.
- Current inventory or availability, when maintained by the event system.

## 3. Outputs

- Resource plan with recommended quantities, calculation basis, safety margin, and expected shortage/overage risk.
- Assumption and exception list.
- Handoff to D2 for reminder eligibility and to T6 for brief preparation.

## 4. Planned Tools

### generate_resource_plan

- Tool purpose: Calculate resource quantities from the approved forecast and resource rules.
- Inputs and outputs: Receives attendance forecast, capacity, inventory, and rule configuration; returns quantities, margin, and risk indicators.
- Implementation route: Deterministic planning formulas and approved inventory lookup.
- Integration approach: Preserve the forecast identifier and show the calculation inputs with every recommendation.
- Task role: Generate recommendations; do not place orders or alter inventory.
- Timeout: 5 minutes.
- Maximum retries: 2.
- Retry only when: Inventory lookup or calculation service fails transiently.
- Failure handoff: CPVC planning coordinator receives the failed input or service and the last valid plan.

## 5. Stop and Handoff Rules

Stop if no approved forecast exists, the resource rules are missing, or inventory data is stale beyond its allowed age. Do not silently substitute quantities.
