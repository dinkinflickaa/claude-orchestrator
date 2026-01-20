---
description: Resume a paused task or approve a gate
allowed-tools: Task(context-manager)
---

# Resume Command

**First**: Read `.claude/docs/orchestrator-base.md` for shared rules.

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

| Status | Display Format |
|--------|----------------|
| `waiting_gate` (design/final) | Gate type, prompt, artifacts, options: [approve] [reject] [revise] |
| `waiting_gate` (investigation) | Summary, 4 options: [full] [lite] [shelf] [cancel] |
| `paused` | Phase, reason, attempts, recommendations, options: [retry] [reject] |
| `shelved` | Shelved date, phase, summary, options: [full] [lite] [cancel] |
| `cancelled` | Cannot resume message, suggest `/orchestrator-full` |

### Step 3: Get User Decision & Execute

```
Task(context-manager, "RESUME decision: <user-decision>")
```

### Step 4: Route Based on Decision

| Gate/Status | Decision | Action |
|-------------|----------|--------|
| investigation | full | Continue to implementer (full mode) |
| investigation | lite | Continue to implementer (POC mode) |
| investigation | shelf | Save & exit |
| investigation | cancel | Mark cancelled & exit |
| shelved | full/lite | Resume to implementer |
| shelved | cancel | Mark cancelled & exit |
| design/final | approve | Continue to next phase |
| paused | retry | Retry from failure point |

## Error Handling

| Error | Message |
|-------|---------|
| Not found | "No task found with slug: <slug>" |
| Wrong status | "Task <slug> is not paused, gated, or shelved. Current status: <status>" |
| Cancelled | "Task <slug> was cancelled. Start fresh with /orchestrator-full" |

---

## Your Task

$ARGUMENTS
