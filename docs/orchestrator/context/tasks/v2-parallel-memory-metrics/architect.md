# v2 Orchestrator: Parallel Execution, Memory System, and Metrics
## Architect Design Document

---

## Memory Injection

### Prior Decisions Referenced
No prior decisions recorded. This is the foundational design for parallel orchestration patterns.

### Prior Patterns Referenced
No prior patterns recorded. This task establishes baseline patterns for wave execution and memory capture.

---

## Analysis & Design Decisions

### 1. Core Problem Statement

The orchestrator needs to:
- **Execute tasks in parallel** when dependencies allow (Phase 4)
- **Remember design decisions and patterns** from previous workflows (Phase 6)
- **Measure and display parallelization benefit** with clear metrics (Phase 7)

Current limitations:
- All tasks execute sequentially
- No mechanism to inject prior knowledge
- No visibility into time saved by parallelization

### 2. Design Decision: Task Breakdown Format

**Aspect:** How architect communicates parallel structure to orchestrator

**Guidance:**
The architect outputs a structured JSON block containing tasks with explicit dependencies. This enables the orchestrator to compute execution waves and spawn parallel agents.

**Structure:**
- Each task has: id (1-8), name, files, dependencies, description
- Dependencies reference other task IDs (lower IDs only)
- Tasks with no dependencies form Wave 1
- Tasks depending on Wave N tasks form Wave N+1

**Placement:** Last section of architect.md, wrapped in JSON code block with label `task-breakdown-json`

**Solid Principle:** Single Responsibility (architect specifies what to build, orchestrator specifies how to execute)

**Rationale:**
- Explicit dependencies enable safe parallelization
- JSON format is unambiguous and machine-parseable
- Limited to 8 tasks prevents over-parallelization
- Topological ordering guarantees acyclic dependencies

### 3. Design Decision: Wave Execution Model

**Aspect:** How orchestrator groups and executes parallel tasks

**Guidance:**
The orchestrator computes waves by analyzing the dependency graph. Wave N contains all tasks whose maximum dependency depth is N-1.

**Execution Strategy:**
1. Wave 1: All tasks with no dependencies → spawn in parallel
2. For each wave: spawn `implementer:task-<id>` and `test-writer:task-<id>` agents in parallel
3. Wait for wave to complete before starting next wave
4. After all waves complete, run test-runner once (not per-wave)
5. Partial failure: If some tasks fail in a wave, mark wave as failed but continue to next wave (allows retry attempts)

**Solid Principle:** Open/Closed (wave execution is extensible without modifying core logic)

**Rationale:**
- Wave-based execution maintains dependency safety
- Parallel within wave maximizes throughput
- Sequential between waves maintains predictability
- Single test-runner pass reduces redundant testing
- Partial failure recovery enables developer iteration

### 4. Design Decision: Memory Injection Strategy

**Aspect:** How architect and auditor access prior design decisions

**Guidance:**
Two memory files at `.claude/memory/decisions.md` and `.claude/memory/patterns.md` serve as persistent knowledge stores. Architect reads these at the beginning to inform current design decisions. Auditor extracts new candidates for capture.

**Memory Files:**
- **decisions.md**: Architecture decisions, lessons learned, constraint discoveries
- **patterns.md**: Reusable code patterns, templates, best practices

**Injection Flow:**
1. Architect reads both files (RETRIEVE needs: memory for_phase: architect)
2. If files empty: continue with no prior context
3. If files have content: extract relevant entries, reference in "Memory Injection" section
4. Document which prior decisions are being applied and why

**Solid Principle:** Interface Segregation (architect sees only relevant memory via filtered extraction)

**Rationale:**
- Persistent memory prevents re-solving solved problems
- Gradual knowledge accumulation improves efficiency
- Explicit references maintain traceability
- Optional fallback prevents blocking on missing files
- Files live in `.claude/memory/` (shared across all tasks)

