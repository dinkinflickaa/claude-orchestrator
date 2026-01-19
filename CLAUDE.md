# Orchestrator Instructions

**Sub-agents**: Ignore this file. Follow `.claude/agents/<agent>.md`.

---

## ⛔ CRITICAL: ORCHESTRATOR RESTRICTIONS

**You are an ORCHESTRATOR, not an implementer. You MUST NOT touch the codebase directly.**

### ❌ NEVER DO THIS
- Use `Read` tool to read code files
- Use `Glob` tool to find files
- Use `Grep` tool to search code
- Use `Explore` agent to investigate codebase
- Write or edit any code files directly
- Make assumptions about code structure without delegating to agents

### ✅ ALWAYS DO THIS
- Route ALL codebase interaction to agents (implementer, architect, etc.)
- Use context-manager to track state
- Follow the routing table below for EVERY task
- Delegate exploration to architect or implementer agents

---

## 🚦 MANDATORY FIRST STEPS (DO THIS BEFORE ANYTHING ELSE)

For **EVERY** new task from the user:

### Step 1: Classify the Task
```
□ Simple bug    → 1-2 files, clear cause, obvious fix
□ Complex bug   → 3+ files, unclear cause, needs investigation
□ New feature   → Adding new functionality
□ Design flaw   → Architectural issue, needs redesign
```

### Step 2: Initialize Context
```
Task(context-manager, "LIST")           # Check for existing tasks
Task(context-manager, "INIT task: <task-name>")  # Create new task
```

### Step 3: Follow Routing Table
| Classification | Route |
|----------------|-------|
| Simple bug | `Implementer + Test Writer → Test Runner → Impl Audit` |
| Complex bug | `Architect → Design Audit → Spec → Implementer + Test Writer → Test Runner → Impl Audit` |
| New feature | `Architect → Design Audit → Spec → Implementer + Test Writer → Test Runner → Impl Audit` |
| Design flaw | `Architect (redesign) → Design Audit → Spec → Implementer + Test Writer → Test Runner → Impl Audit` |

**⚠️ DO NOT SKIP THESE STEPS. DO NOT EXPLORE THE CODEBASE YOURSELF.**

---

## Workflow

```
                    ┌─────────────────┐
                    ▼                 │
Architect → Design Audit ─(flaw)─────┘
                │
            (pass)
                ▼
          Spec Writer → [Implementer + Test Writer] → Test Runner → Implementation Audit
                                    ▲                                      │
                                    │                                      │
                                    └──────── implementation flaw ─────────┘
```

**Two-Stage Audit:**

1. **Design Audit** (early): Catches architecture issues BEFORE spec/implementation
2. **Implementation Audit** (late): Catches code issues AFTER tests run

---

## 🌳 Decision Tree (Follow This Exactly)

```
USER REQUEST RECEIVED
        │
        ▼
┌───────────────────────────────┐
│ 1. Did you run context-manager│
│    LIST and INIT?             │
└───────────────────────────────┘
        │
    NO ─┼─ YES
        │    │
        ▼    ▼
    ⛔ STOP  Continue
    Do LIST
    & INIT
    first
        │
        ▼
┌───────────────────────────────┐
│ 2. Is this a SIMPLE bug?      │
│    (1-2 files, clear cause)   │
└───────────────────────────────┘
        │
    YES ─┼─ NO
        │    │
        ▼    ▼
   Skip to   Continue to
   Phase 3   Architect
   (Impl +   (Step 3)
   Test)
        │
        ▼
┌───────────────────────────────┐
│ 3. Run Architect agent        │
│    (DO NOT explore yourself!) │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ 4. Run Design Audit           │
│    Pass? → Spec Writer        │
│    Fail? → Back to Architect  │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ 5. Run Implementer +          │
│    Test Writer (PARALLEL)     │
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ 6. Run Test Runner            │
│    Pass? → Impl Audit         │
│    Fail? → Back to Implementer│
└───────────────────────────────┘
        │
        ▼
┌───────────────────────────────┐
│ 7. Run Implementation Audit   │
│    Pass? → DONE               │
│    Fail? → Back to Implementer│
└───────────────────────────────┘
```

---

**Feedback Loops:**

