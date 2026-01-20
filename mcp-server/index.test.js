import assert from 'assert';
import { extractScopedTaskContext } from './index.js';

// Test 1: Valid taskBreakdown with existing task_id - returns scoped context
console.log('Test 1: Valid taskBreakdown with existing task_id');
{
  const architectContent = `
# Architect Output

\`\`\`json
{
  "taskBreakdown": [
    {
      "task_id": 1,
      "name": "Task 1",
      "description": "First task",
      "function": "function doTask1() { return 'done'; }",
      "dependencies": ["task-2"],
      "edgeCases": ["empty input", "null value"],
      "testHints": ["test happy path", "test error handling"]
    },
    {
      "task_id": 2,
      "name": "Task 2",
      "description": "Second task",
      "function": "function doTask2() { return 'also done'; }",
      "dependencies": [],
      "edgeCases": ["boundary condition"],
      "testHints": ["test with large input"]
    }
  ]
}
\`\`\`
  `;

  const result = extractScopedTaskContext(architectContent, 1);
  assert(result !== null, 'Result should not be null');
  assert(result.task, 'Result should have task property');
  assert.strictEqual(result.task.task_id, 1, 'Task ID should match');
  assert.strictEqual(result.task.name, 'Task 1', 'Task name should match');
  assert(Array.isArray(result.dependencySignatures), 'dependencySignatures should be array');
  assert(result.globalContext, 'Result should have globalContext property');
  console.log('  PASS');
}

// Test 2: Task with dependencies - includes dependency signatures
console.log('Test 2: Task with dependencies - includes dependency signatures');
{
  const architectContent = `
\`\`\`json
{
  "taskBreakdown": [
    {
      "task_id": 1,
      "name": "Task 1",
      "description": "Depends on Task 2 and 3",
      "function": "function task1() {}",
      "dependencies": ["task-2", "task-3"],
      "edgeCases": [],
      "testHints": []
    },
    {
      "task_id": 2,
      "name": "Task 2",
      "description": "Dependency",
      "function": "function task2() { return 'sig'; }",
      "dependencies": [],
      "edgeCases": ["edge1"],
      "testHints": []
    },
    {
      "task_id": 3,
      "name": "Task 3",
      "description": "Another dependency",
      "function": "function task3() { return 'sig3'; }",
      "dependencies": [],
      "edgeCases": [],
      "testHints": []
    }
  ]
}
\`\`\`
  `;

  const result = extractScopedTaskContext(architectContent, 1);
  assert.strictEqual(result.dependencySignatures.length, 2, 'Should have 2 dependency signatures');
  assert.strictEqual(result.dependencySignatures[0].task_id, 2, 'First dependency should be task 2');
  assert.strictEqual(result.dependencySignatures[1].task_id, 3, 'Second dependency should be task 3');
  assert(result.dependencySignatures[0].function.includes('task2'), 'Dependency should include function signature');
  console.log('  PASS');
}

// Test 3: Task_id not found - returns null
console.log('Test 3: Task_id not found - returns null');
{
  const architectContent = `
\`\`\`json
{
  "taskBreakdown": [
    {
      "task_id": 1,
      "name": "Task 1",
      "function": "function task1() {}",
      "dependencies": [],
      "edgeCases": [],
      "testHints": []
    }
  ]
}
\`\`\`
  `;

  const result = extractScopedTaskContext(architectContent, 999);
  assert.strictEqual(result, null, 'Should return null for non-existent task_id');
  console.log('  PASS');
}

// Test 4: Malformed JSON - returns null
console.log('Test 4: Malformed JSON - returns null');
{
  const architectContent = `
Some content before
\`\`\`json
{ "taskBreakdown": invalid json here }
\`\`\`
Some content after
  `;

  const result = extractScopedTaskContext(architectContent, 1);
  assert.strictEqual(result, null, 'Should return null for malformed JSON');
  console.log('  PASS');
}

// Test 5: Task with no dependencies - dependencySignatures is empty array
console.log('Test 5: Task with no dependencies - dependencySignatures is empty array');
{
  const architectContent = `
\`\`\`json
{
  "taskBreakdown": [
    {
      "task_id": 1,
      "name": "Standalone Task",
      "description": "No dependencies",
      "function": "function standalone() {}",
      "dependencies": [],
      "edgeCases": ["no deps edge case"],
      "testHints": ["standalone test"]
    }
  ]
}
\`\`\`
  `;

  const result = extractScopedTaskContext(architectContent, 1);
  assert.strictEqual(result.dependencySignatures.length, 0, 'dependencySignatures should be empty array');
  assert(Array.isArray(result.dependencySignatures), 'dependencySignatures should be an array');
  console.log('  PASS');
}

// Test 6: Missing dependency task in breakdown - skips silently
console.log('Test 6: Missing dependency task in breakdown - skips silently');
{
  const architectContent = `
\`\`\`json
{
  "taskBreakdown": [
    {
      "task_id": 1,
      "name": "Task 1",
      "description": "References missing task-99",
      "function": "function task1() {}",
      "dependencies": ["task-99", "task-2"],
      "edgeCases": [],
      "testHints": []
    },
    {
      "task_id": 2,
      "name": "Task 2",
      "description": "Exists",
      "function": "function task2() {}",
      "dependencies": [],
      "edgeCases": [],
      "testHints": []
    }
  ]
}
\`\`\`
  `;

  const result = extractScopedTaskContext(architectContent, 1);
  // Should only include Task 2 in dependencies, skip the missing task-99 silently
  assert.strictEqual(result.dependencySignatures.length, 1, 'Should have 1 dependency (missing one skipped)');
  assert.strictEqual(result.dependencySignatures[0].task_id, 2, 'Should include existing Task 2');
  console.log('  PASS');
}

console.log('\nAll tests passed!');
