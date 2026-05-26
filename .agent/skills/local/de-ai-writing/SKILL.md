---
name: de-ai-writing
description: Use when the user asks to remove AI tone, humanize a draft, or polish text written (or smelling) like an LLM. Trigger phrases include "去 AI 味"、"去ai味"、"降低机器感"、"改得像真人写的"、"不要 AI 腔"、"humanize"、"de-ai"、"remove AI tone". Default optimized for Chinese; supports zh/en mixed text. Always cross-checks output against the Wikipedia "Signs of AI writing" taxonomy before delivery.
version: 0.2.0
argument-hint: <draft text, file path, or target paragraph>
source: fork
updated_at: 2026-04-28T00:00:00.000Z
layer: domain
---

# De-AI Writing Skill

## Canonical Reference (Mandatory On Every Invocation)

This skill is **anchored to** Wikipedia's *Signs of AI writing* taxonomy maintained by WikiProject AI Cleanup. It is the diagnostic source of truth — do **not** rely on memory or "feel".

Every run MUST:

1. Load the local checklist `references/wikipedia-signs.md` and walk through Groups A–D.
2. Mark which sign categories are firing in this specific draft (max 3–5 strongest).
3. Apply rewrite moves only against signs that actually fired.
4. Re-scan the rewrite once more against the same checklist before returning.

Upstream source: <https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing>
Structure inspiration: <https://github.com/op7418/Humanizer-zh/blob/main/SKILL.md>

> If the user explicitly says "skip the checklist" / "just rewrite", honour that — but log in `处理说明` that the Wikipedia cross-check was skipped on user request.

## Native Subagent Protocol (Codex)

Codex supports native subagents. Delegate with `spawn_agent`, coordinate with `send_input`, collect via `wait`, and clean up with `close_agent`.

Execution preference:
1. Use native subagents first for independent workstreams (parallel when possible).
2. Merge results in main thread and run final verification.
3. Fallback only when delegation is blocked: use the `[ANALYST]`/`[ARCHITECT]`/`[EXECUTOR]`/`[REVIEWER]` structure in a single response.

Minimal orchestration: `spawn_agent → send_input (optional) → wait → close_agent`

> Codex invocation: `$de-ai-writing ...` or `de-ai-writing: ...`

## Purpose

将“去 AI 味”定义为一次**风格校正 + 注入声音**，不是“伪造真人痕迹”，也不是“胡乱口语化”：

1. 保留事实、观点、逻辑、术语。
2. 按 Wikipedia 分类法定位真正在响的 AI 信号，不做散点挑刺。
3. 把抽象评价改成具体观察、机制、判断。
4. 打破过分平均的句长、段落长度和连接词节奏。
5. 让“一个有判断的人”出现在文章里，而不是“一个会生成完整结构的模板”。

## Five Core Rules (Quick Mantra)

1. **删填充** — 开场白、强调拐杖、安全总结。
2. **打破公式** — 二元对比、三段式、修辞 setup。
3. **变化节奏** — 长短句混合、段落不一律饱满。
4. **信任读者** — 直接陈述，跳过软化、辩解、手把手。
5. **删金句** — 听起来像可截图的“小作文”就重写。

## Personality & Soul (避免另一种死法)

去掉 AI 模式只是工作的一半。无菌、没有声音的写作和机器生成内容一样可疑。

判断“写作是否有人住在里面”的迹象：

- 是否承担一个具体观点（哪怕带不确定）。
- 是否变化节奏，而不是每句都完整。
- 是否承认复杂性、模糊感、未解之处。
- 在合适处使用第一人称视角（不是“显得不专业”，而是诚实）。
- 是否允许少量跑题、半成型的想法、不对称的句子。

强行输出“干净但无灵魂”的文本，与未处理的 AI 文本同罪。

## When To Use

