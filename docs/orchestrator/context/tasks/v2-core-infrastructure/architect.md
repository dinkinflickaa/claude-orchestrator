# v2-core-infrastructure Design

## Design Decisions
1. Manifest replaces metadata.json - single source of truth
2. Individual phase tracking (implementer:task-1, implementer:task-2)
3. Status state machine: running -> waiting_gate/paused/failed/completed
4. Full context preservation on pause/gate for resume
5. Millisecond timestamp precision

## Files Affected
- NEW: .claude/commands/resume.md
- MODIFY: .claude/agents/context-manager.md (add START_PHASE, END_PHASE, PAUSE, SET_GATE, RESUME commands)
- MODIFY: .claude/commands/orchestrate.md (add phase timing, gates, pause-on-failure)
- MODIFY: .claude/commands/poc.md (add phase timing, gates, pause-on-failure)

## Manifest Schema
```json
{
  "name": "task-slug",
  "mode": "standard|poc",
  "workflow": "orchestrate|poc|graduate",
  "status": "running|paused|waiting_gate|completed|failed|poc-complete|graduated",
  "current_phase": "phase-name|null",
  "completed_phases": [
    {"phase": "name", "status": "success|failed", "started_at": "ISO8601", "ended_at": "ISO8601", "duration_ms": 123, "retries": 0}
  ],
  "failure_context": {"phase": "", "reason": "", "attempts": 0, "last_feedback": "", "recommendations": []},
  "gate_context": {"gate": "design|final", "prompt": "", "options": [], "artifacts": []},
  "metrics": {"total_duration_ms": null, "parallelization_savings_ms": null, "total_retries": 0},
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

## New Commands for context-manager
- START_PHASE phase: <name> - Record phase start, set current_phase
- END_PHASE phase: <name> status: <success|failed> - Record timing, add to completed_phases
- PAUSE reason: <text> recommendations: <list> - Set status=paused with failure_context
- SET_GATE gate: <design|final> context: <json> - Set status=waiting_gate with gate_context
- RESUME - Clear pause/gate state, return continue point

## Resume Command Flow
1. Load manifest for task
2. If waiting_gate: Display gate prompt, get decision
3. If paused/failed: Display failure context, get decision
4. On approve/retry: RESUME then continue workflow
5. Route to next phase based on completed_phases

## Orchestrate/POC Changes
1. Wrap all agent calls with START_PHASE/END_PHASE
2. Add design gate after design-audit passes
3. Add final gate after impl-audit passes
4. On max retries: PAUSE with context instead of escalate
5. Output metrics summary on completion
