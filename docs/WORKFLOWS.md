# Example workflows

What does the pack actually *do*? Five real prompts with the agent, skills, rules, and result for each. Two of these (audit, debug) are in the [README](../README.md#-example-workflows) for the headline scan; the other three live here.

## 3. New feature implementation

> "Add a new feature: [description]."

- **Agent:** `builder` → spawns `planner` for design, `tester` for tests, `reviewer` for security analysis when auth/data is involved
- **Skills:** `plans` (write structured plan first), `test-driven-development` (tests before implementation), `verification-before-completion` (evidence before "done")
- **Rules:** plan-file protocol for complex tasks, TDD before implementation, verify before claiming done
- **Result:** structured plan you confirm first, tests written first, evidence-backed completion, security review on the auth path.

**Without the pack:** the agent starts coding immediately. No plan, no tests, no review. The feature works (maybe), but the architecture drifts, nothing is verified, and a security issue slips through because no one looked.

## 4. Architecture review

> "Review this application's architecture and suggest improvements."

- **Agent:** `planner` → gathers evidence inline (graphify query for coupling, native webfetch/websearch for stack best practices)
- **Skills:** `codebase-design` (deep-module vocabulary, finding deepening opportunities), `plans` (write up findings)
- **Rules:** graphify-first (query the graph for actual coupling, not vibes), plan-file protocol, user confirmation loop before any implementation
- **Result:** structured review with evidence from the codebase (specific files, specific call sites), explicit trade-offs, a plan you confirm before anything is refactored.

**Without the pack:** a loose opinion piece ("maybe extract this, perhaps that service is too big") with no verification against the actual code, no trade-offs discussed, and a refactor suggestion that breaks three other things.

## 5. Knowledge graph exploration

> "Explore this codebase and map the relationships between the major components."

- **Agent:** `builder` (or any agent)
- **Skills:** `graphify` (knowledge graph for the codebase)
- **Rules:** graphify-first navigation (init graph with `graphify update .` if missing)
- **Result:** structural map of the codebase (`graphify query`, `graphify path`, `graphify explain`) before touching any code. Even a million-line repo is navigable.

**Without the pack:** manual `grep` + reading file after file. Slow, you miss the cross-file structure, and you give up on large repos.

---

## How to use this doc

When you ask the agent a prompt that resembles one of these, it will likely match the same delegation pattern on its own. If it doesn't, name the workflow explicitly: *"do this like the audit workflow"*.

Want another scenario added? Open an issue or PR with the prompt and the desired result shape.
