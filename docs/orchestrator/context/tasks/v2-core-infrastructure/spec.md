# v2-core-infrastructure Implementation Spec

## Overview

Add phase timing, gates, and pause/resume capabilities to the orchestrator system. This enables workflow interruption for human review (design gate, final gate) and pause-on-failure with context preservation for later resumption.

## Architecture

From architect design:
- Manifest replaces metadata.json as single source of truth
- Individual phase tracking with running_phases array for parallelization
- Status state machine: running -> waiting_gate/paused/failed/completed
- Full context preservation on pause/gate for resume
- Millisecond timestamp precision

## Type Definitions

### Manifest Schema (JSON)

```typescript
interface PhaseRecord {
  phase: string;           // e.g., "architect", "implementer:task-1"
  status: "success" | "failed";
  started_at: string;      // ISO8601
  ended_at: string;        // ISO8601
  duration_ms: number;
  retries: number;
}

interface RunningPhase {
  phase: string;
  started_at: string;      // ISO8601
}

interface FailureContext {
  phase: string;
  reason: string;
  attempts: number;
  last_feedback: string;
  recommendations: string[];
}

interface GateContext {
  gate: "design" | "final";
  prompt: string;
  options: string[];
  artifacts: string[];
}

interface Metrics {
  total_duration_ms: number | null;
  parallelization_savings_ms: number | null;
  total_retries: number;
}

interface Manifest {
  name: string;
  mode: "standard" | "poc";
  workflow: "orchestrate" | "poc" | "graduate";
  status: "running" | "paused" | "waiting_gate" | "completed" | "failed" | "poc-complete" | "graduated";
  current_phase: string | null;
  running_phases: RunningPhase[];
  completed_phases: PhaseRecord[];
  failure_context: FailureContext | null;
  gate_context: GateContext | null;
  metrics: Metrics;
  created_at: string;      // ISO8601
  updated_at: string;      // ISO8601
}
```

## Tasks

### 1. Update context-manager.md - INIT Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Update INIT command to create `manifest.json` instead of `metadata.json`:

```markdown
### INIT
```
INIT task: <task-name> mode: <standard|poc> workflow: <orchestrate|poc|graduate>
```
Create task folder, set as current task, log to history.

**Parameters:**
- `task`: Task name (will be slugified)
- `mode`: Optional, defaults to "standard". Values: "standard" | "poc"
- `workflow`: Optional, defaults to "orchestrate". Values: "orchestrate" | "poc" | "graduate"

**Behavior:**
- Creates `.claude/context/tasks/<task-slug>/` directory
- Creates `.claude/context/tasks/<task-slug>/manifest.json` with:
  ```json
  {
    "name": "<task-slug>",
    "mode": "standard|poc",
    "workflow": "orchestrate|poc|graduate",
    "status": "running",
    "current_phase": null,
    "running_phases": [],
    "completed_phases": [],
    "failure_context": null,
    "gate_context": null,
    "metrics": {
      "total_duration_ms": null,
      "parallelization_savings_ms": null,
      "total_retries": 0
    },
    "created_at": "ISO8601 timestamp",
    "updated_at": "ISO8601 timestamp"
  }
  ```
- Sets as current task in `current-task.md`
- Appends entry to `history.md`
```

**Edge Cases:**
- If `metadata.json` exists (legacy task) -> treat as error, task already exists
- If `manifest.json` exists -> treat as error, task already exists
- Missing mode parameter -> default to "standard"
- Missing workflow parameter -> default to "orchestrate"

**Tests:**
- Verify manifest.json created with correct schema
- Verify status starts as "running"
- Verify running_phases and completed_phases are empty arrays
- Verify metrics initialized with nulls and zero

---

### 2. Update context-manager.md - START_PHASE Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Add new START_PHASE command section after existing commands:

```markdown
### START_PHASE
```
START_PHASE phase: <phase-name>
```
Record phase start time, add to running_phases array.

**Parameters:**
- `phase`: Phase name (e.g., "architect", "implementer:task-1", "test-writer:task-2")

**Behavior:**
- Validates manifest status is "running" (not paused/waiting_gate/failed)
- Adds entry to `running_phases` array: `{"phase": "<name>", "started_at": "ISO8601"}`
- Sets `current_phase` to phase name (for single-phase) or keeps existing (for parallel)
- Updates `updated_at` timestamp
- Updates manifest.json

**Output Format:**
```
STATUS: success
TASK: <task-slug>
PHASE_STARTED: <phase-name>
STARTED_AT: <ISO8601>
```

**Error Cases:**
- If status is "paused": Return error "Cannot start phase while task is paused"
- If status is "waiting_gate": Return error "Cannot start phase while waiting for gate approval"
- If status is "failed": Return error "Cannot start phase on failed task"
- If phase already in running_phases: Return error "Phase <name> already running"
```

