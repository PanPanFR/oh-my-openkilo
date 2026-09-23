param(
  [Parameter(Mandatory = $true)][string]$State,
  [string]$Preset = "triage",
  [string]$QuestionsJson = "",
  [string]$Model = "openrouter/typesafe/jev-1.13",
  [string]$Endpoint = "",
  [string]$ApiKey = "",
  [int]$TimeoutSec = 20
)
$ErrorActionPreference = "Stop"
if (-not $PSBoundParameters.ContainsKey('Model') -and -not [string]::IsNullOrWhiteSpace($env:JEV_MODEL)) { $Model = $env:JEV_MODEL }
if (-not $PSBoundParameters.ContainsKey('Endpoint') -and [string]::IsNullOrWhiteSpace($Endpoint) -and -not [string]::IsNullOrWhiteSpace($env:JEV_ENDPOINT)) { $Endpoint = $env:JEV_ENDPOINT }
if (-not $PSBoundParameters.ContainsKey('ApiKey') -and [string]::IsNullOrWhiteSpace($ApiKey) -and -not [string]::IsNullOrWhiteSpace($env:JEV_API_KEY)) { $ApiKey = $env:JEV_API_KEY }
function Resolve-EnvPlaceholder([string]$s) {
  if ([string]::IsNullOrWhiteSpace($s)) { return $s }
  $m = [regex]::Match($s, '^\{env:(.+?)\}$')
  if ($m.Success) {
    $v = [Environment]::GetEnvironmentVariable($m.Groups[1].Value)
    if (-not [string]::IsNullOrWhiteSpace($v)) { return $v }
  }
  return $s
}
if ([string]::IsNullOrWhiteSpace($Endpoint) -or [string]::IsNullOrWhiteSpace($ApiKey)) {
  $d = Split-Path $PSCommandPath -Parent; while ($d -and -not (Test-Path (Join-Path $d "opencode.json"))) { $d = Split-Path $d -Parent }; $cfgDir = if ($d) { $d } else { "$env:USERPROFILE/.config/opencode" }
  $cfgFile = Join-Path $cfgDir "opencode.json"
  if (Test-Path $cfgFile) {
    try {
      $j = Get-Content $cfgFile -Raw | ConvertFrom-Json
      foreach ($p in $j.providers.PSObject.Properties) {
        $s = $p.Value.settings
        if ($null -eq $s) { continue }
        if ([string]::IsNullOrWhiteSpace($Endpoint) -and -not [string]::IsNullOrWhiteSpace($s.baseURL)) {
          $base = Resolve-EnvPlaceholder($s.baseURL)
          if (-not [string]::IsNullOrWhiteSpace($base) -and -not ($base -match '^\{env:.+\}$') -and -not ($base -match '<YOUR_')) {
            if ($base -match 'systemone\s*$') { $Endpoint = $base } else { $Endpoint = "$($base.TrimEnd('/'))/systemone" }
          }
        }
        if ([string]::IsNullOrWhiteSpace($ApiKey) -and -not [string]::IsNullOrWhiteSpace($s.apiKey)) {
          $k = Resolve-EnvPlaceholder($s.apiKey)
          if (-not [string]::IsNullOrWhiteSpace($k) -and -not ($k -match '^\{env:.+\}$') -and -not ($k -match '<YOUR_')) { $ApiKey = $k }
        }
        if (-not [string]::IsNullOrWhiteSpace($Endpoint) -and -not [string]::IsNullOrWhiteSpace($ApiKey)) { break }
      }
    } catch {}
  }
}
if ([string]::IsNullOrWhiteSpace($Endpoint)) { Write-Error "Jev: missing endpoint. Set JEV_ENDPOINT env var, pass -Endpoint, or configure providers.<your-provider>.settings.baseURL in opencode.json. See skills/jev-decision/SKILL.md Setup."; exit 2 }
if ([string]::IsNullOrWhiteSpace($ApiKey)) { Write-Error "Jev: missing API key. Set JEV_API_KEY env var, pass -ApiKey, or configure providers.<your-provider>.settings.apiKey in opencode.json. See skills/jev-decision/SKILL.md Setup."; exit 2 }

