#requires -Version 5.1
<#
.SYNOPSIS
    Install oh-my-openkilo pack into ~/.config/opencode.

.DESCRIPTION
    Copies the pack files (agents, skills, rules, commands, plugins, AGENTS.md)
    from this repo into the user's OpenCode config directory.

    Safe to re-run. Backs up the existing config before overwriting.

.PARAMETER WhatIf
    Preview mode. Print what would happen, do not modify anything.

.PARAMETER SkipBackup
    Skip the automatic timestamped backup. Not recommended.

.PARAMETER SkipPlugins
    Skip plugin directory copy. Use this if you manage plugins separately.

.PARAMETER ConfigDir
    Override the target config dir. Default: $env:USERPROFILE\.config\opencode

.EXAMPLE
    .\scripts\install.ps1 -WhatIf
    Show what would happen without changing anything.

.EXAMPLE
    .\scripts\install.ps1
    Standard install with backup.

.EXAMPLE
    .\scripts\install.ps1 -SkipBackup
    Install without backup (destructive, you were warned).
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [switch]$SkipBackup,
    [switch]$SkipPlugins,
    [string]$ConfigDir
)

$ErrorActionPreference = 'Stop'

# --- Resolve paths -----------------------------------------------------------
if (-not $ConfigDir) {
    $ConfigDir = Join-Path $env:USERPROFILE '.config\opencode'
}
# Script lives in scripts/; the actual pack contents are one level up.
$RepoRoot = Split-Path -Path $PSScriptRoot -Parent
$PackName = 'oh-my-openkilo'

# Source paths (this repo)
$SrcAgents   = Join-Path $RepoRoot 'agents'
$SrcSkills   = Join-Path $RepoRoot 'skills'
$SrcRules    = Join-Path $RepoRoot 'rules'
$SrcCommands = Join-Path $RepoRoot 'commands'
$SrcPlugins  = Join-Path $RepoRoot 'plugins'
$SrcAgentsMd = Join-Path $RepoRoot 'AGENTS.md'
$SrcExample  = Join-Path $RepoRoot 'examples\opencode.example.json'

# Sanity checks
if (-not (Test-Path $SrcAgents)) {
    throw "Source 'agents' not found at $SrcAgents. Are you running install.ps1 from the scripts/ folder of the repo?"
}

# --- Dry-run banner ----------------------------------------------------------
if ($WhatIfPreference) {
    Write-Host "[WhatIf] Dry run. No changes will be made." -ForegroundColor Yellow
}

# --- Ensure target config dir exists ----------------------------------------
if (-not (Test-Path $ConfigDir)) {
    if ($PSCmdlet.ShouldProcess($ConfigDir, 'Create config directory')) {
        New-Item -ItemType Directory -Path $ConfigDir -Force | Out-Null
        Write-Host "[+] Created $ConfigDir"
    }
} else {
    Write-Host "[=] Target exists: $ConfigDir"
}

# --- Backup ------------------------------------------------------------------
if (-not $SkipBackup) {
    $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backup = "$ConfigDir.backup-$stamp"
    if ($PSCmdlet.ShouldProcess($backup, 'Backup existing config')) {
        # Only back up if something exists to back up
        $hasContent = Get-ChildItem -Force $ConfigDir -ErrorAction SilentlyContinue | Where-Object { $_.Name -notmatch '^\.git$' } | Select-Object -First 1
        if ($hasContent) {
            Copy-Item -Path $ConfigDir -Destination $backup -Recurse -Force
            Write-Host "[+] Backup: $backup" -ForegroundColor Green
        } else {
            Write-Host "[=] Skipping backup (config dir is empty)"
        }
    }
}

# --- Copy function -----------------------------------------------------------
function Copy-PackItem {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Label
    )
    if (-not (Test-Path $Source)) {
        Write-Host "[!] Skip $Label (source not found: $Source)" -ForegroundColor Yellow
        return
    }
    if ($PSCmdlet.ShouldProcess($Destination, "Copy $Label")) {
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
        Write-Host "[+] Copied $Label"
    }
}

# --- Copy pack files ---------------------------------------------------------
Write-Host ""
Write-Host "Installing oh-my-openkilo pack..." -ForegroundColor Cyan
Write-Host ""

Copy-PackItem -Source $SrcAgents   -Destination $ConfigDir -Label 'agents/'
Copy-PackItem -Source $SrcSkills   -Destination $ConfigDir -Label 'skills/'
Copy-PackItem -Source $SrcRules    -Destination $ConfigDir -Label 'rules/'
Copy-PackItem -Source $SrcCommands -Destination $ConfigDir -Label 'commands/'
Copy-PackItem -Source $SrcAgentsMd -Destination $ConfigDir -Label 'AGENTS.md'

