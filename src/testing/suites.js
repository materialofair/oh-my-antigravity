const path = require('path');
const { defaultOutDir, runCommand, writeReport } = require('./shared');

function renderSkillsMarkdown(summary) {
  const lines = [];
  lines.push('# Skills LLM Test Report');
  lines.push('');
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Overall Pass: ${summary.pass ? 'YES' : 'NO'}`);
  lines.push('');
  lines.push('| Step | Pass | Exit | Command |');
  lines.push('|---|:---:|---:|---|');
  for (const step of summary.steps) {
    lines.push(`| ${step.name} | ${step.pass ? 'Y' : 'N'} | ${step.exitCode} | ${step.commandLine} |`);
  }
  lines.push('');
  for (const step of summary.steps) {
    lines.push(`## ${step.name}`);
    lines.push('');
    lines.push('```text');
    lines.push(step.output || '(no output)');
    lines.push('```');
    lines.push('');
  }
  return lines.join('\n');
}

async function runSkillsSuite(options = {}) {
  const root = options.root || path.resolve(__dirname, '..', '..');
  const outDir = options.outDir || defaultOutDir(root);
  const steps = [];

  const governance = runCommand('bash', ['scripts/check-skill-governance.sh'], { cwd: root });
  steps.push({
    name: 'skill-governance',
    commandLine: 'bash scripts/check-skill-governance.sh',
    ...governance,
  });

  const llmArgs = ['scripts/check-skill-llm-governance.js', `--mode=${options.mode || 'auto'}`];
  if (options.llmModel) llmArgs.push(`--llm-model=${options.llmModel}`);
  const llmGovernance = runCommand('node', llmArgs, { cwd: root });
  steps.push({
    name: 'skill-llm-governance',
    commandLine: `node ${llmArgs.join(' ')}`,
    ...llmGovernance,
  });

  const evalSkills = runCommand('node', ['scripts/eval-skills.js'], { cwd: root });
  steps.push({
    name: 'skill-eval',
    commandLine: 'node scripts/eval-skills.js',
    ...evalSkills,
  });

  if (options.skillPath) {
    const testerArgs = [
      '.agent/skills/local/skill-tester/scripts/run-skill-tests.js',
      '--skill-path',
      options.skillPath,
    ];

    if (options.casesPath) testerArgs.push('--cases', options.casesPath);
    if (options.runner) testerArgs.push('--runner', options.runner);
    if (options.runnerCmd) testerArgs.push('--runner-cmd', options.runnerCmd);
    if (options.timeoutMs) testerArgs.push('--timeout-ms', String(options.timeoutMs));
    if (options.skillTesterMode) testerArgs.push('--mode', options.skillTesterMode);
    if (options.llmModel) testerArgs.push('--llm-model', options.llmModel);

    // Skill regression is optional because Codex repos often validate docs and routing
    // without replaying full CLI trigger flows in CI.
    const skillRegression = runCommand('node', testerArgs, { cwd: root });
    steps.push({
      name: 'skill-trigger-regression',
      commandLine: `node ${testerArgs.join(' ')}`,
      ...skillRegression,
    });
  }

  const failedSteps = steps.filter((step) => !step.pass).map((step) => step.name);
  const summary = {
    generatedAt: new Date().toISOString(),
    suite: 'skills',
    pass: failedSteps.length === 0,
    failedSteps,
    steps,
  };

  const reportPaths = await writeReport(summary, {
    outDir,
    baseName: 'llm-test-skills-latest',
    markdown: renderSkillsMarkdown(summary),
  });

  return {
    ...summary,
    reportPaths,
  };
}

module.exports = {
  runSkillsSuite,
};
