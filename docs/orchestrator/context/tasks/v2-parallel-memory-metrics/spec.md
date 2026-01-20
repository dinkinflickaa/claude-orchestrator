# v2-parallel-memory-metrics Specification

## Overview
This specification details the implementation of three remaining v2 phases: Parallel Execution (4), Memory System (6), and Metrics Output (7). The specification breaks down the architecture into concrete, testable components with explicit file locations, function signatures, and integration points.

---

## Phase 1: Task Breakdown Format (architect.md)

### Purpose
Enable the architect to output tasks with explicit dependencies so the orchestrator can execute them in parallel waves.

### File: `src/architect.md`

#### New Section: "Task Breakdown"
Insert after the main analysis section, before the conclusion.

#### Output Schema
```json
{
  "taskBreakdown": {
    "tasks": [
      {
        "id": 1,
        "name": "string (human-readable task name)",
        "files": ["array of file paths to modify/create"],
        "dependencies": [
          "array of task IDs this task depends on (empty if no dependencies)"
        ],
        "description": "string (1-2 sentence description of what this task does)"
      }
    ]
  }
}
```

#### Requirements
- Each task must have a unique `id` (integer, starting from 1)
- `dependencies` array must reference valid task IDs
- All tasks with no dependencies must have `dependencies: []`
- Tasks must be ordered topologically (dependencies always have lower IDs)
- Minimum 2-3 tasks for typical features, up to 10 for complex ones
- Each file path must be relative to project root

#### Integration Point
- Architect outputs this JSON block as the last section of architect.md
- Orchestrator parses this section to build the execution plan
- Used by both orchestrate.md (for parallel wave execution) and poc.md (for parallel implementers)

---

## Phase 2: Memory Injection (architect.md + auditor.md)

### Purpose
Inject previously captured design decisions and patterns into the architect and auditor to maintain consistency and avoid re-solving problems.

### File: `src/architect.md`

#### New Section: "Memory Injection"
Insert at the very beginning, before "Analysis", as a metadata block.

#### Input: `decisions.md` and `patterns.md`
- Read from project root: `/decisions.md` and `/patterns.md`
- If files don't exist, continue without error
- Extract relevant entries based on task domain keywords

#### Output Format in architect.md
```markdown
## Memory Injection

### Previous Decisions Referenced
- Decision: "[topic]" → [key insight]
  - Source: task-slug
  - Rationale: [brief summary of why this applies]

### Previous Patterns Referenced
- Pattern: "[name]" → [pattern description]
  - Source: task-slug
  - Application: [how this pattern is being used]
```

