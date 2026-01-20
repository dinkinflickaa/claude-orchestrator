# Context Path Migration

## Overview

Migrate storage paths for orchestrator artifacts to improve visibility and team collaboration. Context files move from `.claude/context/` to `docs/orchestrator/context/` for PR visibility; memory files move from `.claude/memory/` to `docs/orchestrator/memory/` for team sharing; metrics remain in `.claude/orchestrator/metrics/` for internal use. This requires precise path updates across 9 files and installation script with zero data loss.

## Architecture

**Storage Model (User Approved):**
- **Context** → `docs/orchestrator/context/` (PR-visible, collaborative)
- **Memory** → `docs/orchestrator/memory/` (team-shared decisions and patterns)
- **Metrics** → `.claude/orchestrator/metrics/` (internal, not in docs)

**Migration Strategy:**
1. Update all path references in agent instructions (context-manager, architect, auditor, spec-writer, implementer)
2. Update command workflows (orchestrate, poc, resume)
3. Update installation script to create new directories
4. Update README with new paths
5. Create ADR-002 documenting the decision
6. Migrate existing memory files to new location

**Key Constraints:**
- No breaking changes to existing task context
- All references must be consistent across agents
- Installation script must handle both new installs and upgrades
- README must show new structure clearly

## Type Definitions

No new TypeScript interfaces required. All changes are configuration/documentation updates.

## Tasks

### 1. Update context-manager.md [parallel]

**Creates:** None
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/.claude/agents/context-manager.md`

**Changes:**

1. **Line 12:** Update storage location header
   - OLD: `## Storage Location` + `\.claude/context/`
   - NEW: `## Storage Location` + `docs/orchestrator/context/`

2. **Lines 13-33:** Update directory structure
   - OLD paths: `.claude/context/` → NEW: `docs/orchestrator/context/`
   - OLD paths: `.claude/memory/` → NEW: `docs/orchestrator/memory/`
   - Example OLD: `├── current-task.md` (at `.claude/context/`)
   - Example NEW: `├── current-task.md` (at `docs/orchestrator/context/`)

3. **Lines 49, 74-75, 305, 312:** Update all INIT phase references
   - Update manifest.json creation path: `.claude/context/tasks/<task-slug>/` → `docs/orchestrator/context/tasks/<task-slug>/`

4. **Lines 50-51:** Update .claude/memory references
   - NEW: Reference `docs/orchestrator/memory/` for decision and pattern files

5. **Lines 267-312:** Update all STORE phase references
   - Replace `.claude/context/tasks/<task-slug>/` with `docs/orchestrator/context/tasks/<task-slug>/`
   - No changes to `.claude/memory/` references yet (will be updated in Task 7)

6. **Lines 416-425:** Update RETRIEVE "memory injection" section
   - Update memory file paths: `.claude/memory/decisions.md` → `docs/orchestrator/memory/decisions.md`
   - Update memory file paths: `.claude/memory/patterns.md` → `docs/orchestrator/memory/patterns.md`

7. **Lines 424-425:** Update history.md reference
   - OLD: `.claude/context/history.md` → NEW: `docs/orchestrator/context/history.md`

**Tests:**
- All path references use `docs/orchestrator/context/` and `docs/orchestrator/memory/`
- No lingering references to `.claude/context/` (except `.claude/orchestrator/metrics/`)
- INIT creates directories under new paths
- STORE writes to new paths
- RETRIEVE reads from new memory paths

---

### 2. Update architect.md [parallel]

**Creates:** None
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/.claude/agents/architect.md`

**Changes:**

1. **Lines 12-18:** Update memory file references
   - OLD: `.claude/memory/decisions.md` → NEW: `docs/orchestrator/memory/decisions.md`
   - OLD: `.claude/memory/patterns.md` → NEW: `docs/orchestrator/memory/patterns.md`

**Tests:**
- Memory file paths point to new location
- No breaking changes to architect responsibilities

---

### 3. Update auditor.md [parallel]

**Creates:** None
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/.claude/agents/auditor.md`

**Changes:**

1. **Lines 36-40:** Update memory file references in "Project Memory" section
   - OLD: `.claude/memory/decisions.md` → NEW: `docs/orchestrator/memory/decisions.md`
   - OLD: `.claude/memory/patterns.md` → NEW: `docs/orchestrator/memory/patterns.md`

2. **Lines 75-76, 256-260:** Update all context path references for storing audit results
   - Update all `.claude/context/tasks/<task-slug>/` paths to `docs/orchestrator/context/tasks/<task-slug>/`

