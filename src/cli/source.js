/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const { getActiveSource, setActiveSource, recordSync, readConfig } = require('../config/sources');

function checkGitRemote(name) {
  const result = spawnSync('git', ['remote', 'get-url', name], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : null;
}

function listSources() {
  const active = getActiveSource();
  const originUrl = checkGitRemote('origin');
  const upstreamUrl = checkGitRemote('upstream');
  const superpowersUrl = checkGitRemote('superpowers');

  console.log('Available sources:');
  console.log('');
  console.log(`${active === 'fork' ? '●' : '○'} local (custom skills in .agent/skills/local/)`);
  if (originUrl) console.log(`  ${originUrl}`);
  console.log('');
  console.log(`${active === 'upstream' ? '●' : '○'} oh-my-codex (upstream)`);
  if (upstreamUrl) {
    console.log(`  ${upstreamUrl}`);
  } else {
    console.log('  Not configured. Run:');
    console.log('  git remote add upstream https://github.com/Yeachan-Heo/oh-my-codex.git');
  }
  console.log('');
  console.log('○ superpowers (upstream)');
  if (superpowersUrl) {
    console.log(`  ${superpowersUrl}`);
  } else {
    console.log('  Not configured. Run:');
    console.log('  git remote add superpowers https://github.com/obra/superpowers.git');
  }
}

function showActive() {
  console.log(`Active source: ${getActiveSource()}`);
}

async function setSource(name) {
  if (!name || !['fork', 'upstream'].includes(name)) {
    throw new Error('Invalid source. Use: fork or upstream');
  }
  await setActiveSource(name);
  console.log(`Active source set to: ${name}`);
  console.log('Run "oma setup --force" to reinstall from this source.');
}

async function syncUpstream() {
  console.log('Syncing with upstream...');
  console.log('');

  const upstreamUrl = checkGitRemote('upstream');
  if (!upstreamUrl) {
    console.log('Upstream remote not configured.');
    console.log('');
    console.log('To add upstream:');
    console.log('  git remote add upstream https://github.com/Yeachan-Heo/oh-my-codex.git');
    console.log('  git fetch upstream');
    return;
  }

  console.log(`Upstream: ${upstreamUrl}`);
  console.log('');

  // Fetch
  console.log('Fetching upstream...');
  const fetchResult = spawnSync('git', ['fetch', 'upstream'], { stdio: 'inherit' });

  if (fetchResult.status !== 0) {
    await recordSync(false, { error: 'fetch_failed' });
    return;
  }

  // Show updates
  console.log('');
  console.log('Available updates:');
  const logResult = spawnSync('git', ['log', 'HEAD..upstream/main', '--oneline', '-10'], {
    encoding: 'utf8'
  });

  if (logResult.stdout.trim()) {
    console.log(logResult.stdout);
    console.log('');
    console.log('To merge:');
    console.log('  git merge upstream/main');
    console.log('');
    console.log('To cherry-pick:');
    console.log('  git cherry-pick <commit-hash>');
  } else {
    console.log('Already up to date.');
  }

  await recordSync(true, { commits: logResult.stdout.split('\n').filter(l => l.trim()).length });
}

function showStatus() {
  const config = readConfig();

  console.log('Source Status');
  console.log('=============');
  console.log(`Active: ${config.active}`);
  console.log('');

  // Git status
  const status = spawnSync('git', ['status', '--short'], { encoding: 'utf8' });
  if (status.stdout.trim()) {
    console.log('Local changes:');
    console.log(status.stdout);
  } else {
    console.log('Working tree clean');
  }

  console.log('');

  // Upstream status
  const upstreamUrl = checkGitRemote('upstream');
  if (upstreamUrl) {
    console.log(`Upstream: ${upstreamUrl}`);
    const behind = spawnSync('git', ['rev-list', '--count', 'HEAD..upstream/main'], {
      encoding: 'utf8'
    });
    if (behind.status === 0) {
      const count = parseInt(behind.stdout.trim(), 10);
      if (count > 0) {
        console.log(`Behind upstream by ${count} commits`);
      } else {
        console.log('Up to date with upstream');
      }
    }
  } else {
    console.log('Upstream: not configured');
  }

  console.log('');

  if (config.lastSync) {
    console.log(`Last sync: ${config.lastSync}`);
  }

  if (config.syncHistory.length > 0) {
    console.log('');
    console.log('Recent sync history:');
    config.syncHistory.slice(-5).forEach(record => {
      const status = record.success ? '✓' : '✗';
      console.log(`  ${status} ${record.timestamp}`);
    });
  }
}

async function source(args) {
  const cmd = args[0] || 'list';

  switch (cmd) {
    case 'list': listSources(); break;
    case 'active': showActive(); break;
    case 'set': await setSource(args[1]); break;
    case 'sync': await syncUpstream(); break;
    case 'status': showStatus(); break;
    default:
      throw new Error(`Unknown subcommand: ${cmd}. Use: list, active, set, sync, or status`);
  }
}

module.exports = { source };