#### Requirements
- Section is optional (skip if decisions.md/patterns.md don't exist or are empty)
- Maximum 3-5 decisions/patterns per task to avoid noise
- Include source (task-slug) for traceability
- Explicitly explain connection to current design
- Do NOT copy full decision/pattern text; summarize

### File: `src/auditor.md`

#### New Field in Audit Output
Add `memory_candidates` array to audit output.

#### Output Format
```json
{
  "audit": {
    "memory_candidates": [
      {
        "type": "decision",
        "category": "string (e.g., 'parallel-execution', 'error-handling')",
        "summary": "string (1-2 sentence summary)",
        "rationale": "string (why save this)"
      },
      {
        "type": "pattern",
        "category": "string (e.g., 'task-breakdown', 'wave-execution')",
        "summary": "string",
        "rationale": "string"
      }
    ]
  }
}
```

#### Requirements
- Auditor extracts 2-5 candidates from the review
- Candidates represent reusable insights from this task
- Each candidate must have a clear category for filing
- `type` must be "decision" or "pattern"
- Candidates appear in orchestrator output for user review

---

## Phase 3: Wave Execution Model (orchestrate.md)

### Purpose
Execute tasks in parallel waves based on dependency graph, with proper sequencing and spawning of implementer/test-writer pairs.

### File: `src/orchestrate.md`

#### New Section: "Wave Execution Engine"
Insert after task parsing, before implementer spawning.

#### Algorithm

```
Input: taskBreakdown from architect.md
Output: waves (array of arrays, each inner array = tasks to run in parallel)

1. Create a map: taskId → task object
2. Compute dependency levels:
   - Level 0: tasks with no dependencies
   - Level N: max(dependencies' levels) + 1
3. Group tasks by level:
   - Wave 1: all level 0 tasks
   - Wave 2: all level 1 tasks
   - Wave N: all level N-1 tasks
4. Return ordered waves array
```

#### Implementation Details

**Function Signature:**
```typescript
interface Task {
  id: number;
  name: string;
  files: string[];
  dependencies: number[];
  description: string;
}

interface Wave {
  waveNumber: number;
  tasks: Task[];
}

function computeWaves(taskBreakdown: { tasks: Task[] }): Wave[] {
  // Implementation
}
```

#### Spawning Pattern
For each wave:
1. For each task in the wave:
   - Spawn `implementer:task-<id>` agent
   - Spawn `test-writer:task-<id>` agent
   - Run both in parallel
2. Wait for all tasks in wave to complete
3. Collect outputs for next wave

#### Output Format
After wave execution completes, orchestrator must collect:
```json
{
  "waves": [
    {
      "waveNumber": 1,
      "tasks": [
        {
          "id": 1,
          "status": "completed",
          "duration": "45s",
          "retries": 0,
          "output": "..."
        }
      ]
    }
  ]
}
```

#### Error Handling
- If a task fails in a wave, halt that wave
- Do NOT proceed to next wave
- Collect all completed tasks for rollback/retry
- Display which task failed and which task dependencies were not met

---

## Phase 4: Metrics Output (orchestrate.md)

### Purpose
Display clear before/after metrics showing parallelization savings.

### File: `src/orchestrate.md`

#### New Section: "Metrics Calculation"
Insert after all waves complete.

#### Input Data Required
- `waveExecutionData`: Array of completed waves with durations
- `orchestrationStartTime`: Timestamp when workflow started
- `orchestrationEndTime`: Timestamp when workflow ended

#### Calculations

**Sequential Estimate**
```
sequentialEstimate = SUM(all task durations in order)
```

**Actual Duration**
```
actualDuration = orchestrationEndTime - orchestrationStartTime
```

**Savings**
```
savingsMs = sequentialEstimate - actualDuration
savingsPercent = (savingsMs / sequentialEstimate) * 100
```

#### Output Format
Display as formatted table to user console:

```
┌────────────────────────────────────────────────────────────┐
│                   ORCHESTRATION METRICS                    │
├─────────────────────────┬──────────────┬─────────────┬──────┤
│ Phase                   │ Duration     │ Status      │ Retry│
├─────────────────────────┼──────────────┼─────────────┼──────┤
│ architect               │ 45s          │ ✓           │ 0    │
│ design-audit            │ 20s          │ ✓           │ 0    │
│ spec                    │ 15s          │ ✓           │ 0    │
│ implementation (wave 1) │ 60s          │ ✓           │ 0    │
│ testing (wave 1)        │ 45s          │ ✓           │ 0    │
│ implementation (wave 2) │ 50s          │ ✓           │ 0    │
│ testing (wave 2)        │ 40s          │ ✓           │ 0    │
│ impl-audit              │ 25s          │ ✓           │ 0    │
├─────────────────────────┼──────────────┼─────────────┼──────┤
│ Total (Actual)          │ 5m 07s       │             │      │
│ Sequential Estimate     │ 8m 35s       │             │      │
│ Parallelization Savings │ 3m 28s (40%) │             │      │
└─────────────────────────┴──────────────┴─────────────┴──────┘
```

#### Implementation Notes
- Use `table` library or terminal formatting utility
- Include checkmark (✓) for success, (✗) for failure
- Sort rows in execution order (architect → audit → spec → wave 1 → ... → final audit)
- Savings percentage must be calculated and displayed
- If sequential estimate < actual (i.e., negative savings), show "0% (serial execution)"

---

## Phase 5: Memory Capture Flow (orchestrate.md)

### Purpose
At workflow end, collect candidates from architect and auditor, present to user, and optionally save to decisions.md/patterns.md.

### File: `src/orchestrate.md`

#### New Section: "Memory Capture"
Insert after metrics output.

#### Input
- `architect.memory_candidates` (optional array from memory injection section)
- `auditor.memory_candidates` (array from audit output)

#### Memory Candidate Files

**File: `decisions.md` (project root)**
Format:
```markdown
# Design Decisions

## [Task Slug]: [Category]
Date: 2026-01-19
Source: v2-parallel-memory-metrics

**Decision**: [statement of what was decided]

**Rationale**: [why this decision was made]

**Context**: [when/where this applies]

---
```

**File: `patterns.md` (project root)**
Format:
```markdown
# Reusable Patterns

## [Pattern Name]
Source: [Task Slug]
Date: 2026-01-19

**Pattern**: [description of the pattern]

**Benefits**: [why use this pattern]

**Example**: [code example or scenario]

---
```

#### User Flow

1. After metrics display, collect all candidates:
   ```
   Candidates to save:

   DECISIONS:
   [ ] (1) Wave Execution: Tasks are grouped by dependency level for parallel execution
   [ ] (2) Error Handling: Halt wave on task failure, do not proceed to next wave

   PATTERNS:
   [ ] (3) Task Breakdown Format: Output JSON with id, files, dependencies for each task
   [ ] (4) Metrics Calculation: Sequential estimate = sum of durations, savings = estimate - actual
   ```

2. Present three options:
   ```
   How would you like to proceed?
   [1] Save all candidates
   [2] Select which to save (interactive)
   [3] Skip
   ```

3. If user selects option 1 or 2:
   - Append to `decisions.md` and `patterns.md` in project root
   - Use task-slug from current context
   - Include date stamp
   - Display confirmation: "Saved 4 items to decisions.md and patterns.md"

4. If user selects option 3:
   - Skip, do not modify files
   - Display: "Skipped memory capture"

#### Implementation Notes
- If decisions.md or patterns.md don't exist, create them with header
- Always append; never overwrite existing content
- Use ISO8601 date format (YYYY-MM-DD)
- Include task-slug for future reference/filtering
- Transaction: either save all selected or none (no partial saves)

---

## File Locations Summary

### Modified Files
1. **`src/architect.md`**
   - Add "Memory Injection" section (beginning)
   - Add "Task Breakdown" section (end)

2. **`src/auditor.md`**
   - Add `memory_candidates` field to audit output JSON

3. **`src/orchestrate.md`**
   - Add "Wave Execution Engine" section
   - Add "Metrics Calculation" section
   - Add "Memory Capture Flow" section

4. **`src/poc.md`**
   - Implement wave execution logic for parallel implementers
   - Display metrics output (same format as orchestrate.md)

5. **`src/context-manager.md`**
   - Add `METRICS` command for retrieving historical metrics
   - Update manifest schema to include wave execution data

### Created Files
- `decisions.md` (project root, created if doesn't exist)
- `patterns.md` (project root, created if doesn't exist)

---

## Type Definitions

### Task Breakdown
```typescript
interface TaskBreakdown {
  tasks: Array<{
    id: number;
    name: string;
    files: string[];
    dependencies: number[];
    description: string;
  }>;
}
```

### Memory Candidates
```typescript
interface MemoryCandidate {
  type: "decision" | "pattern";
  category: string;
  summary: string;
  rationale: string;
}
```

### Wave Execution Result
```typescript
interface WaveResult {
  waveNumber: number;
  tasks: Array<{
    id: number;
    status: "completed" | "failed";
    duration: string;
    retries: number;
    output?: string;
    error?: string;
  }>;
}
```

### Metrics
```typescript
interface Metrics {
  actualDuration: number; // milliseconds
  sequentialEstimate: number; // milliseconds
  savingsMs: number;
  savingsPercent: number;
  phases: Array<{
    name: string;
    duration: string;
    status: "success" | "failure";
    retries: number;
  }>;
}
```

---

## Integration Points

### Architect → Orchestrator
- Parse `taskBreakdown` JSON from architect.md
- Use to determine wave grouping
- Store in execution context

### Auditor → Orchestrator
- Extract `memory_candidates` from audit JSON
- Combine with architect memory candidates
- Present to user at workflow end

### Orchestrator → Wave Execution
- Call `computeWaves()` with task breakdown
- Spawn implementer/test-writer pairs for each task
- Collect duration metrics from each spawn

### Wave Execution → Metrics Output
- Aggregate durations across all waves
- Calculate sequential estimate (sum of all task durations)
- Display formatted metrics table

### Metrics → Memory Capture
- Candidates inform what to save to decisions.md/patterns.md
- User prompted to select which insights to preserve
- Saved with task-slug and timestamp for traceability

---

## Edge Cases & Constraints

1. **Circular Dependencies**: Task Breakdown must be validated for cycles before wave computation
2. **No Tasks**: If taskBreakdown.tasks is empty, skip wave execution, display warning
3. **Single Task**: Treat as single wave, spawn one implementer/test-writer pair
4. **File Conflicts**: If two tasks in same wave modify same file, warn user before spawning
5. **Duration Calculation**: Use millisecond precision, format as human-readable (45s, 2m 30s, etc.)
6. **Memory Files Missing**: decisions.md/patterns.md are optional; create if needed
7. **User Cancellation**: If user cancels during wave execution, save partial results and cleanup

---

## Testing Requirements

- Task breakdown parsing from architect.md JSON
- Wave computation algorithm with various dependency topologies
- Metrics calculation accuracy (sequential estimate vs. actual)
- Memory candidate extraction from architect and auditor
- User prompts for memory capture (all/select/skip)
- Append logic for decisions.md and patterns.md without corruption
- Error handling for missing files, circular dependencies, spawn failures