**Edge Cases:**
- Parallel phases (implementer:task-1, implementer:task-2) -> both added to running_phases
- Single phase (architect) -> sets current_phase and adds to running_phases
- Status not "running" -> reject with appropriate error

**Tests:**
- Verify phase added to running_phases array
- Verify started_at is valid ISO8601 timestamp
- Verify error when status is paused
- Verify error when phase already running
- Verify multiple parallel phases can be started

---

### 3. Update context-manager.md - END_PHASE Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Add new END_PHASE command section:

```markdown
### END_PHASE
```
END_PHASE phase: <phase-name> status: <success|failed>
```
Record phase completion, move from running_phases to completed_phases.

**Parameters:**
- `phase`: Phase name that was started
- `status`: "success" or "failed"

**Behavior:**
- Finds phase in `running_phases` array
- Removes from `running_phases`
- Calculates duration_ms from started_at to now
- Adds to `completed_phases`: `{"phase": "<name>", "status": "<status>", "started_at": "...", "ended_at": "...", "duration_ms": <ms>, "retries": 0}`
- If status is "failed", increments retries count in metrics
- Updates `current_phase` to null if running_phases is now empty
- Updates `updated_at` timestamp
- Updates manifest.json

**Output Format:**
```
STATUS: success
TASK: <task-slug>
PHASE_ENDED: <phase-name>
DURATION_MS: <milliseconds>
RESULT: <success|failed>
RUNNING_PHASES: <count remaining>
```

**Error Cases:**
- If phase not in running_phases: Return error "Phase <name> not currently running"
```

**Edge Cases:**
- Last parallel phase ends -> clears current_phase
- Phase ends with failed status -> increment metrics.total_retries
- Phase not found in running_phases -> error

**Tests:**
- Verify phase removed from running_phases
- Verify phase added to completed_phases with timing
- Verify duration_ms calculated correctly
- Verify retries incremented on failure
- Verify error when phase not running

---

### 4. Update context-manager.md - PAUSE Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Add new PAUSE command section:

```markdown
### PAUSE
```
PAUSE reason: <text> recommendations: <comma-separated-list>
```
Pause workflow with failure context for later resumption.

**Parameters:**
- `reason`: Human-readable explanation of why paused
- `recommendations`: Comma-separated list of suggested actions

**Behavior:**
- Validates running_phases is empty (all phases must end before pause)
- Sets `status` to "paused"
- Sets `failure_context`:
  ```json
  {
    "phase": "<current_phase or last completed>",
    "reason": "<reason>",
    "attempts": <from metrics.total_retries>,
    "last_feedback": "",
    "recommendations": ["<item1>", "<item2>"]
  }
  ```
- Updates `updated_at` timestamp
- Updates manifest.json

**Output Format:**
```
STATUS: success
TASK: <task-slug>
ACTION: paused
REASON: <reason>
RECOMMENDATIONS: <list>
RESUME_WITH: /resume <task-slug>
```

**Error Cases:**
- If running_phases not empty: Return error "Cannot pause while phases are running: <list>"
```

**Edge Cases:**
- Pause while phases running -> reject, must END_PHASE first
- Already paused -> update reason and recommendations
- Recommendations as empty string -> empty array

**Tests:**
- Verify status changes to "paused"
- Verify failure_context populated
- Verify error when phases still running
- Verify recommendations parsed from comma-separated string

---

### 5. Update context-manager.md - SET_GATE Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Add new SET_GATE command section:

