---
name: electron-driver
description: E2E Testing & Automation for Electron Apps (Playwright)
model: sonnet
---

# Electron Driver Skill

**The standard tool for End-to-End (E2E) Verification of Electron Applications.**

Use this skill when you need to:
- **Verify UI functionality** (clicking buttons, checking text, form submission).
- **Run automated regression tests** on a packaged or local Electron app.
- **Drive the application** to reproduce bugs or set up state.
- **Inspect** the DOM and console of a running Electron process.

Supports two robust modes: **Launch** (Clean E2E Test) and **Attach** (Live Debugging).

- **Launch**: Start a new Electron instance with a controlled environment.
- **Attach**: Connect to an existing process via CDP (requires `--remote-debugging-port`).
- **Inspect**: Smartly find the main window (ignoring DevTools).
- **Interact**: Click, type, and verify using modern Playwright Locators.

## Prerequisites

1.  **Playwright**: `npm install playwright-core` (locally preferred) or `npm install -g playwright-core`.
2.  **Electron Executable**:
    - For **Launch**: Path to the Electron executable (e.g., `node_modules/.bin/electron` or the packaged app).
    - For **Attach**: The target app MUST be running with `--remote-debugging-port=<port>`.

## Strategy Selection

| Mode | Use Case | Pros | Cons |
|------|----------|------|------|
| **Launch** | Automated tests, reproducible tasks | Clean env, no port conflicts, auto-close | Slower start, loses current app state |
| **Attach** | Debugging current session, "Drive my app" | Preserves state, instant feedback | Complex setup (ports), fragile |

## Usage

### 1. Launch Mode (Recommended)

Create a script that launches the app.

**File:** `test-driver.cjs` (Use `.cjs` to avoid ESM/CJS issues)
```javascript
const { _electron: electron } = require('playwright-core');

(async () => {
  // Launch the app
  // args: pointing to main.js or the packaged app executable
  const app = await electron.launch({
    args: ['.'], // Or path to executable
    env: { ...process.env, NODE_ENV: 'development' }
  });

  try {
    // Smart Window Find (ignoring DevTools)
    const page = await app.firstWindow();
    if (page.url().startsWith('devtools://')) {
       // Loop to find real window if first one is devtools
       // (Logic typically handled by waiting for first non-devtools window)
    }
    
    console.log(`Title: ${await page.title()}`);

    // --- ACTION LOGIC ---
    // Modern Locator API
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Welcome')).toBeVisible(); // requires @playwright/test runner or stand-alone expect
    
    // Simple wait (if not using expect)
    await page.locator('.status').waitFor();
    // --------------------

  } catch (err) {
    console.error(err);
  } finally {
    // Close app
    await app.close();
  }
})();
```

### 2. Attach Mode (Debugging)

**Pre-check**: Ensure app is running with `--remote-debugging-port=9222` (or check console for actual port).

**File:** `attach-driver.cjs`
```javascript
const { chromium } = require('playwright-core');

(async () => {
  try {
    // Connect to CDP
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    
    // Find the right page (Filter out DevTools)
    const context = browser.contexts()[0];
    const pages = context.pages();
    const page = pages.find(p => !p.url().startsWith('devtools://'));

    if (!page) throw new Error('No valid app window found');

    // --- ACTION LOGIC ---
    await page.locator('#submit-btn').click();
    // --------------------

    await browser.close(); // Disconnects (does not kill app)
  } catch (e) {
    console.error(e);
  }
})();
```

## Playwright Modern Cheatsheet

- **Locators (Preferred)**:
    - `page.getByRole('button', { name: 'Save' })`
    - `page.getByText('Hello World')`
    - `page.getByPlaceholder('Email')`
    - `page.locator('.css-class')`
- **Actions**:
    - `await locator.click()`
    - `await locator.fill('text')`
- **Waiting**:
    - ❌ `await page.waitForSelector(...)` (Old)
    - ✅ `await locator.waitFor()` (Explicit)
    - ✅ `await locator.click()` (Auto-waits)

## Troubleshooting

- **ESM Error**: `SyntaxError: Cannot use import statement...` -> Save file as `.mjs` or change project type. **Recommendation**: Always save temp scripts as `.cjs` and use `require`.
- **DevTools Window**: If the script interacts with the inspector instead of the app, check the window filtering logic.
- **Port Conflict**: If 9222 is busy, try a different port in Launch args or Attach URL.
