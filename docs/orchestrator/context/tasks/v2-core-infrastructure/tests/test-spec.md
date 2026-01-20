# v2-core-infrastructure Test Specification

This document defines behavioral test specifications for the v2 core infrastructure changes. Since this is a markdown-based agent definition system, these tests describe expected behaviors that can be verified through manual testing or automated integration tests.

---

## 1. context-manager Command Tests

### 1.1 INIT Command Tests

#### Test 1.1.1: INIT creates manifest.json with correct schema
**Input:**
```
INIT task: my-feature mode: standard workflow: orchestrate
```

**Expected Output:**
- Directory created: `.claude/context/tasks/my-feature/`
- File created: `.claude/context/tasks/my-feature/manifest.json`
- manifest.json contains:
```json
{
  "name": "my-feature",
  "mode": "standard",
  "workflow": "orchestrate",
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
  "created_at": "<ISO8601>",
  "updated_at": "<ISO8601>"
}
```

**Assertions:**
- [ ] status is "running"
- [ ] running_phases is empty array
- [ ] completed_phases is empty array
- [ ] metrics.total_retries is 0
- [ ] created_at and updated_at are valid ISO8601 timestamps

#### Test 1.1.2: INIT with POC mode creates correct manifest
**Input:**
```
INIT task: quick-prototype mode: poc workflow: poc
```

**Expected Output:**
- manifest.json contains:
  - `"mode": "poc"`
  - `"workflow": "poc"`

**Assertions:**
- [ ] mode is "poc"
- [ ] workflow is "poc"

#### Test 1.1.3: INIT defaults mode to standard when not provided
**Input:**
```
INIT task: my-task
```

**Expected Output:**
- manifest.json contains:
  - `"mode": "standard"`
  - `"workflow": "orchestrate"`

**Assertions:**
- [ ] mode defaults to "standard"
- [ ] workflow defaults to "orchestrate"

#### Test 1.1.4: INIT rejects if manifest.json already exists
**Setup:** Create `.claude/context/tasks/existing-task/manifest.json`

**Input:**
```
INIT task: existing-task
```

**Expected Output:**
```
STATUS: error
ERROR: Task already exists: existing-task
```

**Assertions:**
- [ ] Returns error status
- [ ] Does not overwrite existing manifest

#### Test 1.1.5: INIT rejects if legacy metadata.json exists
**Setup:** Create `.claude/context/tasks/legacy-task/metadata.json`

**Input:**
```
INIT task: legacy-task
```

**Expected Output:**
```
STATUS: error
ERROR: Task already exists: legacy-task
```

**Assertions:**
- [ ] Returns error status
- [ ] Does not create manifest.json alongside metadata.json

---

### 1.2 START_PHASE Command Tests

#### Test 1.2.1: START_PHASE adds phase to running_phases
**Setup:** Task with status "running", empty running_phases

**Input:**
```
START_PHASE phase: architect
```

**Expected Output:**
```
STATUS: success
TASK: my-feature
PHASE_STARTED: architect
STARTED_AT: <ISO8601>
```

**Expected manifest.json changes:**
- `running_phases` contains `{"phase": "architect", "started_at": "<ISO8601>"}`
- `current_phase` is "architect"
- `updated_at` is updated

**Assertions:**
- [ ] Phase added to running_phases
- [ ] started_at is valid ISO8601
- [ ] current_phase set correctly

#### Test 1.2.2: START_PHASE allows parallel phases
**Setup:** Task with status "running", running_phases contains `implementer:task-1`

**Input:**
```
START_PHASE phase: test-writer:task-1
```

**Expected Output:**
```
STATUS: success
PHASE_STARTED: test-writer:task-1
```

**Expected manifest.json changes:**
- `running_phases` contains both `implementer:task-1` and `test-writer:task-1`

**Assertions:**
- [ ] Both phases in running_phases
- [ ] Parallel phases tracked separately

#### Test 1.2.3: START_PHASE rejects when status is paused
**Setup:** Task with status "paused"

**Input:**
```
START_PHASE phase: architect
```

**Expected Output:**
```
STATUS: error
ERROR: Cannot start phase while task is paused
```

**Assertions:**
- [ ] Returns error
- [ ] running_phases unchanged