```markdown
### SET_GATE
```
SET_GATE gate: <design|final> prompt: <text> artifacts: <comma-separated-paths>
```
Set workflow to waiting_gate status for human approval.

**Parameters:**
- `gate`: "design" or "final"
- `prompt`: Text to display to user
- `artifacts`: Comma-separated list of artifact paths to review

**Behavior:**
- Validates running_phases is empty
- Sets `status` to "waiting_gate"
- Sets `gate_context`:
  ```json
  {
    "gate": "design|final",
    "prompt": "<prompt text>",
    "options": ["approve", "reject", "revise"],
    "artifacts": ["path1", "path2"]
  }
  ```
- Updates `updated_at` timestamp
- Updates manifest.json

**Output Format:**
```
STATUS: success
TASK: <task-slug>
ACTION: gate_set
GATE: <design|final>
PROMPT: <prompt>
ARTIFACTS: <list>
RESUME_WITH: /resume <task-slug>
```

**Error Cases:**
- If running_phases not empty: Return error "Cannot set gate while phases are running"
- If gate not "design" or "final": Return error "Invalid gate type: <gate>"
```

**Edge Cases:**
- Artifacts as empty string -> empty array
- Invalid gate type -> error
- Already at a gate -> overwrite with new gate

**Tests:**
- Verify status changes to "waiting_gate"
- Verify gate_context populated correctly
- Verify options always include approve/reject/revise
- Verify error when phases still running

---

### 6. Update context-manager.md - RESUME Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Add new RESUME command section:

```markdown
### RESUME
```
RESUME decision: <approve|reject|retry>
```
Clear pause/gate state and return workflow continuation point.

**Parameters:**
- `decision`: User's decision - "approve", "reject", or "retry"

**Behavior:**
- Validates status is "paused" or "waiting_gate"
- If status was "waiting_gate":
  - Returns gate decision and next phase based on gate type
  - design gate + approve -> continue to spec
  - final gate + approve -> mark completed
  - reject -> mark failed
- If status was "paused":
  - retry -> continue from failure point
  - reject -> mark failed
- Clears `failure_context` or `gate_context` (sets to null)
- Sets `status` to "running" (or "completed"/"failed" based on decision)
- Updates `updated_at` timestamp
- Returns continuation point based on `completed_phases`

**Output Format:**
```
STATUS: success
TASK: <task-slug>
ACTION: resumed
PREVIOUS_STATE: <paused|waiting_gate>
DECISION: <approve|reject|retry>
CONTINUE_FROM: <next-phase-name>
COMPLETED_PHASES: <list>
```

**Error Cases:**
- If status is "running": Return error "Task is not paused or waiting for gate"
- If status is "completed": Return error "Task is already completed"
- If invalid decision: Return error "Invalid decision: <decision>. Use approve, reject, or retry"
```

**Edge Cases:**
- Resume from design gate with approve -> continue to spec-writer
- Resume from final gate with approve -> mark completed
- Resume from pause with retry -> continue from last failed phase
- Resume with reject -> mark task as failed

**Tests:**
- Verify status changes from paused to running
- Verify gate_context cleared on resume
- Verify failure_context cleared on resume
- Verify correct CONTINUE_FROM based on completed phases
- Verify reject sets status to failed

---

### 7. Update context-manager.md - LIST Command [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Update LIST command to read from manifest.json:

```markdown
### LIST
```
LIST
```
Return all task folders with mode, status, workflow, and timestamps.

**Output format:**
```
TASKS:
- <task-slug> | mode: <standard|poc> | workflow: <orchestrate|poc|graduate> | status: <status> | created: <timestamp>
- <task-slug> | mode: <standard|poc> | workflow: <orchestrate|poc|graduate> | status: <status> | created: <timestamp>
```

**Behavior:**
- Reads manifest.json from each task folder
- Falls back to metadata.json for legacy tasks (maps old status values)
- Shows mode, workflow, and status for each task
- Sorts by created_at (newest first)
- If neither manifest.json nor metadata.json exists, logs warning and skips that task

**Status values displayed:**
- `running`: Task actively in progress
- `paused`: Task paused due to failure, needs user decision
- `waiting_gate`: Task waiting for gate approval
- `completed`: Task fully finished
- `failed`: Task failed and was rejected
- `poc-complete`: POC implementation done, ready for graduation
- `graduated`: POC successfully promoted to production

**Legacy Mapping (metadata.json -> manifest status):**
- `in-progress` -> `running`
```

**Edge Cases:**
- Only metadata.json exists (legacy) -> read and map status
- Both exist -> prefer manifest.json
- Neither exists -> skip with warning
- Corrupted JSON -> skip with warning

