# Architect Revision 1: POC Skill Feature (Auditor Feedback Addressed)

## Overview
Addresses all 5 critical issues identified in Design Audit 1.
Adds metadata.json for state validation, audit_mode param, debt schema, graduate RETRIEVE variant, and mode persistence.

---

## Issue 1: State Validation
**Problem**: No mechanism to validate when task becomes poc-complete
**Solution**:
- Create `.claude/metadata.json` at root with per-task status tracking
- Status transitions: standard → poc-in-progress → poc-complete → graduated
- INIT command accepts `mode: poc|standard` parameter
- Metadata file structure:
```json
{
  "tasks": {
    "poc-skill-feature": {
      "mode": "poc",
      "status": "poc-in-progress|poc-complete|graduated",
      "created_at": "2026-01-19T...",
      "graduated_at": null
    }
  }
}
```

---

## Issue 2: Auditor Audit Mode
**Problem**: Auditor can't distinguish between full implementation vs POC graduation audits
**Solution**:
- Add `audit_mode` parameter to auditor invocation
- Two modes:
  - `audit_mode: full` - Standard implementation audit (against spec.md + architect.md)
  - `audit_mode: poc-graduate` - POC graduation audit (against architect.md only, ignores spec skips)
- Auditor.md updated with decision tree based on mode
- Graduate workflow uses `audit_mode: poc-graduate`

---

## Issue 3: Debt Schema with Timestamps
**Problem**: Skipped phases, known issues, and timings not tracked
**Solution**:
- Create `debt.md` per task with YAML frontmatter:
```yaml
---
created_at: 2026-01-19T10:00:00Z
graduated_at: null
skipped_phases:
  - spec-writer
  - test-writer
  - test-runner
  - design-audit (for POC)
known_issues:
  - issue: "Sorting not implemented"
    severity: "medium"
    phase: "implementation"
---

# Technical Debt
[narrative description]
```
- STORE command: `STORE phase: debt content: <debt.md>`
- Updated at task creation and graduation

---

## Issue 4: Graduate RETRIEVE Command
**Problem**: Graduate workflow passes wrong context (includes spec.md, etc.)
**Solution**:
- New RETRIEVE variant for graduation:
```
RETRIEVE needs: graduate-audit for_phase: graduation
```
- Returns only:
  - Full architect.md
  - Implementation output (from POC phase)
  - debt.md (with skipped_phases, known_issues)
  - Metadata.json status
  - **NOT spec.md** (debt documents why it was skipped)
- Focused context for graduation audit

---

## Issue 5: Mode Persistence in LIST
**Problem**: LIST command can't report task mode without extra lookups
**Solution**:
- Store mode + status in metadata.json
- LIST command parses metadata.json and reports:
```
poc-skill-feature
  Mode: poc
  Status: poc-complete
  Current Phase: design-audit (revision 1)
```
- No additional file reads needed

---

## Files to Create/Modify

### Create
1. `.claude/commands/poc.md`
   - User-facing POC initialization
   - Documents mode: poc parameter
   - Expected workflow (architect only)

2. `.claude/commands/graduate.md`
   - Graduation workflow documentation
   - Status validation (poc-complete check)
   - Test + Audit flow

### Modify
1. `.claude/agents/context-manager.md`
   - Add `mode` param to INIT (default: standard)
   - Create metadata.json with initial status
   - Add DEBT phase for debt.md storage
   - Add `RETRIEVE for_phase: graduation` variant
   - Update LIST to parse metadata.json
   - Status transition helpers

2. `.claude/agents/auditor.md`
   - Add `audit_mode` param (default: full)
   - If audit_mode=poc-graduate: only audit architect.md alignment
   - If audit_mode=full: audit spec.md + architect.md alignment
   - Verdict structure unchanged (PASS/FAIL)

3. `CLAUDE.md`
   - Add POC routing section with status lifecycle
   - Update agent invocation docs with audit_mode param
   - Graduate workflow diagram
   - Extend routing table with poc-complete → graduation path

---

## POC Workflow
```
INIT (mode: poc) → status: poc-in-progress
         ↓
    Architect
         ↓
  Design Audit? [SKIPPED in POC]
         ↓
    Implementer
         ↓
 STORE debt → status: poc-complete
```

**No spec, no tests, no impl-audit in POC phase**

---

## Graduate Workflow
```
User: "Graduate poc-skill-feature"
         ↓
LIST (verify status: poc-complete in metadata.json)
         ↓
RETRIEVE (for_phase: graduation)
         ↓
Test Writer (creates comprehensive tests)
         ↓
Test Runner (validates against implementation)
         ↓
IMPL-AUDIT (audit_mode: poc-graduate)
    ├─ PASS → status: graduated (in metadata.json)
    └─ FAIL → Implementer fixes (max 2 iterations)
```

---

## Backward Compatibility

- All existing tasks default to `mode: standard`
- `audit_mode: full` is default auditor setting
- No breaking changes to existing RETRIEVE/STORE
- Metadata.json is optional for standard tasks

---

## Design Decisions Preserved

1. Two-stage audit (design, then implementation)
2. Progressive context protocol (RETRIEVE before each phase)
3. Max iteration limits (2 per feedback loop)
4. Parallel dispatching (implementer + test-writer)
5. Debt tracking as first-class concept

---

## Next Steps

1. Re-audit this design (Design Audit iteration 2)
2. If PASS → Spec Writer
3. If FAIL → Architect revision 2
