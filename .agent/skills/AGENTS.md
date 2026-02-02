<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-01-28 | Updated: 2026-01-28 -->

# skills

32 skill definitions for workflow automation and specialized behaviors.

## Purpose

Skills are reusable workflow templates that can be invoked via `/oh-my-claudecode:skill-name`. Each skill provides:
- Structured prompts for specific workflows
- Activation triggers (manual or automatic)
- Integration with execution modes

## Key Files

### Execution Mode Skills
| File | Skill | Purpose |
|------|-------|---------|
| `autopilot.md` | autopilot | Full autonomous execution from idea to working code |
| `ultrawork.md` | ultrawork | Maximum parallel agent execution |
| `ralph.md` | ralph | Persistence until verified complete |
| `ultrapilot.md` | ultrapilot | Parallel autopilot with file ownership |
| `swarm.md` | swarm | N coordinated agents with task claiming |
| `pipeline.md` | pipeline | Sequential agent chaining |
| `ecomode.md` | ecomode | Token-efficient parallel execution |
| `ultraqa.md` | ultraqa | QA cycling until goal met |

### Planning Skills
| File | Skill | Purpose |
|------|-------|---------|
| `plan.md` | plan | Strategic planning with interview workflow |
| `ralplan.md` | ralplan | Iterative planning (Planner+Architect+Critic) |
| `review.md` | review | Review plan with Critic |
| `analyze.md` | analyze | Deep analysis and investigation |
| `ralph-init.md` | ralph-init | Initialize PRD for structured ralph |

### Code Quality Skills
| File | Skill | Purpose |
|------|-------|---------|
| `code-review.md` | code-review | Comprehensive code review |
| `security-review.md` | security-review | Security vulnerability detection |
| `tdd.md` | tdd | Test-driven development workflow |
| `build-fix.md` | build-fix | Fix build and TypeScript errors |

### Exploration Skills
| File | Skill | Purpose |
|------|-------|---------|
| `deepsearch.md` | deepsearch | Thorough codebase search |
| `deepinit.md` | deepinit | Generate hierarchical AGENTS.md |
| `research.md` | research | Parallel scientist orchestration |

### Utility Skills
| File | Skill | Purpose |
|------|-------|---------|
| `learner.md` | learner | Extract reusable skill from session |
| `note.md` | note | Save notes for compaction resilience |
| `cancel.md` | cancel | Cancel any active OMC mode |
| `hud.md` | hud | Configure HUD display |
| `doctor.md` | doctor | Diagnose installation issues |
| `omc-setup.md` | omc-setup | One-time setup wizard |
| `mcp-setup.md` | mcp-setup | Configure MCP servers |
| `help.md` | help | Usage guide |

### Domain Skills
| File | Skill | Purpose |
|------|-------|---------|
| `frontend-ui-ux.md` | frontend-ui-ux | Designer-developer aesthetic |
| `git-master.md` | git-master | Git expertise, atomic commits |
| `project-session-manager.md` | psm | Isolated dev environments |
| `writer-memory.md` | writer-memory | Agentic memory for writers |
| `release.md` | release | Automated release workflow |
| `local-skills-setup.md` | local-skills-setup | Manage local skills |

## For AI Agents

### Working In This Directory

#### Skill Template Format

```markdown
---
name: skill-name
description: Brief description
triggers:
  - "keyword1"
  - "keyword2"
agent: executor  # Optional: which agent to use
model: sonnet    # Optional: model override
---

# Skill Name

## Purpose
What this skill accomplishes.

## Workflow
1. Step one
2. Step two
3. Step three

## Usage
How to invoke this skill.

## Configuration
Any configurable options.
```

#### Skill Invocation

```bash
# Manual invocation
/oh-my-claudecode:skill-name

# With arguments
/oh-my-claudecode:skill-name arg1 arg2

# Auto-detected from keywords
"autopilot build me a REST API"  # Triggers autopilot skill
```

#### Creating a New Skill

1. Create `new-skill.md` with YAML frontmatter
2. Define purpose, workflow, and usage
3. Add to skill registry (auto-detected from frontmatter)
4. Optionally add activation triggers

### Common Patterns

**Skill chaining:**
```markdown
## Workflow
1. Invoke `explore` agent for context
2. Invoke `architect` for analysis
3. Invoke `executor` for implementation
4. Invoke `qa-tester` for verification
```

**Conditional behavior:**
```markdown
## Workflow
1. Check if tests exist
   - If yes: Run tests first
   - If no: Create test plan
2. Proceed with implementation
```

### Testing Requirements

Skills are tested via integration tests that invoke skills and verify behavior.

## Dependencies

### Internal
- Loaded by skill bridge (`scripts/build-skill-bridge.mjs`)
- References agents from `agents/`
- Uses hooks from `src/hooks/`

### External
None - pure markdown files.

## Skill Categories

| Category | Skills | Trigger Keywords |
|----------|--------|------------------|
| Execution | autopilot, ultrawork, ralph, ultrapilot, swarm, pipeline, ecomode | "autopilot", "ulw", "ralph", "swarm", "eco" |
| Planning | plan, ralplan, review, analyze, ralph-init | "plan this", "analyze" |
| Quality | code-review, security-review, tdd, build-fix | "review", "security", "tdd" |
| Exploration | deepsearch, deepinit, research | "search", "research" |
| Utility | learner, note, cancel, hud, doctor, omc-setup, mcp-setup, help | "stop", "cancel" |
| Domain | frontend-ui-ux, git-master, psm, writer-memory, release | UI context, git context |

## Auto-Activation

Some skills activate automatically based on context:

| Skill | Auto-Trigger Condition |
|-------|----------------------|
| autopilot | "autopilot", "build me", "I want a" |
| ultrawork | "ulw", "ultrawork" |
| ralph | "ralph", "don't stop until" |
| frontend-ui-ux | UI/component work detected |
| git-master | Git operations detected |
| cancel | "stop", "cancel", "abort" |

<!-- MANUAL: -->
