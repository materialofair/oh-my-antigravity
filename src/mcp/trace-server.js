#!/usr/bin/env node
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

function text(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

async function readJsonl(logDir, last) {
  if (!fs.existsSync(logDir)) return [];
  const files = (await fsp.readdir(logDir)).filter((file) => file.endsWith('.jsonl')).sort();
  const entries = [];

  for (const file of files) {
    const raw = await fsp.readFile(path.join(logDir, file), 'utf8');
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line));
      } catch {}
    }
  }

  if (typeof last === 'number' && last > 0) return entries.slice(-last);
  return entries;
}

function isErrorEntry(entry) {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.ok === false) return true;
  if (typeof entry.status === 'string' && ['error', 'timeout', 'failed'].includes(entry.status)) return true;
  if (typeof entry.error === 'string' && entry.error.trim() !== '') return true;
  if (typeof entry.reason === 'string' && entry.reason.includes('failed')) return true;
  return false;
}

function summarizeByType(entries) {
  const byType = {};
  for (const item of entries) {
    const type = item.type || 'unknown';
    byType[type] = (byType[type] || 0) + 1;
  }
  return byType;
}

function buildRecommendations(entries) {
  const recommendations = [];
  const disabledNotify = entries.filter((entry) => entry.type === 'notify_dispatch' && entry.enabled === false).length;
  const pluginErrors = entries.filter((entry) => entry.type === 'notify_plugin_dispatch' && entry.ok === false).length;
  const teamFixTransitions = entries.filter((entry) => entry.type === 'team_auto_advance' && entry.to === 'team-fix').length;
  const totalErrors = entries.filter((entry) => isErrorEntry(entry)).length;

  if (disabledNotify > 0) {
    recommendations.push({
      skill: 'verify',
      priority: 'high',
      reason: `notify pipeline disabled ${disabledNotify} time(s); enable OMX_NOTIFY_PLUGINS=1 and validate plugins`,
    });
  }

  if (pluginErrors > 0) {
    recommendations.push({
      skill: 'build-fix',
      priority: 'high',
      reason: `notify plugins failed ${pluginErrors} time(s); run notify validate/test and fix plugin runtime`,
    });
  }

  if (teamFixTransitions > 0) {
    recommendations.push({
      skill: 'ultraqa',
      priority: 'medium',
      reason: `team auto-flow entered fix loop ${teamFixTransitions} time(s); run QA loop before advancing`,
    });
  }

  if (totalErrors > 0) {
    recommendations.push({
      skill: 'debug-analysis',
      priority: 'medium',
      reason: `found ${totalErrors} error-like trace entries; investigate root causes before scaling parallel work`,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      skill: 'autopilot',
      priority: 'low',
      reason: 'no major issues detected in traces; continue feature execution',
    });
  }

  return recommendations;
}

function diagnose(entries) {
  const byType = summarizeByType(entries);
  const allErrors = entries.filter((entry) => isErrorEntry(entry));
  const recentErrors = allErrors.slice(-20);
  return {
    total: entries.length,
    byType,
    error_count: allErrors.length,
    recent_errors: recentErrors,
    recommendations: buildRecommendations(entries),
  };
}

const server = new Server({ name: 'oma-trace', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'trace_timeline',
      description: 'Read recent trace entries',
      inputSchema: { type: 'object', properties: { last: { type: 'number' }, workingDirectory: { type: 'string' } } },
    },
    {
      name: 'trace_summary',
      description: 'Get trace summary counters',
      inputSchema: { type: 'object', properties: { workingDirectory: { type: 'string' } } },
    },
    {
      name: 'trace_diagnose',
      description: 'Diagnose trace patterns and recommend next skills',
      inputSchema: { type: 'object', properties: { last: { type: 'number' }, workingDirectory: { type: 'string' } } },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args || {};
  const wd = typeof a.workingDirectory === 'string' ? a.workingDirectory : process.cwd();
  const logsDir = path.join(wd, '.oma', 'logs');

  if (name === 'trace_timeline') {
    const entries = await readJsonl(logsDir, a.last);
    return text({ count: entries.length, entries });
  }

  if (name === 'trace_summary') {
    const entries = await readJsonl(logsDir);
    const byType = summarizeByType(entries);
    return text({ total: entries.length, byType });
  }

  if (name === 'trace_diagnose') {
    const entries = await readJsonl(logsDir, a.last);
    return text(diagnose(entries));
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
