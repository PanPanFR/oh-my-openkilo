param(
  [Parameter(Mandatory = $true)][string]$State,
  [string]$Preset = "triage",
  [string]$QuestionsJson = "",
  [string]$Model = "openrouter/typesafe/jev-1.13",
  [string]$Endpoint = "",
  [int]$TimeoutSec = 20
)
$ErrorActionPreference = "Stop"
$d = Split-Path $PSCommandPath -Parent; while ($d -and -not (Test-Path (Join-Path $d "opencode.json"))) { $d = Split-Path $d -Parent }; $cfgDir = if ($d) { $d } else { "$env:USERPROFILE/.config/opencode" }
$key = $env:NINEROUTER_API_KEY
$cfgFile = Join-Path $cfgDir "opencode.json"
if (Test-Path $cfgFile) {
  try {
    $j = Get-Content $cfgFile -Raw | ConvertFrom-Json
    if ([string]::IsNullOrWhiteSpace($key)) { $key = $j.providers.'9router'.settings.apiKey }
    if ([string]::IsNullOrWhiteSpace($Endpoint)) {
      $base = $j.providers.'9router'.settings.baseURL
      if ($base) { $Endpoint = "$($base.TrimEnd('/'))/systemone" }
    }
  } catch {}
}
if ([string]::IsNullOrWhiteSpace($Endpoint)) {
  $Endpoint = $env:JEV_ENDPOINT
}
if ([string]::IsNullOrWhiteSpace($Endpoint)) { Write-Error "Jev: missing endpoint (set JEV_ENDPOINT or configure providers.9router.settings.baseURL in opencode.json)"; exit 2 }
if ([string]::IsNullOrWhiteSpace($key)) { Write-Error "Jev: missing API key (set NINEROUTER_API_KEY or providers.9router.settings.apiKey)"; exit 2 }

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
  $res = Invoke-RestMethod -Uri $Endpoint -Method Post -Headers @{ Authorization = "Bearer $key"; "Content-Type" = "application/json" } -Body $body -TimeoutSec $TimeoutSec
  $res.answers | ConvertTo-Json -Depth 20 -Compress
} catch {
  $msg = $_.Exception.Message
  try { $r = $_.Exception.Response.GetResponseStream(); $sr = New-Object IO.StreamReader($r); $msg = $sr.ReadToEnd(); $sr.Close() } catch {}
  Write-Error "Jev call failed: $msg"
  exit 3
}
