# Code Patterns

> This file captures recurring code patterns established during orchestrated workflows.
> Patterns are added via prompted capture at workflow completion.

<!--
Format for new entries:

## [Pattern Name]

[Description of when to use this pattern]

```[language]
// Example code
```

**Source:** [task-slug]
**Date:** YYYY-MM-DD
-->

---

<!-- Patterns will be added below this line -->

## Wave Execution with Dependency Grouping

Tasks are grouped into waves by dependency level for parallel execution:
- **Wave 0**: Tasks with no dependencies (`dependencies: []`)
- **Wave N**: Tasks whose dependencies are all in waves < N

Execute parallel within wave, sequential between waves. Test-runner executes ONCE after all waves complete.

```
# Compute waves
Wave 0: [task-1, task-3]  # no deps
Wave 1: [task-2]          # depends on task-1

# Execute
Wave 0: spawn(task-1) || spawn(task-3)  # parallel
Wave 1: spawn(task-2)                    # after wave 0
test-runner: run ONCE after all waves
```

**Source:** v2-parallel-memory-metrics
**Date:** 2026-01-19

---

## memory_candidates Schema

Format for extracting noteworthy decisions and patterns from auditor outputs:

```json
{
  "memory_candidates": [
    {
      "type": "decision",
      "title": "Short title (max 50 chars)",
      "content": "Full description or code snippet",
      "source": "architect.designDecisions[0]"
    }
  ]
}
```

- **type**: "decision" (architectural choice) or "pattern" (reusable code)
- Collect from design-audit and impl-audit outputs
- Deduplicate by title before presenting to user

**Source:** v2-parallel-memory-metrics
**Date:** 2026-01-19
