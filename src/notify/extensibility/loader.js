const fs = require('fs');
const path = require('path');

function notifyPluginsDir(cwd) {
  return path.join(cwd, '.oma', 'notify');
}

function legacyNotifyPluginsDir(cwd) {
  return path.join(cwd, '.oma', 'notify-plugins');
}

function discoverNotifyPlugins(cwd = process.cwd()) {
  const primaryDir = notifyPluginsDir(cwd);
  const legacyDir = legacyNotifyPluginsDir(cwd);
  const candidates = [primaryDir, legacyDir];
  const seen = new Set();
  const plugins = [];

  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.mjs') && !file.endsWith('.js')) continue;
      const key = `${dir}/${file}`;
      if (seen.has(key)) continue;
      seen.add(key);
      plugins.push({
        id: file.replace(/\.(mjs|js)$/i, ''),
        fileName: file,
        filePath: path.join(dir, file),
        legacy: dir === legacyDir,
      });
    }
  }

  return plugins.sort((a, b) => a.fileName.localeCompare(b.fileName));
}

function isNotifyPluginsEnabled(env = process.env) {
  return env.OMX_NOTIFY_PLUGINS === '1';
}

function resolveNotifyPluginTimeoutMs(env = process.env) {
  const raw = Number.parseInt(String(env.OMX_NOTIFY_PLUGIN_TIMEOUT_MS || ''), 10);
  if (Number.isFinite(raw) && raw >= 100 && raw <= 60000) return raw;
  return 1500;
}

module.exports = {
  notifyPluginsDir,
  legacyNotifyPluginsDir,
  discoverNotifyPlugins,
  isNotifyPluginsEnabled,
  resolveNotifyPluginTimeoutMs,
};
