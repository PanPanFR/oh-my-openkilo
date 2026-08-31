# Repository structure

```
oh-my-openkilo/
├── README.md                          # entry point, quickstart
├── CHANGELOG.md                       # version history
├── CONTRIBUTING.md                    # how to add agents/skills/rules
├── SECURITY.md                        # zero-credential guarantee
├── LICENSE                            # MIT
├── AGENTS.md                          # the AGENTS.md that ships with the pack
├── .gitignore                         # excludes opencode.json, node_modules, state files
│
├── scripts/                           # installer + updater entry points
│   ├── install.ps1                    # Windows installer
│   ├── install.sh                     # Unix installer
│   ├── update.ps1                     # Windows updater (terminal-side /update-pack)
│   └── update.sh                      # Unix updater (terminal-side /update-pack)
│
├── agents/                            # 11 agent prompts (mirror of ~/.config/opencode/agents/)
│   ├── builder.md
│   ├── planner.md
│   ├── designer.md
│   ├── explorer.md
│   ├── researcher.md
│   ├── tester.md
│   ├── reviewer.md
│   ├── documenter.md
│   ├── cavecrew-builder.md
│   ├── cavecrew-investigator.md
│   └── cavecrew-reviewer.md
│
├── skills/                            # 46 skill packs (mirror of ~/.config/opencode/skills/)
│   └── <skill-name>/
│       ├── SKILL.md                   # always present
│       ├── README.md                  # optional, user-facing
│       ├── references/                # optional, progressive-disclosure
│       └── scripts/, examples/, ...   # optional, skill-specific
│
├── rules/                             # 7 always-on rules (mirror of ~/.config/opencode/rules/)
│   ├── agentmemory.md                 # mandatory memory search before work
│   ├── communication-style.md         # caveman + ponytail style
│   ├── delegation.md                  # parallel subagent delegation
│   ├── graphify.md                    # knowledge-graph-first navigation
│   ├── language.md                    # English-only files
│   ├── skill-reminder.md              # mandatory skill check before work
│   └── workers.md                     # Cloudflare Workers doc-first (conditional)
│
├── commands/                          # 10 slash commands
│   ├── update-pack.md                 # pull + sync from GitHub
│   ├── caveman.md                     # toggle terse mode
│   ├── caveman-commit.md              # compressed commit message generator
│   ├── caveman-compress.md            # compress memory files
│   ├── caveman-help.md                # caveman help card
│   ├── caveman-review.md              # compressed code review
│   ├── caveman-stats.md               # show token savings
│   ├── recall.md                      # search agentmemory
│   └── remember.md                    # save to agentmemory
│
├── plugins/                           # plugin sources (node_modules NOT included)
│   ├── agentmemory-capture.ts         # hook for capturing session observations
│   └── caveman/
│       ├── plugin.js
│       ├── caveman-config.cjs
│       ├── caveman-parse.cjs
│       └── package.json
│
├── examples/
│   └── opencode.example.json          # portable config template, credentials redacted
│
└── docs/
    ├── INSTALL.md                     # this install guide
    ├── STRUCTURE.md                   # this file
    ├── AGENTS.md                      # 8 agents in detail (plus 3 internal `cavecrew-*` token-economy variants)
    ├── SKILLS.md                      # 46 skills table
    ├── RULES.md                       # 7 rules in detail
    ├── COMMANDS.md                    # command reference
    └── CONFIGURATION.md               # opencode.json breakdown
```

## Mirror principle

The repo is the **upstream source of truth** for the pack, but the actual runtime behavior comes from the files copied to `~/.config/opencode/`. The maintainer's own local install:

```
~/.config/opencode/                   <-- live runtime config (the one OpenCode reads)
├── agents/                           ← mirror ← oh-my-openkilo/agents/
├── skills/                           ← mirror ← oh-my-openkilo/skills/
├── rules/                            ← mirror ← oh-my-openkilo/rules/
├── commands/                         ← mirror ← oh-my-openkilo/commands/
├── plugins/                          ← mirror ← oh-my-openkilo/plugins/
├── AGENTS.md                         ← mirror ← oh-my-openkilo/AGENTS.md
├── opencode.json                     NEVER mirrored -- contains secrets
└── oh-my-openkilo/                   the repo
```

Edits flow: edit in `~/.config/opencode/`, test in a real session, then copy to `oh-my-openkilo/` and commit. Never edit the repo first.

## What does not get mirrored (lives only in the repo)

- `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`: repo governance
- `docs/`: repo-only documentation, not loaded by OpenCode
- `examples/opencode.example.json`: hand-maintained, never derived from the runtime config (to guarantee no leaks)
- `scripts/install.ps1`, `scripts/install.sh`: installer scripts (resolves repo root from the script's parent dir)
- `scripts/update.ps1`, `scripts/update.sh`: terminal-side equivalent of `/update-pack` (git pull + per-file sync with backup)
- `.gitignore`: repo-only

## What gets mirrored but not edited directly

Once an agent/skill/rule/command is published in the repo, the corresponding file in `~/.config/opencode/` should be treated as "synced from upstream". To change it:

1. Edit the repo file.
2. `git commit` and `git push`.
3. Run `/update-pack` in OpenCode to pull the new version locally.

This applies to **all 8 agents (plus 3 internal `cavecrew-*`), 48 skills, 3 rules, 10 commands**. If you want a personal fork, copy the file under a new name (e.g. `agents/builder.local.md`); the install script and `/update-pack` will not touch local files.
