# oh-my-antigravity

**Google Gemini Antigravity 的终极 AI 代理工具包**

*基于 [oh-my-claudecode ](https://github.com/yeachan-heo/oh-my-claudecode ) 移植 ❤️*

> 为你的 Antigravity 代理注入 "Oh My" 生态系统的集体智慧 — **72 个专业技能** 和 **32 个自动化工作流**。

---

## ✨ 什么是 oh-my-antigravity？

oh-my-antigravity 是一个全面的 AI 代理"人设"（技能）和自动化流程（工作流）集合，专为增强 Google Antigravity AI 编程助手的开发工作流而设计。

可以这样理解：
- 🧠 **技能 (Skills)** = 代理可以扮演的专家角色（架构师、安全审查员、科学家...）
- ⚡️ **工作流 (Workflows)** = 触发自动化流程的斜杠命令（`/autopilot`、`/swarm`、`/ultrawork`...）

---

## 🚀 功能特性

### 🧠 72 个专业技能

| 类别 | 技能 | 描述 |
|------|------|------|
| **架构设计** | `architect`、`architect-medium`、`architect-low`、`planner`、`analyst` | 系统设计与战略规划 |
| **代码执行** | `executor`、`executor-high`、`executor-low`、`autopilot`、`ultrapilot` | 代码实现与任务执行 |
| **质量保证** | `critic`、`code-reviewer`、`security-reviewer`、`aireview` ⭐ | 代码审查与安全审计 |
| **研究分析** | `scientist`、`researcher`、`deepsearch`、`explore`、`analyze` | 深度分析与调查 |
| **测试驱动** | `tdd-guide`、`qa-tester`、`ultraqa`、`build-fixer` | 测试驱动开发与质量保证 |
| **UI/UX 设计** | `designer`、`frontend-ui-ux`、`vision` | 界面设计与视觉分析 |
| **专项能力** | `git-master`、`writer`、`writer-memory`、`learner` | Git 操作、文档编写、记忆系统 |

### ⚡️ 32 个工作流

| 工作流 | 描述 |
|--------|------|
| `/autopilot` | 从想法到可运行代码的全自动执行 |
| `/ultrawork` | 并行代理编排的最大性能模式 |
| `/swarm` | N 个协调代理在共享任务列表上原子认领任务 |
| `/ultrapilot` | 带有文件所有权分区的并行自动驾驶 |
| `/pipeline` | 带有阶段间数据传递的顺序代理链 |
| `/aireview` ⭐ | 带有置信度评分的多代理 AI 代码审查 |
| `/start-dev` ⭐ | 带有模式库加载的智能自适应工作流 |
| `/ralph` | 自引用循环直到任务完成 |
| `/research` | 编排并行科学家代理进行研究 |
| `/tdd` | 测试驱动开发强制工作流 |
| `/doctor` | 诊断环境并验证所需工具 |
| `/mcp-setup` | 配置流行的 MCP 服务器以增强能力 |
| `/help` | 使用 oh-my-antigravity 的指南 |

---

## 📦 安装

### 方式一：本地安装（单项目）

将 `.agent` 目录复制到你的项目：

```bash
# 克隆仓库
git clone https://github.com/YourUsername/oh-my-antigravity.git

# 进入仓库目录
cd oh-my-antigravity

# 运行安装脚本（默认安装到当前目录）
./install.sh /path/to/your/project
```

### 方式二：全局安装（所有项目）

全局安装使所有项目都可以访问技能和工作流：

```bash
# 运行全局安装脚本
./install_global.sh
```

安装路径：
- 技能 → `~/.gemini/antigravity/skills/`
- 工作流 → `~/.gemini/antigravity/global_workflows/`

---

## 🎮 使用方法

### 使用技能

只需自然地提问！技能会自动识别：

```
"扮演架构师，设计一个微服务系统。"
"对这个文件进行安全审查。"
"深度搜索这个 bug 的根本原因。"
"以 frontend-ui-ux 专家身份改进这个组件。"
```

### 使用工作流

使用斜杠命令触发工作流：

```
/autopilot 构建一个用户认证的 REST API
/ultrawork 并行实现所有待完成的功能
/aireview 审查最近 5 次提交
/doctor 检查我的环境是否正确设置
/help 显示所有可用命令
```

---

## 📖 文档

| 文档 | 描述 |
|------|------|
| [FEATURES.md](docs/FEATURES.md) | 完整功能文档 |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | 系统架构概览 |
| [REFERENCE.md](docs/REFERENCE.md) | API 和命令参考 |
| [COMPATIBILITY.md](docs/COMPATIBILITY.md) | 兼容性信息 |

---

## 🔧 环境要求

- **Google Antigravity**（Gemini 驱动的 AI 编程助手）
- **CLI 工具**（推荐，用于增强功能）：
  - `fd` - 快速文件查找器
  - `rg` (ripgrep) - 快速文本搜索
  - `sg` (ast-grep) - 结构化代码搜索

运行 `/doctor` 验证你的环境设置。

---

## 🤝 贡献指南

欢迎贡献！你可以：

1. Fork 本仓库
2. 创建功能分支
3. 提交 Pull Request

---

## 📄 许可证

MIT 许可证 - 详见 [LICENSE](LICENSE)

---

## 🙏 致谢

特别感谢以下项目：

- [oh-my-claudcode ](https://github.com/yeachan-heo/oh-my-claudcode ) - 本项目的灵感来源和基础
- [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode) - OpenAI Codex 适配版本
- [everything-claude-code](https://github.com/affaan-m/everything-claude-code) - 全面的 Claude Code 资源集合

