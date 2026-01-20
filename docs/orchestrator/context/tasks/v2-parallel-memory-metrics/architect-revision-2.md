# Revised Design - v2-parallel-memory-metrics (Iteration 2)

## Changes Made

### 1. Wave Execution - Lifecycle States & Partial Failure Handling
- Added explicit lifecycle states: pending → running → completed/failed
- Implemented partial failure handling: wave continues if some tasks fail
- test-runner runs ONCE after ALL waves complete (not per-wave)

### 2. Memory Injection - File Paths & Fallback Strategy
- Files defined: `.claude/memory/decisions.md` and `.claude/memory/patterns.md`
- RETRIEVE extended with `needs: memory` parameter
- Placeholder fallback specified if memory files empty or missing

### 3. Memory Capture - Extraction, Dedup, Categorization
- Candidate extraction format from architect designDecisions and auditor recommendations
- Deduplication by SHA256 hash (first 8 chars)
- Categorization rules: decision vs pattern vs insight
- AskUserQuestion presentation format with metadata

### 4. Metrics Calculation - Sequential vs Parallel Estimates
- Sequential estimate: sum of all task actual durations
- Parallel estimate: sum of max duration per wave
- METRICS command spec with phase table, wave grouping, and savings calculation

### 5. Task Breakdown Constraints - Safety & Validation
- Max 8 tasks per breakdown (prevent over-parallelization)
- Acyclic dependency validation (detect cycles)
- File conflict detection (same file in multiple tasks)
- Valid ID format validation

## Design Decisions

### Task Breakdown Format
```json
{
  "taskBreakdown": {
    "tasks": [
      {
        "id": 1,
        "name": "Parser Implementation",
        "files": ["src/parser.ts"],
        "dependencies": [],
        "description": "Implement core parser logic"
      },
      {
        "id": 2,
        "name": "Type Definitions",
        "files": ["src/types.ts"],
        "dependencies": [1],
        "description": "Define TypeScript interfaces"
      }
    ]
  }
}
```

**Validation Rules:**
- `id`: integer 1-8, unique
- `dependencies`: array of task IDs < current task ID (acyclic)
- `files`: no duplicate across tasks
- `name`: non-empty string
- `description`: non-empty string

### Wave Execution Model
```json
{
  "waves": [
    {
      "id": 1,
      "status": "completed|running|failed|pending",
      "tasks": [1, 3, 5],
      "started_at": "2026-01-19T10:00:00Z",
      "ended_at": "2026-01-19T10:05:00Z",
      "duration_ms": 300000
    }
  ]
}
```

**Lifecycle:**
1. Wave created with status `pending`, tasks determined by dependency graph
2. Agent spawns parallel implementer:task-N and test-writer:task-N agents
3. Status → `running`, started_at recorded
4. Tasks complete/fail independently
5. Status → `completed` (all tasks OK) or `failed` (some tasks failed)
6. ended_at and duration_ms recorded

**Execution Strategy:**
- Test-writer runs during implementation phase (parallel with implementer)
- test-runner runs ONCE after all waves complete (sequential gate)
- Partial failure: wave marked failed but next wave can still execute (allows recover attempts)

### Memory Injection Strategy
**Files:**
- `.claude/memory/decisions.md` - architecture decisions, patterns, lessons
- `.claude/memory/patterns.md` - reusable patterns, templates, best practices

**RETRIEVE Extension:**
```
RETRIEVE needs: memory for_phase: architect
RETRIEVE needs: memory for_phase: auditor
```

**Fallback Behavior:**
- If file missing or empty: return `"memory_context": "No prior decisions recorded"`
- If file has content: extract and inject into system prompt

**Format:**
```json
{
  "memory_context": "# Prior Decisions\n\n- Decision 1: ...\n- Pattern 1: ..."
}
```

### Memory Capture Output
**Extraction:**
```json
{
  "memory_candidates": [
    {
      "type": "decision|pattern|insight",
      "title": "Parallel Wave Execution Model",
      "content": "Group tasks by dependencies, execute waves sequentially...",
      "source": "architect.designDecisions[2]",
      "hash": "a3f2b1c9",
      "task_slug": "v2-parallel-memory-metrics"
    }
  ]
}
```

**Deduplication:** SHA256 hash of (type + title) stored in memory files, skip if hash exists

**AskUserQuestion Format:**
```
Which memory candidates should be saved?

[1] Parallel Wave Execution Model (decision)
    Source: v2-parallel-memory-metrics architect
[2] Memory Injection Pattern (pattern)
    Source: v2-parallel-memory-metrics architect

Save: [all|1,3,5|skip]
```

### Metrics Calculation
**Sequential Estimate:**
- Sum duration of all phases in linear sequence
- Example: 45s + 120s + 60s + 90s = 315s

**Parallel Estimate:**
- Sum of max duration per wave in wave manifest
- Wave 1 max = 120s, Wave 2 max = 60s → total = 180s

**Output Table:**
```
Phase                  Duration    Status    Retries
─────────────────────────────────────────────────────
architect              45s         ✓         0
spec                   120s        ✓         0
test-writer:task-1     60s         ✓         1
test-writer:task-2     60s         ✓         0  (parallel)
implementer:task-1     90s         ✓         0
implementer:task-2     75s         ✓         0  (parallel)
test-runner            30s         ✓         0
auditor                75s         ✓         0
─────────────────────────────────────────────────────
Total (actual)         555s
Sequential estimate    540s
Parallel estimate      330s
Parallelization gain   210s (39%)
```

## Files to Modify

### 1. architect.md
- Add **Task Breakdown section** after Design Decisions
- Add **Memory Context Input** section showing decisions.md/patterns.md injection
- Update output format to include taskBreakdown JSON

### 2. auditor.md
- Add **Memory Context Input** section
- Add **memory_candidates output** section with extraction format
- Update recommendations to feed into memory capture flow

### 3. orchestrate.md
- Implement **wave execution engine** (parse task breakdown, build dependency graph, spawn waves)
- Add **wave manifest tracking** (persist waves status/timing)
- Implement **memory capture flow** (extract, dedup, ask user)
- Add **METRICS command** output generation
- test-runner runs ONCE after all waves (not per-phase)
- test-writer runs during implementation phase (parallel with implementer)

### 4. poc.md
- Implement **simplified wave execution** (no test-writer agents, implementer only)
- Add **wave manifest tracking**
- Add **METRICS command** output (wave-aware)
- test-runner runs ONCE after all impl waves

### 5. context-manager.md
- Add **METRICS command** specification
- Extend **RETRIEVE** with `needs: memory` parameter
- Document **wave manifest schema** (nested in orchestrate output)
- Add **memory file paths** configuration (.claude/memory/decisions.md, patterns.md)

## Implementation Order
1. Update architect.md with Task Breakdown section
2. Update context-manager.md with METRICS command and RETRIEVE extension
3. Update orchestrate.md with wave execution and memory capture
4. Update poc.md with wave support
5. Update auditor.md with memory_candidates output

## Testing Strategy
- Validate Task Breakdown: no cycles, max 8 tasks, no file conflicts
- Validate Wave Execution: correct dependency ordering, parallel safety
- Validate Memory Capture: dedup works, candidates extractable, user prompt clear
- Validate Metrics: sequential vs parallel estimates match expected calculation
