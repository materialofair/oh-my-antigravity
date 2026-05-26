# Skill Debugger

Debug why your Claude Code skills aren't triggering when they should.

## Quick Install

```bash
cp -r skill-debugger ~/.claude/skills/
```

## Usage

```
"My code-review skill isn't working - debug it"
"Why doesn't financial-analyzer trigger when I ask about ratios?"
"Check if my skills have conflicting descriptions"
```

## What It Fixes

- ❌ Skill exists but never triggers → Improve description
- ❌ Wrong skill triggers → Fix conflicts
- ❌ Need to mention skill name explicitly → Add trigger keywords
- ❌ Skill not found → Fix installation/naming

## Common Root Causes

1. **Vague description** (80% of cases)
2. **Missing trigger keywords** (60%)
3. **Conflicts with other skills** (30%)
4. **Installation/naming issues** (20%)

## Files

- `SKILL.md` - Main debugging guide
- `README.md` - This file
- `HOW_TO_USE.md` - Detailed examples
- `diagnostic_checklist.md` - Step-by-step checklist

## Related Skills

- `skill-quality-analyzer` - Check overall quality
- `skill-tester` - Test skill functionality
- `skill-doc-generator` - Improve documentation