### 5. Design Decision: Memory Capture Output

**Aspect:** How architect and auditor surface candidates for persistent memory

**Guidance:**
Architect and auditor both output JSON `memory_candidates` arrays. These candidates surface reusable insights that should be saved for future tasks.

**Candidate Types:**
- **decision**: Architecture decisions, discovered constraints, key lessons
- **pattern**: Reusable code patterns, templates, algorithms
- **insight**: Observations, best practices, anti-patterns to avoid

**Extraction Rules:**
- Architect extracts from designDecisions section (1-3 candidates)
- Auditor extracts from recommendations section (2-5 candidates)
- Each candidate includes: type, title, content, source, hash (first 8 chars of SHA256)

**Deduplication:**
- Hash = SHA256(type + title)
- Before saving: check if hash exists in decisions.md or patterns.md
- Skip duplicates to prevent redundancy

**Solid Principle:** Single Responsibility (each role extracts only candidates from its domain)

**Rationale:**
- Explicit candidates make memory capture intentional, not accidental
- Deduplication prevents knowledge base pollution
- Type and category enable intelligent filtering
- Hashing prevents storage duplicates
- Architect captures design insights, auditor captures review insights

### 6. Design Decision: Metrics Calculation & Display

**Aspect:** How orchestrator measures and displays parallelization benefit

**Guidance:**
Two metrics show the value of parallelization:
1. **Sequential Estimate**: Sum of all task durations in linear order (what it would take if all serial)
2. **Parallel Estimate**: Sum of max duration per wave (what it actually took with parallelization)
3. **Savings**: Sequential Estimate - Parallel Estimate (time recovered via parallelization)

**Calculation:**
- Sequential Estimate = SUM(all task durations in order)
- Actual Duration = end_time - start_time (from orchestrator measurements)
- Savings = Sequential Estimate - Actual Duration
- Savings % = (Savings / Sequential Estimate) * 100

**Display Format:**
- Table with columns: Phase, Duration, Status, Retries
- Rows sorted by execution order (architect → audit → spec → waves → final audit)
- Bottom rows show: Total (Actual), Sequential Estimate, Parallelization Savings
- Use checkmarks (✓) for success, X for failure

**Solid Principle:** Single Responsibility (metrics are calculated once, at end, reusing existing data)

**Rationale:**
- Clear before/after metrics justify parallelization investment
- Sequential estimate shows theoretical max improvement
- Actual duration shows what parallelization achieved
- Wave grouping shows which phases benefited most
- Percentage makes impact understandable

### 7. Design Decision: Memory Capture Flow

**Aspect:** How users are prompted to save memory candidates

**Guidance:**
At workflow end, after metrics display, the orchestrator presents all candidates to the user for selection.

**Flow:**
1. Extract candidates from architect and auditor (deduplicate)
2. Group by type (decisions vs patterns vs insights)
3. Present interactive prompt:
   ```
   Which memory candidates should be saved?

   [1] Wave Execution Model (decision)
       Source: v2-parallel-memory-metrics architect
   [2] Task Breakdown Format (pattern)
       Source: v2-parallel-memory-metrics architect
   ...

   Options: [all | select | skip]
   ```
4. If "all": append all candidates to decisions.md and patterns.md
5. If "select": prompt for comma-separated IDs to save
6. If "skip": discard candidates
7. Append with: ISO8601 date, task-slug, source (architect or auditor)

**Transaction Safety:**
- Either save all selected or none (atomic operation)
- Log success: "Saved 4 items to decisions.md and patterns.md"
- Create files if missing (with headers)

**Solid Principle:** Dependency Inversion (orchestrator depends on generic candidate format, not specific extraction logic)

**Rationale:**
- Interactive prompts ensure intentional memory capture
- Deduplication prevents duplicates from building up
- Task-slug tagging enables future filtering ("show all decisions from user-auth task")
- Atomic saves prevent partial writes on failure
- Append-only pattern prevents accidental overwrites

