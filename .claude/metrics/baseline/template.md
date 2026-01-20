# Baseline Run: [TASK_NAME]

> Copy this template for each baseline run. Name the file: `[workflow]-[task-description].md`

## Metadata

| Field | Value |
|-------|-------|
| Date | YYYY-MM-DD |
| Workflow | `/orchestrate` or `/poc` |
| Task Description | [Brief description of what was implemented] |
| Complexity | Simple / Medium / Complex |

## Timing

| Phase | Start | End | Duration | Notes |
|-------|-------|-----|----------|-------|
| architect | | | | |
| design-audit | | | | |
| spec-writer | | | | (skip for /poc) |
| implementer | | | | |
| test-writer | | | | (skip for /poc) |
| test-runner | | | | (skip for /poc) |
| impl-audit | | | | |
| **Total** | | | | |

## Quality Metrics

### Design Audit
- Result: `PASS` / `DESIGN_FLAW`
- Retry count: ___
- Feedback (if any):

### Implementation Audit
- Result: `PASS` / `IMPLEMENTATION_FLAW`
- Retry count: ___
- Feedback (if any):

### Tests (if applicable)
- Total: ___
- Passed: ___
- Failed: ___
- Skipped: ___

## Outcome

| Question | Answer |
|----------|--------|
| Completed successfully? | Yes / No |
| Manual intervention needed? | Yes / No |
| If yes, describe: | |
| Code quality (1-5): | |
| Would parallelization have helped? | Yes / No |
| If yes, which tasks were independent? | |

## Files Changed

| File | Action | Lines |
|------|--------|-------|
| | created / modified | |
| | created / modified | |

## Observations

### What Went Well
-

### What Could Be Improved
-

### Would Gates Have Helped?
- Design gate: Yes / No - Why?
- Final gate: Yes / No - Why?

### Parallelization Opportunity
- Number of independent tasks identified: ___
- Estimated time savings if parallel: ___

---

## Raw Data (Optional)

<details>
<summary>Architect Output Summary</summary>

```
[Paste key decisions here]
```

</details>

<details>
<summary>Audit Report Summary</summary>

```
[Paste key findings here]
```

</details>
