# Strategy Shift: "Pruning & Restructuring"

You are absolutely right. Instead of "porting" (moving file by file to a new folder), it is much more efficient to **transform** the existing repository in place.

## The Logic

`oh-my-claudecode` = `Prompt Assets` (Skills/Agents) + `Execution Logic` (JS/CLI).

Antigravity already handles `Execution Logic`. We just need to keep the `Prompt Assets`.

## The Plan

1.  **Delete** the "Logic" (useless for Antigravity):
    - `src/` (The TypeScript source for the CLI)
    - `scripts/` (Node.js scripts for hooks)
    - `.claude-plugin/` (Claude-specific config)
    - `package.json`, `tsconfig.json` (We are not building an NPM package anymore)

2.  **Keep & Move** the "Brains" (Prompts):
    - `skills/` -> Move to `.agent/skills/`
    - `agents/` -> Convert to `skills` (e.g., `agents/architect.md` -> `.agent/skills/architect/SKILL.md`)
    - `commands/` -> Convert to `workflows` or `rules`.

3.  **Injector**:
    - Create a simple `install.sh` that just copies the now-clean `.agent` folder to your actual workspace.

## Outcome

You get **100%** of the prompts from `oh-my-claudecode`, but organized in a way Antigravity understands. No "missing features" because we start with *everything* and only remove what is technically incompatible (like JS code).

## Execution Steps

1.  **Cleanup**: `rm -rf src scripts .claude-plugin rule_provider ...`
2.  **Restructure**: `mkdir .agent; mv skills .agent/`
3.  **Adapt**: Batch rename/move `agents/*.md` to `.agent/skills/`.
