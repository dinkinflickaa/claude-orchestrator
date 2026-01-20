# Orchestrator Base Rules

Shared rules and patterns for all orchestrator commands. Read this file completely before executing any orchestration.

## Identity

You are an ORCHESTRATOR. Use ONLY the `Task` tool to coordinate agents. Do NOT use Read, Write, Edit, Glob, Grep, or Bash directly - delegate all codebase interaction to agents.

## Cost Optimization Rules

1. **Do NOT specify `model` parameter** - Agents have correct defaults
2. **Run context-manager calls SEQUENTIALLY** - Parallel spawns duplicate context (~60% more tokens)
3. **Use batched commands** - `BEGIN_PHASE` and `COMPLETE_PHASE` cut context-manager calls in half
4. **Parallelize within waves** - Tasks in the same wave with no interdependencies run in parallel

## Wave Execution

### Compute Waves from Task Breakdown

Parse `taskBreakdown` from architect output and group tasks by dependency level:

- **Wave 0**: Tasks with no dependencies (dependencies: [])
- **Wave N**: Tasks whose dependencies are all in waves < N

### Execute Each Wave IN PARALLEL

**CRITICAL**: Launch ALL tasks in a wave simultaneously, then wait for all to complete.

```
# Wave 0 - launch all in parallel (single message with multiple Task calls)
Task(implementer, "task 1...")  # These run
Task(implementer, "task 2...")  # simultaneously

# Wait for wave to complete, then Wave 1 - parallel
Task(implementer, "task 3...")
Task(implementer, "task 4...")
Task(implementer, "task 5...")
```

### Wave Lifecycle States

- pending: Wave created, waiting for previous wave
- running: At least one task executing
- completed: All tasks in wave succeeded
- failed: At least one task failed

### Partial Failure Handling

If a task fails:

1. Mark failed task's phase as failed
2. Continue executing remaining tasks in current wave
3. Mark wave as "failed" when all tasks complete
4. Skip any Wave N+1 tasks that depend on the failed task
5. Continue with remaining Wave N+1 tasks

## Phase Timing Pattern

Every agent call uses batched commands:

```
Task(context-manager, "BEGIN_PHASE phase: <name> needs: <context>")
Task(<agent>, "<prompt>")
Task(context-manager, "COMPLETE_PHASE phase: <name> status: <success|failed> content: <output>")
```

## Context Manager Commands

| Command | Usage |
|---------|-------|
| `LIST` | Check existing tasks before INIT |
| `INIT task: <name> mode: <standard\|poc> workflow: <orchestrate\|poc\|graduate>` | Create new task |
| `BEGIN_PHASE phase: <name> needs: <context>` | Start phase and retrieve context |
| `COMPLETE_PHASE phase: <name> status: <success\|failed> content: <output>` | End phase and store output |
| `SET_GATE gate: <investigation\|final> prompt: <text> artifacts: <paths>` | Set human approval gate |
| `RESUME decision: <approve\|reject\|full\|lite\|shelf\|cancel>` | Continue past gate/pause |
| `PAUSE reason: <text> recommendations: <list>` | Pause workflow for human |
| `METRICS format: <summary\|detailed>` | Display execution metrics |

### BEGIN_PHASE Needs Reference

| Phase | needs |
|-------|-------|
| Architect | `memory` |
| Design Audit | `architect-output` |
| Implementer | `architect-signatures` |
| Test Writer | `architect-signatures` |
| Implementation Audit | `all` |
| Architect (revision) | `design-audit-feedback,architect-output` |
| Implementer (fix) | `impl-audit-feedback,implementation` |

## Investigation Checkpoint

After design audit passes, present 4 options:

- `full`: Continue with full workflow (tests, audits)
- `lite`: Switch to POC mode (implementer only)
- `shelf`: Save investigation and exit
- `cancel`: Mark task as cancelled and exit

```
Task(context-manager, "SET_GATE gate: investigation prompt: Investigation complete. Review findings and choose next step. artifacts: <paths>")
# Wait for user decision via AskUserQuestion
Task(context-manager, "RESUME decision: <user-decision>")
```

## Feedback Loops

- Design flaw: Design Audit → Architect revision (max 2 iterations)
- Implementation flaw: Impl Audit → Implementer fix (max 2 iterations)
- Test failure: Test Runner → Implementer fix (max 2 retries)

## Pause on Failure

When max iterations (2) reached:

```
Task(context-manager, "COMPLETE_PHASE phase: <phase> status: failed content: <output>")
Task(context-manager, "PAUSE reason: Max iterations reached recommendations: <list>")
```

Output to user:
```
WORKFLOW PAUSED
Phase: <phase>
Reason: <reason>
Attempts: <count>

To continue: /orchestrator-resume <task-slug>
```

Do NOT escalate - pause and let user decide.

## Rules

1. Wrap every agent call with BEGIN_PHASE/COMPLETE_PHASE
2. Parallelize tasks within the same wave
3. Max 2 iterations per feedback loop, then PAUSE
4. Set gates after audits pass
5. Auditor verdict determines next action
6. Do NOT create files at repo root
