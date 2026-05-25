const fs = require('fs');
const path = require('path');
const { defaultOutDir, parseFrontmatter, readJsonFile, writeReport } = require('./shared');

function hasRequiredSections(content, sections) {
  return (Array.isArray(sections) ? sections : []).filter((section) => !content.includes(section));
}

function hasRequiredKeywords(content, keywords) {
  const text = content.toLowerCase();
  return (Array.isArray(keywords) ? keywords : []).filter((keyword) => !text.includes(String(keyword).toLowerCase()));
}

function hasForbiddenKeywords(content, keywords) {
  const text = content.toLowerCase();
  return (Array.isArray(keywords) ? keywords : []).filter((keyword) => text.includes(String(keyword).toLowerCase()));
}

async function evaluatePromptCase(root, caseItem, options) {
  const promptPath = path.resolve(root, caseItem.promptFile);
  const content = fs.existsSync(promptPath) ? fs.readFileSync(promptPath, 'utf8') : '';
  const frontmatter = parseFrontmatter(content);
  const details = [];
  let pass = true;

  if (!content) {
    return {
      id: caseItem.id,
      promptFile: promptPath,
      pass: false,
      details: ['prompt file missing'],
    };
  }

  if (!frontmatter) {
    pass = false;
    details.push('missing frontmatter');
  } else {
    for (const key of caseItem.requiredFrontmatter || ['description']) {
      if (!frontmatter[key]) {
        pass = false;
        details.push(`missing frontmatter.${key}`);
      }
    }
  }

  const missingSections = hasRequiredSections(content, caseItem.requiredSections);
  if (missingSections.length > 0) {
    pass = false;
    details.push(`missing sections: ${missingSections.join(', ')}`);
  }

  const missingKeywords = hasRequiredKeywords(content, caseItem.requiredKeywords);
  if (missingKeywords.length > 0) {
    pass = false;
    details.push(`missing keywords: ${missingKeywords.join(', ')}`);
  }

  const forbiddenKeywords = hasForbiddenKeywords(content, caseItem.forbiddenKeywords);
  if (forbiddenKeywords.length > 0) {
    pass = false;
    details.push(`forbidden keywords present: ${forbiddenKeywords.join(', ')}`);
  }

  return {
    id: caseItem.id,
    promptFile: promptPath,
    pass,
    details,
  };
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push('# Prompt LLM Test Report');
  lines.push('');
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Cases: ${summary.total}`);
  lines.push(`Passed: ${summary.passed}`);
  lines.push(`Failed: ${summary.failed}`);
  lines.push('');
  lines.push('| Prompt | Pass | Notes |');
  lines.push('|---|:---:|---|');
  for (const row of summary.results) {
    lines.push(`| ${row.id} | ${row.pass ? 'Y' : 'N'} | ${row.details.join('; ') || '-'} |`);
  }
  return lines.join('\n');
}

async function runPromptsSuite(options = {}) {
  const root = options.root || path.resolve(__dirname, '..', '..');
  const casesPath = options.casesPath || path.join(root, 'tests', 'llm', 'prompt-contract-cases.json');
  const outDir = options.outDir || defaultOutDir(root);
  const cases = readJsonFile(casesPath, []);

  if (!Array.isArray(cases) || cases.length === 0) {
    throw new Error(`Prompt cases not found or empty: ${casesPath}`);
  }

  const results = [];
  for (const caseItem of cases) {
    results.push(await evaluatePromptCase(root, caseItem, options));
  }

  const passed = results.filter((item) => item.pass).length;
  const failed = results.length - passed;
  const summary = {
    generatedAt: new Date().toISOString(),
    suite: 'prompts',
    casesPath,
    total: results.length,
    passed,
    failed,
    pass: failed === 0,
    results,
  };

  const reportPaths = await writeReport(summary, {
    outDir,
    baseName: 'llm-test-prompts-latest',
    markdown: renderMarkdown(summary),
  });

  return {
    ...summary,
    reportPaths,
  };
}

module.exports = {
  runPromptsSuite,
};
