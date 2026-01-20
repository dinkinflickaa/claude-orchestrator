# Claude Orchestrator Installer for Windows
# Usage: irm https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$REPO_RAW = "https://raw.githubusercontent.com/dinkinflickaa/claude-orchestrator/main"

Write-Host ""
Write-Host "Claude Orchestrator" -ForegroundColor Magenta -NoNewline
Write-Host ""
Write-Host "Multi-agent workflow for Claude Code" -ForegroundColor DarkGray
Write-Host ""

# Create directory structure
$dirs = @(
    ".claude/commands",
    ".claude/agents",
    ".claude/docs",
    ".claude/mcp-server",
    ".claude/orchestrator/metrics",
    "docs/orchestrator/context/tasks",
    "docs/orchestrator/memory"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

# Migration helper
function Migrate-IfExists {
    param($src, $dst)
    if ((Test-Path $src) -and (Get-ChildItem $src -ErrorAction SilentlyContinue)) {
        Write-Host "  -> Migrating $src to $dst" -ForegroundColor Yellow
        New-Item -ItemType Directory -Force -Path $dst | Out-Null
        Copy-Item -Path "$src/*" -Destination $dst -Recurse -Force
        Remove-Item -Path $src -Recurse -Force
    }
}

# Migrate legacy paths
Migrate-IfExists ".claude/context" "docs/orchestrator/context"
Migrate-IfExists ".claude/memory" "docs/orchestrator/memory"
Migrate-IfExists ".claude/metrics" ".claude/orchestrator/metrics"

# Download commands
Write-Host "Commands" -ForegroundColor White
$commands = @(
    "orchestrator-full",
    "orchestrator-lite",
    "orchestrator-graduate",
    "orchestrator-resume"
)

foreach ($cmd in $commands) {
    Write-Host "  -> $cmd.md" -ForegroundColor Cyan
    Invoke-WebRequest -Uri "$REPO_RAW/.claude/commands/$cmd.md" -OutFile ".claude/commands/$cmd.md" -UseBasicParsing
}

# Download CLAUDE.md
Write-Host ""
Write-Host "Config" -ForegroundColor White
Write-Host "  -> CLAUDE.md" -ForegroundColor Cyan
Invoke-WebRequest -Uri "$REPO_RAW/CLAUDE.md" -OutFile "CLAUDE.md" -UseBasicParsing

# Download agents
Write-Host ""
Write-Host "Agents" -ForegroundColor White
$agents = @(
    "architect",
    "auditor",
    "implementer",
    "test-runner",
    "test-writer"
)

foreach ($agent in $agents) {
    Write-Host "  -> $agent.md" -ForegroundColor Cyan
    Invoke-WebRequest -Uri "$REPO_RAW/.claude/agents/$agent.md" -OutFile ".claude/agents/$agent.md" -UseBasicParsing
}

# Download docs
Write-Host ""
Write-Host "Docs" -ForegroundColor White
Write-Host "  -> orchestrator-base.md" -ForegroundColor Cyan
Invoke-WebRequest -Uri "$REPO_RAW/.claude/docs/orchestrator-base.md" -OutFile ".claude/docs/orchestrator-base.md" -UseBasicParsing

# Download MCP server
Write-Host ""
Write-Host "MCP Server" -ForegroundColor White
Write-Host "  -> package.json" -ForegroundColor Cyan
Invoke-WebRequest -Uri "$REPO_RAW/mcp-server/package.json" -OutFile ".claude/mcp-server/package.json" -UseBasicParsing
Write-Host "  -> index.js" -ForegroundColor Cyan
Invoke-WebRequest -Uri "$REPO_RAW/mcp-server/index.js" -OutFile ".claude/mcp-server/index.js" -UseBasicParsing
Write-Host "  -> Installing dependencies..." -ForegroundColor Cyan
Push-Location ".claude/mcp-server"
npm install --silent 2>$null
Pop-Location

# Create .mcp.json
Write-Host ""
Write-Host "MCP Config" -ForegroundColor White
Write-Host "  -> .mcp.json" -ForegroundColor Cyan
@'
{
  "mcpServers": {
    "orchestrator": {
      "command": "node",
      "args": [".claude/mcp-server/index.js"]
    }
  }
}
'@ | Out-File -FilePath ".mcp.json" -Encoding utf8

Write-Host ""
Write-Host "Installed successfully" -ForegroundColor Green
Write-Host ""
Write-Host "Files added:" -ForegroundColor DarkGray
Write-Host "  CLAUDE.md, .claude/commands/*, .claude/agents/*, .claude/mcp-server/*, .mcp.json" -ForegroundColor DarkGray
Write-Host ""
Write-Host "!! Restart Claude Code" -ForegroundColor Yellow
Write-Host "Restart Claude Code and approve the 'orchestrator' MCP server when prompted."
Write-Host ""
Write-Host "Usage" -ForegroundColor White
Write-Host "  /orchestrator-full <task>      Full workflow with audits" -ForegroundColor Cyan
Write-Host "  /orchestrator-lite <task>      Rapid prototyping" -ForegroundColor Green
Write-Host "  /orchestrator-graduate <slug>  Promote POC to production" -ForegroundColor Yellow
Write-Host "  /orchestrator-resume <slug>    Resume paused workflow" -ForegroundColor Blue
Write-Host ""
