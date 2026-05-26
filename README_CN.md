# oh-my-antigravity

**面向 Google Antigravity 的多智能体技能包与工作流编排层。**

*架构对齐 [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex)；技能移植自 "Oh My" 生态。*

> 为你的 Antigravity 代理提供 **148 个专业技能**（99 个一方 + 49 个上游打包）和 **35 个工作流**，外加一个负责安装、编目、路由、治理的 CLI —— 并绕过 Antigravity 2.0 的全局技能发现缺陷。

**📦 npm**：`oh-my-oma@4.1.0` · **CLI**：`oma` · **Node** ≥ 18

---

## 为什么需要它（Antigravity 2.0 修复）

Antigravity **2.0.1** 不会可靠地把全局技能目录（`~/.gemini/antigravity/skills/`）注入到 agent 的 system prompt —— 所以你安装的全局技能经常**根本不会被发现**，即使文件就在正确的位置。（workflows 有显式的 `global_workflows` 路径，skills 没有。）

`oma` 用两种方式绕过这个问题：

1. **优先按工作区安装（推荐）。** 技能同时写入 `.agents/skills/`（2.0 默认）**和** `.agent/skills/`（向后兼容），这两个目录 Antigravity 会按 `{.agents,.agent}/skills` 可靠扫描。
2. **GEMINI.md 技能清单块。** 每次安装都会向对应的 `GEMINI.md`（始终会被加载的规则文件）注入一个受管理块，列出每个技能的名字、描述和 `SKILL.md` 绝对路径。这样即使全局目录没被通告，agent 也能找到并 `view_file` 它们。

运行 `oma doctor` 可查看 Antigravity 究竟能发现什么，包括 GEMINI.md 块是否就位。

---

## 安装

### 工作区安装（推荐）

在某个项目内（或传入目标目录）：

```bash
npm install -g oh-my-oma
cd /path/to/your/project
oma setup --scope project-local
# 或从仓库执行：./install.sh /path/to/project
```

写入：`.agents/skills` + `.agent/skills`、`.agents/workflows` + `.agent/workflows`、`.agent/rules`，以及 `<project>/GEMINI.md` 中的技能清单块。**安装后重启 Antigravity 的 agent 会话**让它重新扫描。

### 全局安装（所有项目）

```bash
oma setup --scope user      # 或：./install_global.sh
```

写入：`~/.gemini/antigravity/skills`、`~/.gemini/antigravity/global_workflows`、`~/.gemini/config/rules`、MCP 服务器写入 `~/.gemini/config/mcp_config.json`，以及向 `~/.gemini/GEMINI.md` 注入技能清单块（发现修复）。

### 验证

```bash
oma doctor
```

---

## CLI 命令

```
oma setup [--scope user|project-local|project] [--force] [--dry-run]
          [--no-skills] [--no-workflows] [--no-rules] [--no-config] [--enable-context7]
oma doctor                       # 仓库健康 + Antigravity 实际能发现什么
oma route "<任务>" [--limit N]   # 为任务推荐技能（带评分）
oma harness graph|intents|lint|chain <skill>
oma skill list|prefer|conflicts
oma source list|sync|status
oma team start|status|advance|cancel|clear
oma test ...                     # 技术栈检测 + 测试生成
oma help
```

---

## 架构

```
bin/oma.js              CLI 入口 → src/cli/index.js
src/
  cli/                  setup, doctor, route, harness, skill, source, team, test, notify
  utils/paths.js        所有 Antigravity 目标路径的唯一收口点
  config/generator.js   JSON mcp_config.json 合并 + GEMINI.md 技能注入
  merge/                多源技能合并 + 冲突解决
  catalog/              技能索引、清单、schema 校验
  router/               任务 → 技能评分（boost + index + layer + intent）
  harness/              组合图、layer-map、intent-registry
  mcp/                  state / memory / trace MCP 服务器
  team/, notify/, testing/
.agent/skills/local/    99 个一方技能（安装来源）
.agent/skills/upstream/ 上游打包：superpowers (14)、ecc (35)
.agent/workflows/       35 个工作流
templates/, schemas/, prompts/, scripts/, .governance/
```

