# Architect Output: scoped-task-context

## Problem Analysis
Currently implementers/test-writers receive ALL tasks' context when they only need their specific task. This wastes tokens.

## Solution Design
Add `task_id` parameter to `orchestrator_begin_phase` and `orchestrator_retrieve`. When provided, filter context to only that task's signatures, edge cases, and test hints - plus dependency signatures as read-only.

## Key Changes
1. New helper: `extractScopedTaskContext(architectContent, taskId)`
2. Modified: `orchestrator_begin_phase` accepts `task_id` parameter
3. Modified: `retrieveContext` filters when `task_id` provided
4. Updated docs and orchestrator commands

## Task Breakdown (6 tasks)
1. Add extractScopedTaskContext helper (no deps)
2. Add task_id to orchestrator_begin_phase (deps: 1)
3. Update retrieveContext for task_id filtering (deps: 1)
4. Add task_id to orchestrator_retrieve (deps: 3)
5. Update orchestrator-base.md docs (deps: 2, 4)
6. Update orchestrator-full.md to pass task_id (deps: 5)