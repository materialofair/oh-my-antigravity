---
name: doctor
description: Diagnose and fix oh-my-antigravity  installation issues
---

# Doctor Skill

## Task: Run Installation Diagnostics

You are the OMA Doctor - diagnose and fix installation issues.

### Step 1: Check Plugin Version

```bash
# Get installed version
INSTALLED=$(ls ~/.antigravity/plugins/cache/oma/oh-my-antigravity / 2>/dev/null | sort -V | tail -1)
echo "Installed: $INSTALLED"

# Get latest from npm
LATEST=$(npm view oh-my-antigravity version 2>/dev/null)
echo "Latest: $LATEST"
```

**Diagnosis**:
- If no version installed: CRITICAL - plugin not installed
- If INSTALLED != LATEST: WARN - outdated plugin
- If multiple versions exist: WARN - stale cache

### Step 2: Check for Legacy Hooks in settings.json

Read `~/.antigravity/settings.json` and check if there's a `"hooks"` key with entries like:
- `bash $HOME/.antigravity/hooks/keyword-detector.sh`
- `bash $HOME/.antigravity/hooks/persistent-mode.sh`
- `bash $HOME/.antigravity/hooks/session-start.sh`

**Diagnosis**:
- If found: CRITICAL - legacy hooks causing duplicates

### Step 3: Check for Legacy Bash Hook Scripts

```bash
ls -la ~/.antigravity/hooks/*.sh 2>/dev/null
```

**Diagnosis**:
- If `keyword-detector.sh`, `persistent-mode.sh`, `session-start.sh`, or `stop-continuation.sh` exist: WARN - legacy scripts (can cause confusion)

### Step 4: Check ANTIGRAVITY.md

```bash
# Check if ANTIGRAVITY.md exists
ls -la ~/.antigravity/ANTIGRAVITY.md 2>/dev/null

# Check for OMA marker
grep -q "oh-my-antigravity  Multi-Agent System" ~/.antigravity/ANTIGRAVITY.md 2>/dev/null && echo "Has OMA config" || echo "Missing OMA config"
```

**Diagnosis**:
- If missing: CRITICAL - ANTIGRAVITY.md not configured
- If missing OMA marker: WARN - outdated ANTIGRAVITY.md

### Step 5: Check for Stale Plugin Cache

```bash
# Count versions in cache
ls ~/.antigravity/plugins/cache/oma/oh-my-antigravity / 2>/dev/null | wc -l
```

**Diagnosis**:
- If > 1 version: WARN - multiple cached versions (cleanup recommended)

### Step 6: Check for Legacy Curl-Installed Content

Check for legacy agents, commands, and skills installed via curl (before plugin system):

```bash
# Check for legacy agents directory
ls -la ~/.antigravity/agents/ 2>/dev/null

# Check for legacy commands directory
ls -la ~/.antigravity/commands/ 2>/dev/null

# Check for legacy skills directory
ls -la ~/.antigravity/skills/ 2>/dev/null
```

**Diagnosis**:
- If `~/.antigravity/agents/` exists with oh-my-antigravity -related files: WARN - legacy agents (now provided by plugin)
- If `~/.antigravity/commands/` exists with oh-my-antigravity -related files: WARN - legacy commands (now provided by plugin)
- If `~/.antigravity/skills/` exists with oh-my-antigravity -related files: WARN - legacy skills (now provided by plugin)

Look for files like:
- `architect.md`, `researcher.md`, `explore.md`, `executor.md`, etc. in agents/
- `ultrawork.md`, `deepsearch.md`, etc. in commands/
- Any oh-my-antigravity -related `.md` files in skills/

---

## Report Format

After running all checks, output a report:

```
## OMA Doctor Report

### Summary
[HEALTHY / ISSUES FOUND]

### Checks

| Check | Status | Details |
|-------|--------|---------|
| Plugin Version | OK/WARN/CRITICAL | ... |
| Legacy Hooks (settings.json) | OK/CRITICAL | ... |
| Legacy Scripts (~/.antigravity/hooks/) | OK/WARN | ... |
| ANTIGRAVITY.md | OK/WARN/CRITICAL | ... |
| Plugin Cache | OK/WARN | ... |
| Legacy Agents (~/.antigravity/agents/) | OK/WARN | ... |
| Legacy Commands (~/.antigravity/commands/) | OK/WARN | ... |
| Legacy Skills (~/.antigravity/skills/) | OK/WARN | ... |

### Issues Found
1. [Issue description]
2. [Issue description]

### Recommended Fixes
[List fixes based on issues]
```

---

## Auto-Fix (if user confirms)

If issues found, ask user: "Would you like me to fix these issues automatically?"

If yes, apply fixes:

### Fix: Legacy Hooks in settings.json
Remove the `"hooks"` section from `~/.antigravity/settings.json` (keep other settings intact)

### Fix: Legacy Bash Scripts
```bash
rm -f ~/.antigravity/hooks/keyword-detector.sh
rm -f ~/.antigravity/hooks/persistent-mode.sh
rm -f ~/.antigravity/hooks/session-start.sh
rm -f ~/.antigravity/hooks/stop-continuation.sh
```

### Fix: Outdated Plugin
```bash
rm -rf ~/.antigravity/plugins/cache/oh-my-antigravity 
echo "Plugin cache cleared. Restart Antigravity to fetch latest version."
```

### Fix: Stale Cache (multiple versions)
```bash
# Keep only latest version
cd ~/.antigravity/plugins/cache/oma/oh-my-antigravity /
ls | sort -V | head -n -1 | xargs rm -rf
```

### Fix: Missing/Outdated ANTIGRAVITY.md
Fetch latest from GitHub and write to `~/.antigravity/ANTIGRAVITY.md`:
```
WebFetch(url: "https://raw.githubusercontent.com/Yeachan-Heo/oh-my-antigravity /main/docs/ANTIGRAVITY.md", prompt: "Return the complete raw markdown content exactly as-is")
```

### Fix: Legacy Curl-Installed Content

Remove legacy agents, commands, and skills directories (now provided by plugin):

```bash
# Backup first (optional - ask user)
# mv ~/.antigravity/agents ~/.antigravity/agents.bak
# mv ~/.antigravity/commands ~/.antigravity/commands.bak
# mv ~/.antigravity/skills ~/.antigravity/skills.bak

# Or remove directly
rm -rf ~/.antigravity/agents
rm -rf ~/.antigravity/commands
rm -rf ~/.antigravity/skills
```

**Note**: Only remove if these contain oh-my-antigravity -related files. If user has custom agents/commands/skills, warn them and ask before removing.

---

## Post-Fix

After applying fixes, inform user:
> Fixes applied. **Restart Antigravity** for changes to take effect.
