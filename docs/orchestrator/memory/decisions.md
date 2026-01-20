# Architecture Decisions

> This file captures key architecture decisions made during orchestrated workflows.
> Decisions are added via prompted capture at workflow completion.

<!--
Format for new entries:

## [ID]: [Short Title]
**Date:** YYYY-MM-DD
**Task:** [task-slug]
**Decision:** [What was decided]
**Rationale:** [Why this decision was made]
**Alternatives Considered:** [Optional - other options that were rejected]
-->

---

<!-- Decisions will be added below this line -->

## ADR-001: Memory Files Location

**Date:** 2026-01-19
**Task:** v2-parallel-memory-metrics
**Decision:** Project memory files (decisions.md, patterns.md) are stored in `.claude/memory/` rather than project root.
**Rationale:** Maintains clean separation of orchestration artifacts from project source code. All Claude orchestrator state is consolidated under `.claude/` directory.
**Alternatives Considered:** Project root (rejected - clutters root), `.claude/context/` (rejected - memory is persistent across tasks, context is per-task)

## ADR-002: Orchestrator Artifact Locations

**Date:** 2026-01-19
**Task:** context-path-migration
**Status:** Accepted

**Context:**
The orchestrator initially stored all artifacts in `.claude/` subdirectories. As projects mature, there's a need for better visibility of orchestrator work in pull requests and easier cross-team collaboration on architectural decisions.

**Decision:**
Orchestrator artifacts are now split across two locations:

1. **Production Artifacts** (docs/orchestrator/):
   - `docs/orchestrator/context/` - Task execution artifacts (architect.md, spec.md, implementations, tests)
   - `docs/orchestrator/memory/` - Project knowledge (decisions.md, patterns.md)

2. **Internal Metrics** (.claude/orchestrator/):
   - `.claude/orchestrator/metrics/` - Operational data (timing, retries, performance)

**Rationale:**
- Context and memory are documentation that benefits from PR visibility and team review
- Metrics are operational data less useful for PR reviews, kept internal
- Separation provides clarity: docs/ for output, .claude/ for configuration

**Consequences:**
- Better PR visibility for orchestrator work
- Easier cross-team sharing of architectural decisions
- Requires migration from legacy `.claude/context/` and `.claude/memory/` paths
- Install script handles automatic migration

**Supersedes:** ADR-001 (Memory Files Location)
