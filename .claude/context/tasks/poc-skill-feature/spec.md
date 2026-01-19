# POC Skill Feature Implementation Specification

## Overview

The POC (Proof of Concept) skill feature introduces a lightweight development pathway for orchestrator features that allows rapid iteration without full audit gates. This feature enables features to be created in POC mode, implemented, and then graduated to production through a focused audit process. The goal is to reduce friction for exploratory features while maintaining quality guarantees at graduation.

## Architecture

The POC skill operates in two distinct workflows:

1. **POC Mode** (fast-track): Initialize feature with mode=poc, architect, implement, store debt (skipped phases)
2. **Graduate Mode** (production promotion): Retrieve POC implementation, add full test suite, pass implementation audit with poc-graduate validator

Key components:
- `INIT` command extended with `mode` parameter
- Metadata tracking (created_at, mode, status) per task
- `debt.md` for tracking skipped phases and known issues during POC
- Context manager enhancements to support graduated status tracking
- Auditor mode switching (full vs poc-graduate)

## Type Definitions

```typescript
// Task metadata stored in metadata.json
export interface TaskMetadata {
  name: string;
  mode: "standard" | "poc";
  status: "in-progress" | "poc-complete" | "graduated" | "completed";
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  graduated_at?: string; // ISO 8601 timestamp, only when status=graduated
}

// Debt tracking for POC implementations
export interface DebtRecord {
  skipped_phases: Array<"design-audit" | "spec-writer" | "test-writer" | "test-runner" | "impl-audit">;
  known_issues: Array<{
    phase: string;
    description: string;
    severity: "low" | "medium" | "high";
    mitigation?: string;
  }>;
  created_at: string; // ISO 8601 timestamp
  graduated_at?: string; // ISO 8601 timestamp
}

// Auditor configuration
export interface AuditorConfig {
  audit_mode: "full" | "poc-graduate";
  task_slug: string;
  iteration: number;
}

// RETRIEVE response for graduate phase
export interface GraduatePhaseContext {
  implementation: {
    content: string;
    phase: "implementation";
    task_ids?: number[];
  };
  architect: {
    content: string;
    phase: "architect";
  };
  debt: {
    content: string;
    phase: "debt";
  };
}
```

## Implementation Tasks (6 total)

### Task 1: Extend Context Manager - INIT Command
- **File**: `.claude/agents/context-manager.md`
- **Function**: Add mode param (standard|poc), create metadata.json
- **Dependencies**: none

### Task 2: Extend Context Manager - STORE Debt Command
- **File**: `.claude/agents/context-manager.md`
- **Function**: Add STORE phase: debt with YAML schema
- **Dependencies**: none

### Task 3: Extend Context Manager - RETRIEVE Graduate Phase
- **File**: `.claude/agents/context-manager.md`
- **Function**: Add RETRIEVE for_phase: graduate returning impl, architect, debt
- **Dependencies**: none

### Task 4: Extend Context Manager - LIST Command
- **File**: `.claude/agents/context-manager.md`
- **Function**: Report mode and status for each task
- **Dependencies**: none

### Task 5: Extend Auditor - POC-Graduate Mode
- **File**: `.claude/agents/auditor.md`
- **Function**: Add audit_mode param (full|poc-graduate)
- **Dependencies**: none

### Task 6: Update CLAUDE.md - POC Routing
- **File**: `CLAUDE.md`
- **Function**: Add POC routing, status lifecycle docs
- **Dependencies**: Tasks 1-5

## Files to Create

- `.claude/commands/poc.md`
- `.claude/commands/graduate.md`

## Task Details (from original spec)

### Task 1: Extend Context Manager - INIT Command

**Exports:**
```typescript
export interface InitCommandExtended {
  command: "INIT";
  parameters: {
    task: string;
    mode?: "standard" | "poc"; // Optional, defaults to "standard"
  };
}

// Behavior: Creates task directory with metadata.json containing:
// {
//   "name": string,
//   "mode": "standard" | "poc",
//   "status": "in-progress",
//   "created_at": ISO8601,
//   "updated_at": ISO8601
// }
```

**Behavior:**
- INIT task: name mode: standard → Creates metadata with mode=standard, status=in-progress
- INIT task: name mode: poc → Creates metadata with mode=poc, status=in-progress
- Omitting mode parameter → Defaults to mode=standard
- Creates `.claude/context/tasks/<task-slug>/metadata.json` with initial state
- If task already exists → Return error "Task <name> already exists"

**Edge Cases:**
- mode parameter invalid (not "standard" or "poc") → Use standard mode with warning
- metadata.json already exists → Preserve existing metadata, update updated_at
- Concurrent INIT calls → Last write wins (OS file system guarantees)

