const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { spawnSync } = require('child_process');

function defaultOutDir(cwd = process.cwd()) {
  return path.join(cwd, '.oma', 'reports');
}

function summarizeOutput(output, maxChars = 1600) {
  return String(output || '').replace(/\0/g, '').slice(0, maxChars);
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, ...(options.env || {}) },
    timeout: options.timeoutMs,
  });

  const stdout = result.stdout || '';
  const stderr = result.stderr || '';
  const combined = `${stdout}${stderr}`;

  return {
    command,
    args,
    cwd: options.cwd || process.cwd(),
    pass: result.status === 0 && !result.error,
    exitCode: typeof result.status === 'number' ? result.status : 1,
    output: summarizeOutput(combined),
    error: result.error ? String(result.error.message || result.error) : '',
  };
}

async function writeReport(report, options = {}) {
  const outDir = options.outDir || defaultOutDir();
  const baseName = options.baseName || 'llm-test-latest';
  await fsp.mkdir(outDir, { recursive: true });
  const jsonPath = path.join(outDir, `${baseName}.json`);
  const mdPath = path.join(outDir, `${baseName}.md`);
  await fsp.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await fsp.writeFile(mdPath, `${String(options.markdown || '').trim()}\n`, 'utf8');
  return { jsonPath, mdPath };
}

function readJsonFile(filePath, fallback = null) {
  if (!filePath || !fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseFrontmatter(content) {
  const match = String(content || '').match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;
  const map = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    map[key] = value;
  }
  return map;
}

module.exports = {
  defaultOutDir,
  parseFrontmatter,
  readJsonFile,
  runCommand,
  summarizeOutput,
  writeReport,
};
