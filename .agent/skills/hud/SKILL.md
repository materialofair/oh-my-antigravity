---
name: hud
description: Configure HUD display options (layout, presets, display elements)
role: config-writer  # DOCUMENTATION ONLY - This skill writes to ~/.gemini/antigravity/ paths
scope: ~/.gemini/antigravity/**  # DOCUMENTATION ONLY - Allowed write scope
---

# HUD Skill

Configure the OMA HUD (Heads-Up Display) for the statusline.

## Quick Commands

| Command | Description |
|---------|-------------|
| `/oh-my-antigravity :hud` | Show current HUD status (auto-setup if needed) |
| `/oh-my-antigravity :hud setup` | Install/repair HUD statusline |
| `/oh-my-antigravity :hud minimal` | Switch to minimal display |
| `/oh-my-antigravity :hud focused` | Switch to focused display (default) |
| `/oh-my-antigravity :hud full` | Switch to full display |
| `/oh-my-antigravity :hud status` | Show detailed HUD status |

## Auto-Setup

When you run `/oh-my-antigravity :hud` or `/oh-my-antigravity :hud setup`, the system will automatically:
1. Check if `~/.gemini/antigravity/hud/oma-hud.mjs` exists
2. Check if `statusLine` is configured in `~/.gemini/antigravity/settings.json`
3. If missing, create the HUD wrapper script and configure settings
4. Report status and prompt to restart Antigravity if changes were made

**IMPORTANT**: If the argument is `setup` OR if the HUD script doesn't exist at `~/.gemini/antigravity/hud/oma-hud.mjs`, you MUST create the HUD files directly using the instructions below.

### Setup Instructions (Run These Commands)

**Step 1:** Check if setup is needed:
```bash
ls ~/.gemini/antigravity/hud/oma-hud.mjs 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

**Step 2:** Check if the plugin is built (CRITICAL - common issue!):
```bash
# Find the latest version and check if dist/hud/index.js exists
PLUGIN_VERSION=$(ls ~/.gemini/antigravity/plugins/cache/oma/oh-my-antigravity / 2>/dev/null | sort -V | tail -1)
if [ -n "$PLUGIN_VERSION" ]; then
  ls ~/.gemini/antigravity/plugins/cache/oma/oh-my-antigravity /$PLUGIN_VERSION/dist/hud/index.js 2>/dev/null && echo "BUILT" || echo "NOT_BUILT"
fi
```

**⚠️ CRITICAL: If NOT_BUILT, the plugin MUST be compiled before the HUD can work!**

**WHY THIS HAPPENS:** The `dist/` directory contains compiled TypeScript code and is NOT stored on GitHub (it's in .gitignore). When you install the plugin from the marketplace, the build step happens automatically via the `prepare` script during `npm install`. However, if the plugin wasn't properly installed or the build failed, you'll get this error.

**THE FIX:** Run npm install in the plugin directory to build it:
```bash
cd ~/.gemini/antigravity/plugins/cache/oma/oh-my-antigravity /$PLUGIN_VERSION && npm install
```

This will:
1. Install all dependencies
2. Run the `prepare` script which executes `npm run build`
3. Generate the `dist/hud/index.js` file that the HUD wrapper needs

**DO NOT** try to download `dist/hud/index.js` from GitHub raw URLs - it doesn't exist there!

**Step 3:** If oma-hud.mjs is MISSING or argument is `setup`, create the HUD directory and script:

First, create the directory:
```bash
mkdir -p ~/.gemini/antigravity/hud
```

Then, use the Write tool to create `~/.gemini/antigravity/hud/oma-hud.mjs` with this exact content:

```javascript
#!/usr/bin/env node
/**
 * OMA HUD - Statusline Script
 * Wrapper that imports from plugin cache or development paths
 */

