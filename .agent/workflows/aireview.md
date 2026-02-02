---
description: Professional multi-agent AI code review with confidence scoring
---

# aireview - Enhanced AI Code Review

Execute professional code review with multi-agent parallel analysis and confidence scoring.

## Quick Usage

```bash
# Review changes (most common)
aireview --diff                           # Review unstaged changes
aireview --diff --staged                  # Review staged changes
aireview --diff HEAD~1..HEAD              # Review last commit

# Remote branch/PR review
aireview origin/feature-branch            # Review remote branch
aireview origin/feature-branch --quick    # Quick review (small PR)
aireview origin/feature-branch --deep     # Deep review (large PR)

# Deep review (Multi-AI collaboration)
aireview --diff --deep                    # Gemini + parallel analysis
```

## Steps

1. Read the aireview skill:
   - `view_file` on `.agent/skills/aireview/SKILL.md`

2. Follow the skill instructions to execute the review workflow

3. Key features:
   - Multi-agent parallel review (5 specialized agents)
   - Confidence scoring (0-100) with 80+ threshold
   - MBTI persona system for different perspectives
   - Deep mode for multi-model collaboration
   - Chinese language output

4. Output format:
   - AI review report with confidence scores
   - Severity-rated issues (Critical/High/Medium/Low)
   - Fix suggestions with code links
