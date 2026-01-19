# Implementation Task 5: Create /graduate slash command

## Files Created:
- `.claude/commands/graduate.md`

## Implementation Details:

### 5.1: Graduate slash command definition

**Command:** `/graduate`

**Signature:**
```
/graduate <task-slug> [options]
```

**Options:**
- `--force`: Skip POC validation, graduate directly
- `--review-debt`: Show debt.md before confirming graduation

**Examples:**
```
/graduate dashboard-redesign
/graduate email-notifications --review-debt
/graduate experimental-ui --force
```

### 5.2: Graduate workflow

When `/graduate <task-slug>` is invoked:

1. **Check task metadata**
   - Verify task exists and is in POC mode
   - Error if already graduated or standard task

2. **Run graduation audit** (unless --force)
   - Call `IMPL-AUDIT task: <task-slug> iteration: <next> audit_mode: poc-graduate`
   - Use `RETRIEVE needs: graduation-context for_phase: graduate`
   - Auditor checks debt.md and known issues

3. **Show graduation summary**
   - Display debt.md (skipped phases, known issues)
   - Warn about skipped phases and technical debt
   - Ask user confirmation: "Graduate to standard task?"

4. **Promote task to standard**
   - Call `STORE phase: graduate-complete`
   - Update metadata.json: status = "graduated", graduated_at = <timestamp>
   - Move task forward for future maintenance

5. **Post-graduation steps**
   - Offer to create standard task issue tracker (if applicable)
   - Suggest next phase: full spec audit, or defer to future iteration

### 5.3: Graduate command integration

Add to CLAUDE.md:

```
## /graduate Slash Command

Promotes a POC task to standard, production-track task:

1. Verify task is in POC mode
2. Run POC graduation audit (lenient)
3. Show debt.md and confirm with user
4. Update metadata.json status to "graduated"
5. Offer to open maintenance issues

Usage:
/graduate <task-slug>
/graduate <task-slug> --review-debt
/graduate <task-slug> --force  # Skip graduation audit

See .claude/commands/graduate.md for details.
```

### 5.4: STORE phase: graduate-complete

New context-manager command:

```
STORE phase: graduate-complete
```

**Creates file:** `tasks/<task-slug>/graduate-complete.md`

**Content format:**
```yaml
---
graduated_at: 2026-01-19T10:00:00Z
promoted_by: orchestrator
graduation_audit_iteration: <n>
---

# Graduation Record

## Task Summary
- Task: <task-slug>
- Mode: poc -> standard
- Graduation Audit: PASS

## Debt Summary
- Known Issues: <count>
- Skipped Phases: <list>
- Graduation Decision: PROMOTED

## Next Steps
- <future maintenance tasks>
```

---

## Public API
- `/graduate <task-slug>`: Promote POC to standard
- `/graduate <task-slug> --review-debt`: Show debt before promotion
- `/graduate <task-slug> --force`: Promote without audit
- `STORE phase: graduate-complete`: Record graduation event

## Edge Cases Tested
- Prevent graduation of non-POC tasks (error)
- Prevent re-graduation (already graduated, error)
- Handle missing debt.md (warning, allow with confirmation)
- Validate graduation audit verdict (must be PASS or POC_DEBT_ISSUE, not IMPLEMENTATION_FLAW)

## Notes for Testing
- Verify metadata.json status updates correctly
- Verify graduated_at timestamp is set
- Verify graduation audit is invoked with poc-graduate mode
- Verify --force skips audit as intended
- Verify debt.md is shown with --review-debt
- Verify can't graduate non-POC tasks
