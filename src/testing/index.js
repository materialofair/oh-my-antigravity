const path = require('path');
const { writeReport, defaultOutDir } = require('./shared');
const { runSkillsSuite } = require('./suites');
const { runRouterSuite } = require('./router-eval');
const { runPromptsSuite } = require('./prompts');
const { runWorkflowSuite } = require('./workflow');
const {
  analyzeTarget,
  detectProjectStack,
  generateTestingPack,
  generateTestingPacksForChanged,
  listChangedCodeFiles,
} = require('./ai-testing');

function renderCombinedMarkdown(summary) {
  const lines = [];
  lines.push('# Codex LLM Test System Report');
  lines.push('');
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Overall Pass: ${summary.pass ? 'YES' : 'NO'}`);
  lines.push('');
  lines.push('| Suite | Pass | Notes |');
  lines.push('|---|:---:|---|');
  for (const item of summary.suites) {
    lines.push(`| ${item.name} | ${item.pass ? 'Y' : 'N'} | ${item.note || '-'} |`);
  }
  return lines.join('\n');
}

async function runAllSuites(options = {}) {
  const root = options.root || path.resolve(__dirname, '..', '..');
  const outDir = options.outDir || defaultOutDir(root);
  const suites = [];

  const skills = await runSkillsSuite(options);
  suites.push({
    name: 'skills',
    pass: skills.pass,
    note: skills.failedSteps.length > 0 ? `failed: ${skills.failedSteps.join(', ')}` : 'governance + eval passed',
    reportPaths: skills.reportPaths,
  });

  const router = await runRouterSuite({
    root,
    outDir,
    casesPath: options.routerCasesPath || options.casesPath,
    limit: options.limit,
  });
  suites.push({
    name: 'router',
    pass: router.pass,
    note: router.failed > 0 ? `${router.failed} case(s) failed` : `${router.passed} case(s) passed`,
    reportPaths: router.reportPaths,
  });

  const prompts = await runPromptsSuite({
    root,
    outDir,
    casesPath: options.promptContractCasesPath || options.promptCasesPath,
  });
  suites.push({
    name: 'prompts',
    pass: prompts.pass,
    note: prompts.failed > 0 ? `${prompts.failed} prompt case(s) failed` : `${prompts.passed} prompt case(s) passed`,
    reportPaths: prompts.reportPaths,
  });

  const workflow = await runWorkflowSuite({
    root,
    outDir,
    keepSandbox: options.keepSandbox,
  });
  suites.push({
    name: 'workflow',
    pass: workflow.pass,
    note: workflow.pass ? 'team/notify smoke checks passed' : 'workflow smoke checks failed',
    reportPaths: workflow.reportPaths,
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    suite: 'all',
    pass: suites.every((item) => item.pass),
    suites,
  };

  const reportPaths = await writeReport(summary, {
    outDir,
    baseName: 'llm-test-all-latest',
    markdown: renderCombinedMarkdown(summary),
  });

  return {
    ...summary,
    reportPaths,
  };
}

module.exports = {
  analyzeTarget,
  detectProjectStack,
  generateTestingPack,
  generateTestingPacksForChanged,
  listChangedCodeFiles,
  runAllSuites,
  runPromptsSuite,
  runRouterSuite,
  runSkillsSuite,
  runWorkflowSuite,
};