- 中文公众号、博客、专栏、视频口播稿、品牌内容、知识型长帖
- 计算机技术分享、产品复盘、架构说明、故障排查文章
- 基督教讲道稿、神学分享、灵修说明、牧养型长文
- 已有初稿，但读起来“太顺、太满、太像 AI”
- 想从“概括正确”改成“表达自然、判断鲜明、细节可信”

## When Not To Use

- 法务、合同、制度、公文、论文摘要等必须保持强正式文体的文本
- 用户明确要求“SEO 模板风格”“标准化 PR 口径”或“官方公告腔”
- 核心问题是事实不足、论证空心、资料缺失 → 先用 `content-research-writer` 补证据

## Working Modes

未指定时默认 `standard`。

| Mode | Use Case | Rewrite Strength |
|------|----------|------------------|
| `light` | 只去掉明显 AI 腔，不改结构 | Low |
| `standard` | 调整段落、句式、连接方式和措辞 | Medium |
| `deep` | 重写开头、中段推进和结尾逻辑 | High |
| `voice-lock` | 强锁定作者现有语气，只修机器感 | Medium |

## Output Contract

默认输出三段；用户只说“直接改”时只给改写结果。

```markdown
## AI味诊断
- [Wikipedia 分类: 信号名] 具体问题（引用原文片段）
- 最多 3-5 条，挑最强的

## 改写版本
[rewritten text]

## 处理说明
- 保留了什么
- 重点改了什么（按 Wikipedia 分类列动作）
- 还有哪些建议补事实/例子
```

## Core Workflow

### 1. Lock Constraints

锁定不可动项：事实、数字、术语、引用、目标读者、语气目标、可接受口语度。

用户未说明时默认：受过基础教育的中文互联网读者；自然、克制、有判断；半口语，不堆俚语。

### 2. Cross-Check Against Wikipedia Signs (Mandatory)

打开 `references/wikipedia-signs.md`，按四组扫描原文：

- **Group A — Content**: inflated significance / notability listing / -ing superficial analysis / promotional language / vague attribution / outline-style "challenges & future"
- **Group B — Language**: AI vocabulary density / copulative avoidance / negative parallelism / rule of three / elegant variation
- **Group C — Style & format**: em-dash overuse / bold overuse / inline-header lists / emoji bullets / curly quotes / title-case headings
- **Group D — Communication**: sycophancy / canned closures / knowledge-cutoff disclaimers / filler phrases / over-qualification

诊断只保留 3–5 条最强信号；不要把所有触发都列出来。

### 3. Decide Rewrite Strategy

按问题类型选动作，不平均用力：

- 套话集中 → 优先删模板句、空洞总结
- 机械结构 → 优先打散段落和连接顺序
- 像客服稿 → 优先补判断、减官话、换动词
- 像 AI 解释题 → 优先把抽象概念落到场景、动作、后果

### 4. Rewrite By Paragraph Function

- **开头**：尽快进入具体问题、冲突、判断。
- **中段**：每段只推进一个关键意思。
- **举例段**：能具体就具体；没有例子时宁可收缩判断，不要捏造。
- **结尾**：留一个判断、后果或余味，不必复述全文。

### 5. Apply Chinese-First Rewrite Rules

1. 抽象评价 → 可感知的差异
2. 名词中心句 → 动作中心句
3. 套装连接词（首先/其次/再次）→ 自然推进
4. 平均句长 → 长短交错
5. 无风险正确 → 有边界的判断
6. 过度总结 → 收束但不封死

详细中文短语清单与前后对照见 `references/chinese-patterns.md`。

### 6. Re-Scan & Final Safety Checks

交付前再过一遍 Wikipedia 分类法，并自检：

- 每段是否至少说出一个不可随意替换的东西
- 任意一句删掉后文章是否仍完全不受影响（说明这句是 filler）
- 是否误删事实、条件、术语
- 是否把专业稿强行改成“轻飘口语”
- 是否新增了用户没提供的例子、数据、经历（**禁止**）

