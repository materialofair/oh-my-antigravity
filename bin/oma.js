#!/usr/bin/env node

/* eslint-disable no-console */
const { main } = require('../scripts/oma-cli');

main(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});

