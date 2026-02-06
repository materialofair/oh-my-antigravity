---
name: oma-setup
description: Setup and configure oh-my-antigravity  (the ONLY command you need to learn)
owner: @maintainers
maturity: domain
last-reviewed: 2026-02-06
---

# OMA Setup

This is the **only command you need to learn**. After running this, everything else is automatic.

## Graceful Interrupt Handling

**IMPORTANT**: This setup process saves progress after each step. If interrupted (Ctrl+C or connection loss), the setup can resume from where it left off.

### State File Location
- `.oma/state/setup-state.json` - Tracks completed steps

### Resume Detection (Step 0)

Before starting any step, check for existing state:

```bash
# Check for existing setup state
STATE_FILE=".oma/state/setup-state.json"

# Cross-platform ISO date to epoch conversion
iso_to_epoch() {
  local iso_date="$1"
  local epoch=""
  # Try GNU date first (Linux)
  epoch=$(date -d "$iso_date" +%s 2>/dev/null)
  if [ $? -eq 0 ] && [ -n "$epoch" ]; then
    echo "$epoch"
    return 0
  fi
  # Try BSD/macOS date
  local clean_date=$(echo "$iso_date" | sed 's/[+-][0-9][0-9]:[0-9][0-9]$//' | sed 's/Z$//' | sed 's/T/ /')
  epoch=$(date -j -f "%Y-%m-%d %H:%M:%S" "$clean_date" +%s 2>/dev/null)
  if [ $? -eq 0 ] && [ -n "$epoch" ]; then
    echo "$epoch"
    return 0
  fi
  echo "0"
}

if [ -f "$STATE_FILE" ]; then
  # Check if state is stale (older than 24 hours)
  TIMESTAMP_RAW=$(jq -r '.timestamp // empty' "$STATE_FILE" 2>/dev/null)
  if [ -n "$TIMESTAMP_RAW" ]; then
    TIMESTAMP_EPOCH=$(iso_to_epoch "$TIMESTAMP_RAW")
    NOW_EPOCH=$(date +%s)
    STATE_AGE=$((NOW_EPOCH - TIMESTAMP_EPOCH))
  else
    STATE_AGE=999999  # Force fresh start if no timestamp
  fi
  if [ "$STATE_AGE" -gt 86400 ]; then
    echo "Previous setup state is more than 24 hours old. Starting fresh."
    rm -f "$STATE_FILE"
  else
    LAST_STEP=$(jq -r ".lastCompletedStep // 0" "$STATE_FILE" 2>/dev/null || echo "0")
    TIMESTAMP=$(jq -r .timestamp "$STATE_FILE" 2>/dev/null || echo "unknown")
    echo "Found previous setup session (Step $LAST_STEP completed at $TIMESTAMP)"
  fi
fi
```

If state exists, use notify_user to prompt:

**Question:** "Found a previous setup session. Would you like to resume or start fresh?"

**Options:**
1. **Resume from step $LAST_STEP** - Continue where you left off
2. **Start fresh** - Begin from the beginning (clears saved state)

If user chooses "Start fresh":
```bash
rm -f ".oma/state/setup-state.json"
echo "Previous state cleared. Starting fresh setup."
```

### Save Progress Helper

After completing each major step, save progress:

```bash
# Save setup progress (call after each step)
# Usage: save_setup_progress STEP_NUMBER
save_setup_progress() {
  mkdir -p .oma/state
  cat > ".oma/state/setup-state.json" << EOF
{
  "lastCompletedStep": $1,
  "timestamp": "$(date -Iseconds)",
  "configType": "${CONFIG_TYPE:-unknown}"
}
EOF
}
```

### Clear State on Completion

After successful setup completion (Step 7/8), remove the state file:

```bash
rm -f ".oma/state/setup-state.json"
echo "Setup completed successfully. State cleared."
```

## Usage Modes

This skill handles three scenarios:

1. **Initial Setup (no flags)**: First-time installation wizard
2. **Local Configuration (`--local`)**: Configure project-specific settings (GEMINI.md)
3. **Global Configuration (`--global`)**: Configure global settings (~/.gemini/antigravity/GEMINI.md)

## Mode Detection

