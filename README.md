# oh-my-antigravity

**The Ultimate Agentic Toolkit for Google Gemini Antigravity.**

*Ported from [oh-my-claudcode ](https://github.com/yeachan-heo/oh-my-claudcode ) with ❤️*

> Give your Antigravity agent the collective intelligence of the "Oh My" ecosystem with **72 specialized Skills** and **32 automated Workflows**.

---

## ✨ What is oh-my-antigravity?

oh-my-antigravity is a comprehensive collection of AI agent "personas" (Skills) and automated procedures (Workflows) designed to supercharge your development workflow with Google's Antigravity AI coding assistant.

Think of it as:
- 🧠 **Skills** = Expert personas your agent can embody (architect, security-reviewer, scientist...)
- ⚡️ **Workflows** = Slash commands that trigger automated procedures (`/autopilot`, `/swarm`, `/ultrawork`...)

---

## 🚀 Features

### 🧠 72 Specialized Skills

| Category | Skills | Description |
|----------|--------|-------------|
| **Architecture** | `architect`, `architect-medium`, `architect-low`, `planner`, `analyst` | System design & strategic planning |
| **Execution** | `executor`, `executor-high`, `executor-low`, `autopilot`, `ultrapilot` | Code implementation & task execution |
| **Quality** | `critic`, `code-reviewer`, `security-reviewer`, `aireview` ⭐ | Code review & security auditing |
| **Research** | `scientist`, `researcher`, `deepsearch`, `explore`, `analyze` | Deep analysis & investigation |
| **Testing** | `tdd-guide`, `qa-tester`, `ultraqa`, `build-fixer` | Test-driven development & QA |
| **Design** | `designer`, `frontend-ui-ux`, `vision` | UI/UX design & visual analysis |
| **Specialized** | `git-master`, `writer`, `writer-memory`, `learner` | Git operations, documentation, memory |

### ⚡️ 32 Workflows

| Workflow | Description |
|----------|-------------|
| `/autopilot` | Full autonomous execution from idea to working code |
| `/ultrawork` | Maximum performance mode with parallel agent orchestration |
| `/swarm` | N coordinated agents on shared task list with atomic claiming |
| `/ultrapilot` | Parallel autopilot with file ownership partitioning |
| `/pipeline` | Sequential agent chaining with data passing between stages |
| `/aireview` ⭐ | Multi-agent AI code review with confidence scoring |
| `/start-dev` ⭐ | Intelligent adaptive workflow with pattern library loading |
| `/ralph` | Self-referential loop until task completion |
| `/research` | Orchestrate parallel scientist agents for research |
| `/tdd` | Test-Driven Development enforcement workflow |
| `/doctor` | Diagnose environment and verify required tools |
| `/mcp-setup` | Configure popular MCP servers for enhanced capabilities |
| `/help` | Guide on using oh-my-antigravity |

---

## 📦 Installation

### Option 1: Local Installation (Per Project)

Copy the `.agent` directory to your project:

```bash
# Clone the repository
git clone https://github.com/YourUsername/oh-my-antigravity.git

# Navigate to the repository
cd oh-my-antigravity

# Run the installer (installs to current directory by default)
./install.sh /path/to/your/project
```

### Option 2: Global Installation (All Projects)

Install globally so all projects can access the skills and workflows:

```bash
# Run the global installer
./install_global.sh
```

This installs to:
- Skills → `~/.gemini/antigravity/skills/`
- Workflows → `~/.gemini/antigravity/global_workflows/`

---

## 🎮 Usage

### Using Skills

Just ask naturally! Skills are automatically recognized:

```
"Act as an architect and design a microservices system."
"Run a security review on this file."
"Deepsearch the root cause of this bug."
"Be a frontend-ui-ux expert and improve this component."
```

### Using Workflows

Trigger workflows with slash commands:

```
/autopilot Build a REST API for user authentication
/ultrawork Implement all pending features in parallel
/aireview Review the last 5 commits
/doctor Check if my environment is set up correctly
/help Show me all available commands
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [FEATURES.md](docs/FEATURES.md) | Complete feature documentation |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture overview |
| [REFERENCE.md](docs/REFERENCE.md) | API and command reference |
| [COMPATIBILITY.md](docs/COMPATIBILITY.md) | Compatibility information |

---

## 🔧 Requirements

- **Google Antigravity** (Gemini-powered AI coding assistant)
- **CLI Tools** (recommended for enhanced functionality):
  - `fd` - Fast file finder
  - `rg` (ripgrep) - Fast text search
  - `sg` (ast-grep) - Structural code search

Run `/doctor` to verify your environment setup.

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch
3. Submit a Pull Request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Credits

Special thanks to:

- [oh-my-antigravity ](https://github.com/yeachan-heo/oh-my-antigravity ) - The original project that inspired this work
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenAI Codex adaptation
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - Comprehensive Claude Code resources

