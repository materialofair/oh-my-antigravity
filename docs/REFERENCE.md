# Reference Documentation

Complete reference for oh-my-antigravity . For quick start, see the main [README.md](../README.md).

---

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Agents (32 Total)](#agents-32-total)
- [Skills (72 Total)](#skills-72-total)
- [Slash Commands](#slash-commands)
- [Rules System](#rules-system)
- [Magic Keywords](#magic-keywords)
- [Platform Support](#platform-support)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## Installation

oh-my-antigravity installs via the provided scripts and uses Antigravity's standard paths.

### OMA CLI (Recommended)

```bash
# Global
node bin/oma.js setup --scope user

# Project-local
node bin/oma.js setup --scope project-local --target /path/to/project

# Diagnostics / verification
node bin/oma.js doctor
node bin/oma.js verify
```

### Local Installation (Per Project)

```bash
./install.sh /path/to/your/project
```

Installs to:
- Skills → `<project>/.agent/skills/`
- Workflows → `<project>/.agent/workflows/`

### Global Installation (All Projects)

```bash
./install_global.sh
```

Installs to:
- Skills → `~/.gemini/antigravity/skills/`
- Workflows (canonical) → `~/.gemini/antigravity/global_workflows/`
- Workflows (compat discovery links) → `~/.agent/workflows/`, `~/.agents/workflows/`, `~/_agent/workflows/`, `~/_agents/workflows/`

### Requirements

- Antigravity CLI installed
- Node.js available for workflow commands that call `npx`

---

## Configuration

### Project Rules (Recommended)

Place a `GEMINI.md` file in your project root for workspace-specific rules.

### Global Rules

Place a `GEMINI.md` file at:

```
~/.gemini/antigravity/GEMINI.md
```

### Settings

Global settings live in:

```
~/.gemini/antigravity/settings.json
```

Use `/mcp-setup` to configure MCP servers.

### What Configuration Enables

| Feature | Without | With omc Config |
|---------|---------|-----------------|
| Agent delegation | Manual only | Automatic based on task |
| Keyword detection | Disabled | ultrawork, search, analyze |
| Todo continuation | Basic | Enforced completion |
| Model routing | Default | Smart tier selection |
| Skill composition | None | Auto-combines skills |

### Configuration Precedence

If both rules files exist, **project rules take precedence** over global:

```
./GEMINI.md  (project)   →  Overrides  →  ~/.gemini/antigravity/GEMINI.md  (global)
```

### When to Re-run Setup

- **First time**: Run after installation
- **After updates**: Re-run to refresh `GEMINI.md`
- **Different machines**: Run on each machine where you use Antigravity

### Skill Customization

Customize skills by editing:

- Project: `<project>/.agent/skills/<skill>/SKILL.md`
- Global: `~/.gemini/antigravity/skills/<skill>/SKILL.md`

---

## Agents (32 Total)

Always use `oh-my-antigravity :` prefix when calling via Task tool.

### By Domain and Tier

| Domain | LOW (Haiku) | MEDIUM (Sonnet) | HIGH (Opus) |
|--------|-------------|-----------------|-------------|
| **Analysis** | `architect-low` | `architect-medium` | `architect` |
| **Execution** | `executor-low` | `executor` | `executor-high` |
| **Search** | `explore` | `explore-medium` | `explore-high` |
| **Research** | `researcher-low` | `researcher` | - |
| **Frontend** | `designer-low` | `designer` | `designer-high` |
| **Docs** | `writer` | - | - |
| **Visual** | - | `vision` | - |
| **Planning** | - | - | `planner` |
| **Critique** | - | - | `critic` |
| **Pre-Planning** | - | - | `analyst` |
| **Testing** | - | `qa-tester` | `qa-tester-high` |
| **Security** | `security-reviewer-low` | - | `security-reviewer` |
| **Build** | `build-fixer-low` | `build-fixer` | - |
| **TDD** | `tdd-guide-low` | `tdd-guide` | - |
| **Code Review** | `code-reviewer-low` | - | `code-reviewer` |
| **Data Science** | `scientist-low` | `scientist` | `scientist-high` |

### Agent Selection Guide

| Task Type | Best Agent | Model |
|-----------|------------|-------|
| Quick code lookup | `explore` | haiku |
| Find files/patterns | `explore` or `explore-medium` | haiku/sonnet |
| Complex architectural search | `explore-high` | opus |
| Simple code change | `executor-low` | haiku |
| Feature implementation | `executor` | sonnet |
| Complex refactoring | `executor-high` | opus |
| Debug simple issue | `architect-low` | haiku |
| Debug complex issue | `architect` | opus |
| UI component | `designer` | sonnet |
| Complex UI system | `designer-high` | opus |
| Write docs/comments | `writer` | haiku |
| Research docs/APIs | `researcher` | sonnet |
| Analyze images/diagrams | `vision` | sonnet |
| Strategic planning | `planner` | opus |
| Review/critique plan | `critic` | opus |
| Pre-planning analysis | `analyst` | opus |
| Test CLI interactively | `qa-tester` | sonnet |
| Security review | `security-reviewer` | opus |
| Quick security scan | `security-reviewer-low` | haiku |
| Fix build errors | `build-fixer` | sonnet |
| Simple build fix | `build-fixer-low` | haiku |
| TDD workflow | `tdd-guide` | sonnet |
| Quick test suggestions | `tdd-guide-low` | haiku |
| Code review | `code-reviewer` | opus |
| Quick code check | `code-reviewer-low` | haiku |
| Data analysis/stats | `scientist` | sonnet |
| Quick data inspection | `scientist-low` | haiku |
| Complex ML/hypothesis | `scientist-high` | opus |

---

## Skills (72 Total)

### Core Skills

| Skill | Description | Manual Command |
|-------|-------------|----------------|
| `orchestrate` | Multi-agent orchestration mode | - |
| `autopilot` | Full autonomous execution from idea to working code | `/oh-my-antigravity :autopilot` |
| `ultrawork` | Maximum performance with parallel agents | `/oh-my-antigravity :ultrawork` |
| `ultrapilot` | Parallel autopilot with 3-5x speedup | `/oh-my-antigravity :ultrapilot` |
| `swarm` | N coordinated agents with task claiming | `/oh-my-antigravity :swarm` |
| `pipeline` | Sequential agent chaining | `/oh-my-antigravity :pipeline` |
| `ecomode` | Token-efficient parallel execution | `/oh-my-antigravity :ecomode` |
| `ralph` | Self-referential development until completion | `/oh-my-antigravity :ralph` |
| `ralph-init` | Initialize PRD for structured task tracking | `/oh-my-antigravity :ralph-init` |
| `ultraqa` | Autonomous QA cycling workflow | `/oh-my-antigravity :ultraqa` |
| `plan` | Start planning session | `/oh-my-antigravity :plan` |
| `ralplan` | Iterative planning (Planner+Architect+Critic) | `/oh-my-antigravity :ralplan` |
| `review` | Review work plans with critic | `/oh-my-antigravity :review` |

### Enhancement Skills

| Skill | Description | Manual Command |
|-------|-------------|----------------|
| `deepinit` | Hierarchical AGENTS.md codebase documentation | `/oh-my-antigravity :deepinit` |
| `deepsearch` | Thorough multi-strategy codebase search | `/oh-my-antigravity :deepsearch` |
| `analyze` | Deep analysis and investigation | `/oh-my-antigravity :analyze` |
| `research` | Parallel scientist orchestration | `/oh-my-antigravity :research` |
| `frontend-ui-ux` | Designer-turned-developer UI/UX expertise | (silent activation) |
| `git-master` | Git expert for atomic commits and history | (silent activation) |
| `tdd` | TDD enforcement: test-first development | `/oh-my-antigravity :tdd` |
| `learner` | Extract reusable skill from session | `/oh-my-antigravity :learner` |

### Utility Skills

| Skill | Description | Manual Command |
|-------|-------------|----------------|
| `note` | Save notes to compaction-resilient notepad | `/oh-my-antigravity :note` |
| `cancel` | Unified cancellation for all modes | `/oh-my-antigravity :cancel` |
| `omc-setup` | One-time setup wizard | `/oh-my-antigravity :omc-setup` |
| `doctor` | Diagnose and fix installation issues | `/oh-my-antigravity :doctor` |
| `help` | Show OMC usage guide | `/oh-my-antigravity :help` |
| `hud` | Configure HUD statusline | `/oh-my-antigravity :hud` |
| `release` | Automated release workflow | `/oh-my-antigravity :release` |
| `mcp-setup` | Configure MCP servers | `/oh-my-antigravity :mcp-setup` |
| `learn-about-omc` | Usage pattern analysis | `/oh-my-antigravity :learn-about-omc` |
| `writer-memory` | Agentic memory system for writers | `/oh-my-antigravity :writer-memory` |
| `project-session-manager` | Manage isolated dev environments (git worktrees + tmux) | `/oh-my-antigravity :project-session-manager` |
| `local-skills-setup` | Set up and manage local skills | `/oh-my-antigravity :local-skills-setup` |
| `skill` | Manage local skills (list, add, remove, search, edit) | `/oh-my-antigravity :skill` |

---

## Slash Commands

All skills are available as slash commands with the prefix `/oh-my-antigravity :`.

| Command | Description |
|---------|-------------|
| `/oh-my-antigravity :orchestrate <task>` | Activate multi-agent orchestration mode |
| `/oh-my-antigravity :autopilot <task>` | Full autonomous execution |
| `/oh-my-antigravity :ultrawork <task>` | Maximum performance mode with parallel agents |
| `/oh-my-antigravity :ultrapilot <task>` | Parallel autopilot (3-5x faster) |
| `/oh-my-antigravity :swarm <N>:<agent> <task>` | Coordinated agent swarm |
| `/oh-my-antigravity :pipeline <stages>` | Sequential agent chaining |
| `/oh-my-antigravity :ecomode <task>` | Token-efficient parallel execution |
| `/oh-my-antigravity :ralph-init <task>` | Initialize PRD for structured task tracking |
| `/oh-my-antigravity :ralph <task>` | Self-referential loop until task completion |
| `/oh-my-antigravity :ultraqa <goal>` | Autonomous QA cycling workflow |
| `/oh-my-antigravity :plan <description>` | Start planning session |
| `/oh-my-antigravity :ralplan <description>` | Iterative planning with consensus |
| `/oh-my-antigravity :review [plan-path]` | Review a plan with critic |
| `/oh-my-antigravity :deepsearch <query>` | Thorough multi-strategy codebase search |
| `/oh-my-antigravity :deepinit [path]` | Index codebase with hierarchical AGENTS.md files |
| `/oh-my-antigravity :analyze <target>` | Deep analysis and investigation |
| `/oh-my-antigravity :research <topic>` | Parallel research orchestration |
| `/oh-my-antigravity :tdd <feature>` | TDD workflow enforcement |
| `/oh-my-antigravity :learner` | Extract reusable skill from session |
| `/oh-my-antigravity :note <content>` | Save notes to notepad.md |
| `/oh-my-antigravity :cancel` | Unified cancellation |
| `/oh-my-antigravity :omc-setup` | One-time setup wizard |
| `/oh-my-antigravity :doctor` | Diagnose and fix installation issues |
| `/oh-my-antigravity :help` | Show OMC usage guide |
| `/oh-my-antigravity :hud` | Configure HUD statusline |
| `/oh-my-antigravity :release` | Automated release workflow |
| `/oh-my-antigravity :mcp-setup` | Configure MCP servers |

---

## Rules System

Antigravity does not support hooks. Persistent behavior is defined via rules.

- Project rules: `./GEMINI.md`
- Global rules: `~/.gemini/antigravity/GEMINI.md`
- Legacy hook replacements: `docs/HOOKS_MIGRATION.md`

---

## Magic Keywords

Just include these words anywhere in your prompt to activate enhanced modes:

| Keyword | Effect |
|---------|--------|
| `ultrawork`, `ulw`, `uw` | Activates parallel agent orchestration |
| `ecomode`, `eco`, `efficient`, `save-tokens`, `budget` | Token-efficient parallel execution |
| `autopilot`, `build me`, `I want a` | Full autonomous execution |
| `ultrapilot`, `parallel build`, `swarm build` | Parallel autopilot (3-5x faster) |
| `ralph`, `don't stop`, `must complete` | Persistence until verified complete |
| `plan this`, `plan the` | Planning interview workflow |
| `ralplan` | Iterative planning consensus |
| `search`, `find`, `locate` | Enhanced search mode |
| `analyze`, `investigate`, `debug` | Deep analysis mode |
| `research`, `analyze data`, `statistics` | Parallel research orchestration |
| `tdd`, `test first`, `red green` | TDD workflow enforcement |
| `swarm N agents` | Coordinated agent swarm |
| `pipeline`, `chain agents` | Sequential agent chaining |
| `stop`, `cancel`, `abort` | Unified cancellation |

### Examples

```bash
# In Antigravity:

# Maximum parallelism
ultrawork implement user authentication with OAuth

# Token-efficient parallelism
eco fix all TypeScript errors

# Enhanced search
find all files that import the utils module

# Deep analysis
analyze why the tests are failing

# Autonomous execution
autopilot: build a todo app with React

# Parallel autopilot
ultrapilot: build a fullstack todo app

# Persistence mode
ralph: refactor the authentication module

# Planning session
plan this feature

# TDD workflow
tdd: implement password validation

# Coordinated swarm
swarm 5 agents: fix all lint errors

# Agent chaining
pipeline: analyze → fix → test this bug
```

---

## Platform Support

### Operating Systems

| Platform | Install Method |
|----------|----------------|
| **Windows** | `install_global.sh` (Git Bash / WSL) |
| **macOS** | `install_global.sh` |
| **Linux** | `install_global.sh` |

### Available Tools

| Tool | Status | Description |
|------|--------|-------------|
| **Read** | ✅ Available | Read files |
| **Write** | ✅ Available | Create files |
| **Edit** | ✅ Available | Modify files |
| **Bash** | ✅ Available | Run shell commands |
| **Glob** | ✅ Available | Find files by pattern |
| **Grep** | ✅ Available | Search file contents |
| **WebSearch** | ✅ Available | Search the web |
| **WebFetch** | ✅ Available | Fetch web pages |
| **Task** | ✅ Available | Spawn subagents |
| **TodoWrite** | ✅ Available | Track tasks |

### LSP Tools (Real Implementation)

| Tool | Status | Description |
|------|--------|-------------|
| `lsp_hover` | ✅ Implemented | Get type info and documentation at position |
| `lsp_goto_definition` | ✅ Implemented | Jump to symbol definition |
| `lsp_find_references` | ✅ Implemented | Find all usages of a symbol |
| `lsp_document_symbols` | ✅ Implemented | Get file outline (functions, classes, etc.) |
| `lsp_workspace_symbols` | ✅ Implemented | Search symbols across workspace |
| `lsp_diagnostics` | ✅ Implemented | Get errors, warnings, hints |
| `lsp_prepare_rename` | ✅ Implemented | Check if rename is valid |
| `lsp_rename` | ✅ Implemented | Rename symbol across project |
| `lsp_code_actions` | ✅ Implemented | Get available refactorings |
| `lsp_code_action_resolve` | ✅ Implemented | Get details of a code action |
| `lsp_servers` | ✅ Implemented | List available language servers |
| `lsp_diagnostics_directory` | ✅ Implemented | Project-level type checking |

> **Note**: LSP tools require language servers to be installed (typescript-language-server, pylsp, rust-analyzer, gopls, etc.). Use `lsp_servers` to check installation status.

### AST Tools (ast-grep Integration)

| Tool | Status | Description |
|------|--------|-------------|
| `ast_grep_search` | ✅ Implemented | Pattern-based code search using AST matching |
| `ast_grep_replace` | ✅ Implemented | Pattern-based code transformation |

> **Note**: AST tools use [@ast-grep/napi](https://ast-grep.github.io/) for structural code matching. Supports meta-variables like `$VAR` (single node) and `$$$` (multiple nodes).

---

## Troubleshooting

### Diagnose Installation Issues

```bash
/oh-my-antigravity :doctor
```

Checks for:
- Missing dependencies
- Configuration errors
- Hook installation status
- Agent availability
- Skill registration

### Configure HUD Statusline

```bash
/oh-my-antigravity :hud setup
```

Installs or repairs the HUD statusline for real-time status updates.

### Common Issues

| Issue | Solution |
|-------|----------|
| Commands not found | Re-run `/oh-my-antigravity :omc-setup` |
| Rules not applying | Verify `GEMINI.md` exists (project or global) |
| LSP tools not working | Install language servers: `npm install -g typescript-language-server` |
| Token limit errors | Use `/oh-my-antigravity :ecomode` for token-efficient execution |

### Updates

To update, pull the latest repository changes and re-run the installer scripts:

```bash
git pull
./install_global.sh
```

### Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/Yeachan-Heo/oh-my-antigravity /main/scripts/uninstall.sh | bash
```

Or manually remove installed files:

```bash
rm -rf ~/.gemini/antigravity/skills
rm -rf ~/.gemini/antigravity/global_workflows
rm -f ~/.gemini/antigravity/workflows
rm -f ~/.agent/workflows ~/.agents/workflows ~/_agent/workflows ~/_agents/workflows
```

---

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for version history and release notes.

---

## License

MIT - see [LICENSE](../LICENSE)

## Credits

Inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) by code-yeongyu.
