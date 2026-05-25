#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const SUPPORTED = ['pnpm', 'bun', 'yarn', 'npm'];

function usage() {
  console.log(`Usage:
  node scripts/setup-package-manager.js --detect
  node scripts/setup-package-manager.js --list
  node scripts/setup-package-manager.js --global <pm>
  node scripts/setup-package-manager.js --project <pm>
`);
}

function isCommandAvailable(cmd) {
  const isWin = process.platform === 'win32';
  const checker = isWin ? 'where' : 'command';
  const args = isWin ? [cmd] : ['-v', cmd];
  const result = spawnSync(checker, args, { stdio: 'ignore' });
  return result.status === 0;
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function detect() {
  const env = process.env.CODEX_PACKAGE_MANAGER;
  if (env) return { source: 'env', value: env };

  const projectConfig = readJson(path.join(process.cwd(), '.codex', 'package-manager.json'));
  if (projectConfig && projectConfig.packageManager) {
    return { source: 'project-config', value: projectConfig.packageManager };
  }

  const pkg = readJson(path.join(process.cwd(), 'package.json'));
  if (pkg && pkg.packageManager) {
    return { source: 'package.json', value: pkg.packageManager };
  }

  const lockFiles = [
    { file: 'pnpm-lock.yaml', pm: 'pnpm' },
    { file: 'bun.lockb', pm: 'bun' },
    { file: 'yarn.lock', pm: 'yarn' },
    { file: 'package-lock.json', pm: 'npm' },
  ];
  for (const entry of lockFiles) {
    if (fs.existsSync(path.join(process.cwd(), entry.file))) {
      return { source: 'lockfile', value: entry.pm };
    }
  }

  const globalConfig = readJson(path.join(os.homedir(), '.codex', 'package-manager.json'));
  if (globalConfig && globalConfig.packageManager) {
    return { source: 'global-config', value: globalConfig.packageManager };
  }

  for (const pm of SUPPORTED) {
    if (isCommandAvailable(pm)) {
      return { source: 'available-command', value: pm };
    }
  }

  return { source: 'fallback', value: 'npm' };
}

function normalize(pm) {
  if (!pm) return null;
  const base = pm.split('@')[0];
  if (!SUPPORTED.includes(base)) return null;
  return pm;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    usage();
    process.exit(1);
  }

  if (args.includes('--list')) {
    console.log(SUPPORTED.join('\n'));
    return;
  }

  if (args.includes('--detect')) {
    const result = detect();
    console.log(`Detected: ${result.value}`);
    console.log(`Source: ${result.source}`);
    return;
  }

  const globalIdx = args.indexOf('--global');
  if (globalIdx !== -1) {
    const pm = normalize(args[globalIdx + 1]);
    if (!pm) {
      console.error(`Invalid package manager. Supported: ${SUPPORTED.join(', ')}`);
      process.exit(1);
    }
    const filePath = path.join(os.homedir(), '.codex', 'package-manager.json');
    writeJson(filePath, { packageManager: pm });
    console.log(`Global package manager set to ${pm}`);
    return;
  }

  const projectIdx = args.indexOf('--project');
  if (projectIdx !== -1) {
    const pm = normalize(args[projectIdx + 1]);
    if (!pm) {
      console.error(`Invalid package manager. Supported: ${SUPPORTED.join(', ')}`);
      process.exit(1);
    }
    const filePath = path.join(process.cwd(), '.codex', 'package-manager.json');
    writeJson(filePath, { packageManager: pm });
    console.log(`Project package manager set to ${pm}`);
    return;
  }

  usage();
  process.exit(1);
}

main();
