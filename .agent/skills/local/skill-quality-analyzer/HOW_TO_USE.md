# How to Use Skill Quality Analyzer

## Basic Usage

### Single Skill Analysis

```
"Analyze the quality of my aws-solution-architect skill"
"Check the quality score for ~/.codex/skills/code-review/"
"Generate a quality report for the prompt-factory skill"
```

**What Codex will do**:
1. Read the skill's SKILL.md file
2. Evaluate across 6 dimensions
3. Calculate overall score (0-100)
4. List issues and recommendations

### Detailed Report

```
"Give me a detailed quality analysis of skill-debugger with specific recommendations"
"Analyze ~/.codex/skills/content-researcher/ and tell me what needs improvement"
```

**Output includes**:
- Overall score and quality level
- Dimension-by-dimension scores
- Critical issues (severity-ranked)
- Prioritized improvement recommendations
- Comparison with Codex best practices

## Advanced Usage

### Batch Analysis

```
"Analyze all skills in ~/.codex/skills/ and rank them by quality"
"Compare quality scores across all my custom skills"
"Which of my skills need the most improvement?"
```

### Comparative Analysis

```
"Compare my code-review skill against Codex's official examples"
"How does my skill-tester compare to best practices?"
"Show me the quality difference between my top 3 and bottom 3 skills"
```

### Before Distribution

```
"I want to share my financial-analyzer skill. Is it ready?"
"Run quality checks before I package this skill"
"What should I fix before publishing to the skill marketplace?"
```

## Understanding the Output

### Overall Score

| Score | Quality Level | Meaning |
|-------|---------------|---------|
| 90-100 | Excellent | Ready for production, can be shared as example |
| 80-89 | Good | Minor improvements, safe to deploy |
| 70-79 | Acceptable | Address key issues before wide distribution |
| 60-69 | Needs Work | Significant improvements required |
| <60 | Poor | Major refactoring needed |

### Six Dimensions Explained

**1. Clarity (20%)**
- Is the skill's purpose clear?
- Are capabilities well-defined?
- Is usage unambiguous?

**Example Issue**: "Description uses vague words like 'helps' and 'various'"
**Recommendation**: "Replace vague words with specific capabilities"

**2. Structure (20%)**
- Valid YAML frontmatter?
- Required sections present?
- Proper formatting?

**Example Issue**: "Skill name not in kebab-case format"
**Recommendation**: "Change name to kebab-case (e.g., skill-quality-analyzer)"

**3. Examples (15%)**
- Good usage examples?
- Sample input data?
- Expected output shown?

**Example Issue**: "Missing sample_input.json file"
**Recommendation**: "Add sample_input.json showing example input data"

**4. Trigger Detection (15%)**
- Clear when to invoke?
- Specific keywords?
- No overlap with other skills?

**Example Issue**: "Description doesn't clearly state use case"
**Recommendation**: "Add use case to description (e.g., 'for analyzing...' or 'when you need...')"

**5. Best Practices (15%)**
- Follows Codex guidelines?
- README and HOW_TO_USE present?
- No backup files or __pycache__?

**Example Issue**: "Found 3 backup files (should be removed)"
**Recommendation**: "Remove all backup files (.backup, .bak, .old)"

**6. Maintainability (15%)**
- Clean file structure?
- Version information?
- Well-commented code?

**Example Issue**: "No version information found"
**Recommendation**: "Add version number to README.md or SKILL.md"

## Real-World Examples

### Example 1: Quick Health Check

**User**: "Is my code-review skill good enough to share?"

**Codex**:
```
Analyzing ~/.codex/skills/code-review/...

Overall Score: 87 (Good)

✅ Strengths:
- Excellent clarity (95) - Very clear purpose
- Strong structure (90) - All sections present
- Good examples (85) - Rich usage examples

⚠️ Areas for Improvement:
- Missing sample_input.json (affects Examples score)
- No version information (affects Maintainability)

Recommendation: Safe to share, but add sample_input.json and version info for best quality.
```

### Example 2: Identify Weaknesses

**User**: "Why is my skill-tester score only 65?"

**Codex**:
```
Quality Analysis: skill-tester (65 - Needs Work)

Critical Issues:
1. [CLARITY] Description too brief (< 20 chars) - Score: 55
2. [STRUCTURE] Missing required sections: Input Requirements, Output Formats - Score: 60
3. [EXAMPLES] No usage examples found - Score: 40

High Priority Recommendations:
1. Expand description to 50-100 characters with clear use case
2. Add Input Requirements and Output Formats sections
3. Add 3-5 concrete usage examples

Fix these 3 issues to reach 80+ (Good quality).
```

### Example 3: Batch Comparison

**User**: "Compare quality of all my skills"

**Codex**:
```
Quality Analysis (5 skills):

Excellent (90+):
  - prompt-factory: 94
  - aws-solution-architect: 92

Good (80-89):
  - code-review: 87
  - content-researcher: 82

Needs Work (60-69):
  - skill-tester: 65

Recommendation: Focus improvement effort on skill-tester.
Common issues across all skills: Missing version information (4/5 skills).
```

## Integration with Your Workflow

### Before Commit

```bash
# In your skill development workflow
1. Create/modify skill
2. Ask Codex: "Analyze quality of this skill"
3. Fix critical issues (score < 80)
4. Commit when score ≥ 80
```

### CI/CD Integration

You can integrate quality checks into your workflow:

```
# Pre-commit hook idea
"Check if any modified skills dropped below 80 quality score"
```

### Continuous Improvement

```
# Monthly quality review
"Analyze all my skills and identify trends"
"Which quality dimensions need attention across my skills?"
```

## Tips for High Quality Scores

1. **Start with Templates**: Use Skill Factory templates (already high quality)
2. **Be Specific**: Avoid vague words (helps, various, many)
3. **Show Examples**: Include 3-5 concrete usage examples
4. **Add Sample Data**: Include sample_input.json and expected_output.json
5. **Clean Up**: Remove backup files and __pycache__ before analysis
6. **Document Everything**: README, HOW_TO_USE, clear sections
7. **Version Your Skills**: Add version info for maintainability
8. **Follow Conventions**: Use kebab-case names, proper YAML
9. **Target 80+**: Good quality threshold
10. **Iterate**: Analyze → Fix → Re-analyze

## Troubleshooting

**Q: "Codex isn't using this skill when I ask about quality"**
A: Try being more explicit: "Use the skill-quality-analyzer skill to analyze..."

**Q: "The score seems too harsh"**
A: Quality analyzer uses strict Codex standards. Score of 70+ is acceptable.

**Q: "Can I customize the scoring weights?"**
A: Not currently. Weights are based on Codex best practices (Clarity and Structure are most important at 20% each).

**Q: "How do I improve my Trigger Detection score?"**
A: Add clear "When to Use" section and mention specific use cases in the description.
