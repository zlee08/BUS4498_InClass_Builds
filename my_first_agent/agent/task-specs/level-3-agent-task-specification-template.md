# [replace-with-your-task-name] Task Specification

Create one copy of this template for each Level 3 task identified in class (For this in-class build practice, having one Level 3 task is sufficient).

Save each copy in `my_first_agent/agent/task-specs/`. Rename the file using the task name in lowercase, with hyphens between words. Replace `&` with `and` and remove other punctuation.

Examples:

- `Grade Item Condition` becomes `grade-item-condition.md`
- `Customer Dispute & Compensation Assessment` becomes `customer-dispute-and-compensation-assessment.md`

Keep the **exact** task ID and task name from `workflow-of-tasks.md` inside the file. Replace all bracketed prompts. Leave Section 3 empty; tool permissions and boundaries will be added next week. 

*Remove this sentence and the instructions above before your submission.*

```yaml
# BASIC INFORMATION
task_id: "[Existing task ID]"
task_name: "[Exact task name from the workflow]"
task_owner: "[Person or team accountable for this task]"

# Agent Inference Configuration
Provider: [e.g., Groq, OpenAI, Claude, Google Gemini]
Model: "[Exact supported API model ID.]"
Role: [permitted subtasks the model supports]
Maximum inference requests per task run: "[Whole-number limit.]"
On inference failure or exhausted limits: Record the unresolved status and hand the case to [human role].
```

## 1. Task Goal

- **Objective:** [What business result should this task produce?]


## 2. Inbound Inputs

*Remove this instruction before your submission.* Describe what the enclosing workflow must provide. Describe the structure of each input; do not invent customer, employee, or event data.

### Input 1

- **Input name:** [Short name]
- **What it contains:** [Information the agent receives]
- **Source:** [Task or person that provides it]

*Copy the “Input” block for each additional input.*

## 3. Tool Permissions and Boundaries

## 4. How the Agent Should Reason

*Remove this instruction before your submission.* Define the kinds of work the agent is permitted to perform. Do not prescribe a fixed sequence. The agent chooses its next subtask using intermediate findings and may skip, repeat, or combine permitted subtasks within the limits above. Individual subtasks do not all have to be Level 3. Copy the “Permitted Subtask” block for each additional kind of work the agent may perform.

### Permitted Subtask 1

- **Subtask name:** [Use a verb-object name.]
- **Substask description:** [Explain what information the subtask examines and what finding or intermediate result it produces.]
- **Subtask boundary:** [State what the subtask may and may not do, including any prerequisite or required approval.]
- **Retry limits:** [Maximum number of times this subtask may be attempted before the agent chooses another permitted subtask or hands the case to a person.]

**

- **Decision guidance:** After each subtask, use its findings to select the permitted subtask most likely to resolve the most important remaining uncertainty. Do not follow a fixed sequence. If no permitted subtask can make useful progress, stop and hand the case to a person.

## 5. When to Stop or Hand Off to a Human

- **Stop successfully when:** [What evidence shows that the required result is complete and acceptable? Confidence alone is not enough.]
- **Hand off early when:** [What missing evidence, lack of progress, failure, or out-of-scope finding requires human review?]
- **Hand off to:** [Specific person, role, or review queue]

Stop at the first applicable budget limit or handoff condition. While awaiting review, take no further autonomous action.

## 6. Outbound Deliverable

*Remove this instruction before your submission.* Below are the default outbound deliverable items. Please revise as needed or leave them as they are if they fit your Level 3 task.

- **Status:** completed or escalated to human.
- **Result or recommendation:** The completed result. If the task was escalated before reaching a supported result, write undetermined.
- **Evidence summary:**  The most important evidence supporting the result or explaining why no result could be reached.
- **Subtasks performed:**  The permitted subtasks completed, including repeated attempts.
- **Unresolved issues:**  Remaining uncertainties or questions. Write none only when the task has been completed successfully.
- **Handoff note:** Reason for stopping, unresolved questions, and what the reviewer needs to decide; write “Not applicable” for a completed task.
- **Next task or recipient:** Who receives the completed output? Unresolved cases go to the handoff recipient above.


*Name each planned tool and specify its permitted use. Use verb-object names, such as **`retrieve_records`**, usually matching the task or permitted subtask it supports. Tool name identifies the capability; tool type identifies the proposed implementation. No scripts or working integrations are required.*

### Task-Wide Limits

- **Total task timeout:** [Maximum elapsed time for one task run, with units; include tool calls, retries, and waiting.]
- **Maximum tool calls:** [Maximum total calls across all tools during one task run; retries count toward this total.]

### Tool 1

- **Tool name:** [Proposed verb-object name.]
- **Input:** [replace with a input name listed above]
- **Output:** [replace with a output name listed above]
- **Implementation Route:** [file operations, functions/scripts, database queries, and web API calls]
- **Integration approach:** [direct integration, or MCP integration]
- **Role in this task:** [Support which permitted subtask(s)]
- **Task timeout:** [Maximum total elapsed time for one task run, with units. For L0, state a human response deadline instead, such as one business day after assignment.]
- **Maximum retries:** [Nonnegative whole number of additional attempts. Use 0 if retries are not permitted. For L0, write "Not applicable — manual task."]
- **Retry only when:** [Conditions that permit another attempt and any waiting interval. For work that changes records or sends messages, explain how retries avoid duplicates; hand off if the action's outcome is uncertain. Write "Not applicable" for manual tasks or when retries are 0.]
- **On timeout, exhausted retries, or an error that cannot be retried:** [State the status or evidence recorded and the exception task or person receiving the case. Do not continue as if the task succeeded.]
