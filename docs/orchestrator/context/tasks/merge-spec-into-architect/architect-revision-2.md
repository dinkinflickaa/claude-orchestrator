## Architect Revision (Iteration 2)

### Issues Fixed

1. **Enhanced Output Schema** - Added complete JSON schema with types[], and taskBreakdown.tasks[] extended with signatures[], edgeCases[], testHints[]

2. **RETRIEVE Logic** - Added extraction steps: read architect.md, parse JSON, extract types + task-specific fields + constraints, return combined object

3. **Backward Compatibility** - Check-and-fallback: if spec.md exists use legacy extraction, otherwise use architect-signatures. No migration required.

### Schemas Defined

**Enhanced Architect Output:**
- types[]: {name, definition, location}
- taskBreakdown.tasks[]: {id, name, files, dependencies, description, signatures[], edgeCases[], testHints[]}
- signatures[]: {name, signature, returns, file}
- edgeCases[]: {condition, behavior}

**RETRIEVE architect-signatures returns:**
- types[], task (with signatures/edgeCases/testHints), constraints[]

### Task Breakdown (8 tasks, 3 waves) - Unchanged
Wave 0: Tasks 1-2 (architect.md, context-manager.md)
Wave 1: Tasks 3-7 (orchestrator-full, implementer, test-writer, auditor, orchestrator-resume)
Wave 2: Task 8 (delete spec-writer.md)
