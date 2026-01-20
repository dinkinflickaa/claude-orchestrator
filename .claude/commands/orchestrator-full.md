---
description: Run orchestrated multi-agent workflow for complex tasks
allowed-tools: Task(*), Read(.claude/*), Write(docs/orchestrator/context/*)
---

# Orchestrator Mode

You are an ORCHESTRATOR, not an implementer. You MUST NOT touch the codebase directly.

## NEVER DO THIS

- Use `Read` tool to read code files
- Use `Glob` tool to find files
- Use `Grep` tool to search code
- Use `Explore` agent to investigate codebase
- Write or edit any code files directly
- Make assumptions about code structure without delegating to agents

## ALWAYS DO THIS

- Route ALL codebase interaction to agents (implementer, architect, etc.)
- Use context-manager to track state
- Follow the routing table below
- Delegate exploration to architect or implementer agents

---

## Step 1: Classify the Task

```
Simple bug    -> 1-2 files, clear cause, obvious fix
Complex bug   -> 3+ files, unclear cause, needs investigation
New feature   -> Adding new functionality
Design flaw   -> Architectural issue, needs redesign
```

## Step 2: Initialize Context

```
Task(context-manager, "LIST")
Task(context-manager, "INIT task: <task-name> mode: standard workflow: orchestrate")
```

## Step 3: Follow Routing Table

| Classification | Route                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| Simple bug     | Implementer + Test Writer -> Test Runner -> Impl Audit                                                 |
| Complex bug    | Architect -> Design Audit -> Spec -> Implementer + Test Writer -> Test Runner -> Impl Audit            |
| New feature    | Architect -> Design Audit -> Spec -> Implementer + Test Writer -> Test Runner -> Impl Audit            |
| Design flaw    | Architect (redesign) -> Design Audit -> Spec -> Implementer + Test Writer -> Test Runner -> Impl Audit |

---

## Phase Timing Pattern

Wrap every agent call with START_PHASE/END_PHASE:

```
Task(context-manager, "START_PHASE phase: architect")
Task(architect, "DESIGN task: <task-slug> ...")
# On success:
Task(context-manager, "END_PHASE phase: architect status: success")
# On failure:
Task(context-manager, "END_PHASE phase: architect status: failed")
```

For parallel phases, start all then end as they complete:

```
Task(context-manager, "START_PHASE phase: implementer:task-1")
Task(context-manager, "START_PHASE phase: test-writer:task-1")
Task(implementer, "implement task-1")
Task(test-writer, "write tests for task-1")
# As each completes:
Task(context-manager, "END_PHASE phase: implementer:task-1 status: success")
Task(context-manager, "END_PHASE phase: test-writer:task-1 status: success")
```

---

## Workflow Diagram

```
                    +------------------+
                    v                  |
Architect -> Design Audit -(flaw)------+
                |
            (pass)
                v
        [DESIGN GATE] -> (approve) -> Spec Writer -> [Implementer + Test Writer] -> Test Runner -> Implementation Audit
                |                                                                                           |
            (reject/revise)                                                                                (pass)
                |                                                                                           v
                v                                                                                   [FINAL GATE] -> (approve) -> Complete
            fail/loop                                                                                       |
                                                                                                        (reject/revise)
                                                                                                            v
                                                                                                        fail/loop
```

**Two-Stage Audit:**

1. **Design Audit** (early): Catches architecture issues BEFORE spec/implementation
2. **Implementation Audit** (late): Catches code issues AFTER tests run

**Feedback Loops:**

- Design flaw detected: Design Audit -> Architect (max 2 iterations)
- Implementation flaw detected: Implementation Audit -> Implementer (max 2 iterations)
- Tests fail: Test Runner -> Implementer (max 2 retries)

---

## Agent Output Format

| Agent       | Required Sections                                         |
| ----------- | --------------------------------------------------------- |
| architect   | Design Decisions, Interfaces, Constraints, Files Affected |
| spec-writer | Implementation Tasks (File, Signatures, Dependencies)     |
| implementer | Files Modified, Public API, Edge Cases, Notes for Testing |
| test-writer | Test Files, Coverage Areas, Run Command                   |
| auditor     | Verdict, Issues (Location, Description, Suggested Fix)    |

---

## Phase 2: Design Audit

After architect, BEFORE spec writer:

```
Task(context-manager, "START_PHASE phase: design-audit")
Task(auditor, "DESIGN-AUDIT task: <task-slug> iteration: <n>")
Task(context-manager, "END_PHASE phase: design-audit status: <success|failed>")
```

| Verdict       | Action                                                    |
| ------------- | --------------------------------------------------------- |
| `PASS`        | Continue to Design Gate                                   |
| `DESIGN_FLAW` | `Task(architect, "REVISE: <issues>")` -> Re-audit (max 2) |

## Phase 2.5: Design Gate

After design audit passes, set gate for human approval:

```
Task(context-manager, "SET_GATE gate: design prompt: Review architect design before implementation artifacts: docs/orchestrator/context/tasks/<task-slug>/architect.md,docs/orchestrator/context/tasks/<task-slug>/design-audit.md")
```

**Gate Response:**

- `approve`: Continue to Spec Writer
- `reject`: Mark task as failed, exit workflow
- `revise`: Send back to architect with feedback

```
Task(context-manager, "RESUME decision: <user-decision>")
```

If decision is `revise`:

```
Task(context-manager, "START_PHASE phase: architect-revision")
Task(architect, "REVISE: <user feedback>")
Task(context-manager, "END_PHASE phase: architect-revision status: success")
# Loop back to design audit
```

## Phase 3: Implementation

### Wave Execution

After spec-writer completes, execute implementation in waves:

#### Compute Waves from Task Breakdown

Parse `taskBreakdown` from architect output and group tasks by dependency level:

- **Wave 0**: Tasks with no dependencies (dependencies: [])
- **Wave N**: Tasks whose dependencies are all in waves < N

#### Execute Each Wave

For each wave (in order):

```
# Start all tasks in wave in parallel
Task(context-manager, "START_PHASE phase: implementer:task-<id>")
Task(context-manager, "START_PHASE phase: test-writer:task-<id>")

# Dispatch agents in parallel
Task(implementer, "IMPLEMENT: task <id> - <description>")
Task(test-writer, "WRITE TESTS: task <id> - <description>")

# Wait for all tasks in wave to complete
# Then end phases
Task(context-manager, "END_PHASE phase: implementer:task-<id> status: success")
Task(context-manager, "END_PHASE phase: test-writer:task-<id> status: success")
```

#### Wave Lifecycle States

- pending: Wave created, waiting for previous wave
- running: At least one task executing
- completed: All tasks in wave succeeded
- failed: At least one task failed

#### Partial Failure Handling

If a task fails:

1. Mark failed task's phase as failed
2. Continue executing remaining tasks in current wave
3. Mark wave as "failed" when all tasks complete
4. Skip any Wave N+1 tasks that depend on the failed task
5. Continue with remaining Wave N+1 tasks

#### Test Runner Timing

Test-runner executes ONCE after ALL waves complete (not per-wave):

```
# After all waves complete
Task(context-manager, "START_PHASE phase: test-runner")
Task(test-runner, "RUN tests")
Task(context-manager, "END_PHASE phase: test-runner status: <result>")
```

## Phase 5: Implementation Audit

After test-runner completes:

```
Task(context-manager, "START_PHASE phase: impl-audit")
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n>")
Task(context-manager, "END_PHASE phase: impl-audit status: <success|failed>")
```

| Verdict               | Action                                                              |
| --------------------- | ------------------------------------------------------------------- |
| `PASS`                | Continue to Final Gate                                              |
| `IMPLEMENTATION_FLAW` | `Task(implementer, "FIX: <issues>")` -> Re-test -> Re-audit (max 2) |

## Phase 5.5: Final Gate

After implementation audit passes, set gate for final approval:

```
Task(context-manager, "SET_GATE gate: final prompt: Review implementation before marking complete artifacts: docs/orchestrator/context/tasks/<task-slug>/spec.md,docs/orchestrator/context/tasks/<task-slug>/impl-audit.md,docs/orchestrator/context/tasks/<task-slug>/test-results.md")
```

**Gate Response:**

- `approve`: Mark task as completed, output metrics summary
- `reject`: Mark task as failed, exit workflow
- `revise`: Send back to implementer with feedback

```
Task(context-manager, "RESUME decision: <user-decision>")
```

If decision is `approve`:

```
# Continue to metrics output
```

## Metrics Output

After final gate approval, display execution metrics:

```
Task(context-manager, "METRICS format: detailed")
```

This shows:

- Phase durations
- Wave execution breakdown
- Sequential vs parallel estimates
- Parallelization savings percentage

## Memory Capture

Before marking workflow complete, offer to save noteworthy decisions/patterns:

1. Collect `memory_candidates` from auditor outputs (design-audit and impl-audit)
2. Deduplicate by title (skip if similar entry exists in memory files)
3. Present to user via AskUserQuestion:

```
WORKFLOW COMPLETE: <task-slug>

Candidates for project memory:

DECISIONS:
  [1] <title>: <summary>

PATTERNS:
  [2] <title>: <code snippet preview>

Save to project memory?
  1. Save all
  2. Save selected (enter numbers)
  3. Skip
```

4. If user selects items, append to appropriate file:
   - Decisions → `docs/orchestrator/memory/decisions.md`
   - Patterns → `docs/orchestrator/memory/patterns.md`

Format for appending:

```markdown
## <Title>

**Date:** YYYY-MM-DD
**Task:** <task-slug>
**Content:** <full content>
```

---

## Pause on Failure

When max iterations (2) reached without passing audit:

```
Task(context-manager, "END_PHASE phase: <phase> status: failed")
Task(context-manager, "PAUSE reason: Max iterations reached for <phase> without passing audit recommendations: Review audit feedback,Consider architectural changes,Manual intervention may be needed")
```

Output to user:

```
WORKFLOW PAUSED
Reason: <reason>
Phase: <phase>
Attempts: <count>

Recommendations:
- <rec1>
- <rec2>

To continue: /orchestrator-resume <task-slug>
```

Do NOT escalate - pause and let user decide via /orchestrator-resume.

---

## Context Manager

Commands: `INIT`, `STORE`, `RETRIEVE`, `LIST`, `START_PHASE`, `END_PHASE`, `PAUSE`, `SET_GATE`, `RESUME`

Run `LIST` before `INIT` to avoid duplicate tasks.

### Before Each Phase (RETRIEVE)

| Phase                | Retrieve Command                                                             |
| -------------------- | ---------------------------------------------------------------------------- |
| Design Audit         | `RETRIEVE needs: architect-output for_phase: design-audit`                   |
| Spec Writer          | `RETRIEVE needs: architect-output for_phase: spec`                           |
| Implementer          | `RETRIEVE needs: spec-signatures for_phase: implementation`                  |
| Test Writer          | `RETRIEVE needs: spec-signatures for_phase: testing`                         |
| Implementation Audit | `RETRIEVE needs: all for_phase: impl-audit`                                  |
| Architect (revision) | `RETRIEVE needs: design-audit-feedback,architect-output for_phase: revision` |
| Implementer (fix)    | `RETRIEVE needs: impl-audit-feedback,implementation for_phase: fix`          |

### After Each Phase (STORE)

| Phase                | Store Command                                                      |
| -------------------- | ------------------------------------------------------------------ |
| Architect            | `STORE phase: architect content: <output>`                         |
| Design Audit         | `STORE phase: design-audit iteration: <n> content: <output>`       |
| Architect (revision) | `STORE phase: architect-revision iteration: <n> content: <output>` |
| Spec Writer          | `STORE phase: spec content: <output>`                              |
| Implementer          | `STORE phase: implementation task_id: <n> content: <output>`       |
| Test Writer          | `STORE phase: tests task_id: <n> content: <output>`                |
| Test Runner          | `STORE phase: test-results content: <output>`                      |
| Implementation Audit | `STORE phase: impl-audit iteration: <n> content: <output>`         |
| Implementer (fix)    | `STORE phase: implementation-fix iteration: <n> content: <output>` |

---

## Rules

1. Maximize parallelization
2. Always pair implementer + test-writer
3. Fail fast on missing specs
4. DO NOT CREATE MD FILES AT THE ROOT
5. Max 2 iterations per feedback loop
6. Auditor verdict determines next action
7. Always track iteration count
8. After max iterations, PAUSE workflow (do not escalate)
9. Every implementation must go through audit
10. Wrap every agent call with START_PHASE/END_PHASE
11. Set design gate after design audit passes
12. Set final gate after impl audit passes

---

## Your Task

$ARGUMENTS
