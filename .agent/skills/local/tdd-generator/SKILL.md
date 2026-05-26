---
name: TDD Test Generator
description: AI-powered test-driven development assistant. Generates unit tests (Vitest), component tests (React Testing Library), and E2E tests with Playwright Test Agents integration.
version: 0.1.0
source: fork
checksum: c9266dfb5cf94d28eacb41ae3e5f00e0829d7eaf1d4bba44ae2da4c9b58ea6ad
updated_at: 2026-02-06T15:19:11+08:00
intent: tdd
layer: quality
---


# TDD Test Generator Skill

## When to Use This Skill

Automatically invoke when user mentions:
- "生成测试", "写测试用例", "TDD"
- "如何测试这个组件/函数"
- "Playwright Test Agents", "自动化测试"
- Keywords: test, 测试, TDD, vitest, playwright


## What This Skill Does

**TDD Test Generator** provides:
1. **Smart Test Generation**: Auto-generate Vitest unit tests from code
2. **Component Testing**: Generate React Testing Library tests
3. **E2E Integration**: Deep integration with Playwright Test Agents
4. **TDD Workflow**: Support complete Red-Green-Refactor cycle
5. **Auto-Healing**: Leverage Playwright Healer Agent to auto-fix broken tests

## Core Features

### Level 1: Unit Tests (Vitest)

For: utility functions, pure logic, business rules

**Template**:
```typescript
import { describe, it, expect } from 'vitest';

describe('functionName', () => {
  it('should handle normal case', () => {
    expect(functionName(input)).toBe(expected);
  });
  
  it('should handle edge cases', () => {
    expect(functionName('')).toBe(defaultValue);
  });
});
```

### Level 2: Component Tests (React Testing Library)

For: UI components, user interactions, state management

**Template**:
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('ComponentName', () => {
  it('renders and handles interaction', async () => {
    const user = userEvent.setup();
    render(<Component />);
    await user.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Level 3: E2E Tests + Playwright Test Agents

**Three AI Agents Working Together**:

1. **Planner Agent** - Explores app, generates test plans (Markdown)
2. **Generator Agent** - Converts plans to Playwright code  
3. **Healer Agent** - Auto-fixes broken tests, updates selectors

**Setup Commands**:
```bash
# Initialize Playwright Test Agents
npx playwright test --init-agents

# Start agent loop
npx playwright test --agent=planner
npx playwright test --agent=generator  
npx playwright test --agent=healer --repeat
```

**Project Structure**:
```
.github/workflows/agents.yml  # Agent definitions
specs/                        # Test plans (Markdown)
tests/                        # Generated tests
  seed.spec.ts                # Seed test
playwright.config.ts
```

## Instructions

### Scenario 1: Generate Unit Test

**User**: "Generate test for this function"

**Your Actions**:
1. Analyze code (function/component/flow)
2. Identify test points (I/O, edge cases, errors)
3. Generate complete Vitest test suite
4. Provide run commands

**Output Format**:
```markdown
## 🧪 Generated Unit Test

### Test File: `functionName.test.ts`
[Generated test code]

### Covered Scenarios:
- ✅ Normal input/output
- ✅ Edge cases
- ✅ Error handling

### Run Test:
\`pnpm test functionName.test.ts\`
```

### Scenario 2: Generate Component Test

**User**: "How to test ChatInput component?"

**Your Actions**:
1. Analyze component props and events
2. Identify user interaction flow
3. Generate React Testing Library tests
4. Include mocks and async handling

### Scenario 3: E2E with Playwright Agents

**User**: "Use Playwright Test Agents for E2E"

**Your Actions**:

**Step 1: Project Setup**
```bash
npm install -D @playwright/test
npx playwright install
npx playwright test --init-agents
```

**Step 2: Create Seed Test**
```typescript
// tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test('seed - setup app state', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Setup initial state
  await expect(page).toHaveURL('/dashboard');
});
```

**Step 3: Start AI Agent Loop**
```bash
# Planner explores and generates plans
npx playwright test --agent=planner

# Generator creates tests from plans
npx playwright test --agent=generator

# Healer monitors and fixes failures
npx playwright test --agent=healer --repeat
```

**Output Status**:
```markdown
## 🤖 Playwright Test Agents Running

### Current Status:
- ✅ Planner: Generated 3 test plans
- ✅ Generator: Created 3 test files
- 🔄 Healer: Monitoring...

### Generated Tests:
1. tests/user-login.spec.ts
2. tests/create-post.spec.ts
3. tests/search-functionality.spec.ts

### View Plans: \`cat specs/*.md\`
### Run Tests: \`npx playwright test\`
```

## TDD Workflow Support

### Red-Green-Refactor Cycle

**User wants TDD workflow**

**Your Guidance**:
```markdown
## 🔴 Phase 1: Red (Write Failing Test)
[Generate test with expected behavior]
Run: \`pnpm test --watch\`
Expected: ❌ All tests fail

## 🟢 Phase 2: Green (Minimal Implementation)
Implement feature to pass tests
Expected: ✅ All tests pass

## 🔵 Phase 3: Refactor (Optimize)
Safely refactor with test protection
Expected: ✅ Tests still pass
```

## Best Practices

When generating tests, ensure:
1. **Semantic queries** - Use getByRole, getByLabelText
2. **Test behavior** - Not implementation details
3. **Async handling** - Proper waitFor, findBy*
4. **Mock externals** - Only APIs and services
5. **One test, one thing** - Keep tests focused
6. **Descriptive names** - Clear test descriptions

## Project Integration Checklist

Before generating tests, check:
- [ ] Vitest installed
- [ ] React Testing Library configured
- [ ] @testing-library/user-event installed
- [ ] Playwright installed (for E2E)
- [ ] test scripts in package.json
- [ ] vitest.config.ts configured

**Auto-install if missing**:
```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event jsdom
pnpm add -D @playwright/test
```

## Troubleshooting

### Issue 1: Vitest "Cannot find module"
**Fix**: Check vitest.config.ts path aliases

### Issue 2: RTL "Unable to find role"  
**Fix**: Use screen.debug(), check element rendered

### Issue 3: Playwright Agents won't start
**Fix**: 
```bash
npm install -D @playwright/test@latest
npx playwright install
npx playwright test --init-agents
```

## Examples

### Example 1: Quick Unit Test
**User**: "Test formatMessage function"
**Output**: Complete test suite with edge cases

### Example 2: TDD Workflow  
**User**: "TDD ChatInput component"
**Output**: Red-Green-Refactor guidance

### Example 3: E2E Automation
**User**: "Playwright Agents for login"
**Output**: Full agent setup and monitoring

## Integration with Other Skills

- **Agent-KB**: Query testing best practices
- **Quality-Check**: Analyze test coverage
- **Project-Analyze**: Identify critical modules to test

## Important Notes

- **Test-first mindset**: Guide users to understand TDD value
- **Pragmatism**: Focus on core business, not 100% coverage
- **Automation**: Maximize Playwright Agents to reduce manual work
- **Maintainability**: Generate easy-to-maintain tests
- **Education**: Explain principles, not just generate code

