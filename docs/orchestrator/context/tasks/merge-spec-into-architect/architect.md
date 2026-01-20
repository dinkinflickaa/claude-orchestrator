# Design: Merge Spec-Writer into Architect

## Design Decisions

1. **Merged Architect Output**: Extend architect to include detailed signatures, types, edge cases, and test hints in taskBreakdown
2. **Workflow Simplification**: Remove spec phase - flow becomes Architect -> Design Audit -> Implementer+TestWriter
3. **Context Manager Updates**: Replace 'spec-signatures' with 'architect-signatures'
4. **Auditor Simplification**: Validate against architect.md only (single source of truth)
5. **File Deletion**: Delete spec-writer.md

## Files to Modify
- architect.md - Enhanced output schema with types, signatures, edgeCases, testHints
- context-manager.md - Replace spec-signatures with architect-signatures
- orchestrator-full.md - Remove spec phase from workflow
- implementer.md - Read from architect output
- test-writer.md - Read from architect output
- auditor.md - Update references
- orchestrator-resume.md - Update routing
- orchestrator-lite.md - Verify (already skips spec)

## Files to Delete
- spec-writer.md

## Task Breakdown (9 tasks, 3 waves)

### Wave 0: Foundation (No Dependencies)
- **Task 1**: Update architect.md with enhanced output schema (types, signatures, edgeCases, testHints)
- **Task 2**: Update context-manager.md - replace spec-signatures with architect-signatures

### Wave 1: Workflow Updates (Depends on Wave 0)
- **Task 3**: Update orchestrator-full.md - remove spec phase
- **Task 4**: Update implementer.md - read from architect output instead of spec
- **Task 5**: Update test-writer.md - read from architect output instead of spec
- **Task 6**: Update auditor.md - validate against architect.md only (single source of truth)
- **Task 7**: Update orchestrator-resume.md - update routing to skip spec phase

### Wave 2: Cleanup (Depends on Wave 1)
- **Task 8**: Verify orchestrator-lite.md (already skips spec)
- **Task 9**: Delete spec-writer.md

## Implementation Strategy
1. Enhanced architect output will provide all necessary signatures, types, edge cases, and test hints
2. Design auditor will validate this comprehensive output
3. Implementer and test-writer will have all required information from architect phase
4. No information loss - spec phase output is now part of architect output
5. Overall workflow is simplified from 5 phases to 4 phases