### Task 2: Extend Context Manager - STORE Debt Command

**Exports:**
```typescript
export interface StoreDebtCommand {
  command: "STORE";
  parameters: {
    phase: "debt";
    content: string; // YAML frontmatter with DebtRecord
  };
}

// Content format (YAML frontmatter):
export interface DebtContent {
  frontmatter: {
    skipped_phases: string[];
    known_issues: Array<{
      phase: string;
      description: string;
      severity: "low" | "medium" | "high";
      mitigation?: string;
    }>;
    created_at: string;
    graduated_at?: string;
  };
  body: string; // Optional human-readable narrative
}
```

**Behavior:**
- STORE phase: debt content: <yaml> → Creates `.claude/context/tasks/<task-slug>/debt.md`
- Frontmatter contains DebtRecord fields with proper YAML format
- Updates parent task metadata status field
- Preserves debt.md if already exists, overwrites content
- Validates YAML syntax before storing

**Edge Cases:**
- Invalid YAML syntax → Return error with line number
- Empty skipped_phases array → Valid but log warning
- graduated_at in a poc-mode task → Return error, only set during graduation
- Missing required fields (skipped_phases, created_at) → Return error listing missing fields

### Task 3: Extend Context Manager - RETRIEVE for Graduate Phase

**Exports:**
```typescript
export interface RetrieveGraduateCommand {
  command: "RETRIEVE";
  parameters: {
    needs: ["implementation", "architect", "debt"];
    for_phase: "graduate";
  };
}

// Returns consolidated object:
export interface RetrieveGraduateResponse {
  task_slug: string;
  metadata: TaskMetadata;
  implementation: string; // Content from implementation phase
  architect: string; // Content from architect phase
  debt: string; // Content from debt.md
  timestamp: string; // When retrieved
}
```

**Behavior:**
- RETRIEVE needs: implementation,architect,debt for_phase: graduate → Returns all three artifacts
- Must validate task has mode=poc and status=poc-complete
- Concatenates content in order: architect → implementation → debt
- Returns JSON-serializable object with each phase's content as string
- If any required phase missing → Return error listing missing phases

**Edge Cases:**
- Task not in poc mode → Return error "Task is not in POC mode"
- Task status != poc-complete → Return error "Task not ready for graduation, status: <current>"
- debt.md does not exist → Return error "Missing debt tracking for POC task"
- implementation or architect missing → Return error listing what's missing

### Task 4: Extend Context Manager - LIST Command

**Exports:**
```typescript
export interface ListTaskInfo {
  name: string;
  slug: string;
  mode: "standard" | "poc";
  status: "in-progress" | "poc-complete" | "graduated" | "completed";
  created_at: string;
  updated_at: string;
  graduated_at?: string;
}

export interface ListResponse {
  tasks: ListTaskInfo[];
  timestamp: string;
}
```

**Behavior:**
- LIST → Returns array of all tasks with metadata
- Each task includes mode (standard | poc) and status (in-progress | poc-complete | graduated | completed)
- Tasks sorted by created_at (newest first)
- Status values:
  - in-progress: Initial state, not yet complete
  - poc-complete: POC mode only, ready for graduation
  - graduated: POC mode only, passed graduation audit
  - completed: Standard or post-graduation, fully done
- Format as table with columns: Name | Mode | Status | Created | Updated

**Edge Cases:**
- No tasks exist → Return empty array with message "No tasks found"
- metadata.json corrupted → Log warning, skip that task, continue listing others
- Mixed standard and poc tasks → Display correctly, show mode for all
- Timestamps missing → Use file modification time as fallback

### Task 5: Extend Auditor - POC-Graduate Mode

**Exports:**
```typescript
export interface AuditorValidateCommand {
  command: "AUDIT";
  parameters: {
    task_slug: string;
    audit_mode: "full" | "poc-graduate";
    iteration: number;
    phase: "design" | "implementation";
  };
}

// Validation rules differ by audit_mode:
export interface AuditValidationRules {
  full: {
    validates_against: ["architect.md", "spec.md", "implementation"];
    requires_tests: true;
    requires_test_results: true;
  };
  poc_graduate: {
    validates_against: ["architect.md", "implementation"];
    requires_tests: true;
    requires_test_results: true;
    ignores_missing: ["spec.md"]; // POC skipped spec phase
  };
}

export type AuditorVerdict =
  | "PASS"
  | "DESIGN_FLAW"
  | "IMPLEMENTATION_FLAW";
```

