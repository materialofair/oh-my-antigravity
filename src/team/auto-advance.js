const fs = require('fs/promises');
const path = require('path');
const { readTeamState, writeTeamState } = require('./state-store');
const { transitionPhase } = require('./orchestrator');

const FAILURE_HINT = /\b(fail(?:ed|ure)?|error|exception|timeout|lint|type\s*error|test(?:s)?\s+failed)\b/i;

function isFailureSignal(event) {
  const context = event && typeof event.context === 'object' ? event.context : {};
  const message = String(context.last_assistant_message || '');
  return FAILURE_HINT.test(message);
}

function nextPhaseFor(state, event, failed) {
  const name = event ? event.event : '';
  if (state.phase === 'team-plan' && name === 'turn-complete') return 'team-prd';
  if (state.phase === 'team-prd' && name === 'turn-complete') return 'team-exec';

  if (state.phase === 'team-exec') {
    if (failed) return 'team-fix';
    if (name === 'post-tool-use' || name === 'turn-complete') return 'team-verify';
  }

  if (state.phase === 'team-verify') {
    if (failed) return 'team-fix';
    if (name === 'turn-complete') return 'complete';
  }

  if (state.phase === 'team-fix' && name === 'turn-complete') {
    return failed ? 'failed' : 'team-exec';
  }

  return null;
}

function teamAutoLogPath(cwd) {
  const day = new Date().toISOString().slice(0, 10);
  return path.join(cwd, '.oma', 'logs', `team-auto-${day}.jsonl`);
}

async function appendTeamAutoLog(cwd, payload) {
  const file = teamAutoLogPath(cwd);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.appendFile(file, `${JSON.stringify({ timestamp: new Date().toISOString(), ...payload })}\n`, 'utf8');
}

async function applyTeamAutoAdvance(event, options = {}) {
  const cwd = options.cwd || process.cwd();
  const state = readTeamState(cwd);
  if (!state || !state.active) return { applied: false, reason: 'inactive_or_missing' };
  if (state.auto_advance !== true) return { applied: false, reason: 'auto_advance_disabled' };

  const failed = isFailureSignal(event);
  const nextPhase = nextPhaseFor(state, event, failed);
  if (!nextPhase) return { applied: false, reason: 'no_transition' };

  try {
    const next = transitionPhase(state, nextPhase, `notify:${event.event}${failed ? ':failure' : ''}`);
    writeTeamState(cwd, next);
    const result = { applied: true, from: state.phase, to: next.phase, event: event.event, failed_signal: failed };
    await appendTeamAutoLog(cwd, { type: 'team_auto_advance', ...result });
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await appendTeamAutoLog(cwd, { type: 'team_auto_advance', applied: false, event: event.event, error: message });
    return { applied: false, reason: 'transition_error', error: message };
  }
}

module.exports = {
  applyTeamAutoAdvance,
};
