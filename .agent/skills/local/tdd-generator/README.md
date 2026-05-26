# TDD Test Generator - Quick Start Guide

## Quick Start

Just say any trigger word:
- "生成测试" / "Generate test"
- "如何测试" / "How to test"
- "TDD"
- "Playwright Test Agents"

Claude will automatically load this skill!

## Three Usage Scenarios

### Scenario 1: Unit Test Generation (Easiest)
Input: Paste your function code
Output: Complete Vitest test suite
Time: < 30 seconds

### Scenario 2: Component Test Generation
Input: Paste React component
Output: React Testing Library tests with user interactions
Time: < 1 minute

### Scenario 3: E2E Tests + Playwright Test Agents (Most Powerful)

Three AI Agents working for you:
1. Planner Agent - Explores app, generates test plans
2. Generator Agent - Creates Playwright tests from plans
3. Healer Agent - Auto-fixes broken tests

Setup commands:
```bash
npx playwright test --init-agents
npx playwright test --agent=planner
npx playwright test --agent=generator
npx playwright test --agent=healer --repeat
```

## Example: Quick Unit Test

**You say**: "Generate test for this function"

**Claude generates**:
```typescript
import { describe, it, expect } from 'vitest';

describe('formatMessage', () => {
  it('should trim whitespace', () => {
    expect(formatMessage('  hello  ')).toBe('hello');
  });
  
  it('should replace multiple spaces', () => {
    expect(formatMessage('hello    world')).toBe('hello world');
  });
});
```

Run: `pnpm test formatMessage.test.ts`

## TDD Workflow Support

### Red-Green-Refactor Cycle

🔴 **Red**: Write failing test (Claude generates)
🟢 **Green**: Implement minimal code to pass
🔵 **Refactor**: Optimize safely with test protection

## Key Features

- ✅ Smart test generation from code analysis
- ✅ TDD workflow guidance
- ✅ Playwright Test Agents integration
- ✅ Auto-healing broken tests
- ✅ Best practices enforcement

## Ready to Start?

Just say:
```
"Generate test for my formatMessage function"
```

Or:
```
"Use Playwright Test Agents for E2E testing"
```

Claude will do the rest! 🚀
