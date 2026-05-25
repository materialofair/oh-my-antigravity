# oh-my-antigravity

Multi-agent skill pack and workflow orchestration for **Google Antigravity**.
Provides 73 skills, 35 workflows, and an `oma` CLI that installs, catalogs,
routes, and governs them — while working around Antigravity 2.0's global-skill
discovery quirk.

**Version:** 4.0.0
**Architecture:** aligned with [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)
**CLI:** `oma` (`bin/oma.js` → `src/cli/index.js`)

## Antigravity 2.0 discovery (read this first)

Antigravity 2.0.1 does not advertise the global skills directory in the agent
system prompt, so global skills are often undiscovered. This project fixes it by
(a) writing workspace skills to BOTH `.agents/skills` and `.agent/skills`, and
(b) injecting a managed skills block into `GEMINI.md` (name + description +
absolute `SKILL.md` path). See `src/config/generator.js` and `oma doctor`.

## Key files

| File | Description |
|------|-------------|
| `bin/oma.js` | CLI entry point |
| `src/cli/index.js` | Command router (setup, doctor, route, harness, skill, source, team, test, notify) |
| `src/cli/setup.js` | 6-step install; workspace dual-write; GEMINI.md injection |
| `src/utils/paths.js` | Single choke point for all Antigravity target paths |
| `src/config/generator.js` | JSON `mcp_config.json` merge + GEMINI.md skills injection |
| `package.json` | npm scripts (`setup`, `doctor`, `test`, `catalog:*`, `governance:skills`) |
| `GEMINI.md` | Rules file loaded by Antigravity |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | Core JS: cli, catalog, router, harness, merge, config, team, mcp, notify, testing, utils |
| `.agent/skills/local/` | The 73 first-party skills (install source) |
| `.agent/skills/upstream/` | Vendored upstream skill packs (optional) |
| `.agent/workflows/` | 35 workflows (slash commands) |
| `scripts/` | Catalog generation, governance, skill-index, upstream sync |
| `templates/` | rules, code styleguides, AGENTS/merge-config/catalog templates |
| `schemas/`, `prompts/`, `commands/`, `docs/` | Schemas, agent personas, command tomls, docs |

## Install targets

- **Workspace** (`--scope project-local`, recommended): `<ws>/.agents/skills`+`<ws>/.agent/skills`, `<ws>/.agents/workflows`+`<ws>/.agent/workflows`, `<ws>/.agent/rules`, `<ws>/GEMINI.md`.
- **Global** (`--scope user`): `~/.gemini/antigravity/skills`, `~/.gemini/antigravity/global_workflows`, `~/.gemini/config/rules`, `~/.gemini/config/mcp_config.json`, `~/.gemini/GEMINI.md`.

## Common commands

```bash
oma setup --scope project-local   # install into a workspace (recommended)
oma setup --scope user            # install globally (+ GEMINI.md fix)
oma doctor                        # repo health + what Antigravity will discover
oma route "<task>"                # recommend skills for a task
npm test                          # governance + catalog + skill-index + doctor
oma harness lint                  # validate compose graph / layers / intents
```

## Conventions

- Skills are Antigravity SKILL.md files: YAML frontmatter (`name`, `description`
  required) + markdown body. They live in `.agent/skills/local/<name>/SKILL.md`.
- Workflows are invoked as slash commands (`/autopilot`, `/plan`, ...) — these
  are legitimate, not legacy.
- Do NOT use Claude Code `Task(...)`/`TaskOutput` APIs or `~/.claude`/`~/.codex`
  paths in skills; `scripts/check-skill-governance.sh` enforces this.
