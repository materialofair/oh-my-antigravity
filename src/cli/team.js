/* eslint-disable no-console */
const path = require('path');
const { createTeamState, transitionPhase } = require('../team/orchestrator');
const { readTeamState, writeTeamState, clearTeamState } = require('../team/state-store');
const { routeTaskToSkills } = require('../router/skill-router');

function usage() {
  console.log('Usage: oma team start "<task>" [--auto] [--max-fix=N] | status | advance <phase> [reason] | cancel | clear');
}

function parseStartArgs(args) {
  const taskParts = [];
  let autoAdvance = false;
  let maxFixAttempts = 3;

  for (let i = 1; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--auto') {
      autoAdvance = true;
      continue;
    }
    if (arg === '--max-fix' && args[i + 1]) {
      maxFixAttempts = Math.max(1, Number(args[i + 1]) || 3);
      i += 1;
      continue;
    }
    if (arg.startsWith('--max-fix=')) {
      maxFixAttempts = Math.max(1, Number(arg.slice('--max-fix='.length)) || 3);
      continue;
    }
    taskParts.push(arg);
  }

  return {
    autoAdvance,
    maxFixAttempts,
    task: taskParts.join(' ').trim(),
  };
}

async function team(args) {
  const sub = args[0];
  const cwd = process.cwd();

  if (!sub || sub === 'help') {
    usage();
    return;
  }

  if (sub === 'start') {
    const { autoAdvance, maxFixAttempts, task } = parseStartArgs(args);
    if (!task) throw new Error('Usage: oma team start "<task>"');
    const state = createTeamState(task, maxFixAttempts, { autoAdvance });
    const routed = routeTaskToSkills(task, { limit: 3, root: path.resolve(__dirname, '..', '..') });
    state.recommended_skills = routed.recommendations.map((item) => item.skill);
    writeTeamState(cwd, state);
    console.log(`team started: phase=${state.phase} auto_advance=${state.auto_advance ? 'on' : 'off'}`);
    console.log(`recommended_skills=${state.recommended_skills.join(',')}`);
    return;
  }

  if (sub === 'status') {
    const state = readTeamState(cwd);
    if (!state) {
      console.log('No team state found.');
      return;
    }
    console.log(`phase=${state.phase} active=${state.active}`);
    console.log(`fix_attempt=${state.current_fix_attempt}/${state.max_fix_attempts}`);
    console.log(`auto_advance=${state.auto_advance === true ? 'on' : 'off'}`);
    if (Array.isArray(state.recommended_skills) && state.recommended_skills.length > 0) {
      console.log(`recommended_skills=${state.recommended_skills.join(',')}`);
    }
    console.log(`task=${state.task_description}`);
    return;
  }

  if (sub === 'advance') {
    const nextPhase = args[1];
    const reason = args.slice(2).join(' ').trim() || undefined;
    if (!nextPhase) throw new Error('Usage: oma team advance <phase> [reason]');

    const state = readTeamState(cwd);
    if (!state) throw new Error('No team state found. Start first with `oma team start`');
    const next = transitionPhase(state, nextPhase, reason);
    writeTeamState(cwd, next);
    console.log(`phase advanced: ${state.phase} -> ${next.phase}`);
    return;
  }

  if (sub === 'cancel') {
    const state = readTeamState(cwd);
    if (!state) {
      console.log('No team state found.');
      return;
    }
    const next = {
      ...state,
      active: false,
      phase: 'cancelled',
      phase_transitions: [
        ...state.phase_transitions,
        {
          from: state.phase,
          to: 'cancelled',
          at: new Date().toISOString(),
          reason: 'manual_cancel',
        },
      ],
    };
    writeTeamState(cwd, next);
    console.log('team cancelled');
    return;
  }

  if (sub === 'clear') {
    clearTeamState(cwd);
    console.log('team state cleared');
    return;
  }

  usage();
}

module.exports = { team };
