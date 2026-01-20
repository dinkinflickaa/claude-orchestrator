---
description: Graduate POC to production with tests and audits
allowed-tools: Task(*)
---

# Graduate POC to Production

**First**: Read `.claude/docs/orchestrator-base.md` for shared rules.

## Workflow

```
Validate POC → Test Writer → Test Runner → Impl Audit (poc-graduate) → [Final Gate]
```

**Skipped**: Architect, Design Audit (POC code is the design)

## Step 1: Validate POC

```
Task(context-manager, "LIST")
Task(context-manager, "RETRIEVE needs: manifest,debt for_phase: graduate task: <task-slug>")
```

**Validation**: POC exists, status is `poc-complete`, debt.md exists.

## Step 2: Test Writer

```
Task(context-manager, "BEGIN_PHASE phase: test-writer needs: implementation,debt")
Task(test-writer, "WRITE TESTS for graduated POC: <task-slug>

Focus on: edge cases from debt.md, error handling, security concerns.")
Task(context-manager, "COMPLETE_PHASE phase: test-writer status: success content: <output>")
```

## Step 3: Test Runner

```
Task(context-manager, "BEGIN_PHASE phase: test-runner needs: implementation")
Task(test-runner, "RUN tests")
Task(context-manager, "COMPLETE_PHASE phase: test-runner status: <result> content: <output>")
```

## Step 4: Implementation Audit

```
Task(context-manager, "BEGIN_PHASE phase: impl-audit needs: all")
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n> audit_mode: poc-graduate")
Task(context-manager, "COMPLETE_PHASE phase: impl-audit status: <success|failed> content: <output>")
```

See base rules for feedback loops (max 2 iterations, then PAUSE).

## Step 5: Final Gate

```
Task(context-manager, "SET_GATE gate: final prompt: Review graduated POC artifacts: <paths>")
Task(context-manager, "RESUME decision: <user-decision>")
```

## Step 6: Complete

```
Task(context-manager, "METRICS format: detailed")
```

Task marked `graduate-complete`.

## Error Handling

| Error | Message |
|-------|---------|
| POC not found | "Task <slug> not found or not a POC task" |
| POC incomplete | "POC not complete, run /orchestrator-lite first" |
| Missing debt.md | "debt.md required for graduation" |

See base rules for pause on failure pattern.

---

## Your Task

$ARGUMENTS
