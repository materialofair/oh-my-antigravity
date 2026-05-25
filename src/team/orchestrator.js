const TEAM_PHASES = ['team-plan', 'team-prd', 'team-exec', 'team-verify', 'team-fix'];
const TERMINAL_PHASES = ['complete', 'failed', 'cancelled'];

const TRANSITIONS = {
  'team-plan': ['team-prd'],
  'team-prd': ['team-exec'],
  'team-exec': ['team-verify', 'team-fix'],
  'team-verify': ['team-fix', 'complete', 'failed'],
  'team-fix': ['team-exec', 'team-verify', 'complete', 'failed'],
};

function isTerminal(phase) {
  return TERMINAL_PHASES.includes(phase);
}

function createTeamState(taskDescription, maxFixAttempts = 3, options = {}) {
  return {
    active: true,
    phase: 'team-plan',
    task_description: taskDescription,
    auto_advance: options.autoAdvance === true,
    created_at: new Date().toISOString(),
    phase_transitions: [],
    tasks: [],
    max_fix_attempts: maxFixAttempts,
    current_fix_attempt: 0,
  };
}

function transitionPhase(state, to, reason) {
  if (isTerminal(state.phase)) {
    throw new Error(`Cannot transition from terminal phase: ${state.phase}`);
  }

  const allowed = TRANSITIONS[state.phase] || [];
  if (!allowed.includes(to)) {
    throw new Error(`Invalid transition: ${state.phase} -> ${to}`);
  }

  const nextFixAttempt = to === 'team-fix' ? state.current_fix_attempt + 1 : state.current_fix_attempt;

  if (to === 'team-fix' && nextFixAttempt > state.max_fix_attempts) {
    return {
      ...state,
      active: false,
      phase: 'failed',
      phase_transitions: [
        ...state.phase_transitions,
        {
          from: state.phase,
          to: 'failed',
          at: new Date().toISOString(),
          reason: `team-fix loop limit reached (${state.max_fix_attempts})`,
        },
      ],
    };
  }

  return {
    ...state,
    active: !isTerminal(to),
    phase: to,
    current_fix_attempt: nextFixAttempt,
    phase_transitions: [
      ...state.phase_transitions,
      {
        from: state.phase,
        to,
        at: new Date().toISOString(),
        reason,
      },
    ],
  };
}

module.exports = {
  TEAM_PHASES,
  TERMINAL_PHASES,
  createTeamState,
  transitionPhase,
  isTerminal,
};
