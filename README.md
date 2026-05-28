# oh-my-antigravity

**A multi-agent skill pack and workflow orchestration layer for Google Antigravity.**

*Architecture aligned with [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex); skills ported from the "Oh My" ecosystem.*

> Give your Antigravity agent **148 specialized skills** (99 first-party + 49 vendored upstream) and **35 workflows**, plus a CLI that installs, catalogs, routes, and governs them — and that works around Antigravity 2.0's global-skill discovery quirk.

**📦 npm**: `oh-my-oma@4.1.1` · **CLI**: `oma` · **Node** ≥ 18

---

## Why this exists (Antigravity 2.0 fix)

Antigravity **2.0.1** does not reliably advertise the global skills directory
(`~/.gemini/antigravity/skills/`) in the agent's system prompt — so global skills
you install are often **never discovered**, even though the files are in the right
place. (Workflows have an explicit `global_workflows` path; skills do not.)

`oma` works around this in two ways:

1. **Workspace-first install (recommended).** Skills are written to **both**
   `.agents/skills/` (the 2.0 default) **and** `.agent/skills/` (backward compat),
   which Antigravity searches reliably as `{.agents,.agent}/skills`.
2. **GEMINI.md skills block.** On every install, `oma` injects a managed block into
   the relevant `GEMINI.md` (the rules file that *is* always loaded) listing every
   skill's name, description, and absolute `SKILL.md` path. The agent can then find
   and `view_file` them even when the global skills directory isn't advertised.

Run `oma doctor` to see exactly what Antigravity will discover, including whether
the GEMINI.md block is present.

---

## Install

### Workspace (recommended)

From inside a project (or pass a target dir):

```bash
npm install -g oh-my-oma
cd /path/to/your/project
oma setup --scope project-local
# or: oma setup --scope project-local   run from the repo: ./install.sh /path/to/project
```

Writes: `.agents/skills` + `.agent/skills`, `.agents/workflows` + `.agent/workflows`,
`.agent/rules`, and a skills block in `<project>/GEMINI.md`. **Restart the Antigravity
agent session** so it re-scans.

### Global (all projects)

```bash
oma setup --scope user      # or: ./install_global.sh
```

Writes: `~/.gemini/antigravity/skills`, `~/.gemini/antigravity/global_workflows`,
`~/.gemini/config/rules`, MCP servers into `~/.gemini/config/mcp_config.json`, and a
skills block into `~/.gemini/GEMINI.md` (the discovery fix).

### Verify

```bash
oma doctor
```

---

## CLI

```
oma setup [--scope user|project-local|project] [--force] [--dry-run]
          [--no-skills] [--no-workflows] [--no-rules] [--no-config] [--enable-context7]
oma doctor                       # repo health + what Antigravity will discover
oma route "<task>" [--limit N]   # recommend skills for a task (scored)
oma harness graph|intents|lint|chain <skill>
oma skill list|prefer|conflicts
oma source list|sync|status
oma team start|status|advance|cancel|clear
oma test ...                     # stack detection + test generation
oma help
```

---

## Architecture

```
bin/oma.js              CLI entry → src/cli/index.js
src/
  cli/                  setup, doctor, route, harness, skill, source, team, test, notify
  utils/paths.js        single choke point for all Antigravity targets
  config/generator.js   JSON mcp_config.json merge + GEMINI.md skills injection
  merge/                multi-source skill merge + conflict resolution
  catalog/              skill index, manifest, schema validation
  router/               task → skill scoring (boost + index + layer + intent)
  harness/              compose graph, layer-map, intent-registry
  mcp/                  state / memory / trace MCP servers
  team/, notify/, testing/
.agent/skills/local/    99 first-party skills (install source)
.agent/skills/upstream/ vendored upstream packs: superpowers (14), ecc (35)
.agent/workflows/       35 workflows
templates/, schemas/, prompts/, scripts/, .governance/
```

Skills live in `.agent/skills/local/<name>/SKILL.md`. The catalog and skill-index
are generated; the router and harness read them.

---

## Skills & workflows

**148 skills** spanning:

- **Planning & discovery** — `plan`, `analyst`, `architect`, `explore`, `brainstorming`, `writing-plans`, `executing-plans`, `deep-interview`, `planning-methodology`
- **Execution** — `autopilot`, `ralph`, `ultrawork`, `ultraqa`, `pipeline`, `start-dev`
- **Quality & review** — `aireview`, `code-review`, `security-review`, `critic`, `verification-before-completion`, `verification-loop`, `verify`, `debug-analysis`, `systematic-debugging`, `requesting-code-review`, `receiving-code-review`, `finishing-a-development-branch`
- **Testing** — `tdd`, `tdd-guide`, `test-driven-development`, `tdd-workflow`, `tdd-generator`, `bdd-generator`, `test-coverage`, `test-gen`, `e2e`, `e2e-testing`, `eval-harness`, `qa-tester`, `checkpoint`
- **Engineering patterns** — `api-design`, `mcp-server-patterns`, `claude-api`, `backend-patterns`, `frontend-design`, `frontend-patterns`, `coding-standards`, `refactor-clean`, `ai-slop-cleaner`
- **Research** — `scientist`, `deepsearch`, `research`, `deep-research`, `iterative-retrieval`, `documentation-lookup`, `exa-search`, `market-research`
- **Design & writing** — `designer`, `frontend-ui-ux`, `vision`, `de-ai-writing`, `article-writing`, `brand-voice`, `content-research-writer`
- **Meta & skill self-management** — `skill`, `skill-create`, `skill-development`, `skill-tester`, `skill-debugger`, `skill-quality-analyzer`, `skill-doc-generator`, `update-codemaps`, `update-docs`, `prompt-optimizer`, `learner`, `release`, `doctor`, `writing-skills`, `using-superpowers`

35 workflows are invoked as slash commands, e.g. `/autopilot`, `/ultrawork`,
`/ralph`, `/aireview`, `/research`, `/tdd`, `/doctor`, `/help`.

### Skill packs

| Pack | Skills | Source | Notes |
|---|---|---|---|
| `local` (first-party) | 99 | this repo | Antigravity-native; passes governance for foreign-runtime paths |
| `upstream/superpowers` | 14 | [obra/superpowers](https://github.com/obra/superpowers) | Process discipline (TDD, brainstorming, planning, debugging, review) |
| `upstream/ecc` | 35 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | Engineering patterns (api-design, mcp-server-patterns, claude-api, etc.) |

> **Caveats**
> - Parallel-execution skills (`swarm`, `ultrapilot`) were removed during the Antigravity migration; orchestration is single-agent / persona-switching.
> - `superpowers/subagent-driven-development` and `superpowers/dispatching-parallel-agents` fall back to single-session execution under Antigravity (no `Task`-tool equivalent in Gemini CLI).
> - 2 upstream-vs-local name collisions (`security-review`, `verification-loop`) are auto-resolved by the merger; see `.oma/merge-report.json` after install.

---

## Develop / test

```bash
npm test                  # governance + catalog + skill-index + doctor
npm run catalog:generate  # regenerate catalog from .agent/skills
npm run governance:skills # lint skills for foreign-runtime leakage
oma harness lint          # validate the compose graph / layer-map / intents
```

---

## License & credits

MIT. See [LICENSE](LICENSE).

- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) — the architecture this port follows
- [oh-my-claudecode](https://github.com/yeachan-heo/oh-my-claudecode) — original skill ecosystem