---

## Task Breakdown

The orchestrator will execute these tasks in dependency-ordered waves:

### Task Breakdown JSON

```json
{
  "taskBreakdown": {
    "tasks": [
      {
        "id": 1,
        "name": "Update architect.md - Task Breakdown & Memory Injection",
        "files": [".claude/agents/architect.md"],
        "dependencies": [],
        "description": "Add Task Breakdown section to architect output, add Memory Injection section for reading decisions.md/patterns.md, update output schema to include taskBreakdown JSON."
      },
      {
        "id": 2,
        "name": "Update context-manager.md - METRICS & RETRIEVE extensions",
        "files": [".claude/agents/context-manager.md"],
        "dependencies": [],
        "description": "Add METRICS command for displaying historical metrics, extend RETRIEVE with 'needs: memory' parameter for architect/auditor, document wave manifest schema."
      },
      {
        "id": 3,
        "name": "Implement wave execution in orchestrate.md",
        "files": [".claude/commands/orchestrate.md"],
        "dependencies": [1, 2],
        "description": "Parse taskBreakdown JSON from architect output, compute waves using dependency graph, implement wave-based execution with parallel implementer/test-writer spawning."
      },
      {
        "id": 4,
        "name": "Implement metrics output in orchestrate.md",
        "files": [".claude/commands/orchestrate.md"],
        "dependencies": [3],
        "description": "Collect phase durations and wave timings, calculate sequential vs parallel estimates, format and display metrics table with savings calculation."
      },
      {
        "id": 5,
        "name": "Implement memory capture in orchestrate.md",
        "files": [".claude/commands/orchestrate.md"],
        "dependencies": [3],
        "description": "Extract memory_candidates from architect and auditor outputs, deduplicate by hash, present interactive prompt to user for selection, append to decisions.md/patterns.md with metadata."
      },
      {
        "id": 6,
        "name": "Update poc.md - Wave execution for parallel implementers",
        "files": [".claude/commands/poc.md"],
        "dependencies": [1, 2],
        "description": "Implement simplified wave execution (implementer-only, no test-writer), implement metrics output for POC, coordinate with orchestrate.md wave model."
      },
      {
        "id": 7,
        "name": "Update auditor.md - Memory candidates output",
        "files": [".claude/agents/auditor.md"],
        "dependencies": [],
        "description": "Add memory_candidates field to audit output JSON, extract 2-5 reusable insights from audit recommendations, include type, category, summary, rationale for each."
      }
    ]
  }
}
```

---

## Design Constraints & Validation

### Task Breakdown Constraints
- Maximum 8 tasks per breakdown (prevent over-parallelization)
- Task IDs must be integers 1-8, unique
- Dependencies must be valid task IDs with lower numerical value (acyclic guarantee)
- File paths must not overlap across tasks (detect write conflicts)
- Each task must have non-empty name and description

### Wave Execution Constraints
- Waves execute sequentially (Wave N must complete before Wave N+1 starts)
- Tasks within a wave execute in parallel (safe by dependency definition)
- test-writer agents run during implementation phase (parallel with implementer)
- test-runner runs ONCE after all waves complete (not per-wave)
- Partial failure: wave marked as failed, next wave can still execute

### Memory System Constraints
- Memory files are optional (decisions.md and patterns.md may not exist)
- Memory injection is read-only for architect/auditor (no writes during design/audit)
- Memory capture happens ONLY at workflow end (not during execution)
- Candidates must be deduplicated before saving (prevent duplicates)
- Task-slug is required on all saved candidates (enables filtering)

### Metrics Constraints
- Duration values use millisecond precision internally, display as human-readable (45s, 2m 30s)
- Sequential estimate assumes perfect serial execution (no overhead)
- Parallel estimate includes wave boundaries (no parallel speedup within waves)
- Savings percentage is calculated if sequential > actual; else "0% (serial execution)"
- Metrics table sorts by execution order, not alphabetically

