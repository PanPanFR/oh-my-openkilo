# agentmemory troubleshooting

Shared fallback for `agentmemory-ops` and `agentmemory-history`.

## Tool not exposed

`opencode.json` runs the MCP server with `AGENTMEMORY_TOOLS=core`. Core exposes
8 tools:

`memory_consolidate`, `memory_diagnose`, `memory_lesson_save`, `memory_recall`,
`memory_reflect`, `memory_save`, `memory_sessions`, `memory_smart_search`.

Everything else is hidden, including `memory_commits` and
`memory_commit_lookup`. Do not switch to `AGENTMEMORY_TOOLS=all` just for one
lookup: it adds 46 tools to every session. Use REST instead.

## REST fallback

Base URL: `http://127.0.0.1:3111`. Localhost needs no auth unless
`AGENTMEMORY_SECRET` is set. In that case add:
`Authorization: Bearer $AGENTMEMORY_SECRET`.

Liveness:

```bash
curl -fsS http://127.0.0.1:3111/agentmemory/livez
```

Connection refused means the server is down. Start it with `agentmemory serve`.

List linked commits:

```bash
curl -fsS "http://127.0.0.1:3111/agentmemory/commits?limit=500"
```

Filter server-side with `branch` and `repo`. URL-encode every value:

```bash
curl -fsS --get "http://127.0.0.1:3111/agentmemory/commits" \
  --data-urlencode "branch=feat/a&b" \
  --data-urlencode "limit=100"
```

Look up one SHA when `memory_commit_lookup` is hidden:

1. Fetch the list with `limit=500`.
2. Match `sha` or `short` locally in the JSON.
3. Read `sessionIds`, `observationCount`, and `message` from that record.
4. Use `memory_recall` for the linked session when more context is needed.
5. If no record matches, the commit predates session linking. Report that; do
   not invent intent.

PowerShell equivalent:

```powershell
$uri = "http://127.0.0.1:3111/agentmemory/commits?limit=500"
$commits = (Invoke-RestMethod $uri).commits
$commits | Where-Object { $_.short -eq "9a1b2c3" }
```

## Memory write failures

If a core tool returns a transport error, check `/agentmemory/livez` first.
Capture and storage errors are server-side. Do not retry more than once.
Report the failing tool and endpoint, then continue the user's task.
