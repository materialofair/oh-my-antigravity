const path = require('path');
const { routeTaskToSkills } = require('../router/skill-router');
const { defaultOutDir, readJsonFile, writeReport } = require('./shared');

function evaluateCase(root, caseItem, limit) {
  const result = routeTaskToSkills(caseItem.query, {
    limit: limit || caseItem.limit || 5,
    root,
  });

  const recommendedSkills = result.recommendations.map((item) => item.skill);
  const details = [];
  let pass = true;

  if (caseItem.expectedTopSkill && recommendedSkills[0] !== caseItem.expectedTopSkill) {
    pass = false;
    details.push(`expected top skill=${caseItem.expectedTopSkill}, received=${recommendedSkills[0] || 'none'}`);
  }

  for (const skill of caseItem.expectedAnySkills || []) {
    if (!recommendedSkills.includes(skill)) {
      pass = false;
      details.push(`missing expected skill=${skill}`);
    }
  }

  for (const skill of caseItem.forbiddenSkills || []) {
    if (recommendedSkills.includes(skill)) {
      pass = false;
      details.push(`forbidden skill present=${skill}`);
    }
  }

  if (typeof caseItem.minConfidence === 'number' && result.confidence < caseItem.minConfidence) {
    pass = false;
    details.push(`confidence ${result.confidence.toFixed(2)} < minConfidence ${caseItem.minConfidence.toFixed(2)}`);
  }

  return {
    id: caseItem.id || caseItem.query,
    query: caseItem.query,
    pass,
    details,
    confidence: result.confidence,
    recommendations: result.recommendations,
  };
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push('# Router LLM Test Report');
  lines.push('');
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Cases: ${summary.total}`);
  lines.push(`Passed: ${summary.passed}`);
  lines.push(`Failed: ${summary.failed}`);
  lines.push('');
  lines.push('| Case | Pass | Confidence | Top Skills | Notes |');
  lines.push('|---|:---:|---:|---|---|');
  for (const row of summary.results) {
    const topSkills = row.recommendations.map((item) => item.skill).join(', ') || '-';
    const notes = row.details.join('; ') || '-';
    lines.push(`| ${row.id} | ${row.pass ? 'Y' : 'N'} | ${row.confidence.toFixed(2)} | ${topSkills} | ${notes} |`);
  }
  return lines.join('\n');
}

async function runRouterSuite(options = {}) {
  const root = options.root || path.resolve(__dirname, '..', '..');
  const casesPath = options.casesPath || path.join(root, 'tests', 'llm', 'router-cases.json');
  const outDir = options.outDir || defaultOutDir(options.cwd || root);
  const cases = readJsonFile(casesPath, []);

  if (!Array.isArray(cases) || cases.length === 0) {
    throw new Error(`Router eval cases not found or empty: ${casesPath}`);
  }

  const results = cases.map((item) => evaluateCase(root, item, options.limit));
  const passed = results.filter((item) => item.pass).length;
  const failed = results.length - passed;
  const summary = {
    generatedAt: new Date().toISOString(),
    suite: 'router',
    casesPath,
    total: results.length,
    passed,
    failed,
    pass: failed === 0,
    results,
  };

  const reportPaths = await writeReport(summary, {
    outDir,
    baseName: 'llm-test-router-latest',
    markdown: renderMarkdown(summary),
  });

  return {
    ...summary,
    reportPaths,
  };
}

module.exports = {
  runRouterSuite,
};