---

## Files Modified & Created

### Modified Files
1. **`.claude/agents/architect.md`**
   - Add "Memory Injection" section at beginning
   - Add "Task Breakdown" section with JSON output requirement
   - Update output schema to include taskBreakdown

2. **`.claude/agents/context-manager.md`**
   - Add METRICS command specification
   - Extend RETRIEVE with `needs: memory` parameter
   - Document wave manifest schema

3. **`.claude/commands/orchestrate.md`**
   - Add "Wave Execution Engine" section (parse, compute, spawn)
   - Add "Metrics Calculation" section (sequential vs parallel)
   - Add "Memory Capture Flow" section (extract, dedup, prompt, append)

4. **`.claude/commands/poc.md`**
   - Add wave execution logic (implementer-only version)
   - Add metrics output (same table format)
   - test-runner runs once after all waves

5. **`.claude/agents/auditor.md`**
   - Add `memory_candidates` array to audit JSON output
   - Extract 2-5 reusable insights from recommendations

### Created Files (if missing)
- **`decisions.md`** (project root) - If created, include header and empty candidates section
- **`patterns.md`** (project root) - If created, include header and empty patterns section

---

## Integration Points & Data Flow

### Architect → Orchestrator
```
architect.md
├── taskBreakdown JSON
│   └── orchestrator parses, computes waves
└── memory_candidates (optional)
    └── orchestrator collects for end-of-workflow prompt
```

### Auditor → Orchestrator
```
auditor output JSON
├── memory_candidates
│   └── orchestrator deduplicates + combines with architect candidates
└── recommendations
    └── used for audit summary
```

### Orchestrator → Wave Execution
```
orchestrator wave engine
├── computeWaves(taskBreakdown) → waves array
├── spawn implementer/test-writer pairs per wave
├── collect phase durations
└── aggregate for metrics
```

### Metrics → Memory Capture
```
orchestrator end-of-workflow
├── display metrics table (sequential vs parallel)
├── present memory candidates to user
├── if "save": append to decisions.md/patterns.md
└── display confirmation
```

---

## Success Criteria

### Wave Execution
- Tasks with no dependencies start immediately (Wave 1)
- Tasks with dependencies wait until dependencies complete
- All tasks in same wave spawn in parallel
- Waves execute sequentially (no race conditions)
- Partial failures don't block next wave (operator can retry)

### Memory System
- Architect can read decisions.md and patterns.md at start
- Memory injection section documents which prior decisions apply
- Architect and auditor extract candidates that are reusable
- Deduplication prevents knowledge base pollution
- User prompted at workflow end to approve memory saves

### Metrics & Parallelization
- Sequential estimate is clearly calculated and displayed
- Actual duration shows real wall-clock time
- Savings percentage shows quantifiable benefit
- Wave grouping shows which phases parallelized
- Metrics motivate future parallelization investment

---

## Testing Strategy

### Unit Tests (TBD - test-writer phase)
- Task breakdown parsing (valid JSON, acyclic dependencies)
- Wave computation (correct dependency ordering)
- Memory candidate deduplication (hash collision handling)
- Metrics calculation (sequential vs parallel estimates)

### Integration Tests (TBD - test-writer phase)
- End-to-end wave execution with 2-3 task dependencies
- Memory capture flow (extract, dedup, prompt, append)
- Metrics output accuracy across multiple waves
- Error handling (circular dependencies, file conflicts)

