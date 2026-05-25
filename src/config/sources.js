const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.oma', 'sources.json');

function getDefaultConfig() {
  return {
    active: 'fork',
    lastSync: null,
    syncHistory: []
  };
}

function readConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return getDefaultConfig();
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch {
    return getDefaultConfig();
  }
}

async function writeConfig(config) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
  await fsp.writeFile(CONFIG_PATH, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

function getActiveSource() {
  return readConfig().active;
}

async function setActiveSource(source) {
  const config = readConfig();
  config.active = source;
  await writeConfig(config);
}

async function recordSync(success, details = {}) {
  const config = readConfig();
  const record = {
    timestamp: new Date().toISOString(),
    success,
    ...details
  };
  config.syncHistory.push(record);
  if (success) {
    config.lastSync = record.timestamp;
  }
  // Keep only last 50 records
  if (config.syncHistory.length > 50) {
    config.syncHistory = config.syncHistory.slice(-50);
  }
  await writeConfig(config);
}

module.exports = {
  readConfig,
  writeConfig,
  getActiveSource,
  setActiveSource,
  recordSync,
  CONFIG_PATH
};
