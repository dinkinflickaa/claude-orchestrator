# Implementation Task 2: Extend context-manager with RETRIEVE graduate

## File Modified:
- `.claude/agents/context-manager.md`

## Implementation Details:

### 2.1: Add RETRIEVE for_phase: graduate command

**New command:**
```
RETRIEVE needs: graduation-context for_phase: graduate
```

**Purpose:** Return condensed architect + implementation outputs (skip spec) for graduation auditor

**Returns:**
- Full architect-revision (if exists) or architect.md
- All implementation outputs (task-001.md through task-N.md)
- debt.md (full file)
- All test outputs
- test-results.md

**Does NOT return:**
- spec.md (graduation skips full spec validation)
- design-audit feedback (assume passed in prior iteration)

### 2.2: Update RETRIEVE command documentation

Add new row to Progressive Context Protocol table:

| Phase        | Retrieve Command |
|--------------|------------------|
| Graduation   | `RETRIEVE needs: graduation-context for_phase: graduate` |

### 2.3: Condensed Output Handling

Add new section to "Condensed Output by Phase":

```
**for_phase: graduate**
```
- Latest architect-revision or architect.md
- All implementation outputs
- Full debt.md
- All test outputs
- test-results.md
```

---

## Public API
- `RETRIEVE needs: graduation-context for_phase: graduate`

## Edge Cases Tested
- Handle missing architect-revision (fallback to architect.md)
- Handle missing debt.md gracefully (not required)
- Return empty array if no implementations exist
- Return empty array if no tests exist

## Notes for Testing
- Verify graduation context omits spec.md (performance optimization)
- Verify all implementation files are included in order
- Verify debt.md is complete (not truncated)
- Verify test-results.md is included for auditor context
