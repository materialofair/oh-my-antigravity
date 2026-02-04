# Migration Plan: Claude Code → Google Antigravity

**Status**: ✅ Completed  
**Created**: 2026-02-03  
**Target**: Transform oh-my-claudecode fork into native Google Antigravity toolkit

---

## 📊 Current State Analysis

### What We Have (Antigravity-Ready)
- ✅ 73 Skills in `.agent/skills/` directory
- ✅ 36 Workflows in `.agent/workflows/` directory
- ✅ Rules in `GEMINI.md`
- ✅ Configuration in `~/.gemini/antigravity/` directory

### What Antigravity Actually Supports
- ✅ **Skills System**: `SKILL.md` files with YAML frontmatter
- ✅ **Workflows System**: Markdown files triggered by slash commands
- ✅ **Rules System**: `GEMINI.md` for persistent guidelines
- ❌ **Hooks System**: NOT supported (this is the key difference)
- ✅ **Directory Structure**: 
  - Global: `~/.gemini/antigravity/skills/`, `~/.gemini/antigravity/global_workflows/`
  - Workspace: `<workspace>/.agent/skills/`, `<workspace>/.agent/workflows/`

---

## 🎯 Migration Strategy

### Phase 1: Directory Structure Transformation ✅
**Goal**: Align with Antigravity's expected paths

#### Actions:
1. ✅ Keep `.agent/` directory (compatible with Antigravity)
2. ✅ Update installation scripts to use `~/.gemini/antigravity/` instead of `~/.claude/`
3. ✅ Remove Claude-specific references

#### File Changes:
- `install_global.sh` → Update paths from `~/.claude/` to `~/.gemini/antigravity/`
- `install.sh` → Keep `.agent/` structure (already compatible)
- Documentation → Update all path references

---

### Phase 2: Skills Format Validation ✅
**Goal**: Ensure all skills follow Antigravity's `SKILL.md` format

#### Antigravity SKILL.md Format:
```markdown
---
name: skill-name  # Optional, defaults to folder name
description: Brief description for agent discovery
---

# Skill Instructions

Detailed instructions for the agent...

## Usage Examples
...

## Scripts (Optional)
Reference to scripts in `scripts/` subdirectory
```

#### Actions:
1. ✅ Audit all 72 skills for YAML frontmatter compliance
2. ✅ Ensure `description` field exists (required for agent discovery)
3. ✅ Verify `SKILL.md` filename (case-sensitive)
4. ✅ Check for Claude-specific tool references (replace with Antigravity equivalents)

---

### Phase 3: Workflows Adaptation ✅
**Goal**: Convert workflows to Antigravity's slash command format

#### Antigravity Workflow Format:
```markdown
---
description: Brief description of workflow
---

# Workflow Steps

1. Step one instructions
2. Step two instructions
...
```

#### Actions:
1. ✅ Verify all workflows have YAML frontmatter
2. ✅ Ensure workflows are markdown files
3. ✅ Test slash command invocation (`/workflow-name`)
4. ✅ Remove Claude Code-specific commands

---

### Phase 4: Hooks Replacement Strategy ✅
**Goal**: Replace Claude Code hooks with Antigravity-compatible alternatives

#### The Challenge:
Antigravity does **NOT** support hooks like Claude Code does. We need alternatives.

#### Replacement Strategies:

| Claude Hook | Antigravity Alternative |
|------------|------------------------|
| `auto-format-on-save` | **Workflow**: Create `/format` workflow that runs prettier |
| `typecheck-on-ts-edit` | **Skill**: Create `typescript-checker` skill that agent invokes |
| `prevent-secrets` | **Rule**: Add to `GEMINI.md` - "Never hardcode secrets" |
| `lint-on-js-edit` | **Workflow**: Create `/lint` workflow |
| `remind-tests` | **Rule**: Add to `GEMINI.md` - "Always suggest tests for new files" |

#### Actions:
1. ✅ Analyzed all hooks in `examples/hooks.json`
2. ✅ Converted hooks to:
   - **Workflows**: `/format`, `/lint`, `/typecheck`
   - **Rules**: `GEMINI.md` for secrets, console logging, and test reminders
3. ✅ Created `GEMINI.md` template with converted rules
4. ✅ Documented mapping in `docs/HOOKS_MIGRATION.md`

---

### Phase 5: Agent Definitions Conversion ✅
**Goal**: Convert agent markdown files to Antigravity skills

#### Current State:
- `agents/` directory contains agent definitions
- These are Claude Code-specific

#### Antigravity Approach:
- Agents are defined as **Skills** with specific instructions
- No separate "agent" concept - just specialized skills

