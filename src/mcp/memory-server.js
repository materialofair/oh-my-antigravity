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

function memoryPath(cwd) {
  return path.join(cwd, '.oma', 'project-memory.json');
}

function notepadPath(cwd) {
  return path.join(cwd, '.oma', 'notepad.md');
}

function tokenize(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function flattenJson(value, prefix = '') {
  const docs = [];
  if (value === null || value === undefined) return docs;

  if (typeof value !== 'object') {
    docs.push({ id: prefix || 'root', text: `${prefix}: ${String(value)}`, source: 'project-memory' });
    return docs;
  }

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i += 1) {
      const nextPrefix = prefix ? `${prefix}[${i}]` : `[${i}]`;
      docs.push(...flattenJson(value[i], nextPrefix));
    }
    return docs;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    docs.push(...flattenJson(child, nextPrefix));
  }

  return docs;
}

function scoreDocuments(query, docs, limit = 5) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return [];
  const querySet = new Set(queryTokens);

  const df = {};
  const tokenizedDocs = docs.map((doc) => {
    const tokens = tokenize(doc.text);
    const unique = new Set(tokens);
    for (const token of unique) df[token] = (df[token] || 0) + 1;
    return { doc, tokens };
  });

  const idf = {};
  const docCount = Math.max(1, tokenizedDocs.length);
  for (const token of Object.keys(df)) {
    idf[token] = Math.log((docCount + 1) / (df[token] + 1)) + 1;
  }

  const scored = tokenizedDocs.map(({ doc, tokens }) => {
    const tf = {};
    for (const token of tokens) tf[token] = (tf[token] || 0) + 1;

    let dot = 0;
    let qNorm = 0;
    let dNorm = 0;
    for (const token of querySet) {
      const qWeight = idf[token] || 1;
      const dWeight = (tf[token] || 0) * (idf[token] || 1);
      dot += qWeight * dWeight;
      qNorm += qWeight * qWeight;
    }

    for (const [token, freq] of Object.entries(tf)) {
      const weight = freq * (idf[token] || 1);
      dNorm += weight * weight;
    }

    const cosine = qNorm > 0 && dNorm > 0 ? dot / (Math.sqrt(qNorm) * Math.sqrt(dNorm)) : 0;
    const overlap = tokens.filter((token) => querySet.has(token)).length / Math.max(1, querySet.size);
    const score = (cosine * 0.7) + (overlap * 0.3);

    return {
      source: doc.source,
      id: doc.id,
      score: Number(score.toFixed(4)),
      snippet: doc.text.slice(0, 280),
    };
  });

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Number(limit) || 5));
}

async function loadSemanticDocuments(wd) {
  const docs = [];

  const memoryFile = memoryPath(wd);
  if (fs.existsSync(memoryFile)) {
    try {
      const memory = JSON.parse(await fsp.readFile(memoryFile, 'utf8'));
      docs.push(...flattenJson(memory));
    } catch {}
  }

  const notesFile = notepadPath(wd);
  if (fs.existsSync(notesFile)) {
    const raw = await fsp.readFile(notesFile, 'utf8');
    const blocks = raw.split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
    for (let i = 0; i < blocks.length; i += 1) {
      docs.push({
        source: 'notepad',
        id: `note-${i + 1}`,
        text: blocks[i],
      });
    }
  }

  return docs;
}

const server = new Server({ name: 'oma-memory', version: '0.1.0' }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'project_memory_read',
      description: 'Read project memory',
      inputSchema: { type: 'object', properties: { workingDirectory: { type: 'string' } } },
    },
    {
      name: 'project_memory_write',
      description: 'Write project memory',
      inputSchema: {
        type: 'object',
        properties: { memory: { type: 'object' }, workingDirectory: { type: 'string' } },
        required: ['memory'],
      },
    },
    {
      name: 'notepad_read',
      description: 'Read notepad',
      inputSchema: { type: 'object', properties: { workingDirectory: { type: 'string' } } },
    },
    {
      name: 'notepad_write',
      description: 'Append notepad entry',
      inputSchema: {
        type: 'object',
        properties: { content: { type: 'string' }, workingDirectory: { type: 'string' } },
        required: ['content'],
      },
    },
    {
      name: 'memory_search',
      description: 'Semantic search across project memory and notepad',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' },
          workingDirectory: { type: 'string' },
        },
        required: ['query'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const a = args || {};
  const wd = typeof a.workingDirectory === 'string' ? a.workingDirectory : process.cwd();

  if (name === 'project_memory_read') {
    const file = memoryPath(wd);
    if (!fs.existsSync(file)) return text({ exists: false });
    const content = JSON.parse(await fsp.readFile(file, 'utf8'));
    return text({ exists: true, memory: content });
  }

  if (name === 'project_memory_write') {
    const file = memoryPath(wd);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    await fsp.writeFile(file, `${JSON.stringify(a.memory, null, 2)}\n`, 'utf8');
    return text({ success: true });
  }

  if (name === 'notepad_read') {
    const file = notepadPath(wd);
    if (!fs.existsSync(file)) return text({ exists: false, content: '' });
    const content = await fsp.readFile(file, 'utf8');
    return text({ exists: true, content });
  }

  if (name === 'notepad_write') {
    const file = notepadPath(wd);
    await fsp.mkdir(path.dirname(file), { recursive: true });
    const entry = `\n[${new Date().toISOString()}] ${String(a.content)}\n`;
    await fsp.appendFile(file, entry, 'utf8');
    return text({ success: true });
  }

  if (name === 'memory_search') {
    const docs = await loadSemanticDocuments(wd);
    const matches = scoreDocuments(a.query, docs, a.limit);
    return text({
      total_documents: docs.length,
      query: a.query,
      count: matches.length,
      matches,
    });
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
