<!-- Generated: 2026-01-28 | Updated: 2026-01-28 -->

# oh-my-claudecode

Multi-agent orchestration system for Claude Code CLI, providing intelligent delegation, parallel execution, and IDE-like capabilities through LSP/AST integration.

**Version:** 3.7.7
**Purpose:** Transform Claude Code into a conductor of specialized AI agents
**Inspired by:** oh-my-zsh / oh-my-opencode

## Purpose

oh-my-claudecode enhances Claude Code with:
- **32 specialized agents** across 8 domains with 3-tier model routing (Haiku/Sonnet/Opus)
- **LSP tools** for IDE-like code intelligence (hover, go-to-definition, references, diagnostics)
- **AST tools** for structural code search and transformation via ast-grep
- **Execution modes**: autopilot, ultrawork, ralph-loop, ultrapilot, swarm, pipeline, ecomode
- **Skills system** for reusable workflows and automation

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Project dependencies and npm scripts |
| `tsconfig.json` | TypeScript configuration |
| `CHANGELOG.md` | Version history and release notes |
| `CLAUDE.md` | Main orchestration instructions (loaded by Claude Code) |
| `src/index.ts` | Main entry point - exports `createSisyphusSession()` |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript source code - core library (see `src/AGENTS.md`) |
| `agents/` | Markdown prompt templates for 32 agents |
| `skills/` | 32 skill definitions for workflows |
| `scripts/` | Build scripts, utilities, and automation |
| `docs/` | User documentation and guides |
| `templates/` | Hook and rule templates |
| `benchmark/` | Performance testing framework |

## For AI Agents

### Working In This Directory

1. **Delegation-First Protocol**: You are a CONDUCTOR, not a performer. Delegate substantive work:

   | Work Type | Delegate To | Model |
   |-----------|-------------|-------|
   | Code changes | `executor` / `executor-low` / `executor-high` | sonnet/haiku/opus |
   | Analysis | `architect` / `architect-medium` / `architect-low` | opus/sonnet/haiku |
   | Search | `explore` / `explore-medium` / `explore-high` | haiku/sonnet/opus |
   | UI/UX | `designer` / `designer-low` / `designer-high` | sonnet/haiku/opus |
   | Docs | `writer` | haiku |
   | Security | `security-reviewer` / `security-reviewer-low` | opus/haiku |
   | Build errors | `build-fixer` / `build-fixer-low` | sonnet/haiku |

2. **LSP/AST Tools** (v3.7.5+): Use IDE-like tools for code intelligence:
   - `lsp_hover` - Type info and documentation at position
   - `lsp_goto_definition` - Jump to symbol definition
   - `lsp_find_references` - Find all usages across codebase
   - `lsp_document_symbols` - Get file outline
   - `lsp_workspace_symbols` - Search symbols across workspace
   - `lsp_diagnostics` - Get errors/warnings for single file
   - `lsp_diagnostics_directory` - **Project-wide type checking** (uses tsc or LSP)
   - `lsp_rename` - Preview refactoring across files
   - `lsp_code_actions` - Get available quick fixes
   - `ast_grep_search` - Structural code search with patterns
   - `ast_grep_replace` - AST-aware code transformation

3. **Model Routing**: Match model tier to task complexity:
   - **Haiku** (LOW): Simple lookups, trivial fixes, fast searches
   - **Sonnet** (MEDIUM): Standard implementation, moderate reasoning
   - **Opus** (HIGH): Complex reasoning, architecture, debugging

### Testing Requirements

```bash
npm test              # Run Vitest test suite
npm run build         # TypeScript compilation
npm run lint          # ESLint checks
npm run test:coverage # Coverage report
```

### Common Patterns

