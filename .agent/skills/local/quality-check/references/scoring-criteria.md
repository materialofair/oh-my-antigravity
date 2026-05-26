# CodeDNA Quality Scoring Criteria

## Overview

CodeDNA uses 6 dimensions to evaluate code quality, each scored 0-10. Total score is out of 60.

**Score Interpretation**:
- **50-60 (A)**: Excellent - Production-ready, well-maintained
- **40-49 (B)**: Good - Minor improvements needed
- **30-39 (C)**: Fair - Significant refactoring recommended
- **20-29 (D)**: Poor - Major issues, refactor urgently
- **0-19 (F)**: Critical - Complete rewrite recommended

---

## Dimension 1: Clarity (0-10)

**Definition**: How easy is the code to read and understand?

### Scoring Rubric

**10 - Exceptional**:
- All variables and functions have descriptive, self-documenting names
- Code reads like prose, intention is immediately clear
- No mental overhead to understand what code does
- Minimal comments needed because code is self-explanatory
- Consistent naming conventions throughout

**8-9 - Excellent**:
- Most names are descriptive and clear
- Code structure follows logical flow
- Some comments for complex logic
- Minor naming inconsistencies

**6-7 - Good**:
- Generally clear names, few generic variables
- Code can be understood with some effort
- Comments help but could be more comprehensive
- Some inconsistency in naming style

**4-5 - Fair**:
- Mix of clear and unclear names (x, temp, data)
- Requires reading multiple times to understand
- Comments are sparse or outdated
- Inconsistent naming conventions

**2-3 - Poor**:
- Many generic names (a, b, x, temp)
- Logic is convoluted and hard to follow
- Comments missing where needed
- Inconsistent or misleading names

**0-1 - Critical**:
- Single-letter variables everywhere
- Code is virtually unreadable
- No comments or misleading comments
- Names contradict actual behavior

### Key Indicators

**Positive**:
- `calculateUserTaxAmount()` instead of `calc()`
- `isUserEligibleForDiscount` instead of `check()`
- `const MAX_RETRIES = 3` instead of magic number
- Early returns to reduce nesting

**Negative**:
- Generic names: `data`, `temp`, `x`, `result`
- Abbreviations: `usr`, `calc`, `proc`
- Deep nesting (> 3 levels)
- Long functions (> 50 lines) without clear sections

---

## Dimension 2: Structure (0-10)

**Definition**: How well is the code organized and modular?

### Scoring Rubric

**10 - Exceptional**:
- Perfect modularity, each module has single responsibility
- Clear separation of concerns
- Dependencies are minimal and explicit
- Code is DRY, zero duplication
- Logical file and folder structure

**8-9 - Excellent**:
- Good modular design with occasional coupling
- Most concerns are separated
- Minimal duplication (< 5%)
- Clear module boundaries

**6-7 - Good**:
- Reasonable organization with some issues
- Some tight coupling between modules
- Moderate duplication (5-15%)
- Could benefit from better separation

**4-5 - Fair**:
- Poor organization, God objects/functions
- Significant coupling
- Noticeable duplication (15-30%)
- Mixed concerns within modules

**2-3 - Poor**:
- Monolithic structure, everything in few files
- High coupling, hard to change anything
- Heavy duplication (30-50%)
- No clear separation of concerns

**0-1 - Critical**:
- Complete spaghetti code
- Everything interdependent
- Massive duplication (> 50%)
- No discernible structure

### Key Indicators

**Positive**:
- Single Responsibility Principle followed
- Functions < 30 lines on average
- Classes < 300 lines
- Clear dependency direction (no circular deps)
- Shared code extracted to utilities

**Negative**:
- God classes/functions (> 500 lines)
- Circular dependencies
- Code duplication across files
- Mixed layers (UI + business logic + data access)

---

## Dimension 3: Examples (0-10)

**Definition**: Quality and coverage of documentation and examples

### Scoring Rubric

**10 - Exceptional**:
- Comprehensive API documentation
- Multiple usage examples for all public APIs
- Edge cases documented
- Integration examples provided
- Updated with code changes

**8-9 - Excellent**:
- Good API documentation
- Examples for most common use cases
- Some edge case documentation
- Generally up-to-date

**6-7 - Good**:
- Basic API documentation
- Examples for main use cases
- Limited edge case coverage
- Minor outdated sections

**4-5 - Fair**:
- Sparse documentation
- Few examples, only happy path
- No edge case coverage
- Some outdated information

**2-3 - Poor**:
- Minimal documentation
- Examples missing or trivial
- Outdated or incorrect examples
- No edge case information

**0-1 - Critical**:
- No documentation
- No examples
- Code is undiscoverable without reading source

### Key Indicators

**Positive**:
- JSDoc/docstrings for all public APIs
- README with quickstart examples
- Code comments for complex logic
- Integration examples in tests
- Changelog maintained

**Negative**:
- No API documentation
- Comments only say what code does (redundant)
- Outdated examples
- No usage guidance
- Missing README

---

## Dimension 4: Trigger Detection (0-10)

**Definition**: How well does the code handle edge cases and error conditions?

### Scoring Rubric

**10 - Exceptional**:
- All edge cases identified and handled
- Comprehensive error handling with recovery
- Input validation at all boundaries
- Clear error messages with actionable guidance
- Graceful degradation

**8-9 - Excellent**:
- Most edge cases handled
- Good error handling with some recovery
- Input validation present
- Helpful error messages

**6-7 - Good**:
- Common edge cases handled
- Basic error handling (try-catch)
- Some input validation
- Generic error messages

**4-5 - Fair**:
- Few edge cases handled
- Inconsistent error handling
- Limited input validation
- Vague error messages

