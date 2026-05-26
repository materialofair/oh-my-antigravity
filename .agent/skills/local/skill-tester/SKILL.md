---
name: skill-tester
description: Tests Codex skill functionality with TDD approach, verifying skills work correctly through automated test scenarios and validation
version: 0.1.0
source: fork
checksum: 30a8bde2676e801fa267eeef9a05d92fbab7a79a0105470502a63ae8e0c075ba
updated_at: 2026-02-11T09:29:29+08:00
intent: skill-management
layer: meta
---


# Skill Tester

Test-driven development tool for Codex skills. Verifies skill functionality, validates outputs, and ensures skills work correctly before distribution.

## Capabilities

- **Functional Testing**: Tests if skills produce expected outputs for given inputs
- **Trigger Testing**: Verifies skills trigger when they should
- **Regression Testing**: Ensures changes don't break existing functionality
- **Integration Testing**: Tests skills work together correctly
- **Performance Testing**: Measures skill execution time and resource usage
- **TDD Workflow**: Write tests first, then validate skill meets requirements
- **Test Coverage Analysis**: Identifies untested skill capabilities
- **Automated Test Generation**: Creates test cases from skill examples

## TDD for Skills

### Red-Green-Refactor for Skills

**Red Phase**: Write test showing skill doesn't work yet
```
Test: "Skill should calculate P/E ratio from price and EPS"
Result: ❌ Skill doesn't have this capability
```

**Green Phase**: Implement skill to pass test
```
Test: "Skill should calculate P/E ratio from price and EPS"
Result: ✅ Skill correctly calculates 15.5 from price=$100, EPS=$6.45
```

**Refactor Phase**: Improve skill quality
```
Test: "Skill should handle edge cases (zero EPS, negative values)"
Result: ✅ All edge cases handled correctly
```

## Input Requirements

**Basic Test**:
- Skill name or path
- Test scenario (what should happen)
- Expected outcome

**Comprehensive Test Suite**:
- Skill path
- Test cases (inputs + expected outputs)
- Success criteria
- Edge cases to verify

**Example Test Case**:
```json
{
  "skill": "financial-analyzer",
  "test": "Calculate P/E ratio",
  "input": {"price": 100, "eps": 6.45},
  "expected_output": {"pe_ratio": 15.5},
  "tolerance": 0.1
}
```

## Output Formats

**Quick Test Result**:
```
Testing: financial-analyzer
Test: "Calculate P/E ratio"
Result: ✅ PASS (output: 15.5, expected: 15.5)
```

**Detailed Test Report**:
```
=== Skill Test Report ===

Skill: financial-analyzer
Tests Run: 12
Passed: 10 ✅
Failed: 2 ❌
Coverage: 83%

Failures:
1. ❌ Edge case: Zero EPS
   Input: {price: 100, eps: 0}
   Expected: Error or infinity
   Got: Division error

2. ❌ Negative values
   Input: {price: -50, eps: 5}
   Expected: Error message
   Got: Calculated -10

Recommendations:
- Add error handling for zero/negative values
- Validate inputs before calculation
- Add edge case tests to skill documentation
```

**Test Coverage Map**:
```
Capability Coverage:

✅ Calculate P/E ratio - 100% (4/4 tests pass)
✅ Calculate ROE - 100% (3/3 tests pass)
⚠️  Calculate debt ratio - 67% (2/3 tests pass, missing edge case)
❌ DCF valuation - 0% (Not implemented)

Overall: 75% coverage
```

## Test Types

### 1. Trigger Tests
**Purpose**: Verify skill triggers when it should

**Test**: "Financial-analyzer should trigger for 'calculate P/E ratio'"
```
Query: "Calculate P/E ratio for this stock"
Expected: financial-analyzer skill activates
Result: ✅ Triggered correctly
```

### 2. Functional Tests
**Purpose**: Verify correct outputs

**Test**: "Should calculate correct P/E ratio"
```
Input: price=100, eps=6.45
Expected: 15.5
Result: ✅ Output: 15.504 (within tolerance)
```

### 3. Edge Case Tests
**Purpose**: Handle unusual inputs

**Test**: "Should handle zero EPS gracefully"
```
Input: price=100, eps=0
Expected: Error message or infinity with warning
Result: ❌ Division error (needs fix)
```

### 4. Integration Tests
**Purpose**: Skills work together

**Test**: "Quality-analyzer should use skill-tester"
```
Scenario: Analyze skill quality
Expected: Skill-tester used to verify examples
Result: ✅ Integration works
```

### 5. Performance Tests
**Purpose**: Execution within acceptable time

**Test**: "Should complete analysis within 5 seconds"
```
Input: Large dataset
Expected: < 5 seconds
Result: ✅ 2.3 seconds
```