#### Test 1.2.4: START_PHASE rejects when status is waiting_gate
**Setup:** Task with status "waiting_gate"

**Input:**
```
START_PHASE phase: spec-writer
```

**Expected Output:**
```
STATUS: error
ERROR: Cannot start phase while waiting for gate approval
```

**Assertions:**
- [ ] Returns error
- [ ] running_phases unchanged

#### Test 1.2.5: START_PHASE rejects when phase already running
**Setup:** Task with running_phases containing `architect`

**Input:**
```
START_PHASE phase: architect
```

**Expected Output:**
```
STATUS: error
ERROR: Phase architect already running
```

**Assertions:**
- [ ] Returns error
- [ ] No duplicate phase added

---

### 1.3 END_PHASE Command Tests

#### Test 1.3.1: END_PHASE moves phase to completed_phases with success
**Setup:** Task with running_phases containing `{"phase": "architect", "started_at": "2026-01-19T10:00:00.000Z"}`

**Input:**
```
END_PHASE phase: architect status: success
```

**Expected Output:**
```
STATUS: success
TASK: my-feature
PHASE_ENDED: architect
DURATION_MS: <calculated>
RESULT: success
RUNNING_PHASES: 0
```

**Expected manifest.json changes:**
- `running_phases` is empty
- `completed_phases` contains:
```json
{
  "phase": "architect",
  "status": "success",
  "started_at": "2026-01-19T10:00:00.000Z",
  "ended_at": "<ISO8601>",
  "duration_ms": <calculated>,
  "retries": 0
}
```

**Assertions:**
- [ ] Phase removed from running_phases
- [ ] Phase added to completed_phases
- [ ] duration_ms calculated correctly
- [ ] current_phase cleared when running_phases empty

#### Test 1.3.2: END_PHASE with failed status increments retries
**Setup:** Task with running_phases containing `implementer`, metrics.total_retries = 0

**Input:**
```
END_PHASE phase: implementer status: failed
```

**Expected Output:**
```
RESULT: failed
```

**Expected manifest.json changes:**
- `completed_phases` entry has `"status": "failed"`
- `metrics.total_retries` is 1

**Assertions:**
- [ ] Phase status is "failed"
- [ ] metrics.total_retries incremented

#### Test 1.3.3: END_PHASE rejects when phase not running
**Setup:** Task with empty running_phases

**Input:**
```
END_PHASE phase: architect status: success
```

**Expected Output:**
```
STATUS: error
ERROR: Phase architect not currently running
```

**Assertions:**
- [ ] Returns error
- [ ] No changes to completed_phases

#### Test 1.3.4: END_PHASE preserves other running phases
**Setup:** running_phases contains `implementer:task-1` and `test-writer:task-1`

**Input:**
```
END_PHASE phase: implementer:task-1 status: success
```

**Expected manifest.json changes:**
- `running_phases` contains only `test-writer:task-1`
- `completed_phases` contains `implementer:task-1`

**Assertions:**
- [ ] Only ended phase removed
- [ ] Other running phases preserved

---

### 1.4 PAUSE Command Tests

#### Test 1.4.1: PAUSE sets status and failure_context
**Setup:** Task with status "running", empty running_phases, current_phase "architect"

**Input:**
```
PAUSE reason: Max iterations reached for architect recommendations: Review audit feedback,Consider architectural changes
```

**Expected Output:**
```
STATUS: success
TASK: my-feature
ACTION: paused
REASON: Max iterations reached for architect
RECOMMENDATIONS: Review audit feedback, Consider architectural changes
RESUME_WITH: /resume my-feature
```

**Expected manifest.json changes:**
- `status` is "paused"
- `failure_context`:
```json
{
  "phase": "architect",
  "reason": "Max iterations reached for architect",
  "attempts": 0,
  "last_feedback": "",
  "recommendations": ["Review audit feedback", "Consider architectural changes"]
}
```

**Assertions:**
- [ ] Status changed to "paused"
- [ ] failure_context populated correctly
- [ ] Recommendations parsed from comma-separated string

#### Test 1.4.2: PAUSE rejects when phases still running
**Setup:** running_phases contains `implementer`

**Input:**
```
PAUSE reason: Test failure recommendations: Fix tests
```

**Expected Output:**
```
STATUS: error
ERROR: Cannot pause while phases are running: implementer
```

