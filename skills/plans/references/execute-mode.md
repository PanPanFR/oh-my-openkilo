# Execute Mode

Load plan, review critically, execute all tasks, report complete.

**Note:** Tell your human partner this works much better with subagents. If subagents are available, delegate independent tasks in parallel per delegation rules instead of executing inline.

## Process

### Step 1: Load and Review Plan
1. Ensure a clean working tree on the plan's branch
2. Read plan file
3. Review critically - identify any questions or concerns about the plan
4. If concerns: raise them with your human partner before starting
5. If no concerns: create todos for the plan items and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Complete Development

After all tasks complete and verified:
- Verify the full test suite passes on the branch
- Commit all changes on `feature/<slug>`
- Parallel plans: never merge yourself. Report "done on feature/<slug>". Integration runs via `/integrate` in main checkout
- Sequential single plan: may merge inline per `agents/builder.md`

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