## Domain Safeguards

### A. 计算机技术分享

保护：代码块、命令、配置项、API 名、库名、版本号、错误信息、故障链路、性能数字、刻意保留的精确限定词。

改写重点：去“背景铺垫型空话”，更快进入问题；抽象收益 → 工程后果（延迟、复杂度、维护成本）；保留术语，不洗平。

禁止：改代码语义；合并丢步骤顺序；把报错/命令/配置键改近义词；把工程判断放大成不准确的结论。

### B. 基督教讲道与神学分享

保护：经文引用、章节号、关键措辞、神学立场、教义边界、释经逻辑、牧养语气中的庄重与节制。

改写重点：去模板化引言不稀释属灵重量；推进更像真实宣讲而非答题分点；保留敬虔、谦卑和边界感，不改成轻松鸡汤。

禁止：改动经文原意或换松散意译；把谨慎神学表述改武断；把讲道改营销文；为“自然”削弱敬畏、悔改、恩典、十字架等核心语义。

完整领域 playbook 见 `references/domain-playbooks.md`。

## Pre-Delivery Quick Checklist

- [ ] Wikipedia 四组分类已逐组扫过原文
- [ ] 连续三句长度相同？打断其中一个
- [ ] 段尾是否每次都给“漂亮总结”？换收束方式
- [ ] 揭示前是否有破折号？删
- [ ] 是否解释了一个根本不需要解释的隐喻？删
- [ ] 是否出现“此外/此外/然而”整齐排队？删大半
- [ ] 三段式列举？改两项或四项
- [ ] 改写后是否还能听见一个真人？听不到 → 回到 Personality & Soul

## Optional Quality Score (1–10 / 50)

仅在用户要求评分或多版本对比时输出：

| 维度 | 评估问题 | 得分 |
|------|----------|------|
| 直接性 | 直接陈述还是绕圈宣告 | /10 |
| 节奏 | 句长是否变化 | /10 |
| 信任度 | 是否尊重读者智慧 | /10 |
| 真实性 | 是否听起来像真人 | /10 |
| 精炼度 | 还有冗余可删吗 | /10 |
| **总分** |  | **/50** |

判定：≥45 优秀；35–44 仍可优化；<35 重写。

## Anti-Patterns

- 为“像人写的”而虚构经历、情绪、对话
- 把行业文章改成网络段子
- 只换同义词不改句法和推进
- 把所有连接词删光导致逻辑断裂
- 把原文克制风格误判成 AI 味
- 全部改成短句，形成另一种模板感
- 跳过 Wikipedia 分类法，凭直觉判断 AI 味

## Composition With Other Skills

1. 资料不足、论点发虚 → 先 `content-research-writer`
2. 文章结构混乱 → 先 `plan` 梳理提纲
3. 长篇创作、人物口吻一致性高 → 配合 `writer-memory`
4. 完成改写后默认不要上长篇写作课，除非用户问

## Trigger Examples

- “给这篇文章去 AI 味，尤其是中文腔调别那么像模板。”
- “把这段公众号稿改得更像真人写的。”
- “不要改意思，只把机器感降下来。”
- “把这篇技术分享改得自然一点，但代码块、命令和术语都别动。”
- “把这篇讲道稿改得像真人讲出来的，保留经文和神学立场。”
- “帮我 humanize 一下这篇中文草稿。”
- “这篇文章太像 AI 写的了，重写但别油腻。”

## Additional Resources

- `references/wikipedia-signs.md` — Wikipedia 53 类信号 + 中文映射（**强制参考**）
- `references/chinese-patterns.md` — 中文常见套话、替换方式、前后对照
- `references/domain-playbooks.md` — 技术 / 讲道领域的保护与禁止动作
- Upstream taxonomy: <https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing>
- Structural inspiration: <https://github.com/op7418/Humanizer-zh>
