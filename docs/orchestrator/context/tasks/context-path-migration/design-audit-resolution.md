# Design Audit Resolution: context-path-migration

**Status**: DESIGN_FLAW Resolved
**Iteration**: 1
**Date**: 2026-01-19

---

## Summary

Initial design audit identified **4 critical issues** in architect.md. All have been addressed in architect-revision-1.md.

---

## Critical Issues and Resolutions

### 1. Path Resolution Ambiguity

**Issue**: "Project root" was undefined. The phrase "where .claude/ exists" doesn't clarify whether this is:
- The user's project repository root (where code/docs live)
- The orchestrator repository root (if orchestrator were separate)

**Impact**: Code implementing this design would have no clear way to resolve paths at runtime.

**Resolution**:
- **Definition**: "Project root" = repository root where .git/, package.json, src/, docs/ exist = `process.cwd()`
- **Clarification**: Orchestrator is installed INTO user projects as a standard .claude/ directory structure, not as a separate repository
- **Implementation**: Added "Path Constants" section with explicit definitions and examples
- **Location**: architect-revision-1.md, "Path Resolution Model" section

**Verification**: All path examples now include concrete `process.cwd()` references.

---

### 2. Memory Location Conflicts with ADR-001

**Issue**: Initial design moved memory files to docs/orchestrator/ alongside context/metrics, but ADR-001 explicitly established that memory stays in `.claude/memory/` for architectural separation.

**ADR-001 Details**:
- **Decision**: Memory files live in `.claude/memory/`
- **Rationale**: Separation of orchestration artifacts (per-task) from project intelligence (persistent)
- **Date**: 2026-01-19, Task: v2-parallel-memory-metrics

**Impact**: Moving memory would contradict existing architecture decision without documenting why.

**Resolution**:
- **Decision Preserved**: Memory stays in `.claude/memory/` per ADR-001
- **New Logic**: Only context/tasks/ and metrics/ move to docs/orchestrator/
- **Rationale**: Added to architect-revision-1.md, "ADR-001 Reconciliation" section
- **Explanation**: Memory is persistent across tasks, context is per-task—different concerns deserve different locations

**Verification**: architect-revision-1.md Section 1 explicitly states "DOES NOT change memory location" and explains why.

---

### 3. Migration Logic Location Wrong

**Issue**: Initial design assigned "Add migration logic" to context-manager.md (Task 6), but context-manager.md is instructions/documentation, not executable code. Migration logic cannot be executed from markdown.

**Impact**: No actual migration would happen at runtime. Migration is just documentation with no execution mechanism.

**Resolution**:
- **New Location**: install.sh (executable script)
- **New Content**: Added "Task 2: Update install.sh with Migration Logic" to task breakdown
- **Details**:
  - Create docs/orchestrator/ structure
  - Detect legacy .claude/context/ and .claude/metrics/ paths
  - Copy files to new locations
  - Verify migration success
  - Log and fallback on error
- **Location**: architect-revision-1.md, "Task Breakdown" and "Migration Strategy" sections

**Verification**: Install.sh is the only place where shell scripts can execute, making it the correct location for automated migration.

---

### 4. Incomplete Files Affected List

**Issue**: Initial design listed 8 files in "Files Affected" but missed several critical files:
- `.claude/commands/graduate.md` (references context paths)
- `.claude/docs/v2-plan.md` (contains context path examples in diagrams)
- `.claude/metrics/` directory files (metrics paths being moved)
- Test files in context/tasks/ (will have new paths in migration)

**Impact**: Incomplete task list would leave path references outdated in deployed code.

**Resolution**:
- **Comprehensive Audit**: Added all affected files across three categories:
  1. Core Infrastructure (context-manager.md, install.sh)
  2. Agents (6 agent files)
  3. Commands (4 command files including graduate.md)
  4. Documentation (README.md, v2-plan.md)
- **Details**: architect-revision-1.md, "Files Affected" section lists 14 files total

**Verification**: Glob search confirms all `.claude/**/*.md` and `.claude/metrics/` files have been identified.

---

## Architecture Clarifications Added

### Path Constants Pattern

Added explicit pattern for all path references:

```javascript
const CONTEXT_PATHS = {
  baseDir: () => path.join(process.cwd(), 'docs/orchestrator/context'),
  taskDir: (slug) => path.join(CONTEXT_PATHS.baseDir(), 'tasks', slug),
  manifest: (slug) => path.join(CONTEXT_PATHS.taskDir(slug), 'manifest.json'),
};

const MEMORY_PATHS = {
  baseDir: () => path.join(process.cwd(), '.claude/memory'),
  decisions: () => path.join(MEMORY_PATHS.baseDir(), 'decisions.md'),
};

const METRICS_PATHS = {
  baseDir: () => path.join(process.cwd(), 'docs/orchestrator/metrics'),
};
```

**Benefit**: Single point of change for migration, clear intent, supports backward compatibility.

### Migration Strategy Details

Added three phases:
1. **Pre-Migration Validation**: Check conditions before starting
2. **Migration Execution**: Copy files, verify success, log results
3. **Fallback Behavior**: Revert to .claude/ if migration fails, non-blocking

**Benefit**: Robust migration that won't break existing installations.

### Option Analysis

Expanded location comparison:
- **Option A**: Move to docs/orchestrator/ (CHOSEN)
- **Option B**: Keep in .claude/ (REJECTED)

Clear rationale: Git/PR visibility only achievable with docs/ location.

---

## Design Review Checklist

- [x] Path resolution clearly defined with concrete examples
- [x] ADR-001 reconciliation documented with rationale
- [x] Migration location corrected (install.sh instead of .md)
- [x] All affected files identified and categorized
- [x] Path constants pattern established
- [x] Backward compatibility approach defined
- [x] Fallback behavior specified
- [x] Success criteria objective and measurable
- [x] Implementation notes prevent hardcoded paths
- [x] Validation checklist provided

---

## Next Steps

Architect-revision-1.md is ready for:
1. **Design Gate**: Human approval of revised design
2. **Spec Writing**: Detailed specifications for each of 6 tasks
3. **Implementation**: Code changes to agents, commands, and install.sh
4. **Validation**: Run migration on existing installations

---

## Files Updated

1. **Created**: `.claude/context/tasks/context-path-migration/architect-revision-1.md` (2,100+ lines)
2. **Created**: `.claude/context/tasks/context-path-migration/design-audit-resolution.md` (this file)
3. **Updated**: `.claude/context/tasks/context-path-migration/manifest.json` (status: paused with recommendations)
4. **Unchanged**: `.claude/context/tasks/context-path-migration/design-audit.md` (iteration 1 audit report)