技能位于 `.agent/skills/local/<name>/SKILL.md`。catalog 与 skill-index 自动生成，router 与 harness 读取它们。

---

## 技能与工作流

**148 个技能** 覆盖：

- **规划与发现** —— `plan`、`analyst`、`architect`、`explore`、`brainstorming`、`writing-plans`、`executing-plans`、`deep-interview`、`planning-methodology`
- **执行** —— `autopilot`、`ralph`、`ultrawork`、`ultraqa`、`pipeline`、`start-dev`
- **质量与评审** —— `aireview`、`code-review`、`security-review`、`critic`、`verification-before-completion`、`verification-loop`、`verify`、`debug-analysis`、`systematic-debugging`、`requesting-code-review`、`receiving-code-review`、`finishing-a-development-branch`
- **测试** —— `tdd`、`tdd-guide`、`test-driven-development`、`tdd-workflow`、`tdd-generator`、`bdd-generator`、`test-coverage`、`test-gen`、`e2e`、`e2e-testing`、`eval-harness`、`qa-tester`、`checkpoint`
- **工程模式** —— `api-design`、`mcp-server-patterns`、`claude-api`、`backend-patterns`、`frontend-design`、`frontend-patterns`、`coding-standards`、`refactor-clean`、`ai-slop-cleaner`
- **研究** —— `scientist`、`deepsearch`、`research`、`deep-research`、`iterative-retrieval`、`documentation-lookup`、`exa-search`、`market-research`
- **设计与写作** —— `designer`、`frontend-ui-ux`、`vision`、`de-ai-writing`、`article-writing`、`brand-voice`、`content-research-writer`
- **元能力与 skill 自管理** —— `skill`、`skill-create`、`skill-development`、`skill-tester`、`skill-debugger`、`skill-quality-analyzer`、`skill-doc-generator`、`update-codemaps`、`update-docs`、`prompt-optimizer`、`learner`、`release`、`doctor`、`writing-skills`、`using-superpowers`

35 个工作流通过 slash 命令调用，例如 `/autopilot`、`/ultrawork`、`/ralph`、`/aireview`、`/research`、`/tdd`、`/doctor`、`/help`。

### 技能包

| 包 | 数量 | 来源 | 说明 |
|---|---|---|---|
| `local`（一方） | 99 | 本仓库 | Antigravity 原生，外部 runtime 路径治理已过 |
| `upstream/superpowers` | 14 | [obra/superpowers](https://github.com/obra/superpowers) | 流程纪律（TDD、brainstorming、planning、debugging、review） |
| `upstream/ecc` | 35 | [affaan-m/everything-claude-code](https://github.com/affaan-m/everything-claude-code) | 工程模式（api-design、mcp-server-patterns、claude-api 等） |

> **注意事项**
> - 并行执行类技能（`swarm`、`ultrapilot`）在 Antigravity 迁移时已移除；编排改为单代理 / 人设切换。
> - `superpowers/subagent-driven-development` 与 `superpowers/dispatching-parallel-agents` 在 Antigravity 下会降级为单会话执行（Gemini CLI 无 `Task` 工具）。
> - 2 个上游 ↔ 本地命名冲突（`security-review`、`verification-loop`）由合并器自动解决，安装后可看 `.oma/merge-report.json`。

---

## 开发 / 测试

```bash
npm test                  # governance + catalog + skill-index + doctor
npm run catalog:generate  # 从 .agent/skills 重新生成 catalog
npm run governance:skills # 检查技能中是否混入外部运行时痕迹
oma harness lint          # 校验组合图 / layer-map / intents
```

---

## 许可证与致谢

MIT，详见 [LICENSE](LICENSE)。

- [oh-my-codex](https://github.com/Yeachan-Heo/oh-my-codex) —— 本移植所遵循的架构
- [oh-my-claudecode](https://github.com/yeachan-heo/oh-my-claudecode) —— 原始技能生态
