const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');
const { defaultOutDir, readJsonFile, runCommand, writeReport } = require('./shared');

function repoCli(root) {
  return path.join(root, 'bin', 'oma.js');
}

async function makeSandbox(root) {
  const base = path.join(root, '.oma', 'tmp');
  await fsp.mkdir(base, { recursive: true });
  return fsp.mkdtemp(path.join(base, 'llm-workflow-'));
}

async function readTeamState(sandbox) {
  return readJsonFile(path.join(sandbox, '.oma', 'state', 'team-state.json'), null);
}

async function readPluginCounter(sandbox) {
  return readJsonFile(
    path.join(sandbox, '.oma', 'state', 'notify-plugins', 'sample-notify-plugin', 'seen-count.json'),
    null,
  );
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push('# Workflow LLM Test Report');
  lines.push('');
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Sandbox: ${summary.sandbox}`);
  lines.push(`Overall Pass: ${summary.pass ? 'YES' : 'NO'}`);
  lines.push('');
  lines.push('| Step | Pass | Notes |');
  lines.push('|---|:---:|---|');
  for (const step of summary.steps) {
    lines.push(`| ${step.name} | ${step.pass ? 'Y' : 'N'} | ${step.notes.join('; ') || '-'} |`);
  }
  return lines.join('\n');
}

async function runWorkflowSuite(options = {}) {
  const root = options.root || path.resolve(__dirname, '..', '..');
  const outDir = options.outDir || defaultOutDir(root);
  const sandbox = await makeSandbox(root);
  const cliPath = repoCli(root);
  const steps = [];

  try {
    const route = runCommand('node', [cliPath, 'route', 'fix auth lint + tests', '--json'], { cwd: sandbox });
    const routeJson = route.pass ? JSON.parse(route.output) : null;
    steps.push({
      name: 'route-json',
      pass: !!(route.pass && routeJson && Array.isArray(routeJson.recommendations) && routeJson.recommendations.length > 0),
      notes: route.pass ? [`top=${routeJson && routeJson.recommendations[0] ? routeJson.recommendations[0].skill : 'none'}`] : [route.output || route.error],
    });

    const teamStart = runCommand('node', [cliPath, 'team', 'start', 'ship oauth login', '--auto', '--max-fix=2'], { cwd: sandbox });
    const startedState = await readTeamState(sandbox);
    steps.push({
      name: 'team-start',
      pass: !!(teamStart.pass && startedState && startedState.phase === 'team-plan' && startedState.auto_advance === true),
      notes: [
        `phase=${startedState && startedState.phase ? startedState.phase : 'missing'}`,
        `skills=${startedState && Array.isArray(startedState.recommended_skills) ? startedState.recommended_skills.join(',') : 'missing'}`,
      ],
    });

    const teamAdvance = runCommand('node', [cliPath, 'team', 'advance', 'team-prd', 'workflow-smoke'], { cwd: sandbox });
    const advancedState = await readTeamState(sandbox);
    steps.push({
      name: 'team-advance',
      pass: !!(teamAdvance.pass && advancedState && advancedState.phase === 'team-prd'),
      notes: [`phase=${advancedState && advancedState.phase ? advancedState.phase : 'missing'}`],
    });

    const notifyInit = runCommand('node', [cliPath, 'notify', 'init'], { cwd: sandbox });
    const pluginFile = path.join(sandbox, '.oma', 'notify', 'sample-notify-plugin.mjs');
    steps.push({
      name: 'notify-init',
      pass: notifyInit.pass && fs.existsSync(pluginFile),
      notes: [fs.existsSync(pluginFile) ? 'sample plugin created' : notifyInit.output || notifyInit.error],
    });

    const notifyValidate = runCommand('node', [cliPath, 'notify', 'validate'], {
      cwd: sandbox,
      env: { OMX_NOTIFY_PLUGINS: '1' },
    });
    steps.push({
      name: 'notify-validate',
      pass: notifyValidate.pass,
      notes: [notifyValidate.output || notifyValidate.error || 'validated'],
    });

    const notifyTest = runCommand('node', [cliPath, 'notify', 'test', 'turn-complete'], {
      cwd: sandbox,
      env: {
        OMX_NOTIFY_PLUGINS: '1',
        OMX_NOTIFY_PLUGIN_TIMEOUT_MS: '3000',
      },
    });
    const seenCount = await readPluginCounter(sandbox);
    steps.push({
      name: 'notify-test',
      pass: !!(notifyTest.pass && typeof seenCount === 'number' && seenCount >= 1),
      notes: [`seen-count=${seenCount === null ? 'missing' : seenCount}`],
    });

    const teamCancel = runCommand('node', [cliPath, 'team', 'cancel'], { cwd: sandbox });
    const cancelledState = await readTeamState(sandbox);
    steps.push({
      name: 'team-cancel',
      pass: !!(teamCancel.pass && cancelledState && cancelledState.phase === 'cancelled' && cancelledState.active === false),
      notes: [`phase=${cancelledState && cancelledState.phase ? cancelledState.phase : 'missing'}`],
    });
  } finally {
    if (options.keepSandbox !== true) {
      await fsp.rm(sandbox, { recursive: true, force: true });
    }
  }

  const failedSteps = steps.filter((step) => !step.pass);
  const summary = {
    generatedAt: new Date().toISOString(),
    suite: 'workflow',
    sandbox: options.keepSandbox === true ? sandbox : '[cleaned]',
    host: os.hostname(),
    pass: failedSteps.length === 0,
    steps,
  };

  const reportPaths = await writeReport(summary, {
    outDir,
    baseName: 'llm-test-workflow-latest',
    markdown: renderMarkdown(summary),
  });

  return {
    ...summary,
    reportPaths,
  };
}

module.exports = {
  runWorkflowSuite,
};
