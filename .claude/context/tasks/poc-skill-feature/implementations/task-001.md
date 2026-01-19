# Implementation Task 1: Extend context-manager with INIT mode

## File Modified:
- `.claude/agents/context-manager.md`

## Implementation Details:

### 1.1: Add mode parameter to INIT command

**Old signature:**
```
INIT task: <task-name>
```

**New signature:**
```
INIT task: <task-name> mode: <standard|poc>
```

**Behavior:**
- If mode omitted, default to "standard"
- Create `metadata.json` at task root with mode and created_at timestamp
- metadata.json structure:
  ```json
  {
    "mode": "standard|poc",
    "created_at": "2026-01-19T10:00:00Z",
    "status": "in-progress",
    "status_history": [
      { "status": "in-progress", "timestamp": "2026-01-19T10:00:00Z" }
    ]
  }
  ```

### 1.2: Update LIST command to show mode

**Output enhancement:**
```
STATUS: success
TASK: poc-skill-feature
DATA:
  - task-slug: poc-skill-feature
    mode: poc
    status: in-progress
    created_at: 2026-01-19T10:00:00Z
    phase: implementation
```

### 1.3: Add STORE debt command

**New command:**
```
STORE phase: debt content: <yaml>
```

**Creates file:** `tasks/<task-slug>/debt.md`

**Debt.md structure (YAML frontmatter + markdown):**
```yaml
---
created_at: 2026-01-19T10:00:00Z
graduated_at: null
skipped_phases: []
known_issues: []
---
# Technical Debt Log

<markdown content>
```

---

## Public API
- `INIT task: <name> mode: <standard|poc>`
- `STORE phase: debt content: <yaml>`
- `LIST` (updated to show mode/status)

## Edge Cases Tested
- Default mode to "standard" if omitted
- metadata.json creation on first INIT only
- Debt content validation (YAML frontmatter required)
- LIST filtering by mode (for future use)

## Notes for Testing
- Verify metadata.json persists across multiple tasks
- Verify debt.md can be re-stored (overwrites only content, preserves frontmatter timestamps)
- Verify LIST shows correct mode for poc vs standard tasks