**Assertions:**
- [ ] Returns error
- [ ] Status unchanged

#### Test 1.4.3: PAUSE with empty recommendations
**Input:**
```
PAUSE reason: Manual pause requested recommendations:
```

**Expected manifest.json changes:**
- `failure_context.recommendations` is `[]`

**Assertions:**
- [ ] Empty recommendations creates empty array

---

### 1.5 SET_GATE Command Tests

#### Test 1.5.1: SET_GATE creates design gate
**Setup:** Task with status "running", empty running_phases

**Input:**
```
SET_GATE gate: design prompt: Review architect design before implementation artifacts: .claude/context/tasks/my-feature/architect.md,.claude/context/tasks/my-feature/design-audit.md
```

**Expected Output:**
```
STATUS: success
TASK: my-feature
ACTION: gate_set
GATE: design
PROMPT: Review architect design before implementation
ARTIFACTS: .claude/context/tasks/my-feature/architect.md, .claude/context/tasks/my-feature/design-audit.md
RESUME_WITH: /resume my-feature
```

**Expected manifest.json changes:**
- `status` is "waiting_gate"
- `gate_context`:
```json
{
  "gate": "design",
  "prompt": "Review architect design before implementation",
  "options": ["approve", "reject", "revise"],
  "artifacts": [".claude/context/tasks/my-feature/architect.md", ".claude/context/tasks/my-feature/design-audit.md"]
}
```

**Assertions:**
- [ ] Status changed to "waiting_gate"
- [ ] gate_context.gate is "design"
- [ ] options contains approve, reject, revise
- [ ] artifacts parsed correctly

#### Test 1.5.2: SET_GATE creates final gate
**Input:**
```
SET_GATE gate: final prompt: Review implementation artifacts: spec.md,impl-audit.md
```

**Expected manifest.json changes:**
- `gate_context.gate` is "final"

**Assertions:**
- [ ] gate_context.gate is "final"

#### Test 1.5.3: SET_GATE rejects invalid gate type
**Input:**
```
SET_GATE gate: unknown prompt: test artifacts: test.md
```

**Expected Output:**
```
STATUS: error
ERROR: Invalid gate type: unknown
```

**Assertions:**
- [ ] Returns error
- [ ] Status unchanged

#### Test 1.5.4: SET_GATE rejects when phases running
**Setup:** running_phases contains `implementer`

**Input:**
```
SET_GATE gate: design prompt: test artifacts: test.md
```

**Expected Output:**
```
STATUS: error
ERROR: Cannot set gate while phases are running
```

**Assertions:**
- [ ] Returns error
- [ ] gate_context remains null

---

### 1.6 RESUME Command Tests

#### Test 1.6.1: RESUME from waiting_gate with approve
**Setup:** status "waiting_gate", gate_context with gate "design"

**Input:**
```
RESUME decision: approve
```

**Expected Output:**
```
STATUS: success
TASK: my-feature
ACTION: resumed
PREVIOUS_STATE: waiting_gate
DECISION: approve
CONTINUE_FROM: spec-writer
COMPLETED_PHASES: architect, design-audit
```

**Expected manifest.json changes:**
- `status` is "running"
- `gate_context` is null

**Assertions:**
- [ ] Status changed to "running"
- [ ] gate_context cleared
- [ ] Correct CONTINUE_FROM returned

#### Test 1.6.2: RESUME from waiting_gate with reject
**Setup:** status "waiting_gate", gate_context with gate "design"

**Input:**
```
RESUME decision: reject
```

**Expected manifest.json changes:**
- `status` is "failed"
- `gate_context` is null

**Assertions:**
- [ ] Status changed to "failed"

#### Test 1.6.3: RESUME from paused with retry
**Setup:** status "paused", failure_context with phase "implementer"

**Input:**
```
RESUME decision: retry
```

**Expected Output:**
```
CONTINUE_FROM: implementer
```

**Expected manifest.json changes:**
- `status` is "running"
- `failure_context` is null

**Assertions:**
- [ ] Status changed to "running"
- [ ] failure_context cleared
- [ ] CONTINUE_FROM is failed phase

#### Test 1.6.4: RESUME from final gate with approve marks completed
**Setup:** status "waiting_gate", gate_context with gate "final"

**Input:**
```
RESUME decision: approve
```

