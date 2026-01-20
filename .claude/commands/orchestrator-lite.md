---
description: Create a proof-of-concept implementation without tests or audits
allowed-tools: Task(*)
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
Task(context-manager, "LIST")
Task(context-manager, "INIT task: <slug> mode: poc workflow: poc")
```

## Step 2: Architect

```
Task(context-manager, "BEGIN_PHASE phase: architect needs: memory")
Task(architect, "DESIGN task: <slug>

POC MODE - Prioritize speed over perfection.

User request:
<user's request>

Provide: Design decisions, file structure, interfaces, implementation steps")
Task(context-manager, "COMPLETE_PHASE phase: architect status: success content: <output>")
```

## Step 2.5: Investigation Checkpoint (Optional)

**Use for**: Significant changes, multi-system impact, potential graduation to full.
**Skip for**: Small changes, quick prototypes, localized low-risk changes.

If using checkpoint, see base rules for full/lite/shelf/cancel options.

## Step 3: Implementation (Waves)

Parse `taskBreakdown` from architect. Execute waves in parallel per base rules.

For each task in wave (launch ALL tasks in wave in parallel):
```
Task(context-manager, "BEGIN_PHASE phase: implementer:task-<id> needs: architect-signatures")
Task(implementer, "IMPLEMENT POC: task <id> - <description>

POC MODE - Focus on core functionality, skip edge cases.")
Task(context-manager, "COMPLETE_PHASE phase: implementer:task-<id> status: success content: <output>")
```

If no `taskBreakdown` (simple task), use single implementer.

## Step 4: Store Debt

```
Task(context-manager, "STORE phase: debt content:
task: <slug>
status: poc-complete
skipped: design-audit, tests, impl-audit
files: <list from implementer>")
```

## Step 5: Final Gate

```
Task(context-manager, "SET_GATE gate: final prompt: Review POC implementation artifacts: <paths>")
Task(context-manager, "RESUME decision: <user-decision>")
```

## Step 6: Report

```
Task(context-manager, "METRICS format: summary")
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
