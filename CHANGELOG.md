# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial scaffold: `.gitignore`, `LICENSE`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`
- 11 agent prompts (`agents/`)
- 44 skills (`skills/`)
- 6 global rules (`rules/`)
- 1 command (`/update-pack`)
- Plugin sources (`plugins/agentmemory-capture.ts`, `plugins/caveman/`)
- `examples/opencode.example.json` (portable, credentials redacted)
- `install.ps1` (Windows installer with `-WhatIf` and backup)
- `install.sh` (Unix installer)
- `docs/`: INSTALL, STRUCTURE, AGENTS, SKILLS, RULES, COMMANDS, CONFIGURATION

### Security
- Zero credentials committed. See [SECURITY.md](SECURITY.md).
