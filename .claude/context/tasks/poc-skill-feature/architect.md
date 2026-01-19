# Architecture: POC Skill Feature

## Files to Create/Modify

1. `.claude/commands/poc.md` - CREATE - POC slash command
2. `.claude/commands/graduate.md` - CREATE - Graduate slash command
3. `.claude/agents/context-manager.md` - MODIFY - add mode param, debt phase
4. `CLAUDE.md` - MODIFY - add POC routing

## POC Workflow

```
INIT (mode: poc) → Architect → Implementer → STORE debt → Complete
```

**Purpose**: Fast-track feature development with deferred quality gates

**Characteristics**:
- Skips design audit
- Skips spec-writer
- Skips test-writer, test-runner
- Skips implementation audit
- Records technical debt in debt.md

## Graduate Workflow

```
LIST (verify POC) → RETRIEVE → Test Writer → Test Runner → Impl Audit → Clear Debt
```

**Purpose**: Convert POC to production-ready code

**Characteristics**:
- Requires existing POC task
- Retrieves POC implementation
- Adds comprehensive tests
- Runs full test suite
- Executes implementation audit
- Clears debt on PASS

## Key Constraints

- **POC mode**: Skips audits, spec-writer, test-writer, test-runner
- **Graduate mode**: Requires existing POC task (verified via LIST)
- **Debt tracking**: All POC tasks must record debt in `.claude/context/tasks/<slug>/debt.md`
- **Mode isolation**: POC and graduate are separate workflows, not mixed

## Design Decisions

1. **Debt Phase**: New context phase for storing known issues
2. **Mode Parameter**: INIT accepts `mode: poc` or default (standard)
3. **Command Structure**: Separate .md files for poc and graduate commands
4. **Context Integration**: Debt tracked in task folder, separate from implementation

