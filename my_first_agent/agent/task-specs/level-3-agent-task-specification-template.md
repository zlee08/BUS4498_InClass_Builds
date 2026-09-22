# Publish organizer brief Task Specification

Create one copy of this template for each Level 3 task identified in class (For this in-class build practice, having one Level 3 task is sufficient).

Save each copy in `my_first_agent/agent/task-specs/`. Rename the file using the task name in lowercase, with hyphens between words. Replace `&` with `and` and remove other punctuation.

Examples:

- `Grade Item Condition` becomes `grade-item-condition.md`
- `Customer Dispute & Compensation Assessment` becomes `customer-dispute-and-compensation-assessment.md`

Keep the **exact** task ID and task name from `workflow-of-tasks.md` inside the file. Replace all bracketed prompts. Leave Section 3 empty; tool permissions and boundaries will be added next week. 

*Remove this sentence and the instructions above before your submission.*

```yaml
# BASIC INFORMATION
task_id: "T6"
task_name: "Publish organizer brief"
task_owner: "CPVC event organizer (Sam Otto)"
# Agent Inference Configuration
Provider: OpenAI
Model: "gpt-5.1"
Role: "Synthesize the latest planning outputs into an organizer-ready brief, identify missing or conflicting evidence, and route unresolved decisions for human review."
Maximum inference requests per task run: "8"
On inference failure or exhausted limits: "Record the unresolved status and hand the case to the CPVC event organizer."
```

## 1. Task Goal

- **Objective:** Produce a concise, actionable organizer brief that combines the latest attendance forecast, uncertainty range, assumptions, confidence level, resource plan, and required human decisions so CPVC organizers can approve or revise the recommendation before the planning run closes.


## 2. Inbound Inputs

### Input 1

- **Input name:** Validated planning dataset
- **What it contains:**  A dated planning snapshot containing current registration, cancellation, confirmation, event-detail, data-quality, and privacy-validation results.
- **Source:** T2: Validate data and privacy

### Input 2

- **Input name:** Attendance forecast
- **What it contains:** Predicted attendance, lower and upper bounds, confidence level, key assumptions, data-freshness indicators, and model-check results.
- **Source:** T3: Estimate likely attendance

### Input 3

- **Input name:** Resource plan
- **What it contains:** Recommended quantities for food, drinks, and swag, the safety margin, and expected overage or shortage risk.
- **Source:** T4: Generate resource plan

### Input 4

- **Input name:** Reminder status
- **What it contains:** Whether a targeted reminder was sent, skipped, or blocked by communication preferences or the message limit, together with any delivery record.
- **Source:** D2: Is a reminder due and allowed? and T5: Send targeted reminder

### Input 5

- **Input name:** Organizer review decision
- **What it contains:** Any approved, corrected, or rejected assumptions and the organizer's reason for the decision.
- **Source:** H1: Organizer reviews assumptions

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

The agent may choose, repeat, skip, or combine the permitted subtasks based on the most important remaining uncertainty. It must not follow a fixed sequence when the inputs show that another permitted subtask would resolve the issue more effectively.

### Permitted Subtask 1

- **Subtask name:** Inspect planning outputs
- **Subtask description:** Examine the validated dataset, forecast, resource plan, reminder status, and organizer decision for freshness, completeness, and internal consistency. Produce a list of confirmed facts and open questions.
- **Subtask boundary:** May read and compare workflow outputs. May not change source records, infer missing participant details, or send messages.
- **Retry limits:** Attempt at most 2 times when a source is temporarily unavailable or returns an incomplete response.

### Permitted Subtask 2

- **Subtask name:** Reconcile brief findings
- **Subtask description:** Compare the forecast, uncertainty range, assumptions, confidence level, resource quantities, and reminder status. Identify contradictions, unsupported claims, or decisions that must be surfaced to the organizer.
- **Subtask boundary:** May resolve formatting and arithmetic inconsistencies that are directly supported by the inputs. May not silently override a forecast, change a threshold, or invent evidence.
- **Retry limits:** Attempt at most 2 times after obtaining a corrected or newly available input.

