---
name: debug-analysis
description: 深度调试分析 - 直接调用 Gemini/Codex CLI 进行系统性问题诊断，支持会话延续。
auto_invoke: true
tags: [debug, analysis, troubleshooting, direct-cli]
version: 0.1.0
source: fork
checksum: 1f5263f14ff7954cf722f3e002207c0148dc4aa01f16e38e3160f5b074cac3b8
updated_at: 2026-02-06T15:19:11+08:00
intent: debugging
layer: research
---


# Debug Analysis - 深度调试分析 Skill

## 🎯 核心功能

通过直接调用 Gemini 和 Codex CLI，进行系统性问题诊断和根因分析。

**替代**: PAL MCP debug 工具

## 📋 触发场景

**自动触发**:
- "调试问题"
- "系统性错误分析"
- "debug 这个问题"
- "根因分析"
- "为什么出现这个错误"

**手动触发**:
```
使用 debug-analysis 分析：<问题描述>
```

## 🔄 Workflow

### Step 1: 问题收集

收集问题的完整信息：
- 错误信息
- 日志片段
- 相关代码
- 复现步骤
- 环境信息

### Step 2: Gemini 深度分析 (1M 上下文)

**⚠️ 重要: 优先使用 `gemp` (长任务优化版)，`gemini` CLI 作为备用**

```bash
# Step 1: 写入 prompt 到临时文件
cat > /tmp/gemini_debug_prompt.txt << 'PROMPT_EOF'
作为资深调试专家，分析以下问题：

【问题描述】
<用户问题>

【错误日志】
<错误日志>

【相关代码】
<代码片段>

请进行系统性分析：
1. 问题表象分析
2. 可能的根本原因 (列出3-5个假设)
3. 验证方法
4. 修复建议

使用结构化思维，逐步推理。
PROMPT_EOF

# Step 2: 优先使用 gemp (20分钟超时，输出纯净)
cat /tmp/gemini_debug_prompt.txt | node ~/.gemini/long_task_runner.js 2>&1
```

**备用方案** (如果 gemp 失败):
```bash
cat /tmp/gemini_debug_prompt.txt | gemini --yolo 2>&1 | grep -v "STARTUP\|YOLO\|Load"
```

### Step 3: Codex 代码层面诊断

```bash
codex exec --json --dangerously-bypass-approvals-and-sandbox \
  --enable web_search_request \
  -c 'mcp_servers={}' \
  "作为代码诊断专家，分析以下问题：

【问题描述】
<用户问题>

【代码片段】
<代码>

请从代码层面诊断：
1. 代码逻辑问题
2. 边界条件检查
3. 异常处理缺陷
4. 并发/竞态问题
5. 具体修复代码

给出可直接使用的修复方案。
" 2>&1 | grep '"type":"item.completed"' | tail -1 | python3 -c "
import sys, json
data = json.loads(sys.stdin.read())
print(data['item']['text'])
"
```

### Step 4: Claude 综合诊断

基于两个模型的分析，Claude 提供：

1. **根因确认**
   - 最可能的根本原因
   - 证据支持
   - 确信度评估

2. **修复方案**
   - 立即修复 (临时方案)
   - 彻底修复 (根本方案)
   - 预防措施

3. **验证步骤**
   - 如何验证修复有效
   - 测试用例建议

## 📊 输出格式

```markdown
## 🔍 深度调试分析报告

**问题**: [问题描述]

---

### 🤖 Gemini 系统分析 (深度推理)

**问题表象**:
[问题的外在表现]

**根因假设** (优先级排序):
1. **假设1**: [描述] (可能性: 80%)
   - 证据: [...]
   - 验证: [...]

2. **假设2**: [描述] (可能性: 15%)
   - 证据: [...]
   - 验证: [...]

**详细分析**:
[Gemini 的完整推理过程]

---

### 💻 Codex 代码诊断

**代码层面问题**:
- [问题1]
- [问题2]

**具体修复方案**:

```typescript
// 修复前
<原代码>

