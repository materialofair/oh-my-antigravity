# BDD Generator Skill

**Behavior-Driven Development** assistant using **playwright-bdd**.

## Quick Start

触发词：
- "BDD", "生成BDD测试"
- "Given-When-Then", "Gherkin"
- "playwright-bdd", "feature file"

## 核心功能

1. **Feature 文件生成** - Gherkin 语法
2. **Step Definitions 脚手架** - TypeScript 实现
3. **TDD Guard 集成** - 强制 RED-GREEN-REFACTOR
4. **playwright-bdd 配置** - 零额外 runner

## 为什么选择 playwright-bdd？

```yaml
优势:
  ✅ 比 Cucumber.js 快 30-50%
  ✅ 无需额外 runner
  ✅ 原生 Playwright 集成
  ✅ 更好的调试体验
  ✅ 活跃维护（2025年）

避免:
  ❌ Cucumber.js 的复杂配置
  ❌ 两层抽象的性能损耗
  ❌ 调试困难
```

## 使用示例

### 生成 Feature 文件

```
User: "Create BDD test for user login"

Claude: [生成单个 scenario 的 feature 文件]
```

### 实现 Step Definitions

```
User: "Implement the steps"

Claude: [遵循 TDD Guard，一步一步实现]
```

### 项目配置

```
User: "Setup BDD in my project"

Claude: [完整配置指导]
```

## 与 TDD Guard 配合

- ✅ 一次只写一个 Scenario
- ✅ 一次只实现一个 Step
- ✅ 强制 RED-GREEN-REFACTOR 循环
- ✅ 防止过度设计

## 相关文档

- 完整技能定义：`SKILL.md`
- 使用演示：`DEMO.md`（待创建）
- 示例项目：`~/playwright-bdd-demo/`

## 集成其他 Skills

- **tdd-generator**: 单元测试
- **agent-kb**: BDD 最佳实践
- **quality-check**: 特性覆盖率分析
