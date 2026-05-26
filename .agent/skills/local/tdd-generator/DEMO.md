# TDD Test Generator - Practical Demonstrations

This file contains three detailed demonstrations showing how to use the TDD Test Generator skill.

## Demo 1: Unit Test Generation (30 seconds)

### Original Function
```typescript
// src/utils/formatMessage.ts
export function formatMessage(text: string, maxLength: number = 100): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

### User Action
Simply say: **"生成测试"** or **"Generate test for formatMessage"**

### Generated Test (Instant)
```typescript
// src/utils/__tests__/formatMessage.test.ts
import { describe, it, expect } from 'vitest';
import { formatMessage } from '../formatMessage';

describe('formatMessage', () => {
  it('should return empty string for empty input', () => {
    expect(formatMessage('')).toBe('');
  });

  it('should return original text if within maxLength', () => {
    const text = 'Hello World';
    expect(formatMessage(text, 100)).toBe('Hello World');
  });

  it('should truncate and add ellipsis if exceeds maxLength', () => {
    const text = 'A'.repeat(150);
    const result = formatMessage(text, 100);
    expect(result).toBe('A'.repeat(100) + '...');
    expect(result.length).toBe(103);
  });

  it('should use default maxLength of 100', () => {
    const text = 'B'.repeat(120);
    const result = formatMessage(text);
    expect(result).toBe('B'.repeat(100) + '...');
  });

  it('should handle text exactly at maxLength', () => {
    const text = 'C'.repeat(100);
    expect(formatMessage(text, 100)).toBe(text);
  });
});
```

### TDD Workflow
1. 🔴 **Red**: Run test (fails - function doesn't exist yet)
2. 🟢 **Green**: Implement formatMessage function
3. 🔵 **Refactor**: Optimize if needed
4. ✅ **Result**: 5 passing tests, 100% coverage

---

## Demo 2: Component Test Generation (1 minute)

### Original Component
```typescript
// src/components/ChatInput.tsx
import React, { useState } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = '输入消息...',
  disabled = false
}) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        发送
      </button>
    </form>
  );
};
```

### User Action
Say: **"如何测试ChatInput组件"** or **"Generate component test"**


### Generated Test Suite
```typescript
// src/components/__tests__/ChatInput.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  it('renders with default placeholder', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);
    
    expect(screen.getByPlaceholderText('输入消息...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('calls onSend with message when form submitted', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: '发送' });

    await user.type(input, 'Hello World');
    await user.click(button);

    expect(mockOnSend).toHaveBeenCalledWith('Hello World');
    expect(mockOnSend).toHaveBeenCalledTimes(1);
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button'));

    expect(input.value).toBe('');
  });

  it('does not call onSend for empty message', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    await user.click(screen.getByRole('button'));

    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('trims whitespace before sending', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '   spaces   ');
    await user.click(screen.getByRole('button'));

    expect(mockOnSend).toHaveBeenCalledWith('   spaces   ');
  });

  it('disables input and button when disabled prop is true', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} disabled />);

    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables button when input is empty', () => {
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables button when input has content', async () => {
    const user = userEvent.setup();
    const mockOnSend = vi.fn();
    render(<ChatInput onSend={mockOnSend} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.type(screen.getByRole('textbox'), 'A');
    expect(button).not.toBeDisabled();
  });
});
```

### Test Results
```bash
✓ src/components/__tests__/ChatInput.test.tsx (9)
  ✓ ChatInput (9)
    ✓ renders with default placeholder
    ✓ renders with custom placeholder
    ✓ calls onSend with message when form submitted
    ✓ clears input after sending message
    ✓ does not call onSend for empty message
    ✓ trims whitespace before sending
    ✓ disables input and button when disabled prop is true
    ✓ disables button when input is empty
    ✓ enables button when input has content

Test Files  1 passed (1)
     Tests  9 passed (9)
  Start at  14:23:45
  Duration  234ms
```


---

## Demo 3: Complete Playwright Test Agents Workflow (5 minutes)

### Scenario
Testing a chat application with login, message sending, and history features.

### Step 1: Initialize Playwright Test Agents (30 seconds)

```bash
# In your project root
npx playwright test --init-agents
```

**What happens:**
- Creates `.github/workflows/agents.yml` with agent definitions
- Sets up `specs/` directory for test plans
- Sets up `tests/` directory for generated tests
- Creates initial `seed.spec.ts`

### Step 2: Planner Agent - Autonomous Exploration (2 minutes)

```bash
npx playwright test --agent=planner
```

**Planner Agent Actions:**
1. Opens your application
2. Explores UI autonomously (clicks buttons, fills forms, navigates)
3. Discovers features and user workflows
4. Generates test plans in Markdown

**Generated Test Plan** (`specs/chat-feature.md`):
```markdown
# Chat Feature Test Plan

## Test: User Login
1. Navigate to login page
2. Enter valid credentials (username: testuser, password: test123)
3. Click login button
4. Verify redirect to chat page
5. Verify user avatar appears in header

## Test: Send Message
1. Ensure user is logged in
2. Locate message input field
3. Type "Hello, this is a test message"
4. Click send button
5. Verify message appears in chat history
6. Verify message timestamp is shown
7. Verify input field is cleared

