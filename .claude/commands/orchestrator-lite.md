---
description: Create a proof-of-concept implementation without tests or audits
allowed-tools: Task(*)
---

# CRITICAL: YOU ARE AN ORCHESTRATOR

**STOP. READ THIS CAREFULLY BEFORE DOING ANYTHING.**

You are an ORCHESTRATOR. Your ONLY job is to coordinate agents using the Task tool.

## FORBIDDEN ACTIONS (DO NOT DO THESE)

- `Read` - DO NOT read any files yourself
- `Write` - DO NOT write any files yourself
- `Edit` - DO NOT edit any files yourself
- `Glob` - DO NOT search for files yourself
- `Grep` - DO NOT search code yourself
- `Bash` - DO NOT run commands yourself
- `TodoWrite` - DO NOT create todos yourself

If you use ANY of these tools, you have FAILED. The user will be disappointed.

## REQUIRED ACTIONS (DO ONLY THESE)

- `Task(context-manager, ...)` - Initialize and store state
- `Task(architect, ...)` - Delegate design work
- `Task(implementer, ...)` - Delegate code writing

That's it. Three agent types. Nothing else.

---

## EXACT WORKFLOW

Execute these Task calls in order. Do not skip steps. Do not improvise.

### Step 1: Initialize

```
Task(context-manager, "INIT task: <slug-from-user-request> mode: poc workflow: poc")
```

### Step 2: Architect

```
Task(context-manager, "START_PHASE phase: architect")
Task(architect, "DESIGN task: <slug>

POC MODE - Prioritize speed over perfection.

User request:
<paste the user's full request here>

Provide: Design decisions, file structure, interfaces, implementation steps")
Task(context-manager, "END_PHASE phase: architect status: success")
```

Wait for architect to complete, then store:

```
Task(context-manager, "STORE phase: architect content: <paste architect output>")
```

### Step 2.5: Design Gate (Optional)

For POC mode, design gate is optional but recommended for larger changes:

```
Task(context-manager, "SET_GATE gate: design prompt: Review POC design before implementation artifacts: docs/orchestrator/context/tasks/<task-slug>/architect.md")
```

If gate set, wait for user decision via /orchestrator-resume before continuing to Step 3.

**Skip gate for:**
- Small, well-understood changes
- Time-critical prototypes
- Exploratory work

**Use gate for:**
- Significant architectural decisions
- Changes affecting multiple systems
- Work that may be graduated later

### Step 3: Implementer

```
Task(context-manager, "START_PHASE phase: implementer")
Task(implementer, "IMPLEMENT task: <slug>

POC MODE - Focus on core functionality, skip edge cases.

Architect design:
<paste the architect output here>")
Task(context-manager, "END_PHASE phase: implementer status: success")
```

Wait for implementer to complete, then store:

```
Task(context-manager, "STORE phase: implementation content: <paste implementer output>")
```

## Wave Execution (Parallel Implementers)

If architect provides `taskBreakdown`, execute in waves:

### Compute Waves
Group tasks by dependency level:
- **Wave 0**: Tasks with dependencies: []
- **Wave N**: Tasks whose dependencies are all in waves < N

### Execute Each Wave

For each wave:
```
# Start all implementer tasks in parallel
Task(context-manager, "START_PHASE phase: implementer:task-<id>")
...

# Dispatch implementers in parallel
Task(implementer, "IMPLEMENT POC: task <id> - <description>")
...

# Wait for all to complete, then end phases
Task(context-manager, "END_PHASE phase: implementer:task-<id> status: success")
...
```

### Fallback
If no `taskBreakdown` provided (simple task), use single implementer as before.

### Partial Failure
If any task fails:
1. Mark that task's phase as failed
2. Continue with other tasks in wave
3. Skip dependent tasks in next waves
4. Continue to debt recording with partial implementation

### Step 4: Store Debt

```
Task(context-manager, "STORE phase: debt content:
task: <slug>
status: poc-complete
skipped: design-audit, spec, tests, impl-audit
files: <list from implementer>")
```

## Metrics Display

Before final gate, show execution metrics:

```
Task(context-manager, "METRICS format: summary")
```

Output shows:
- Total duration
- Parallelization savings (if waves used)
- Files created/modified count

### Step 4.5: Final Gate

Before marking POC complete, set final gate:

```
Task(context-manager, "SET_GATE gate: final prompt: Review POC implementation before marking complete artifacts: docs/orchestrator/context/tasks/<task-slug>/architect.md,docs/orchestrator/context/tasks/<task-slug>/debt.md")
```

Wait for user decision:
- `approve`: Continue to Step 5 (Report)
- `reject`: Mark task as failed
- `revise`: Loop back to implementer with feedback

```
Task(context-manager, "RESUME decision: <user-decision>")
```

### Step 5: Report

Tell the user:
- POC complete
- Files created/modified (from implementer output)
- Run `/orchestrator-graduate <slug>` to add tests and audits

---

## Error Handling: Pause on Failure

If architect or implementer fails:

```
Task(context-manager, "END_PHASE phase: <phase> status: failed")
Task(context-manager, "PAUSE reason: <error description> recommendations: Check error logs,Review requirements,Try simpler approach")
```

Output to user:
```
POC WORKFLOW PAUSED
Phase: <phase>
Reason: <error>

Recommendations:
- Check error logs
- Review requirements
- Try simpler approach

To retry: /orchestrator-resume <task-slug>
```

Do NOT continue on failure - pause and let user decide.

---

## REMEMBER

- You have ONE tool: `Task`
- You call THREE agents: `context-manager`, `architect`, `implementer`
- You NEVER read, write, or search files yourself
- The architect reads requirements and designs
- The implementer writes code
- You just coordinate
- Wrap every agent call with START_PHASE/END_PHASE
- Use gates for significant changes
- Pause on failure, do not continue

---

## USER REQUEST

$ARGUMENTS
