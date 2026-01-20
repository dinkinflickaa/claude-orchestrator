# /orchestrator-graduate - Graduate POC to Production

## Description

Promote a proof-of-concept implementation to production quality by adding tests, running audits, and resolving technical debt.

## Usage

```
/orchestrator-graduate <task-slug>
```

## Example

```
/orchestrator-graduate redis-caching-layer
```

## What This Command Does

The `/orchestrator-graduate` command completes the full workflow for a POC task:

### Workflow Steps

1. **LIST (validate poc-complete)** - Verify POC task exists and is complete
2. **RETRIEVE graduate** - Load POC implementation and technical debt
3. **Test Writer** - Write comprehensive test suite based on POC code
4. **Test Runner** - Execute tests and verify coverage
5. **IMPL-AUDIT (poc-graduate)** - Run implementation audit with POC context
6. **STORE graduate-complete** - Mark task as production-ready

### Validation Requirements

Before graduation begins, the system validates:
- POC task exists in context manager
- POC phase is marked complete
- Implementation files exist
- Technical debt is documented

### Failure Handling

| Failure Type | Action |
|--------------|--------|
| POC not found | Error: "Task <slug> not found or not a POC task" |
| POC incomplete | Error: "POC implementation not complete, run /orchestrator-lite first" |
| Tests fail | Feedback loop: Test Runner → Implementer (fix) → Re-test (max 2 iterations) |
| Audit fails | Feedback loop: Impl Audit → Implementer (fix) → Re-audit (max 2 iterations) |
| Max iterations | Escalate to user with accumulated issues |

### What Gets Added

Graduation adds the **skipped phases** from POC:

#### Tests (Test Writer)
- Unit tests for all public APIs
- Integration tests for critical paths
- Edge case coverage
- Error handling verification

#### Implementation Audit (Auditor)
- Code quality review
- Security vulnerability scan
- Performance concern check
- SOLID principle adherence
- Technical debt resolution verification

## When to Use Graduate

Use `/orchestrator-graduate` when:
- POC has been validated and approved
- Feature is ready for production deployment
- You need full test coverage and audit sign-off
- Technical debt from POC needs resolution

## Technical Debt Resolution

During graduation, the auditor specifically checks:
- Debt items documented during POC phase
- Missing error handling
- Security concerns flagged but deferred
- Performance optimizations identified
- Architectural shortcuts taken

## Output

Successful graduation produces:
- Full test suite with passing tests
- Implementation audit approval
- Production-ready code
- Updated documentation

The task is marked `graduate-complete` in context manager.

## Graduation vs. Full Workflow

| Aspect | Full Workflow | POC → Graduate |
|--------|---------------|----------------|
| Design Audit | Before implementation | **Skipped** (trust POC validation) |
| Spec Writer | Before implementation | **Skipped** (POC code is spec) |
| Speed | Slower (upfront audits) | Faster (validate first, audit later) |
| Risk | Lower (early catches) | Higher (deferred review) |
| Best For | Known requirements | Exploration & learning |

**Note**: Design audit is intentionally skipped during graduation because the POC implementation itself serves as architectural validation. If major design flaws exist, they should trigger a redesign (new task), not graduation.