if (-not $SkipPlugins) {
    Copy-PackItem -Source $SrcPlugins -Destination $ConfigDir -Label 'plugins/'
}

# --- Handle opencode.json (merge, never overwrite) ---------------------------
$TargetConfig = Join-Path $ConfigDir 'opencode.json'
$TargetExample = Join-Path $ConfigDir 'opencode.example.json'

if (-not (Test-Path $TargetConfig) -and (Test-Path $SrcExample)) {
    if ($PSCmdlet.ShouldProcess($TargetConfig, 'Seed opencode.json from example (no real config found)')) {
        Copy-Item -Path $SrcExample -Destination $TargetConfig -Force
        Write-Host "[+] Seeded opencode.json from examples/opencode.example.json" -ForegroundColor Green
        Write-Host "    IMPORTANT: edit opencode.json to fill in your API keys and model choices." -ForegroundColor Yellow
    }
} else {
    Write-Host "[=] opencode.json already exists at $TargetConfig -- left untouched"
    Write-Host "    To pick up the example block, manually merge from examples/opencode.example.json"
}

# --- Validate enabled MCPs have their env vars -------------------------------
if ((Test-Path $TargetConfig) -and -not $WhatIfPreference) {
    try {
        $configJson = Get-Content -Path $TargetConfig -Raw | ConvertFrom-Json
    } catch {
        Write-Host "[!] Could not parse $TargetConfig as JSON -- skipping env validation" -ForegroundColor Yellow
        $configJson = $null
    }
    if ($configJson -and $configJson.mcp) {
        $missing = @()
        foreach ($mcpName in ($configJson.mcp.PSObject.Properties | Where-Object { $_.Value.enabled -eq $true }).Name) {
            $mcp = $configJson.mcp.$mcpName
            # remote: check headers
            if ($mcp.headers) {
                foreach ($h in $mcp.headers.PSObject.Properties) {
                    $val = [string]$h.Value
                    if ($val -match '\{env:([A-Z_][A-Z0-9_]*)\}') {
                        $varName = $matches[1]
                        if (-not (Test-Path "env:$varName")) {
                            $missing += "$mcpName.headers.$($h.Name) -> env var `$env:$varName not set"
                        }
                    }
                }
            }
            # local: check command for env-block
            if ($mcp.env) {
                foreach ($e in $mcp.env.PSObject.Properties) {
                    $val = [string]$e.Value
                    if ($val -match '\{env:([A-Z_][A-Z0-9_]*)\}') {
                        $varName = $matches[1]
                        if (-not (Test-Path "env:$varName")) {
                            $missing += "$mcpName.env.$($e.Name) -> env var `$env:$varName not set"
                        }
                    }
                }
            }
        }
        if ($missing.Count -gt 0) {
            Write-Host ""
            Write-Host "[!] WARNING: enabled MCPs reference missing env vars:" -ForegroundColor Yellow
            foreach ($m in $missing) { Write-Host "    - $m" -ForegroundColor Yellow }
            Write-Host "    Set these in your shell or .env before running OpenCode, or disable the MCP." -ForegroundColor Yellow
        }
    }
}

# --- Summary -----------------------------------------------------------------
Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host ""
Write-Host "REQUIRED before first session (the pack degrades without these):"
Write-Host "  uv tool install graphifyy                     # knowledge graph (PyPI, double y)"
Write-Host "    or: npm i -g graphify                       # if you prefer the Node CLI"
Write-Host "  npm i -g @agentmemory/server                  # REST server this MCP talks to"
Write-Host "  npm i -g @agentmemory/mcp                     # the MCP server OpenCode launches"
Write-Host "  agentmemory serve                             # start the REST server (leave it running)"
Write-Host ""
Write-Host "RECOMMENDED: pin the agentmemory MCP to a local install path (not npx)."
Write-Host "  Windows: node `"`$env:APPDATA\npm\node_modules\@agentmemory\mcp\bin.mjs`""
Write-Host "  macOS:   node /usr/local/lib/node_modules/@agentmemory/mcp/bin.mjs"
Write-Host "  Linux:   node /usr/lib/node_modules/@agentmemory/mcp/bin.mjs"
Write-Host "  Edit mcp.agentmemory.command in opencode.json with the path above."
Write-Host "  /configcheck will flag the npx form and tell you to switch."
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Edit $TargetConfig to set your model, provider keys, and MCP credentials."
Write-Host "  2. Run /configcheck to verify graphify + agentmemory are wired up."
Write-Host "  3. Restart OpenCode or run /reload."
Write-Host ""
Write-Host "To preview what install would do:  .\install.ps1 -WhatIf"
Write-Host "To uninstall: restore the backup folder, or delete agents/skills/rules/commands/plugins/AGENTS.md under $ConfigDir"
