#!/usr/bin/env node
// AI_REVIEW: {
//   "ai": "Gemini",
//   "risk": 1,
//   "taste": 9,
//   "comment": "MCP 状态服务器。已添加防崩溃 try-catch 保护，并在出错时提供 clean 报错响应。",
//   "timestamp": "2026-05-28T18:46:00Z"
// }
const { Server } = require('@modelcontextprotocol/sdk/server');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { ListToolsRequestSchema, CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const SUPPORTED_MODES = ['autopilot', 'ultrawork', 'ralph', 'ultraqa', 'plan', 'swarm', 'pipeline', 'ecomode'];

function statePath(cwd, mode) {
  return path.join(cwd, '.oma', 'state', `${mode}-state.json`);
}

function text(data) {
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
}

const server = new Server({ name: 'oma-state', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'state_read',
      description: 'Read mode state',
      inputSchema: {
        type: 'object',
        properties: { mode: { type: 'string', enum: SUPPORTED_MODES }, workingDirectory: { type: 'string' } },
        required: ['mode'],
      },
    },
    {
      name: 'state_write',
      description: 'Write mode state',
      inputSchema: {
        type: 'object',
        properties: {
          mode: { type: 'string', enum: SUPPORTED_MODES },
          state: { type: 'object' },
          workingDirectory: { type: 'string' },
        },
        required: ['mode', 'state'],
      },
    },
    {
      name: 'state_clear',
      description: 'Delete mode state',
      inputSchema: {
        type: 'object',
        properties: { mode: { type: 'string', enum: SUPPORTED_MODES }, workingDirectory: { type: 'string' } },
        required: ['mode'],
      },
    },
    {
      name: 'state_list_active',
      description: 'List active mode states',
      inputSchema: { type: 'object', properties: { workingDirectory: { type: 'string' } } },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args || {};
  const wd = typeof a.workingDirectory === 'string' ? a.workingDirectory : process.cwd();

  if (name === 'state_read') {
    const file = statePath(wd, a.mode);
    if (!fs.existsSync(file)) return text({ exists: false });
    try {
      const raw = await fsp.readFile(file, 'utf8');
      const state = JSON.parse(raw);
      return text({ exists: true, state });
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Failed to read or parse state file: ${err.message}` }],
        isError: true,
      };
    }
  }

  if (name === 'state_write') {
    const file = statePath(wd, a.mode);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, `${JSON.stringify(a.state, null, 2)}\n`, 'utf8');
    return text({ success: true });
  }

  if (name === 'state_clear') {
    const file = statePath(wd, a.mode);
    if (fs.existsSync(file)) await fsp.unlink(file);
    return text({ success: true });
  }

  if (name === 'state_list_active') {
    const stateDir = path.join(wd, '.oma', 'state');
    if (!fs.existsSync(stateDir)) return text({ active: [] });
    const files = (await fsp.readdir(stateDir)).filter((file) => file.endsWith('-state.json'));
    const active = [];
    for (const file of files) {
      try {
        const payload = JSON.parse(await fsp.readFile(path.join(stateDir, file), 'utf8'));
        if (payload && payload.active) active.push(file.replace('-state.json', ''));
      } catch {}
    }
    return text({ active });
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