Check for flags in the user's invocation:
- If `--local` flag present → Skip to Local Configuration (Step 2A)
- If `--global` flag present → Skip to Global Configuration (Step 2B)
- If no flags → Run Initial Setup wizard (Step 1)

## Step 1: Initial Setup Wizard (Default Behavior)

**Note**: If resuming and lastCompletedStep >= 1, skip to the appropriate step based on configType.

Use the notify_user tool to prompt the user:

**Question:** "Where should I configure oh-my-antigravity ?"

**Options:**
1. **Local (this project)** - Creates `GEMINI.md` in current project directory. Best for project-specific configurations.
2. **Global (all projects)** - Creates `~/.gemini/antigravity/GEMINI.md` for all Antigravity sessions. Best for consistent behavior everywhere.

## Step 2A: Local Configuration (--local flag or user chose LOCAL)

**CRITICAL**: This ALWAYS downloads fresh GEMINI.md from GitHub to the local project. DO NOT use the Write tool - use bash curl exclusively.

### Download Fresh GEMINI.md

```bash
# Extract old version before download
OLD_VERSION=$(grep -m1 "^# oh-my-antigravity " GEMINI.md 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "none")

# Backup existing GEMINI.md before overwriting (if it exists)
if [ -f "GEMINI.md" ]; then
  BACKUP_DATE=$(date +%Y-%m-%d)
  BACKUP_PATH="GEMINI.md.backup.${BACKUP_DATE}"
  cp GEMINI.md "$BACKUP_PATH"
  echo "Backed up existing GEMINI.md to $BACKUP_PATH"
fi

# Download fresh GEMINI.md from GitHub
curl -fsSL "https://raw.githubusercontent.com/Yeachan-Heo/oh-my-antigravity /main/GEMINI.md" -o GEMINI.md && \
echo "Downloaded GEMINI.md to GEMINI.md"

# Extract new version and report
NEW_VERSION=$(grep -m1 "^# oh-my-antigravity " GEMINI.md 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
if [ "$OLD_VERSION" = "none" ]; then
  echo "Installed GEMINI.md: $NEW_VERSION"
elif [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "GEMINI.md unchanged: $NEW_VERSION"
else
  echo "Updated GEMINI.md: $OLD_VERSION -> $NEW_VERSION"
fi
```

**Note**: The downloaded GEMINI.md includes Context Persistence instructions with `<remember>` tags for surviving conversation compaction.

**Note**: If an existing GEMINI.md is found, it will be backed up to `GEMINI.md.backup.YYYY-MM-DD` before downloading the new version.

**MANDATORY**: Always run this command. Do NOT skip. Do NOT use Write tool.

**FALLBACK** if curl fails:
Tell user to manually download from:
https://raw.githubusercontent.com/Yeachan-Heo/oh-my-antigravity /main/GEMINI.md

### Confirm Local Configuration Success

After completing local configuration, save progress and report:

```bash
# Save progress - Step 2 complete (Local config)
mkdir -p .oma/state
cat > ".oma/state/setup-state.json" << EOF
{
  "lastCompletedStep": 2,
  "timestamp": "$(date -Iseconds)",
  "configType": "local"
}
EOF
```

**OMA Project Configuration Complete**
- GEMINI.md: Updated with latest configuration from GitHub at ./GEMINI.md
- Backup: Previous GEMINI.md backed up to `GEMINI.md.backup.YYYY-MM-DD` (if existed)
- Scope: **PROJECT** - applies only to this project
- Hooks: Not supported (legacy hooks removed if present)
- Agents: 28+ available (base + tiered variants)
- Model routing: Haiku/Sonnet/Opus based on task complexity

**Note**: This configuration is project-specific and won't affect other projects or global settings.

If `--local` flag was used, clear state and **STOP HERE**:
```bash
rm -f ".oma/state/setup-state.json"
```
Do not continue to HUD setup or other steps.

## Step 2B: Global Configuration (--global flag or user chose GLOBAL)

**CRITICAL**: This ALWAYS downloads fresh GEMINI.md from GitHub to global config. DO NOT use the Write tool - use bash curl exclusively.

### Download Fresh GEMINI.md

