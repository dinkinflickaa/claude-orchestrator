# Claude Orchestrator v2 - Simpler Core Plan

## Overview

This document captures the design for v2 of the Claude Orchestrator - a simpler, more focused version that adds high-value features without the complexity of the original v2 proposal.

### Design Philosophy

- **80/20 rule**: Get 80% of the value with 20% of the complexity
- **Human-curated over auto-captured**: Humans approve what goes into memory
- **Parallel by default**: Maximize parallelization where dependencies allow
- **Pause over abort**: When things fail, pause for human intervention with context

---

## Key Features

### 1. Parallel Task Execution

**Problem**: Current system runs one implementer + one test-writer. Wastes time on independent tasks.

**Solution**: Architect outputs task breakdown with dependency graph. Orchestrator spawns multiple implementers/test-writers in parallel waves.

```
Wave 1: Tasks with no dependencies (parallel)
Wave 2: Tasks depending on Wave 1 (parallel within wave)
Wave 3: Tasks depending on Wave 2 (parallel within wave)
```

#### Architect Output Format

```markdown
## Task Breakdown

### Task 1: [name]
- Files: `path/to/file.ts`
- Dependencies: none
- Description: [what this task does]

### Task 2: [name]
- Files: `path/to/other.ts`
- Dependencies: [Task 1]
- Description: [what this task does]
```

#### POC Mode Parallel Execution

POC skips spec-writer and test-writer but still parallelizes implementers:
- Architect provides task breakdown directly (less detailed than spec)
- Implementers work from architect output
- No signature contracts needed since no tests

---

### 2. Human Gates

Two required gates with clear interaction patterns.

#### Gate 1: Design Gate (after design-audit)

```
Trigger: design-audit passes
Shows: architect.md summary, task breakdown, parallelization plan
Options: Approve | Request changes | Abort
On reject: Feedback to architect, retry (max 2)
```

#### Gate 2: Final Gate (after impl-audit)

```
Trigger: impl-audit passes
Shows: Implementation summary, test results, audit report
Options: Approve | Request changes | Abort
On reject: Feedback to implementer, retry (max 2 per task)
```

#### Gate Interaction Example

```
═══════════════════════════════════════════════════════════
 DESIGN GATE: [task-name]
═══════════════════════════════════════════════════════════

The architect has proposed a design. Design audit passed.

Review: .claude/context/tasks/[task]/architect.md

Task breakdown:
  - Task 1: [name] (independent)
  - Task 2: [name] (depends: 1)
  - Task 3: [name] (independent)

Parallelization plan:
  Wave 1: Tasks 1, 3 (parallel)
  Wave 2: Task 2 (after 1)

Options:
  1. Approve and continue
  2. Request changes (provide feedback)
  3. Abort workflow
═══════════════════════════════════════════════════════════
```

---

### 3. Failure Escalation: Pause with Context

When max retries (2) exhausted, pause with actionable context instead of aborting.

#### Paused State Content

```
═══════════════════════════════════════════════════════════
 WORKFLOW PAUSED: [task-name]
═══════════════════════════════════════════════════════════

Reason: Max retries (2) exhausted for [phase:task]

## Failure History
[Each attempt with feedback and result]

## What Needs to Be Addressed
[Root cause analysis]
[Clear description of the gap]

## Recommended Actions
  A. [Specific action 1]
  B. [Specific action 2]
  C. [Descope option if applicable]
  D. Abort workflow

## To Resume
  /resume [task-slug]
═══════════════════════════════════════════════════════════
```

---

### 4. Simple Manifest for State Tracking

Minimal state tracking for resumability.

```json
{
  "task": "task-slug",
  "workflow": "orchestrate | poc",
  "status": "running | paused | waiting_gate | completed | failed",
  "current_phase": "phase-name",
  "completed_phases": ["phase1", "phase2"],
  "created_at": "ISO8601",
  "updated_at": "ISO8601",
  "failure_context": {
    "phase": "failed-phase",
    "attempts": 2,
    "last_feedback": "...",
    "root_cause": "...",
    "recommended_actions": ["..."]
  },
  "metrics": {
    "phases": {
      "phase-name": {
        "start": "ISO8601",
        "end": "ISO8601",
        "duration_ms": 45000,
        "retries": 0
      }
    }
  }
}
```

---

### 5. Resume Command

New `/resume` command to continue paused or failed workflows.

```markdown
/resume <task-slug>

1. Load manifest.json
2. Show current state and context
3. If paused at gate: ask for approval decision
4. If failed: show failure context, ask to retry or abort
5. Continue from current_phase
```

---

### 6. Human-Curated Memory

Simple memory system with prompted capture (not auto-capture).

#### Memory Structure

```
.claude/memory/
├── decisions.md    # Architecture Decision Records
└── patterns.md     # Code patterns to follow
```

#### Prompted Capture at Workflow End

```
═══════════════════════════════════════════════════════════
 Workflow Complete: [task-name]
═══════════════════════════════════════════════════════════

## Candidates for Project Memory

### Decisions Made
  1. [Decision description]
  2. [Decision description]

### Patterns Used
  1. [Pattern description]

Would you like to save any of these to project memory?
  1. Save selected items
  2. Save all
  3. Skip
═══════════════════════════════════════════════════════════
```

#### Memory Injection

Architect and auditor receive memory files as context:
- `decisions.md` - To align with past decisions
- `patterns.md` - To follow established patterns

---

### 7. End-of-Workflow Metrics

Output metrics summary when workflow completes.

