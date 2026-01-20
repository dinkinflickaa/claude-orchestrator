---
description: Create a proof-of-concept implementation without tests or audits
allowed-tools: Task(*)
---

# POC Mode - Orchestrator

You are an ORCHESTRATOR. Use ONLY the `Task` tool to coordinate agents. Do NOT use Read, Write, Edit, Glob, Grep, or Bash directly.

**Agents:** `context-manager`, `architect`, `implementer`

## Rules

1. **Do NOT specify `model` parameter** - Sub-agents have information about this.
2. Run context-manager calls sequentially (parallel spawns cost ~60% more tokens)
3. Only parallelize multiple implementers in same wave

---

## EXACT WORKFLOW

Execute these Task calls in order. Do not skip steps. Do not improvise.

### Step 1: Initialize

```
Task(context-manager, "INIT task: <slug-from-user-request> mode: poc workflow: poc")
```

### Step 2: Architect

```
Task(context-manager, "BEGIN_PHASE phase: architect needs: memory")
Task(architect, "DESIGN task: <slug>

POC MODE - Prioritize speed over perfection.

User request:
<paste the user's full request here>

Provide: Design decisions, file structure, interfaces, implementation steps")
Task(context-manager, "COMPLETE_PHASE phase: architect status: success content: <architect output>")
```

### Step 2.5: Investigation Checkpoint (Optional)

For POC mode, investigation checkpoint is optional but recommended for significant changes:

```
Task(context-manager, "SET_GATE gate: investigation prompt: Investigation complete. Review findings and choose next step. artifacts: docs/orchestrator/context/tasks/<task-slug>/architect.md")
```

Present investigation summary with 4 options:

- `full`: Promote to full orchestration workflow (spec, tests, audits)
- `lite`: Continue with POC implementation (default behavior)
- `shelf`: Save investigation and exit (resume later)
- `cancel`: Mark task as cancelled and exit

**Handle Decision:**

```
Task(context-manager, "RESUME decision: <user-decision>")
```

If decision is `full`:

```
Output: "Promoting to full orchestration mode..."
Task(context-manager, "RESUME decision: full")
# Context-manager switches workflow from POC to full orchestration
# Workflow continues with: spec-writer, implementer, test-writer, test-runner, impl-audit
```

If decision is `lite`:

```
# Continue to Step 3 (Implementer) - default POC flow
```

If decision is `shelf`:

```
Output:
INVESTIGATION SHELVED: <task-slug>
Design saved. Resume anytime with: /orchestrator-resume <task-slug>
```

If decision is `cancel`:

```
Output:
INVESTIGATION CANCELLED: <task-slug>
Task marked as cancelled.
```

**Skip checkpoint for:**

- Small, well-understood changes
- Time-critical prototypes
- Quick proof-of-concepts
- Localized, low-risk changes

**Use checkpoint for:**

- Significant architectural changes
- POC that may be graduated to full implementation
- Investigation findings that should be reviewed
- Changes affecting multiple systems

### Step 3: Implementer

```
Task(context-manager, "BEGIN_PHASE phase: implementer needs: architect-output")
Task(implementer, "IMPLEMENT task: <slug>

POC MODE - Focus on core functionality, skip edge cases.

Architect design:
<paste the architect output here>")
Task(context-manager, "COMPLETE_PHASE phase: implementer status: success content: <implementer output>")
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
Task(context-manager, "BEGIN_PHASE phase: implementer:task-<id> needs: architect-output")
Task(implementer, "IMPLEMENT POC: task <id> - <description>")
Task(context-manager, "COMPLETE_PHASE phase: implementer:task-<id> status: success content: <output>")
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
Task(context-manager, "COMPLETE_PHASE phase: <phase> status: failed content: <error>")
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

## USER REQUEST

$ARGUMENTS
