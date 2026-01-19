#!/bin/bash
set -e

# Claude Orchestrator Installer
# Usage: curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash

REPO_RAW="https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main"

echo "Installing Claude Orchestrator..."

# Create .claude directory structure
mkdir -p .claude/commands
mkdir -p .claude/agents

# Download commands
COMMANDS=(
  "orchestrate"
  "poc"
  "graduate"
)

for cmd in "${COMMANDS[@]}"; do
  echo "  → Downloading .claude/commands/${cmd}.md"
  curl -sL "$REPO_RAW/.claude/commands/${cmd}.md" -o ".claude/commands/${cmd}.md"
done

# Download CLAUDE.md template (project-specific instructions)
echo "  → Downloading CLAUDE.md"
curl -sL "$REPO_RAW/CLAUDE.md" -o CLAUDE.md

# Download agent files
AGENTS=(
  "architect"
  "auditor"
  "context-manager"
  "implementer"
  "spec-writer"
  "test-runner"
  "test-writer"
)

for agent in "${AGENTS[@]}"; do
  echo "  → Downloading .claude/agents/${agent}.md"
  curl -sL "$REPO_RAW/.claude/agents/${agent}.md" -o ".claude/agents/${agent}.md"
done

echo ""
echo "✓ Claude Orchestrator installed successfully!"
echo ""
echo "Files added:"
echo "  - CLAUDE.md (project-specific template)"
echo "  - .claude/commands/*.md (3 commands)"
echo "  - .claude/agents/*.md (7 agent configs)"
echo ""
echo "Commands:"
echo "  /orchestrate <task>  - Full workflow with audits"
echo "  /poc <task>          - Rapid prototyping (skip audits/tests)"
echo "  /graduate <slug>     - Promote POC to production"
echo ""
echo "Examples:"
echo "  /orchestrate add user authentication"
echo "  /poc experiment with Redis caching"
echo "  /graduate redis-caching"
echo ""
