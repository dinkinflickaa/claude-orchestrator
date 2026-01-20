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

If status is `waiting_gate`:
```
GATE: <design|final>
PROMPT: <gate prompt>
ARTIFACTS TO REVIEW:
- <artifact1>
- <artifact2>

Options: [approve] [reject] [revise]
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

### Step 3: Get User Decision

Wait for user to provide decision: approve, reject, retry, or revise

### Step 4: Execute Resume

```
Task(context-manager, "RESUME decision: <user-decision>")
```

### Step 5: Continue Workflow

Based on CONTINUE_FROM returned:
- If `spec-writer`: Route to /orchestrator-full continuation
- If `implementer`: Route to /orchestrator-full continuation
- If `completed`: Display completion message
- If `failed`: Display failure summary

## Error Handling

- Task not found: "No task found with slug: <slug>"
- Task not paused/gated: "Task <slug> is not paused or waiting for approval. Current status: <status>"
- Invalid decision: "Invalid decision. Please choose from: <options>"

## Examples

```
/orchestrator-resume my-feature
> Task my-feature is waiting for DESIGN GATE approval
> Review: docs/orchestrator/context/tasks/my-feature/architect.md
> [approve] to continue, [reject] to cancel, [revise] to send back to architect

User: approve
> Resuming... continuing to spec-writer phase
```

---

## Your Task

$ARGUMENTS
