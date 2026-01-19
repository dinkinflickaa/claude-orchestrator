# /poc - Proof of Concept Mode

## Description

Create a proof-of-concept implementation without tests or audits. Fast-track for experimental features that will be graduated later.

## Usage

```
/poc <feature-description>
```

## Example

```
/poc Add Redis caching layer for user sessions
```

## What This Command Does

The `/poc` command triggers a streamlined workflow designed for rapid prototyping:

### Workflow Steps

1. **INIT (mode: poc)** - Initialize task context with POC flag
2. **Architect** - Design the solution with POC constraints
3. **Implementer** - Write production-quality code
4. **STORE debt** - Record technical debt for graduation phase

### What Gets Skipped

The following phases are **intentionally skipped** in POC mode:

- **Design Audit** - Architectural review deferred to graduation
- **Spec Writer** - Detailed spec deferred to graduation
- **Test Writer** - Test coverage added during graduation
- **Test Runner** - No test execution in POC phase
- **Implementation Audit** - Code review deferred to graduation

### Why Skip These Phases?

POC mode prioritizes:
- **Speed** - Get working code fast for validation
- **Learning** - Discover unknowns through implementation
- **Flexibility** - Allow architectural pivots without sunk costs

Technical debt is explicitly tracked and addressed during graduation via `/graduate`.

## When to Use POC Mode

Use `/poc` when:
- Exploring unfamiliar technology or patterns
- Validating feasibility of an approach
- Building throwaway spike code (that might become permanent)
- Time pressure requires fast iteration

Do **NOT** use `/poc` for:
- Security-critical features
- User-facing production features (without graduation)
- Bug fixes (use normal workflow)

## After POC

Once POC is validated, use `/graduate <task-slug>` to add tests, audits, and promote to production quality.

## Technical Debt Tracking

POC mode automatically stores:
- Files created/modified
- Skipped audit concerns
- Missing test coverage areas
- Graduation checklist items

This debt is retrieved and addressed during `/graduate`.
