# Quality Check - Detailed Usage Guide

## Overview

Analyze code quality using CodeDNA-inspired 6-dimension intelligent scoring system with ROI-optimized refactoring recommendations.

## Six Quality Dimensions

### 1. Clarity (20%)
**What it measures**: Code readability and intent clarity

**Scoring criteria**:
- Variable/function naming (10%)
- Comments and documentation (5%)
- Code organization (5%)

**Score range**:
- 90-100: Self-documenting code
- 70-89: Clear with minor issues
- 50-69: Needs improvement
- <50: Confusing

### 2. Structure (20%)
**What it measures**: Code organization and modularity

**Scoring criteria**:
- Module boundaries (7%)
- Function size and complexity (7%)
- Dependency management (6%)

**Score range**:
- 90-100: Excellent separation of concerns
- 70-89: Well-structured
- 50-69: Some coupling issues
- <50: Monolithic or tangled

### 3. Examples (15%)
**What it measures**: Usage examples and documentation quality

**Scoring criteria**:
- README completeness (5%)
- Usage examples (5%)
- API documentation (5%)

### 4. Trigger Detection (15%)
**What it measures**: API discoverability and intuitiveness

**Scoring criteria**:
- Function naming (7%)
- API surface clarity (5%)
- Error messages (3%)

### 5. Best Practices (15%)
**What it measures**: Standards and conventions compliance

**Scoring criteria**:
- Style guide adherence (7%)
- Security best practices (5%)
- Performance patterns (3%)

### 6. Maintainability (15%)
**What it measures**: Long-term code sustainability

**Scoring criteria**:
- Test coverage (7%)
- Technical debt (5%)
- Change risk (3%)

## Usage Scenarios

### Scenario 1: File Quality Check

```
"Analyze code quality for src/services/payment.ts"
```

**Output**:
```markdown
## 📊 Code Quality Report

**File**: src/services/payment.ts
**Overall Score**: 78/100 (Good)

### Dimension Scores
1. Clarity: 85/100 ✅
2. Structure: 75/100 ✅
3. Examples: 60/100 ⚠️
4. Trigger Detection: 80/100 ✅
5. Best Practices: 70/100 ⚠️
6. Maintainability: 75/100 ✅

### ROI-Optimized Recommendations
**High ROI** (10 min → 80% improvement):
1. Add JSDoc comments to public methods
2. Extract 120-line processPayment into smaller functions

**Medium ROI** (30 min → 60% improvement):
3. Add integration tests for edge cases
4. Refactor error handling into middleware

**Low ROI** (2 hrs → 20% improvement):
5. Migrate to TypeScript strict mode
6. Comprehensive input validation
```

### Scenario 2: Project-Wide Analysis

```
"Generate quality report for entire project"
```

Analyzes all files and provides aggregated scores.

### Scenario 3: Trend Analysis

```
"Compare quality with last month"
```

Shows quality improvement/degradation over time.

## ROI-Optimized Refactoring

**High ROI** (<30 min, 50%+ impact):
- Rename unclear variables
- Add missing documentation
- Extract magic numbers
- Fix obvious bugs

**Medium ROI** (30 min-2 hrs, 30% impact):
- Reduce function complexity
- Add test coverage
- Refactor duplicated code

**Low ROI** (>2 hrs, <20% impact):
- Large-scale refactoring
- Migration to new patterns
- Complete test rewrites

## Real-World Examples

### Example 1: Pre-Commit Check

```bash
git add .
"Run quality check before commit"
```

Ensures minimum quality threshold before committing.

### Example 2: Technical Debt Assessment

```
"Identify technical debt hotspots"
```

Finds areas with lowest quality scores requiring urgent attention.

### Example 3: Refactoring Prioritization

```
"Prioritize refactoring by ROI"
```

Orders improvements by effort/impact ratio.

## Related Skills

- **code-review**: Combines with quality analysis
- **project-analyze**: Project-wide quality assessment
- **agent-kb**: Historical quality patterns
