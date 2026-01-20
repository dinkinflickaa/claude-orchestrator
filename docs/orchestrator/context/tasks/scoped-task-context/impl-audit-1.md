## IMPL-AUDIT: IMPLEMENTATION_FLAW

**Critical:** extractScopedTaskContext helper exists but is NOT integrated:
- orchestrator_begin_phase missing task_id parameter
- retrieveContext missing taskId parameter
- orchestrator_retrieve missing task_id parameter
- extractScopedTaskContext never called

**Fix Required:** Integrate the helper into MCP tools