**Behavior:**
- AUDIT mode=poc-graduate validates implementation against architect.md ONLY (no spec.md)
- AUDIT mode=full validates against both architect.md AND spec.md
- poc-graduate mode still requires test coverage and passing tests
- Both modes check for internal consistency and completeness
- poc-graduate mode documents skipped phases as informational (not errors)
- Verdicts: PASS, DESIGN_FLAW, IMPLEMENTATION_FLAW (same as standard audits)

**Edge Cases:**
- audit_mode invalid (not full or poc-graduate) → Return error
- Phase not recognized (not design or implementation) → Return error
- Task mode != poc for poc-graduate audit → Return error "Audit mode mismatch"
- Missing debt.md in poc-graduate flow → Return error "Missing debt tracking"

### Task 6: Update CLAUDE.md - POC Routing and Status Lifecycle

**Modifies:** `/Users/sachinjain/work/claude-orchestrator/CLAUDE.md`

**Changes:**
- Add new section "POC Mode Routing" after "Decision Tree"
- Add new section "Status Lifecycle" after "Rules"
- Update context-manager description with new command variants
- Update auditor description with audit_mode parameter
- Document when to use poc mode vs standard mode

**Exact Content to Add:**

After line 147 (end of Decision Tree), insert:

```markdown
---

## POC Mode Routing

POC (Proof of Concept) mode enables rapid iteration for exploratory features:

```
POC WORKFLOW:
        │
        ▼
    INIT (mode: poc)
        │
        ▼
    Architect
        │
        ▼
    Implementer
        │
        ▼
    STORE debt (skipped phases)
        │
        ▼
    poc-complete status

GRADUATION WORKFLOW:
        │
        ▼
    LIST (verify poc-complete)
        │
        ▼
    RETRIEVE graduate (needs: implementation, architect, debt)
        │
        ▼
    [Test Writer + Test Runner] (add full test suite)
        │
        ▼
    IMPL-AUDIT (audit_mode: poc-graduate)
        │
        ▼
    graduated status
```

**When to use POC mode:**
- Experimental features with uncertain requirements
- Quick prototypes for validation before full investment
- Features requiring rapid iteration with stakeholders
- Architecture exploration before committing to design

**POC constraints:**
- Skips design-audit, spec-writer, test-writer, test-runner phases during POC
- Must track all skipped phases and known issues in debt.md
- Graduation requires full test suite and implementation audit
- Test-writer and auditor validate against architect.md only (not spec)
```

After line 313 (end of Rules), insert:

```markdown

## Status Lifecycle

Task status progresses through defined states:

```
Standard Mode:
in-progress → completed (no intermediate states)

POC Mode:
in-progress → poc-complete → graduated → completed
           (implement)  (add tests)
```

**Status definitions:**
- `in-progress`: Task active, not yet deliverable
- `poc-complete`: POC implementation done, ready for graduation
- `graduated`: POC successfully promoted to production spec
- `completed`: Task fully finished (both standard and post-graduation)

**Status transitions:**
- INIT creates task with status=in-progress
- STORE phase: debt (for POC) should update status to poc-complete
- STORE phase: impl-audit iteration: n with PASS verdict updates status to graduated
- STORE phase: (any final phase) with PASS verdict updates status to completed

**No backwards transitions:** Status only moves forward; once poc-complete, cannot revert to in-progress.
```

---

## Implementation Notes

### File Locations

**New sections (extend existing files):**
- `.claude/agents/context-manager.md` - Add: INIT mode param, STORE debt phase, RETRIEVE graduate, LIST enhancements
- `.claude/agents/auditor.md` - Add: audit_mode parameter and poc-graduate validation
- `/Users/sachinjain/work/claude-orchestrator/CLAUDE.md` - Add: POC routing, status lifecycle

**Key Changes Summary:**
1. Context manager gains ability to track task mode and status
2. Debt phase storage for POC phase-skipping documentation
3. Graduate phase retrieval for POC promotion flow
4. Auditor supports conditional validation based on audit mode
5. CLAUDE.md documents POC workflow as alternative to standard workflow

### Dependencies

- Task 1 (INIT extension) → Required by all others
- Task 2 (STORE debt) → Depends on Task 1
- Task 3 (RETRIEVE graduate) → Depends on Task 1, Task 2
- Task 4 (LIST extension) → Depends on Task 1
- Task 5 (Auditor extension) → No dependencies, parallel to others
- Task 6 (CLAUDE.md update) → Depends on Tasks 1-5 (documents all changes)

### Parallelization

Tasks 1-5 can execute in parallel. Task 6 must wait for tasks 1-5 to complete so documentation accurately reflects all changes.

### Testing Strategy

**Unit Tests:** Validate context-manager state transitions and metadata handling
**Integration Tests:** POC workflow (init → architect → implement → store debt → retrieve graduate)
**Documentation Tests:** Verify CLAUDE.md formatting and consistency
