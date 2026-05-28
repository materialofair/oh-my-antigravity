const assert = require('assert');
const {
  compareVersions,
  calculateDescriptionSimilarity,
  resolveConflicts
} = require('../src/merge/skill-merger');

function runTest(name, fn) {
  try {
    fn();
    console.log(`[PASS] ${name}`);
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(err);
    process.exit(1);
  }
}

console.log('Running oh-my-antigravity unit tests...\n');

// 1. compareVersions 测试
runTest('compareVersions standard cases', () => {
  assert.strictEqual(compareVersions('1.0.0', '2.0.0'), -1);
  assert.strictEqual(compareVersions('2.1.0', '2.0.9'), 1);
  assert.strictEqual(compareVersions('1.0.0', '1.0.0'), 0);
  assert.strictEqual(compareVersions('1.0', '1.0.0'), 0); // 补缺缺省部分
  assert.strictEqual(compareVersions('2.2.3', '2.2.10'), -1);
});

// 2. calculateDescriptionSimilarity 测试
runTest('calculateDescriptionSimilarity English cases', () => {
  const descA = 'Detailed design patterns for building React applications with TypeScript and Vite.';
  const descB = 'Detailed design patterns for building React apps with TS and Vite bundler.';
  const descC = 'Completely unrelated python script running machine learning model.';

  const simAB = calculateDescriptionSimilarity(descA, descB);
  const simAC = calculateDescriptionSimilarity(descA, descC);

  assert.ok(simAB > 0.4, `AB similarity should be decent, got ${simAB}`);
  assert.ok(simAC < 0.1, `AC similarity should be very low, got ${simAC}`);
});

runTest('calculateDescriptionSimilarity Chinese cases (Chinese Tokenizer)', () => {
  const descZH1 = '用于构建高性能 React 应用的详细设计模式指南，采用 TypeScript 技术栈。';
  const descZH2 = '用于构建高性能 React 应用的详细设计模式，基于 TypeScript 开发。';
  const descZH3 = '完全不相关的 Python 后端数据分析脚本。';

  const simZH12 = calculateDescriptionSimilarity(descZH1, descZH2);
  const simZH13 = calculateDescriptionSimilarity(descZH1, descZH3);

  // 原先的版本中因为没有空格，simZH12 会是 0，因为整个中文句被当做一个巨长单词且 length 超过限制，
  // 现在按字分词后，相似度应该非常高 (>0.6)。
  assert.ok(simZH12 > 0.6, `ZH12 similarity should be high, got ${simZH12}`);
  assert.ok(simZH13 < 0.1, `ZH13 similarity should be very low, got ${simZH13}`);
});

// 3. resolveConflicts 测试
runTest('resolveConflicts - Fork priority', () => {
  const conflicts = [
    {
      type: 'exact_name',
      name: 'test-skill',
      versions: [
        { name: 'test-skill', sourceName: 'superpowers', metadata: { version: '2.0.0' } },
        { name: 'test-skill', sourceName: 'fork', metadata: { version: '1.0.0' } }
      ]
    }
  ];

  const resolutions = resolveConflicts(conflicts, {});
  const res = resolutions[0];
  assert.strictEqual(res.resolution, 'fork-priority');
  assert.strictEqual(res.winner.sourceName, 'fork', 'Local fork must win even if upstream has higher version');
});

runTest('resolveConflicts - User preference priority', () => {
  const conflicts = [
    {
      type: 'exact_name',
      name: 'test-skill',
      versions: [
        { name: 'test-skill', sourceName: 'superpowers', metadata: { version: '1.0.0' } },
        { name: 'test-skill', sourceName: 'oh-my-codex', metadata: { version: '2.0.0' } }
      ]
    }
  ];

  const config = {
    preferences: {
      'test-skill': 'superpowers'
    }
  };

  const resolutions = resolveConflicts(conflicts, config);
  const res = resolutions[0];
  assert.strictEqual(res.resolution, 'user-preference');
  assert.strictEqual(res.winner.sourceName, 'superpowers', 'User preference must win');
});

runTest('resolveConflicts - SemVer priority', () => {
  const conflicts = [
    {
      type: 'exact_name',
      name: 'test-skill',
      versions: [
        { name: 'test-skill', sourceName: 'superpowers', metadata: { version: '1.0.0' } },
        { name: 'test-skill', sourceName: 'oh-my-codex', metadata: { version: '2.0.0' } }
      ]
    }
  ];

  const resolutions = resolveConflicts(conflicts, {});
  const res = resolutions[0];
  assert.strictEqual(res.resolution, 'semver');
  assert.strictEqual(res.winner.sourceName, 'oh-my-codex', 'Higher SemVer must win');
});

console.log('\nAll unit tests passed successfully!');
