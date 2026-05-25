const { tryReadCatalogManifest } = require('../catalog/reader');
const { getFreshSkillIndex } = require('../catalog/skill-index');
const { loadAllSkills, buildIntentIndex } = require('../harness');
const intentRegistry = require('../harness/intent-registry.json');
const layerMap = require('../harness/layer-map.json');

// High-confidence keyword boosts (kept from original for precision shortcuts)
const BOOST_RULES = [
  { skill: 'conductor', weight: 5, keywords: ['conductor', 'track', 'spec.md', 'plan.md', 'tracks.md', '长期项目上下文'] },
  { skill: 'de-ai-writing', weight: 4, keywords: ['去ai味', 'ai味', '机器感', '像人写的', '自然中文', 'humanize', 'remove ai tone'] },
  { skill: 'security-review', weight: 4, keywords: ['security', '鉴权', '漏洞', '安全'] },
  { skill: 'build-fix', weight: 4, keywords: ['build error', 'compile', 'type error', '报错'] },
  { skill: 'code-review', weight: 4, keywords: ['review', 'code review', '审查', '评审'] },
];

// Build layer → weight map for ranking
const LAYER_WEIGHTS = {
  foundation: 3,
  orchestration: 2,
  quality: 2,
  research: 2,
  domain: 1,
  utility: 1,
  meta: 0,
};

// Build reverse layer index: skill → layer
const skillLayerIndex = new Map();
for (const [layer, skills] of Object.entries(layerMap)) {
  for (const skill of skills) skillLayerIndex.set(skill, layer);
}

function normalizeText(input) {
  return String(input || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function tokenize(text) {
  return text.split(/[\s,;:.()\[\]{}'"]+/).filter((w) => w.length > 1);
}

// Score a skill against task text using its description + tags
function scoreSkill(taskTokens, taskText, skill) {
  const desc = normalizeText(skill.metadata.description || '');
  const tags = (skill.metadata.tags || '').replace(/[\[\]]/g, '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  const name = skill.name.replace(/-/g, ' ');

  let hits = 0;

  // Name match (high value)
  if (taskText.includes(skill.name) || taskText.includes(name)) hits += 3;

  // Tag matches
  for (const tag of tags) {
    if (taskText.includes(tag)) hits += 2;
  }

  // Description token overlap
  const descTokens = new Set(tokenize(desc));
  for (const token of taskTokens) {
    if (descTokens.has(token)) hits += 1;
  }

  return hits;
}

function catalogSkills(root) {
  const manifest = tryReadCatalogManifest(root);
  if (!manifest) return null;
  return new Set(manifest.skills.filter((skill) => skill.status === 'active').map((skill) => skill.name));
}

function indexedSkills(root) {
  const index = getFreshSkillIndex(root);
  if (!index) return null;

  const skills = new Map();
  for (const entry of index.skills) {
    if (entry.status !== 'active') continue;
    skills.set(entry.name, {
      name: entry.name,
      metadata: {
        description: entry.description || '',
        tags: Array.isArray(entry.tags) ? entry.tags.join(',') : '',
        intent: entry.intent || '',
        layer: entry.layer || '',
      },
    });
  }
  return skills;
}

function routeTaskToSkills(taskDescription, options = {}) {
  const taskText = normalizeText(taskDescription);
  const taskTokens = tokenize(taskText);
  const limit = Math.max(1, Number(options.limit) || 5);
  const root = options.root;
  const intentIndex = buildIntentIndex();
  const fromSkillIndex = root ? indexedSkills(root) : null;
  const available = fromSkillIndex ? new Set(fromSkillIndex.keys()) : catalogSkills(root);
  const dynamicSkillSource = fromSkillIndex || (root ? loadAllSkills(root) : null);

  // Phase 1: Boost rules (high-confidence keyword shortcuts)
  const boostScores = new Map();
  for (const rule of BOOST_RULES) {
    if (available && !available.has(rule.skill)) continue;
    let hits = 0;
    for (const kw of rule.keywords) {
      if (taskText.includes(normalizeText(kw))) hits += 1;
    }
    if (hits > 0) boostScores.set(rule.skill, hits * rule.weight);
  }

  // Phase 2: Dynamic scoring from all skill descriptions
  const dynamicScores = new Map();
  const dynamicMetadata = new Map();
  if (dynamicSkillSource) {
    for (const [name, skill] of dynamicSkillSource) {
      if (available && !available.has(name)) continue;
      const score = scoreSkill(taskTokens, taskText, skill);
      if (score > 0) dynamicScores.set(name, score);
      dynamicMetadata.set(name, skill.metadata || {});
    }
  }

  // Merge scores (boost takes precedence)
  const merged = new Map();
  for (const [name, score] of dynamicScores) merged.set(name, score);
  for (const [name, score] of boostScores) {
    merged.set(name, (merged.get(name) || 0) + score);
  }

  // Phase 3: Layer-aware ranking
  for (const [name, score] of merged) {
    const layer = skillLayerIndex.get(name) || dynamicMetadata.get(name)?.layer;
    const layerBoost = LAYER_WEIGHTS[layer] || 0;
    merged.set(name, score + layerBoost);
  }

  // Phase 4: Intent grouping — annotate with intent info
  const scored = Array.from(merged.entries())
    .map(([name, score]) => {
      const intent = intentIndex.get(name);
      const isCanonical = intent ? intentRegistry[intent]?.canonical === name : false;
      // Canonical skills get a small boost
      if (isCanonical) score += 1;
      return {
        skill: name,
        score,
        intent: intent || null,
        isCanonical,
        layer: skillLayerIndex.get(name) || dynamicMetadata.get(name)?.layer || 'unknown',
        rationale: boostScores.has(name)
          ? `keyword boost + ${fromSkillIndex ? 'skill-index match' : 'description match'}`
          : (fromSkillIndex ? 'skill-index match' : 'description match'),
      };
    })
    .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill));

  // Deduplicate
  const unique = [];
  const seen = new Set();
  for (const item of scored) {
    if (seen.has(item.skill)) continue;
    seen.add(item.skill);
    unique.push(item);
  }

  // Fallback
  if (unique.length === 0) {
    if (!available || available.has('autopilot')) unique.push({ skill: 'autopilot', score: 1, intent: 'execution', isCanonical: true, layer: 'orchestration', rationale: 'default fallback' });
    if (!available || available.has('plan')) unique.push({ skill: 'plan', score: 1, intent: 'planning', isCanonical: true, layer: 'foundation', rationale: 'default fallback' });
  }

  const top = unique.slice(0, limit);
  const totalScore = top.reduce((sum, item) => sum + item.score, 0);
  const confidence = Math.min(1, totalScore / 12);

  return {
    task: String(taskDescription || ''),
    confidence,
    recommendations: top,
  };
}

module.exports = {
  routeTaskToSkills,
};
