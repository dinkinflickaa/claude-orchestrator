# Implementation Task 6: CLAUDE.md Update

## Files Modified:
- `/Users/sachinjain/work/claude-orchestrator/CLAUDE.md`

## Implementation Details:

### 6.1: Task classification checklist enhancement

Added POC mode to the classification step:

```markdown
### Step 1: Classify the Task

□ Simple bug    → 1-2 files, clear cause, obvious fix
□ Complex bug   → 3+ files, unclear cause, needs investigation
□ New feature   → Adding new functionality
□ Design flaw   → Architectural issue, needs redesign
□ POC           → Rapid prototyping, fast-track mode
```

### 6.2: Routing table updates

Added two new routes to the routing table:

**POC Route (new):**
```
POC → Architect → Design Audit (lenient) → [Implementer + Test Writer] → Test Runner → Impl Audit (POC mode) → Graduation (optional)
```

**Graduate Route (new):**
```
Graduation → Auditor (poc-graduate mode) → Update metadata → Promote to standard → Complete
```

Updated routing table in CLAUDE.md:

```markdown
| Classification | Route                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Simple bug     | `Implementer + Test Writer → Test Runner → Impl Audit`                                              |
| Complex bug    | `Architect → Design Audit → Spec → Implementer + Test Writer → Test Runner → Impl Audit`            |
| New feature    | `Architect → Design Audit → Spec → Implementer + Test Writer → Test Runner → Impl Audit`            |
| Design flaw    | `Architect (redesign) → Design Audit → Spec → Implementer + Test Writer → Test Runner → Impl Audit` |
| POC            | `Architect → Design Audit (lenient) → [Impl + Test] → Test Runner → Impl Audit (POC) → Graduate`    |
```

### 6.3: POC MODE section

Added comprehensive `🧪 POC MODE` section after main workflow with:

- **When to use POC mode**: "Use POC mode for rapid prototyping, experimental features, or time-bound proofs-of-concept"
- **Trade-offs**: Speed vs spec/spec validation strictness
- **Workflow differences**:
  - Design Audit is lenient (POC_DEBT_ISSUE allowed)
  - Optional phase skipping via `/poc` command
  - Debt tracking in debt.md
  - Impl Audit uses poc-graduate mode
- **Debt tracking**: What gets tracked (skipped phases, known issues, architectural shortcuts)
- **Graduation path**: How to promote POC to standard task
- **Max iterations**: 1 iteration for design audit (lenient pass/fail), 1 iteration for impl audit

### 6.4: GRADUATION WORKFLOW section

Added `🎓 GRADUATION WORKFLOW` section with:

- **When to graduate**: "When POC reaches sufficient quality/feature-completeness"
- **Validation checks**:
  - POC task mode verification
  - Graduation audit (auditor mode: poc-graduate)
  - Debt review and confirmation
- **Status lifecycle**:
  - POC → graduated (metadata.json updated)
  - Post-graduation: Consider backfilling skipped phases or documenting tech debt
- **Failure scenarios**:
  - If graduation audit fails: Can retry or escalate
  - If debt is unacceptable: Return to implementer to reduce debt
- **Command usage**: `/graduate <task-slug> [--review-debt] [--force]`

### 6.5: Context Manager reference section

Updated "Context Manager" section to include new command:

```markdown
Commands: INIT (with mode), STORE, RETRIEVE (with graduate context), LIST

New INIT mode parameter:
- `INIT task: <task-name> mode: standard` (default)
- `INIT task: <task-name> mode: poc`

New RETRIEVE context:
- `RETRIEVE needs: graduation-context for_phase: graduate`
```

### 6.6: Progressive Context Protocol updates

Added two new rows to the phase table:

```markdown
| Graduate         | `RETRIEVE needs: graduation-context for_phase: graduate`       |
| Architect (POC)  | Same as standard architect (but expects faster iteration)      |
```

Updated the "after each phase" table with:

```markdown
| Graduate Complete | `STORE phase: graduate-complete content: <output>`             |
```

### 6.7: Slash commands section

Added new section documenting slash commands:

```markdown
## 🚀 Slash Commands

### /poc

Fast-track POC workflow:

Usage:
/poc --name <task-name> --skip-phases [spec,test] --grad-eligible

- `--name`: POC task name
- `--skip-phases`: Comma-separated list of phases to skip (spec, full-test, etc.)
- `--grad-eligible`: Mark as graduation-ready from start

Workflow: Create POC task → Architect (fast) → [Impl + Test] → Graduation

See .claude/commands/poc.md for details.

### /graduate

Promote POC to standard task:

Usage:
/graduate <task-slug> [--review-debt] [--force]

- `--review-debt`: Show debt.md before confirmation
- `--force`: Skip graduation audit and promote directly

Workflow: Run graduation audit → Show debt → Confirm → Update metadata → Complete

See .claude/commands/graduate.md for details.
```

### 6.8: Rules and guidelines

Added clarifications to existing rules:

```markdown
## Rules

...
10. **POC mode**: Use for prototypes; graduation moves to standard track
11. **Debt tracking**: All POC skipped phases documented in debt.md
12. **Graduation**: Requires audit approval (lenient) and user confirmation
```

---

## Public API

### CLAUDE.md Changes
- Decision tree: Now includes POC classification
- Routing table: Added POC and Graduate routes
- New workflow diagram in POC MODE section
- Two new slash commands: `/poc` and `/graduate`
- Updated context manager reference
- Progressive Context Protocol expanded

### Integration Points
- `INIT task: <name> mode: poc`: Creates POC task
- `RETRIEVE needs: graduation-context for_phase: graduate`: Gets graduation context
- `STORE phase: graduate-complete`: Records graduation
- `/poc` slash command: Invokes POC workflow
- `/graduate` slash command: Invokes graduation workflow

## Edge Cases Tested

- CLAUDE.md markdown syntax validation (headers, code blocks, tables)
- Links to slash commands (reference to .claude/commands/poc.md and .claude/commands/graduate.md)
- Proper indentation and formatting for nested lists
- Table column alignment for routing and context tables
- Decision tree structure clarity

## Notes for Testing

- Verify all new sections render correctly in markdown
- Verify slash command documentation matches implementations (Task 4 and 5)
- Verify context-manager commands reference matches new parameters
- Verify routing table covers all task classifications
- Verify links to .claude/commands/ reference docs are consistent
- Verify CLAUDE.md is valid markdown with proper structure
- Verify decision tree is clear and follows orchestrator rules
