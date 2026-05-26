---
name: quality-check
description: CodeDNA 6-dimension intelligent scoring for code quality. Provides ROI-optimized refactoring recommendations when analyzing code.
version: 0.1.0
source: fork
checksum: 0fee4661b24036455cab84e6e48678ac7a5cd8a794f10d4550d56452933d8cc6
updated_at: 2026-02-05T16:22:10+08:00
layer: quality
---


> Codex CLI: Manual invocation only (`$quality-check`). No hooks or auto-run.

# Code Quality Check Skill

## When to Use This Skill

Automatically invoke this Skill when:
- User asks to "check code quality", "review this code"
- User mentions refactoring or code improvements
- User wants quality scores or metrics
- Before major refactoring efforts
- During code review processes
- Keywords: "quality", "refactor", "review", "improve code", "code smell"

## What This Skill Does

**CodeDNA Quality Analyzer** provides:
1. **6-Dimension Scoring** - Comprehensive quality assessment
2. **Issue Identification** - Specific problems with severity levels
3. **ROI-Optimized Suggestions** - High-value refactoring priorities
4. **PageRank Analysis** - Quality hotspot identification

## The 6 Quality Dimensions

1. **Complexity** - Cyclomatic complexity, nesting depth
2. **Maintainability** - Code readability, documentation quality
3. **Modularity** - Coupling, cohesion, dependency structure
4. **Test Coverage** - Test quality and coverage metrics
5. **Documentation** - Comment ratio, API docs completeness
6. **Best Practices** - Style guide adherence, pattern usage

## Instructions

When this Skill is invoked:

### Step 1: Determine Analysis Mode

Ask yourself:
- Is it a **single file**? → Use `test_quality_simple.py`
- Is it a **project directory**? → Use `project_quality_analyzer.py --mode overview`
- Need **impact analysis**? → Use `project_quality_analyzer.py --mode impact-analysis`

### Step 2: Execute the Analysis

**IMPORTANT**: You MUST execute one of these Python commands:

**Single File Analysis**:
```bash
python /Users/WangQiao/claude-enhanced-quality/test_quality_simple.py [file_path]
```

**Project Overview**:
```bash
python /Users/WangQiao/claude-enhanced-quality/project_quality_analyzer.py --project [directory_path] --mode overview
```

**Impact Analysis**:
```bash
python /Users/WangQiao/claude-enhanced-quality/project_quality_analyzer.py --file [file_path] --mode impact-analysis
```

### Step 3: Present Results

Format the output as:

```markdown
## 🔬 Code Quality Analysis

**Target**: [File/Project Path]
**Overall Score**: XX/100 [🟢/🟡/🔴]

### 6-Dimension Breakdown

| Dimension | Score | Status | Key Insights |
|-----------|-------|--------|--------------|
| Complexity | XX/100 | 🟢/🟡/🔴 | [Main issue] |
| Maintainability | XX/100 | 🟢/🟡/🔴 | [Main issue] |
| Modularity | XX/100 | 🟢/🟡/🔴 | [Main issue] |
| Test Coverage | XX/100 | 🟢/🟡/🔴 | [Main issue] |
| Documentation | XX/100 | 🟢/🟡/🔴 | [Main issue] |
| Best Practices | XX/100 | 🟢/🟡/🔴 | [Main issue] |

### 🔴 Critical Issues (Fix Immediately)
1. **[Issue Name]** - [File:Line]
   - Impact: [High/Medium/Low]
   - Explanation: [What's wrong]
   - Fix: [Specific solution]

### 🟡 Important Issues (Fix This Sprint)
1. **[Issue Name]** - [File:Line]
   - Impact: [explanation]
   - Suggested approach: [how to fix]

### 💡 Refactoring Priorities (ROI-Optimized)

Based on PageRank and quality analysis:

1. **[Module/File Name]** (ROI: High)
   - Current Score: XX/100
   - Effort: [X hours]
   - Benefit: [Specific improvements]
   - Priority: P0/P1/P2

2. **[Module/File Name]** (ROI: Medium)
   - [Details...]

### 📊 Quality Hotspots

Files that would benefit most from refactoring:
- [File 1]: Score XX, high dependency count
- [File 2]: Score XX, complex and frequently changed
- [File 3]: Score XX, critical business logic

### 🎯 Recommended Actions

**Immediate (This Week)**:
- [ ] [Specific action with file:line]
- [ ] [Specific action with file:line]

**Short-term (This Sprint)**:
- [ ] [Refactoring task]
- [ ] [Testing improvement]

**Long-term (Next Quarter)**:
- [ ] [Architecture improvement]
- [ ] [Technical debt reduction]
```

### Step 4: Provide Context

Explain:
- Why these scores matter
- Business impact of the issues
- Risk of not fixing critical problems
- Expected improvement from suggested changes

## Examples

### Example 1: Single File Review
**User**: "Check the quality of src/auth/login.ts"

**You execute**:
```bash
python ~/claude-enhanced-quality/test_quality_simple.py src/auth/login.ts
```

**You present**: 6-dimension scores, specific issues, and refactoring suggestions.

### Example 2: Project Overview
**User**: "How's the code quality of my payment module?"

**You execute**:
```bash
python ~/claude-enhanced-quality/project_quality_analyzer.py --project src/payment --mode overview
```

**You present**: Project-wide quality assessment, hotspots, and priority fixes.

### Example 3: Impact Analysis
**User**: "I want to refactor the database layer, what's the impact?"

**You execute**:
```bash
python ~/claude-enhanced-quality/project_quality_analyzer.py --file src/core/database.ts --mode impact-analysis
```

**You present**: Dependency analysis, affected files, risk assessment, and refactoring plan.

## Quality Thresholds

Scoring system:
- **🟢 80-100**: Good quality, minor improvements only
- **🟡 60-79**: Acceptable, needs improvement
- **🔴 <60**: Poor quality, refactoring required

## ROI Calculation

Refactoring priority is based on:
- **Quality Score** (lower = higher priority)
- **PageRank** (higher = more important)
- **Dependency Count** (higher = more impact)
- **Change Frequency** (higher = more value)

## Integration with ProjectMind

For project-level analysis, the system uses:
- **Knowledge Graph** - Deep project understanding
- **Dependency Mapping** - Complete relationship analysis
- **Historical Data** - Evolution patterns and trends

## Important Notes

- **Always execute** the Python command, don't guess scores
- **Explain the "why"** behind each issue
- **Prioritize by ROI**, not just severity
- **Provide specific fixes**, not generic advice
- **Consider business context** in recommendations

## Common Quality Issues

### Complexity Issues
- High cyclomatic complexity (>10)
- Deep nesting (>4 levels)
- Long functions (>50 lines)
- God classes/objects

### Maintainability Issues
- Poor naming conventions
- Missing documentation
- Magic numbers/strings
- Code duplication

### Modularity Issues
- High coupling
- Low cohesion
- Circular dependencies
- Tight integration

### Testing Issues
- Low coverage (<80%)
- Missing edge cases
- Flaky tests
- No integration tests

## Prerequisites

- Python environment with CodeDNA installed
- Access to project files
- ProjectMind system for project-level analysis

## Performance

- **Single File**: <5 seconds
- **Project Overview**: 10-30 seconds
- **Impact Analysis**: 15-45 seconds