// 修复后
<修复后的代码>
```

**修复说明**:
[Codex 的详细解释]

---

### 🎯 Claude 综合诊断

#### 根本原因

**确定的根因**: [最可能的原因]

**确信度**: [高/中/低]

**证据**:
- 证据1: [...]
- 证据2: [...]

#### 修复方案

**方案1: 立即修复** (临时)
```typescript
<临时修复代码>
```
- 优点: [...]
- 缺点: [...]
- 适用场景: 紧急上线

**方案2: 彻底修复** (推荐)
```typescript
<彻底修复代码>
```
- 优点: [...]
- 实施步骤:
  1. [步骤1]
  2. [步骤2]

#### 验证步骤

**1. 单元测试**:
```typescript
test('修复后不应出现错误', () => {
  // 测试用例
});
```

**2. 集成测试**:
- [测试场景1]
- [测试场景2]

**3. 监控指标**:
- 错误率应降至 <0.1%
- 响应时间应 <100ms

#### 预防措施

- [措施1]: 防止类似问题再次发生
- [措施2]: 代码规范改进
- [措施3]: 监控告警设置

---

**📅 诊断时间**: [时间戳]
**🤖 模型**: Gemini (系统分析) + Codex (代码诊断) + Claude (综合)
**⏱️ 总耗时**: [X 分钟]
```

## 🎓 使用示例

### 示例 1: 并发错误

**输入**:
```
debug-analysis：我们的订单系统偶尔出现重复扣款，错误日志：
Error: Duplicate charge detected for order #12345
复现概率约 1/1000 次下单
```

**流程**:
1. Gemini: 分析并发场景，推测竞态条件
2. Codex: 检查事务处理代码，找到未加锁的关键路径
3. Claude: 给出分布式锁方案 + Redis 实现代码

### 示例 2: 内存泄漏

**输入**:
```
debug-analysis：Node.js 应用内存持续增长，12小时后崩溃。
内存从 200MB 增长到 2GB。
```

**流程**:
1. Gemini: 分析内存泄漏常见模式 (闭包、事件监听器)
2. Codex: 检查代码中的事件监听、定时器、缓存
3. Claude: 定位具体泄漏点 + 修复建议 + 监控方案

### 示例 3: 性能问题

**输入**:
```
debug-analysis：API 响应时间从 50ms 突然增加到 2000ms。
数据库查询正常，CPU/内存正常。
```

**流程**:
1. Gemini: 分析网络、第三方服务、缓存失效等可能性
2. Codex: 检查异步处理、Promise 链、并发控制
3. Claude: 定位到未处理的 Promise rejection 导致请求堆积

## 🔄 上下文延续

### 多轮诊断

**使用 gemp 进行多轮诊断**:

```bash
# 第一轮：初步诊断
cat > /tmp/gemini_debug1.txt << 'PROMPT_EOF'
分析这个错误...
PROMPT_EOF
cat /tmp/gemini_debug1.txt | node ~/.gemini/long_task_runner.js 2>&1

# 第二轮：深入某个假设
cat > /tmp/gemini_debug2.txt << 'PROMPT_EOF'
深入分析假设1：竞态条件
PROMPT_EOF
cat /tmp/gemini_debug2.txt | node ~/.gemini/long_task_runner.js 2>&1

# 第三轮：验证方案
cat > /tmp/gemini_debug3.txt << 'PROMPT_EOF'
这个修复方案是否会引入新问题？
PROMPT_EOF
cat /tmp/gemini_debug3.txt | node ~/.gemini/long_task_runner.js 2>&1
```

**备用方案** (gemini CLI 多轮):
```bash
gemini -p "分析这个错误..." --yolo
gemini -p "深入分析假设1..." --resume latest --yolo
```

## ⚠️ 错误处理

### CLI 调用失败

**降级策略**:
- Gemini 失败 → Codex + Claude
- Codex 失败 → Gemini + Claude
- 都失败 → Claude 单模型分析

## 🆚 vs PAL MCP Debug

| 特性 | PAL MCP | Direct CLI Skill |
|------|---------|-----------------|
| 超时问题 | ❌ 容易超时 | ✅ 不会超时 |
| 深度推理 | ✅ 支持 | ✅ Gemini 原生支持 |
| 代码诊断 | ✅ 支持 | ✅ Codex GPT-5 |
| 上下文延续 | ✅ continuation_id | ✅ --resume |
| 调试难度 | ❌ 黑盒 | ✅ 透明 |

---

**创建时间**: 2025-12-19
**版本**: v1.0
**替代**: PAL MCP debug 工具
