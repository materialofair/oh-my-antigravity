---
name: ralph
description: Self-referential loop until task completion with self-verification
owner: @maintainers
maturity: domain
last-reviewed: 2026-02-06
---

# Ralph Skill (Single-Agent Mode)

[RALPH - ITERATION {{ITERATION}}/{{MAX}}]

Your previous attempt did not output the completion promise. Continue working on the task.

## PRD MODE (OPTIONAL)

If the user provides the `--prd` flag, initialize a PRD (Product Requirements Document) BEFORE starting the ralph loop.

### Detecting PRD Mode

Check if `{{PROMPT}}` contains the flag pattern: `--prd` or `--PRD`

### PRD Initialization Workflow

When `--prd` flag detected:

1. **Create PRD File Structure** (`.oma/prd.json` and `.oma/progress.txt`)
2. **Parse the task** (everything after `--prd` flag)
3. **Break down into user stories** with this structure:

```json
{
  "project": "[Project Name]",
  "branchName": "ralph/[feature-name]",
  "description": "[Feature description]",
  "userStories": [
    {
      "id": "US-001",
      "title": "[Short title]",
      "description": "As a [user], I want to [action] so that [benefit].",
      "acceptanceCriteria": ["Criterion 1", "Typecheck passes"],
      "priority": 1,
      "passes": false
    }
  ]
}
```

4. **Create progress.txt**:

```
# Ralph Progress Log
Started: [ISO timestamp]

## Codebase Patterns
(No patterns discovered yet)

---
```

5. **Guidelines for PRD creation**:
   - Right-sized stories: Each completable in one focused session
   - Verifiable criteria: Include "Typecheck passes", "Tests pass"
   - Independent stories: Minimize dependencies
   - Priority order: Foundational work (DB, types) before UI

6. **After PRD created**: Proceed to normal ralph loop execution using the user stories as your task list

### Example Usage

User input: `--prd build a todo app with React and TypeScript`

Your workflow:
1. Detect `--prd` flag
2. Extract task: "build a todo app with React and TypeScript"
3. Create `.oma/prd.json` with user stories
4. Create `.oma/progress.txt`
5. Begin ralph loop using user stories as task breakdown

## COMPLETION REQUIREMENTS

Before claiming completion, you MUST:
1. Verify ALL requirements from the original task are met
2. Ensure no partial implementations
3. Check that code compiles/runs without errors
4. Verify tests pass (if applicable)
5. TODO LIST: Zero pending/in_progress tasks

## VERIFICATION BEFORE COMPLETION (IRON LAW)

**NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE**

Before outputting the completion promise:

### Steps (MANDATORY)
1. **IDENTIFY**: What command proves the task is complete?
2. **RUN**: Execute verification (test, build, lint)
3. **READ**: Check output - did it actually pass?
4. **ONLY THEN**: Proceed to Self-Verification

### Red Flags (STOP and verify)
- Using "should", "probably", "seems to"
- About to output completion without fresh evidence
- Expressing satisfaction before verification

### Evidence Chain
1. Fresh test run output showing pass
2. Fresh build output showing success
3. lsp_diagnostics showing 0 errors
4. THEN Self-Verification
5. THEN completion promise

**Skipping verification = Task NOT complete**

## SELF-VERIFICATION (MANDATORY)

When you believe the task is complete, you MUST switch personas to **Critical Architect** and verify your own work.

1. **Pause**: Do not output the promise yet.
2. **Review**: Look at what you implemented vs the original request.
3. **Ask yourself**:
    - "Did I miss any edge cases?"
    - "Is the code clean and maintainable?"
    - "Does it strictly follow the user's patterns?"
4. **Conclusion**:
    - If issues found: Fix them, then re-verify.
    - If approved: Clearly state "Self-verification passed."

## ZERO TOLERANCE

- NO Scope Reduction - deliver FULL implementation
- NO Partial Completion - finish 100%
- NO Premature Stopping - ALL TODOs must be complete
- NO TEST DELETION - fix code, not tests

## STATE CLEANUP ON COMPLETION

**IMPORTANT: Delete state files on successful completion - do NOT just set `active: false`**

When outputting the completion promise after verification:

```bash
# Delete ralph state file
rm -f .oma/state/ralph-state.json
rm -f .oma/state/ralph-verification.json
rm -f ~/.gemini/antigravity/ralph-state.json
```

This ensures clean state for future sessions. Stale state files with `active: false` should not be left behind.

## INSTRUCTIONS

- Review your progress so far
- Continue from where you left off
- When FULLY complete AND verified:
  1. Clean up state files
  2. Output: <promise>{{PROMISE}}</promise>
- Do not stop until the task is truly done

Original task:
{{PROMPT}}

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