```bash
# Extract old version before download
OLD_VERSION=$(grep -m1 "^# oh-my-antigravity " ~/.gemini/antigravity/GEMINI.md 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "none")

# Backup existing GEMINI.md before overwriting (if it exists)
if [ -f "$HOME/GEMINI.md" ]; then
  BACKUP_DATE=$(date +%Y-%m-%d)
  BACKUP_PATH="$HOME/GEMINI.md.backup.${BACKUP_DATE}"
  cp "$HOME/GEMINI.md" "$BACKUP_PATH"
  echo "Backed up existing GEMINI.md to $BACKUP_PATH"
fi

# Download fresh GEMINI.md to global config
curl -fsSL "https://raw.githubusercontent.com/Yeachan-Heo/oh-my-antigravity /main/GEMINI.md" -o ~/.gemini/antigravity/GEMINI.md && \
echo "Downloaded GEMINI.md to ~/.gemini/antigravity/GEMINI.md"

# Extract new version and report
NEW_VERSION=$(grep -m1 "^# oh-my-antigravity " ~/.gemini/antigravity/GEMINI.md 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
if [ "$OLD_VERSION" = "none" ]; then
  echo "Installed GEMINI.md: $NEW_VERSION"
elif [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "GEMINI.md unchanged: $NEW_VERSION"
else
  echo "Updated GEMINI.md: $OLD_VERSION -> $NEW_VERSION"
fi
```

**Note**: If an existing GEMINI.md is found, it will be backed up to `~/.gemini/antigravity/GEMINI.md.backup.YYYY-MM-DD` before downloading the new version.

### Clean Up Legacy Hooks (if present)

Check if old manual hooks exist and remove them to prevent duplicates:

```bash
# Remove legacy bash hook scripts (hooks are not supported)
rm -f ~/.gemini/antigravity/hooks/keyword-detector.sh
rm -f ~/.gemini/antigravity/hooks/stop-continuation.sh
rm -f ~/.gemini/antigravity/hooks/persistent-mode.sh
rm -f ~/.gemini/antigravity/hooks/session-start.sh
echo "Legacy hooks cleaned"
```

Check `~/.gemini/antigravity/settings.json` for manual hook entries. If the "hooks" key exists with UserPromptSubmit, Stop, or SessionStart entries pointing to bash scripts, inform the user:

> **Note**: Found legacy hooks in settings.json. Antigravity does not support hooks; remove the "hooks" section from ~/.gemini/antigravity/settings.json.

### Confirm Global Configuration Success

After completing global configuration, save progress and report:

```bash
# Save progress - Step 2 complete (Global config)
mkdir -p .oma/state
cat > ".oma/state/setup-state.json" << EOF
{
  "lastCompletedStep": 2,
  "timestamp": "$(date -Iseconds)",
  "configType": "global"
}
EOF
```

**OMA Global Configuration Complete**
- GEMINI.md: Updated with latest configuration from GitHub at ~/.gemini/antigravity/GEMINI.md
- Backup: Previous GEMINI.md backed up to `~/.gemini/antigravity/GEMINI.md.backup.YYYY-MM-DD` (if existed)
- Scope: **GLOBAL** - applies to all Antigravity sessions
- Hooks: Not supported (legacy hooks removed if present)
- Agents: 28+ available (base + tiered variants)
- Model routing: Haiku/Sonnet/Opus based on task complexity

If `--global` flag was used, clear state and **STOP HERE**:
```bash
rm -f ".oma/state/setup-state.json"
```
Do not continue to HUD setup or other steps.

## Step 3: Setup HUD Statusline

**Note**: If resuming and lastCompletedStep >= 3, skip to Step 3.5.

The HUD shows real-time status in Antigravity's status bar. **Invoke the hud skill** to set up and configure:

Use the Skill tool to invoke: `hud` with args: `setup`

This will:
1. Install the HUD wrapper script to `~/.gemini/antigravity/hud/oma-hud.mjs`
2. Configure `statusLine` in `~/.gemini/antigravity/settings.json`
3. Report status and prompt to restart if needed

