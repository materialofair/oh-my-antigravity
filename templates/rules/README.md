# Rules Templates (Codex)

This directory contains rule templates you can copy to your project for Codex.

## Usage (project-level)

Create a `.codex/rules/` directory in your project root:
```bash
mkdir -p .codex/rules
```

Copy templates:
```bash
cp templates/rules/security.md .codex/rules/
cp templates/rules/testing.md .codex/rules/
```

Edit `.codex/rules/*.md` to add project-specific checks.

## Notes

- Codex also supports global rules under `~/.codex/rules/`.
- These rules are loaded by Codex (not Claude Code plugins).
