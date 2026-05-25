const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { execFileSync } = require('child_process');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function detectPackageManager(root, packageJson) {
  const packageManager = packageJson && typeof packageJson.packageManager === 'string'
    ? packageJson.packageManager
    : '';
  if (packageManager.startsWith('pnpm')) return 'pnpm';
  if (packageManager.startsWith('yarn')) return 'yarn';
  if (packageManager.startsWith('npm')) return 'npm';
  if (fs.existsSync(path.join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(root, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

function detectProjectStack(root) {
  const packageJsonPath = path.join(root, 'package.json');
  const packageJson = readJson(packageJsonPath) || {};
  const deps = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  };
  const scripts = packageJson.scripts || {};
  const packageManager = detectPackageManager(root, packageJson);

  const stack = {
    packageManager,
    languages: [],
    frontend: null,
    backend: null,
    testFrameworks: [],
    e2eFrameworks: [],
    commands: {
      test: null,
      coverage: null,
    },
  };

  if (fs.existsSync(packageJsonPath)) stack.languages.push('javascript');
  if (fs.existsSync(path.join(root, 'tsconfig.json'))) stack.languages.push('typescript');
  if (fs.existsSync(path.join(root, 'requirements.txt')) || fs.existsSync(path.join(root, 'pyproject.toml'))) {
    stack.languages.push('python');
  }
  if (fs.existsSync(path.join(root, 'go.mod'))) stack.languages.push('go');
  if (fs.existsSync(path.join(root, 'Cargo.toml'))) stack.languages.push('rust');

  if (deps.react) stack.frontend = 'react';
  if (deps.vue) stack.frontend = 'vue';
  if (deps.svelte) stack.frontend = 'svelte';
  if (deps.next) stack.frontend = 'next';

  if (deps.express || deps.fastify || deps.koa) stack.backend = 'node';
  if (deps['@nestjs/core']) stack.backend = 'nestjs';
  if (!stack.backend && stack.languages.includes('python')) stack.backend = 'python';
  if (!stack.backend && stack.languages.includes('go')) stack.backend = 'go';
  if (!stack.backend && stack.languages.includes('rust')) stack.backend = 'rust';

  if (deps.vitest || scripts.test && /vitest/.test(scripts.test)) stack.testFrameworks.push('vitest');
  if (deps.jest || scripts.test && /jest/.test(scripts.test)) stack.testFrameworks.push('jest');
  if (deps.pytest) stack.testFrameworks.push('pytest');
  if (deps['@playwright/test']) stack.e2eFrameworks.push('playwright');
  if (deps.cypress) stack.e2eFrameworks.push('cypress');

  if (scripts.test) {
    stack.commands.test = `${packageManager} test`;
  } else if (stack.languages.includes('python')) {
    stack.commands.test = 'pytest';
  } else if (stack.languages.includes('go')) {
    stack.commands.test = 'go test ./...';
  } else if (stack.languages.includes('rust')) {
    stack.commands.test = 'cargo test';
  }

  if (scripts['test:coverage']) {
    stack.commands.coverage = `${packageManager} run test:coverage`;
  } else if (scripts.coverage) {
    stack.commands.coverage = `${packageManager} run coverage`;
  }

  return stack;
}

function targetLanguage(targetPath) {
  const ext = path.extname(targetPath).toLowerCase();
  if (['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'].includes(ext)) return 'javascript';
  if (ext === '.py') return 'python';
  if (ext === '.go') return 'go';
  if (ext === '.rs') return 'rust';
  return 'unknown';
}

function slugifyTarget(targetPath) {
  return targetPath.replace(/[\\/]/g, '__').replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function detectTargetKind(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.tsx', '.jsx'].includes(ext) || /return\s*\(?\s*<[\w]/.test(content)) return 'component';
  if (/app\/api|pages\/api|route\.(ts|js)/.test(filePath)) return 'api';
  if (/class\s+\w+/.test(content)) return 'class-module';
  return 'module';
}

function extractSymbols(content) {
  const functions = Array.from(content.matchAll(/\b(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)/g)).map((match) => match[1]);
  const constFns = Array.from(content.matchAll(/\b(?:export\s+)?const\s+([A-Za-z0-9_]+)\s*=\s*(?:async\s*)?\(/g)).map((match) => match[1]);
  const classes = Array.from(content.matchAll(/\bclass\s+([A-Za-z0-9_]+)/g)).map((match) => match[1]);
  return {
    functions: [...new Set([...functions, ...constFns])],
    classes: [...new Set(classes)],
  };
}

function countMatches(content, pattern) {
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function detectRiskSignals(content) {
  const normalized = content.toLowerCase();
  const signals = [];
  if (/\bauth\b|\btoken\b|\bpassword\b|\bsecret\b/.test(normalized)) signals.push('auth');
  if (/\bpayment\b|\bbilling\b|\binvoice\b|\bcheckout\b/.test(normalized)) signals.push('payments');
  if (/\bfetch\s*\(|axios|graphql|grpc|request\b/.test(normalized)) signals.push('network');
  if (/\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bmongo\b|\bsql\b|\bprisma\b/.test(normalized)) signals.push('database');
  if (/throw\s+new|catch\s*\(|reject\s*\(/.test(content)) signals.push('error-handling');
  return signals;
}

function parseGitStatusPaths(output) {
  return String(output || '')
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .map((entry) => (entry.includes(' -> ') ? entry.split(' -> ').pop().trim() : entry));
}

function isCodeCandidate(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  if (!normalized) return false;
  if (
    normalized.startsWith('.git/')
    || normalized.startsWith('node_modules/')
    || normalized.startsWith('.oma/')
    || normalized.startsWith('.codex/')
    || normalized.startsWith('.claude_memory/')
    || normalized.startsWith('docs/')
    || normalized.startsWith('tests/')
    || normalized.startsWith('test/')
    || normalized.startsWith('coverage/')
    || normalized.startsWith('dist/')
  ) {
    return false;
  }

  const ext = path.extname(normalized).toLowerCase();
  if (!['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.go', '.rs'].includes(ext)) {
    return false;
  }

  return !/(\.test|\.spec)\.[^.]+$/i.test(normalized);
}

/*@ai:risk=3|core=ChangedFileDiscovery|intent=derive_post_impl_test_targets_from_git|deps=git,status,testing-pack|test=unit*/
function listChangedCodeFiles(root, options = {}) {
  let output = '';
  try {
    output = execFileSync('git', ['status', '--porcelain', '--untracked-files=all'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return [];
  }

  const changed = parseGitStatusPaths(output).filter((file) => {
    const resolved = path.resolve(root, file);
    return isCodeCandidate(file) && fs.existsSync(resolved) && fs.statSync(resolved).isFile();
  });

  const unique = [...new Set(changed)];
  const limit = Number.isFinite(options.limit) && options.limit > 0 ? options.limit : unique.length;
  return unique.slice(0, limit);
}

function suggestTestFile(targetPath, kind, language) {
  const ext = path.extname(targetPath);
  const dir = path.dirname(targetPath);
  const base = path.basename(targetPath, ext);
  if (language === 'python') return path.join('tests', `test_${base}.py`);
  if (language === 'go') return path.join(dir, `${base}_test.go`);
  if (language === 'rust') return path.join('tests', `${base}.rs`);
  if (kind === 'component') return path.join(dir, `${base}.test${ext === '.jsx' ? '.jsx' : '.tsx'}`);
  return path.join(dir, `${base}.test${ext || '.js'}`);
}

function suggestLayers(kind, analysis) {
  const layers = new Set();
  layers.add(kind === 'component' ? 'component' : 'unit');
  if (kind === 'api' || analysis.riskSignals.includes('network') || analysis.riskSignals.includes('database')) {
    layers.add('integration');
  }
  if (kind === 'component') layers.add('interaction');
  if (analysis.branchCount >= 4 || analysis.riskSignals.length > 0) layers.add('regression');
  return Array.from(layers);
}

function buildAcceptanceChecklist(targetRelPath, analysis) {
  const items = [];
  items.push(`AC-001 | P0 | The target module \`${targetRelPath}\` loads without runtime errors.`);
  const symbols = [...analysis.symbols.functions, ...analysis.symbols.classes];
  symbols.slice(0, 6).forEach((symbol, index) => {
    items.push(`AC-${String(index + 2).padStart(3, '0')} | P0 | Primary behavior of \`${symbol}\` is verified against expected input/output.`);
  });
  if (analysis.kind === 'component') {
    items.push(`AC-${String(items.length + 1).padStart(3, '0')} | P0 | Base render and primary user interaction states are covered.`);
  }
  if (analysis.asyncCount > 0) {
    items.push(`AC-${String(items.length + 1).padStart(3, '0')} | P1 | Async success and failure paths are covered.`);
  }
  return items;
}

function buildRegressionChecklist(analysis) {
  const items = ['RG-001 | P0 | Existing public behavior remains unchanged for current callers.'];
  if (analysis.branchCount > 0) items.push('RG-002 | P0 | Conditional branches and fallback paths have regression assertions.');
  if (analysis.riskSignals.includes('auth')) items.push('RG-003 | P0 | Auth/token handling does not regress on invalid or missing credentials.');
  if (analysis.riskSignals.includes('network')) items.push('RG-004 | P1 | Network error and timeout behavior stays stable.');
  if (analysis.riskSignals.includes('database')) items.push('RG-005 | P1 | Persistence-side effects and query failures are exercised.');
  if (analysis.kind === 'component') items.push('RG-006 | P1 | Interaction and accessibility regressions are checked at UI level.');
  return items;
}

function buildCodexPlaybook(targetRelPath, stack, analysis, files) {
  const lines = [];
  lines.push('# Codex Testing Playbook');
  lines.push('');
  lines.push(`Target file: \`${targetRelPath}\``);
  lines.push(`Target kind: ${analysis.kind}`);
  lines.push(`Complexity: ${analysis.complexity}`);
  lines.push(`Suggested test file: \`${analysis.suggestedTestFile}\``);
  lines.push(`Suggested layers: ${analysis.suggestedLayers.join(', ')}`);
  lines.push(`Preferred test command: ${stack.commands.test || 'detect from repository'}`);
  lines.push('');
  lines.push('## Workflow');
  lines.push('1. Read the target file and any nearby tests.');
  lines.push('2. Add or update the smallest useful test diff first.');
  lines.push('3. Cover acceptance items before adding deeper regression cases.');
  lines.push('4. Add regression checks for risk signals and branch-heavy logic.');
  lines.push('5. Run the most relevant verification command available.');
  lines.push('');
  lines.push('## Acceptance Checklist');
  for (const item of analysis.acceptanceChecklist) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Regression Checklist');
  for (const item of analysis.regressionChecklist) lines.push(`- ${item}`);
  lines.push('');
  lines.push('## Generated Artifacts');
  lines.push(`- Test plan: ${files.planPath}`);
  lines.push(`- Acceptance checklist: ${files.acceptancePath}`);
  lines.push(`- Regression checklist: ${files.regressionPath}`);
  return `${lines.join('\n')}\n`;
}

function analyzeTarget(root, targetFile) {
  const resolved = path.resolve(root, targetFile);
  if (!fs.existsSync(resolved)) throw new Error(`Target file not found: ${targetFile}`);

  const content = fs.readFileSync(resolved, 'utf8');
  const relativePath = path.relative(root, resolved);
  const language = targetLanguage(resolved);
  const kind = detectTargetKind(content, relativePath);
  const symbols = extractSymbols(content);
  const analysis = {
    targetFile: resolved,
    relativePath,
    language,
    kind,
    lineCount: content.split('\n').length,
    functionCount: symbols.functions.length,
    classCount: symbols.classes.length,
    asyncCount: countMatches(content, /\basync\b/g),
    branchCount: countMatches(content, /\bif\b|\bswitch\b|\bcase\b|\bcatch\b|\bfor\b|\bwhile\b|\?/g),
    importCount: countMatches(content, /\bimport\b|require\s*\(/g),
    symbols,
    riskSignals: detectRiskSignals(content),
  };

  analysis.suggestedTestFile = suggestTestFile(relativePath, kind, language);
  analysis.suggestedLayers = suggestLayers(kind, analysis);
  analysis.acceptanceChecklist = buildAcceptanceChecklist(relativePath, analysis);
  analysis.regressionChecklist = buildRegressionChecklist(analysis);
  analysis.complexity = analysis.branchCount >= 8 || analysis.riskSignals.length >= 2
    ? 'high'
    : analysis.branchCount >= 4 || analysis.asyncCount > 0
      ? 'medium'
      : 'low';

  return analysis;
}

async function generateTestingPack(root, targetFile, options = {}) {
  const stack = detectProjectStack(root);
  const analysis = analyzeTarget(root, targetFile);
  const slug = slugifyTarget(analysis.relativePath.replace(/\.[^.]+$/, ''));
  const packDir = path.resolve(options.outDir || path.join(root, '.oma', 'testing', slug));
  const files = {
    planPath: path.join(packDir, 'test-plan.md'),
    acceptancePath: path.join(packDir, 'acceptance-checklist.md'),
    regressionPath: path.join(packDir, 'regression-checklist.md'),
    promptPath: path.join(packDir, 'codex-testing-playbook.md'),
    metadataPath: path.join(packDir, 'metadata.json'),
  };

  await fsp.mkdir(packDir, { recursive: true });

  const plan = [
    '# Test Plan',
    '',
    `Target: \`${analysis.relativePath}\``,
    `Kind: ${analysis.kind}`,
    `Complexity: ${analysis.complexity}`,
    `Suggested test file: \`${analysis.suggestedTestFile}\``,
    `Suggested layers: ${analysis.suggestedLayers.join(', ')}`,
    `Preferred test command: ${stack.commands.test || 'detect in repo'}`,
    '',
    '## Detected Risk Signals',
    ...(analysis.riskSignals.length > 0 ? analysis.riskSignals.map((item) => `- ${item}`) : ['- none detected']),
    '',
    '## Suggested Execution Order',
    '1. Add or update focused tests for the target file.',
    '2. Cover acceptance checklist items first.',
    '3. Add regression cases for branches, async behavior, and identified risk signals.',
    '4. Run targeted tests, then broader verification if available.',
    '',
  ].join('\n');

  const acceptance = ['# Acceptance Checklist', '', ...analysis.acceptanceChecklist.map((item) => `- ${item}`), ''].join('\n');
  const regression = ['# Regression Checklist', '', ...analysis.regressionChecklist.map((item) => `- ${item}`), ''].join('\n');
  const playbook = buildCodexPlaybook(analysis.relativePath, stack, analysis, files);

  await Promise.all([
    fsp.writeFile(files.planPath, `${plan}\n`, 'utf8'),
    fsp.writeFile(files.acceptancePath, `${acceptance}\n`, 'utf8'),
    fsp.writeFile(files.regressionPath, `${regression}\n`, 'utf8'),
    fsp.writeFile(files.promptPath, playbook, 'utf8'),
    fsp.writeFile(files.metadataPath, `${JSON.stringify({ stack, analysis }, null, 2)}\n`, 'utf8'),
  ]);

  return {
    stack,
    analysis,
    packDir,
    files,
  };
}

async function generateTestingPacksForChanged(root, options = {}) {
  const files = listChangedCodeFiles(root, options);
  const results = [];
  for (const targetFile of files) {
    results.push(await generateTestingPack(root, targetFile, options));
  }
  return {
    totalChanged: files.length,
    files,
    results,
  };
}

module.exports = {
  analyzeTarget,
  detectProjectStack,
  generateTestingPack,
  generateTestingPacksForChanged,
  listChangedCodeFiles,
};
