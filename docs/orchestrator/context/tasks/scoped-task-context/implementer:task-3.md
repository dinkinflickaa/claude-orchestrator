Updated retrieveContext for task_id filtering:
- Added taskId parameter
- Uses extractScopedTaskContext when taskId + architect-signatures
- Falls back to full context if scoped extraction fails
- Stores in context.scoped_task_context