# Revised Design: context-path-migration (Iteration 3)

## Final Storage Model

Context → docs/orchestrator/context/ (PR visibility for task artifacts)
Memory → docs/orchestrator/memory/ (team sharing for architectural decisions)
Metrics → .claude/orchestrator/metrics/ (internal operational data)

## Key Changes

1. Memory moves to docs/orchestrator/memory/ (was .claude/memory/)
2. Metrics moves to .claude/orchestrator/metrics/ (was .claude/metrics/)
3. Context stays at docs/orchestrator/context/ (unchanged)

## Rationale

- Memory and Context are documentation benefiting from PR visibility
- Metrics are operational data, stay internal but organized under orchestrator namespace
- Creates ADR-002 superseding ADR-001

## Files Affected (9 modified + migration)

1. context-manager.md (all paths update)
2. architect.md (memory + context paths)
3. auditor.md (memory + context paths)
4. spec-writer.md (context paths)
5. orchestrate.md (memory + context paths)
6. poc.md (context paths)
7. resume.md (context paths)
8. install.sh (migration logic for all three locations)
9. README.md (documentation update)

## Migration Strategy

Auto-migration in install.sh:
- Detect .claude/context/, .claude/memory/, .claude/metrics/
- Create docs/orchestrator/ and .claude/orchestrator/ directories
- Copy files to new locations
- Remove old directories after successful copy
- Log migration actions

## Task Breakdown (8 tasks)

Task 1: Update context-manager.md (all paths)
Task 2: Update architect.md (memory + context)
Task 3: Update auditor.md (memory + context)
Task 4: Update spec-writer.md (context)
Task 5: Update command files (orchestrate, poc, resume)
Task 6: Update install.sh (migration logic)
Task 7: Update README.md (documentation)
Task 8: Create ADR-002 and migrate existing memory