import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// Semantic version comparison: returns negative if a < b, positive if a > b, 0 if equal
function semverCompare(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

async function main() {
  const home = homedir();
  let pluginCacheDir = null;

  // 1. Try plugin cache first (marketplace: oma, plugin: oh-my-antigravity )
  const pluginCacheBase = join(home, ".gemini/antigravity/plugins/cache/oma/oh-my-antigravity ");
  if (existsSync(pluginCacheBase)) {
    try {
      const versions = readdirSync(pluginCacheBase);
      if (versions.length > 0) {
        const latestVersion = versions.sort(semverCompare).reverse()[0];
        pluginCacheDir = join(pluginCacheBase, latestVersion);
        const pluginPath = join(pluginCacheDir, "dist/hud/index.js");
        if (existsSync(pluginPath)) {
          await import(pathToFileURL(pluginPath).href);
          return;
        }
      }
    } catch { /* continue */ }
  }

  // 2. Development paths
  const devPaths = [
    join(home, "Workspace/oh-my-antigravity/dist/hud/index.js"),
    join(home, "workspace/oh-my-antigravity/dist/hud/index.js"),
    join(home, "Workspace/oh-my-antigravity /dist/hud/index.js"),
    join(home, "workspace/oh-my-antigravity /dist/hud/index.js"),
  ];

  for (const devPath of devPaths) {
    if (existsSync(devPath)) {
      try {
        await import(pathToFileURL(devPath).href);
        return;
      } catch { /* continue */ }
    }
  }

  // 3. Fallback - HUD not found (provide actionable error message)
  if (pluginCacheDir) {
    console.log(`[OMA] HUD not built. Run: cd "${pluginCacheDir}" && npm install`);
  } else {
    console.log("[OMA] Plugin not found. Run: /oh-my-antigravity :oma-setup");
  }
}

main();
```

**Step 3:** Make it executable:
```bash
chmod +x ~/.gemini/antigravity/hud/oma-hud.mjs
```

**Step 4:** Update settings.json to use the HUD:

Read `~/.gemini/antigravity/settings.json`, then update/add the `statusLine` field.

**IMPORTANT:** The command must use an absolute path, not `~`, because Windows does not expand `~` in shell commands.

First, determine the correct path:
```bash
node -e "const p=require('path').join(require('os').homedir(),'.gemini','antigravity','hud','oma-hud.mjs');console.log(JSON.stringify(p))"
```

Then set the `statusLine` field using the resolved path. On Unix it will look like:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node /home/username/.agent/hud/oma-hud.mjs"
  }
}
```

On Windows it will look like:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node C:\\Users\\username\\.gemini\\antigravity\\hud\\oma-hud.mjs"
  }
}
```

Use the Edit tool to add/update this field while preserving other settings.

**Step 5:** Clean up old HUD scripts (if any):
```bash
rm -f ~/.gemini/antigravity/hud/sisyphus-hud.mjs 2>/dev/null
```

**Step 6:** Tell the user to restart Antigravity for changes to take effect.

## Display Presets

### Minimal
Shows only the essentials:
```
[OMA] ralph | ultrawork | todos:2/5
```

### Focused (Default)
Shows all relevant elements:
```
[OMA] ralph:3/10 | US-002 | ultrawork skill:planner | ctx:67% | agents:2 | bg:3/5 | todos:2/5
```

### Full
Shows everything including multi-line agent details:
```
[OMA] ralph:3/10 | US-002 (2/5) | ultrawork | ctx:[████░░]67% | agents:3 | bg:3/5 | todos:2/5
├─ O architect    2m   analyzing architecture patterns...
├─ e explore     45s   searching for test files
└─ s executor     1m   implementing validation logic
```

## Multi-Line Agent Display

When agents are running, the HUD shows detailed information on separate lines:
- **Tree characters** (`├─`, `└─`) show visual hierarchy
- **Agent code** (O, e, s) indicates agent type with model tier color
- **Duration** shows how long each agent has been running
- **Description** shows what each agent is doing (up to 45 chars)

## Display Elements

| Element | Description |
|---------|-------------|
| `[OMA]` | Mode identifier |
| `ralph:3/10` | Ralph loop iteration/max |
| `US-002` | Current PRD story ID |
| `ultrawork` | Active mode badge |
| `skill:name` | Last activated skill (cyan) |
| `ctx:67%` | Context window usage |
| `agents:2` | Running subagent count |
| `bg:3/5` | Background task slots |
| `todos:2/5` | Todo completion |

## Color Coding

- **Green**: Normal/healthy
- **Yellow**: Warning (context >70%, ralph >7)
- **Red**: Critical (context >85%, ralph at max)

## Configuration Location

HUD config is stored at: `~/.gemini/antigravity/.oma/hud-config.json`

## Manual Configuration

You can manually edit the config file:

```json
{
  "preset": "focused",
  "elements": {
    "omaLabel": true,
    "ralph": true,
    "prdStory": true,
    "activeSkills": true,
    "lastSkill": true,
    "contextBar": true,
    "agents": true,
    "backgroundTasks": true,
    "todos": true,
    "showCache": true,
    "showCost": true
  },
  "thresholds": {
    "contextWarning": 70,
    "contextCritical": 85,
    "ralphWarning": 7
  }
}
```

## Troubleshooting

If the HUD is not showing:
1. Run `/oh-my-antigravity :hud setup` to auto-install and configure
2. Restart Antigravity after setup completes
3. If still not working, run `/oh-my-antigravity :doctor` for full diagnostics

Manual verification:
- HUD script: `~/.gemini/antigravity/hud/oma-hud.mjs`
- Settings: `~/.gemini/antigravity/settings.json` should have `statusLine` configured

---

*The HUD updates automatically every ~300ms during active sessions.*