After HUD setup completes, save progress:
```bash
# Save progress - Step 3 complete (HUD setup)
mkdir -p .oma/state
CONFIG_TYPE=$(cat ".oma/state/setup-state.json" 2>/dev/null | grep -oE '"configType":\s*"[^"]+"' | cut -d'"' -f4 || echo "unknown")
cat > ".oma/state/setup-state.json" << EOF
{
  "lastCompletedStep": 3,
  "timestamp": "$(date -Iseconds)",
  "configType": "$CONFIG_TYPE"
}
EOF
```

## Step 3.5: Set Default Execution Mode

Use the notify_user tool to prompt the user:

**Question:** "Which parallel execution mode should be your default when you say 'fast' or 'parallel'?"

**Options:**
1. **ultrawork (maximum capability)** - Uses all agent tiers including Opus for complex tasks. Best for challenging work where quality matters most. (Recommended)
2. **ecomode (token efficient)** - Prefers Haiku/Sonnet agents, avoids Opus. Best for pro-plan users who want cost efficiency.

Store the preference in `~/.gemini/antigravity/.oma-config.json`:

```bash
# Read existing config or create empty object
CONFIG_FILE="$HOME/.gemini/antigravity/.oma-config.json"
mkdir -p "$(dirname "$CONFIG_FILE")"

if [ -f "$CONFIG_FILE" ]; then
  EXISTING=$(cat "$CONFIG_FILE")
else
  EXISTING='{}'
fi

# Set defaultExecutionMode (replace USER_CHOICE with "ultrawork" or "ecomode")
echo "$EXISTING" | jq --arg mode "USER_CHOICE" '. + {defaultExecutionMode: $mode, configuredAt: (now | todate)}' > "$CONFIG_FILE"
echo "Default execution mode set to: USER_CHOICE"
```

**Note**: This preference ONLY affects generic keywords ("fast", "parallel"). Explicit keywords ("ulw", "eco") always override this preference.

## Step 5: Offer MCP Server Configuration

MCP servers extend Antigravity with additional tools (web search, GitHub, etc.).

Ask user: "Would you like to configure MCP servers for enhanced capabilities? (Context7, Exa search, GitHub, etc.)"

If yes, invoke the mcp-setup skill:
```
/oh-my-antigravity :mcp-setup
```

If no, skip to next step.

## Step 6: Detect Upgrade from 2.x

Check if user has existing configuration:
```bash
# Check for existing 2.x artifacts
ls ~/.gemini/antigravity/commands/ralph-loop.md 2>/dev/null || ls ~/.gemini/antigravity/commands/ultrawork.md 2>/dev/null
```

If found, this is an upgrade from 2.x.

## Step 7: Show Welcome Message

### For New Users:

```
OMA Setup Complete!

You don't need to learn any commands. I now have intelligent behaviors that activate automatically.

WHAT HAPPENS AUTOMATICALLY:
- Complex tasks -> I parallelize and delegate to specialists
- "plan this" -> I start a planning interview
- "don't stop until done" -> I persist until verified complete
- "stop" or "cancel" -> I intelligently stop current operation

MAGIC KEYWORDS (optional power-user shortcuts):
Just include these words naturally in your request:

| Keyword | Effect | Example |
|---------|--------|---------|
| ralph | Persistence mode | "ralph: fix the auth bug" |
| ralplan | Iterative planning | "ralplan this feature" |
| ulw | Max parallelism | "ulw refactor the API" |
| eco | Token-efficient mode | "eco refactor the API" |
| plan | Planning interview | "plan the new endpoints" |

**ralph includes ultrawork:** When you activate ralph mode, it automatically includes ultrawork's parallel execution. No need to combine keywords.

MCP SERVERS:
Run /oh-my-antigravity :mcp-setup to add tools like web search, GitHub, etc.

HUD STATUSLINE:
The status bar now shows OMA state. Restart Antigravity to see it.

CLI ANALYTICS (if installed):
- oma           - Full dashboard (stats + agents + cost)
- oma stats     - View token usage and costs
- oma agents    - See agent breakdown by cost
- oma tui       - Launch interactive TUI dashboard

That's it! Just use Antigravity normally.
```

### For Users Upgrading from 2.x:

