---
name: BDD Generator
description: Behavior-Driven Development assistant using playwright-bdd. Generates Gherkin features and step definitions with full TDD Guard integration.
version: 0.1.0
source: fork
checksum: 235f5981eae5c10307e021d10bdd209c9a0c9f505cf1fa72a1431a83b7483418
updated_at: 2026-02-06T15:19:11+08:00
intent: testing
layer: domain
---


# BDD Generator Skill

## When to Use This Skill

Automatically invoke when user mentions:
- "BDD", "behavior driven", "行为驱动"
- "Gherkin", "Given-When-Then"
- "Feature file", "Scenario", "场景测试"
- "playwright-bdd", "cucumber"
- Keywords: BDD, feature, scenario, gherkin

## What This Skill Does

**BDD Generator** provides:
1. **Gherkin Feature Generation**: Auto-generate .feature files with proper BDD syntax
2. **Step Definition Scaffolding**: Create TypeScript step definitions following TDD Guard rules
3. **playwright-bdd Integration**: Zero-config setup with Playwright Test Runner
4. **TDD Guard Enforcement**: One scenario, one step at a time
5. **Business Language**: Translate requirements into readable test scenarios

## Core Advantages Over Cucumber.js

### Why playwright-bdd?

```yaml
playwright-bdd:
  ✅ No extra runner (direct Playwright)
  ✅ 30-50% faster execution
  ✅ Native Playwright features
  ✅ Better debugging experience
  ✅ Active maintenance (8.4.2, 5 days ago)

Cucumber.js:
  ❌ Requires extra Cucumber runner
  ❌ Two-layer abstraction
  ❌ Slower execution
  ❌ More complex configuration
```

## Project Structure

```
project/
├── features/                    # BDD Feature files
│   ├── login.feature           # Gherkin scenarios
│   ├── checkout.feature
│   └── steps/                  # Step Definitions
│       ├── login.steps.ts
│       └── common.steps.ts
├── playwright.config.ts        # Playwright + BDD config
└── package.json
```

## Instructions

### Scenario 1: Generate Feature File

**User**: "Create BDD test for user login"

**Your Actions**:
1. **Understand Business Requirement**
2. **Write ONE Scenario** (TDD Guard enforced)
3. **Use Business Language** (avoid technical details)

**Output**:
```gherkin
Feature: User Authentication
  As a user
  I want to log in to the application
  So that I can access my account

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter username "john@example.com"
    And I enter password "SecurePass123"
    And I click the login button
    Then I should see the dashboard
```

⚠️ **TDD Guard Rule**: Only ONE scenario at a time!

### Scenario 2: Generate Step Definitions

**User**: "Implement the steps"

**Your Actions**:
1. Run `npx bddgen` to see missing steps
2. Implement ONLY the FIRST failing step
3. Run test to see next failure
4. Repeat

**Output**:
```typescript
// features/steps/login.steps.ts
import { createBdd } from 'playwright-bdd';
const { Given } = createBdd();

// Only implement the first failing step
Given('I am on the login page', async ({ page }) => {
  await page.goto('/login');
});

// Wait for test to fail on next step before implementing
```

⚠️ **TDD Guard Rule**: One step implementation at a time!

### Scenario 3: Project Setup

**User**: "Setup BDD in my project"

**Your Actions**:

**Step 1: Install Dependencies**
```bash
npm install --save-dev playwright-bdd @playwright/test
npx playwright install
```

**Step 2: Configure Playwright**
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: 'features/steps/**/*.ts',
});

