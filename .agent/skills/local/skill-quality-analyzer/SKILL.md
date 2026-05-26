---
name: skill-quality-analyzer
description: Analyzes Codex skill quality with 6-dimension scoring system similar to CodeDNA, providing actionable improvement recommendations
version: 0.1.0
source: fork
checksum: ca7e28653e1379adc77426868805bbf96811887409f77f8def0eba9f32722f80
updated_at: 2026-02-05T17:51:16+08:00
intent: skill-management
layer: meta
---


# Skill Quality Analyzer

Comprehensive quality analysis system for Codex skills using a 6-dimension scoring framework inspired by CodeDNA. Identifies quality issues, provides improvement recommendations, and generates detailed quality reports.

## Agent Workflow

To perform a high-quality analysis, follow this **Hybrid Workflow**:

1.  **Run Static Analysis**: Execute `python3 analyzer.py --skill-path [TARGET_SKILL_PATH]` to get objective metrics for the **target skill**.
2.  **Read Target Skill Content**: Use `view_file` to read the `SKILL.md` and `HOW_TO_USE.md` of the **skill you are analyzing** (the target skill). *Do not read this analyzer skill's own files.*
3.  **Synthesize Report**: Combine the script's findings (hard metrics) with your manual review of the **target skill's content** (soft metrics) to generate the final report.
    *   *Script says*: "Description too short." -> *You check*: "Is it just short, or is it actual nonsense?"
    *   *Script says*: "100/100 score." -> *You check*: "Format is perfect, but does the logic make sense?"

## Capabilities

- **6-Dimension Quality Scoring**: Evaluates skills across Clarity, Structure, Examples, Trigger Detection, Best Practices, and Maintainability (0-100 scale)
- **Automated Issue Detection**: Identifies common problems like missing examples, unclear descriptions, poor structure, and missing trigger words
- **Improvement Recommendations**: Provides specific, actionable suggestions for each quality dimension
- **Comparative Analysis**: Compares skills against best practices from official Antigravity examples
- **Quality Report Generation**: Creates detailed markdown reports with scores, issues, and recommendations
- **Batch Analysis**: Analyzes multiple skills at once for consistency checking

## Input Requirements

**Single Skill Analysis**:
- Skill folder path (e.g., `~/.gemini/antigravity/skills/my-skill/`)
- Or SKILL.md file path directly

**Batch Analysis**:
- Directory containing multiple skills
- Or list of skill paths

**Data Requirements**:
- Valid SKILL.md file with YAML frontmatter
- Optional: Python files, README.md, HOW_TO_USE.md

## Output Formats

**Quality Score Card** (JSON):
```json
{
  "overall_score": 85,
  "dimensions": {
    "clarity": {"score": 90, "weight": 20},
    "structure": {"score": 85, "weight": 20},
    "examples": {"score": 80, "weight": 15},
    "trigger_detection": {"score": 90, "weight": 15},
    "best_practices": {"score": 80, "weight": 15},
    "maintainability": {"score": 85, "weight": 15}
  },
  "issues": ["Missing usage examples", "No sample inputs"],
  "recommendations": ["Add 3-5 concrete usage examples", "Include sample_input.json"]
}
```

**Quality Report** (Markdown):
- Executive summary with overall score
- Dimension-by-dimension breakdown
- Critical issues list (severity-ranked)
- Improvement recommendations (prioritized)
- Comparison with best practices
- Before/After improvement potential

## Six Quality Dimensions

### 1. Clarity (20%)
- **What it measures**: How clearly the skill's purpose, capabilities, and usage are communicated
- **Key indicators**:
  - Description specificity (not vague)
  - Clear capability statements
  - Unambiguous usage instructions
  - No jargon without explanation
- **Scoring**:
  - 90-100: Crystal clear, no ambiguity
  - 70-89: Mostly clear, minor improvements needed
  - 50-69: Some confusion possible
  - <50: Unclear purpose or usage

### 2. Structure (20%)
- **What it measures**: Organizational quality and consistency with Anthropic standards
- **Key indicators**:
  - Valid YAML frontmatter (name in kebab-case, concise description)
  - Required sections present (Capabilities, Input/Output, How to Use)
  - Logical section ordering
  - Proper markdown formatting
- **Scoring**:
  - 90-100: Perfect structure, all sections present
  - 70-89: Minor structural issues
  - 50-69: Missing key sections
  - <50: Severely malformed

### 3. Examples (15%)
- **What it measures**: Quality and quantity of usage examples
- **Key indicators**:
  - 3-5 concrete usage examples
  - sample_input.json present
  - expected_output.json present
  - Examples cover major use cases
- **Scoring**:
  - 90-100: Rich examples with sample data
  - 70-89: Good examples, missing sample files
  - 50-69: Minimal examples
  - <50: No examples or sample data

