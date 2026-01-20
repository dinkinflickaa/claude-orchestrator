# Orchestrator Context

This folder contains orchestration artifacts from multi-agent workflows.

## Structure

```
docs/orchestrator/
├── context/
│   ├── current-task.md    # GITIGNORED - local pointer
│   ├── history.md         # GITIGNORED - local log
│   └── tasks/
│       └── <task-slug>/   # COMMITTED - visible in PRs
│           ├── manifest.json
│           ├── architect.md
│           ├── design-audit.md
│           ├── spec.md
│           └── impl-audit.md
└── memory/
    ├── decisions.md       # Project-wide decisions
    └── patterns.md        # Reusable patterns
```

## Team Workflow

### What's Committed
- `tasks/<slug>/` - Design decisions, specs, audits (visible in PRs)
- `memory/` - Shared project knowledge

### What's Gitignored
- `current-task.md` - Your active task pointer (avoids merge conflicts)
- `history.md` - Your local session log (avoids merge conflicts)

## Picking Up a Teammate's Investigation

```bash
# List all tasks (including teammate's shelved work)
/orchestrator-resume

# Resume a specific task
/orchestrator-resume auth-redesign
```

## PR Reviews

When reviewing PRs, check `docs/orchestrator/context/tasks/<task>/` to understand:
- **architect.md** - Why these changes were made
- **design-audit.md** - What was validated
- **spec.md** - How it was planned
