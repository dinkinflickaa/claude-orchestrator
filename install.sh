#!/bin/bash
set -e

# Claude Orchestrator Installer
# Usage: curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash

REPO_RAW="https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main"

echo "Installing Claude Orchestrator..."

# Download CLAUDE.md
echo "  → Downloading CLAUDE.md"
curl -sL "$REPO_RAW/CLAUDE.md" -o CLAUDE.md

# Create .claude/agents directory
mkdir -p .claude/agents

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
echo "  - CLAUDE.md"
echo "  - .claude/agents/*.md (7 agent configs)"
echo ""
echo "Add these to your .gitignore if you don't want to commit them."
