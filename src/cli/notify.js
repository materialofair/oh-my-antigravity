/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');
const { buildNotifyEvent } = require('../notify/extensibility/events');
const { dispatchNotifyEvent } = require('../notify/extensibility/dispatcher');
const {
  discoverNotifyPlugins,
  notifyPluginsDir,
  legacyNotifyPluginsDir,
} = require('../notify/extensibility/loader');

const SUPPORTED_TEST_EVENTS = new Set([
  'turn-complete',
  'session-start',
  'session-end',
  'session-idle',
  'needs-input',
  'pre-tool-use',
  'post-tool-use',
]);

const SAMPLE_PLUGIN = `export async function onNotifyEvent(event, sdk) {
  if (event.event !== 'turn-complete') return;
  const current = Number((await sdk.state.read('seen-count')) || 0);
  const next = current + 1;
  await sdk.state.write('seen-count', next);
  await sdk.log.info('sample notify plugin observed turn-complete', { seen: next, turn_id: event.turn_id });
}
`;

async function validatePlugin(filePath) {
  try {
    const mod = await import(`${pathToFileURL(filePath).href}?t=${Date.now()}`);
    if (typeof mod.onNotifyEvent !== 'function') {
      return { valid: false, reason: 'missing export onNotifyEvent(event, sdk)' };
    }
    return { valid: true };
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

async function notify(args) {
  const sub = args[0] || 'status';
  const cwd = process.cwd();

  if (sub === 'init') {
    const dir = notifyPluginsDir(cwd);
    const file = path.join(dir, 'sample-notify-plugin.mjs');
    await fsp.mkdir(dir, { recursive: true });
    if (fs.existsSync(file)) {
      console.log(`already exists: ${file}`);
      return;
    }
    await fsp.writeFile(file, SAMPLE_PLUGIN, 'utf8');
    console.log(`created ${file}`);
    console.log('Enable notify plugins with OMX_NOTIFY_PLUGINS=1');
    return;
  }

  if (sub === 'status') {
    const plugins = discoverNotifyPlugins(cwd);
    console.log(`notify plugins dir: ${notifyPluginsDir(cwd)}`);
    console.log(`legacy notify dir: ${legacyNotifyPluginsDir(cwd)}`);
    console.log(`plugins discovered: ${plugins.length}`);
    for (const plugin of plugins) {
      const legacy = plugin.legacy ? ' (legacy)' : '';
      console.log(`- ${plugin.fileName}${legacy}`);
    }
    return;
  }

  if (sub === 'validate') {
    const plugins = discoverNotifyPlugins(cwd);
    if (plugins.length === 0) {
      console.log('No notify plugins found.');
      return;
    }

    let failed = 0;
    for (const plugin of plugins) {
      const result = await validatePlugin(plugin.filePath);
      if (result.valid) {
        console.log(`OK ${plugin.fileName}`);
      } else {
        failed += 1;
        console.log(`XX ${plugin.fileName}: ${result.reason}`);
      }
    }

    if (failed > 0) throw new Error(`notify validation failed (${failed})`);
    return;
  }

  if (sub === 'test') {
    const eventName = args[1] || 'turn-complete';
    if (!SUPPORTED_TEST_EVENTS.has(eventName)) {
      throw new Error(`unsupported notify test event: ${eventName}`);
    }

    const event = buildNotifyEvent(eventName, {
      source: 'native',
      session_id: 'notify-test',
      thread_id: `thread-${Date.now()}`,
      turn_id: `turn-${Date.now()}`,
      context: { reason: 'notify-test' },
    });

    const result = await dispatchNotifyEvent(event, {
      cwd,
      env: { ...process.env, OMX_NOTIFY_PLUGINS: '1' },
    });

    console.log(`plugins enabled: ${result.enabled ? 'yes' : 'no'}`);
    console.log(`plugins: ${result.plugin_count}`);
    for (const item of result.results) {
      console.log(`${item.plugin}: ${item.status}`);
    }
    return;
  }

  console.log('Usage: oma notify init|status|validate|test [event]');
}

module.exports = { notify };
