#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";

// Base paths
const CONTEXT_BASE = "docs/orchestrator/context";
const MEMORY_BASE = "docs/orchestrator/memory";
const TASKS_DIR = `${CONTEXT_BASE}/tasks`;
const CURRENT_TASK_FILE = `${CONTEXT_BASE}/current-task.md`;

// Helper: Get current working directory (where Claude Code is running)
function getCwd() {
  return process.cwd();
}

// Helper: Resolve path relative to cwd
function resolvePath(...parts) {
  return path.join(getCwd(), ...parts);
}

// Helper: Ensure directory exists
function ensureDir(dirPath) {
  const resolved = resolvePath(dirPath);
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true });
  }
}

// Helper: Read JSON file
function readJson(filePath) {
  const resolved = resolvePath(filePath);
  if (!fs.existsSync(resolved)) return null;
  return JSON.parse(fs.readFileSync(resolved, "utf-8"));
}

// Helper: Write JSON file
function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(resolvePath(filePath), JSON.stringify(data, null, 2));
}

// Helper: Read text file
function readText(filePath) {
  const resolved = resolvePath(filePath);
  if (!fs.existsSync(resolved)) return null;
  return fs.readFileSync(resolved, "utf-8");
}

// Helper: Write text file
function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(resolvePath(filePath), content);
}

// Helper: Get current task slug
function getCurrentTask() {
  const content = readText(CURRENT_TASK_FILE);
  if (!content) return null;
  const match = content.match(/Current task: (.+)/);
  return match ? match[1].trim() : null;
}

// Helper: Set current task
function setCurrentTask(slug) {
  writeText(CURRENT_TASK_FILE, `Current task: ${slug}\nUpdated: ${new Date().toISOString()}`);
}

// Helper: Get manifest path for a task
function getManifestPath(slug) {
  return `${TASKS_DIR}/${slug}/manifest.json`;
}

// Helper: Get task directory
function getTaskDir(slug) {
  return `${TASKS_DIR}/${slug}`;
}

// Helper: Slugify task name
function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Helper: Extract signatures from architect output
function extractArchitectSignatures(architectContent) {
  // Try to parse taskBreakdown JSON from architect output
  const jsonMatch = architectContent.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.taskBreakdown) {
        return parsed.taskBreakdown;
      }
    } catch (e) {
      // Not valid JSON, continue
    }
  }
  return null;
}

