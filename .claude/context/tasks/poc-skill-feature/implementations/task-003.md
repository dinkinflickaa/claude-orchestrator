# Implementation Task 3: Extend auditor with audit_mode parameter

## File Modified:
- `.claude/agents/auditor.md`

## Implementation Details:

### 3.1: Add audit_mode parameter to IMPL-AUDIT command

**Old command:**
```
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n>")
```

**New command:**
```
Task(auditor, "IMPL-AUDIT task: <task-slug> iteration: <n> audit_mode: <full|poc-graduate>")
```

**Behavior:**
- `audit_mode: full` (default): Standard implementation audit
  - Validates all implementation against spec
  - Checks completeness vs spec.md
  - Expects full test coverage for all features

- `audit_mode: poc-graduate`: POC graduation audit
  - Validates implementation matches architect intent
  - Checks debt.md for skipped_phases and known_issues
  - Allows intentional debt (e.g., skipped error handling)
  - Focuses on core functionality, not edge cases
  - Warns but allows incomplete test coverage if documented in debt

### 3.2: Update Auditor Documentation

Add new section to auditor.md:

```
## Audit Modes

### Mode: full
Standard audit for production-ready code. Validates against spec, checks all edge cases, expects comprehensive tests.

### Mode: poc-graduate
POC graduation audit. Validates against architect, checks debt documentation, allows intentional gaps as long as documented.

**Graduation Success Criteria:**
- Core functionality matches architect intent
- All known_issues documented in debt.md
- All skipped_phases documented in debt.md
- No critical production bugs (e.g., crashes, security flaws)
- Reasonable test coverage (>50%) for core paths
```

### 3.3: Update verdict logic

**New verdicts:**
- `PASS`: Audit successful (for both modes)
- `IMPLEMENTATION_FLAW`: Issues found (for both modes)
- `POC_DEBT_ISSUE`: Debt documentation missing or incomplete (mode: poc-graduate only)

---

## Public API
- `IMPL-AUDIT task: <task-slug> iteration: <n> audit_mode: <full|poc-graduate>`

## Edge Cases Tested
- Default audit_mode to "full" if omitted (backward compatible)
- Handle missing debt.md in poc-graduate mode (warn but allow if low-risk)
- Validate debt.md format (YAML frontmatter required)
- Ensure poc-graduate doesn't skip critical security/stability checks

## Notes for Testing
- Verify backward compatibility: existing IMPL-AUDIT calls work without audit_mode
- Verify poc-graduate is more lenient than full audit
- Verify graduation requires debt documentation
- Verify critical issues still caught in poc-graduate mode
