#requires -Version 5.1
<#
.SYNOPSIS
    Update oh-my-openkilo pack in place. Pulls latest from GitHub and syncs
    each file with per-file diff and backup of any local changes.

.DESCRIPTION
    Same logic as the in-session `/update-pack` slash command, but runnable
    from PowerShell without an OpenCode session. Use this when you want a
    deterministic, script-driven update (CI/CD, scheduled task, or just
    your preference for terminal-based workflows).

    Safe to re-run. If local files have been customized, they are backed up
    to `<file>.local-<timestamp>` before being overwritten.

.PARAMETER WhatIf
    Preview mode. Print what would happen, do not modify anything.

.PARAMETER SkipGitPull
    Skip the `git pull` step. Useful if you've already pulled manually and
    just want to re-sync the files.

.PARAMETER ConfigDir
    Override the target config dir. Default: $env:USERPROFILE\.config\opencode

.PARAMETER RepoDir
    Override the pack repo dir. Default: $env:USERPROFILE\.config\opencode\oh-my-openkilo

.EXAMPLE
    .\update.ps1 -WhatIf
    Show what would happen without changing anything.

.EXAMPLE
    irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/update.ps1 | iex
    One-liner update from anywhere (after a fresh `git clone` of the repo).
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
    [switch]$SkipGitPull,
    [string]$ConfigDir,
    [string]$RepoDir
)

$ErrorActionPreference = 'Stop'

# --- Resolve paths -----------------------------------------------------------
if (-not $ConfigDir) {
    $ConfigDir = Join-Path $env:USERPROFILE '.config\opencode'
}
if (-not $RepoDir) {
    $RepoDir = Join-Path $ConfigDir 'oh-my-openkilo'
}

# Source paths (this repo)
$SrcAgents   = Join-Path $RepoDir 'agents'
$SrcSkills   = Join-Path $RepoDir 'skills'
$SrcRules    = Join-Path $RepoDir 'rules'
$SrcCommands = Join-Path $RepoDir 'commands'
$SrcPlugins  = Join-Path $RepoDir 'plugins'
$SrcAgentsMd = Join-Path $RepoDir 'AGENTS.md'

# Sanity checks
if (-not (Test-Path $SrcAgents)) {
    throw "Pack repo not found at $RepoDir. Run install.ps1 first or pass -RepoDir."
}
if (-not (Test-Path $ConfigDir)) {
    throw "Target config dir not found at $ConfigDir. Run install.ps1 first or pass -ConfigDir."
}

# --- Dry-run banner ----------------------------------------------------------
if ($WhatIfPreference) {
    Write-Host "[WhatIf] Dry run. No changes will be made." -ForegroundColor Yellow
}

# --- git pull --ff-only -----------------------------------------------------
if (-not $SkipGitPull) {
    if ($PSCmdlet.ShouldProcess($RepoDir, 'git pull --ff-only origin main')) {
        $gitResult = & git -C $RepoDir pull --ff-only origin main 2>&1
        $gitExit = $LASTEXITCODE
        if ($gitExit -ne 0) {
            Write-Host "[!] git pull failed. Your local repo has diverged from upstream." -ForegroundColor Red
            Write-Host "    To recover: git -C `"$RepoDir`" stash; git -C `"$RepoDir`" pull --ff-only; git -C `"$RepoDir`" stash pop" -ForegroundColor Yellow
            Write-Host "    Or: remove $RepoDir and re-run install.ps1" -ForegroundColor Yellow
            Write-Host "    git output: $gitResult" -ForegroundColor Red
            exit 1
        }
        Write-Host "[+] Pulled latest from origin/main" -ForegroundColor Green
    }
}

# --- Per-file sync with backup ----------------------------------------------
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$added = 0
$updated = 0
$unchanged = 0
$backups = @()

