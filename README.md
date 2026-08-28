# oh-my-openkilo

A curated **OpenCode** configuration pack with specialized agents, skills, rules, and plugins — built to make OpenCode smarter and more autonomous out of the box.

> Status: **scaffolding in progress** — see [CHANGELOG.md](CHANGELOG.md) for what's shipped in this commit and what's still TODO.

## What is this?

A **configuration pack** for [OpenCode](https://opencode.ai) — plain files you copy (or `install.ps1`) into `~/.config/opencode`. No plugin runtime, no build step. Edit an agent by editing its file; add your own agents, skills, or rules without touching anything else.

- **11 specialized agents** — primary (builder, planner) + subagents (tester, reviewer, documenter, researcher, explorer, designer, cavecrew-*)
- **44 skills** — battle-tested playbooks (TDD, systematic debugging, code review, writing-plans, web-perf) curated from popular community packs
- **6 global rules** — always-on guardrails: English-only files, mandatory memory search, mandatory skill check, knowledge-graph-first navigation, parallel delegation, caveman/ponytail style
- **Plugins** — `agentmemory-capture`, `caveman`, `ponytail`, `superpowers`
- **1 command** — `/update-pack` to pull latest changes and sync the pack into your config

The idea is simple: **prompts in files, models in config, behavior in rules.**

## Quick start

```powershell
# Windows
irm https://raw.githubusercontent.com/PanPanFR/oh-my-openkilo/main/install.ps1 | iex
```

Or clone-and-run for full control:

```powershell
git clone https://github.com/PanPanFR/oh-my-openkilo.git "$env:USERPROFILE\.config\opencode\oh-my-openkilo"
& "$env:USERPROFILE\.config\opencode\oh-my-openkilo\install.ps1" -WhatIf   # preview
& "$env:USERPROFILE\.config\opencode\oh-my-openkilo\install.ps1"           # apply
```

## License

MIT — see [LICENSE](LICENSE).
