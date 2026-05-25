const { buildNotifyEvent } = require('./extensibility/events');
const { dispatchNotifyEvent } = require('./extensibility/dispatcher');
const { applyTeamAutoAdvance } = require('../team/auto-advance');

function pickString(payload, keys) {
  for (const key of keys) {
    const value = payload ? payload[key] : undefined;
    if (typeof value === 'string' && value.trim() !== '') return value;
  }
  return undefined;
}

function normalizeNotifyEventName(rawType) {
  const type = typeof rawType === 'string' ? rawType.trim().toLowerCase() : '';
  if (!type) return null;

  if (type === 'agent-turn-complete' || type === 'turn-complete' || type === 'turn_complete') {
    return 'turn-complete';
  }
  if (type === 'session-start' || type === 'session_start' || type === 'start') {
    return 'session-start';
  }
  if (type === 'session-end' || type === 'session_end' || type === 'session-stop' || type === 'stop' || type === 'end') {
    return 'session-end';
  }
  if (type === 'session-idle' || type === 'session_idle' || type === 'idle') {
    return 'session-idle';
  }
  if (type === 'needs-input' || type === 'needs_input') {
    return 'needs-input';
  }
  if (type === 'pre-tool-use' || type === 'pre_tool_use') {
    return 'pre-tool-use';
  }
  if (type === 'post-tool-use' || type === 'post_tool_use') {
    return 'post-tool-use';
  }
  return null;
}

function toNotifyEvent(payload) {
  const normalizedEvent = normalizeNotifyEventName(
    pickString(payload, ['type', 'event', 'event_type', 'event-type']),
  );
  if (!normalizedEvent) return null;

  return buildNotifyEvent(normalizedEvent, {
    source: 'native',
    session_id: pickString(payload, ['session_id', 'session-id', 'sessionId']),
    thread_id: pickString(payload, ['thread_id', 'thread-id', 'threadId']),
    turn_id: pickString(payload, ['turn_id', 'turn-id', 'turnId']),
    mode: pickString(payload, ['mode']),
    context: {
      cwd: payload ? payload.cwd : undefined,
      payload_type: pickString(payload, ['type']),
      last_assistant_message: pickString(payload, ['last-assistant-message', 'last_assistant_message']),
    },
  });
}

async function dispatchFromNotifyPayload(payload, options = {}) {
  const event = toNotifyEvent(payload);
  if (!event) return { enabled: false, event: 'unsupported', plugin_count: 0, results: [] };
  const dispatch = await dispatchNotifyEvent(event, options);
  const teamAutoAdvance = await applyTeamAutoAdvance(event, { cwd: options.cwd || process.cwd() });
  return {
    ...dispatch,
    team_auto_advance: teamAutoAdvance,
  };
}

module.exports = {
  dispatchFromNotifyPayload,
};
