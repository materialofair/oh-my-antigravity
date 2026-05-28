---
name: prompt-optimizer
description: >-
  Analyze raw prompts, identify intent and gaps, match Antigravity / OMA
  components (skills + workflows + agents), and output a ready-to-paste
  optimized prompt. Advisory role only — never executes the task itself.
  TRIGGER when: user says "optimize prompt", "improve my prompt",
  "how to write a prompt for", "help me prompt", "rewrite this prompt",
  or explicitly asks to enhance prompt quality. Also triggers on Chinese
  equivalents: "优化prompt", "改进prompt", "怎么写prompt", "帮我优化这个指令".
  Specially handles short Chinese bug reports (the dominant real-world use
  case): runs Bug Report Triage to extract repro/expected/actual/environment,
  asks up to 3 clarifying questions if ≤ 2 fields are present, and inserts
  systematic-debugging (or `debug-analysis` / `analyze`) as a hard prerequisite
  before any code change.
  DO NOT TRIGGER when: user wants the task executed directly, or says
  "just do it" / "直接做". DO NOT TRIGGER when user says "优化代码",
  "优化性能", "optimize performance", "optimize this code" — those are
  refactoring/performance tasks, not prompt optimization (unless the user
  explicitly invokes `/prompt-optimize`, in which case treat them as
  Bug Fix + Refactor combined).
version: 1.0.0
source: ported-from-claudecode-omc
intent: prompt-engineering
layer: meta
updated_at: 2026-05-28T00:00:00.000Z
---

# Prompt Optimizer

