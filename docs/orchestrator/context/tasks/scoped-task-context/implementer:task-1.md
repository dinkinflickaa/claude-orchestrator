Added extractScopedTaskContext helper (lines 107-165):
- Parses JSON from architectContent
- Returns {task, dependencySignatures, globalContext}
- Handles edge cases: null for missing taskId or bad JSON