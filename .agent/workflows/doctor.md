---
description: Diagnose current environment and verify required tools for Antigravity
owner: "@maintainers"
maturity: core
last-reviewed: "2026-02-06"
---

# Antigravity Doctor

## Task: Run Environment Diagnostics

You are the Antigravity Doctor. Your job is to ensure the **body** (CLI tools) is ready to support the **brain** (Agents).

### Step 1: Check Antigravity Structure

```bash
# Check if .agent directory exists
if [ -d ".agent" ]; then echo ".agent found"; else echo "MISSING: .agent directory"; fi

# Check for essential subdirectories
if [ -d ".agent/skills" ]; then echo "skills found"; else echo "MISSING: skills directory"; fi
if [ -d ".agent/workflows" ]; then echo "workflows found"; else echo "MISSING: workflows directory"; fi
```

### Step 2: Check Required CLI Tools

Antigravity agents rely on standard CLI tools for "hard" skills (search, listing, etc).

```bash
# Function to check tool existence
check_tool() {
  if command -v "$1" &> /dev/null; then
    echo "✅ $1: $(command -v $1)"
  else
    echo "❌ $1: NOT FOUND (Required for: $2)"
  fi
}

check_tool "fd" "Fast file finding (used by explorer)"
check_tool "rg" "Fast text search (used by explorer)"
check_tool "sg" "Structural search (ast-grep, used by architect)"
check_tool "gh" "GitHub CLI (used by release/git-master)"
check_tool "git" "Version control"
```

**Diagnosis**:
- If `fd` or `rg` missing: **CRITICAL**. These are essential for codebase navigation.
- If `sg` missing: **WARN**. The Architect will lose X-Ray vision (structural search).
- If `gh` missing: **WARN**. GitHub integrations will fail.

### Step 3: Check Context Engine Compatibility

Verifying that the current environment supports the tool calls expected by the skills.

```bash
# Check if we can run python (often used for advanced scripting)
check_tool "python3" "Scripting & Analysis"
```

---

## Report Format

After running checks, output a report:

```
## Antigravity Doctor Report

### Core Health
[HEALTHY / ISSUES FOUND]

### Toolchain Status
| Tool | Status | Impact if Missing |
|------|--------|-------------------|
| fd   | OK/FAIL| Cannot find files fast |
| rg   | OK/FAIL| Cannot search code |
| sg   | OK/FAIL| Architect is blind to structure |
...

### Issues Found
1. [Issue description]

### Recommended Fixes
[List fixes based on issues, e.g., "brew install fd"]
```

---

## Auto-Fix (if user confirms)

If tools are missing and user is on macOS (detected via `uname -s`), offer to install via Homebrew:

```bash
# Example fix command
brew install fd ripgrep ast-grep gh
```

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