**Expected manifest.json changes:**
- `status` is "completed"

**Assertions:**
- [ ] Status changed to "completed"

#### Test 1.6.5: RESUME rejects when task is running
**Setup:** status "running"

**Input:**
```
RESUME decision: approve
```

**Expected Output:**
```
STATUS: error
ERROR: Task is not paused or waiting for gate
```

**Assertions:**
- [ ] Returns error

#### Test 1.6.6: RESUME rejects invalid decision
**Input:**
```
RESUME decision: maybe
```

**Expected Output:**
```
STATUS: error
ERROR: Invalid decision: maybe. Use approve, reject, or retry
```

**Assertions:**
- [ ] Returns error with valid options listed

---

### 1.7 LIST Command Tests

#### Test 1.7.1: LIST reads manifest.json correctly
**Setup:** Multiple tasks with manifest.json files

**Input:**
```
LIST
```

**Expected Output:**
```
TASKS:
- feature-a | mode: standard | workflow: orchestrate | status: running | created: 2026-01-19T10:00:00Z
- feature-b | mode: poc | workflow: poc | status: waiting_gate | created: 2026-01-18T10:00:00Z
```

**Assertions:**
- [ ] All tasks listed
- [ ] Workflow field displayed
- [ ] Sorted by created_at (newest first)

#### Test 1.7.2: LIST falls back to metadata.json for legacy tasks
**Setup:** Task with only metadata.json (status: "in-progress")

**Input:**
```
LIST
```

**Expected Output:**
```
TASKS:
- legacy-task | mode: standard | workflow: orchestrate | status: running | created: 2026-01-15T10:00:00Z
```

**Assertions:**
- [ ] Legacy task listed
- [ ] "in-progress" mapped to "running"
- [ ] Default workflow "orchestrate" used

#### Test 1.7.3: LIST prefers manifest.json when both exist
**Setup:** Task with both manifest.json and metadata.json

**Input:**
```
LIST
```

**Assertions:**
- [ ] manifest.json data used, not metadata.json

#### Test 1.7.4: LIST skips task with corrupted JSON
**Setup:** Task with invalid JSON in manifest.json

**Input:**
```
LIST
```

**Expected:** Task skipped with warning, other tasks listed

**Assertions:**
- [ ] Corrupted task skipped
- [ ] Warning logged
- [ ] Other tasks still listed

---

## 2. State Transition Tests

### 2.1 Valid Transitions

#### Test 2.1.1: running -> paused via PAUSE
**Initial:** status "running"
**Action:** PAUSE
**Expected:** status "paused"

#### Test 2.1.2: running -> waiting_gate via SET_GATE
**Initial:** status "running"
**Action:** SET_GATE
**Expected:** status "waiting_gate"

#### Test 2.1.3: paused -> running via RESUME retry
**Initial:** status "paused"
**Action:** RESUME decision: retry
**Expected:** status "running"

#### Test 2.1.4: paused -> failed via RESUME reject
**Initial:** status "paused"
**Action:** RESUME decision: reject
**Expected:** status "failed"

#### Test 2.1.5: waiting_gate -> running via RESUME approve (design gate)
**Initial:** status "waiting_gate", gate "design"
**Action:** RESUME decision: approve
**Expected:** status "running"

#### Test 2.1.6: waiting_gate -> completed via RESUME approve (final gate)
**Initial:** status "waiting_gate", gate "final"
**Action:** RESUME decision: approve
**Expected:** status "completed"

#### Test 2.1.7: waiting_gate -> failed via RESUME reject
**Initial:** status "waiting_gate"
**Action:** RESUME decision: reject
**Expected:** status "failed"

### 2.2 Invalid Transitions

#### Test 2.2.1: Cannot start phase when paused
**Initial:** status "paused"
**Action:** START_PHASE
**Expected:** Error returned

#### Test 2.2.2: Cannot start phase when waiting_gate
**Initial:** status "waiting_gate"
**Action:** START_PHASE
**Expected:** Error returned

#### Test 2.2.3: Cannot resume when running
**Initial:** status "running"
**Action:** RESUME
**Expected:** Error returned

#### Test 2.2.4: Cannot pause when phases running
**Initial:** status "running", running_phases non-empty
**Action:** PAUSE
**Expected:** Error returned

