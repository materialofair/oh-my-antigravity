---
description: One-time setup for oh-my-antigravity environment
---

# Oh My Antigravity Setup

## Mission
Ensure your machine has the "Body" (CLI tools) required to power the "Brain" (Agents).

## Step 1: Run Doctor
First, we assess the current state.

```
/doctor
```

## Step 2: Install Missing Tools (The Body)

The Agents define their "skills" in `SKILL.md` files. Many of these skills delegate to high-performance CLI tools to do the heavy lifting.

**Recommended Toolchain:**

### macOS (Homebrew)
```bash
brew install fd ripgrep ast-grep gh
```

### Linux (apt/cargo)
```bash
# Prereqs
sudo apt-get install -y fd-find ripgrep git

# Rust tools (often best installed via cargo)
cargo install ast-grep
```

### Tool Explanations
- **fd**: A faster `find`. Used by *Explorer* to map project structure instantly.
- **rg (ripgrep)**: A faster `grep`. Key for *Researcher* and *Explorer* to find code references.
- **sg (ast-grep)**: Structural search. Allows *Architect* to search for "functions that take 3 arguments" rather than just text matching.
- **gh**: GitHub CLI. Used by *Git-Master* to handle PRs and releases.

## Step 3: Verify Setup

Run the doctor again to confirm all systems go.

```
/doctor
```

## Step 4: Enjoy
You are now ready. The agents have their tools.
- **Explore**: `/explore "where is the auth logic?"`
- **Architect**: `/architect "review the security of this module"`
- **Plan**: `/plan "refactor the sidebar"`