**2-3 - Poor**:
- Edge cases ignored
- Minimal error handling
- No input validation
- Error messages unhelpful or missing

**0-1 - Critical**:
- No edge case handling
- No error handling (will crash)
- No validation (accepts anything)
- Silent failures

### Key Indicators

**Positive**:
- Null/undefined checks
- Array bounds checking
- Division by zero checks
- Try-catch around external calls
- Input validation with clear error messages

**Negative**:
- Assumes inputs are always valid
- No null checks
- Array access without bounds check
- Uncaught exceptions
- Silent failures (errors swallowed)

---

## Dimension 5: Best Practices (0-10)

**Definition**: Adherence to language-specific and general best practices

### Scoring Rubric

**10 - Exceptional**:
- Follows all language idioms
- Security best practices applied
- Performance optimizations where appropriate
- Proper concurrency/async handling
- Modern language features used appropriately

**8-9 - Excellent**:
- Follows most best practices
- Good security awareness
- Reasonable performance
- Async handling mostly correct

**6-7 - Good**:
- Follows common practices
- Some security considerations
- Acceptable performance
- Basic async handling

**4-5 - Fair**:
- Mix of good and poor practices
- Security gaps
- Performance issues
- Async patterns problematic

**2-3 - Poor**:
- Ignores best practices
- Security vulnerabilities
- Significant performance issues
- Async handling incorrect

**0-1 - Critical**:
- Anti-patterns everywhere
- Critical security flaws
- Unusable performance
- Fundamentally broken async

### Key Indicators

**Positive**:
- Immutable data structures where appropriate
- Pure functions (no side effects)
- Proper async/await usage
- Security: input sanitization, parameterized queries
- Resource cleanup (finally blocks, context managers)

**Negative**:
- Mutable state everywhere
- Global variables
- Callback hell
- SQL injection vulnerabilities
- Resource leaks

---

## Dimension 6: Maintainability (0-10)

**Definition**: How easy is the code to modify, test, and extend?

### Scoring Rubric

**10 - Exceptional**:
- Trivial to add features
- 90%+ test coverage with quality tests
- Zero technical debt
- Changes are isolated, no ripple effects
- Comprehensive test suite runs fast (< 1 min)

**8-9 - Excellent**:
- Easy to add features
- 70-89% test coverage
- Minimal technical debt
- Changes have limited ripple effects
- Good test suite (< 5 min)

**6-7 - Good**:
- Moderate difficulty to add features
- 50-69% test coverage
- Some technical debt
- Changes may affect multiple areas
- Adequate test suite (< 15 min)

**4-5 - Fair**:
- Difficult to add features without breaking things
- 30-49% test coverage
- Significant technical debt
- Changes cause widespread issues
- Slow or unreliable tests

**2-3 - Poor**:
- Very difficult to modify
- 10-29% test coverage
- Heavy technical debt
- Fear of changing anything
- Tests rarely run or are broken

**0-1 - Critical**:
- Impossible to modify safely
- < 10% test coverage
- Overwhelming technical debt
- Every change breaks something
- No tests or tests don't work

### Key Indicators

**Positive**:
- High test coverage (unit + integration)
- Tests are fast and reliable
- CI/CD pipeline in place
- Clear interfaces and contracts
- Easy to mock dependencies

**Negative**:
- Low test coverage
- Flaky tests
- No CI/CD
- Tight coupling makes testing hard
- Changes require touching many files

---

## Combined Scoring Examples

### Example 1: Excellent Code (Score: 56/60)

```javascript
/**
 * Calculates the total price with tax and discount applied.
 * @param {number} basePrice - Original price before adjustments
 * @param {number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @param {number} discountPercentage - Discount as percentage (e.g., 10 for 10%)
 * @returns {number} Final price with tax and discount
 * @throws {Error} If inputs are invalid
 */
function calculateFinalPrice(basePrice, taxRate, discountPercentage) {
  // Validate inputs
  if (basePrice < 0 || taxRate < 0 || discountPercentage < 0 || discountPercentage > 100) {
    throw new Error('Invalid input: prices and rates must be non-negative, discount must be 0-100');
  }

  const discountAmount = basePrice * (discountPercentage / 100);
  const priceAfterDiscount = basePrice - discountAmount;
  const taxAmount = priceAfterDiscount * taxRate;
  const finalPrice = priceAfterDiscount + taxAmount;

  return parseFloat(finalPrice.toFixed(2));
}
```

**Scores**:
- Clarity: 10 (clear names, logical flow)
- Structure: 9 (single responsibility, well-organized)
- Examples: 9 (JSDoc with examples)
- Trigger Detection: 10 (comprehensive validation)
- Best Practices: 9 (proper error handling, immutable)
- Maintainability: 9 (easily testable)

**Total**: 56/60 (A)

---

### Example 2: Poor Code (Score: 18/60)

```javascript
function calc(p, t, d) {
  var x = p - (p * d / 100);
  var y = x + (x * t);
  return y;
}
```

**Scores**:
- Clarity: 2 (cryptic names)
- Structure: 4 (too simple to be wrong, but not modular)
- Examples: 0 (no documentation)
- Trigger Detection: 1 (no validation, will fail on bad input)
- Best Practices: 3 (uses var, no error handling)
- Maintainability: 2 (impossible to test without docs)

**Total**: 12/60 (F)

---

## Weighting Guidelines

Not all dimensions are equally important for all projects:

**API Libraries**: Examples (15%), Maintainability (20%), Structure (20%)
**Backend Services**: Best Practices (20%), Trigger Detection (20%)
**Frontend UI**: Clarity (20%), Maintainability (15%)
**Scripts/Tools**: Clarity (15%), Trigger Detection (20%)

Adjust focus based on context while maintaining holistic view.
