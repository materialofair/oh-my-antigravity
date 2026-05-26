# Skill Quality Analyzer

6-dimension quality analysis system for Codex skills, inspired by CodeDNA.

## Quick Install

```bash
# User-level (all projects)
cp -r skill-quality-analyzer ~/.codex/skills/

# Project-level (current project only)
cp -r skill-quality-analyzer .codex/skills/
```

## Usage

Once installed, Codex will automatically use this skill when you ask about skill quality:

```
"Analyze the quality of my code-review skill"
"What's the quality score for the aws-solution-architect skill?"
"Generate a quality report for all my custom skills"
```

## What This Skill Does

Evaluates skills across **6 dimensions** (inspired by CodeDNA):

1. **Clarity** (20%) - How clear is the purpose and usage?
2. **Structure** (20%) - Proper YAML, sections, formatting?
3. **Examples** (15%) - Good usage examples and sample data?
4. **Trigger Detection** (15%) - Clear when to invoke?
5. **Best Practices** (15%) - Follows Codex guidelines?
6. **Maintainability** (15%) - Easy to update and maintain?

## Output

- Overall score (0-100)
- Dimension-by-dimension breakdown
- Critical issues list
- Prioritized improvement recommendations
- Quality level: Excellent (90+), Good (80-89), Acceptable (70-79), Needs Work (60-69), Poor (<60)

## Files

- `SKILL.md` - Main skill definition (read this first)
- `README.md` - This file
- `HOW_TO_USE.md` - Detailed usage examples
- `sample_input.json` - Example skill to analyze
- `expected_output.json` - Example quality report

## No Python Required

This skill is **documentation-driven**. Codex uses the SKILL.md instructions to analyze skills without needing Python implementation. Python modules can be added later if needed for automation.

## Related Skills

- `skill-debugger` - Debug why skills aren't triggering
- `skill-tester` - Test skill functionality (TDD)
- `skill-doc-generator` - Auto-generate documentation
- `skill-template-generator` - Quick skill scaffolding (installed)
