function buildNotifyEvent(event, payload = {}) {
  return {
    schema_version: '1',
    event,
    timestamp: new Date().toISOString(),
    source: payload.source || 'native',
    context: payload.context || {},
    session_id: payload.session_id,
    thread_id: payload.thread_id,
    turn_id: payload.turn_id,
    mode: payload.mode,
  };
}

module.exports = { buildNotifyEvent };