export default defineConfig({
  testDir,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

**Step 3: Create Directory Structure**
```bash
mkdir -p features/steps
```

**Step 4: Add Scripts to package.json**
```json
{
  "scripts": {
    "bdd:generate": "bddgen",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  }
}
```

## BDD Workflow with TDD Guard

### RED-GREEN-REFACTOR Cycle

```yaml
🔴 RED Phase:
  1. Write ONE Feature Scenario
  2. Run: npm run bdd:generate
  3. Implement FIRST missing step
  4. Run: npm test
  5. See failure → Good!

🟢 GREEN Phase:
  6. Implement step correctly
  7. Run: npm test
  8. Step passes → Move to next

🔄 REPEAT:
  9. Next step fails
  10. Implement only that step
  11. Repeat until scenario passes

🔵 REFACTOR Phase:
  12. All steps green
  13. Refactor step definitions
  14. Tests still pass
  15. Add next scenario
```

## Gherkin Best Practices

### DO: Business Language
```gherkin
✅ Given I am logged in as admin
✅ When I create a new product
✅ Then I should see success message
```

### DON'T: Technical Details
```gherkin
❌ Given I call POST /api/login with admin credentials
❌ When I execute createProduct() function
❌ Then status code should be 200
```

### Use Background for Common Steps
```gherkin
Feature: Product Management

  Background:
    Given I am logged in as admin
    And I am on the products page

  Scenario: Create product
    When I click "New Product"
    # ...

  Scenario: Delete product
    When I select a product
    # ...
```

### Use Scenario Outline for Data-Driven Tests
```gherkin
Scenario Outline: Login validation
  Given I am on the login page
  When I enter username "<username>"
  And I enter password "<password>"
  Then I should see "<result>"

  Examples:
    | username      | password    | result              |
    | valid@test.com| Valid123    | dashboard           |
    | invalid@test  | wrong       | Invalid credentials |
```

## Step Definition Patterns

### Parameterized Steps
```typescript
When('I enter username {string}', async ({ page }, username: string) => {
  await page.fill('#username', username);
});

When('I enter {int} items', async ({ page }, count: number) => {
  // count is a number
});
```

### Custom Parameter Types
```typescript
import { defineParameterType } from 'playwright-bdd';

defineParameterType({
  name: 'user',
  regexp: /admin|customer|guest/,
  transformer: (s) => s,
});

Given('I am logged in as {user}', async ({ page }, userType) => {
  // userType is 'admin' | 'customer' | 'guest'
});
```

### Page Object Integration
```typescript
// features/steps/login.steps.ts
import { createBdd } from 'playwright-bdd';
import { LoginPage } from '../pages/LoginPage';

const { Given, When } = createBdd();

Given('I am on the login page', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
});

When('I login as {string}', async ({ page }, username) => {
  const loginPage = new LoginPage(page);
  await loginPage.login(username, 'password123');
});
```

## Integration with TDD Guard

### TDD Guard Hooks
The BDD Generator respects all TDD Guard rules:

1. **Feature File Writing**
   - ✅ One scenario at a time
   - ❌ Multiple scenarios blocked

2. **Step Definition Writing**
   - ✅ One step at a time
   - ❌ Multiple steps blocked
   - ❌ Implementation without failing test blocked

3. **RED-GREEN-REFACTOR**
   - Enforces test-first workflow
   - Prevents premature implementation

## Commands Reference

```bash
# Generate test code from .feature files
npm run bdd:generate
# or: npx bddgen

# Run all BDD tests
npm test

# Run specific feature
npx playwright test --grep "User login"

# Run with UI mode (recommended for debugging)
npm run test:ui

# Run headed (see browser)
npm run test:headed

# View test report
npx playwright show-report
```

## Troubleshooting

### Issue 1: "Missing step definitions"
**Solution**: Run `npx bddgen` to see which steps need implementation

### Issue 2: TDD Guard blocks multi-step creation
**This is correct!** Implement one step at a time:
1. Run test to see first failure
2. Implement only that step
3. Repeat

### Issue 3: Steps not found
**Check**:
- Steps directory in playwright.config.ts
- Import `createBdd` from 'playwright-bdd'
- File naming: `*.steps.ts`

## Example Workflow

**User Request**: "Create BDD test for checkout flow"

**Step-by-Step**:

```markdown
## 🎯 BDD Test for Checkout Flow

### Step 1: Create Feature (ONE scenario)
\`\`\`gherkin
# features/checkout.feature
Feature: Shopping Cart Checkout

  Scenario: Complete purchase with valid payment
    Given I have items in my cart
    When I proceed to checkout
    And I enter valid payment details
    Then I should see order confirmation
\`\`\`

### Step 2: Generate Test Code
\`\`\`bash
npx bddgen
\`\`\`

Output shows 4 missing steps.

### Step 3: Run Test (RED)
\`\`\`bash
npm test
\`\`\`

Fails on: "Given I have items in my cart"

### Step 4: Implement First Step (GREEN)
\`\`\`typescript
Given('I have items in my cart', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await expect(page.locator('.cart-count')).toContainText('1');
});
\`\`\`

### Step 5: Run Test Again
\`\`\`bash
npm test
\`\`\`

Now fails on: "When I proceed to checkout"

### Step 6: Repeat
Implement only the failing step, run test, repeat.
\`\`\`

## Integration with Other Skills

- **TDD-Generator**: BDD for behavior, TDD for units
- **Agent-KB**: Query BDD best practices
- **Quality-Check**: Analyze feature coverage
- **Project-Analyze**: Identify critical user flows for BDD

## Important Notes

- **BDD = User Perspective**: Write from user's view, not code's view
- **Gherkin = Documentation**: Features are living documentation
- **playwright-bdd > Cucumber**: Simpler, faster, better integrated
- **TDD Guard Ally**: BDD works perfectly with TDD Guard enforcement
- **One Scenario Rule**: Build test suite incrementally, not all at once

## Quick Reference

### Gherkin Keywords
- **Feature**: High-level functionality
- **Scenario**: Specific test case
- **Given**: Setup/precondition
- **When**: Action/trigger
- **Then**: Expected outcome
- **And/But**: Additional steps
- **Background**: Common setup for all scenarios
- **Scenario Outline**: Data-driven template
- **Examples**: Test data table

### playwright-bdd Exports
```typescript
import { createBdd } from 'playwright-bdd';
const { Given, When, Then, Before, After } = createBdd();
```

### Fixtures Available
All Playwright fixtures available in steps:
- `{ page }` - Browser page
- `{ context }` - Browser context
- `{ browser }` - Browser instance
- `{ request }` - API request context