**Tests:**
- Memory file paths point to new location
- Audit output paths use new context directory
- No breaking changes to audit verdicts

---

### 4. Update spec-writer.md [parallel]

**Creates:** None
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/.claude/agents/spec-writer.md`

**Changes:**

1. **Line 14:** Update spec output path
   - OLD: `\.claude/context/tasks/<task-slug>/spec.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/spec.md`

2. **Line 16:** Update context-manager reference
   - Note: context-manager will be updated separately (Task 1)

**Tests:**
- Spec.md is created in new context path
- Context-manager integration still works

---

### 5. Update command files (orchestrate, poc, resume) [parallel]

**Creates:** None
**Modifies:**
- `/Users/sachinjain/work/claude-orchestrator/.claude/commands/orchestrate.md`
- `/Users/sachinjain/work/claude-orchestrator/.claude/commands/poc.md`
- `/Users/sachinjain/work/claude-orchestrator/.claude/commands/resume.md`

**Changes for orchestrate.md:**

1. **Line 159:** Update design gate artifact path
   - OLD: `.claude/context/tasks/<task-slug>/architect.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/architect.md`
   - OLD: `.claude/context/tasks/<task-slug>/design-audit.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/design-audit.md`

2. **Line 261:** Update final gate artifact paths
   - OLD: `.claude/context/tasks/<task-slug>/spec.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/spec.md`
   - OLD: `.claude/context/tasks/<task-slug>/impl-audit.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/impl-audit.md`
   - OLD: `.claude/context/tasks/<task-slug>/test-results.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/test-results.md`

**Changes for poc.md:**

1. **Line 70:** Update design gate artifact path
   - OLD: `.claude/context/tasks/<task-slug>/architect.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/architect.md`

2. **Line 168:** Update final gate artifact paths
   - OLD: `.claude/context/tasks/<task-slug>/architect.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/architect.md`
   - OLD: `.claude/context/tasks/<task-slug>/debt.md`
   - NEW: `docs/orchestrator/context/tasks/<task-slug>/debt.md`

**Changes for resume.md:**

- No direct path references (uses dynamic task-slug)
- Ensure references to context-manager commands still work (already handled by context-manager update)

**Tests:**
- Gate prompts reference correct artifact paths
- All paths use `docs/orchestrator/context/`
- Commands work with updated paths

---

### 6. Update install.sh [sequential:after-5]

**Creates:** None
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/install.sh`

**Changes:**

1. **Lines 25-27:** Update directory structure creation
   ```bash
   # OLD:
   mkdir -p .claude/commands
   mkdir -p .claude/agents

   # NEW:
   mkdir -p .claude/commands
   mkdir -p .claude/agents
   mkdir -p docs/orchestrator/context/tasks
   mkdir -p docs/orchestrator/memory
   mkdir -p .claude/orchestrator/metrics
   ```

2. **After lines 65 (end of agent downloads):** Add migration notice
   ```bash
   echo ""
   echo -e "${BOLD}Migration${NC}"
   echo -e "  ${CYAN}→${NC} Context files now stored in docs/orchestrator/"
   echo -e "  ${CYAN}→${NC} Memory files now stored in docs/orchestrator/memory/"
   ```

3. **After line 71:** Update final message paths
   - OLD: `CLAUDE.md, .claude/commands/*, .claude/agents/*`
   - NEW: `CLAUDE.md, .claude/commands/*, .claude/agents/*, docs/orchestrator/` (note: directories created but not populated yet)

**Edge Cases:**
- New installs: Creates directory structure
- Upgrades: Directories created if they don't exist (mkdir -p is idempotent)

**Tests:**
- Script creates `docs/orchestrator/context/tasks/` directory
- Script creates `docs/orchestrator/memory/` directory
- Script creates `.claude/orchestrator/metrics/` directory
- Installation completes successfully
- No errors if directories already exist

---

### 7. Update README.md [sequential:after-6]

