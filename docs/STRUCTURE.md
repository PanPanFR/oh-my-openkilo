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
├── agents/                            # 6 agent prompts (mirror of ~/.config/opencode/agents/)
│   ├── builder.md
│   ├── planner.md
│   ├── designer.md
│   ├── tester.md
│   ├── reviewer.md
│   └── documenter.md
│
├── skills/                            # 54 skill packs (mirror of ~/.config/opencode/skills/)
│   └── <skill-name>/
│       ├── SKILL.md                   # always present
│       ├── README.md                  # optional, user-facing
│       ├── references/                # optional, progressive-disclosure
│       └── scripts/, examples/, ...   # optional, skill-specific
│
├── rules/                             # 5 rules (4 always-on + 1 on-demand) (mirror of ~/.config/opencode/rules/)
│   ├── communication-style.md         # caveman + ponytail style
│   ├── jev-routing.md                 # Jev agent/skill/subagent routing rule
│   ├── language.md                    # English-only files
│   ├── skill-reminder.md              # mandatory skill check before work
│   └── ui-tooling.md                  # CLI-vs-MCP router (on demand)
│
├── commands/                          # 3 slash commands (minimal live set)
│   ├── integrate.md                   # integration session for parallel plan branches
│   ├── recall.md                      # search agentmemory
│   └── remember.md                    # save to agentmemory
│
├── plugins/                           # 7 plugins (6 files plus caveman/ directory, no dist/, no node_modules)
│   ├── agentmemory-capture.ts         # hook for capturing session observations
│   ├── caveman/                       # terse-mode + style pack
│   │   ├── plugin.js
│   │   ├── caveman-config.cjs
│   │   ├── caveman-parse.cjs
│   │   └── package.json
│   ├── caveman.ts                     # caveman mode loader shim
│   ├── graphify.ts                    # codebase knowledge graph hook
│   ├── recall-first.ts                # one-shot recall gate for edits
│   ├── rtk.ts                         # token-saving bash rewrite (needs rtk binary)
│   └── subagent-guard.ts              # circuit breaker for failing subagent retries
│
├── examples/
│   └── opencode.example.json          # portable config template, credentials redacted
│
└── docs/
    ├── INSTALL.md                     # this install guide
    ├── STRUCTURE.md                   # this file
    ├── AGENTS.md                      # 6 agents in detail
    ├── SKILLS.md                      # 54 skills table
    ├── RULES.md                       # 3 rules in detail
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

Edits flow one way: edit in `~/.config/opencode/`, kick the tires in a real session, then copy the changed file(s) into `oh-my-openkilo/` and commit. The repo never leads.

**Agent frontmatter mirrors the live config shape.** All 6 agent files ship `opencode/muse-spark-1.3-contributor-free`; `builder`, `reviewer`, and `tester` carry the `#xhigh` reasoning variant for build quality, while `designer`, `documenter`, and `planner` stay on the default effort. (No `temperature` key: OpenCode V2 ignores it.) There is no deliberate model divergence; syncing overwrites local agent files with the repo versions, so personal model choices belong in `opencode.json` or in a `.local.md` copy.

## What does not get mirrored (lives only in the repo)

- `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`: repo governance
- `docs/`: repo-only documentation, not loaded by OpenCode
- `examples/opencode.example.json`: hand-maintained, never derived from the runtime config (to guarantee no leaks)
- `.gitignore`: repo-only

## Install and update

There is no installer or updater script in the pack. Install is a one-time `git clone` + `cp -r` (full recipe in [INSTALL.md](INSTALL.md)). Update is a manual `git pull` plus a mirror into the live config with per-file backup. Nothing on the user's disk can go stale.

## What gets mirrored but not edited directly

Once an agent/skill/rule/command is published in the repo, the corresponding file in `~/.config/opencode/` should be treated as "synced from upstream". To change it:

1. Edit the repo file.
2. `git commit` and `git push`.
3. Pull and mirror the new version into the live config.

This applies to **all 6 agents, 54 skills, 5 rules, 3 commands**. If you want a personal fork, copy the file under a new name (e.g. `agents/builder.local.md`); a manual sync will not touch local files.
