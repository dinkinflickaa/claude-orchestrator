# Design: Merge Spec-Writer into Architect (Revision 1)

## Design Decisions

1. **Merged Architect Output**: Extend architect to include detailed signatures, types, edge cases, and test hints in taskBreakdown
2. **Workflow Simplification**: Remove spec phase - flow becomes Architect -> Design Audit -> Implementer+TestWriter
3. **Context Manager Updates**: Replace 'spec-signatures' with 'architect-signatures'
4. **Auditor Simplification**: Validate against architect.md only (single source of truth)
5. **File Deletion**: Delete spec-writer.md
6. **Backward Compatibility**: Existing tasks with spec.md continue to work; new tasks use architect-only flow

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

---

## Enhanced Architect Output Schema

### JSON Structure in manifest.json (waves.task_breakdown)

The architect phase now produces a `taskBreakdown` object with complete function specifications embedded:

```json
{
  "waves": {
    "task_breakdown": {
      "wave_0": [
        {
          "task_id": 1,
          "name": "Update architect.md output schema",
          "description": "...",
          "signatures": [
            {
              "name": "parseUserInput",
              "params": [
                {"name": "input", "type": "string", "description": "Raw user input"}
              ],
              "returns": {"type": "ParsedInput", "description": "Structured input object"},
              "throws": ["ParseError"]
            }
          ],
          "types": [
            {
              "name": "ParsedInput",
              "definition": "interface ParsedInput { command: string; args: string[]; flags: Record<string, any>; }",
              "usage": "Used by CLI parser to represent structured user commands"
            }
          ],
          "edgeCases": [
            "Empty input string",
            "Input with special characters or Unicode",
            "Extremely long input (>10K chars)",
            "Input with nested quotes"
          ],
          "testHints": [
            "Test with valid command syntax",
            "Test with malformed input",
            "Test boundary cases (empty, max length)",
            "Test special character handling"
          ]
        }
      ],
      "wave_1": [
        {
          "task_id": 2,
          "name": "...",
          "signatures": [...],
          "types": [...],
          "edgeCases": [...],
          "testHints": [...]
        }
      ]
    }
  }
}
```

### Stored Format in architect.md

The architect.md file stores this information in structured markdown sections:

```markdown
## Task 1: Update architect.md output schema

### Signatures
- **parseUserInput(input: string) -> ParsedInput throws ParseError**
  - Parses raw input string into command structure

### Types
- **ParsedInput**: interface ParsedInput { command: string; args: string[]; flags: Record<string, any>; }
  - Used by CLI parser to represent structured user commands

### Edge Cases
- Empty input string
- Input with special characters or Unicode
- Extremely long input (>10K chars)
- Input with nested quotes

### Test Hints
- Test with valid command syntax
- Test with malformed input
- Test boundary cases (empty, max length)
- Test special character handling
```

---

## RETRIEVE Logic: architect-signatures

The context-manager RETRIEVE command now supports `architect-signatures` extraction:

### Usage
```
RETRIEVE needs: architect-signatures for_phase: implementation
```

### Extraction Algorithm

1. **Read** architect.md from current task
2. **Parse** all "## Task N:" sections
3. **Extract** Signatures section from each task
4. **Condense** into single list:
   - Function name and signature
   - Brief description
   - Parameter types and descriptions
   - Return type and description
   - Thrown exceptions

### Output Format (Condensed)

```
# Architect Signatures

## Task 1: Update architect.md output schema
- parseUserInput(input: string) -> ParsedInput throws ParseError
  - Parse raw input string into command structure
  - Params: input (string) - raw user input
  - Returns: ParsedInput - structured command object
  - Throws: ParseError

## Task 2: Validate RETRIEVE logic
- extractArchitectSignatures(md: string) -> Signature[] throws ParseError
  - Extract signature metadata from markdown
  - Params: md (string) - architect.md content
  - Returns: Signature[] - list of function signatures
  - Throws: ParseError
```

### Integration Points

- **For implementation phase**: Show implementer all function signatures upfront
- **For testing phase**: Show test-writer all signatures to plan test cases
- **For audit phase**: Provide auditor signatures to validate against implementation

---

## Backward Compatibility Strategy

### Existing Tasks (with spec.md)

**Status**: Fully backward compatible. No action required.

**Rationale**:
- Old tasks have `spec.md` already written and stored
- Context-manager RETRIEVE logic remains unchanged for tasks with spec.md
- Auditor can still validate against spec.md if present
- Implementer can still read spec.md for existing tasks

**Migration Path** (optional, not required):
- New standard tasks use architect-only flow
- Existing tasks continue using spec.md
- No version flag needed - context-manager detects presence of spec.md vs. architect-only

### New Tasks (architect-only)

**Workflow**: Architect -> Design Audit -> Implementation+Testing

**Requirements**:
- Architect output MUST include signatures, types, edgeCases, testHints sections
- spec-writer.md is NOT called
- Auditor validates architect.md directly
- Implementer reads architect.md (no spec.md)
- Test-writer reads architect.md (no spec.md)

---

## Task Breakdown (9 tasks, 3 waves)

### Wave 0: Foundation (No Dependencies)
- **Task 1**: Update architect.md command documentation with new schema and example output
- **Task 2**: Update context-manager.md - add architect-signatures RETRIEVE logic

### Wave 1: Workflow Updates (Depends on Wave 0)
- **Task 3**: Update orchestrator-full.md - remove spec phase from workflow
- **Task 4**: Update implementer.md - add support for reading architect signatures
- **Task 5**: Update test-writer.md - add support for reading architect signatures
- **Task 6**: Update auditor.md - add architect-only validation path
- **Task 7**: Update orchestrator-resume.md - update routing to skip spec for new tasks

### Wave 2: Cleanup (Depends on Wave 1)
- **Task 8**: Verify orchestrator-lite.md (already skips spec)
- **Task 9**: Delete spec-writer.md (or mark as deprecated)

---

## Implementation Strategy

1. **Enhanced architect output** provides all necessary signatures, types, edge cases, and test hints
2. **Design auditor** validates this comprehensive output against schema
3. **Implementer and test-writer** have all required information from architect phase
4. **No information loss** - spec phase output is now part of architect output
5. **Overall workflow simplified** from 5 phases to 4 phases for new tasks
6. **Existing tasks unaffected** - backward compatible with spec.md

---

## Success Criteria

- Architect output schema is exact and unambiguous
- RETRIEVE architect-signatures logic is fully defined
- Backward compatibility explicitly documented
- All 9 implementation tasks have clear acceptance criteria
- Design audit passes without gaps