**Tests:**
- Verify manifest.json read correctly
- Verify legacy metadata.json fallback works
- Verify status mapping for legacy tasks
- Verify workflow field displayed

---

### 8. Update context-manager.md - Storage Location [parallel]

**Modifies:** `.claude/agents/context-manager.md`

**Changes:**
Update the Storage Location section to show manifest.json:

```markdown
## Storage Location

`.claude/context/`
```
├── current-task.md          # Active task pointer + summary
├── history.md               # Global append-only log
└── tasks/
    └── <task-slug>/         # e.g., "dark-mode", "user-auth"
        ├── manifest.json             # Task state, phases, gates, metrics
        ├── architect.md
        ├── architect-revision-<n>.md  # If design was revised
        ├── design-audit.md            # Design audit result
        ├── spec.md
        ├── implementations/
        │   ├── task-001.md
        │   └── task-002.md
        ├── implementation-fix-<n>.md  # If implementation was fixed
        ├── tests/
        │   └── task-001.md
        ├── test-results.md
        ├── impl-audit.md              # Implementation audit result
        ├── audit-history.json         # All audit iterations
        └── debt.md                    # POC only: skipped phases, known issues
```
```

**Tests:**
- Documentation accuracy (no runtime tests)

---

### 9. Create resume.md Command [sequential:after-1,2,3,4,5,6]

**Creates:** `.claude/commands/resume.md`

**Content:**
```markdown
---
description: Resume a paused task or approve a gate
allowed-tools: Task(context-manager)
---

# Resume Command

Resume a paused workflow or respond to a gate prompt.

## Usage

```
/resume <task-slug>
```

## Workflow

### Step 1: Get Task State

```
Task(context-manager, "RETRIEVE needs: manifest for_phase: resume task: <task-slug>")
```

### Step 2: Display State to User

If status is `waiting_gate`:
```
GATE: <design|final>
PROMPT: <gate prompt>
ARTIFACTS TO REVIEW:
- <artifact1>
- <artifact2>

Options: [approve] [reject] [revise]
```

If status is `paused`:
```
PAUSED AT: <phase>
REASON: <failure reason>
ATTEMPTS: <count>
RECOMMENDATIONS:
- <rec1>
- <rec2>

Options: [retry] [reject]
```

### Step 3: Get User Decision

Wait for user to provide decision: approve, reject, retry, or revise

### Step 4: Execute Resume

```
Task(context-manager, "RESUME decision: <user-decision>")
```

### Step 5: Continue Workflow

Based on CONTINUE_FROM returned:
- If `spec-writer`: Route to /orchestrate continuation
- If `implementer`: Route to /orchestrate continuation
- If `completed`: Display completion message
- If `failed`: Display failure summary

## Error Handling

- Task not found: "No task found with slug: <slug>"
- Task not paused/gated: "Task <slug> is not paused or waiting for approval. Current status: <status>"
- Invalid decision: "Invalid decision. Please choose from: <options>"

## Examples

```
/resume my-feature
> Task my-feature is waiting for DESIGN GATE approval
> Review: .claude/context/tasks/my-feature/architect.md
> [approve] to continue, [reject] to cancel, [revise] to send back to architect

User: approve
> Resuming... continuing to spec-writer phase
```

---

## Your Task

$ARGUMENTS
```

**Edge Cases:**
- Task slug not found -> error message
- Task not in paused/waiting_gate state -> error message
- User provides invalid decision -> prompt again with valid options

**Tests:**
- Verify correct state displayed for waiting_gate
- Verify correct state displayed for paused
- Verify RESUME called with correct decision
- Verify routing to correct continuation point

---

### 10. Update orchestrate.md - Phase Timing [sequential:after-1,2,3]

**Modifies:** `.claude/commands/orchestrate.md`

**Changes:**
Add phase timing around each agent call. Update Step 2 to include workflow parameter:

```markdown
## Step 2: Initialize Context

```
Task(context-manager, "LIST")
Task(context-manager, "INIT task: <task-name> mode: standard workflow: orchestrate")
```
```

Add phase timing pattern after Step 3 section:

```markdown
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
```

**Tests:**
- Verify START_PHASE called before each agent
- Verify END_PHASE called after each agent with correct status
- Verify parallel phases tracked separately

---

### 11. Update orchestrate.md - Design Gate [sequential:after-5,10]

