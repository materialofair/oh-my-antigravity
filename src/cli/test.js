/* eslint-disable no-console */
const path = require('path');
const {
  analyzeTarget,
  detectProjectStack,
  generateTestingPack,
  generateTestingPacksForChanged,
  runAllSuites,
  runPromptsSuite,
  runRouterSuite,
  runSkillsSuite,
  runWorkflowSuite,
} = require('../testing');

const HELP = `Usage:
  oma test detect-stack [--json]
  oma test analyze <file> [--json]
  oma test changed [--limit <n>] [--out-dir <dir>] [--json]
  oma test gen <file> [--out-dir <dir>] [--json]
  oma test llm all [--router-cases <file>] [--skill-path <dir>]
  oma test llm skills [--skill-path <dir>] [--cases <file>] [--runner <name>] [--runner-cmd <cmd>]
  oma test llm router [--cases <file>] [--limit <n>]
  oma test llm prompts [--cases <file>]
  oma test llm workflow [--keep-sandbox]
`;

function getFlagValue(args, name) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === name && args[i + 1]) return args[i + 1];
    if (arg.startsWith(`${name}=`)) return arg.slice(name.length + 1);
  }
  return '';
}

function parseNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function test(args) {
  const root = path.resolve(__dirname, '..', '..');
  const command = args[0] || '';
  const json = args.includes('--json');

  if (command === 'detect-stack') {
    const stack = detectProjectStack(root);
    if (json) {
      console.log(JSON.stringify(stack, null, 2));
      return;
    }
    console.log(`package-manager: ${stack.packageManager}`);
    console.log(`languages: ${(stack.languages || []).join(', ') || 'none'}`);
    console.log(`frontend: ${stack.frontend || 'none'}`);
    console.log(`backend: ${stack.backend || 'none'}`);
    console.log(`test-frameworks: ${(stack.testFrameworks || []).join(', ') || 'none'}`);
    console.log(`e2e-frameworks: ${(stack.e2eFrameworks || []).join(', ') || 'none'}`);
    console.log(`test-command: ${stack.commands && stack.commands.test ? stack.commands.test : 'none detected'}`);
    return;
  }

  if (command === 'analyze') {
    const targetFile = args[1];
    if (!targetFile) throw new Error('Usage: oma test analyze <file> [--json]');
    const analysis = analyzeTarget(root, targetFile);
    if (json) {
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }
    console.log(`target: ${analysis.relativePath}`);
    console.log(`kind: ${analysis.kind}`);
    console.log(`language: ${analysis.language}`);
    console.log(`complexity: ${analysis.complexity}`);
    console.log(`suggested-layers: ${analysis.suggestedLayers.join(', ')}`);
    console.log(`suggested-test-file: ${analysis.suggestedTestFile}`);
    console.log(`risk-signals: ${analysis.riskSignals.join(', ') || 'none'}`);
    return;
  }

  if (command === 'gen') {
    const targetFile = args[1];
    if (!targetFile) throw new Error('Usage: oma test gen <file> [--out-dir <dir>] [--json]');
    const result = await generateTestingPack(root, targetFile, {
      outDir: getFlagValue(args.slice(2), '--out-dir') || '',
    });
    if (json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(`testing-pack: ${result.packDir}`);
    console.log(`target: ${result.analysis.relativePath}`);
    console.log(`test-plan: ${result.files.planPath}`);
    console.log(`acceptance: ${result.files.acceptancePath}`);
    console.log(`regression: ${result.files.regressionPath}`);
    console.log(`playbook: ${result.files.promptPath}`);
    return;
  }

  if (command === 'changed') {
    const result = await generateTestingPacksForChanged(root, {
      outDir: getFlagValue(args.slice(1), '--out-dir') || '',
      limit: parseNumber(getFlagValue(args.slice(1), '--limit'), 0),
    });
    if (json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }
    console.log(`changed-files: ${result.totalChanged}`);
    if (result.totalChanged === 0) {
      console.log('testing-packs: none');
      return;
    }
    for (const item of result.results) {
      console.log(`- ${item.analysis.relativePath} -> ${item.packDir}`);
    }
    return;
  }

  if (command !== 'llm') {
    throw new Error(HELP.trim());
  }

  const suite = args[1] || 'all';
  const rest = args.slice(2);
  const options = {
    root,
    outDir: getFlagValue(rest, '--out-dir') || '',
    casesPath: getFlagValue(rest, '--cases') || '',
    routerCasesPath: getFlagValue(rest, '--router-cases') || '',
    skillPath: getFlagValue(rest, '--skill-path') || '',
    promptContractCasesPath: getFlagValue(rest, '--prompt-contract-cases') || '',
    runner: getFlagValue(rest, '--runner') || '',
    runnerCmd: getFlagValue(rest, '--runner-cmd') || '',
    mode: getFlagValue(rest, '--mode') || 'auto',
    skillTesterMode: getFlagValue(rest, '--skill-tester-mode') || '',
    llmModel: getFlagValue(rest, '--llm-model') || '',
    timeoutMs: parseNumber(getFlagValue(rest, '--timeout-ms'), 45000),
    limit: parseNumber(getFlagValue(rest, '--limit'), 5),
    keepSandbox: rest.includes('--keep-sandbox'),
  };

  if (suite === 'skills') {
    const summary = await runSkillsSuite(options);
    console.log(`skills suite: pass=${summary.pass}`);
    console.log(`reports: ${summary.reportPaths.jsonPath}`);
    console.log(`reports: ${summary.reportPaths.mdPath}`);
    if (!summary.pass) process.exitCode = 1;
    return;
  }

  if (suite === 'router') {
    const summary = await runRouterSuite({
      root,
      outDir: options.outDir || undefined,
      casesPath: options.casesPath || undefined,
      limit: options.limit,
    });
    console.log(`router suite: pass=${summary.pass}, passed=${summary.passed}, failed=${summary.failed}`);
    console.log(`reports: ${summary.reportPaths.jsonPath}`);
    console.log(`reports: ${summary.reportPaths.mdPath}`);
    if (!summary.pass) process.exitCode = 1;
    return;
  }

  if (suite === 'prompts') {
    const summary = await runPromptsSuite({
      root,
      outDir: options.outDir || undefined,
      casesPath: options.casesPath || options.promptContractCasesPath || undefined,
    });
    console.log(`prompts suite: pass=${summary.pass}, passed=${summary.passed}, failed=${summary.failed}`);
    console.log(`reports: ${summary.reportPaths.jsonPath}`);
    console.log(`reports: ${summary.reportPaths.mdPath}`);
    if (!summary.pass) process.exitCode = 1;
    return;
  }

  if (suite === 'workflow') {
    const summary = await runWorkflowSuite({
      root,
      outDir: options.outDir || undefined,
      keepSandbox: options.keepSandbox,
    });
    console.log(`workflow suite: pass=${summary.pass}`);
    console.log(`reports: ${summary.reportPaths.jsonPath}`);
    console.log(`reports: ${summary.reportPaths.mdPath}`);
    if (!summary.pass) process.exitCode = 1;
    return;
  }

  if (suite === 'all') {
    const summary = await runAllSuites(options);
    console.log(`llm test system: pass=${summary.pass}`);
    console.log(`reports: ${summary.reportPaths.jsonPath}`);
    console.log(`reports: ${summary.reportPaths.mdPath}`);
    if (!summary.pass) process.exitCode = 1;
    return;
  }

  throw new Error(`Unknown llm test suite: ${suite}\n\n${HELP}`);
}

module.exports = { test };
