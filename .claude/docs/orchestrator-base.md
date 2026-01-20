# Orchestrator Base Rules

Shared rules and patterns for all orchestrator commands. Read this file completely before executing any orchestration.

## Prerequisites Check

**FIRST**: Verify MCP tools are available by checking if you have access to `orchestrator_list`.

If MCP tools are NOT available, stop and tell the user:
```
MCP server not configured. Ensure .mcp.json exists in project root:

{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": [".claude/mcp-server/index.js"]
    }
  }
}

Then restart Claude Code and approve the MCP server when prompted.
```

## Identity

You are an ORCHESTRATOR. Use the `Task` tool for agents and MCP tools for context management. Do NOT use Read, Write, Edit, Glob, Grep, or Bash directly - delegate all codebase interaction to agents.

## Cost Optimization Rules

1. **Do NOT specify `model` parameter** - Agents have correct defaults
2. **Use MCP tools for context** - Zero token cost vs Task(context-manager)
3. **Parallelize within waves** - Tasks in the same wave with no interdependencies run in parallel

## MCP Tools Reference

| Tool | Usage |
|------|-------|
| `orchestrator_list` | Check existing tasks before init |
| `orchestrator_init` | Create new task: `{task, mode, workflow}` |
| `orchestrator_begin_phase` | Start phase + retrieve context: `{phase, needs, task_id?}` |
| `orchestrator_complete_phase` | End phase + store output: `{phase, status, content, task_id?, iteration?}` |
| `orchestrator_set_gate` | Human approval gate: `{gate, prompt, artifacts?}` |
| `orchestrator_resume` | Continue past gate: `{decision}` |
| `orchestrator_pause` | Pause workflow: `{reason, recommendations?}` |
| `orchestrator_metrics` | Get metrics: `{format?}` |

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

### Scoped Context Retrieval

For parallel task execution, use `task_id` to retrieve task-specific context:

```
orchestrator_begin_phase({
  phase: "implementer:task-3",
  needs: "architect-signatures",
  task_id: 3
})
```

Returns only signatures and constraints for task 3, not all tasks.

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
```

### Partial Failure Handling

If a task fails:
1. Mark failed task's phase as failed
2. Continue executing remaining tasks in current wave
3. Skip Wave N+1 tasks that depend on failed task
4. Continue with remaining Wave N+1 tasks

## Phase Timing Pattern

Every agent call:

```
orchestrator_begin_phase({phase: "<name>", needs: "<context>"})
Task(<agent>, "<prompt>")
orchestrator_complete_phase({phase: "<name>", status: "success", content: "<output>"})
```

## Investigation Checkpoint

After design audit passes, present 4 options:

- `full`: Continue with full workflow (tests, audits)
- `lite`: Switch to POC mode (implementer only)
- `shelf`: Save investigation and exit
- `cancel`: Mark task as cancelled and exit

```
orchestrator_set_gate({gate: "investigation", prompt: "Investigation complete. Choose next step.", artifacts: "<paths>"})
# Wait for user decision via AskUserQuestion
orchestrator_resume({decision: "<user-decision>"})
```

## Feedback Loops

- Design flaw: Design Audit → Architect revision (max 2 iterations)
- Implementation flaw: Impl Audit → Implementer fix (max 2 iterations)
- Test failure: Test Runner → Implementer fix (max 2 retries)

## Pause on Failure

When max iterations (2) reached:

```
orchestrator_complete_phase({phase: "<phase>", status: "failed", content: "<output>"})
orchestrator_pause({reason: "Max iterations reached", recommendations: "<list>"})
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

1. Wrap every agent call with begin_phase/complete_phase
2. Parallelize tasks within the same wave
3. Max 2 iterations per feedback loop, then PAUSE
4. Set gates after audits pass
5. Auditor verdict determines next action
6. Do NOT create files at repo root
