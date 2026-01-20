---
description: Run orchestrated multi-agent workflow for complex tasks
allowed-tools: Task(*), mcp__orchestrator__*
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
orchestrator_list()
orchestrator_init({task: "<task-name>", mode: "standard", workflow: "orchestrate"})
```

## Step 2: Architect

```
orchestrator_begin_phase({phase: "architect", needs: "memory"})
Task(architect, "DESIGN task: <task-slug> ...")
orchestrator_complete_phase({phase: "architect", status: "success", content: "<output>"})
```

## Step 3: Design Audit

```
orchestrator_begin_phase({phase: "design-audit", needs: "architect-output"})
Task(auditor, "DESIGN-AUDIT task: <task-slug> iteration: <n>")
orchestrator_complete_phase({phase: "design-audit", status: "<success|failed>", content: "<output>"})
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
orchestrator_begin_phase({phase: "implementer:task-<id>", needs: "architect-signatures", task_id: <id>})
Task(implementer, "IMPLEMENT: task <id> - <description>")
orchestrator_complete_phase({phase: "implementer:task-<id>", status: "success", content: "<output>"})
```

Test writer runs in parallel with implementer:
```
orchestrator_begin_phase({phase: "test-writer:task-<id>", needs: "architect-signatures", task_id: <id>})
Task(test-writer, "WRITE TESTS: task <id>")
orchestrator_complete_phase({phase: "test-writer:task-<id>", status: "success", content: "<output>"})
```

## Step 6: Test Runner

After ALL waves complete:
```
orchestrator_begin_phase({phase: "test-runner", needs: "implementation"})
Task(test-runner, "RUN tests")
orchestrator_complete_phase({phase: "test-runner", status: "<result>", content: "<output>"})
```

## Step 7: Implementation Audit

```
orchestrator_begin_phase({phase: "impl-audit", needs: "all"})
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n>")
orchestrator_complete_phase({phase: "impl-audit", status: "<success|failed>", content: "<output>"})
```

| Verdict | Action |
|---------|--------|
| `PASS` | Continue to Final Gate |
| `IMPLEMENTATION_FLAW` | Fix and re-audit (max 2 iterations) |

## Step 8: Final Gate

```
orchestrator_set_gate({gate: "final", prompt: "Review implementation artifacts: <paths>"})
# Wait for user: approve, reject, or revise
orchestrator_resume({decision: "<user-decision>"})
```

## Step 9: Complete

```
orchestrator_metrics({format: "detailed"})
```

Offer to save memory candidates from auditor outputs.

---

## Your Task

$ARGUMENTS
