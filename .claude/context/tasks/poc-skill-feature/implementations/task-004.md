# Implementation Task 4: Create /poc slash command

## Files Created:
- `.claude/commands/poc.md`

## Implementation Details:

### 4.1: POC slash command definition

**Command:** `/poc`

**Signature:**
```
/poc [options] <request>
```

**Options:**
- `--name <name>`: Task name (required if creating new POC)
- `--existing <task-slug>`: Link to existing task
- `--skip-phases <phase-list>`: Comma-separated phases to skip

**Examples:**
```
/poc --name "email-notifications" Start a POC for email notifications
/poc --existing dashboard-redesign Validate POC dashboard-redesign for graduation
/poc --skip-phases spec,design-audit Quick MVP without full design process
```

### 4.2: POC workflow behavior

When `/poc` is invoked:

1. **Initialize POC task** (or link existing)
   - Call `INIT task: <name> mode: poc`
   - Create metadata.json with mode: "poc"

2. **Skip design audit** (if not explicitly requested)
   - Use architect output directly
   - Jump to spec writer (abbreviated)

3. **Abbreviated spec** (if skip-phases includes spec)
   - Spec writer returns only signatures + key constraints
   - No full implementation guide

4. **Run implementation + tests** (always)
   - Parallel implementer + test-writer

5. **POC-specific audit**
   - Call `IMPL-AUDIT task: <task-slug> iteration: 1 audit_mode: poc-graduate`
   - Check debt.md instead of full spec compliance

6. **Graduation decision**
   - If audit_mode: poc-graduate passes
   - Ask user: "Promote to standard task and graduate?"
   - If yes: Update metadata.json status to "graduated"

### 4.3: POC command integration

Add to CLAUDE.md:

```
## /poc Slash Command

Initiates fast-track POC workflow:

1. Create task in POC mode
2. Skip (or abbreviate) design audit
3. Run implementation + tests
4. Use lenient POC audit
5. Offer graduation option

Usage:
/poc --name "<name>" <description>
/poc --existing <task-slug> <action>

See .claude/commands/poc.md for details.
```

---

## Public API
- `/poc --name <name> <request>`: Create new POC task
- `/poc --existing <task-slug> <action>`: Operate on existing POC
- `/poc --skip-phases <list> <request>`: Override phase defaults

## Edge Cases Tested
- Task name validation (lowercase, hyphens)
- Handle duplicate task names (error or link to existing)
- Skip-phases validation (only valid phases allowed)
- Graduation decision persistence (metadata.json update)

## Notes for Testing
- Verify POC workflow is significantly faster than standard
- Verify /poc command creates correct metadata
- Verify graduation updates metadata.json status correctly
- Verify skipped phases don't break downstream agents
