# Repository structure

```
oh-my-openkilo/
├── README.md                          # entry point, quickstart
├── CHANGELOG.md                       # version history
├── CONTRIBUTING.md                    # how to add agents/skills/rules
├── SECURITY.md                        # zero-credential guarantee
├── LICENSE                            # MIT
├── AGENTS.md                          # always-on policy plus on-demand rules map
├── .gitignore                         # excludes opencode.json, node_modules, state files
│
├── agents/                            # 6 agent prompts
│   ├── builder.md
│   ├── planner.md
│   ├── designer.md
│   ├── tester.md
│   ├── reviewer.md
│   └── documenter.md
│
├── skills/                            # 22 global baseline skill packs plus _shared/
│   └── <skill-name>/
│       ├── SKILL.md                   # always present
│       ├── README.md                  # optional
│       ├── references/                # optional progressive disclosure
│       └── scripts/, examples/, ...   # optional skill resources
│
├── rules/                             # 2 on-demand rules
│   ├── jev-routing.md                 # optional decision gate and loop-breaker
│   └── ui-tooling.md                  # CLI vs MCP router
│
├── commands/                          # 13 slash commands
│   ├── install-skill.md               # inject domain skills from archive vault
│   ├── install-mcp.md                 # inject on-demand MCP servers from archive catalog
│   ├── integrate.md                   # integrate parallel plan branches
│   └── caveman*.md                    # caveman family (mode, commit, compress, review, stats, help) + megacave, ultracave
│
├── plugins/                           # 3 files plus the caveman directory
│   ├── agentmemory-capture.ts         # capture session observations
│   ├── caveman/                       # terse-mode style pack
│   │   ├── plugin.js
│   │   ├── server.js                  # OpenCode v2 entry point
│   │   ├── caveman-config.cjs
│   │   ├── caveman-parse.cjs
│   │   └── package.json
│   ├── rtk.ts                         # git-only output rewrite
│   └── subagent-guard.ts              # failing subagent circuit breaker
│
├── archive/                           # domain skills vault (93 skills) + MCP catalog + inject engine
│   ├── skills/                        # android, cloudflare, web, rust, security
│   ├── manifest.json                  # category metadata, triggers, MCP recommendations
│   ├── mcp-catalog.json               # on-demand MCP server definitions
│   └── scripts/inject.mjs             # stack detection + injection (+ Jev --jev ranking)
│
├── examples/
│   └── opencode.example.json          # portable config template, credentials redacted
│
└── docs/
    ├── INSTALL.md                     # install guide
    ├── STRUCTURE.md                   # this file
    ├── AGENTS.md                      # 6 agents in detail
    ├── SKILLS.md                      # 22 skills table
    ├── RULES.md                       # 2 rules in detail
    ├── COMMANDS.md                    # command reference
    ├── CONFIGURATION.md               # opencode.json breakdown
    └── WORKFLOWS.md                   # worked examples
```

## Mirror principle

The repo is the **upstream source of truth** for the pack, but runtime behavior comes from the files copied to `~/.config/opencode/`. The maintainer's local install:

```
~/.config/opencode/                   <-- live runtime config (the one OpenCode reads)
├── agents/                           <- mirror <- oh-my-openkilo/agents/
├── skills/                           <- mirror <- oh-my-openkilo/skills/
├── rules/                            <- mirror <- oh-my-openkilo/rules/
├── commands/                         <- mirror <- oh-my-openkilo/commands/
├── plugins/                          <- mirror <- oh-my-openkilo/plugins/
├── AGENTS.md                         <- mirror <- oh-my-openkilo/AGENTS.md
├── archive/                          <- mirror <- oh-my-openkilo/archive/
├── opencode.json                     NEVER mirrored -- contains secrets
└── oh-my-openkilo/                   the repo
```

Edits flow one way: edit in `~/.config/opencode/`, test in a real session, then copy the changed file(s) into `oh-my-openkilo/` and commit.

**Agent frontmatter mirrors the live config shape.** The shipped defaults are:

| Agent | Model |
|-------|-------|
| `builder` | `opencode/deepseek-v4.1-flash-free#max` |
| `planner` | `9router/ag/claude-opus-4-6-thinking` |
| `designer` | `9router/ag/gemini-3.8-flash-high` |
| `tester` | `opencode/mimo-v2.6-flash-free` |
| `reviewer` | `opencode/glm-5.3-flash-free#max` |
| `documenter` | `9router/ag/gemini-3.8-flash-high` |

Free OpenCode models cover three agents. The other three need `NINE_ROUTER_BASE_URL` and `NINE_ROUTER_API_KEY`, or a per-agent `model:` override. No credential is stored in the repo. (`temperature` is not shipped: OpenCode V2 ignores it.)

## What does not get mirrored (lives only in the repo)

- `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`: repo governance
- `docs/`: repo-only documentation, not loaded by OpenCode
- `examples/opencode.example.json`: hand-maintained, never derived from the runtime config
- `.gitignore`: repo-only

## Install and update

There is no installer or updater script in the pack. Install is a one-time `git clone` plus a copy (full recipe in [INSTALL.md](INSTALL.md)). Update is a manual `git pull` plus a mirror into the live config with per-file backup.

## What gets mirrored but not edited directly

Once an agent, skill, rule, or command is published, the corresponding live file should be treated as synced from upstream. To change it:

1. Edit the live file.
2. Verify it in a real session.
3. Mirror it into the repo.
4. Commit, tag, and release.

This applies to **all 6 agents, 22 skills, 2 rules, and 13 commands** (plus the 93-skill archive vault). For a personal fork, copy the file under a new name (for example `agents/builder.local.md`); a manual sync will not touch local files.
