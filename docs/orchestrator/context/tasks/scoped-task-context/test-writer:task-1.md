Created mcp-server/index.test.js with 6 tests:
1. Valid task_id returns scoped context
2. Task with dependencies includes dep signatures
3. Task_id not found returns null
4. Malformed JSON returns null
5. No dependencies = empty array
6. Missing dependency skipped silently