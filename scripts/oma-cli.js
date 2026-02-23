#!/usr/bin/env node

/* eslint-disable no-console */
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SCOPES = new Set(['user', 'project-local', 'project']);

function usage() {
  console.log(`oma CLI

Usage:
  oma setup [--scope user|project-local|project] [--target <dir>] [--force] [--dry-run] [--verbose]
            [--no-skills] [--no-workflows] [--no-rules] [--no-links]
  oma doctor
  oma verify
  oma help
`);
}

function parseFlag(args, key) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === `--${key}`) return { found: true, value: true };
    if (arg.startsWith(`--${key}=`)) return { found: true, value: arg.slice(key.length + 3) };
  }
  return { found: false, value: undefined };
}

function parseScope(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--scope') {
      const value = args[i + 1];
      if (!value) throw new Error('Missing value for --scope');
      return value;
    }
    if (arg.startsWith('--scope=')) return arg.slice('--scope='.length);
  }
  return undefined;
}

function parseTarget(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--target') {
      const value = args[i + 1];
      if (!value) throw new Error('Missing value for --target');
      return value;
    }
    if (arg.startsWith('--target=')) return arg.slice('--target='.length);
  }
  return undefined;
}

async function ensureDir(dir, dryRun) {
  if (dryRun) return;
  await fsp.mkdir(dir, { recursive: true });
}

async function copyDirectory(src, dest, options) {
  if (!fs.existsSync(src)) return 0;
  await ensureDir(dest, options.dryRun);

  const entries = await fsp.readdir(src, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += await copyDirectory(from, to, options);
      continue;
    }
    if (!entry.isFile()) continue;

    if (fs.existsSync(to) && !options.force) continue;
    if (!options.dryRun) {
      await ensureDir(path.dirname(to), false);
      await fsp.copyFile(from, to);
    }
    count += 1;
  }

  return count;
}

async function ensureSymlink(target, linkPath, options) {
  if (options.dryRun) return;

  try {
    const stat = await fsp.lstat(linkPath);
    if (!stat.isSymbolicLink()) {
      if (!options.force) return;
      await fsp.rm(linkPath, { recursive: true, force: true });
    } else {
      await fsp.unlink(linkPath);
    }
  } catch {}

  await ensureDir(path.dirname(linkPath), false);
  await fsp.symlink(target, linkPath);
}

function sourceDirs(root) {
  return {
    skills: path.join(root, '.agent', 'skills'),
    workflows: path.join(root, '.agent', 'workflows'),
    rules: path.join(root, '.agent', 'rules'),
  };
}

function loadPersistedScope(cwd) {
  const file = path.join(cwd, '.oma', 'setup-scope.json');
  if (!fs.existsSync(file)) return undefined;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (SCOPES.has(parsed.scope)) return parsed.scope;
  } catch {}
  return undefined;
}

async function persistScope(cwd, scope, dryRun) {
  const file = path.join(cwd, '.oma', 'setup-scope.json');
  if (dryRun) return;
  await ensureDir(path.dirname(file), false);
  await fsp.writeFile(file, `${JSON.stringify({ scope }, null, 2)}\n`, 'utf8');
}

function destinations(scope, cwd, target) {
  if (scope === 'user') {
    const base = path.join(os.homedir(), '.gemini', 'antigravity');
    return {
      skills: path.join(base, 'skills'),
      workflows: path.join(base, 'global_workflows'),
      rules: path.join(base, 'rules'),
      compatLinks: [
        { target: path.join(base, 'global_workflows'), link: path.join(base, 'workflows') },
        { target: path.join(base, 'global_workflows'), link: path.join(os.homedir(), '.agent', 'workflows') },
        { target: path.join(base, 'global_workflows'), link: path.join(os.homedir(), '.agents', 'workflows') },
        { target: path.join(base, 'global_workflows'), link: path.join(os.homedir(), '_agent', 'workflows') },
        { target: path.join(base, 'global_workflows'), link: path.join(os.homedir(), '_agents', 'workflows') },
      ],
      projectCompatLink: null,
    };
  }

  const projectRoot = path.resolve(target || cwd);
  const agentRoot = path.join(projectRoot, '.agent');
  return {
    skills: path.join(agentRoot, 'skills'),
    workflows: path.join(agentRoot, 'workflows'),
    rules: path.join(agentRoot, 'rules'),
    compatLinks: [],
    projectCompatLink: { target: '.agent', link: path.join(projectRoot, '.antigravity') },
  };
}