// Tool implementations
const tools = {
  // LIST - List all tasks
  orchestrator_list: async () => {
    ensureDir(TASKS_DIR);
    const tasksPath = resolvePath(TASKS_DIR);

    if (!fs.existsSync(tasksPath)) {
      return { tasks: [], current: null };
    }

    const dirs = fs.readdirSync(tasksPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const tasks = dirs.map(slug => {
      const manifest = readJson(getManifestPath(slug));
      return manifest ? {
        slug,
        mode: manifest.mode,
        workflow: manifest.workflow,
        status: manifest.status,
        created_at: manifest.created_at,
        updated_at: manifest.updated_at
      } : { slug, status: "unknown" };
    });

    return { tasks, current: getCurrentTask() };
  },

  // INIT - Initialize a new task
  orchestrator_init: async ({ task, mode = "standard", workflow = "orchestrate" }) => {
    const slug = slugify(task);
    const taskDir = getTaskDir(slug);
    const manifestPath = getManifestPath(slug);

    // Check if task already exists
    if (readJson(manifestPath)) {
      return { error: `Task '${slug}' already exists`, status: "error" };
    }

    ensureDir(taskDir);

    const manifest = {
      name: slug,
      mode,
      workflow,
      status: "running",
      current_phase: null,
      running_phases: [],
      completed_phases: [],
      failure_context: null,
      gate_context: null,
      shelf_context: null,
      metrics: {
        total_duration_ms: null,
        parallelization_savings_ms: null,
        total_retries: 0
      },
      waves: {
        task_breakdown: null,
        execution: []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    writeJson(manifestPath, manifest);
    setCurrentTask(slug);

    return { status: "success", task: slug, manifest };
  },

  // BEGIN_PHASE - Retrieve context and start phase
  orchestrator_begin_phase: async ({ phase, needs }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const manifestPath = getManifestPath(slug);
    const manifest = readJson(manifestPath);
    if (!manifest) return { error: `Task '${slug}' not found`, status: "error" };

    // Record phase start
    const phaseRecord = {
      name: phase,
      started_at: new Date().toISOString()
    };
    manifest.running_phases.push(phaseRecord);
    manifest.current_phase = phase;
    manifest.updated_at = new Date().toISOString();
    writeJson(manifestPath, manifest);

    // Retrieve context based on needs
    const context = await retrieveContext(slug, needs, phase);

    return { status: "success", task: slug, phase, context };
  },

  // COMPLETE_PHASE - Store content and end phase
  orchestrator_complete_phase: async ({ phase, status, content, task_id, iteration }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const manifestPath = getManifestPath(slug);
    const manifest = readJson(manifestPath);
    if (!manifest) return { error: `Task '${slug}' not found`, status: "error" };

    // Store content
    await storeContent(slug, phase, content, task_id, iteration);

    // Move phase from running to completed
    const runningIdx = manifest.running_phases.findIndex(p => p.name === phase);
    if (runningIdx >= 0) {
      const phaseRecord = manifest.running_phases.splice(runningIdx, 1)[0];
      phaseRecord.ended_at = new Date().toISOString();
      phaseRecord.status = status;
      phaseRecord.duration_ms = new Date(phaseRecord.ended_at) - new Date(phaseRecord.started_at);
      manifest.completed_phases.push(phaseRecord);
    }

    if (status === "failed") {
      manifest.metrics.total_retries++;
    }

    manifest.current_phase = manifest.running_phases[0]?.name || null;
    manifest.updated_at = new Date().toISOString();
    writeJson(manifestPath, manifest);

    return { status: "success", task: slug, phase, stored: true };
  },

  // SET_GATE - Set a gate for human approval
  orchestrator_set_gate: async ({ gate, prompt, artifacts }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const manifestPath = getManifestPath(slug);
    const manifest = readJson(manifestPath);
    if (!manifest) return { error: `Task '${slug}' not found`, status: "error" };

    manifest.status = "waiting_gate";
    manifest.gate_context = {
      gate,
      prompt,
      artifacts: artifacts ? artifacts.split(",").map(a => a.trim()) : [],
      set_at: new Date().toISOString()
    };
    manifest.updated_at = new Date().toISOString();
    writeJson(manifestPath, manifest);

    return { status: "success", task: slug, gate, waiting: true };
  },

  // RESUME - Resume from gate or pause
  orchestrator_resume: async ({ decision }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const manifestPath = getManifestPath(slug);
    const manifest = readJson(manifestPath);
    if (!manifest) return { error: `Task '${slug}' not found`, status: "error" };

    const gateType = manifest.gate_context?.gate;
    const wasStatus = manifest.status;

    let continueFrom = null;

    if (wasStatus === "waiting_gate") {
      if (gateType === "investigation") {
        if (decision === "full") {
          continueFrom = "implementer";
          manifest.status = "running";
        } else if (decision === "lite") {
          manifest.workflow = "poc";
          manifest.status = "running";
          continueFrom = "implementer";
        } else if (decision === "shelf") {
          manifest.status = "shelved";
          manifest.shelf_context = {
            investigation_summary: "Investigation shelved by user",
            shelved_at: new Date().toISOString(),
            shelved_phase: manifest.current_phase,
            completed_phases: manifest.completed_phases.map(p => p.name)
          };
          continueFrom = "exit";
        } else if (decision === "cancel") {
          manifest.status = "cancelled";
          continueFrom = "exit";
        }
      } else if (gateType === "final") {
        if (decision === "approve") {
          manifest.status = "completed";
          continueFrom = "complete";
        } else if (decision === "reject") {
          manifest.status = "failed";
          continueFrom = "exit";
        } else if (decision === "revise") {
          manifest.status = "running";
          continueFrom = "implementer";
        }
      } else if (gateType === "design") {
        if (decision === "approve") {
          manifest.status = "running";
          continueFrom = "implementer";
        } else if (decision === "reject") {
          manifest.status = "failed";
          continueFrom = "exit";
        } else if (decision === "revise") {
          manifest.status = "running";
          continueFrom = "architect";
        }
      }
      manifest.gate_context = null;
    } else if (wasStatus === "paused") {
      if (decision === "retry") {
        manifest.status = "running";
        continueFrom = manifest.failure_context?.phase || "implementer";
      } else if (decision === "reject") {
        manifest.status = "failed";
        continueFrom = "exit";
      }
      manifest.failure_context = null;
    } else if (wasStatus === "shelved") {
      if (decision === "full") {
        manifest.status = "running";
        manifest.workflow = "orchestrate";
        continueFrom = "implementer";
      } else if (decision === "lite") {
        manifest.status = "running";
        manifest.workflow = "poc";
        continueFrom = "implementer";
      } else if (decision === "cancel") {
        manifest.status = "cancelled";
        continueFrom = "exit";
      }
      manifest.shelf_context = null;
    }

    manifest.updated_at = new Date().toISOString();
    writeJson(manifestPath, manifest);

    return { status: "success", task: slug, decision, continue_from: continueFrom };
  },

  // PAUSE - Pause workflow
  orchestrator_pause: async ({ reason, recommendations }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const manifestPath = getManifestPath(slug);
    const manifest = readJson(manifestPath);
    if (!manifest) return { error: `Task '${slug}' not found`, status: "error" };

    manifest.status = "paused";
    manifest.failure_context = {
      reason,
      recommendations: recommendations ? recommendations.split(",").map(r => r.trim()) : [],
      phase: manifest.current_phase,
      paused_at: new Date().toISOString()
    };
    manifest.updated_at = new Date().toISOString();
    writeJson(manifestPath, manifest);

    return { status: "success", task: slug, paused: true };
  },

  // METRICS - Get execution metrics
  orchestrator_metrics: async ({ format = "summary" }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const manifest = readJson(getManifestPath(slug));
    if (!manifest) return { error: `Task '${slug}' not found`, status: "error" };

    const phases = manifest.completed_phases || [];
    const totalDuration = phases.reduce((sum, p) => sum + (p.duration_ms || 0), 0);

    const metrics = {
      task: slug,
      status: manifest.status,
      total_duration_ms: totalDuration,
      total_duration_human: `${Math.round(totalDuration / 1000)}s`,
      phases_completed: phases.length,
      total_retries: manifest.metrics?.total_retries || 0,
      phases: format === "detailed" ? phases : undefined
    };

    return metrics;
  },

  // STORE - Store arbitrary content
  orchestrator_store: async ({ phase, content, task_id, iteration }) => {
    const slug = getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    await storeContent(slug, phase, content, task_id, iteration);

    return { status: "success", task: slug, phase, stored: true };
  },

  // RETRIEVE - Retrieve context
  orchestrator_retrieve: async ({ needs, for_phase, task }) => {
    const slug = task || getCurrentTask();
    if (!slug) return { error: "No current task", status: "error" };

    const context = await retrieveContext(slug, needs, for_phase);
    return { status: "success", task: slug, context };
  }
};

// Helper: Store content to appropriate file
async function storeContent(slug, phase, content, taskId, iteration) {
  const taskDir = getTaskDir(slug);
  let filePath;

  switch (phase) {
    case "architect":
      filePath = `${taskDir}/architect.md`;
      break;
    case "architect-revision":
      filePath = `${taskDir}/architect-revision-${iteration || 1}.md`;
      break;
    case "design-audit":
      filePath = iteration ? `${taskDir}/design-audit-${iteration}.md` : `${taskDir}/design-audit.md`;
      break;
    case "spec":
      filePath = `${taskDir}/spec.md`;
      break;
    case "implementation":
    case "implementer":
      ensureDir(`${taskDir}/implementations`);
      filePath = `${taskDir}/implementations/task-${taskId || 1}.md`;
      break;
    case "implementation-fix":
      filePath = `${taskDir}/implementation-fix-${iteration || 1}.md`;
      break;
    case "tests":
    case "test-writer":
      ensureDir(`${taskDir}/tests`);
      filePath = `${taskDir}/tests/task-${taskId || 1}.md`;
      break;
    case "test-results":
    case "test-runner":
      filePath = `${taskDir}/test-results.md`;
      break;
    case "impl-audit":
      filePath = iteration ? `${taskDir}/impl-audit-${iteration}.md` : `${taskDir}/impl-audit.md`;
      break;
    case "debt":
      filePath = `${taskDir}/debt.md`;
      break;
    default:
      filePath = `${taskDir}/${phase}.md`;
  }

  writeText(filePath, content);
}

// Helper: Retrieve context based on needs
async function retrieveContext(slug, needs, forPhase) {
  const taskDir = getTaskDir(slug);
  const context = {};

  // Handle manifest retrieval for resume
  if (forPhase === "resume" || needs === "manifest") {
    context.manifest = readJson(getManifestPath(slug));
    return context;
  }

  // Memory injection
  if (needs?.includes("memory")) {
    const decisions = readText(`${MEMORY_BASE}/decisions.md`);
    const patterns = readText(`${MEMORY_BASE}/patterns.md`);
    if (decisions) context.memory_decisions = decisions;
    if (patterns) context.memory_patterns = patterns;
  }

  // Architect output
  if (needs?.includes("architect") || forPhase === "design-audit" || forPhase === "spec") {
    context.architect = readText(`${taskDir}/architect.md`);
  }

  // Signatures from architect (for implementation/testing)
  if (needs?.includes("architect-signatures") || forPhase === "implementation" || forPhase === "testing") {
    // Check for legacy spec.md first
    const specContent = readText(`${taskDir}/spec.md`);
    if (specContent) {
      context.spec = specContent;
    } else {
      // Extract from architect
      const architectContent = readText(`${taskDir}/architect.md`);
      if (architectContent) {
        const breakdown = extractArchitectSignatures(architectContent);
        if (breakdown) {
          context.task_breakdown = breakdown;
        }
        context.architect = architectContent;
      }
    }
  }

  // Design audit feedback for revision
  if (needs?.includes("design-audit-feedback") || forPhase === "revision") {
    context.design_audit = readText(`${taskDir}/design-audit.md`);
    context.architect = readText(`${taskDir}/architect.md`);
  }

  // Implementation audit feedback for fix
  if (needs?.includes("impl-audit-feedback") || forPhase === "fix") {
    context.impl_audit = readText(`${taskDir}/impl-audit.md`);

    // Get implementations
    const implDir = resolvePath(`${taskDir}/implementations`);
    if (fs.existsSync(implDir)) {
      const implFiles = fs.readdirSync(implDir).filter(f => f.endsWith(".md"));
      context.implementations = {};
      for (const f of implFiles) {
        context.implementations[f] = readText(`${taskDir}/implementations/${f}`);
      }
    }
  }

  // All context for impl-audit
  if (needs === "all" || forPhase === "impl-audit") {
    context.architect = readText(`${taskDir}/architect.md`);
    context.spec = readText(`${taskDir}/spec.md`);
    context.test_results = readText(`${taskDir}/test-results.md`);

    // Get implementations
    const implDir = resolvePath(`${taskDir}/implementations`);
    if (fs.existsSync(implDir)) {
      const implFiles = fs.readdirSync(implDir).filter(f => f.endsWith(".md"));
      context.implementations = {};
      for (const f of implFiles) {
        context.implementations[f] = readText(`${taskDir}/implementations/${f}`);
      }
    }

    // Get tests
    const testsDir = resolvePath(`${taskDir}/tests`);
    if (fs.existsSync(testsDir)) {
      const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith(".md"));
      context.tests = {};
      for (const f of testFiles) {
        context.tests[f] = readText(`${taskDir}/tests/${f}`);
      }
    }
  }

  // Graduate context
  if (forPhase === "graduate" || needs?.includes("debt")) {
    context.architect = readText(`${taskDir}/architect.md`);
    context.debt = readText(`${taskDir}/debt.md`);

    const implDir = resolvePath(`${taskDir}/implementations`);
    if (fs.existsSync(implDir)) {
      const implFiles = fs.readdirSync(implDir).filter(f => f.endsWith(".md"));
      context.implementations = {};
      for (const f of implFiles) {
        context.implementations[f] = readText(`${taskDir}/implementations/${f}`);
      }
    }
  }

  // Investigation summary for checkpoint
  if (forPhase === "checkpoint" || needs?.includes("investigation-summary")) {
    const architectContent = readText(`${taskDir}/architect.md`);
    if (architectContent) {
      // Extract key sections for summary
      const sections = [];
      const designMatch = architectContent.match(/## Design Decisions[\s\S]*?(?=##|$)/);
      const filesMatch = architectContent.match(/## Files Affected[\s\S]*?(?=##|$)/);
      if (designMatch) sections.push(designMatch[0].trim());
      if (filesMatch) sections.push(filesMatch[0].trim());
      context.investigation_summary = sections.join("\n\n") || "See architect.md for details";
    }
  }

  return context;
}

// Create and run server
const server = new Server(
  { name: "orchestrator-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "orchestrator_list",
      description: "List all orchestrator tasks with their status",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "orchestrator_init",
      description: "Initialize a new orchestrator task",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "Task name (will be slugified)" },
          mode: { type: "string", enum: ["standard", "poc"], default: "standard" },
          workflow: { type: "string", enum: ["orchestrate", "poc", "graduate"], default: "orchestrate" }
        },
        required: ["task"]
      }
    },
    {
      name: "orchestrator_begin_phase",
      description: "Begin a phase: retrieves context and marks phase as started",
      inputSchema: {
        type: "object",
        properties: {
          phase: { type: "string", description: "Phase name (architect, design-audit, implementer, test-writer, test-runner, impl-audit)" },
          needs: { type: "string", description: "What context to retrieve (memory, architect-output, architect-signatures, all)" }
        },
        required: ["phase", "needs"]
      }
    },
    {
      name: "orchestrator_complete_phase",
      description: "Complete a phase: stores content and marks phase as ended",
      inputSchema: {
        type: "object",
        properties: {
          phase: { type: "string", description: "Phase name" },
          status: { type: "string", enum: ["success", "failed"] },
          content: { type: "string", description: "Content to store" },
          task_id: { type: "number", description: "Task ID for implementation/test phases" },
          iteration: { type: "number", description: "Iteration number for revisions" }
        },
        required: ["phase", "status", "content"]
      }
    },
    {
      name: "orchestrator_set_gate",
      description: "Set a gate for human approval",
      inputSchema: {
        type: "object",
        properties: {
          gate: { type: "string", enum: ["design", "investigation", "final"] },
          prompt: { type: "string", description: "Prompt to show user" },
          artifacts: { type: "string", description: "Comma-separated list of artifact paths to review" }
        },
        required: ["gate", "prompt"]
      }
    },
    {
      name: "orchestrator_resume",
      description: "Resume from a gate or pause",
      inputSchema: {
        type: "object",
        properties: {
          decision: { type: "string", enum: ["approve", "reject", "retry", "revise", "full", "lite", "shelf", "cancel"] }
        },
        required: ["decision"]
      }
    },
    {
      name: "orchestrator_pause",
      description: "Pause the workflow",
      inputSchema: {
        type: "object",
        properties: {
          reason: { type: "string", description: "Reason for pausing" },
          recommendations: { type: "string", description: "Comma-separated list of recommendations" }
        },
        required: ["reason"]
      }
    },
    {
      name: "orchestrator_metrics",
      description: "Get execution metrics for current task",
      inputSchema: {
        type: "object",
        properties: {
          format: { type: "string", enum: ["summary", "detailed", "json"], default: "summary" }
        }
      }
    },
    {
      name: "orchestrator_store",
      description: "Store content for a phase (use complete_phase instead when ending a phase)",
      inputSchema: {
        type: "object",
        properties: {
          phase: { type: "string", description: "Phase name" },
          content: { type: "string", description: "Content to store" },
          task_id: { type: "number" },
          iteration: { type: "number" }
        },
        required: ["phase", "content"]
      }
    },
    {
      name: "orchestrator_retrieve",
      description: "Retrieve context (use begin_phase instead when starting a phase)",
      inputSchema: {
        type: "object",
        properties: {
          needs: { type: "string", description: "What to retrieve" },
          for_phase: { type: "string", description: "Target phase" },
          task: { type: "string", description: "Task slug (defaults to current)" }
        },
        required: ["needs", "for_phase"]
      }
    }
  ]
}));

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!tools[name]) {
    return { content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }] };
  }

  try {
    const result = await tools[name](args || {});
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error) {
    return { content: [{ type: "text", text: JSON.stringify({ error: error.message }) }] };
  }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