# Hash a file or directory recursively. Returns a deterministic hex string
# that compares equal when two paths have byte-identical contents.
function Get-DirectoryHash {
    param([string]$Path)
    if (-not (Test-Path $Path)) { return '' }
    $item = Get-Item $Path
    if (-not $item.PSIsContainer) {
        return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
    }
    # Recursive: hash each file's path RELATIVE TO $Path + content, sort for determinism.
    # Using FullName would make the hash depend on the absolute path, breaking
    # the comparison between two locations (e.g. source repo and target config dir).
    $base = $item.FullName.TrimEnd('\', '/')
    $files = Get-ChildItem -Path $Path -Recurse -File | Sort-Object -Property FullName
    $sb = [System.Text.StringBuilder]::new()
    foreach ($f in $files) {
        $rel = $f.FullName.Substring($base.Length).TrimStart('\', '/')
        [void]$sb.Append($rel)
        [void]$sb.Append('=')
        [void]$sb.Append((Get-FileHash -Path $f.FullName -Algorithm SHA256).Hash)
        [void]$sb.Append("`n")
    }
    # Hash the concatenation so output is fixed-size
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($sb.ToString())
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try {
        $hashBytes = $sha.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hashBytes) -replace '-', '').ToLower()
    } finally {
        $sha.Dispose()
    }
}

function Sync-File {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Label
    )
    if (-not (Test-Path $Source)) {
        return
    }
    if (-not (Test-Path $Destination)) {
        if ($PSCmdlet.ShouldProcess($Destination, "Add $Label")) {
            $parent = Split-Path -Path $Destination -Parent
            if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
            Copy-Item -Path $Source -Destination $Destination -Recurse -Force
            $script:added++
        }
        return
    }
    # Ensure parent exists for the file case (AGENTS.md)
    $parent = Split-Path -Path $Destination -Parent
    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
    # Compare files: byte-identical (recursive for directories)
    $srcHash = Get-DirectoryHash -Path $Source
    $dstHash = Get-DirectoryHash -Path $Destination
    if ($srcHash -eq $dstHash) {
        $script:unchanged++
        return
    }
    # Different: back up, then overwrite. Remove dest first so Copy-Item
    # does not create a nested source-named subfolder inside dest.
    $backupPath = "$Destination.local-$stamp"
    if ($PSCmdlet.ShouldProcess($Destination, "Update $Label (backup: $backupPath)")) {
        $i = 0
        while (Test-Path $backupPath) {
            $i++
            $backupPath = "$Destination.local-$stamp-$i"
        }
        if (Test-Path $Destination) {
            # Backup: rename existing dest to backup name (handles both file and dir)
            if ((Get-Item $Destination).PSIsContainer) {
                Move-Item -Path $Destination -Destination $backupPath -Force
            } else {
                Move-Item -Path $Destination -Destination $backupPath -Force
            }
            $script:backups += $backupPath
        }
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
        $script:updated++
    }
}

Write-Host ""
Write-Host "Syncing pack files..." -ForegroundColor Cyan
Write-Host ""

if ($PSCmdlet.ShouldProcess($ConfigDir, 'Sync agents/'))  { Sync-File -Source $SrcAgents   -Destination (Join-Path $ConfigDir 'agents')  -Label 'agents/' }
if ($PSCmdlet.ShouldProcess($ConfigDir, 'Sync skills/'))  { Sync-File -Source $SrcSkills   -Destination (Join-Path $ConfigDir 'skills')  -Label 'skills/' }
if ($PSCmdlet.ShouldProcess($ConfigDir, 'Sync rules/'))   { Sync-File -Source $SrcRules    -Destination (Join-Path $ConfigDir 'rules')   -Label 'rules/' }
if ($PSCmdlet.ShouldProcess($ConfigDir, 'Sync commands/')){ Sync-File -Source $SrcCommands -Destination (Join-Path $ConfigDir 'commands') -Label 'commands/' }
if ($PSCmdlet.ShouldProcess($ConfigDir, 'Sync plugins/')) { Sync-File -Source $SrcPlugins  -Destination (Join-Path $ConfigDir 'plugins') -Label 'plugins/' }
if ($PSCmdlet.ShouldProcess($ConfigDir, 'Sync AGENTS.md')){ Sync-File -Source $SrcAgentsMd -Destination (Join-Path $ConfigDir 'AGENTS.md') -Label 'AGENTS.md' }

# --- Summary -----------------------------------------------------------------
Write-Host ""
Write-Host "Sync complete." -ForegroundColor Green
Write-Host "  added:     $added"
Write-Host "  updated:   $updated"
if ($backups.Count -gt 0) {
    Write-Host "  backups:" -ForegroundColor Yellow
    foreach ($b in $backups) { Write-Host "    - $b" -ForegroundColor Yellow }
}
Write-Host "  unchanged: $unchanged"
Write-Host ""
Write-Host "Restart OpenCode or run /reload to pick up the changes." -ForegroundColor Cyan