async function setup(args) {
  const cwd = process.cwd();
  const root = path.resolve(__dirname, '..');
  const flagSet = new Set(args);
  const scope = parseScope(args) || loadPersistedScope(cwd) || 'user';
  const target = parseTarget(args);

  if (!SCOPES.has(scope)) {
    throw new Error(`Invalid scope: ${scope}. Expected user, project-local, or project.`);
  }

  const options = {
    force: flagSet.has('--force'),
    dryRun: flagSet.has('--dry-run'),
    verbose: flagSet.has('--verbose'),
    installSkills: !flagSet.has('--no-skills'),
    installWorkflows: !flagSet.has('--no-workflows'),
    installRules: !flagSet.has('--no-rules'),
    installLinks: !flagSet.has('--no-links'),
  };

  const src = sourceDirs(root);
  const dest = destinations(scope, cwd, target);
  await persistScope(cwd, scope, options.dryRun);

  console.log('oma setup');
  console.log('=========');
  console.log(`Scope: ${scope}`);
  if (target) console.log(`Target: ${path.resolve(target)}`);

  console.log('[1/4] Installing skills...');
  if (scope === 'project' || !options.installSkills) {
    console.log('  Skipped');
  } else {
    const count = await copyDirectory(src.skills, dest.skills, options);
    console.log(`  ${options.dryRun ? 'Would install/update' : 'Installed/updated'} ${count} files -> ${dest.skills}`);
  }

  console.log('[2/4] Installing workflows...');
  if (scope === 'project' || !options.installWorkflows) {
    console.log('  Skipped');
  } else {
    const count = await copyDirectory(src.workflows, dest.workflows, options);
    console.log(`  ${options.dryRun ? 'Would install/update' : 'Installed/updated'} ${count} files -> ${dest.workflows}`);
  }

  console.log('[3/4] Installing rules...');
  if (scope === 'project' || !options.installRules) {
    console.log('  Skipped');
  } else {
    const count = await copyDirectory(src.rules, dest.rules, options);
    console.log(`  ${options.dryRun ? 'Would install/update' : 'Installed/updated'} ${count} files -> ${dest.rules}`);
  }

  console.log('[4/4] Writing compatibility links...');
  if (!options.installLinks || scope === 'project') {
    console.log('  Skipped');
  } else {
    if (dest.projectCompatLink) {
      await ensureSymlink(dest.projectCompatLink.target, dest.projectCompatLink.link, options);
      console.log(`  Linked ${dest.projectCompatLink.link} -> ${dest.projectCompatLink.target}`);
    }
    for (const item of dest.compatLinks) {
      await ensureSymlink(item.target, item.link, options);
      if (options.verbose) console.log(`  Linked ${item.link} -> ${item.target}`);
    }
    if (!dest.projectCompatLink) console.log('  Global compatibility links updated');
  }

  console.log('\nDone.');
}

function checkPath(name, target, required = true) {
  const exists = fs.existsSync(target);
  const ok = required ? exists : true;
  const icon = ok ? '[OK]' : '[XX]';
  console.log(`${icon} ${name}: ${exists ? target : 'missing'}`);
  return ok;
}

function doctor() {
  const cwd = process.cwd();
  const root = path.resolve(__dirname, '..');
  const scope = loadPersistedScope(cwd) || 'user';
  const src = sourceDirs(root);
  const dest = destinations(scope, cwd);

  let pass = 0;
  const total = 7;
  if (checkPath('Source skills', src.skills)) pass += 1;
  if (checkPath('Source workflows', src.workflows)) pass += 1;
  if (checkPath('Source rules', src.rules)) pass += 1;
  if (checkPath('Installed skills', dest.skills, scope !== 'project')) pass += 1;
  if (checkPath('Installed workflows', dest.workflows, scope !== 'project')) pass += 1;
  if (checkPath('Installed rules (optional)', dest.rules, false)) pass += 1;
  if (checkPath('Governance checker', path.join(root, 'scripts', 'check-skill-governance.sh'))) pass += 1;

  console.log(`\nResult: ${pass}/${total} checks passed.`);
  if (pass !== total) process.exitCode = 1;
}

function verify() {
  const root = path.resolve(__dirname, '..');
  const result = spawnSync('bash', [path.join(root, 'scripts', 'verify-repo.sh')], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}

async function main(argv) {
  const command = argv[0] || 'help';
  if (command === 'help' || command === '--help' || command === '-h') {
    usage();
    return;
  }
  if (command === 'setup') {
    await setup(argv.slice(1));
    return;
  }
  if (command === 'doctor') {
    doctor();
    return;
  }
  if (command === 'verify') {
    verify();
    return;
  }
  throw new Error(`Unknown command: ${command}`);
}

module.exports = { main };