**Modifies:** `.claude/commands/orchestrate.md`

**Changes:**
Add design gate section after Phase 2: Design Audit:

```markdown
## Phase 2.5: Design Gate

After design audit passes, set gate for human approval:

```
Task(context-manager, "SET_GATE gate: design prompt: Review architect design before implementation artifacts: .claude/context/tasks/<task-slug>/architect.md,.claude/context/tasks/<task-slug>/design-audit.md")
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
```

**Tests:**
- Verify SET_GATE called after design audit passes
- Verify workflow pauses for user input
- Verify approve continues to spec
- Verify reject marks task failed
- Verify revise loops back to architect

---

### 12. Update orchestrate.md - Final Gate [sequential:after-5,10]

**Modifies:** `.claude/commands/orchestrate.md`

**Changes:**
Add final gate section after Phase 5: Implementation Audit:

```markdown
## Phase 5.5: Final Gate

After implementation audit passes, set gate for final approval:

```
Task(context-manager, "SET_GATE gate: final prompt: Review implementation before marking complete artifacts: .claude/context/tasks/<task-slug>/spec.md,.claude/context/tasks/<task-slug>/impl-audit.md,.claude/context/tasks/<task-slug>/test-results.md")
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
# Output metrics summary
Task(context-manager, "SUMMARY")
```
```

**Tests:**
- Verify SET_GATE called after impl audit passes
- Verify workflow pauses for user input
- Verify approve marks task completed
- Verify metrics summary displayed on completion

---

### 13. Update orchestrate.md - Pause on Failure [sequential:after-4,10]

**Modifies:** `.claude/commands/orchestrate.md`

**Changes:**
Update the max iterations section in Rules and add pause-on-failure pattern:

```markdown
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

To continue: /resume <task-slug>
```

Do NOT escalate - pause and let user decide via /resume.
```

Update Rule 8:
```markdown
8. After max iterations, PAUSE workflow (do not escalate)
```

**Tests:**
- Verify PAUSE called after max iterations
- Verify failure_context includes phase and attempts
- Verify user directed to /resume command

---

### 14. Update poc.md - Phase Timing [sequential:after-1,2,3]

**Modifies:** `.claude/commands/poc.md`

**Changes:**
Add phase timing to the EXACT WORKFLOW section. Update Step 1:

```markdown
### Step 1: Initialize

```
Task(context-manager, "INIT task: <slug-from-user-request> mode: poc workflow: poc")
```
```

