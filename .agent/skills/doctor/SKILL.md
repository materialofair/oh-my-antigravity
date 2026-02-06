---
name: doctor
description: Diagnose and fix oh-my-antigravity  installation issues
owner: @maintainers
maturity: core
last-reviewed: 2026-02-06
---

# Doctor Skill

## Task: Run Installation Diagnostics

You are the OMA Doctor - diagnose and fix installation issues for Antigravity.

### Step 1: Check Global Install

```bash
ls -la ~/.gemini/antigravity/skills 2>/dev/null
ls -la ~/.gemini/antigravity/global_workflows 2>/dev/null
```

**Diagnosis**:
- If directories are missing or empty: CRITICAL - global install not present

### Step 2: Check Project Install (Optional)

```bash
ls -la .agent/skills 2>/dev/null
ls -la .agent/workflows 2>/dev/null
```

**Diagnosis**:
- If missing: WARN - local install not present (only required for this project)

### Step 3: Check Rules File

```bash
ls -la GEMINI.md 2>/dev/null
ls -la ~/.gemini/antigravity/GEMINI.md 2>/dev/null
```

**Diagnosis**:
- If neither exists: WARN - rules not configured

### Step 4: Check for Legacy Hooks

Antigravity does **not** support hooks. Check settings.json for a `"hooks"` key and remove it if present:

```bash
rg -n '"hooks"\s*:' ~/.gemini/antigravity/settings.json 2>/dev/null
```

### Fixes

- **Missing global install**:
  ```bash
  ./install_global.sh
  ```
- **Missing project install**:
  ```bash
  ./install.sh /path/to/project
  ```
- **Missing rules**:
  ```bash
  cp GEMINI.md ~/.gemini/antigravity/GEMINI.md
  ```
- **Legacy hooks present**: Remove the `"hooks"` section from `~/.gemini/antigravity/settings.json`.

### Report Format

Provide a short report with:
- Global install status
- Project install status
- GEMINI.md status
- Legacy hooks status
- Recommended next steps

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
