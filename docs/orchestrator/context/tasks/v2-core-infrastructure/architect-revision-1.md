# v2-core-infrastructure Design Revision

## Changes Made
1. Added running_phases array for parallel phase tracking
2. Added explicit state transition table

## Updated Manifest Schema
```json
{
  "name": "task-slug",
  "mode": "standard|poc",
  "workflow": "orchestrate|poc|graduate",
  "status": "running|paused|waiting_gate|completed|failed|poc-complete|graduated",
  "current_phase": "phase-name|null",
  "running_phases": [
    {"phase": "implementer:task-1", "started_at": "ISO8601"},
    {"phase": "implementer:task-2", "started_at": "ISO8601"}
  ],
  "completed_phases": [
    {"phase": "name", "status": "success|failed", "started_at": "ISO8601", "ended_at": "ISO8601", "duration_ms": 123, "retries": 0}
  ],
  "failure_context": {...},
  "gate_context": {...},
  "metrics": {...},
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

## State Transition Table
| From | To | Trigger | Condition |
|------|-----|---------|-----------|
| running | paused | PAUSE | Any time |
| running | waiting_gate | SET_GATE | running_phases empty |
| running | failed | END_PHASE failed | Max retries |
| running | completed | END_PHASE success | All phases done |
| running | poc-complete | STORE debt | POC mode |
| paused | running | RESUME | User approves |
| waiting_gate | running | RESUME | User approves gate |
| failed | running | RESUME | User approves retry |
| poc-complete | graduated | graduate-complete | Audit passes |

## Updated Commands
- START_PHASE: Validates status, adds to running_phases array
- END_PHASE: Removes from running_phases, only transitions status when array empty
- SET_GATE: Validates running_phases is empty before setting gate
- PAUSE/RESUME: Unchanged behavior with added validation
