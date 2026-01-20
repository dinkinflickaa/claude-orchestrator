# Design Audit Results

**Verdict: DESIGN_FLAW** (iteration 1)

## Issues to Fix

1. **Missing Output Schema** - Need exact JSON structure for enhanced architect output (signatures, types, edgeCases, testHints in taskBreakdown)

2. **Missing RETRIEVE Logic** - How context-manager extracts "architect-signatures" from architect.md not specified

3. **Missing Backward Compatibility** - No migration path for existing tasks with spec.md

## Preserve
- Overall simplification strategy
- Wave structure and task dependencies
- File list
- Single source of truth approach

## Next Steps for Revision
The architect must provide:
1. Exact JSON schema example showing taskBreakdown structure with embedded signatures/types/edgeCases/testHints
2. Updated context-manager RETRIEVE command logic for architect-signatures extraction
3. Clear guidance on handling existing tasks (keep spec.md or deprecate gracefully)