**Creates:** None
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/README.md`

**Changes:**

1. **Lines 74-92:** Update "What Gets Installed" section
   ```markdown
   OLD:
   your-project/
   ├── CLAUDE.md
   └── .claude/
       ├── commands/
       ├── agents/

   NEW:
   your-project/
   ├── CLAUDE.md
   ├── docs/
   │   └── orchestrator/
   │       ├── context/
   │       │   ├── current-task.md
   │       │   ├── history.md
   │       │   └── tasks/
   │       └── memory/
   │           ├── decisions.md
   │           └── patterns.md
   └── .claude/
       ├── commands/
       ├── agents/
       └── orchestrator/
           └── metrics/
   ```

2. **Lines 106-115:** Update "Context Propagation" section
   ```markdown
   OLD:
   .claude/context/
   ├── current-task.md
   ├── history.md

   NEW:
   docs/orchestrator/context/
   ├── current-task.md
   ├── history.md
   └── tasks/
   ```

3. **After line 125:** Add note about metrics
   ```markdown
   **Metrics (internal):**
   - Stored in `.claude/orchestrator/metrics/`
   - Not included in version control by default
   ```

**Tests:**
- Directory structure matches new paths
- All examples use correct paths
- README is clear about what gets installed where

---

### 8. Create ADR-002 and migrate existing memory [sequential:after-1]

**Creates:** `/Users/sachinjain/work/claude-orchestrator/.claude/memory/ADR-002.md`
**Modifies:** `/Users/sachinjain/work/claude-orchestrator/.claude/memory/decisions.md`

**Changes for ADR-002.md:**

Create new file with ADR entry:
```markdown
# ADR-002: Storage Path Reorganization

**Date:** 2026-01-19
**Task:** context-path-migration
**Decision:** Reorganize orchestrator artifact storage into three tiers:
1. Context (task-specific) → docs/orchestrator/context/ (PR-visible)
2. Memory (project-wide) → docs/orchestrator/memory/ (team-shared)
3. Metrics (internal) → .claude/orchestrator/metrics/ (local only)

**Rationale:**
- Improves PR visibility: Context files in docs/ are automatically included in pull requests
- Enables team collaboration: Memory files (decisions, patterns) in docs/ can be reviewed and discussed
- Maintains internal state: Metrics remain in .claude/ for local tool use only
- Scalability: Clearer separation of concerns as orchestrator grows

**Alternatives Considered:**
- Keep everything in .claude/ (rejected - no PR visibility)
- Move everything to docs/ (rejected - metrics shouldn't be version-controlled)
- Single docs/claude/ folder (rejected - less clear structure)

**Trade-offs:**
- More directories to manage
- Installation script more complex
- But: Significant improvement to visibility and collaboration

**Migration Path:**
- Phase 1: Update all agent instructions and commands (Tasks 1-5)
- Phase 2: Update installation script and documentation (Tasks 6-7)
- Phase 3: Migrate existing memory and create ADR (Task 8)
- Note: Existing context (completed tasks) stays in .claude/context/ until manually migrated
```

**Changes for decisions.md:**

No modifications needed - keep existing ADR-001. The new memory files will be at `docs/orchestrator/memory/decisions.md` going forward.

**Tests:**
- ADR-002.md exists and documents the decision
- decisions.md contains ADR-001
- New memory files will be created in correct location during next orchestrator run

---

## Verification Checklist

- [ ] All `.claude/context/` references replaced with `docs/orchestrator/context/`
- [ ] All `.claude/memory/` references replaced with `docs/orchestrator/memory/`
- [ ] Metrics path explicitly uses `.claude/orchestrator/metrics/`
- [ ] No breaking changes to context-manager API
- [ ] No breaking changes to agent responsibilities
- [ ] install.sh creates all required directories
- [ ] README accurately reflects new structure
- [ ] ADR-002 documents the decision and rationale
- [ ] Zero data loss for existing task context
- [ ] Paths are consistent across all 9 files

## Dependencies

- Task 1 (context-manager) must complete before Task 5 (commands) references it
- Task 5 (commands) must complete before Task 6 (install.sh) references them
- Task 6 (install.sh) should complete before Task 7 (README) references new structure
- Task 8 (ADR) should be created after Task 1 (context-manager fundamentals)

All other tasks are parallel-executable.

## File Summary

**Files to Modify (9 total):**
1. `.claude/agents/context-manager.md` - Path definitions and operations
2. `.claude/agents/architect.md` - Memory file references
3. `.claude/agents/auditor.md` - Memory file and context path references
4. `.claude/agents/spec-writer.md` - Context path output
5. `.claude/commands/orchestrate.md` - Gate artifact paths
6. `.claude/commands/poc.md` - Gate artifact paths
7. `.claude/commands/resume.md` - Already generic, no changes needed
8. `install.sh` - Directory creation and messaging
9. `README.md` - Documentation structure

**Files to Create (1 total):**
1. `.claude/memory/ADR-002.md` - New architectural decision record
