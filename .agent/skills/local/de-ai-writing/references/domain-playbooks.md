# Domain Playbooks For De-AI Writing

Use this reference when the draft belongs to a domain where style cleanup can easily damage meaning.

## 1. Computer Technical Sharing

### What Must Not Move

Keep these elements stable unless the user explicitly asks for rewriting them:
- code blocks
- shell commands
- config keys and file paths
- version numbers
- error messages
- API names, class names, function names
- benchmark numbers and comparison baselines

### Common AI Markers In Technical Chinese

Symptoms:
- long background paragraphs before the actual problem
- repeated claims such as `提升效率`, `降低门槛`, `增强稳定性` without mechanism
- abstract architecture language with no system boundary
- conclusion-heavy endings that restate obvious engineering principles

Rewrite move:
- enter the failure mode or technical question earlier
- replace value claims with mechanism, tradeoff, or cost
- make subject and system boundary explicit
- preserve exact steps and constraints

### Good Rewrite Direction

Before:
`随着云原生技术的不断发展，Kubernetes 已经在现代基础设施中发挥着越来越重要的作用，因此掌握其故障排查能力具有重要意义。`

After:
`Kubernetes 当然重要，但技术分享没必要从这句开始。真正有用的是：Pod 起不来时，先看什么，怎么排除，哪一步最容易误判。`

Why:
- removes empty industry framing
- gets to the reader's operational problem faster
- sounds like an engineer with priorities

### Tone Target

Prefer:
- precise
- restrained
- experience-backed
- concrete about cost and failure

Avoid:
- inspirational tech evangelism
- business jargon in place of engineering explanation
- casual slang that weakens precision

## 2. Christian Sermons And Theology Writing

### What Must Not Move

Keep these elements stable unless the user explicitly asks for doctrinal or stylistic adjustment:
- scripture references and quotations
- theological terms with doctrinal weight
- confessional distinctions
- exegetical sequence
- pastoral exhortation boundaries
- liturgical or reverent register where intentionally present

### Common AI Markers In Sermon/Theology Chinese

Symptoms:
- broad opening lines about `在这个充满挑战的时代`
- three-point sermon structure that sounds like a school answer sheet
- repeated moral conclusions without textual depth
- pastoral warmth rendered as generic encouragement
- theological claims softened into vague life advice

Rewrite move:
- enter through the text, tension, or pastoral burden
- keep the sermon movement, but reduce answer-sheet scaffolding
- sharpen doctrinal language without exaggeration
- preserve reverence and pastoral gravity

### Good Rewrite Direction

Before:
`在这个快速变化的时代，我们每个人都面临许多挑战，因此更需要来到神的面前，重新思想信仰对我们生命的重要意义。`

After:
`我们不是因为时代变化太快，才需要回到神面前。我们本来就离不开祂。变化只是把这个事实逼得更明显。`

Why:
- removes generic era framing
- keeps the spiritual weight
- sounds more like a lived exhortation than a template introduction

### Tone Target

Prefer:
- reverent
- pastorally warm
- doctrinally bounded
- emotionally honest but not sentimental

Avoid:
- motivational-speaker cadence
- secular self-help framing
- slang that trivializes sacred themes
- overconfident certainty where the original was careful

## 3. Shared Safety Questions

Before returning domain-heavy rewrites, check:
- Did any exact term lose precision?
- Did any doctrinal or technical boundary get blurred?
- Did the rewrite become more stylish but less trustworthy?
- Did the text become easier to read at the cost of being less true?

If the answer may be yes, surface the risk instead of silently polishing past it.
