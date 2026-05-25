const fs = require('fs');
const path = require('path');

/**
 * Config generation for oh-my-antigravity.
 *
 * Unlike Codex (TOML config.toml), Antigravity 2.0 uses:
 *   - JSON MCP config at ~/.gemini/config/mcp_config.json
 *   - Markdown rules at GEMINI.md
 *
 * The GEMINI.md skills block is the fix for the 2.0 discovery bug: the agent's
 * system prompt does not reliably inject the global skills directory path, so
 * we list the installed skills (name + description + SKILL.md path) directly in
 * the rules file, which IS always injected. See docs and project memory.
 */

// ---------------------------------------------------------------------------
// MCP config (JSON)
// ---------------------------------------------------------------------------

const MANAGED_MCP_NAMES = ['oma_state', 'oma_memory', 'oma_trace'];

function buildManagedMcpServers(root) {
  const node = process.execPath || 'node';
  const server = (file) => path.join(root, 'src', 'mcp', file);
  return {
    oma_state: { command: node, args: [server('state-server.js')], env: {} },
    oma_memory: { command: node, args: [server('memory-server.js')], env: {} },
    oma_trace: { command: node, args: [server('trace-server.js')], env: {} },
  };
}

/**
 * Idempotently register the oh-my-antigravity MCP servers in a JSON mcp_config.
 * Preserves any user-defined servers. Returns the list of managed server names.
 */
function mergeMcpConfig(configFile, root, options = {}) {
  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
  }

  let data = { mcpServers: {} };
  if (fs.existsSync(configFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (parsed && typeof parsed === 'object') data = parsed;
    } catch {
      // Corrupt/non-JSON: start fresh but don't crash the install.
    }
  }
  if (!data.mcpServers || typeof data.mcpServers !== 'object') {
    data.mcpServers = {};
  }

  const managed = buildManagedMcpServers(root);
  for (const [name, cfg] of Object.entries(managed)) {
    data.mcpServers[name] = cfg;
  }

  if (options.enableContext7) {
    data.mcpServers.context7 = {
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp'],
      env: {},
    };
  }

  if (!options.dryRun) {
    fs.writeFileSync(configFile, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
  return Object.keys(managed);
}

// ---------------------------------------------------------------------------
// GEMINI.md skills injection (the Antigravity 2.0 discovery fix)
// ---------------------------------------------------------------------------

const GEMINI_START = '<!-- oh-my-antigravity managed: skills (do not edit inside) -->';
const GEMINI_END = '<!-- end oh-my-antigravity managed: skills -->';

/**
 * Build the managed GEMINI.md block listing every installed skill so the agent
 * can discover them even when Antigravity does not auto-inject the skills dir.
 *
 * `skills` is an array of { name, description } and `skillsDir` is the absolute
 * directory the skills were installed into.
 */
function buildGeminiSkillsBlock(skills, skillsDir) {
  const sorted = [...skills].sort((a, b) => a.name.localeCompare(b.name));
  const lines = [
    GEMINI_START,
    '',
    '## oh-my-antigravity skills',
    '',
    `${sorted.length} skills are installed at \`${skillsDir}\`.`,
    'Antigravity 2.0 does not always advertise the global skills directory in the',
    'agent prompt, so they are listed here. When a task matches a skill below, you',
    'MUST `view_file` its `SKILL.md` and follow the instructions before proceeding.',
    '',
  ];
  for (const skill of sorted) {
    const desc = (skill.description || '').replace(/\s+/g, ' ').trim();
    const skillFile = path.join(skillsDir, skill.name, 'SKILL.md');
    lines.push(`- **${skill.name}** — ${desc} · \`${skillFile}\``);
  }
  lines.push('', GEMINI_END);
  return lines.join('\n');
}

function stripGeminiBlock(content) {
  const start = content.indexOf(GEMINI_START);
  if (start < 0) return content;
  const end = content.indexOf(GEMINI_END, start);
  if (end < 0) return content;
  const before = content.slice(0, start);
  const after = content.slice(end + GEMINI_END.length);
  return `${before.trimEnd()}\n\n${after.trimStart()}`.trim();
}

/**
 * Inject (or refresh) the managed skills block into a GEMINI.md rules file.
 * Idempotent: an existing managed block is replaced, user content is preserved.
 */
function injectGeminiSkills(geminiFile, skills, skillsDir, options = {}) {
  let existing = fs.existsSync(geminiFile) ? fs.readFileSync(geminiFile, 'utf8') : '';
  existing = stripGeminiBlock(existing);

  const block = buildGeminiSkillsBlock(skills, skillsDir);
  const output = existing.trim()
    ? `${existing.trim()}\n\n${block}\n`
    : `${block}\n`;

  if (!options.dryRun) {
    fs.mkdirSync(path.dirname(geminiFile), { recursive: true });
    fs.writeFileSync(geminiFile, output, 'utf8');
  }
  return skills.length;
}

module.exports = {
  MANAGED_MCP_NAMES,
  buildManagedMcpServers,
  mergeMcpConfig,
  buildGeminiSkillsBlock,
  injectGeminiSkills,
};