```
═══════════════════════════════════════════════════════════
 Workflow Complete: [task-name]
═══════════════════════════════════════════════════════════

Phase                    Duration    Status    Retries
───────────────────────────────────────────────────────────
architect                    45s     ✓         0
design-audit                 20s     ✓         0
spec-writer                  30s     ✓         0
implementer:task-1           60s     ✓         0
implementer:task-2           55s     ✓         1
test-writer (parallel)       42s     ✓         0
test-runner                  20s     ✓         0
impl-audit                   35s     ✓         0
───────────────────────────────────────────────────────────
Total                      5m 07s
Parallelization savings    ~1m 30s
Retries                    1

Files created: 8
Files modified: 2
Tests: 24 passed, 0 failed
═══════════════════════════════════════════════════════════
```

---

## Flow Diagrams

### /orchestrate Flow

```
architect ──► design-audit ◄─── DESIGN_FLAW (max 2)
                   │
                   ▼
            ┌─────────────┐
            │ DESIGN GATE │ ◄── human approval
            └──────┬──────┘
                   │
                   ▼
             spec-writer
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   [impl:1]    [impl:2]   [impl:N]     ← parallel waves
   [test:1]    [test:2]   [test:N]       based on deps
        │          │          │
        └──────────┼──────────┘
                   │
                   ▼
             test-runner
                   │
                   ▼
             impl-audit ◄─── IMPL_FLAW (max 2 per task)
                   │
                   ▼
            ┌─────────────┐
            │ FINAL GATE  │ ◄── human approval
            └──────┬──────┘
                   │
                   ▼
              complete
            + metrics output
            + memory prompt
```

### /poc Flow

```
architect ──► design-audit ◄─── DESIGN_FLAW (max 2)
                   │
                   ▼
            ┌─────────────┐
            │ DESIGN GATE │ ◄── human approval
            └──────┬──────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
        ▼          ▼          ▼
   [impl:1]    [impl:2]   [impl:N]     ← parallel waves
        │          │          │          (no tests)
        └──────────┼──────────┘
                   │
                   ▼
            debt-recorder
                   │
                   ▼
             impl-audit
                   │
                   ▼
            ┌─────────────┐
            │ FINAL GATE  │ ◄── human approval
            └──────┬──────┘
                   │
                   ▼
            poc-complete
            + metrics output
```

### Failure → Pause Flow

```
     [any phase]
          │
          ▼
       failure
          │
          ▼
    retry (max 2)
          │
     ┌────┴────┐
     │         │
  success    max retries
     │         │
     ▼         ▼
  continue   PAUSE
             + context
             + recommendations
                   │
                   ▼
             /resume [task]
                   │
                   ▼
             human fixes
                   │
                   ▼
              continue
```

---

## What's NOT Included (Intentionally)

| Feature | Reason for Exclusion |
|---------|---------------------|
| `orchestrator.yaml` config | Hardcode sensible defaults |
| Slack/email notifications | AskUserQuestion sufficient |
| Git auto-branch/PR | User can do manually |
| Auto-capture memory | Risky, human curation safer |
| Security scanner agent | External tools handle this |
| Doc writer agent | Not core workflow |
| Checklists as config | Inline in auditor prompt |
| Complex state machine | Simple manifest sufficient |
| Metrics webhooks | Local output sufficient |

---

## Implementation Plan

### Phase 1: Baseline Metrics
- [ ] Create tracking templates
- [ ] Run 4-6 tasks through current system
- [ ] Record baseline metrics
- [ ] Summarize in baseline/summary.md

### Phase 2: Core Infrastructure
- [ ] Update context-manager with manifest operations
- [ ] Add `/resume` command
- [ ] Update manifest schema

### Phase 3: Human Gates
- [ ] Add design gate to orchestrate.md
- [ ] Add final gate to orchestrate.md
- [ ] Add gates to poc.md
- [ ] Gate interaction via AskUserQuestion

### Phase 4: Parallel Execution
- [ ] Update architect output format for task breakdown
- [ ] Update orchestrate.md for wave-based parallel execution
- [ ] Update poc.md for parallel implementers
- [ ] Test parallel Task tool calls

### Phase 5: Failure Handling
- [ ] Implement pause state in manifest
- [ ] Create pause context output format
- [ ] Implement /resume with failure context
- [ ] Test retry → pause flow

### Phase 6: Memory System
- [ ] Create memory/ directory structure
- [ ] Add prompted capture at workflow end
- [ ] Add memory injection to architect/auditor
- [ ] Test memory flow

### Phase 7: Metrics Output
- [ ] Track timing in manifest
- [ ] Calculate parallelization savings
- [ ] Output metrics summary at completion
- [ ] Compare with baseline

---

## Success Criteria

| Metric | Target |
|--------|--------|
| Parallelization savings | >20% time reduction on multi-task workflows |
| First-attempt pass rate | Same or better than baseline |
| Human intervention rate | Measurable (currently unknown) |
| Retry count | Same or fewer than baseline |
| Memory adoption | Users save decisions in >50% of workflows |

---

## Open Questions

1. **Test-writer timing**: Parallel with implementer (current) or sequential after?
   - Decision: Keep parallel for /orchestrate, skip for /poc

2. **Gate timeout**: Should gates auto-proceed after timeout?
   - Decision: No, pause indefinitely. Human must act.

3. **Memory size limit**: How big can decisions.md get?
   - Decision: No hard limit initially. Monitor in practice.

---

## References

- Original v2 design: [feedback from incognito Claude]
- Current system: `.claude/commands/orchestrate.md`, `.claude/agents/*`
- Baseline metrics: `.claude/metrics/baseline/`
