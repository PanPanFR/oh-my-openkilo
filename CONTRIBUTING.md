# Contributing

Thanks for your interest in improving oh-my-openkilo. This pack is personal-curation-first, so contribution norms are stricter than a typical OSS project.

## Inspiration

oh-my-openkilo is a port of [oh-my-kilo](https://github.com/PanPanFR/oh-my-kilo) (the same maintainer's pack for Kilo Code) onto the OpenCode runtime. The "prompt + plugin source" sharing approach (plain markdown files + a few small TS plugin files, no `dist/`, no `node_modules`, no build step in the pack) is borrowed from [oh-my-opencode-slim](https://github.com/alvinunreal/oh-my-opencode-slim). The agentic workflow patterns (triage, delegation, skills as protocols, graphify-first) come from Kilo Code.

When proposing changes, prefer the **minimal** diff that keeps these lineages coherent: don't add a build step, don't reinvent the agent hierarchy, keep new plugins under a few KB each.

## Scope

oh-my-openkilo ships the **same files** that live under `~/.config/opencode/` on a single maintainer's machine (with credentials redacted). It is not a generic OpenCode enhancement pack; every agent, skill, and rule has been used in real sessions and earned its place.

Before opening a PR, ask: **does this add a new agent/skill/rule, or change an existing one?**

### Adding a new agent / skill / rule

1. Open an issue first with: use case, why none of the existing 8 agents / 46 skills / 3 rules cover it, and one or two example prompts.
2. After issue approval, open a PR following the structure of the closest existing file.
3. Skill files must be progressive-disclosure where applicable: `SKILL.md` short, references in `references/`.

### Changing an existing file

1. Open an issue describing the change and the problem it solves.
2. PRs without an issue will be asked for one before review.

## Style

- File contents: **English only**. Indonesian is chat-only.
- Code: lazy where possible (see `rules/communication-style.md` for the caveman/ponytail philosophy baked into the agents themselves).
- Commit messages: conventional commits, subject ≤ 50 chars.

## What we won't accept

- Generic "AI agent" prompts that re-invent `builder.md` or `planner.md` with a different name
- Skills that duplicate `superpowers` or `vercel-labs/skills` without a reason specific to this pack
- Anything that requires shipping a credential, API key, or machine-specific path
- New dependencies (no `package.json` in this repo; pack is pure file copy)

## Pull request process

1. `git clone` the repo into a temp folder, edit files there.
2. Copy your edits into `~/.config/opencode/` to test in a real session.
3. Once verified, copy back into the repo folder and commit.
4. PR description must include: what changed, why, and a before/after transcript of one agent invocation that proves the change.