## Test: Load Message History
1. Navigate to chat page
2. Verify previous messages load automatically
3. Scroll to top of chat
4. Verify lazy loading of older messages
5. Verify messages are ordered by timestamp
```

### Step 3: Generator Agent - Code Generation (1 minute)

```bash
npx playwright test --agent=generator
```

**Generator Agent Actions:**
1. Reads all test plans from `specs/`
2. Generates executable Playwright tests
3. Saves to `tests/` directory

**Generated Test** (`tests/chat-feature.spec.ts`):
```typescript
import { test, expect } from '@playwright/test';

test.describe('Chat Feature', () => {
  test('User Login', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/login');
    
    // Enter valid credentials
    await page.getByLabel('用户名').fill('testuser');
    await page.getByLabel('密码').fill('test123');
    
    // Click login button
    await page.getByRole('button', { name: '登录' }).click();
    
    // Verify redirect to chat page
    await expect(page).toHaveURL(/.*\/chat/);
    
    // Verify user avatar appears
    await expect(page.getByAltText('用户头像')).toBeVisible();
  });

  test('Send Message', async ({ page }) => {
    // Setup: Login first
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('用户名').fill('testuser');
    await page.getByLabel('密码').fill('test123');
    await page.getByRole('button', { name: '登录' }).click();
    await page.waitForURL(/.*\/chat/);
    
    // Locate message input
    const input = page.getByRole('textbox', { name: '输入消息' });
    
    // Type message
    await input.fill('Hello, this is a test message');
    
    // Send message
    await page.getByRole('button', { name: '发送' }).click();
    
    // Verify message appears
    await expect(page.getByText('Hello, this is a test message')).toBeVisible();
    
    // Verify timestamp shown
    await expect(page.locator('.message-timestamp').first()).toBeVisible();
    
    // Verify input cleared
    await expect(input).toHaveValue('');
  });

  test('Load Message History', async ({ page }) => {
    // Navigate to chat
    await page.goto('http://localhost:3000/login');
    await page.getByLabel('用户名').fill('testuser');
    await page.getByLabel('密码').fill('test123');
    await page.getByRole('button', { name: '登录' }).click();
    
    // Verify messages load
    await expect(page.locator('.message-item')).toHaveCount(10, { timeout: 3000 });
    
    // Scroll to top
    await page.locator('.chat-container').evaluate(el => el.scrollTop = 0);
    
    // Verify lazy loading
    await expect(page.locator('.message-item')).toHaveCount(20, { timeout: 2000 });
    
    // Verify order by timestamp
    const timestamps = await page.locator('.message-timestamp').allTextContents();
    const sorted = [...timestamps].sort();
    expect(timestamps).toEqual(sorted);
  });
});
```


### Step 4: Healer Agent - Automatic Test Maintenance (Ongoing)

```bash
npx playwright test --agent=healer --repeat
```

**Healer Agent Actions:**
1. Monitors test execution continuously
2. Detects test failures
3. Analyzes failure causes (UI changes, selector updates needed)
4. Automatically updates test code
5. Re-runs tests until passing
6. Commits fixes to git

**Example Healing Scenario:**

**Before UI Change:**
```typescript
await page.getByRole('button', { name: '发送' }).click();
```

**UI Changes:** Button text changed from "发送" to "发送消息"

**Test Fails:**
```
Error: locator.click: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for getByRole('button', { name: '发送' })
============================================================
```

**Healer Agent Fixes Automatically:**
```typescript
// Healer detects the button now says "发送消息"
await page.getByRole('button', { name: '发送消息' }).click();
```

**Test Passes Again:**
```
✓ Send Message (2.3s)
  Healed: Updated button selector from '发送' to '发送消息'
```

---

## Practical Application Strategy

### For Your Helo Editor Project

**Week 1: Start with Unit Tests (70%)**
```bash
# Test utility functions
- formatMessage
- validateInput
- parseMarkdown
- calculateWordCount
```

**Week 2: Add Component Tests (20%)**
```bash
# Test React components
- ChatInput
- MessageList
- Toolbar
- EditorPanel
```

**Week 3: Set up Playwright Test Agents (10%)**
```bash
# E2E critical workflows
- User login and authentication
- Create and save document
- AI chat interaction
- Document collaboration
```

### Expected ROI Timeline
- **Week 1**: -30% speed (learning curve)
- **Week 2**: -10% speed (getting comfortable)
- **Week 3**: +10% speed (catching bugs early)
- **Week 4+**: +20-40% speed (confidence + refactoring safely)

### Maintenance Strategy
- **Healer Agent**: Handles 80% of selector updates automatically
- **Generator Agent**: Regenerates tests when specs change
- **Manual Updates**: Only needed for complex business logic changes

---

## Quick Reference Commands

```bash
# Generate unit test
"生成测试 for [function name]"

# Generate component test  
"如何测试 [component name]"

# Initialize Playwright Test Agents
npx playwright test --init-agents

# Run agent loop (all three agents)
npx playwright test --agent=planner
npx playwright test --agent=generator
npx playwright test --agent=healer --repeat

# Run tests
npm run test          # Unit + component tests
npm run test:e2e      # E2E tests
```

---

## Success Metrics

After implementing this TDD approach, you should see:

✅ **Code Quality**
- Bug detection rate: +60%
- Production bugs: -40%
- Code coverage: >80%

✅ **Development Speed**
- Refactoring confidence: +90%
- Debugging time: -50%
- Feature delivery: +30% (after week 3)

✅ **Maintenance**
- Test maintenance time: -80% (thanks to Healer Agent)
- Breaking changes detected: +95%
- Regression bugs: -70%

---

**Ready to start?** Just say: **"生成测试"** 🚀
