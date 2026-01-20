---
description: Run orchestrated multi-agent workflow for complex tasks
allowed-tools: Task(*), Read(.claude/*), Write(docs/orchestrator/context/*)
---

# Full Orchestration Mode

**First**: Read `.claude/docs/orchestrator-base.md` for shared rules.

## Workflow

```
Architect → Design Audit → [Investigation Checkpoint] → Implementer + Test Writer → Test Runner → Impl Audit → [Final Gate]
```

## Step 1: Classify & Initialize

```
Simple bug    -> Skip architect, go straight to Implementer + Test Writer
Complex bug   -> Full workflow
New feature   -> Full workflow
Design flaw   -> Full workflow
```

```
Task(context-manager, "LIST")
Task(context-manager, "INIT task: <task-name> mode: standard workflow: orchestrate")
```

## Step 2: Architect

```
Task(context-manager, "BEGIN_PHASE phase: architect needs: memory")
Task(architect, "DESIGN task: <task-slug> ...")
Task(context-manager, "COMPLETE_PHASE phase: architect status: success content: <output>")
```

## Step 3: Design Audit

```
Task(context-manager, "BEGIN_PHASE phase: design-audit needs: architect-output")
Task(auditor, "DESIGN-AUDIT task: <task-slug> iteration: <n>")
Task(context-manager, "COMPLETE_PHASE phase: design-audit status: <success|failed> content: <output>")
```

| Verdict | Action |
|---------|--------|
| `PASS` | Continue to Investigation Checkpoint |
| `DESIGN_FLAW` | Revise architect (max 2 iterations) |

## Step 4: Investigation Checkpoint

See base rules. Present 4 options: full, lite, shelf, cancel.

## Step 5: Implementation (Waves)

Parse `taskBreakdown` from architect. Execute waves in parallel per base rules.

For each task in wave (launch in parallel):
```
Task(context-manager, "BEGIN_PHASE phase: implementer:task-<id> needs: architect-signatures")
Task(implementer, "IMPLEMENT: task <id> - <description>")
Task(context-manager, "COMPLETE_PHASE phase: implementer:task-<id> status: success content: <output>")
```

Test writer runs in parallel with implementer:
```
Task(context-manager, "BEGIN_PHASE phase: test-writer:task-<id> needs: architect-signatures")
Task(test-writer, "WRITE TESTS: task <id>")
Task(context-manager, "COMPLETE_PHASE phase: test-writer:task-<id> status: success content: <output>")
```

## Step 6: Test Runner

After ALL waves complete:
```
Task(context-manager, "BEGIN_PHASE phase: test-runner needs: implementation")
Task(test-runner, "RUN tests")
Task(context-manager, "COMPLETE_PHASE phase: test-runner status: <result> content: <output>")
```

## Step 7: Implementation Audit

```
Task(context-manager, "BEGIN_PHASE phase: impl-audit needs: all")
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n>")
Task(context-manager, "COMPLETE_PHASE phase: impl-audit status: <success|failed> content: <output>")
```

| Verdict | Action |
|---------|--------|
| `PASS` | Continue to Final Gate |
| `IMPLEMENTATION_FLAW` | Fix and re-audit (max 2 iterations) |

## Step 8: Final Gate

```
Task(context-manager, "SET_GATE gate: final prompt: Review implementation artifacts: <paths>")
# Wait for user: approve, reject, or revise
Task(context-manager, "RESUME decision: <user-decision>")
```

## Step 9: Complete

```
Task(context-manager, "METRICS format: detailed")
```

Offer to save memory candidates from auditor outputs.

---

## Your Task

$ARGUMENTS
