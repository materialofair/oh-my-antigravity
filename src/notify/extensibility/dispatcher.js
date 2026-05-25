const fs = require('fs/promises');
const path = require('path');
const { pathToFileURL } = require('url');
const {
  discoverNotifyPlugins,
  isNotifyPluginsEnabled,
  resolveNotifyPluginTimeoutMs,
} = require('./loader');

function notifyLogPath(cwd) {
  const day = new Date().toISOString().slice(0, 10);
  return path.join(cwd, '.oma', 'logs', `notify-${day}.jsonl`);
}

async function appendLog(cwd, payload) {
  const file = notifyLogPath(cwd);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, `${JSON.stringify({ timestamp: new Date().toISOString(), ...payload })}\n`, 'utf8');
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function buildSdk(cwd, pluginId) {
  const pluginStateDir = path.join(cwd, '.oma', 'state', 'notify-plugins', pluginId);

  async function readState(key) {
    const file = path.join(pluginStateDir, `${key}.json`);
    try {
      const raw = await fs.readFile(file, 'utf8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  async function writeState(key, value) {
    const file = path.join(pluginStateDir, `${key}.json`);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  }

  async function deleteState(key) {
    const file = path.join(pluginStateDir, `${key}.json`);
    try { await fs.unlink(file); } catch {}
  }

  return {
    log: {
      info: async (message, meta) => appendLog(cwd, { type: 'notify_plugin_log', level: 'info', plugin: pluginId, message, meta }),
      warn: async (message, meta) => appendLog(cwd, { type: 'notify_plugin_log', level: 'warn', plugin: pluginId, message, meta }),
      error: async (message, meta) => appendLog(cwd, { type: 'notify_plugin_log', level: 'error', plugin: pluginId, message, meta }),
    },
    state: {
      read: readState,
      write: writeState,
      delete: deleteState,
    },
  };
}

async function dispatchNotifyEvent(event, options = {}) {
  const cwd = options.cwd || process.cwd();
  const enabled = options.enabled !== false && isNotifyPluginsEnabled(options.env || process.env);
  const plugins = discoverNotifyPlugins(cwd);

  const summary = {
    enabled,
    event: event.event,
    plugin_count: plugins.length,
    results: [],
  };

  if (!enabled) {
    await appendLog(cwd, { type: 'notify_dispatch', enabled: false, reason: 'plugins_disabled', event: event.event });
    return summary;
  }

  const timeoutMs = resolveNotifyPluginTimeoutMs(options.env || process.env);

  for (const plugin of plugins) {
    const started = Date.now();
    try {
      const mod = await import(`${pathToFileURL(plugin.filePath).href}?t=${Date.now()}`);
      if (typeof mod.onNotifyEvent !== 'function') {
        summary.results.push({ plugin: plugin.id, ok: false, status: 'invalid_export', duration_ms: Date.now() - started });
        await appendLog(cwd, { type: 'notify_plugin_dispatch', plugin: plugin.id, event: event.event, ok: false, status: 'invalid_export' });
        continue;
      }

      const sdk = buildSdk(cwd, plugin.id);
      await withTimeout(Promise.resolve(mod.onNotifyEvent(event, sdk)), timeoutMs);
      summary.results.push({ plugin: plugin.id, ok: true, status: 'ok', duration_ms: Date.now() - started });
      await appendLog(cwd, { type: 'notify_plugin_dispatch', plugin: plugin.id, event: event.event, ok: true, status: 'ok' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const status = message === 'timeout' ? 'timeout' : 'error';
      summary.results.push({ plugin: plugin.id, ok: false, status, error: message, duration_ms: Date.now() - started });
      await appendLog(cwd, { type: 'notify_plugin_dispatch', plugin: plugin.id, event: event.event, ok: false, status, error: message });
    }
  }

  return summary;
}

module.exports = {
  dispatchNotifyEvent,
};
