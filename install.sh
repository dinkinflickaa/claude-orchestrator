#!/bin/bash
set -e

# Claude Orchestrator Installer
# Usage: curl -sL https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.sh | bash

REPO_RAW="https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}${MAGENTA}Claude Orchestrator${NC}"
echo -e "${DIM}Multi-agent workflow for Claude Code${NC}"
echo ""

# Create .claude directory structure
mkdir -p .claude/commands
mkdir -p .claude/agents
mkdir -p .claude/docs
mkdir -p docs/orchestrator/context/tasks
mkdir -p docs/orchestrator/memory
mkdir -p .claude/orchestrator/metrics

# Migration: Move legacy paths to new locations
migrate_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -d "$src" ] && [ "$(ls -A "$src" 2>/dev/null)" ]; then
    echo -e "  ${YELLOW}→${NC} Migrating $src to $dst"
    mkdir -p "$dst"
    cp -r "$src"/* "$dst"/ 2>/dev/null || true
    rm -rf "$src"
  fi
}

# Context: .claude/context/ -> docs/orchestrator/context/
migrate_if_exists ".claude/context" "docs/orchestrator/context"

# Memory: .claude/memory/ -> docs/orchestrator/memory/
migrate_if_exists ".claude/memory" "docs/orchestrator/memory"

# Metrics: .claude/metrics/ -> .claude/orchestrator/metrics/
migrate_if_exists ".claude/metrics" ".claude/orchestrator/metrics"

# Download commands
echo -e "${BOLD}Commands${NC}"
COMMANDS=(
  "orchestrator-full"
  "orchestrator-lite"
  "orchestrator-graduate"
  "orchestrator-resume"
)

for cmd in "${COMMANDS[@]}"; do
  echo -e "  ${CYAN}→${NC} ${cmd}.md"
  curl -sL "$REPO_RAW/.claude/commands/${cmd}.md" -o ".claude/commands/${cmd}.md"
done

# Download CLAUDE.md template (project-specific instructions)
echo ""
echo -e "${BOLD}Config${NC}"
echo -e "  ${CYAN}→${NC} CLAUDE.md"
curl -sL "$REPO_RAW/CLAUDE.md" -o CLAUDE.md

# Download agent files
echo ""
echo -e "${BOLD}Agents${NC}"

AGENTS=(
  "architect"
  "auditor"
  "implementer"
  "test-runner"
  "test-writer"
)

for agent in "${AGENTS[@]}"; do
  echo -e "  ${CYAN}→${NC} ${agent}.md"
  curl -sL "$REPO_RAW/.claude/agents/${agent}.md" -o ".claude/agents/${agent}.md"
done

# Download docs (shared rules)
echo ""
echo -e "${BOLD}Docs${NC}"
echo -e "  ${CYAN}→${NC} orchestrator-base.md"
curl -sL "$REPO_RAW/.claude/docs/orchestrator-base.md" -o ".claude/docs/orchestrator-base.md"

# Download and setup MCP server
echo ""
echo -e "${BOLD}MCP Server${NC}"
mkdir -p .claude/mcp-server
echo -e "  ${CYAN}→${NC} package.json"
curl -sL "$REPO_RAW/mcp-server/package.json" -o ".claude/mcp-server/package.json"
echo -e "  ${CYAN}→${NC} index.js"
curl -sL "$REPO_RAW/mcp-server/index.js" -o ".claude/mcp-server/index.js"
echo -e "  ${CYAN}→${NC} Installing dependencies..."
(cd .claude/mcp-server && npm install --silent 2>/dev/null)

# Create .mcp.json for MCP server registration
echo ""
echo -e "${BOLD}MCP Config${NC}"
echo -e "  ${CYAN}→${NC} .mcp.json"
cat > .mcp.json << 'MCPEOF'
{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": [".claude/mcp-server/index.js"]
    }
  }
}
MCPEOF

echo ""
echo -e "${GREEN}${BOLD}✓ Installed successfully${NC}"
echo ""
echo -e "${DIM}Files added:${NC}"
echo -e "  ${DIM}CLAUDE.md, .claude/commands/*, .claude/agents/*, .claude/mcp-server/*, .mcp.json${NC}"
echo ""
echo -e "${BOLD}${YELLOW}⚠ Restart Claude Code${NC}"
echo -e "Restart Claude Code and approve the 'orchestrator' MCP server when prompted."
echo ""
echo -e "${BOLD}Usage${NC}"
echo -e "  ${CYAN}/orchestrator-full${NC} <task>     ${DIM}Full workflow with audits${NC}"
echo -e "  ${GREEN}/orchestrator-lite${NC} <task>     ${DIM}Rapid prototyping${NC}"
echo -e "  ${YELLOW}/orchestrator-graduate${NC} <slug>  ${DIM}Promote POC to production${NC}"
echo -e "  ${BLUE}/orchestrator-resume${NC} <slug>    ${DIM}Resume paused workflow${NC}"
echo ""
