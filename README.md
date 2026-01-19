# Claude Orchestrator

A multi-agent orchestration system for Claude Code. Routes complex tasks through specialized agents for architecture, implementation, testing, and auditing.

## Installation

```bash
curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash
```

## Usage

```bash
/orchestrate <task description>
```

**Examples:**
```bash
/orchestrate add user authentication
/orchestrate fix the checkout bug
/orchestrate refactor the API layer
```

## What Gets Installed

```
your-project/
├── CLAUDE.md                      # Your project-specific instructions (edit this)
└── .claude/
    ├── commands/
    │   └── orchestrate.md         # The /orchestrate command
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

## Workflow

```
Architect → Design Audit → Spec Writer → [Implementer + Test Writer] → Test Runner → Impl Audit
```

- **Design Audit**: Catches architecture issues before implementation
- **Implementation Audit**: Catches code issues after tests run
- **Feedback loops**: Max 2 iterations per audit stage

## Why Command-Based?

- **Zero CLAUDE.md pollution** - Your project config stays clean
- **Opt-in** - Use `/orchestrate` when you want it, regular Claude otherwise
- **Discoverable** - Shows up in `/help`
- **Portable** - Just copy `.claude/` to any project

## License

MIT