Update Step 2:
```markdown
### Step 2: Architect

```
Task(context-manager, "START_PHASE phase: architect")
Task(architect, "DESIGN task: <slug>

POC MODE - Prioritize speed over perfection.

User request:
<paste the user's full request here>

Provide: Design decisions, file structure, interfaces, implementation steps")
Task(context-manager, "END_PHASE phase: architect status: success")
```

Wait for architect to complete, then store:

```
Task(context-manager, "STORE phase: architect content: <paste architect output>")
```
```

Update Step 3:
```markdown
### Step 3: Implementer

```
Task(context-manager, "START_PHASE phase: implementer")
Task(implementer, "IMPLEMENT task: <slug>

POC MODE - Focus on core functionality, skip edge cases.

Architect design:
<paste the architect output here>")
Task(context-manager, "END_PHASE phase: implementer status: success")
```

Wait for implementer to complete, then store:

```
Task(context-manager, "STORE phase: implementation content: <paste implementer output>")
```
```

**Tests:**
- Verify START_PHASE called before architect
- Verify END_PHASE called after architect
- Verify START_PHASE called before implementer
- Verify END_PHASE called after implementer

---

### 15. Update poc.md - Design Gate [sequential:after-5,14]

**Modifies:** `.claude/commands/poc.md`

**Changes:**
Add design gate after Step 2 (Architect):

```markdown
### Step 2.5: Design Gate (Optional)

For POC mode, design gate is optional but recommended for larger changes:

```
Task(context-manager, "SET_GATE gate: design prompt: Review POC design before implementation artifacts: .claude/context/tasks/<task-slug>/architect.md")
```

If gate set, wait for user decision via /resume before continuing to Step 3.

**Skip gate for:**
- Small, well-understood changes
- Time-critical prototypes
- Exploratory work

**Use gate for:**
- Significant architectural decisions
- Changes affecting multiple systems
- Work that may be graduated later
```

**Tests:**
- Verify SET_GATE can be called after architect phase
- Verify gate is optional (workflow can skip)

---

### 16. Update poc.md - Final Gate [sequential:after-5,14]

**Modifies:** `.claude/commands/poc.md`

**Changes:**
Add final gate after Step 4 (Store Debt):

```markdown
### Step 4.5: Final Gate

Before marking POC complete, set final gate:

```
Task(context-manager, "SET_GATE gate: final prompt: Review POC implementation before marking complete artifacts: .claude/context/tasks/<task-slug>/architect.md,.claude/context/tasks/<task-slug>/debt.md")
```

Wait for user decision:
- `approve`: Continue to Step 5 (Report)
- `reject`: Mark task as failed
- `revise`: Loop back to implementer with feedback

```
Task(context-manager, "RESUME decision: <user-decision>")
```
```

**Tests:**
- Verify SET_GATE called before POC marked complete
- Verify approve continues to report
- Verify reject marks task failed

---

### 17. Update poc.md - Pause on Failure [sequential:after-4,14]

**Modifies:** `.claude/commands/poc.md`

**Changes:**
Add pause-on-failure section before Step 5:

```markdown
## Error Handling: Pause on Failure

If architect or implementer fails:

```
Task(context-manager, "END_PHASE phase: <phase> status: failed")
Task(context-manager, "PAUSE reason: <error description> recommendations: Check error logs,Review requirements,Try simpler approach")
```

Output to user:
```
POC WORKFLOW PAUSED
Phase: <phase>
Reason: <error>

Recommendations:
- Check error logs
- Review requirements
- Try simpler approach

To retry: /resume <task-slug>
```

Do NOT continue on failure - pause and let user decide.
```

**Tests:**
- Verify PAUSE called on architect failure
- Verify PAUSE called on implementer failure
- Verify user directed to /resume

---

## Task Dependency Graph

```
[1] INIT Command ────────────────────┐
[2] START_PHASE Command ─────────────┤
[3] END_PHASE Command ───────────────┼─┬─→ [9] resume.md
[4] PAUSE Command ───────────────────┤ │
[5] SET_GATE Command ────────────────┤ │
[6] RESUME Command ──────────────────┤ │
[7] LIST Command ────────────────────┘ │
[8] Storage Location ────────────────┘ │
                                       │
[10] orchestrate.md Phase Timing ──────┼─→ [11] Design Gate
                                       │   [12] Final Gate
                                       │   [13] Pause on Failure
                                       │
[14] poc.md Phase Timing ──────────────┼─→ [15] Design Gate
                                       │   [16] Final Gate
                                       │   [17] Pause on Failure
```

## Summary

| Task | File | Type | Dependencies |
|------|------|------|--------------|
| 1 | context-manager.md | Modify | parallel |
| 2 | context-manager.md | Modify | parallel |
| 3 | context-manager.md | Modify | parallel |
| 4 | context-manager.md | Modify | parallel |
| 5 | context-manager.md | Modify | parallel |
| 6 | context-manager.md | Modify | parallel |
| 7 | context-manager.md | Modify | parallel |
| 8 | context-manager.md | Modify | parallel |
| 9 | resume.md | Create | after-1,2,3,4,5,6 |
| 10 | orchestrate.md | Modify | after-1,2,3 |
| 11 | orchestrate.md | Modify | after-5,10 |
| 12 | orchestrate.md | Modify | after-5,10 |
| 13 | orchestrate.md | Modify | after-4,10 |
| 14 | poc.md | Modify | after-1,2,3 |
| 15 | poc.md | Modify | after-5,14 |
| 16 | poc.md | Modify | after-5,14 |
| 17 | poc.md | Modify | after-4,14 |

**Note on parallelization:** Tasks 1-8 all modify context-manager.md, so while marked [parallel] for logical independence, they should be combined into a single implementation pass to avoid conflicts. Similarly, tasks 10-13 modify orchestrate.md and tasks 14-17 modify poc.md.

**Recommended execution order:**
1. First batch: Tasks 1-8 (single implementer, context-manager.md)
2. Second batch: Task 9 (resume.md - new file, can parallel with batch 3)
3. Third batch: Tasks 10-13 (single implementer, orchestrate.md)
4. Fourth batch: Tasks 14-17 (single implementer, poc.md)
