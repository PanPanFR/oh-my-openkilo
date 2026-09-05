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
├── skills/                            # 46 skill packs (mirror of ~/.config/opencode/skills/)
│   └── <skill-name>/
│       ├── SKILL.md                   # always present
│       ├── README.md                  # optional, user-facing
│       ├── references/                # optional, progressive-disclosure
│       └── scripts/, examples/, ...   # optional, skill-specific
│
├── rules/                             # 3 always-on rules (mirror of ~/.config/opencode/rules/)
│   ├── communication-style.md         # caveman + ponytail style
│   ├── language.md                    # English-only files
│   └── skill-reminder.md              # mandatory skill check before work
│
├── commands/                          # 10 slash commands
│   ├── caveman-commit.md              # compressed commit message generator
│   ├── caveman-compress.md            # compress memory files
│   ├── caveman-help.md                # caveman help card
│   ├── caveman-review.md              # compressed code review
│   ├── caveman-stats.md               # show token savings
│   ├── caveman.md                     # toggle terse mode
│   ├── configcheck.md                 # post-install health check
│   ├── recall.md                      # search agentmemory
│   ├── remember.md                    # save to agentmemory
│   └── update-pack.md                 # pull + sync from GitHub
│
├── plugins/                           # 5 small TS plugin files (no dist/, no node_modules)
│   ├── agentmemory-capture.ts         # hook for capturing session observations
│   ├── caveman/                       # terse-mode + style pack
│   │   ├── plugin.js
│   │   ├── caveman-config.cjs
│   │   ├── caveman-parse.cjs
│   │   └── package.json
│   ├── checkpoint.ts                  # shadow-checkpoint safety net
│   ├── graphify.ts                    # codebase knowledge graph hook
│   ├── prompt-polish.ts               # opt-in "pp " prompt rewrite via OpenAI-compatible API
│   └── recall-first.ts                # one-shot recall gate for edits
│
├── examples/
│   └── opencode.example.json          # portable config template, credentials redacted
│
└── docs/
    ├── INSTALL.md                     # this install guide
    ├── STRUCTURE.md                   # this file
    ├── AGENTS.md                      # 6 agents in detail
    ├── SKILLS.md                      # 46 skills table
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

## What does not get mirrored (lives only in the repo)

- `LICENSE`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`: repo governance
- `docs/`: repo-only documentation, not loaded by OpenCode
- `examples/opencode.example.json`: hand-maintained, never derived from the runtime config (to guarantee no leaks)
- `.gitignore`: repo-only

## Install and update

There is no installer or updater script in the pack. Install is a one-time `git clone` + `cp -r` (full recipe in [INSTALL.md](INSTALL.md)). Update is the in-session `/update-pack` command, which is self-contained: it hardcodes the canonical URL, runs `git` directly, and syncs each file with per-file backup. Nothing on the user's disk can go stale.

## What gets mirrored but not edited directly

Once an agent/skill/rule/command is published in the repo, the corresponding file in `~/.config/opencode/` should be treated as "synced from upstream". To change it:

1. Edit the repo file.
2. `git commit` and `git push`.
3. Run `/update-pack` in OpenCode to pull the new version locally.

This applies to **all 6 agents, 46 skills, 3 rules, 10 commands**. If you want a personal fork, copy the file under a new name (e.g. `agents/builder.local.md`); `/update-pack` will not touch local files.