### 4. Trigger Detection (15%)
- **What it measures**: How easily Codex can determine when to invoke this skill
- **Key indicators**:
  - Clear "When to use" section
  - Specific trigger keywords identified
  - Description mentions use cases
  - No overlap with existing skills
- **Scoring**:
  - 90-100: Crystal clear triggers
  - 70-89: Mostly clear when to use
  - 50-69: Ambiguous triggering conditions
  - <50: No clear triggers

### 5. Best Practices (15%)
- **What it measures**: Adherence to Codex skill development standards
- **Key indicators**:
  - Follows Codex naming conventions
  - Proper Python structure (if applicable)
  - README.md and HOW_TO_USE.md present
  - No backup files or __pycache__
  - Proper file organization
- **Scoring**:
  - 90-100: Exemplary adherence
  - 70-89: Minor deviations
  - 50-69: Several best practice violations
  - <50: Major violations

### 6. Maintainability (15%)
- **What it measures**: How easy it is to update and maintain the skill
- **Key indicators**:
  - Clear code comments (if Python files)
  - Modular design
  - No hard-coded values
  - Version information present
  - Clean file structure (no clutter)
- **Scoring**:
  - 90-100: Highly maintainable
  - 70-89: Generally maintainable
  - 50-69: Some maintenance challenges
  - <50: Difficult to maintain

## How to Use

**Basic Analysis**:
```
"Analyze the quality of my skill-creator skill"
"What's the quality score for ~/.gemini/antigravity/skills/code-review/"
"Run quality analysis on the aws-solution-architect skill"
```

**Detailed Report**:
```
"Generate a detailed quality report for skill-debugger"
"Analyze ~/.gemini/antigravity/skills/prompt-factory/ and create improvement recommendations"
```

**Batch Analysis**:
```
"Analyze all skills in ~/.gemini/antigravity/skills/ and rank them by quality"
"Compare quality scores across all my custom skills"
```

**Comparative Analysis**:
```
"Compare my code-review skill against Antigravity's best practices"
"How does skill-tester compare to official skills in quality?"
```

## Scripts

- `analyzer.py`: Core 6-dimension quality analysis engine
  - Usage: `python3 analyzer.py --skill-path /path/to/skill`
- `validator.py`: YAML frontmatter and structure validation (merged into analyzer.py)
- `best_practices_checker.py`: Checks adherence to Codex standards (merged into analyzer.py)

## Best Practices

1. **Run Before Distribution**: Always analyze skills before sharing or installing
2. **Target 80+ Score**: Aim for overall scores of 80 or higher for production skills
3. **Fix Critical Issues First**: Address issues flagged as "Critical" or "High" severity
4. **Iterate**: Re-analyze after improvements to track progress
5. **Batch Analysis for Consistency**: Use batch mode to ensure consistent quality across all your skills
6. **Compare Against Examples**: Use comparative analysis to learn from official skills

## Integration with Quality Systems

**Agent-KB Integration**:
- Automatically records quality patterns from high-scoring skills
- Learns common issues from low-scoring skills
- Suggests improvements based on historical data

**CodeDNA Alignment**:
- Uses similar 6-dimension framework
- Consistent scoring methodology
- Shares best practices database

**CI/CD Integration**:
- Can be used in pre-commit hooks
- Quality gates for skill deployment
- Automated quality regression testing

## Limitations

- **Static Analysis Only**: Does not test skill execution or effectiveness
- **No Runtime Testing**: Cannot verify if Python code works correctly
- **Pattern-Based**: Relies on known patterns and best practices
- **English-Focused**: May not handle non-English skills as effectively
- **No Context Understanding**: Cannot judge if a skill's purpose is valuable
- **File-Based**: Requires access to skill files (cannot analyze from description alone)

## When NOT to Use This Skill

- **Testing Functional Correctness**: Use skill-tester instead
- **Runtime Debugging**: Use skill-debugger for execution issues
- **Documentation Generation**: Use skill-doc-generator for creating docs
- **Initial Skill Creation**: Use skill-creator or templates first, then analyze

## Quality Thresholds

| Score Range | Quality Level | Action |
|-------------|---------------|--------|
| 90-100 | Excellent | Ready for production, share as example |
| 80-89 | Good | Minor improvements, safe to deploy |
| 70-79 | Acceptable | Address key issues before wide distribution |
| 60-69 | Needs Work | Significant improvements required |
| <60 | Poor | Major refactoring needed |

## Comparison with CodeDNA

| Dimension | CodeDNA (Code) | Skill Quality Analyzer (Skills) |
|-----------|----------------|----------------------------------|
| Clarity | Comments & naming | Description & documentation |
| Structure | Code organization | Section organization & YAML |
| Examples | Test coverage | Usage examples & sample data |
| Patterns | Design patterns | Trigger detection |
| Standards | Coding standards | Codex best practices |
| Maintenance | Cyclomatic complexity | File cleanliness & modularity |