### 2.3 Parallel Phase Tracking

#### Test 2.3.1: Multiple phases started in parallel
**Actions:**
1. START_PHASE phase: implementer:task-1
2. START_PHASE phase: test-writer:task-1
3. START_PHASE phase: implementer:task-2

**Expected:** running_phases contains all three phases

#### Test 2.3.2: Parallel phases end independently
**Setup:** running_phases contains `implementer:task-1`, `test-writer:task-1`

**Actions:**
1. END_PHASE phase: implementer:task-1 status: success
2. END_PHASE phase: test-writer:task-1 status: success

**Expected:**
- After step 1: running_phases contains only `test-writer:task-1`
- After step 2: running_phases empty, completed_phases contains both

---

## 3. resume.md Command Tests

### 3.1 Loading and Display

#### Test 3.1.1: Loads manifest correctly
**Input:**
```
/resume my-feature
```

**Expected:** Task retrieved from context-manager with correct task slug

#### Test 3.1.2: Displays gate context when waiting_gate
**Setup:** status "waiting_gate", gate_context for design gate

**Expected Display:**
```
GATE: design
PROMPT: Review architect design before implementation
ARTIFACTS TO REVIEW:
- .claude/context/tasks/my-feature/architect.md
- .claude/context/tasks/my-feature/design-audit.md

Options: [approve] [reject] [revise]
```

**Assertions:**
- [ ] Gate type displayed
- [ ] Prompt displayed
- [ ] Artifacts listed
- [ ] Options shown

#### Test 3.1.3: Displays failure context when paused
**Setup:** status "paused", failure_context present

**Expected Display:**
```
PAUSED AT: implementer
REASON: Max iterations reached
ATTEMPTS: 2
RECOMMENDATIONS:
- Review audit feedback
- Consider architectural changes

Options: [retry] [reject]
```

**Assertions:**
- [ ] Phase displayed
- [ ] Reason displayed
- [ ] Attempts shown
- [ ] Recommendations listed
- [ ] Only retry/reject options (not approve)

### 3.2 Routing

#### Test 3.2.1: Routes to spec-writer after design gate approve
**Setup:** waiting_gate, gate "design"
**User decision:** approve

**Expected:** CONTINUE_FROM is "spec-writer"

#### Test 3.2.2: Routes to implementer after pause retry
**Setup:** paused, failure_context.phase is "implementer"
**User decision:** retry

**Expected:** CONTINUE_FROM is "implementer"

#### Test 3.2.3: Shows completion message after final gate approve
**Setup:** waiting_gate, gate "final"
**User decision:** approve

**Expected:** Completion message displayed, status is "completed"

### 3.3 Error Handling

#### Test 3.3.1: Task not found error
**Input:**
```
/resume nonexistent-task
```

**Expected Output:**
```
No task found with slug: nonexistent-task
```

#### Test 3.3.2: Task not paused or gated error
**Setup:** Task with status "running"

**Input:**
```
/resume my-feature
```

**Expected Output:**
```
Task my-feature is not paused or waiting for approval. Current status: running
```

#### Test 3.3.3: Invalid decision prompts again
**Setup:** waiting_gate

**User input:** "maybe"

**Expected:** Re-prompt with valid options

---

## 4. orchestrate.md Workflow Tests

### 4.1 Phase Timing

#### Test 4.1.1: Phase timing recorded for architect
**Workflow Step:** Architect phase

**Expected Calls:**
1. `START_PHASE phase: architect`
2. `Task(architect, ...)`
3. `END_PHASE phase: architect status: success`

**Assertions:**
- [ ] START_PHASE called before architect
- [ ] END_PHASE called after architect completes

#### Test 4.1.2: Phase timing recorded for parallel implementer/test-writer
**Workflow Step:** Implementation phase

**Expected Calls:**
1. `START_PHASE phase: implementer:task-1`
2. `START_PHASE phase: test-writer:task-1`
3. `Task(implementer, ...)` and `Task(test-writer, ...)` in parallel
4. `END_PHASE phase: implementer:task-1 status: success`
5. `END_PHASE phase: test-writer:task-1 status: success`

**Assertions:**
- [ ] Both phases started before agents run
- [ ] Both phases ended after agents complete
- [ ] Phases tracked separately

### 4.2 Design Gate

