---
description: Resume a paused task or approve a gate
allowed-tools: Task(context-manager)
---

# Resume Command

Resume a paused workflow or respond to a gate prompt.

## Usage

```
/orchestrator-resume <task-slug>
```

## Workflow

### Step 1: Get Task State

```
Task(context-manager, "RETRIEVE needs: manifest for_phase: resume task: <task-slug>")
```

### Step 2: Display State to User

If status is `waiting_gate` with gate: design or final:
```
GATE: <design|final>
PROMPT: <gate prompt>
ARTIFACTS TO REVIEW:
- <artifact1>
- <artifact2>

Options: [approve] [reject] [revise]
```

If status is `waiting_gate` with gate: investigation:
```
INVESTIGATION CHECKPOINT
SUMMARY:
<investigation summary from design-audit>

DECISION OPTIONS:
- full: Continue with full specification (recommended for production)
- lite: Switch to POC mode (core functionality only)
- shelf: Save investigation for later
- cancel: Exit workflow

Options: [full] [lite] [shelf] [cancel]
```

If status is `paused`:
```
PAUSED AT: <phase>
REASON: <failure reason>
ATTEMPTS: <count>
RECOMMENDATIONS:
- <rec1>
- <rec2>

Options: [retry] [reject]
```

If status is `shelved`:
```
SHELVED INVESTIGATION: <task-slug>
SHELVED AT: <date>
PREVIOUS PHASE: <phase-name>

INVESTIGATION SUMMARY:
<shelf_context investigation_summary>

RESUME OPTIONS:
- full: Continue with full specification workflow
- lite: Switch to POC mode
- cancel: Discard this investigation

Options: [full] [lite] [cancel]
```

If status is `cancelled`:
```
WORKFLOW CANCELLED: <task-slug>
REASON: User cancelled investigation

This task cannot be resumed. To start fresh:
/orchestrator-full <new-task-slug>
```

### Step 3: Get User Decision

Wait for user to provide decision:
- Design/final gates: approve, reject, or revise
- Investigation gate: full, lite, shelf, or cancel
- Shelved status: full, lite, or cancel
- Paused status: retry or reject

### Step 4: Execute Resume

```
Task(context-manager, "RESUME decision: <user-decision>")
```

### Step 5: Continue Workflow

Based on CONTINUE_FROM and decision type:
- If gate: investigation and decision: full -> Route to implementer phase
- If gate: investigation and decision: lite -> Route to implementer phase (POC mode)
- If gate: investigation and decision: shelf -> Task shelved, exit
- If gate: investigation and decision: cancel -> Task cancelled, exit
- If status: shelved and decision: full -> Route to implementer phase
- If status: shelved and decision: lite -> Route to implementer phase (POC mode)
- If status: shelved and decision: cancel -> Task cancelled, exit
- If gate: design and decision: approve -> Route to next phase
- If gate: final and decision: approve -> Mark completed
- If status: paused and decision: retry -> Route to failure point
- If `implementer`: Route to /orchestrator-full continuation
- If `completed`: Display completion message
- If `failed`: Display failure summary

## Error Handling

- Task not found: "No task found with slug: <slug>"
- Task not paused/gated/shelved: "Task <slug> is not paused, gated, or shelved. Current status: <status>"
- Task cancelled: "Task <slug> was cancelled and cannot be resumed. Start fresh with /orchestrator-full"
- Invalid decision: "Invalid decision. Please choose from: <options>"
- Shelved task missing shelf_context: "Shelved task missing context. Partial information available. Choose to proceed or cancel."

## Examples

### Design Gate Example

```
/orchestrator-resume my-feature
> Task my-feature is waiting for DESIGN GATE approval
> Review: docs/orchestrator/context/tasks/my-feature/architect.md
> [approve] to continue, [reject] to cancel, [revise] to send back to architect

User: approve
> Resuming... continuing to implementer phase
```

### Investigation Checkpoint Example

```
/orchestrator-resume my-feature
> INVESTIGATION CHECKPOINT
> SUMMARY: Feature requires 3 new components and database migration
>
> DECISION OPTIONS:
> - full: Complete specification (recommended for production)
> - lite: POC only (core functionality, skip tests/audits)
> - shelf: Save for later
> - cancel: Exit workflow
>
> Options: [full] [lite] [shelf] [cancel]

User: lite
> Switching to POC mode... continuing to implementer
```

### Shelved Investigation Resume Example

```
/orchestrator-resume my-feature
> SHELVED INVESTIGATION: my-feature
> SHELVED AT: 2026-01-15
> PREVIOUS PHASE: design-audit (passed)
>
> INVESTIGATION SUMMARY:
> Feature requires 3 new components and database migration.
> Key findings: architect decisions validated, no design flaws found.
>
> RESUME OPTIONS:
> - full: Complete specification workflow
> - lite: POC mode
> - cancel: Discard
>
> Options: [full] [lite] [cancel]

User: full
> Resuming with full specification workflow... continuing to implementer
```

### Cancelled Task Example

```
/orchestrator-resume old-feature
> WORKFLOW CANCELLED: old-feature
> REASON: User cancelled investigation
>
> This task cannot be resumed. To start fresh:
> /orchestrator-full new-feature
```

---

## Your Task

$ARGUMENTS
