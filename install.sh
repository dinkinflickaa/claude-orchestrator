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

# Download commands
echo -e "${BOLD}Commands${NC}"
COMMANDS=(
  "orchestrate"
  "poc"
  "graduate"
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

# Agent colors for visual distinction
declare -A AGENT_COLORS=(
  ["architect"]="${BLUE}"
  ["auditor"]="${RED}"
  ["context-manager"]="${YELLOW}"
  ["implementer"]="${GREEN}"
  ["spec-writer"]="${MAGENTA}"
  ["test-runner"]="${CYAN}"
  ["test-writer"]="${CYAN}"
)

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
  color="${AGENT_COLORS[$agent]}"
  echo -e "  ${color}→${NC} ${agent}.md"
  curl -sL "$REPO_RAW/.claude/agents/${agent}.md" -o ".claude/agents/${agent}.md"
done

echo ""
echo -e "${GREEN}${BOLD}✓ Installed successfully${NC}"
echo ""
echo -e "${DIM}Files added:${NC}"
echo -e "  ${DIM}CLAUDE.md, .claude/commands/*, .claude/agents/*${NC}"
echo ""
echo -e "${BOLD}Usage${NC}"
echo -e "  ${CYAN}/orchestrate${NC} <task>  ${DIM}Full workflow with audits${NC}"
echo -e "  ${GREEN}/poc${NC} <task>          ${DIM}Rapid prototyping${NC}"
echo -e "  ${YELLOW}/graduate${NC} <slug>     ${DIM}Promote POC to production${NC}"
echo ""