#### Test 4.2.1: Design gate pauses after design audit passes
**Workflow:** After design audit returns PASS

**Expected Call:**
```
SET_GATE gate: design prompt: Review architect design before implementation artifacts: <architect.md>,<design-audit.md>
```

**Assertions:**
- [ ] SET_GATE called after design audit passes
- [ ] Status becomes "waiting_gate"
- [ ] Workflow pauses (does not continue to spec-writer)

#### Test 4.2.2: Approve continues to spec-writer
**Setup:** At design gate

**User decision:** approve

**Expected:** Workflow continues to spec-writer phase

#### Test 4.2.3: Reject marks task failed
**Setup:** At design gate

**User decision:** reject

**Expected:** Status becomes "failed", workflow exits

#### Test 4.2.4: Revise loops back to architect
**Setup:** At design gate

**User decision:** revise (with feedback)

**Expected:**
- START_PHASE phase: architect-revision
- Task(architect, "REVISE: <feedback>")
- END_PHASE phase: architect-revision
- Loop back to design audit

### 4.3 Final Gate

#### Test 4.3.1: Final gate pauses after impl audit passes
**Workflow:** After implementation audit returns PASS

**Expected Call:**
```
SET_GATE gate: final prompt: Review implementation before marking complete artifacts: <spec.md>,<impl-audit.md>,<test-results.md>
```

**Assertions:**
- [ ] SET_GATE called after impl audit passes
- [ ] Status becomes "waiting_gate"
- [ ] Workflow pauses

#### Test 4.3.2: Approve marks task completed with metrics
**Setup:** At final gate

**User decision:** approve

**Expected:**
- Status becomes "completed"
- SUMMARY command called
- Metrics displayed

### 4.4 Pause on Failure

#### Test 4.4.1: Pause triggers after max retries
**Setup:** Design audit fails twice (iteration 2)

**Expected Calls:**
```
END_PHASE phase: architect status: failed
PAUSE reason: Max iterations reached for architect without passing audit recommendations: Review audit feedback,Consider architectural changes,Manual intervention may be needed
```

**Assertions:**
- [ ] PAUSE called after max iterations
- [ ] failure_context includes correct phase
- [ ] failure_context includes attempt count
- [ ] User directed to /resume

#### Test 4.4.2: No escalation, only pause
**After max iterations:**

**Expected:**
- Workflow pauses
- Does NOT automatically escalate
- User can resume with /resume

---

## 5. poc.md Workflow Tests

### 5.1 Phase Timing

#### Test 5.1.1: INIT with POC mode and workflow
**Expected Call:**
```
INIT task: <slug> mode: poc workflow: poc
```

**Assertions:**
- [ ] mode is "poc"
- [ ] workflow is "poc"

#### Test 5.1.2: Architect phase timing recorded
**Expected Calls:**
```
START_PHASE phase: architect
Task(architect, "DESIGN task: <slug> POC MODE...")
END_PHASE phase: architect status: success
```

**Assertions:**
- [ ] START_PHASE called before architect
- [ ] END_PHASE called after architect

#### Test 5.1.3: Implementer phase timing recorded
**Expected Calls:**
```
START_PHASE phase: implementer
Task(implementer, "IMPLEMENT task: <slug> POC MODE...")
END_PHASE phase: implementer status: success
```

**Assertions:**
- [ ] START_PHASE called before implementer
- [ ] END_PHASE called after implementer

### 5.2 Gates in POC Mode

#### Test 5.2.1: Design gate is optional
**POC Workflow:**

**Expected:** Workflow can proceed without design gate for small changes

**Assertions:**
- [ ] Design gate can be skipped
- [ ] Workflow continues to implementer

#### Test 5.2.2: Design gate can be used for larger changes
**POC Workflow with significant changes:**

**Expected Call:**
```
SET_GATE gate: design prompt: Review POC design before implementation artifacts: <architect.md>
```

**Assertions:**
- [ ] SET_GATE can be called
- [ ] Workflow pauses if gate set

#### Test 5.2.3: Final gate before POC complete
**Before marking POC complete:**

**Expected Call:**
```
SET_GATE gate: final prompt: Review POC implementation before marking complete artifacts: <architect.md>,<debt.md>
```

**Assertions:**
- [ ] SET_GATE called before Step 5 (Report)
- [ ] Workflow pauses for approval

