# Skill Tester

TDD tool for testing Claude Code skills functionality.

## Quick Install

```bash
cp -r skill-tester ~/.claude/skills/
```

## Usage

```
"Test financial-analyzer skill"
"Run full test suite on code-review"
"Write tests for my new skill before implementing it"
```

## What It Does

- ✅ Functional testing (correct outputs)
- ✅ Trigger testing (skill activates when it should)
- ✅ Edge case testing (handles unusual inputs)
- ✅ Performance testing (execution time)
- ✅ TDD workflow (write tests first)

## Quick Example

```
User: "Test if financial-analyzer calculates P/E correctly"

Claude:
Test: P/E Calculation
Input: price=100, eps=6.45
Expected: 15.5
Result: ✅ 15.504 (PASS)
```

## Files

- `SKILL.md` - Testing methodology and patterns
- `README.md` - This file

## TDD Integration

Works with TDD Guard to enforce test-first development for skills.
