# Claude Orchestrator

A multi-agent orchestration system for Claude Code that routes tasks through specialized agents for architecture, implementation, testing, and auditing.

## Installation

```bash
curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash
```

This installs:
- `CLAUDE.md` - Orchestrator instructions
- `.claude/agents/` - 7 specialized agent configs

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
Architect → Design Audit → Spec Writer → [Implementer + Test Writer] → Test Runner → Implementation Audit
```

- **Design Audit**: Catches architecture issues before implementation
- **Implementation Audit**: Catches code issues after tests run
- **Feedback loops**: Max 2 iterations per audit stage

## License

MIT
