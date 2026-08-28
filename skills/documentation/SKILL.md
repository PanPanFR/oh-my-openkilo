---
name: documentation
description: Use when writing README, CHANGELOG, runbooks, onboarding guides, API docs, architecture docs, or any technical documentation
---

# Technical Documentation

## Principles

1. **Clarity** - simple, unambiguous language
2. **Accuracy** - code snippets and technical details correct and current
3. **User-centricity** - every doc helps a specific user achieve a specific task
4. **Consistency** - same tone, terminology, style across docs
5. Write for the reader; start with the most useful info (don't bury the lede)
6. Show, don't tell - examples, commands, screenshots
7. Keep it current - outdated docs are worse than none
8. Link, don't duplicate

## Document Types

| Type | Contains |
|------|----------|
| **README** | What/why, quick start (<5 min to first success), config/usage, GFM + admonitions. NO license/contributing/changelog sections (dedicated files) |
| **API docs** | Endpoint reference with request/response examples, auth, error codes, rate limits, pagination, SDK examples |
| **Runbook** | When to use, prerequisites/access, step-by-step procedure, rollback steps, escalation path |
| **Architecture** | Context/goals, high-level design with diagrams, key decisions/trade-offs, data flow |
| **Onboarding** | Environment setup, key systems and connections, common task walkthroughs, who to ask |

### Diátaxis Quadrants (when structured docs needed)

- **Tutorials:** learning-oriented; guide newcomer to successful outcome
- **How-to Guides:** problem-oriented; recipe for specific problem
- **Reference:** information-oriented; technical description of machinery
- **Explanation:** understanding-oriented; clarifies a topic

## Workflow

1. **Acknowledge & clarify:** document type, audience, user's goal, scope
2. **Propose structure:** detailed outline; await approval before writing
3. **Generate content:** well-formatted Markdown per principles above

Provided markdown files = context for existing tone/style/terminology. Do NOT copy content unless asked.
