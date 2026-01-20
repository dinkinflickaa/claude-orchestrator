# Claude Orchestrator

A multi-agent orchestration system for Claude Code. Routes complex tasks through specialized agents for architecture, implementation, testing, and auditing.

## Installation

**macOS / Linux:**
```bash
curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.ps1 | iex
```

## Commands

### `/orchestrator-full` - Full Workflow

Complete workflow with design audits, specs, tests, and implementation audits.

```bash
/orchestrator-full <task description>
```

**Examples:**
```bash
/orchestrator-full add user authentication
/orchestrator-full fix the checkout bug
/orchestrator-full refactor the API layer
```

**Workflow:**
```
Architect → Design Audit → [Implementer + Test Writer] → Test Runner → Impl Audit
```

### `/orchestrator-lite` - Rapid Prototyping

Fast-track for experimental features. Skips audits, specs, and tests.

```bash
/orchestrator-lite <task description>
```

**Examples:**
```bash
/orchestrator-lite experiment with Redis caching
/orchestrator-lite try GraphQL subscriptions
/orchestrator-lite spike out the new UI component
```

**Workflow:**
```
Architect → Implementer → Store Debt
```

**What gets skipped:** Design audit, test writer, test runner, implementation audit

### `/orchestrator-graduate` - Promote POC to Production

Add tests and audits to a validated POC.

```bash
/orchestrator-graduate <task-slug>
```

**Examples:**
```bash
/orchestrator-graduate redis-caching
/orchestrator-graduate graphql-subscriptions
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
    │   ├── orchestrator-full.md         # /orchestrator-full command
    │   ├── orchestrator-lite.md         # /orchestrator-lite command
    │   ├── orchestrator-graduate.md     # /orchestrator-graduate command
    │   └── orchestrator-resume.md       # /orchestrator-resume command
    ├── docs/
    │   └── orchestrator-base.md         # Shared rules for all commands
    ├── mcp-server/                      # Context management (zero token cost)
    │   ├── package.json
    │   └── index.js
    └── agents/
        ├── architect.md
        ├── auditor.md
        ├── implementer.md
        ├── test-runner.md
        └── test-writer.md
```

## Agents

| Agent | Purpose |
|-------|---------|
| architect | Design guidance, patterns, signatures, task breakdown |
| implementer | Writes code based on architect output |
| test-writer | Writes tests in parallel with implementation |
| test-runner | Executes tests and reports results |
| auditor | Reviews design and implementation quality |

## MCP Server

Context management is handled by an MCP server (zero token cost vs LLM agent):

| Tool | Purpose |
|------|---------|
| `orchestrator_init` | Initialize new task |
| `orchestrator_begin_phase` | Start phase + retrieve context |
| `orchestrator_complete_phase` | End phase + store output |
| `orchestrator_set_gate` | Set approval gate |
| `orchestrator_resume` | Continue past gate |

**Setup**: The install script creates `.mcp.json` in your project root. Restart Claude Code and approve the MCP server when prompted.

## Context Propagation

All commands share state through the MCP server:

```
docs/orchestrator/
├── context/
│   ├── current-task.md
│   └── tasks/
│       └── <task-slug>/
│           ├── manifest.json
│           ├── architect.md
│           ├── design-audit.md
│           ├── impl-audit.md
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
/orchestrator-lite  STORE debt  /orchestrator-graduate
```

## Why Command-Based?

- **Zero CLAUDE.md pollution** - Your project config stays clean
- **Opt-in** - Use commands when you want orchestration
- **Discoverable** - Shows up in `/help`
- **Portable** - Just copy `.claude/` to any project

## License

MIT
