# Claude Orchestrator

A multi-agent orchestration system for Claude Code. Routes complex tasks through specialized agents for architecture, implementation, testing, and auditing.

## Installation

```bash
curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash
```

## Commands

### `/orchestrate` - Full Workflow

Complete workflow with design audits, specs, tests, and implementation audits.

```bash
/orchestrate <task description>
```

**Examples:**
```bash
/orchestrate add user authentication
/orchestrate fix the checkout bug
/orchestrate refactor the API layer
```

**Workflow:**
```
Architect → Design Audit → Spec → [Implementer + Test Writer] → Test Runner → Impl Audit
```

### `/poc` - Rapid Prototyping

Fast-track for experimental features. Skips audits, specs, and tests.

```bash
/poc <task description>
```

**Examples:**
```bash
/poc experiment with Redis caching
/poc try GraphQL subscriptions
/poc spike out the new UI component
```

**Workflow:**
```
Architect → Implementer → Store Debt
```

**What gets skipped:** Design audit, spec writer, test writer, test runner, implementation audit

### `/graduate` - Promote POC to Production

Add tests and audits to a validated POC.

```bash
/graduate <task-slug>
```

**Examples:**
```bash
/graduate redis-caching
/graduate graphql-subscriptions
```

**Workflow:**
```
Retrieve POC → Test Writer → Test Runner → Impl Audit → Complete
```

## What Gets Installed

```
your-project/
├── CLAUDE.md                      # Your project-specific instructions (edit this)
└── .claude/
    ├── commands/
    │   ├── orchestrate.md         # /orchestrate command
    │   ├── poc.md                 # /poc command
    │   └── graduate.md            # /graduate command
    └── agents/
        ├── architect.md
        ├── auditor.md
        ├── context-manager.md
        ├── implementer.md
        ├── spec-writer.md
        ├── test-runner.md
        └── test-writer.md
```

## Agents

| Agent | Purpose |
|-------|---------|
| architect | Design guidance, patterns, SOLID principles |
| spec-writer | Creates implementation specs with ordered tasks |
| implementer | Writes code based on specs |
| test-writer | Writes tests in parallel with implementation |
| test-runner | Executes tests and reports results |
| auditor | Reviews design and implementation quality |
| context-manager | Maintains shared state across phases |

## Context Propagation

All commands share state through the context-manager:

```
docs/orchestrator/
├── context/
│   ├── current-task.md
│   ├── history.md
│   └── tasks/
│       └── <task-slug>/
│           ├── manifest.json
│           ├── architect.md
│           ├── spec.md
│           ├── implementations/
│           ├── tests/
│           ├── test-results.md
│           └── debt.md            # POC only
└── memory/
    ├── decisions.md              # Architectural decisions
    └── patterns.md               # Reusable patterns

.claude/orchestrator/
└── metrics/
    └── execution-history.json    # Operational metrics
```

**POC Lifecycle:**
```
in-progress → poc-complete → graduated
     ↑              ↑             ↑
   /poc         STORE debt    /graduate
```

## Why Command-Based?

- **Zero CLAUDE.md pollution** - Your project config stays clean
- **Opt-in** - Use commands when you want orchestration
- **Discoverable** - Shows up in `/help`
- **Portable** - Just copy `.claude/` to any project

## License

MIT
