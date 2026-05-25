#!/usr/bin/env node
/* eslint-disable no-console */

const path = require('path');
const {
  buildSkillIndex,
  getDefaultSkillIndexPath,
  writeSkillIndex,
} = require('../src/catalog/skill-index');

function parseArgs(argv) {
  const result = {
    json: false,
    outFile: null,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') result.json = true;
    if (arg === '--out' && argv[i + 1]) {
      result.outFile = path.resolve(argv[i + 1]);
      i += 1;
    } else if (arg.startsWith('--out=')) {
      result.outFile = path.resolve(arg.slice('--out='.length));
    }
  }

  return result;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const options = parseArgs(process.argv.slice(2));
  const index = buildSkillIndex(root);
  const outFile = writeSkillIndex(root, index, {
    outFile: options.outFile || getDefaultSkillIndexPath(root),
  });

  if (options.json) {
    console.log(JSON.stringify({
      outFile,
      generatedAt: index.generatedAt,
      counts: index.counts,
      rootFingerprint: index.rootFingerprint,
    }, null, 2));
    return;
  }

  console.log(`Skill index generated: ${index.counts.skillCount} skills -> ${outFile}`);
}

main();