## How to Use

**Quick Test**:
```
"Test if financial-analyzer calculates P/E ratio correctly"
"Verify code-review skill works for pull requests"
"Test skill-quality-analyzer on itself"
```

**Comprehensive Test Suite**:
```
"Run full test suite on financial-analyzer with all edge cases"
"Test all capabilities of aws-solution-architect skill"
```

**TDD Workflow**:
```
"Write tests for a new skill that should calculate financial ratios"
"Create test cases for photo-enhancer before implementing it"
```

**Regression Testing**:
```
"Test if my skill changes broke anything"
"Run regression tests on code-review after updates"
```

## Test Case Structure

```yaml
test_cases:
  - name: "Basic P/E calculation"
    input:
      price: 100
      eps: 6.45
    expected_output:
      pe_ratio: 15.5
    tolerance: 0.1
    priority: HIGH

  - name: "Zero EPS edge case"
    input:
      price: 100
      eps: 0
    expected_error: "EPS cannot be zero"
    priority: CRITICAL

  - name: "Negative price edge case"
    input:
      price: -50
      eps: 5
    expected_error: "Price must be positive"
    priority: HIGH
```

## Test Coverage Goals

| Skill Type | Target Coverage |
|-------------|----------------|
| Critical (financial, security) | 95%+ |
| Production (widely used) | 80%+ |
| Experimental (new features) | 60%+ |
| Utility (simple tools) | 50%+ |

## Integration with Development Workflow

### Phase 1: TDD (Before Implementation)
```
1. Write test cases based on requirements
2. Document expected outputs
3. Run tests (all should fail - RED phase)
4. Implement skill
5. Run tests (should pass - GREEN phase)
6. Refactor and optimize
```

### Phase 2: Continuous Testing
```
1. Run tests after every skill change
2. Add tests for new capabilities
3. Update tests when requirements change
4. Track coverage over time
```

### Phase 3: Pre-Release
```
1. Full test suite (100% of capabilities)
2. Edge case validation
3. Performance benchmarks
4. Integration tests
5. User acceptance testing
```

## Best Practices

1. **Write Tests First**: TDD approach prevents bugs
2. **Test Edge Cases**: Zero, negative, null, empty, very large values
3. **Use Realistic Data**: Test with actual use case data
4. **Automate Testing**: Run tests automatically on changes
5. **Track Coverage**: Aim for 80%+ for production skills
6. **Document Test Results**: Keep test reports for regression checking
7. **Test Integrations**: Verify skills work together
8. **Performance Benchmarks**: Set and monitor time limits

## Common Test Patterns

### Pattern 1: Golden Master Testing
```
Input: Known input
Expected: Known correct output (golden master)
Verify: Output matches golden master exactly
```

### Pattern 2: Property-Based Testing
```
Property: "P/E ratio should always be price / EPS"
Test: Generate random valid inputs
Verify: Formula holds for all inputs
```

### Pattern 3: Snapshot Testing
```
Input: Complex data structure
Expected: Snapshot of previous correct output
Verify: Current output matches snapshot
```

## Limitations

- **Manual Test Creation**: Tests need to be written (not fully automatic)
- **No Runtime Monitoring**: Can't test skills during actual use
- **Static Testing**: Tests predefined scenarios, not all possible inputs
- **No User Testing**: Can't test user satisfaction or UX
- **Coverage Gaps**: Can't guarantee 100% coverage of all code paths

## When NOT to Use This Skill

- **Quick Experiments**: Testing adds overhead for throwaway skills
- **Debugging**: Use skill-debugger for trigger/discovery issues
- **Documentation**: Use skill-doc-generator for doc generation
- **Quality Analysis**: Use skill-quality-analyzer for static analysis

## Success Criteria

A well-tested skill should:
- ✅ Pass 100% of critical test cases
- ✅ Handle all documented edge cases
- ✅ Work within performance limits
- ✅ Integrate correctly with other skills
- ✅ Have 80%+ test coverage for production skills

## Example Test Session

```
User: "Test the financial-analyzer skill"

Claude: "Running test suite for financial-analyzer...

Test Results:
✅ Basic calculations (4/4 passed)
✅ Error handling (3/3 passed)
⚠️  Edge cases (2/3 passed)
   - Failed: Handling of extremely large numbers

✅ Integration tests (2/2 passed)
✅ Performance (under 3 seconds)

Overall: 11/12 tests passed (92%)

Recommendation: Fix large number handling before production release.
Would you like detailed failure analysis?"
```

## Related Skills

- Works with **skill-quality-analyzer**: Test quality after static analysis
- Works with **skill-debugger**: Test after fixing trigger issues
- Works with **skill-doc-generator**: Test examples in generated docs
- Complements **TDD Guard**: Enforces test-first development
