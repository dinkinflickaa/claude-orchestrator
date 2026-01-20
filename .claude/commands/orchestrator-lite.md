---
description: Create a proof-of-concept implementation without tests or audits
allowed-tools: Task(*), mcp__orchestrator__*
---

# POC Mode - Orchestrator

**First**: Read `.claude/docs/orchestrator-base.md` for shared rules.

## Workflow

```
Architect → [Optional Checkpoint] → Implementer (waves) → [Final Gate]
```

**Skipped**: Design Audit, Test Writer, Test Runner, Impl Audit

## Step 1: Initialize

```
orchestrator_list()
orchestrator_init({task: "<slug>", mode: "poc", workflow: "poc"})
```

## Step 2: Architect

```
orchestrator_begin_phase({phase: "architect", needs: "memory"})
Task(architect, "DESIGN task: <slug>

POC MODE - Prioritize speed over perfection.

User request:
<user's request>

Provide: Design decisions, file structure, interfaces, implementation steps")
orchestrator_complete_phase({phase: "architect", status: "success", content: "<output>"})
```

## Step 2.5: Investigation Checkpoint (Optional)

**Use for**: Significant changes, multi-system impact, potential graduation to full.
**Skip for**: Small changes, quick prototypes, localized low-risk changes.

If using checkpoint, see base rules for full/lite/shelf/cancel options.

## Step 3: Implementation (Waves)

Parse `taskBreakdown` from architect. Execute waves in parallel per base rules.

For each task in wave (launch ALL tasks in wave in parallel):
```
orchestrator_begin_phase({phase: "implementer:task-<id>", needs: "architect-signatures"})
Task(implementer, "IMPLEMENT POC: task <id> - <description>

POC MODE - Focus on core functionality, skip edge cases.")
orchestrator_complete_phase({phase: "implementer:task-<id>", status: "success", content: "<output>"})
```

If no `taskBreakdown` (simple task), use single implementer.

## Step 4: Store Debt

```
orchestrator_store({phase: "debt", content: "task: <slug>
status: poc-complete
skipped: design-audit, tests, impl-audit
files: <list from implementer>"})
```

## Step 5: Final Gate

```
orchestrator_set_gate({gate: "final", prompt: "Review POC implementation artifacts: <paths>"})
orchestrator_resume({decision: "<user-decision>"})
```

## Step 6: Report

```
orchestrator_metrics({format: "summary"})
```

Tell user:
- POC complete
- Files created/modified
- Run `/orchestrator-graduate <slug>` to add tests and audits

## Error Handling

See base rules for pause on failure pattern.

---

## Your Task

$ARGUMENTS