Analyze a draft prompt, critique it, match it to the Antigravity / OMA
ecosystem (this repo's skills + workflows + agents), and output a complete
optimized prompt the user can paste and run.

## When to Use

- User says "optimize this prompt", "improve my prompt", "rewrite this prompt"
- User says "help me write a better prompt for..."
- User says "what's the best way to ask Antigravity / OMA to..."
- User says "优化prompt", "改进prompt", "怎么写prompt", "帮我优化这个指令"
- User pastes a draft prompt and asks for feedback or enhancement
- User says "I don't know how to prompt for this"
- User says "how should I use OMA / Antigravity for..."
- User explicitly invokes `/prompt-optimize`

### Do Not Use When

- User wants the task done directly (just execute it)
- User says "优化代码", "优化性能", "optimize this code", "optimize performance" — these are refactoring tasks, not prompt optimization
- User is asking about OMA setup (use `oma-setup` / `oma doctor` instead)
- User wants a skill inventory (use `oma skill list` or `skill-quality-analyzer` / `skill-tester` instead)
- User says "just do it" or "直接做"

## How It Works

**Advisory only — do not execute the user's task.**

Do NOT write code, create files, run commands beyond the read-only Phase 0.7
probe, or take any implementation action. Your ONLY output is an analysis
plus an optimized prompt.

If the user says "just do it", "直接做", or "don't optimize, just execute",
do not switch into implementation mode inside this skill. Tell the user this
skill only produces optimized prompts, and instruct them to make a normal
task request if they want execution instead.

Run this 6-phase pipeline sequentially. Present results using the Output
Format below.

## Antigravity Constraints (read before generating any prompt)

This skill targets **Google Antigravity 2.0+** via the `oh-my-oma` install.
The optimized prompts you produce MUST respect these platform rules:

1. **Hooks are not supported.** Never recommend hook-based automation
   (pre-commit hooks, file-watch hooks, response hooks). Use **skills +
   workflows + rules** instead.
2. **Workflows vs skills syntax is different.**
   - `/<name>` (with slash) → real workflow file in `.agent/workflows/<name>.md`
     (35 exist; the canonical set includes `/plan`, `/tdd`, `/code-review`,
     `/review`, `/format`, `/lint`, `/typecheck`, `/research`, `/deepsearch`,
     `/security-review`, `/analyze`, `/conductor`, `/start-dev`, `/ultrawork`,
     `/ultraqa`, `/autopilot`, `/ralph`, `/pipeline`, `/release`,
     `/aireview`, `/build-fix`, `/deepinit`, `/learner`, `/note`,
     `/mcp-setup`, `/oma-setup`, `/doctor`, `/cancel`, `/help`, `/psm`,
     `/ralph-init`, `/ralplan`, `/planning-with-files`,
     `/learn-about-oma`, `/learn-about-omc`).
   - bare ``name`` (no slash, often backticked) → skill file in
     `.agent/skills/local/<name>/SKILL.md` (e.g. `verify`, `e2e`,
     `refactor-clean`, `update-docs`, `update-codemaps`, `test-coverage`,
     `tdd-generator`, `debug-analysis`, `analyze`, `electron-driver`,
     `frontend-ui-ux`, `conductor`, `researcher`, `deepsearch`,
     `code-reviewer`, `security-reviewer`, `verification-loop`,
     `quality-check`, `quality-validation`).
   - **If a name only exists as a skill, do NOT prefix it with `/`** — the
     downstream agent will treat it as an unresolved slash command and fail.
3. **Tool verbs in optimized prompts** must use generic phrasing
   ("view `<file>`", "search for `<pattern>`"), not Claude Code tool names
   (`Read`, `Glob`, `Grep`).
4. **GEMINI.md is the canonical rules file.** Optimized prompts that adjust
   workflow conventions should propose changes to `GEMINI.md` (and mention
   `AGENTS.md` only as a fallback).

## Native Subagent Protocol (Antigravity)

Antigravity supports persona-based subagent delegation through the
`agents/` directory (analyst, architect, executor, reviewer, etc.). When this
skill needs deeper work (e.g. probing a large repo), prefer delegating to a
read-only persona via the standard `[ANALYST]` / `[ARCHITECT]` block pattern
rather than running long shell sequences inline. Do **not** invoke
foreign-runtime APIs or paths from other AI CLIs — those will fail under
Antigravity. Stick to OMA's CLI (`oma route`, `oma skill list`) and the
local persona/skill catalog.

## Analysis Pipeline

### Phase 0: Project Detection

Before analyzing the prompt, detect the current project context:

1. Check if a `GEMINI.md`, `AGENTS.md`, or `CLAUDE.md` exists in the working
   directory — read it for project conventions (priority: `GEMINI.md` > `AGENTS.md` > `CLAUDE.md`).
2. Detect tech stack from project files:
   - `package.json` → Node.js / TypeScript / React / Next.js
   - `go.mod` → Go
   - `pyproject.toml` / `requirements.txt` → Python
   - `Cargo.toml` → Rust
   - `src-tauri/` + `Cargo.toml` + `package.json` → **Tauri** (Rust core + Web frontend)
   - `electron.json` / `electron-builder.json` / `electron` in `package.json` deps → **Electron**
   - `expo.json` / `app.json` with Expo SDK → React Native (Expo)
   - `build.gradle` / `pom.xml` → Java / Kotlin / Spring Boot
   - `Package.swift` → Swift
   - `Gemfile` → Ruby
   - `composer.json` → PHP
   - `*.csproj` / `*.sln` → .NET
   - `Makefile` / `CMakeLists.txt` → C / C++
   - `cpanfile` / `Makefile.PL` → Perl
3. **Git context auto-pull** — if the user's prompt mentions `当前分支` / `current branch` / `this PR` / `本次改动`, run these read-only commands and inject results into Phase 4 context:
   - `git status --short` (uncommitted changes)
   - `git log -5 --oneline` (recent commits)
   - `git diff --stat HEAD~1` (latest commit's surface area)
   This converts vague references into concrete file lists.
4. Note detected tech stack for use in Phase 3 and Phase 4

If no project files are found (e.g., the prompt is abstract or for a new
project), skip detection and flag "tech stack unknown" in Phase 4.

### Phase 0.5: Skill Existence & Alias Resolution

The component tables below were authored against a generic prompt-optimizer
baseline (ported from `claudecode-omc`). Many users run this skill inside a
fresh oh-my-antigravity install where some upstream skill names do **not**
exist locally. Recommending a phantom skill wastes the user's time.

**Preferred check (live index):** before listing a skill in Section 2 / Section 3,
query the installed catalog using OMA's CLI:

```
oma route "<intent keywords>"        # e.g. oma route "fix flaky test"
oma skill list                       # full catalog of installed skills
```

`oma route` ranks the installed skills/workflows against the task description
and returns top matches. `oma skill list` shows everything currently
discoverable by Antigravity.

If a recommended skill does **not** appear in `oma skill list`, replace it
with a matching installed skill or fall back to the alias table below.

**Fallback rule (when CLI is unavailable):** the canonical install location is
`.agent/skills/local/<name>/SKILL.md` (workspace) or
`~/.gemini/antigravity/skills/<name>/SKILL.md` (global). Check with `ls`:

```
ls .agent/skills/local/
ls ~/.gemini/antigravity/skills/ 2>/dev/null
```

**Common alias map (generic / upstream name → likely OMA local skill):**

| Generic / upstream name | oh-my-antigravity local name | Verification |
|---|---|---|
| `test-driven-development` (skill) | `tdd` (skill) OR `tdd-generator` / `tdd-guide` | `ls .agent/skills/local/tdd` |
| `/test-driven-development` (slash) — **no such command** | `/tdd` (workflow) | `ls .agent/workflows/tdd.md` |
| `verification-before-completion` (skill) | `verification-loop` OR `verify` OR `quality-validation` | check all three |
| `systematic-debugging` (skill) | `debug-analysis` OR `analyze` OR `analyst` | `ls .agent/skills/local/debug-analysis` |
| `trace` (skill) | `analyze` (combined with deep-interview / debug-analysis) | upstream `trace` not always present |
| `search-first` (skill) | `deepsearch` OR `iterative-retrieval` OR `research` | check all three |
| `external-context` (skill) | `research` OR `researcher` OR `deepsearch` | `ls .agent/skills/local/research` |
| `blueprint` (skill) | **`conductor`** (preferred multi-session driver) | `ls .agent/skills/local/conductor` |
| `e2e-testing` (skill) | `e2e` | — |
| `tdd-guide` (agent) | `tdd-guide` (local skill) OR delegate to executor persona | — |
| `build-error-resolver` (agent) | `build-fix` (workflow) OR `build-fixer` (skill) | — |
| `refactor-cleaner` (agent) | `refactor-clean` (workflow + skill) | — |
| `doc-updater` (agent) | `writer` skill OR `update-docs` skill (NOTE: `update-docs` is a skill, NOT a workflow — do not prefix with `/`) | — |
| `python-reviewer` / `go-reviewer` / etc. | usually just `code-reviewer` (skill) | `ls .agent/skills/local/code-reviewer` |
| `superpowers:*` namespaced skills | drop the prefix; check for local equivalent | superpowers namespace is Claude Code-only |

**Tech-stack-specific patterns** (`django-patterns`, `springboot-patterns`,
`frontend-patterns`, etc., listed in the By Tech Stack table) are
**aspirational on most installs** — assume absent unless `oma skill list`
confirms otherwise. When referencing them in Section 3, write:

> If you don't have `<skill-name>` installed, fall back to the universal
> `code-reviewer` skill, the workflow's `/code-review`, or the conventions
> in this repo's `GEMINI.md` / `AGENTS.md`.

**Discovery shortcut for the user:** if `oma route` returns nothing useful,
suggest running `oma setup` to refresh the install, or `oma doctor` to verify
what Antigravity will actually discover. For a quality audit on a specific
skill, use `skill-quality-analyzer`, `skill-debugger`, or `skill-tester`.

### Phase 0.7: Project Context Probe (cheap, deterministic)

**Goal:** Ground the optimized prompt in *what is actually true in this repo
right now*, not in generic templates. Without this phase, the skill produces
plausible-sounding prompts that may reference nonexistent files, wrong
versions, or off-stack tooling — the user's actual complaint.

**Budget:** ≤ 6 read-only tool calls. Each step is independent — failures
degrade gracefully (see R6.5), never abort the whole phase.

**5 probe actions, in order:**

| # | Action | Command | Output field |
|---|--------|---------|--------------|
| 1 | Confirm git repo | `git rev-parse --is-inside-work-tree 2>/dev/null` | `is_git_repo: true/false` |
| 2 | Scan stack manifests at repo root | Find files matching `{package.json,Package.swift,Cargo.toml,go.mod,pyproject.toml,requirements.txt,*.csproj,Gemfile,pubspec.yaml,pom.xml,build.gradle*,mix.exs,composer.json}` | `manifests: [paths]` |
| 3 | View top manifest | View first 50 lines of highest-priority match | `stack: <name + declared version>`, `stack_source: <manifest>:<line>` |
| 4 | Git current state (one call) | `git rev-parse --abbrev-ref HEAD && echo --- && git status --short && echo --- && git log -3 --oneline && echo --- && git diff --stat HEAD~1 2>/dev/null \| head -10` | `branch`, `uncommitted`, `recent_commits` (subjects only), `recent_diff_stat` |
| 5 | Project self-description | Find `{GEMINI.md,AGENTS.md,CLAUDE.md,README.md}` at repo root; view first 30 lines of highest-priority match (priority: GEMINI.md > AGENTS.md > CLAUDE.md > README.md) | `intent_source`, `intent_text` (first non-empty heading + first ~3 prose lines), `intent_last_modified` |

**Graceful degradation:**

- Action 1 = `false` → skip action 4. Mark `Repo`, `branch`, `uncommitted`, `recent_commits` as `not in a git repo`. Continue actions 2, 3, 5.
- Action 2 returns `[]` → `stack: unknown — language-agnostic recommendations apply`.
- Action 5 finds none → `intent: no self-description found at repo root`.
- Any single step throws → mark only that field `PROBE FAILED: <one-line reason>` (R6.5). Continue.

**Output: Project Context Block (3-section structure, ALWAYS produced)**

The probe **always** emits this block, even when most fields are `UNKNOWN`.
It is appended to the top of `Section 3: Optimized Prompt` (see Output
Format) and must remain verbatim — no paraphrasing, no summarization.

```markdown
## 🔍 Project Context (probed YYYY-MM-DD HH:MM — starting point, NOT ground truth)

### Facts (directly observed in probe)
- Stack: <name + declared version>  ← from `<manifest>:<line>` (declared, installed version not verified)
- Repo: <basename of cwd> @ branch `<branch>` (<N commits ahead of <base>, or "no upstream tracking">)
- Uncommitted: <M/A/D files, or "clean working tree">
- Recent commit subjects (commit messages only — NOT code verification):
  - `<hash>` "<subject>"
  - `<hash>` "<subject>"
- Recent diff scope (`git diff --stat HEAD~1`): <file>: +N -M (or "no diff since HEAD~1")
- Project self-description (`<source-file>:<line>`, last modified <date>): "<first non-empty heading + opening line>"

### Inferences (UNVERIFIED — confirm before acting)
- <e.g., "Likely SwiftUI iOS work based on Package.swift + branch name">
- <e.g., "Stack manifest declares X but no lockfile read — installed version may differ">

### Unknown / Not Probed
- Whether <symbol mentioned in commit subjects> actually exists in source — Read source before referencing it as if it does
- Runtime/installed versions (only declared manifest was read)
- Whether project self-description still matches current architecture (last modified <date>)

⚠️ Re-verify before mutating: run `git status`, view actual files. This block
   is probe-time context, not authoritative. If observation contradicts this
   block, trust observation and ignore this block.
```

**6 anti-misleading hard rules (binding on Phase 3 / Phase 4 outputs):**

These rules prevent the probe from producing context that downstream agents
treat as truth when it is in fact inference, name-based guessing, or stale
data. Violation = regenerate the optimized prompt.

| ID | Rule | Why |
|----|------|-----|
| **R1** | Block MUST be 3-section: `### Facts` / `### Inferences (UNVERIFIED)` / `### Unknown / Not Probed`. Never mix categories. A fact mis-labeled as fact-but-actually-inferred is the primary misleading vector. | Forces explicit epistemic status on every line. |
| **R2** | **Do not reference code symbols the probe did not actually view.** A symbol seen only in a commit subject or branch name is NOT verified to exist. It may appear in `Inferences` or `Unknown`, never as an imperative ("extend `AuthService`"). | A commit titled "add AuthService stub" does not prove `AuthService` exists, is complete, or is at the path one might guess. |
| **R3** | **Branch names do not determine intent.** A branch named `feat/auth` is a weak signal at best; it goes only in `Inferences`. Phase 3 skill selection is driven only by `user prompt + Facts.stack`. | Branch names are user-authored labels with no semantic guarantee. |
| **R4** | **Manifest version ≠ installed version.** All version facts must be marked `declared in <manifest>, installed not verified`. Tasks that need exact runtime version must explicitly check lockfile (`package-lock.json`, `Cargo.lock`, `Package.resolved`, `poetry.lock`, etc.). | `package.json` says React 18, node_modules may have 17. |
| **R5** | **GEMINI.md / AGENTS.md / CLAUDE.md / README.md content gets 1 line + source + last-modified date.** If declared description contradicts detected stack, append `⚠️ Conflict: declared "<X>" but stack indicates <Y> — verify with user`. | Self-description docs drift; stack manifests do not. |
| **R6** | **Banner footer is mandatory.** The `⚠️ Re-verify before mutating` line MUST appear verbatim at the bottom of every Context Block. | Drives downstream agent to treat block as starting context, not ground truth. |
| **R6.5** | **Probe failures are explicit, never silently empty.** Any failed action writes `PROBE FAILED: <reason>` for that field. Downstream agents seeing `PROBE FAILED` know to re-probe themselves; they would misread an empty field as "no problem". | An empty `uncommitted` field looks like a clean working tree. |

### Phase 1: Intent Classification

Classify the user's task into one or more categories:

| Category | Signal Words | Example |
|----------|-------------|---------|
| New Feature | build, create, add, implement, 创建, 实现, 添加, 增加 | "Build a login page" |
| Bug Fix | fix, broken, not working, error, 修复, 报错, 偶现, 不工作, 失效, 卡顿, 我发现一个问题, 你先看看 | "Fix the auth flow" / "我发现头像不显示" |
| Refactor | refactor, clean up, restructure, 重构, 整理 | "Refactor the API layer" |
| Research | how to, what is, explore, investigate, 怎么, 如何 | "How to add SSO" |
| **Research-then-Build** | "先调研 X 再实现", "参考 X 怎么做", "look at how X does it then build" | "先调研 Gemini CLI 自动补全再实现" |
| Testing | test, coverage, verify, 测试, 覆盖率 | "Add tests for the cart" |
| Review | review, audit, check, 审查, 检查 | "Review my PR" |
| Documentation | document, update docs, 文档 | "Update the API docs" |
| Infrastructure | deploy, CI, docker, database, 部署, 数据库 | "Set up CI/CD pipeline" |
| Design | design, architecture, plan, 设计, 架构 | "Design the data model" |
| Performance | "优化性能", "卡顿", "slow", "latency", "做性能优化" | "Windows 上卡顿" |

**Multi-intent prompts** (detect at this phase, plan in Phase 2):

Many real prompts pack ≥ 2 intents into one sentence. Detect by counting
distinct verbs/categories. Common patterns:

| Pattern | Example | Intents |
|---|---|---|
| "先 X 再 Y" | "先做性能优化，再做 UX 优化" | Performance → Refactor |
| "X 同时 Y" | "修复 bug 同时加一个新页面" | Bug Fix + New Feature |
| "顺便/也" | "改这个 bug，顺便补测试" | Bug Fix + Testing |
| "调研 X 然后实现" | "调研 Gemini CLI 自动补全再实现" | Research-then-Build |
| "重构 X 顺便加 Y" | "重构 API 顺便补文档" | Refactor + Documentation |

**When ≥ 2 distinct intents detected:**

1. **Do not collapse into a single prompt.** That produces ambiguous task
   ordering and loses scope discipline.
2. **Bump scope assessment by one level** (e.g., MEDIUM → HIGH). Multi-intent
   work has higher coordination cost than single-intent.
3. **Recommend the `conductor` skill** if combined scope is HIGH or above —
   each intent becomes a track:
   ```
   .oma/conductor/<feature-name>/
   ├── tracks/
   │   ├── perf-optimization/      # spec → plan → review
   │   └── ux-improvement/         # spec → plan → review
   ```
4. **Order matters**: explicit "先 X 再 Y" is sequential; "X + Y" with no
   ordering signal — recommend a default order based on dependency
   (e.g., investigation before fix, fix before refactor, refactor before docs).
5. **Stop conditions per intent**: each track gets its own `verify` skill
   gate; do NOT proceed to track 2 until track 1's verify passes.

**Note on Performance intent**: The skill's "Do Not Use When" rule blocks `优化性能` *as a trigger* — but if the user explicitly invoked `/prompt-optimize` with a performance task, treat it like Bug Fix + Refactor combined: investigate first (`analyze` / `debug-analysis`), then refactor with measurement gates.

### Phase 1.5: Bug Report Triage (only if Intent = Bug Fix or Performance)

Bug reports are the highest-volume use case for this skill, and they fail in
predictable ways: vague repro, missing environment, no expected/actual.
For Bug Fix and Performance intents, you MUST score the prompt against this
checklist before generating the optimized prompt.

| Field | What to extract | Default if missing |
|---|---|---|
| **Repro steps** | Concrete numbered steps to trigger the bug | Mark `TODO: 用户补充复现步骤` |
| **Expected behavior** | What should happen | Infer from prompt or mark TODO |
| **Actual behavior** | What does happen (error message, screenshot, log) | Mark TODO |
| **Environment** | OS (macOS/Windows/Linux), version, browser, device | Ask if absent and prompt mentions cross-platform symptoms |
| **Reproducibility** | 100% / 偶现 (intermittent) / "first time" | Default 100% if not stated |
| **Recent changes** | Branch name, recent commits, suspected commit | Auto-fill via `git log -5` (Phase 0) |
| **Logs / stack trace** | Error text, console output, network response | Mark `TODO: 粘贴完整错误日志/截图` |

**Scoring rule:**
- ≥ 5 fields present → proceed to Phase 2 directly
- 3–4 fields present → fill TODO markers in optimized prompt; do NOT block
- ≤ 2 fields present → ask the user up to 3 clarifying questions BEFORE generating prompt. Prioritize: (1) repro, (2) environment if "偶现"/"intermittent"/cross-platform mentioned, (3) actual error/log

**Special signals:**
- "偶现" / "intermittent" / "flaky" / "sometimes" / "occasionally" → MUST ask: trigger pattern, frequency, environment differences
- "X 平台正常 Y 平台不正常" / "works on mac, broken on windows" → cross-platform Bug; recommend `electron-driver` skill if Electron, recommend platform-conditional repro
- "重启后/restart" → state-persistence bug; recommend reading any storage layer (localStorage, electron-store, Tauri store, sqlite) before fixing
- "性能/slow/卡顿" → Performance intent; recommend `analyze` skill + measurement-first workflow (record baseline, then optimize)

**Bug Fix optimized-prompt template** (used in Section 3 when intent = Bug Fix):

```
## 问题描述
[symptom in 1-2 sentences]

## 复现步骤
1. ...
2. ...
3. ...

## 期望 vs 实际
- 期望：...
- 实际：...

## 环境
- OS / 版本：[macOS 14 / Windows 11 / ...]
- 复现率：[100% / 偶现 N 次/M 次]
- 当前分支：[auto-filled via git]
- 相关日志：[paste here / TODO]

## 工作流
1. **不要直接改代码**。先用 `debug-analysis`（或 `analyze`）skill 定位根因
   - 列出至少 3 个候选假设
   - 对每个假设设计最小验证（添加日志 / 阅读相关代码）
2. /tdd 写一个 failing 测试复现 bug（如果是 UI bug，用 `e2e` skill 写用例）
3. 修复到 green
4. /format → /lint → /typecheck（GEMINI.md 质量通道）
5. `verify` skill 跨平台验证（如适用，跑 macOS + Windows）
6. /code-review

## 不要做
- 不要重构相邻无关代码
- 不要修改无关文件
- 不要在没有定位根因前提交"试试看"的修复
```

### Phase 2: Scope Assessment

If Phase 0 detected a project, use codebase size as a signal. Otherwise,
estimate from the prompt description alone and mark the estimate as uncertain.

| Scope | Heuristic | Orchestration | **Conductor recommendation** |
|-------|-----------|---------------|------------------------------|
| TRIVIAL | Single file, < 50 lines | Direct execution | **Skip** — overkill |
| LOW | Single component or module | Single workflow or skill | **Skip** — single skill is enough |
| MEDIUM | Multiple components, same domain | `/plan` → `/tdd` → quality lane → `/code-review` chain | **Optional** — offer it but don't force; user choice |
| HIGH | Cross-domain, 5+ files | `/start-dev` (session bootstrap) → `/plan` → `/ultrawork` (parallel exec) → `/code-review` → `/release` | **Default ON** — `conductor` track keeps phases coherent across reviews |
| EPIC | Multi-session, multi-PR, architectural shift | `conductor` skill (durable spec/plan/review tracks) + `/ralph` or `/pipeline` runner for phase execution + `/release` per phase | **Required** — single-session execution will lose context |

**Why the gating matters:** Recommending `conductor` for a TRIVIAL task
("rename this variable") creates `.oma/conductor/<track>/spec.md` etc. — pure
ceremony overhead. Conductor's value (durable spec/plan/review across
sessions) only pays off when the task itself is durable (HIGH+).

**Multi-intent override**: per Phase 1, multi-intent prompts bump scope by
one level. So a MEDIUM task with 2 intents → HIGH → conductor defaults ON.

### Phase 3: Antigravity / OMA Component Matching

Map intent + scope + **Phase 0.7 `Facts.stack`** to specific OMA components.

**HARD RULE (binding):** Component selection MUST be driven by `Project
Context Block → Facts → Stack` when present. When matching the By-Tech-Stack
table below, **skip rows that do not match** the detected stack — never list
React skills for a Swift project, never list Django skills for a Go project.
`Inferences` and `Unknown` fields are advisory only — they MAY surface a
"verify this assumption" note, but MUST NOT drive skill selection.

If `Facts.stack` is `unknown` (no manifest detected), fall back to the
language-agnostic intent-only recommendations and explicitly say so in
Section 5 rationale: "Stack unknown — recommendations are generic; user
should re-run after declaring stack."

#### By Intent Type

Workflows use the `/<name>` syntax. Skills are bare names in backticks (no
slash). The "Quality lane" column lists the `GEMINI.md`-mandated check chain
that should run before `/code-review` on any code-changing intent.

| Intent | Workflows | Quality lane (mandatory) | Skills | Agents |
|--------|-----------|--------------------------|--------|--------|
| New Feature | `/plan`, `/tdd`, `/code-review` | `/format` → `/lint` → `/typecheck` | `tdd`, `verification-loop`, `verify`, `conductor` | planner, tdd-guide, code-reviewer |
| **Bug Fix** | `/tdd`, `/code-review` | `/format` → `/lint` → `/typecheck` | **`debug-analysis` (REQUIRED first)**, `analyze`, `verification-loop`, `verify` | **analyst**, tdd-guide, code-reviewer |
| **Bug Fix (intermittent / 偶现)** | `/tdd` | `/format` → `/lint` → `/typecheck` | `debug-analysis`, `analyze`, **`e2e` (for flaky reproduction harness)**, `verify` | analyst |
| **Bug Fix (cross-platform)** | `/tdd`, `/code-review` | `/format` → `/lint` → `/typecheck` | `debug-analysis`, **`electron-driver`** (if Electron), `verify` | analyst, code-reviewer |
| **Performance** | `/analyze`, `/plan` | `/typecheck` (skip format/lint — no behavior change) | `analyze`, `verification-loop`, `verify` | architect, code-reviewer |
| Refactor | `/code-review` | `/format` → `/lint` → `/typecheck` | `refactor-clean`, `verification-loop`, `verify`, `ai-slop-cleaner` (only for AI-generated bloat) | refactor-clean, code-reviewer |
| Research | `/research`, `/plan` | — | `researcher`, `deepsearch`, `iterative-retrieval` | researcher |
| **Research-then-Build** | `/research`, `/plan`, `/tdd` (per phase) | `/format` → `/lint` → `/typecheck` (per phase) | `researcher` → **`conductor`** (track delivery) | planner → executor |
| Testing | `/tdd` | `/lint` → `/typecheck` (skip format on test scaffolds) | `tdd`, `tdd-generator`, `e2e`, `test-gen`, `test-coverage` | tdd-guide, qa-tester |
| Review | `/code-review`, `/aireview`, `/security-review`, `/review` | `/format` → `/lint` → `/typecheck` (sanity-check before review) | `code-review`, `security-review` | code-reviewer, security-reviewer |
| Documentation | `/note` | — | `update-docs`, `update-codemaps`, `writer`, `skill-doc-generator` | writer |
| Infrastructure | `/plan` | `/typecheck` (if IaC is typed) | `planning-with-files`, `planning-methodology`, `verify` | architect |
| Design (MEDIUM-HIGH) | `/plan`, `/planning-with-files` | — | `planning-with-files` | planner, architect |
| Design (EPIC) | `/conductor` | — | **`conductor`** (multi-session track) | planner, architect |
| **Branch finish** | `/release` | `/format` → `/lint` → `/typecheck` → `/code-review` | `release` | code-reviewer |

#### By Tech Stack

| Tech Stack | Skills to Add | Agent |
|------------|--------------|-------|
| Python / Django | code-reviewer + project-specific patterns from GEMINI.md/AGENTS.md | code-reviewer |
| Go | `code-reviewer` + `go vet` / `golangci-lint` invoked from the `verify` skill | code-reviewer |
| Spring Boot / Java | `code-reviewer` + `mvn verify` / `gradle test` invoked from the `verify` skill | code-reviewer |
| Kotlin / Android | `code-reviewer` + Detekt / Ktlint invoked from the `verify` skill | code-reviewer |
| TypeScript / React | `code-reviewer` + `frontend-ui-ux` (UI/UX work) + /format /lint /typecheck quality lane | code-reviewer |
| Swift / iOS | `code-reviewer` + `swift build` / `xcodebuild test` invoked from the `verify` skill | code-reviewer |
| **Tauri (Rust + Web)** | code-reviewer + frontend-ui-ux (note IPC bridge between Rust core and Web) | code-reviewer |
| **Electron** | **electron-driver (E2E)**, frontend-ui-ux, code-reviewer (note main vs renderer process) | code-reviewer |
| **React Native / Expo** | frontend-ui-ux, code-reviewer | code-reviewer |
| **Cross-platform desktop bug** | electron-driver (if Electron) + debug-analysis + platform-conditional repro | analyst |
| PostgreSQL | `code-reviewer` + migration safety check invoked from the `verify` skill | code-reviewer |
| Other / Unlisted | code-reviewer (universal) | code-reviewer |

> If you can't find a stack-specific skill via `oma route` or `oma skill list`,
> fall back to the universal `code-reviewer` skill + the conventions in this
> repo's `GEMINI.md` / `AGENTS.md` / `CLAUDE.md`.

#### Best-Practices Skill Chains

The two tables above pick **single skills**; this subsection wires them into
**ordered chains**. Use these chains in Section 3 — don't just dump a flat
list of skills.

**Chain notation:** `A → B → C` means run A first, then B, then C, with each
step gated by its own success criterion. `[X]` = optional, include only if
scope/risk warrants it.

**Convention in the chains below:** `/<name>` is a workflow,
`` `name` `` (no slash) is a skill, `[...]` is optional.

##### Chain: New Feature (HIGH+ scope)

```
/start-dev                            (bootstrap session: branch, plan stub)
  → `deep-interview`                  (clarify intent + requirements)
  → `conductor` (init track)          (create spec.md / plan.md skeleton)
    → `planning-with-files`           (fill plan.md with concrete steps)
    → [`researcher`]                  (only if novel domain)
    → /tdd                            (red → green per step)
    → /format → /lint → /typecheck    (quality lane — GEMINI.md mandate)
    → `verify`                        (evidence-based check; skill, no slash)
    → /code-review                    (independent review pass)
  → /release                          (merge / PR / cleanup)
```

##### Chain: New Feature (LOW–MEDIUM scope, no conductor)

```
`deep-interview` (light pass)
  → /plan                             (lightweight inline plan)
  → /tdd
  → /format → /lint → /typecheck
  → `verify`
  → [/code-review]                    (skip for trivial)
```

##### Chain: Bug Fix (any scope)

```
`debug-analysis`                      (REQUIRED: hypotheses → evidence)
  → [`analyze`]                       (only if intermittent / 偶现 / performance)
  → /tdd                              (failing test reproduces bug)
  → /format → /lint → /typecheck
  → `verify`                          (test passes + no regressions)
  → [/code-review]                    (for non-trivial fixes)
  → /release
```

##### Chain: Performance Optimization

```
`analyze`                             (baseline measurement: profile / timing)
  → `debug-analysis`                  (locate hotspot with evidence)
  → /plan                             (which optimizations, in what order)
  → /tdd                              (regression test for behavior)
  → [implement]                       (one optimization at a time)
  → /typecheck                        (no format/lint — behavior-only changes)
  → `verify`                          (re-measure: did it actually improve?)
  → /release
```

##### Chain: Research-then-Build

```
`researcher` / `deepsearch` (or /research)
                                      (study reference implementation)
  → produce comparison report         (what to copy, what to skip, what to adapt)
  → `deep-interview`                  (apply learnings to our context)
  → `conductor` (init multi-phase track)
    → phase-1: minimal viable port
    → phase-2: project-specific adaptations
    → phase-3: integration + tests
  → /release
```

##### Chain: Multi-Intent Prompt

```
`deep-interview`                      (decompose into intents, prioritize)
  → `conductor` (multi-track init)    (one track per intent)
    → for each track in dependency order:
        → use the appropriate single-intent chain above
        → `verify` gate before next track starts
  → /release                          (one PR or split per track, user's call)
```

##### Chain: Refactor (no behavior change)

```
[/code-review of current state]       (understand existing intent)
  → /plan                             (refactor steps, each behavior-preserving)
  → /tdd                              (characterization tests if absent)
  → `refactor-clean` / `ai-slop-cleaner` (cleanup; ai-slop-cleaner only for AI bloat)
  → /format → /lint → /typecheck
  → `verify`                          (behavior unchanged: tests still pass)
  → /release
```

**When to deviate from these chains:**
- User explicitly says "skip TDD" → drop `/tdd`
- Project's `GEMINI.md` / `AGENTS.md` mandates a different workflow → follow it (project rules > skill chains)
- Time-boxed prototype / spike → can drop `verify` + `/code-review` (mark explicitly: "this is a spike, not production")

### Phase 4: Missing Context Detection

Scan the prompt for missing critical information. Check each item and mark
whether Phase 0 auto-detected it or the user must supply it:

- [ ] **Tech stack** — Detected in Phase 0, or must user specify?
- [ ] **Target scope** — Files, directories, or modules mentioned?
- [ ] **Acceptance criteria** — How to know the task is done?
- [ ] **Error handling** — Edge cases and failure modes addressed?
- [ ] **Security requirements** — Auth, input validation, secrets?
- [ ] **Testing expectations** — Unit, integration, E2E?
- [ ] **Performance constraints** — Load, latency, resource limits?
- [ ] **UI/UX requirements** — Design specs, responsive, a11y? (if frontend)
- [ ] **Database changes** — Schema, migrations, indexes? (if data layer)
- [ ] **Existing patterns** — Reference files or conventions to follow?
- [ ] **Scope boundaries** — What NOT to do?

**If 3+ critical items are missing**, ask the user up to 3 clarification
questions before generating the optimized prompt. Then incorporate the
answers into the optimized prompt.

### Phase 5: Workflow & Model Recommendation

Determine where this prompt sits in the development lifecycle:

```
Research (/research, /deepsearch)
  → Plan (/plan, /planning-with-files)
  → Implement (/tdd)
  → Quality lane (/format → /lint → /typecheck)
  → Review (/code-review, /review, /aireview, /security-review)
  → Verify (`verify` skill, `verification-loop`, /ultraqa)
  → Finish (/release)
```

For MEDIUM+ tasks, always start with `/plan`. For HIGH-scope multi-file work,
consider `/start-dev` (session bootstrap) and `/ultrawork` (parallel exec).
For EPIC tasks, use the `conductor` skill (durable tracks across sessions)
plus `/ralph` or `/pipeline` as the phase runner.

**Model recommendation** (include in output, surfacing the `-low` / `-medium`
/ `-high` skill variants available in this repo):

| Scope | Recommended Persona Tier | Rationale |
|-------|--------------------------|-----------|
| TRIVIAL-LOW | `executor-low` / `code-reviewer-low` | Fast, cost-efficient for simple tasks |
| MEDIUM | `executor` + `code-reviewer` (default tier) | Best balance for standard work |
| HIGH | `executor-high` + `architect` (planning) | Architect for design, executor-high for implementation |
| EPIC | `architect` + `planner` (planning) + `executor` (per-phase) | Deep reasoning for multi-session planning |

This repo exposes tiered persona variants (`-low`, default, `-medium`, `-high`)
under `agents/`. Pick the tier that matches risk/cost.

**Multi-prompt splitting** (for HIGH/EPIC scope):

For tasks that exceed a single session, split into sequential prompts:
- Prompt 1: `/start-dev` to bootstrap, then `/research` + `/plan`
- Prompt 2-N: Implement one phase per prompt (each ends with the quality lane
  `/format → /lint → /typecheck` and the `verify` skill)
- Final Prompt: Integration test (`e2e` skill or `/ultraqa`) + `/code-review`
  across all phases, then `/release`
- For multi-session structured delivery, prefer the **`conductor`** skill
  (creates `.oma/conductor/` tracks with Context → Spec → Plan → Implement
  artifacts that survive across sessions). Pair it with `/ralph` (continuous
  loop) or `/pipeline` (staged DAG) as the phase runner.

### Phase 6: Compact Mode (output short-circuit)

When ALL of these are true, skip Section 1 (Diagnosis) and Section 5
(Rationale) in the output — just deliver Section 2 (Components) + Section 3
(Full prompt) + Section 4 (Quick) + Footer:

- Original prompt is < 300 characters AND
- Single, well-defined issue (no multi-part request) AND
- Tech stack auto-detected in Phase 0 AND
- Bug Triage scored ≥ 5/7 OR intent ≠ Bug Fix

**Why:** Real telemetry shows the majority of `/prompt-optimize` invocations
are short Chinese bug reports. Forcing them through full diagnosis adds
reading overhead with no signal. Diagnosis tables matter when prompts are
ambiguous — not when they're already concrete.

If Compact Mode triggers, prefix Section 2 with: `> Compact mode (short single-issue prompt). Full diagnosis skipped — ask if you want it.`

---

## Output Format

Present your analysis in this exact structure. Respond in the same language
as the user's input.

### Section 1: Prompt Diagnosis

**Strengths:** List what the original prompt does well.

**Issues:**

| Issue | Impact | Suggested Fix |
|-------|--------|---------------|
| (problem) | (consequence) | (how to fix) |

**Needs Clarification:** Numbered list of questions the user should answer.
If Phase 0 auto-detected the answer, state it instead of asking.

### Section 2: Recommended OMA Components

Use the syntax convention: `/<name>` for workflows, `` `name` `` for skills.

| Type | Component | Purpose |
|------|-----------|---------|
| Workflow | `/plan` | Plan architecture before coding |
| Workflow | `/format` `/lint` `/typecheck` | Quality lane (GEMINI.md mandate) |
| Skill | `tdd` | TDD methodology guidance |
| Skill | `code-reviewer` | Post-implementation review |
| Skill | `verify` | Evidence-based completion check |
| Persona tier | `executor` (default) | Recommended for this scope |

### Section 3: Optimized Prompt — Full Version

Present the complete optimized prompt inside a single fenced code block.
The prompt must be self-contained and ready to copy-paste.

**MANDATORY STRUCTURE (binding):**

1. **First**, paste the Project Context Block from Phase 0.7 **verbatim**.
   Do not summarize, do not paraphrase. The downstream agent needs the same
   epistemic separation (Facts / Inferences / Unknown) the probe produced.
2. **Then**, a blank line.
3. **Then**, the task content, which MUST:
   - Cite **at least 2 specific items from `Facts`** by file path, branch
     name, manifest line, or commit hash. Generic language like "use the
     existing auth code" is a FAIL — replace with "Read
     `Sources/Auth/LoginView.swift` (uncommitted change, see Facts)".
   - Phrase next-step references as `starting points to verify`, NOT as
     imperatives. Good: "Read `LoginView.swift` first to see what's
     already there." Bad: "Extend `LoginView.swift`."
   - Never reference a code symbol that appeared only in `Inferences` or
     `Unknown` (R2 — see Phase 0.7). Such references must downgrade to
     "search for X before assuming it exists."

**Other required content:**
- Clear task description (after Context Block)
- Workflow invocations at the right development stages — use `/<name>` only
  for workflows that exist in `.agent/workflows/` (e.g. `/plan`, `/tdd`,
  `/format`, `/lint`, `/typecheck`, `/code-review`, `/release`)
- Skill references by bare name in backticks (e.g. "use the `debug-analysis`
  skill", "use the `verify` skill" — NOT `/verify`, which is not a workflow)
- Quality lane `/format → /lint → /typecheck` before any `/code-review`
- Acceptance criteria
- Verification steps (use the `verify` skill, not a slash command)
- Scope boundaries (what NOT to do)
- **NEVER** recommend hook-based automation — Antigravity does not support
  hooks. Use skills + workflows + GEMINI.md / AGENTS.md rules instead.

For multi-session work, write: "Use the `conductor` skill to..." Both the
skill and the `/conductor` workflow exist; the skill is the durable
artifact-producing form, the workflow is a thin invoker. Prefer the skill
form unless the user is on the command line.

**Self-check gate (run before publishing Section 3 output):**

| Check | If FAIL |
|-------|---------|
| Does Section 3 start with the verbatim Project Context Block? | Regenerate; prepend the block |
| Does the task content cite ≥ 2 items from `Facts` by name/path? | Regenerate; replace generic references with specific Facts |
| Does any imperative reference a symbol that only appeared in `Inferences` or `Unknown`? | Regenerate; downgrade to "verify before extending" |
| Is the `⚠️ Re-verify before mutating` footer present in the block? | Regenerate; add the footer |
| Are all `/slash-command` references real workflows in `.agent/workflows/`? | Regenerate; replace with verified names |

### Section 4: Optimized Prompt — Quick Version

A compact version for experienced OMA users. Vary by intent type.
Syntax: `/<name>` = workflow, `` `name` `` = skill.

| Intent | Quick Pattern |
|--------|--------------|
| New Feature | `/plan [feature]. /tdd to implement. /format /lint /typecheck. /code-review. `verify` skill. /release.` |
| Bug Fix | `Use `debug-analysis` for [bug] — list 3 hypotheses, verify each. Then /tdd: write failing test, fix to green. /format /lint /typecheck. `verify` skill.` |
| Bug Fix (intermittent) | `Use `analyze` + `debug-analysis` for [intermittent bug] — competing hypotheses with evidence. Build flaky-repro harness with `e2e` skill. Fix only after 100% repro. `verify` skill.` |
| Bug Fix (cross-platform) | `Use `debug-analysis` for [bug]. Repro on both [platform A] and [platform B]. Fix. `verify` skill on both platforms.` |
| Performance | `Use `analyze` for [slow path] — measure baseline first (timing/profile). Identify top 3 hotspots. Fix one at a time, re-measure after each. /typecheck. `verify` regression.` |
| Refactor | `Use `refactor-clean` skill on [scope]. /format /lint /typecheck. /code-review. `verify` skill.` |
| Research | `Use `researcher` skill (or /research workflow) for [topic]. /plan based on findings.` |
| Research-then-Build | `Use `researcher` / `deepsearch` to study [reference X]. Produce comparison report. Then use `conductor` skill to track delivery: spec → plan → /tdd per phase.` |
| Testing | `/tdd [module]. `e2e` skill for critical flows. `test-coverage` skill for coverage gaps.` |
| Review | `/code-review. /security-review. (/aireview for AI-augmented pass.)` |
| Docs | `Use `update-docs` and `update-codemaps` skills.` |
| Branch finish | `/format /lint /typecheck. /code-review. /release.` |
| HIGH scope | `/start-dev. /plan. /ultrawork (parallel exec). /code-review. /release.` |
| EPIC | `Use `conductor` skill for "[objective]". /ralph or /pipeline as phase runner. `verify` gate per phase. /release per phase.` |

### Section 5: Enhancement Rationale

| Enhancement | Reason |
|-------------|--------|
| (what was added) | (why it matters) |

### Footer

> Not what you need? Tell me what to adjust, or make a normal task request
> if you want execution instead of prompt optimization.
>
> **For bug reports:** before pasting the optimized prompt into a new session,
> attach any error logs, stack traces, or screenshots — they make the
> investigation 10× faster than text descriptions alone.

---

## Examples

### Trigger Examples

- "Optimize this prompt for OMA / Antigravity"
- "Rewrite this prompt so Antigravity uses the right workflows"
- "帮我优化这个指令"
- "How should I prompt OMA for this task?"

### Example 1: Vague Chinese Prompt (Project Detected)

**User input:**
```
帮我写一个用户登录页面
```

**Phase 0 detects:** `package.json` with Next.js 15, TypeScript, Tailwind CSS

**Optimized Prompt (Full):**
```
使用项目现有技术栈（Next.js 15 + TypeScript + Tailwind CSS）实现用户登录页面。

技术要求：
- 沿用项目现有的组件结构和路由约定
- 表单验证使用项目中已有的验证方案（检查是否已用 Zod/Yup/其他）
- 认证方式：沿用项目现有认证方案（如无，默认 JWT）
- 包含：邮箱/密码登录表单、表单验证、错误提示、加载状态、响应式布局

工作流：
1. /plan 先规划组件结构和认证流程，参考现有页面的模式
2. /tdd 测试先行：编写登录表单的单元测试和认证流程的集成测试
3. 实现登录页面和认证逻辑
4. /format → /lint → /typecheck（GEMINI.md 强制的质量通道）
5. /code-review 审查实现
6. 用 `verify` skill 验证所有测试通过且页面正常渲染
7. /release（如准备合并）

安全要求：
- 密码不明文传输
- 防止暴力破解（rate limiting）
- XSS 防护
- CSRF token

验收标准：
- 所有测试通过，覆盖率 80%+
- 页面在移动端和桌面端正常渲染
- 登录成功跳转到 dashboard，失败显示错误信息

不要做：
- 不要实现注册页面
- 不要实现忘记密码功能
- 不要修改现有的路由结构
```

### Example 2: Moderate English Prompt

**User input:**
```
Add a REST API endpoint for user profile updates with validation
```

**Phase 0 detects:** `go.mod` with Go 1.22, Chi router

**Optimized Prompt (Full):**
```
Add a REST API endpoint for user profile updates (PATCH /api/users/:id).

Tech stack: Go 1.22 + Chi router (detected from project)

Requirements:
- PATCH /api/users/:id — partial update of user profile
- Input validation for fields: name, email, avatar_url, bio
- Auth: require valid token, users can only update own profile
- Return 200 with updated user on success
- Return 400 with validation errors on invalid input
- Return 401/403 for auth failures
- Follow existing API patterns in the codebase

Workflow:
1. /plan the endpoint structure, middleware chain, and validation logic
2. /tdd — write table-driven tests for success, validation failure, auth failure, not-found
3. Implement following existing handler patterns
4. /lint → /typecheck (Go: `go vet` + `golangci-lint` are the quality lane equivalents — skip /format if `gofmt` is in pre-existing tooling)
5. /code-review
6. Use the `verify` skill — run full test suite, confirm no regressions
7. /release when ready to merge

Do not:
- Modify existing endpoints
- Change the database schema (use existing user table)
- Add new dependencies without checking existing ones first (use the `researcher` or `deepsearch` skill)
```

### Example 3: Chinese Bug Report (real-data pattern)

**User input:**
```
当前分支的分享 html 项目或者 md 文档的功能，存在一个问题，就是如果用户修改已经分享的文件，无法再次分享，这样链接始终不会发生改变
```

**Phase 0 detects:** Tauri (Rust + Web) project. Git context: 3 uncommitted files in `src/share/`, branch `feat/share-html`.

**Phase 1.5 Triage:** repro 1/7 (only symptom), expected/actual implicit, environment unspecified, reproducibility 100% inferred. **Score 3/7 → fill TODO markers, do not block.**

**Optimized Prompt (Full):**
```
## 问题描述
分享 HTML 项目 / MD 文档功能：用户修改已分享文件后，无法再次生成新链接，
链接始终不更新。

## 复现步骤
1. 在当前分支（feat/share-html）打开任意 HTML 项目或 MD 文档
2. 点击分享，记录生成的链接 A
3. 修改文件内容并保存
4. 再次点击分享
5. 观察生成的链接是否变化

## 期望 vs 实际
- 期望：再次分享时生成新链接（或同链接但内容已更新）
- 实际：分享按钮无响应 / 链接不变 / 旧内容（请确认是哪种）

## 环境
- OS / 版本：[macOS / Windows，请补充]
- 复现率：100%（推测，请确认）
- 当前分支：feat/share-html
- 相关文件：src/share/*（git status 显示 3 个未提交改动 — 是否相关？）

## 工作流
1. **不要直接改代码**。先用 `debug-analysis` skill 定位根因，候选假设：
   - H1: 分享缓存（按文件路径 key）未失效
   - H2: 文件 hash 计算逻辑用了 mtime 而非内容 hash
   - H3: 分享接口幂等性设计阻止了重复请求
   - H4: 前端短路 — 检测到"已分享"就不再触发请求
   对每个假设：阅读 src/share/ 相关代码 + 添加临时日志验证
2. /tdd 用 `e2e` skill 写测试用例：分享 → 修改 → 再分享，断言链接或内容变化
3. 修复到 green
4. /format → /lint → /typecheck（前端部分）+ `cargo fmt` / `cargo clippy`（Rust 部分）
5. 用 `verify` skill：跑 e2e 测试 + macOS + Windows 各手测一次（Tauri 项目跨平台）
6. /code-review

## 不要做
- 不要改其他分享类型（仅 HTML / MD 文档）
- 不要重构 share 模块的整体架构
- 不要在没定位根因前做"清缓存"之类的猜测性修复
```

**Optimized Prompt (Quick):**
```
Use `debug-analysis` for "分享 HTML/MD 后修改文件链接不更新" — list 3 hypotheses
(cache key, hash strategy, idempotent API), verify each. /tdd write failing e2e
via `e2e` skill. Fix to green. /lint /typecheck. Use `verify` skill on
macOS + Windows.
```

### Example 4: EPIC Project

**User input:**
```
Migrate our monolith to microservices
```

**Optimized Prompt (Full):**
```
Use the `conductor` skill to plan: "Migrate monolith to microservices architecture"

Before executing, answer these questions in the conductor spec:
1. Which domain boundaries exist in the current monolith?
2. Which service should be extracted first (lowest coupling)?
3. Communication pattern: REST APIs, gRPC, or event-driven (Kafka/RabbitMQ)?
4. Database strategy: shared DB initially or database-per-service from start?
5. Deployment target: Kubernetes, Docker Compose, or serverless?

The conductor track should produce phases like:
- Phase 1: Identify service boundaries and create domain map
- Phase 2: Set up infrastructure (API gateway, service mesh, CI/CD per service)
- Phase 3: Extract first service (strangler fig pattern)
- Phase 4: Verify with integration tests, then extract next service
- Phase N: Decommission monolith

Each phase = 1 PR. Between phases, run the quality lane
(`/format → /lint → /typecheck`) plus the `verify` skill before /release.
Use `/ralph` (continuous loop) or `/pipeline` (staged DAG) as the phase runner.
Persist `.oma/conductor/<track>/` artifacts so the work survives across sessions.

Recommended persona: `architect` for conductor planning, `executor-high` for
per-phase implementation.
```

### Example 5: Phase 0.7 — Project-Aware Recommendation (SwiftUI repo)

Demonstrates the probe + 3-section Context Block + safe "starting points
to verify" output. Note how the optimized prompt avoids referencing
`AuthService` as if it exists (R2) and labels the branch signal as inference
only (R3).

**User input (vague Chinese):**
```
帮我加个登录功能
```

**Phase 0.7 probe output (5 tool calls):**
- Action 1: `git rev-parse --is-inside-work-tree` → `true`
- Action 2: find-files finds `Package.swift` at repo root
- Action 3: view `Package.swift` lines 1-50 → `swift-tools-version: 6.0`, platform `iOS .v18`
- Action 4: `git` combined → branch `feat/auth` (2 ahead of `main`), uncommitted `M Sources/Auth/LoginView.swift`, recent commits include `a1b2c3 add AuthService stub`, `d4e5f6 wire keychain`
- Action 5: `GEMINI.md` exists, line 1 reads "# AcmeApp iOS companion (SwiftUI)"

**Optimized Prompt (Full):**

````
## 🔍 Project Context (probed 2026-05-28 14:30 — starting point, NOT ground truth)

### Facts (directly observed in probe)
- Stack: Swift 6.0 + SwiftUI, target iOS 18  ← from `Package.swift:5` (declared, installed toolchain not verified)
- Repo: AcmeApp @ branch `feat/auth` (2 commits ahead of `main`)
- Uncommitted: M `Sources/Auth/LoginView.swift`
- Recent commit subjects (commit messages only — NOT code verification):
  - `a1b2c3` "add AuthService stub"
  - `d4e5f6` "wire keychain"
  - `9f8e7d` "scaffold Auth module"
- Recent diff scope (`git diff --stat HEAD~1`): `Sources/Auth/LoginView.swift`: +45 -12
- Project self-description (`GEMINI.md:1`, last modified 2026-04-30): "AcmeApp iOS companion (SwiftUI)"

### Inferences (UNVERIFIED — confirm before acting)
- Likely SwiftUI auth feature work in progress (branch name + recent commit subjects)
- A type named "AuthService" may exist (commit subject reference) — NOT verified by reading any file

### Unknown / Not Probed
- Whether `AuthService` actually exists as a Swift type — search `Sources/` for it before referencing
- Installed Swift toolchain version (only `Package.swift` declared version was viewed)
- Whether `LoginView.swift` is the intended host for login UI or just a scratch file

⚠️ Re-verify before mutating: run `git status`, view actual files. This block
   is probe-time context, not authoritative. If observation contradicts this
   block, trust observation and ignore this block.

---

**Task**: Implement login functionality for AcmeApp.

**Required skills**: `tdd` (write failing test first), `code-reviewer` (post-impl review), `verify` (final evidence-based check).

**Starting points to verify (NOT commands to obey blindly):**

1. `Sources/Auth/LoginView.swift` already has uncommitted changes (+45 -12 vs HEAD~1). **View it first** to see what's already drafted before adding new code.
2. Commit log mentions "AuthService stub" — **before** importing or extending it, search `Sources/` for `AuthService` to confirm the type exists and is at a usable state. Treat the name as a lead, not a fact.
3. Branch is `feat/auth` with 2 commits ahead of `main` — verify this is the intended working branch. If unclear, ask the user.
4. `GEMINI.md` declares SwiftUI iOS — use SwiftUI APIs (`@State`, `@Observable`, `NavigationStack`) and `iOS 18` features. Confirm by viewing `Package.swift` platforms array before using iOS-26-only APIs.

**Workflow:**
1. View `Sources/Auth/LoginView.swift` → understand existing scaffold.
2. Search for `AuthService`, `Keychain` patterns → ground the implementation in what exists.
3. Use `tdd` skill: write failing test for the login happy path first.
4. Implement minimum code to pass; let `code-reviewer` skill review the View structure.
5. Run Swift quality lane: `swift build`, `swift test`, `swiftformat`, `swiftlint` (the `/format` `/lint` `/typecheck` workflows are JS/TS-oriented; the language-appropriate equivalents apply here).
6. Use the `verify` skill — build, run tests, manually exercise the simulator flow.
7. `/release` when ready to merge `feat/auth` back to `main`.

**Acceptance criteria:**
- Login screen accepts email + password input, validates non-empty
- Successful auth navigates to main app screen
- Failed auth shows inline error
- Credentials persist via Keychain (extend existing wiring from `d4e5f6`, do NOT re-implement)
- Unit tests cover validation + success + failure paths

**Scope boundaries:**
- Do NOT redesign `AuthService` interface — extend it if it exists; flag for user if it doesn't
- Do NOT switch branch — work continues on `feat/auth`
- Do NOT introduce a new auth library (no Firebase / Auth0 / etc.) without asking
````

**Why this output is safer than a naive port:**

| Naive risk | This output mitigates by |
|------------|-------------------------|
| Would have said "Use `swiftui-pro` to add login" without naming files | Cites `LoginView.swift`, `Package.swift:5`, branch `feat/auth`, commit `d4e5f6` (R1, ≥ 2 Facts cited) |
| Might have written "extend `AuthService`" as imperative | Downgraded to "search for `AuthService` first — treat the name as a lead, not a fact" (R2) |
| Would have inferred "auth feature" from branch name | Branch name in `Inferences`, intent confirmed via user prompt only (R3) |
| Would have said "Swift 6.0" as if it were installed | "declared, installed toolchain not verified" (R4) |
| Would have implied GEMINI.md content was current truth | Cited with last-modified date (R5) |
| No instruction to re-verify | `⚠️ Re-verify before mutating` footer (R6) |

---

## Related Components

| Component | When to Reference |
|-----------|------------------|
| `oma-setup` (skill) / `oma setup` (CLI) | User hasn't installed OMA yet |
| `oma route "<intent>"` (CLI) | Look up which installed skills match the intent (preferred over hard-coded catalogs) |
| `oma skill list` (CLI) | Audit which components are installed |
| `learn-about-oma` (skill) / `/learn-about-oma` (workflow) | User doesn't know what OMA offers — direct them here as a fallback |
| `skill-quality-analyzer`, `skill-debugger`, `skill-tester` | Validate a specific installed skill before recommending it |
| `researcher` / `deepsearch` / `iterative-retrieval` | Research phase in optimized prompts |
| `deep-interview` | Vague prompts — clarify intent + requirements before planning |
| `debug-analysis` | **Always** referenced for Bug Fix intent — root-cause before code |
| `analyze` | Performance intent or unknown-cause investigation |
| `analyst` (persona) | Deep diagnostic + cross-file reasoning |
| `conductor` | Multi-session structured delivery |
| `electron-driver` | Electron cross-platform bugs requiring E2E repro |
| `frontend-ui-ux` | UI/UX-specific work after planning |
| `verify`, `verification-loop`, `quality-validation`, `quality-check` | Verification gates (skills — never reference as `/verify`, which is not a workflow) |
| `/format` + `/lint` + `/typecheck` | GEMINI.md-mandated quality lane for JS/TS code; language-equivalents apply for other stacks |
| `/release` | Finishing a development branch (merge / PR / cleanup) |
| `/start-dev`, `/ultrawork`, `/ultraqa`, `/autopilot`, `/ralph`, `/pipeline` | Session-level orchestration for HIGH/EPIC scope |