### Manual Tests (operator responsibility)
- Run orchestrate with parallelizable task breakdown
- Verify metrics show parallelization savings
- Save memory candidates, verify they appear in decisions.md/patterns.md
- Run next workflow, verify memory injection loads prior decisions

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATE WORKFLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Architect Design                                          │
│     ├── Read decisions.md, patterns.md (memory injection)    │
│     ├── Output designDecisions + taskBreakdown JSON          │
│     └── Extract memory_candidates (optional)                 │
│                                                               │
│  2. Design Audit                                              │
│     └── Verify taskBreakdown structure                       │
│                                                               │
│  3. Spec Generation                                           │
│     └── (Same as v1)                                          │
│                                                               │
│  4. Wave Execution Engine                                     │
│     ├── computeWaves(taskBreakdown)                          │
│     ├── Wave 1: Task 1, 3, 5 (no deps) → PARALLEL           │
│     │   ├── spawn implementer:task-1, test-writer:task-1     │
│     │   ├── spawn implementer:task-3, test-writer:task-3     │
│     │   ├── spawn implementer:task-5, test-writer:task-5     │
│     │   └── WAIT for all to complete                         │
│     │                                                         │
│     ├── Wave 2: Task 2 (depends on 1) → PARALLEL            │
│     │   ├── spawn implementer:task-2, test-writer:task-2     │
│     │   └── WAIT for completion                              │
│     │                                                         │
│     └── Wave N: ...                                           │
│                                                               │
│  5. Test Runner (ONCE after all waves)                       │
│     └── Run suite against all implemented code               │
│                                                               │
│  6. Impl Audit                                                │
│     ├── Verify wave implementation completeness              │
│     └── Extract memory_candidates from audit                 │
│                                                               │
│  7. Metrics Output                                            │
│     ├── Calculate sequential vs parallel estimates           │
│     ├── Display formatted table with savings %               │
│     └── Show which waves had parallelization benefit         │
│                                                               │
│  8. Memory Capture (End-of-Workflow)                         │
│     ├── Combine architect + auditor memory_candidates        │
│     ├── Dedup by hash                                        │
│     ├── Present interactive prompt to user                   │
│     ├── If "save": append to decisions.md/patterns.md        │
│     └── Log completion                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Rollout Plan

### Iteration 1 (Current)
Implement core task breakdown, wave execution, and metrics. Memory system and capture are secondary.

### Future Iterations
- Enhance memory injection with better relevance filtering
- Add memory versioning (timestamp-based rollback)
- Implement metrics history and trending
- Add human-in-the-loop validation for memory candidates

---

## Design Tradeoffs & Alternatives Considered

### Tradeoff: Wave vs Graph Execution
**Chosen: Wave Model** (sequential between waves, parallel within)
- Simpler implementation and reasoning
- Predictable resource usage
- Clear checkpoint boundaries
- Partial failure recovery

Alternative: Full DAG execution (spawn all ready tasks immediately)
- Maximum parallelization
- Complex race condition handling
- Hard to predict resource needs
- Harder to debug when tasks fail

### Tradeoff: Memory Injection Before or After Spec
**Chosen: Memory Injection only for Architect & Auditor** (not for spec-writer or test-writer)
- Keeps decision logic centralized to architect
- Prevents spec from diverging from architect intent
- Reduces noise from prior decisions

Alternative: Inject into all phases
- More context for each phase
- Risk of spec/tests getting influenced by unrelated prior work
- Knowledge base size explosion

### Tradeoff: User-Prompted vs Automatic Memory Capture
**Chosen: User-Prompted** (interactive selection at workflow end)
- Prevents knowledge base pollution
- Allows operator to curate quality
- Makes memory capture intentional

Alternative: Automatic capture of all candidates
- No manual overhead
- Risk of storing low-quality insights
- Hard to clean up duplicates

---

## Conclusion

The v2 orchestrator adds three critical capabilities:

1. **Parallel Execution** enables tasks to run concurrently when dependencies allow, providing measurable time savings
2. **Memory System** prevents re-solving solved problems by capturing and injecting prior design decisions
3. **Metrics Output** makes parallelization benefit visible and quantifiable

These changes maintain backward compatibility while enabling power users to define complex task graphs and benefit from accumulated team knowledge.
