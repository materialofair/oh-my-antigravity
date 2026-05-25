/* eslint-disable no-console */
const { setup } = require('./setup');
const { doctor } = require('./doctor');
const { team } = require('./team');
const { notify } = require('./notify');
const { route } = require('./route');
const { test } = require('./test');

const HELP = `oh-my-antigravity CLI (oma)

Usage:
  oma setup [--scope user|project-local|project] [--force] [--dry-run] [--verbose]
            [--no-skills] [--no-workflows] [--no-rules] [--no-config] [--enable-context7]
  oma doctor
  oma team start "<task>"
  oma team status
  oma team advance <phase> [reason]
  oma team cancel
  oma team clear
  oma route "<task>" [--limit 5] [--json]
  oma test detect-stack [--json]
  oma test analyze <file> [--json]
  oma test changed [--limit <n>] [--out-dir <dir>] [--json]
  oma test gen <file> [--out-dir <dir>] [--json]
  oma test llm <all|skills|router|prompts|workflow> [options]
  oma notify init|status|validate|test [event]
  oma source [list|active|set <fork|upstream>|sync|status]
  oma skill list [--verbose]
  oma skill prefer <name> <source>
  oma skill conflicts
  oma harness graph [--skill <name>]
  oma harness intents
  oma harness lint
  oma harness chain <skill>
  oma help

Scopes:
  user          install globally to ~/.gemini/antigravity (+ GEMINI.md skills block)
  project-local install into the current workspace (.agents/skills + .agent/skills)  [recommended]
  project       minimal workspace setup
`;

function parseScope(args) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--scope') {
      const next = args[i + 1];
      if (!next) throw new Error('Missing value for --scope');
      return next;
    }
    if (arg.startsWith('--scope=')) {
      return arg.slice('--scope='.length);
    }
  }
  return undefined;
}

async function main(args) {
  const command = args[0] || 'help';
  const flags = new Set(args);

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP);
    return;
  }

  if (command === 'setup') {
    await setup({
      scope: parseScope(args.slice(1)),
      force: flags.has('--force'),
      dryRun: flags.has('--dry-run'),
      verbose: flags.has('--verbose'),
      enableContext7: flags.has('--enable-context7'),
      installSkills: !flags.has('--no-skills'),
      installWorkflows: !flags.has('--no-workflows'),
      installRules: !flags.has('--no-rules'),
      installConfig: !flags.has('--no-config'),
    });
    return;
  }

  if (command === 'doctor') {
    await doctor();
    return;
  }

  if (command === 'team') {
    await team(args.slice(1));
    return;
  }

  if (command === 'notify') {
    await notify(args.slice(1));
    return;
  }

  if (command === 'route') {
    await route(args.slice(1));
    return;
  }

  if (command === 'test') {
    await test(args.slice(1));
    return;
  }

  if (command === 'harness') {
    const harness = require('./harness');
    const subcommand = args[1];
    if (subcommand === 'graph') {
      const skillIdx = args.indexOf('--skill');
      const skill = skillIdx !== -1 ? args[skillIdx + 1] : undefined;
      await harness.showGraph({ skill });
      return;
    }
    if (subcommand === 'intents') {
      await harness.showIntents();
      return;
    }
    if (subcommand === 'lint') {
      const issues = await harness.lintHarness();
      process.exit(issues > 0 ? 1 : 0);
    }
    if (subcommand === 'chain') {
      await harness.showChain(args[2]);
      return;
    }
    console.error(`Unknown harness subcommand: ${subcommand}`);
    console.error('Available: graph, intents, lint, chain');
    process.exit(1);
  }

  if (command === 'source') {
    const { source } = require('./source');
    await source(args.slice(1));
    return;
  }

  if (command === 'skill') {
    const { listSkills, setPreference, showConflicts } = require('./skill');
    const subcommand = args[1];

    if (subcommand === 'list') {
      await listSkills({ verbose: flags.has('--verbose') || flags.has('-v') });
      return;
    }
    if (subcommand === 'prefer') {
      const skillName = args[2];
      const source = args[3];
      if (!skillName || !source) {
        console.error('Usage: oma skill prefer <name> <source>');
        process.exit(1);
      }
      await setPreference(skillName, source);
      return;
    }
    if (subcommand === 'conflicts') {
      await showConflicts();
      return;
    }

    console.error(`Unknown skill subcommand: ${subcommand}`);
    console.error('Available: list, prefer, conflicts');
    process.exit(1);
  }

  throw new Error(`Unknown command: ${command}`);
}

module.exports = { main };
