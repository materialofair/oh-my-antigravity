/* eslint-disable no-console */
const path = require('path');
const { routeTaskToSkills } = require('../router/skill-router');

function parseLimit(args) {
  for (const arg of args) {
    if (arg.startsWith('--limit=')) return Number(arg.slice('--limit='.length));
  }
  const index = args.indexOf('--limit');
  if (index >= 0 && args[index + 1]) return Number(args[index + 1]);
  return 5;
}

function parseTask(args) {
  return args.filter((arg) => !arg.startsWith('--limit') && arg !== '--json').join(' ').trim();
}

async function route(args) {
  const json = args.includes('--json');
  const limit = parseLimit(args);
  const task = parseTask(args);
  if (!task) {
    throw new Error('Usage: oma route "<task description>" [--limit 5] [--json]');
  }

  const result = routeTaskToSkills(task, {
    limit,
    root: path.resolve(__dirname, '..', '..'),
  });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log(`task: ${result.task}`);
  console.log(`confidence: ${(result.confidence * 100).toFixed(0)}%`);
  for (const item of result.recommendations) {
    console.log(`- ${item.skill} (score=${item.score}, ${item.rationale})`);
  }
}

module.exports = { route };