$presets = @{
  triage     = '{"task_type":{"type":"choice","instructions":"Pick exactly one task category.","criteria":{"simple-edit":"1-2 files, obvious change, no design needed","feature":"new behavior or endpoint","ui":"screens, components, styling, layout","refactor":"restructure without behavior change","bug":"fix broken behavior","docs":"docs/comments only"}},"needs_plan":{"type":"noul","instructions":"Does this need a plan file under plan/ before implementation?"},"risk":{"type":"score","instructions":"How risky is this change?","criteria":["security","blast-radius"]}}'
  delegation = '{"owner":{"type":"choice","instructions":"Who should own the first step?","criteria":{"builder-inline":"do directly, needs current context","designer":"UI/design-system/a11y decision","reviewer":"read-only audit or security review","tester":"test suite work","documenter":"doc-heavy multi-section work"}},"can_parallel":{"type":"noul","instructions":"Can this step run in parallel with siblings without shared state?"},"complexity":{"type":"score","instructions":"How complex is the coordination?","criteria":["coordination-cost","domain-risk"]}}'
  review     = '{"spec_match":{"type":"score","instructions":"How well does the diff match the spec?","criteria":["spec-coverage","scope-discipline"]},"security_risk":{"type":"score","instructions":"How big is the security risk?","criteria":["injection","auth","exposure"]},"merge_ready":{"type":"noul","instructions":"Is this diff ready to merge as-is?"},"needs_tester":{"type":"noul","instructions":"Does this need a tester pass before merge?"}}'
  test       = '{"needs_tests":{"type":"noul","instructions":"Does this change need automated tests?"},"test_scope":{"type":"choice","instructions":"Pick the smallest sufficient test scope.","criteria":{"unit":"unit tests only","integration":"integration tests","e2e":"browser e2e","all":"full suite"}},"bug_risk":{"type":"score","instructions":"How likely is regression?","criteria":["regression-likelihood","blast-radius"]}}'
  ui         = '{"needs_designer":{"type":"noul","instructions":"Does this need designer judgment (system, a11y, visual)?"},"ui_complexity":{"type":"score","instructions":"How complex is the UI work?","criteria":["layout","interaction","visual-system"]},"a11y_risk":{"type":"score","instructions":"How big is the a11y risk?","criteria":["keyboard","contrast","focus"]}}'
  verify     = '{"spec_fit":{"type":"score","instructions":"How well does the proposed approach fit the requirements and constraints?","criteria":["requirement-coverage","constraint-fit"]},"decision_risk":{"type":"score","instructions":"How big is the risk if this decision is wrong?","criteria":["failure-impact","reversibility"]},"proceed":{"type":"noul","instructions":"Is it safe to proceed with the proposed approach as-is?"},"needs_human":{"type":"noul","instructions":"Should a human confirm before proceeding?"}}'
}
$qJson = if (-not [string]::IsNullOrWhiteSpace($QuestionsJson)) { $QuestionsJson } else { $presets[$Preset] }
if (-not $qJson) { Write-Error "Jev: unknown preset '$Preset' (triage|delegation|review|test|ui|verify)"; exit 2 }
$questions = $qJson | ConvertFrom-Json
$body = @{ model = $Model; state = $State; questions = $questions } | ConvertTo-Json -Depth 20 -Compress
try {
  $res = Invoke-RestMethod -Uri $Endpoint -Method Post -Headers @{ Authorization = "Bearer $ApiKey"; "Content-Type" = "application/json" } -Body $body -TimeoutSec $TimeoutSec
  $res.answers | ConvertTo-Json -Depth 20 -Compress
} catch {
  $msg = $_.Exception.Message
  try { $r = $_.Exception.Response.GetResponseStream(); $sr = New-Object IO.StreamReader($r); $msg = $sr.ReadToEnd(); $sr.Close() } catch {}
  Write-Error "Jev call failed: $msg"
  exit 3
}