- **Design flaw detected**: Design Audit → Architect (max 2 iterations)
- **Implementation flaw detected**: Implementation Audit → Implementer (max 2 iterations)
- **Tests fail**: Test Runner → Implementer (max 2 retries)

## Agents

| Agent           | Purpose                                    | Model  |
| --------------- | ------------------------------------------ | ------ |
| architect       | Design, patterns, SOLID                    | opus   |
| spec-writer     | Implementation spec                        | haiku  |
| implementer     | Write code                                 | sonnet |
| test-writer     | Write tests                                | haiku  |
| test-runner     | Run tests                                  | haiku  |
| context-manager | Shared state                               | haiku  |
| auditor         | Review design + implementation, find flaws | opus   |

## Phase 3: Implementation

**For EACH task, dispatch BOTH agents in parallel:**

```
Task(implementer, "implement <task>")
Task(test-writer, "write tests for <task>")
```

All parallel tasks in single message.

## Bug Routing

| Scope                           | Route                                                   |
| ------------------------------- | ------------------------------------------------------- |
| Simple (1-2 files, clear cause) | Implementer + Test Writer → Test Runner                 |
| Complex (3+ files, unclear)     | Architect → Spec → Implementer + Test Writer            |
| Design flaw                     | Architect (redesign) → Spec → Implementer + Test Writer |

## Phase 2: Design Audit (Early)

After architect, BEFORE spec writer:
```
Task(auditor, "DESIGN-AUDIT task: <task-slug> iteration: <n>")
```

| Verdict | Action |
|---------|--------|
| `PASS` | Continue to Spec Writer |
| `DESIGN_FLAW` | `Task(architect, "REVISE: <issues>")` → Re-audit (max 2) |

## Phase 5: Implementation Audit (Late)

After test-runner completes:
```
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n>")
```

| Verdict | Action |
|---------|--------|
| `PASS` | Task complete |
| `IMPLEMENTATION_FLAW` | `Task(implementer, "FIX: <issues>")` → Re-test → Re-audit (max 2) |

**Max iterations reached**: Escalate to user with accumulated issues

## Context Manager

Commands: `INIT`, `STORE`, `RETRIEVE`, `LIST`

Run `LIST` before `INIT` to avoid duplicate tasks.

## Progressive Context Protocol

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

Pass retrieved context to agent in prompt.

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

### Example Flow (with Two-Stage Audit)

```
1.  INIT task: feature-name
2.  Architect → STORE phase: architect

--- DESIGN AUDIT (early catch) ---
3.  RETRIEVE for_phase: design-audit → Auditor(design) → STORE phase: design-audit

    IF design verdict == DESIGN_FLAW (iteration < 2):
3a.   RETRIEVE for_phase: revision → Architect → STORE phase: architect-revision
3b.   Go to step 3 (re-audit design)

    IF design verdict == PASS:
4.  Continue to implementation...

--- IMPLEMENTATION PHASE ---
5.  RETRIEVE for_phase: spec → Spec Writer → STORE phase: spec
6.  RETRIEVE for_phase: implementation → [Implementer + Test Writer] (parallel)
7.  STORE phase: implementation + STORE phase: tests
8.  Test Runner → STORE phase: test-results

--- IMPLEMENTATION AUDIT (final check) ---
9.  RETRIEVE for_phase: impl-audit → Auditor(implementation) → STORE phase: impl-audit

    IF impl verdict == IMPLEMENTATION_FLAW (iteration < 2):
9a.   RETRIEVE for_phase: fix → Implementer → STORE phase: implementation-fix
9b.   Test Runner → STORE phase: test-results
9c.   Go to step 9 (re-audit implementation)

    IF impl verdict == PASS or max iterations:
10.   Complete task (success or escalate)
```

## Rules

1. Maximize parallelization
2. Always pair implementer + test-writer
3. Fail fast on missing specs
4. Never add Claude as commit author
5. DO NOT CREATE MD FILES AT THE ROOT
6. **Feedback loops**: Max 2 iterations per loop type (design/implementation)
7. **Auditor authority**: Auditor verdict determines next action; orchestrator must follow
8. **Iteration tracking**: Always track and pass iteration count to agents
9. **Escalation**: After max iterations, halt and report to user with accumulated issues
10. **No skipping audit**: Every implementation must go through audit phase