```typescript
// Entry point
import { createSisyphusSession } from 'oh-my-claudecode';
const session = createSisyphusSession();

// Agent registration
import { getAgentDefinitions } from './agents/definitions';
const agents = getAgentDefinitions(); // Returns all 32 agents

// Tool access
import { allCustomTools, lspTools, astTools } from './tools';
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code CLI                          │
├─────────────────────────────────────────────────────────────┤
│                  oh-my-claudecode (OMC)                     │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐  │
│  │   Skills    │   Agents    │    Tools    │   Hooks     │  │
│  │ (32 skills) │ (32 agents) │(LSP/AST/REPL)│ (30+ hooks)│  │
│  └─────────────┴─────────────┴─────────────┴─────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Features Layer                             ││
│  │ model-routing | boulder-state | verification | notepad  ││
│  │ delegation-categories | task-decomposer | state-manager ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Agent Summary (32 Total)

### Base Agents (12)
| Agent | Model | Purpose |
|-------|-------|---------|
| architect | opus | Architecture, debugging, root cause analysis |
| researcher | sonnet | Documentation, external API research |
| explore | haiku | Fast codebase pattern search |
| executor | sonnet | Focused task implementation |
| designer | sonnet | UI/UX, component design |
| writer | haiku | Technical documentation |
| vision | sonnet | Image/screenshot analysis |
| critic | opus | Critical plan review |
| analyst | opus | Pre-planning requirements analysis |
| planner | opus | Strategic planning with interviews |
| qa-tester | sonnet | Interactive CLI/service testing |
| scientist | sonnet | Data analysis, hypothesis testing |

### Tiered Variants (20)
- `*-low` (Haiku): architect-low, executor-low, researcher-low, designer-low, scientist-low, explore (base), security-reviewer-low, build-fixer-low, tdd-guide-low, code-reviewer-low
- `*-medium` (Sonnet): architect-medium, explore-medium
- `*-high` (Opus): executor-high, designer-high, explore-high, qa-tester-high, scientist-high, security-reviewer, code-reviewer

## Execution Modes

| Mode | Trigger | Purpose |
|------|---------|---------|
| autopilot | "autopilot", "build me", "I want a" | Full autonomous execution |
| ultrawork | "ulw", "ultrawork" | Maximum parallel agent execution |
| ralph | "ralph", "don't stop until" | Persistence with architect verification |
| ultrapilot | "ultrapilot", "parallel build" | Parallel autopilot with file ownership |
| swarm | "swarm N agents" | N coordinated agents with SQLite task claiming |
| pipeline | "pipeline" | Sequential agent chaining with data passing |
| ecomode | "eco", "efficient", "budget" | Token-efficient parallel execution |

## Skills (32)

Key skills: `autopilot`, `ultrawork`, `ralph`, `ultrapilot`, `plan`, `ralplan`, `deepsearch`, `deepinit`, `frontend-ui-ux`, `git-master`, `tdd`, `security-review`, `code-review`, `research`, `analyze`, `swarm`, `pipeline`, `ecomode`, `cancel`, `learner`, `note`, `hud`, `doctor`, `omc-setup`, `mcp-setup`, `build-fix`, `ultraqa`

## LSP/AST Tools (v3.7.5+)

### LSP Tools (12)
```typescript
// IDE-like code intelligence via Language Server Protocol
lsp_hover              // Type info at position
lsp_goto_definition    // Jump to definition
lsp_find_references    // Find all usages
lsp_document_symbols   // File outline
lsp_workspace_symbols  // Cross-workspace symbol search
lsp_diagnostics        // Single file errors/warnings
lsp_diagnostics_directory  // PROJECT-WIDE type checking
lsp_servers            // List available language servers
lsp_prepare_rename     // Check if rename is valid
lsp_rename             // Preview multi-file rename
lsp_code_actions       // Available refactorings/fixes
lsp_code_action_resolve // Get action details
```

**Supported Languages**: TypeScript, Python, Rust, Go, C/C++, Java, JSON, HTML, CSS, YAML

### AST Tools (2)
```typescript
// Structural code search/transform via ast-grep
ast_grep_search   // Pattern matching with meta-variables ($NAME, $$$ARGS)
ast_grep_replace  // AST-aware code transformation (dry-run by default)
```

**Supported Languages**: JavaScript, TypeScript, TSX, Python, Ruby, Go, Rust, Java, Kotlin, Swift, C, C++, C#, HTML, CSS, JSON, YAML

## State Files

| Path | Purpose |
|------|---------|
| `.omc/state/*.json` | Execution mode state (autopilot, swarm, etc.) |
| `.omc/notepads/` | Plan-scoped wisdom (learnings, decisions, issues) |
| `~/.omc/state/` | Global state |
| `~/.claude/.omc/` | Legacy state (auto-migrated) |

## Dependencies

### Runtime
| Package | Purpose |
|---------|---------|
| `@anthropic-ai/claude-agent-sdk` | Claude Code integration |
| `@ast-grep/napi` | AST-based code search/replace |
| `vscode-languageserver-protocol` | LSP types |
| `zod` | Runtime schema validation |
| `better-sqlite3` | Swarm task coordination |
| `chalk` | Terminal styling |
| `commander` | CLI parsing |

### Development
| Package | Purpose |
|---------|---------|
| `typescript` | Type system |
| `vitest` | Testing framework |
| `eslint` | Linting |
| `prettier` | Code formatting |

## Commands

```bash
npm run build           # Build TypeScript + skill bridge
npm run dev             # Watch mode
npm test                # Run tests
npm run test:coverage   # Coverage report
npm run lint            # ESLint
npm run sync-metadata   # Sync agent/skill metadata
```

## Hook System (30+)

Key hooks in `src/hooks/`:
- `autopilot/` - Full autonomous execution
- `ralph/` - Persistence until verified
- `ultrawork/` - Parallel execution
- `ultrapilot/` - Parallel autopilot with ownership
- `swarm/` - Coordinated multi-agent
- `learner/` - Skill extraction
- `recovery/` - Error recovery
- `rules-injector/` - Rule file injection
- `think-mode/` - Enhanced reasoning

## Configuration

Settings in `~/.claude/settings.local.json` or `.omc-config.json`:

```json
{
  "defaultExecutionMode": "ultrawork",
  "mcpServers": {
    "context7": { "enabled": true },
    "exa": { "enabled": true, "apiKey": "..." }
  }
}
```

<!-- MANUAL: Project-specific notes below this line are preserved on regeneration -->