#### Test 5.2.4: Final gate approve continues to report
**Setup:** At final gate

**User decision:** approve

**Expected:** Workflow continues to Step 5 (Report)

### 5.3 Pause on Failure

#### Test 5.3.1: Pause on architect failure
**Setup:** Architect phase fails

**Expected Calls:**
```
END_PHASE phase: architect status: failed
PAUSE reason: <error description> recommendations: Check error logs,Review requirements,Try simpler approach
```

**Assertions:**
- [ ] PAUSE called on failure
- [ ] failure_context populated
- [ ] User directed to /resume

#### Test 5.3.2: Pause on implementer failure
**Setup:** Implementer phase fails

**Expected Calls:**
```
END_PHASE phase: implementer status: failed
PAUSE reason: <error description> recommendations: Check error logs,Review requirements,Try simpler approach
```

**Assertions:**
- [ ] PAUSE called on failure
- [ ] User directed to /resume

#### Test 5.3.3: No continue on failure
**After failure:**

**Expected:**
- Workflow stops
- Does NOT continue to next phase
- User must /resume

---

## 6. Edge Cases Summary

### 6.1 Manifest Schema Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Missing mode parameter in INIT | Default to "standard" |
| Missing workflow parameter in INIT | Default to "orchestrate" |
| Empty recommendations in PAUSE | Empty array |
| Empty artifacts in SET_GATE | Empty array |
| Timestamps | ISO8601 with milliseconds |

### 6.2 State Machine Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| PAUSE while phases running | Error returned |
| SET_GATE while phases running | Error returned |
| START_PHASE when paused | Error returned |
| START_PHASE when waiting_gate | Error returned |
| RESUME when running | Error returned |
| RESUME when completed | Error returned |

### 6.3 Legacy Compatibility Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| metadata.json exists (no manifest) | Read and map status |
| Both metadata.json and manifest.json exist | Prefer manifest.json |
| Neither exists | Skip with warning |
| Corrupted JSON | Skip with warning |
| Legacy "in-progress" status | Map to "running" |

### 6.4 Parallel Phase Edge Cases

| Edge Case | Expected Behavior |
|-----------|-------------------|
| Same phase name started twice | Error returned |
| END_PHASE for non-running phase | Error returned |
| Multiple parallel phases end | Each tracked independently |
| All parallel phases complete | current_phase cleared |

---

## Test Execution Checklist

### context-manager.md Tests
- [ ] 1.1.1 - 1.1.5: INIT Command (5 tests)
- [ ] 1.2.1 - 1.2.5: START_PHASE Command (5 tests)
- [ ] 1.3.1 - 1.3.4: END_PHASE Command (4 tests)
- [ ] 1.4.1 - 1.4.3: PAUSE Command (3 tests)
- [ ] 1.5.1 - 1.5.4: SET_GATE Command (4 tests)
- [ ] 1.6.1 - 1.6.6: RESUME Command (6 tests)
- [ ] 1.7.1 - 1.7.4: LIST Command (4 tests)

### State Transition Tests
- [ ] 2.1.1 - 2.1.7: Valid Transitions (7 tests)
- [ ] 2.2.1 - 2.2.4: Invalid Transitions (4 tests)
- [ ] 2.3.1 - 2.3.2: Parallel Phase Tracking (2 tests)

### resume.md Tests
- [ ] 3.1.1 - 3.1.3: Loading and Display (3 tests)
- [ ] 3.2.1 - 3.2.3: Routing (3 tests)
- [ ] 3.3.1 - 3.3.3: Error Handling (3 tests)

### orchestrate.md Tests
- [ ] 4.1.1 - 4.1.2: Phase Timing (2 tests)
- [ ] 4.2.1 - 4.2.4: Design Gate (4 tests)
- [ ] 4.3.1 - 4.3.2: Final Gate (2 tests)
- [ ] 4.4.1 - 4.4.2: Pause on Failure (2 tests)

### poc.md Tests
- [ ] 5.1.1 - 5.1.3: Phase Timing (3 tests)
- [ ] 5.2.1 - 5.2.4: Gates in POC Mode (4 tests)
- [ ] 5.3.1 - 5.3.3: Pause on Failure (3 tests)

**Total Test Cases: 73**
