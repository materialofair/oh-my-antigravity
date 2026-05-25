#!/usr/bin/env node
/* eslint-disable no-console */
const { dispatchFromNotifyPayload } = require('../src/notify/dispatch');

async function main() {
  if (!process.argv[2]) return;
  try {
    const payload = JSON.parse(process.argv[2]);
    await dispatchFromNotifyPayload(payload, { cwd: process.cwd(), env: process.env });
  } catch {
    // Ignore malformed payloads and runtime errors to keep notify non-blocking.
  }
}

main();