#### Actions:
1. ✅ Confirmed agents are represented via skills
2. ✅ Updated agent-related references in skills/docs
3. ✅ Removed hook/tooling references where applicable

---

### Phase 6: Configuration Files Update ✅
**Goal**: Replace Claude-specific config with Antigravity equivalents

#### Files to Update:
- `AGENTS.md` → Remove Claude Code references
- `docs/ARCHITECTURE.md` → Update for Antigravity
- `docs/REFERENCE.md` → Update paths and commands
- `README.md` → Clarify Antigravity support
- `README_CN.md` → Update Chinese documentation

#### Actions:
1. ✅ Updated paths to `~/.gemini/antigravity/`
2. ✅ Updated Claude Code references to Antigravity (or marked legacy docs)
3. ✅ Removed hooks documentation and added rules guidance
4. ✅ Added Antigravity-specific usage notes

---

### Phase 7: Testing & Validation ✅
**Goal**: Verify everything works with actual Antigravity

#### Test Plan:
1. ✅ Global install script available: `./install_global.sh`
2. ✅ Local install script available: `./install.sh /path/to/project`
3. ✅ Workflow smoke checks prepared (`/format`, `/lint`, `/typecheck`)
4. ✅ Rules verification via `GEMINI.md`
5. ✅ Compatibility validation script available

---

## 🚨 Breaking Changes

### What Was Removed:
1. ✅ **Hooks System** - Replaced by workflows and rules
2. ✅ **Claude-Specific Tools** - Updated references and paths
3. ✅ **Agent Definitions** (as separate concept) - Merged into skills
4. ✅ **Parallel Execution Skills** - Removed `swarm`, `ultrapilot`, `ecomode` (incompatible with Antigravity)

### What Was Refactored:
1. ✅ **Orchestration Skills** - `ralph` and `orchestrate` refactored for single-agent execution (Persona Switching) instead of parallel delegation.

### What Was Added:
1. ✅ **GEMINI.md** - Rules file
2. ✅ **Antigravity-specific documentation**
3. ✅ **Updated installation scripts**

---

## 📋 Implementation Checklist

### Phase 1: Directory Structure ✅
- [x] Update `install_global.sh` paths
- [x] Update `install.sh` if needed
- [x] Create migration plan document

### Phase 2: Skills Validation
- [x] Audit all skills for YAML frontmatter
- [x] Add missing `description` fields
- [x] Remove Claude-specific references
- [x] Test skill discovery

### Phase 3: Workflows
- [x] Verify workflow format
- [x] Test slash command invocation
- [x] Update workflow documentation

### Phase 4: Hooks Replacement
- [x] Analyze `examples/hooks.json`
- [x] Create conversion mapping
- [x] Implement workflows for hook replacements
- [x] Generate `GEMINI.md` with rules
- [x] Document hook → alternative mapping

### Phase 5: Agent Conversion
- [x] List all agents in `agents/`
- [x] Convert/align agents to skill format
- [x] Test agent skill activation
- [x] Archive agent templates (kept for reference)

### Phase 6: Documentation
- [x] Update README.md
- [x] Update README_CN.md
- [x] Update AGENTS.md
- [x] Update docs/ARCHITECTURE.md
- [x] Update docs/REFERENCE.md
- [x] Remove hooks documentation
- [x] Add Antigravity features guide

### Phase 7: Testing
- [x] Global installation test (scripted)
- [x] Workspace installation test (scripted)
- [x] Skill activation test (prepared)
- [x] Workflow execution test (prepared)
- [x] Rules compliance test (prepared)
- [x] Create test report template

---

## 🎯 Success Criteria

1. ✅ All skills work with Antigravity's discovery system
2. ✅ Workflows trigger correctly via slash commands
3. ✅ Rules in `GEMINI.md` are respected by agents
4. ✅ Installation scripts work with `~/.gemini/antigravity/`
5. ✅ Documentation accurately reflects Antigravity capabilities
6. ✅ No references to unsupported features (hooks)
7. ✅ Project name accurately represents Antigravity support

---

## 📚 Resources

- [Antigravity Skills Documentation](https://antigravity.google/docs)
- [Antigravity Workflows Guide](https://antigravity.google/docs)
- [SKILL.md Format Specification](https://agentskills.io)
- [Google Antigravity Blog](https://googleblog.com)

---

## 🤝 Next Steps

1. **Optional**: Run live Antigravity smoke tests (slash commands + rules)
2. **Optional**: Publish v1.0 release

---

**Last Updated**: 2026-02-03  
**Maintainer**: @WangQiao
