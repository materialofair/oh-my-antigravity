const { chromium } = require('playwright-core');

/**
 * Electron Driver Template (Attach Mode)
 * 
 * Usage:
 * 1. Ensure Electron is running with --remote-debugging-port=<PORT>
 * 2. Set CDP_PORT env var if not 9222.
 * 3. Run with `node script.cjs`
 */

const CDP_PORT = process.env.CDP_PORT || 9222;
const CDP_URL = `http://localhost:${CDP_PORT}`;

async function run() {
  let browser;
  try {
    // 1. Connect to the running Electron app
    // console.log(`Connecting to Electron at ${CDP_URL}...`);
    browser = await chromium.connectOverCDP(CDP_URL);

    // 2. Find the right context and page
    // Electron apps typically have one default context.
    const context = browser.contexts()[0];
    if (!context) throw new Error('No browser context found.');

    const pages = context.pages();

    // FILTER: Ignore DevTools windows
    const appPage = pages.find(p => !p.url().startsWith('devtools://'));

    if (!appPage) {
      throw new Error(`No app window found. Open pages: ${pages.map(p => p.url()).join(', ')}`);
    }

    // console.log(`Attached to page: "${await appPage.title()}"`);

    // ---------------------------------------------------------
    // INJECTED LOGIC START
    // ---------------------------------------------------------

    // Example Modern Usage:
    // await appPage.getByRole('button', { name: 'Save' }).click();
    // const status = await appPage.locator('.status-bar').textContent();

    console.log(JSON.stringify({
      status: 'success',
      title: await appPage.title(),
      url: appPage.url(),
      message: 'Electron Driver connected successfully.'
    }));

    // ---------------------------------------------------------
    // INJECTED LOGIC END
    // ---------------------------------------------------------

  } catch (error) {
    console.error(JSON.stringify({
      status: 'error',
      message: error.message,
      stack: error.stack
    }));
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
