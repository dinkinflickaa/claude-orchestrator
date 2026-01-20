# Design Output: context-path-migration

## Location Analysis

### Option A: Project Root (User's Project)
Path: <user-project>/docs/orchestrator/

PROS:
- Git/PR Visibility: Artifacts appear in user project PRs
- Documentation Integration: Natural fit alongside project docs
- Team Awareness: Visible without knowing about .claude/
- PR-Centric Workflow: Context in branch diffs
- Searchable: GitHub indexes docs/ folders

CONS:
- Pollution: Adds orchestrator files to user's docs
- Gitignore Conflicts: User may want to ignore these
- Multi-Tool Confusion: May conflict with other AI tools
- Convention Deviation: .claude/ is Claude's standard

### Option B: Orchestrator Repo Root
Path: claude-orchestrator/docs/orchestrator/

PROS:
- Clean Separation: Artifacts stay in orchestrator repo
- Single Source: All state centralized
- Developer-Only: Only orchestrator devs see state
- No User Pollution: User projects clean

CONS:
- NO PR Visibility: Defeats primary purpose
- Cross-Repo State: Confusing state management
- Path Complexity: Must resolve install location

## RECOMMENDATION: Option A (Project Root)

Rationale: Primary goal is Git/PR visibility - only works if artifacts in user's project. docs/ is conventional location for documentation. Minimal pollution by only moving context/memory/metrics.

## Design Decisions

1. Storage Location: Move to docs/orchestrator/ at project root (user's project)
2. Path Resolution: Use process.cwd() equivalent, not hardcoded paths
3. Directory Structure: Mirror existing under new root
4. Backward Compatibility: Auto-migrate on first run
5. Graceful Fallback: Continue with .claude/ if migration fails
6. Keep in .claude/: agents/, commands/, docs/ (configuration not artifacts)

## Files Affected

Modified:
- .claude/agents/context-manager.md (paths + migration logic)
- .claude/agents/architect.md (memory paths)
- .claude/agents/auditor.md (context/memory paths)
- .claude/agents/spec-writer.md (spec paths)
- .claude/commands/orchestrate.md (artifact paths)
- .claude/commands/poc.md (artifact paths)
- .claude/commands/resume.md (review paths)
- README.md (documentation)
- install.sh (directory creation)

## Task Breakdown

Task 1: Update context-manager.md paths
- Files: .claude/agents/context-manager.md
- Dependencies: none

Task 2: Update architect.md paths
- Files: .claude/agents/architect.md
- Dependencies: none

Task 3: Update auditor.md paths
- Files: .claude/agents/auditor.md
- Dependencies: none

Task 4: Update spec-writer.md paths
- Files: .claude/agents/spec-writer.md
- Dependencies: none

Task 5: Update command files paths
- Files: .claude/commands/*.md
- Dependencies: none

Task 6: Add migration logic
- Files: .claude/agents/context-manager.md
- Dependencies: [1]

Task 7: Update README and install.sh
- Files: README.md, install.sh
- Dependencies: [1,2,3,4,5]

Task 8: Run migration on existing files
- Dependencies: [6]

## Migration Strategy

Auto-migration on INIT:
1. Check if docs/orchestrator/ exists
2. If not, check for .claude/context/, .claude/memory/, .claude/metrics/
3. If legacy paths exist, create docs/orchestrator/ and move files
4. Log: "MIGRATION: Moved orchestrator artifacts to docs/orchestrator/"