### Permitted Subtask 3

- **Subtask name:** Draft organizer brief
- **Subtask description:** Create a concise brief that states the forecast, uncertainty range, confidence level, assumptions, resource recommendation, reminder status, evidence summary, and required organizer decisions.
- **Subtask boundary:** May summarize and organize supplied information. Must label uncertainty and assumptions clearly. May not present an unsupported estimate as fact or omit a material limitation.
- **Retry limits:** Attempt at most 2 drafting revisions when a completeness or consistency check fails.

### Permitted Subtask 4

- **Subtask name:** Publish or route brief
- **Subtask description:** Determine whether the completed brief can be published or must be routed to the organizer for review. Record the publication or handoff status and the destination.
- **Subtask boundary:** May publish only when required inputs are present, the brief is internally consistent, and no unresolved human decision blocks publication. If confidence is insufficient or the delivery result is uncertain, route the brief for organizer review and take no further autonomous action.
- **Retry limits:** Attempt at most 1 additional publication attempt, and only when the first attempt is confirmed not to have created a duplicate.
**

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. If no permitted subtask can make useful progress, stop and hand the case to the CPVC event organizer.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** The brief contains the current forecast, uncertainty range, confidence level, assumptions, resource recommendation, reminder status, and required decisions, passes internal consistency checks, and is either published with a delivery record or formally routed for organizer review.
- **Hand off early when:** A required input is missing, stale, contradictory, below the configured confidence threshold, or unavailable after the retry limit; when an organizer decision is required; or when publication status is uncertain.
- **Hand off to:** CPVC event organizer (Sam Otto)

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

- **Status:** Completed when published; escalated to human when review is required.
- **Result or recommendation:** An organizer-facing brief with the attendance forecast, uncertainty range, confidence level, assumptions, resource plan, reminder status, and required decisions.
- **Evidence summary:** The dated validated planning dataset, forecast outputs, resource plan, reminder status, and any organizer-approved assumptions used to produce the brief.
- **Subtasks performed:** Inspect planning outputs; reconcile brief findings; draft organizer brief; publish or route brief, including any permitted retries.
- **Unresolved issues:** Any missing, stale, conflicting, or below-threshold evidence that prevents supported publication; otherwise none.
- **Handoff note:** State the missing evidence, unresolved conflict, or human decision required and identify the specific section of the brief affected; write “Not applicable” when the brief is published successfully.
- **Next task or recipient:** CPVC event organizer receives the published brief or the review handoff.


### Task-Wide Limits

- **Total task timeout:** 10 minutes per task run, including inference, tool calls, retries, and waiting.
- **Maximum tool calls:** 12 total calls across all tools during one task run.

### Tool 1

- **Tool name:** `retrieve_planning_outputs`
- **Input:** Validated planning dataset, attendance forecast, resource plan, reminder status, and organizer review decision
- **Output:** Complete T6 input bundle
- **Implementation Route:** Database queries or file operations against the planning workspace
- **Integration approach:** Direct integration
- **Role in this task:** Support inspecting planning outputs and reconciling brief findings
- **Task timeout:** 2 minutes
- **Maximum retries:** 2 additional attempts
- **Retry only when:** A source is temporarily unavailable or returns an incomplete response; wait 30 seconds between attempts and do not duplicate writes.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the missing or unavailable input and escalate to the CPVC event organizer.

### Tool 2

- **Tool name:** `publish_or_route_brief`
- **Input:** Completed organizer brief and publication or handoff status
- **Output:** Delivery record or organizer review handoff record
- **Implementation Route:** File operation or web API call to the organizer workspace
- **Integration approach:** Direct integration
- **Role in this task:** Support publishing the brief or routing it for human review
- **Task timeout:** 2 minutes
- **Maximum retries:** 1 additional attempt
- **Retry only when:** The first attempt is confirmed not to have created a delivery record; do not retry when the outcome is uncertain.
- **On timeout, exhausted retries, or an error that cannot be retried:** Record the delivery as unresolved and escalate to the CPVC event organizer without claiming publication succeeded.
