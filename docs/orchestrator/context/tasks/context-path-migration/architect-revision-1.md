# Revised Design: context-path-migration (Revision 2)

## Key Changes from Original

1. Path Resolution Clarity: process.cwd() = repository root containing .git/ and .claude/
2. ADR-001 Compliance: Memory MUST stay in .claude/memory/ (hard constraint)
3. Migration in install.sh: Concrete bash code for directory creation and file migration
4. Complete Files List: 23 files (was 8) - added graduate.md, v2-plan.md, 5 metrics files

## Design Decisions

1. Storage Separation: Visible artifacts to docs/orchestrator/, config/memory stay in .claude/
2. Path Resolution: All paths from cwd (repository root)
3. ADR-001 Compliance: Memory files MUST remain in .claude/memory/
4. Migration Execution: All logic in install.sh (executable), not .md files
5. Backward Compatibility: Check docs/orchestrator/ first, fallback to .claude/
6. Gitignore: Optional ignores for users who don't want PR visibility

## Files Affected (23 total)

Modified (11):
- install.sh (migration + directory creation)
- context-manager.md (path updates)
- architect.md, auditor.md (context paths)
- spec-writer.md (spec paths)
- orchestrate.md, poc.md, resume.md, graduate.md (artifact paths)
- v2-plan.md, README.md (documentation)

Metrics to Move (5):
- .claude/metrics/baseline/* → docs/orchestrator/metrics/baseline/
- .claude/metrics/comparison/* → docs/orchestrator/metrics/comparison/

Context to Move (3):
- .claude/context/current-task.md → docs/orchestrator/context/
- .claude/context/history.md → docs/orchestrator/context/
- .claude/context/tasks/ → docs/orchestrator/context/tasks/

Unchanged (4):
- .claude/memory/decisions.md, patterns.md (per ADR-001)
- implementer.md, test-writer.md, test-runner.md (no context refs)

## Task Breakdown (6 tasks)

Task 1: Update install.sh with migration and directory creation
Task 2: Update context-manager.md paths
Task 3: Update architect.md and auditor.md paths
Task 4: Update spec-writer.md paths
Task 5: Update command files paths
Task 6: Update documentation files

## Migration Strategy

Location: install.sh
Steps:
1. Create docs/orchestrator/context/tasks/ and metrics/ directories
2. Check for .claude/context/ and .claude/metrics/
3. If found, copy to new locations
4. Verify migration
5. Print summary
6. Keep legacy paths for backward compatibility

Bash code:
```bash
mkdir -p docs/orchestrator/context/tasks
mkdir -p docs/orchestrator/metrics/baseline
mkdir -p docs/orchestrator/metrics/comparison

if [ -d ".claude/context" ]; then
  cp -r .claude/context/* docs/orchestrator/context/ 2>/dev/null || true
fi

if [ -d ".claude/metrics" ]; then
  cp -r .claude/metrics/* docs/orchestrator/metrics/ 2>/dev/null || true
fi
```

## Success Criteria

- All .claude/context/ refs → docs/orchestrator/context/
- All .claude/metrics/ refs → docs/orchestrator/metrics/
- .claude/memory/ refs unchanged
- install.sh creates directories and migrates content
- Existing tasks accessible after migration
- New tasks created in new location