```
OMA Setup Complete! (Upgraded from 2.x)

GOOD NEWS: Your existing commands still work!
- /ralph, /ultrawork, /plan, etc. all still function

WHAT'S NEW in 3.0:
You no longer NEED those commands. Everything is automatic now:
- Just say "don't stop until done" instead of /ralph
- Just say "fast" or "parallel" instead of /ultrawork
- Just say "plan this" instead of /plan
- Just say "stop" instead of /cancel

MAGIC KEYWORDS (power-user shortcuts):
| Keyword | Same as old... | Example |
|---------|----------------|---------|
| ralph | /ralph | "ralph: fix the bug" |
| ralplan | /ralplan | "ralplan this feature" |
| ulw | /ultrawork | "ulw refactor API" |
| eco | (new!) | "eco fix all errors" |
| plan | /plan | "plan the endpoints" |

HUD STATUSLINE:
The status bar now shows OMA state. Restart Antigravity to see it.

CLI ANALYTICS (if installed):
- oma           - Full dashboard (stats + agents + cost)
- oma stats     - View token usage and costs
- oma agents    - See agent breakdown by cost
- oma tui       - Launch interactive TUI dashboard

Your workflow won't break - it just got easier!
```

## Step 8: Ask About Starring Repository

First, check if `gh` CLI is available and authenticated:

```bash
gh auth status &>/dev/null
```

### If gh is available and authenticated:

Use the notify_user tool to prompt the user:

**Question:** "If you're enjoying oh-my-antigravity , would you like to support the project by starring it on GitHub?"

**Options:**
1. **Yes, star it!** - Star the repository
2. **No thanks** - Skip without further prompts
3. **Maybe later** - Skip without further prompts

If user chooses "Yes, star it!":

```bash
gh api -X PUT /user/starred/Yeachan-Heo/oh-my-antigravity  2>/dev/null && echo "Thanks for starring! ⭐" || true
```

**Note:** Fail silently if the API call doesn't work - never block setup completion.

### If gh is NOT available or not authenticated:

```bash
echo ""
echo "If you enjoy oh-my-antigravity , consider starring the repo:"
echo "  https://github.com/Yeachan-Heo/oh-my-antigravity "
echo ""
```

### Clear Setup State on Completion

After Step 8 completes (regardless of star choice), clear the setup state:

```bash
# Setup complete - clear state file
rm -f ".oma/state/setup-state.json"
echo "Setup completed successfully!"
```

## Keeping Up to Date

After updating oh-my-antigravity , run:
- `/oh-my-antigravity :oma-setup --local` to update project config
- `/oh-my-antigravity :oma-setup --global` to update global config

This ensures you have the newest features and agent configurations.

## Help Text

When user runs `/oh-my-antigravity :oma-setup --help` or just `--help`, display:

```
OMA Setup - Configure oh-my-antigravity 

USAGE:
  /oh-my-antigravity :oma-setup           Run initial setup wizard
  /oh-my-antigravity :oma-setup --local   Configure local project (GEMINI.md)
  /oh-my-antigravity :oma-setup --global  Configure global settings (~/.gemini/antigravity/GEMINI.md)
  /oh-my-antigravity :oma-setup --help    Show this help

MODES:
  Initial Setup (no flags)
    - Interactive wizard for first-time setup
    - Configures GEMINI.md (local or global)
    - Sets up HUD statusline
    - Checks for updates
    - Offers MCP server configuration

  Local Configuration (--local)
    - Downloads fresh GEMINI.md to ./.agent/
    - Backs up existing GEMINI.md to GEMINI.md.backup.YYYY-MM-DD
    - Project-specific settings
    - Use this to update project config after OMA upgrades

  Global Configuration (--global)
    - Downloads fresh GEMINI.md to ~/.gemini/antigravity/
    - Backs up existing GEMINI.md to ~/.gemini/antigravity/GEMINI.md.backup.YYYY-MM-DD
    - Applies to all Antigravity sessions
    - Cleans up legacy hooks
    - Use this to update global config after OMA upgrades

EXAMPLES:
  /oh-my-antigravity :oma-setup           # First time setup
  /oh-my-antigravity :oma-setup --local   # Update this project
  /oh-my-antigravity :oma-setup --global  # Update all projects

For more info: https://github.com/Yeachan-Heo/oh-my-antigravity 
```

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
