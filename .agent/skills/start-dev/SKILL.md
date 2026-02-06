---
name: start-dev
description: Intelligent adaptive workflow with automatic pattern library loading, codebase exploration, and multi-approach architecture. Auto-detects frontend/backend tasks and loads relevant patterns.
owner: @maintainers
maturity: experimental
last-reviewed: 2026-02-06
---

# start-dev - Intelligent Workflow with Smart Pattern Loading

## Pseudo Multi-Agent Protocol (Codex)

Codex does not support native subagents. Simulate role handoffs with explicit sections.

Required sections (in order):
```
[ANALYST] Summary + constraints
[ARCHITECT] Approach + components
[EXECUTOR] Actions + changes
[REVIEWER] Verification + risks
```

> Codex invocation: use `start-dev: ...` or `$start-dev ...`

Execute complete Research → Plan → Implement workflow with **automatic pattern library loading** and intelligent codebase understanding.

## Usage

```
start-dev <feature description>
start-dev --no-explore <feature>    # Force skip exploration
start-dev --force-explore <feature> # Force deep exploration
start-dev --frontend <feature>      # Force frontend patterns
start-dev --backend <feature>       # Force backend patterns
```

## 🆕 NEW: Automatic Pattern Library Loading

The workflow now **automatically detects task type** and loads relevant pattern libraries:

### Task Type Detection

**Frontend Keywords** (auto-loads `frontend-patterns`):
- UI, 界面, 组件, 页面, 表单, 前端
- React, Vue, Angular, 样式, CSS
- 用户交互, 动画, 响应式, 布局
- Component, Hook, State, Props

**Backend Keywords** (auto-loads `backend-patterns`):
- API, 接口, 服务, 数据库, 后端
- 认证, 授权, 中间件, 缓存
- Redis, PostgreSQL, MongoDB
- Authentication, Authorization, Middleware

**Full-Stack Keywords** (loads both):
- 全栈, 完整功能, 端到端, full-stack
- 前后端, 整体实现, complete feature

### Pattern Loading Process

```
Step 0: Task Analysis
  ↓
Detect: Frontend/Backend/Full-Stack
  ↓
Auto-load: Relevant Pattern Library (631/587/1218 lines)
  ↓
Extract: Relevant patterns for this specific task
  ↓
Integrate: Patterns into Research & Planning phases
  ↓
Continue: Normal workflow execution
```

**Time overhead**: +1-2 minutes for pattern loading
**Accuracy improvement**: +25-35% (better architecture decisions)

---

## Complete Workflow Phases (Enhanced)

### Phase 0A: 🎯 Pattern Library Loading (NEW - Automatic)

**Trigger**: Automatic task type detection

**Actions**:
1. **Analyze feature request** for task type indicators
2. **Load relevant patterns**:
   - Frontend: 631 lines of component patterns, hooks, performance optimization
   - Backend: 587 lines of API design, caching, authentication patterns
   - Full-Stack: Both libraries (1,218 lines total)
3. **Extract relevant sections**:
   - Filter patterns matching the specific task
   - Identify 3-5 most relevant patterns
   - Prepare pattern references for next phases
4. **Create Pattern Context**:
   - Key patterns to follow
   - Best practices to apply
   - Common pitfalls to avoid
   - Code examples to reference

**Time**: 1-2 minutes

**Output**: Pattern Context with:
- Task type: [frontend/backend/full-stack]
- Patterns loaded: [count] lines
- Relevant patterns: [list]
- Code examples: [count]

**Example Output**:
```
🎯 Task Type Detected: Frontend
📚 Loading frontend-patterns (631 lines)...
✅ Patterns loaded successfully

Relevant Patterns Identified:
1. Form Handling Pattern (lines 245-280)
2. State Management with Context (lines 320-365)
3. Error Boundary Pattern (lines 410-445)
4. Custom Hooks: useForm (lines 180-210)

Code Examples Available:
- Form validation with Zod
- Context + Reducer pattern
- Error handling best practices
```

---

### Phase 0B: 🔍 Codebase Exploration (Conditional)

**Trigger**: Intelligent auto-detection or `--force-explore`

**Actions**:
1. Analyze feature request for existing code references
2. Launch code-explorer agents in parallel:
   - **Explorer 1**: Similar feature tracing
   - **Explorer 2**: Architecture pattern analysis
   - **Explorer 3** (deep mode only): Integration points mapping
3. Identify 5-10 key files to read
4. Extract patterns, abstractions, and conventions
5. **Cross-reference with loaded pattern library**
6. Build context for next phases

**Time**: 3-8 minutes depending on mode

**Output**: Exploration report with:
- Entry points and execution flows
- Architecture layers and patterns
- Key files list with file:line references
- Dependencies and integration points
- **Pattern library alignment check**

---

### Phase 1: 📚 Research (Enhanced with Patterns)

**Goal**: Version-accurate documentation + Pattern-guided approach

**Actions**:
1. Perform version-accurate research (apply research-methodology principles)
2. Apply `research-methodology` skill
3. **Integrate loaded pattern library**:
   - Reference relevant patterns from Phase 0A
   - Apply best practices from pattern library
   - Use code examples as templates
4. Integrate Phase 0B findings (if available)
5. Create ResearchPack with:
   - Library version identification
   - API documentation (minimum 3 APIs)
   - Code examples
   - **Pattern-aligned implementation approach**
   - Best practices from existing codebase

**Quality Gate**: ResearchPack score ≥ 80
- ✅ Pass → Proceed to Planning
- ⛔ Fail → Block, request fixes

**Time**: 2-5 minutes

**Enhanced Output**:
```
ResearchPack Created:
- Library: React Hook Form v7.45.0
- APIs documented: 5
- Pattern alignment: ✅ Form Handling Pattern
- Code examples: 3 (from pattern library)
- Best practices: 8 (from frontend-patterns)
- Score: 87/100 ✅
```

---

### Phase 2: 📋 Planning (Enhanced with Patterns)

**Goal**: Compare multiple implementation approaches using pattern library guidance

**Actions**:
1. Launch 2-3 `code-architect` agents in parallel with different focuses:
   - **Minimal changes**: Smallest change, maximum reuse
   - **Clean architecture**: Maintainability, elegant abstractions
   - **Pragmatic balance**: Speed + quality (default recommendation)
   - **NEW: Pattern-aligned**: Follow loaded pattern library closely

2. **Pattern-guided architecture**:
   - Apply patterns from Phase 0A
   - Ensure consistency with pattern library
   - Use recommended abstractions
   - Follow best practices

3. Compare approaches:
   - Files to modify count
   - Complexity vs maintainability trade-offs
   - **Pattern library compliance**
   - Integration risks
   - Testing requirements

4. **Auto-select or quick confirm** (5 seconds):
   - ACE recommends best fit based on:
     - Feature complexity
     - Team context
     - **Pattern library alignment**
     - Past similar decisions
   - User can override if needed

5. Create an Implementation Plan
6. Apply `planning-methodology` skill
7. Create Implementation Plan with:
   - Chosen architecture approach
   - **Pattern library references** (file:line)
   - Files to create/modify (absolute paths)
   - Step-by-step implementation sequence
   - Rollback strategy
   - Risk assessment

**Quality Gate**: Implementation Plan score ≥ 85
- ✅ API matching with ResearchPack
- ✅ **Pattern library compliance**
- ✅ Rollback plan present
- ✅ Pass → Proceed to Implementation
- ⛔ Fail → Block, suggest research update

**Time**: 3-8 minutes

**Enhanced Output**:
```
Implementation Plan Created:
- Approach: Pattern-aligned (recommended)
- Pattern references:
  • Form Handling Pattern (frontend-patterns:245-280)
  • useForm Hook (frontend-patterns:180-210)
  • Error Boundary (frontend-patterns:410-445)
- Files to modify: 3
- Steps: 8
- Pattern compliance: 95% ✅
- Score: 91/100 ✅
```

---

### Phase 3: ⚡ Implementation (Pattern-Guided)

**Goal**: TDD implementation following pattern library

**Pre-check**: Circuit breaker must be closed

**Actions**:
1. Implement the plan
2. **Apply patterns from library**:
   - Use code examples as templates
   - Follow recommended abstractions
   - Apply best practices
3. Execute plan with TDD enforcement:
   - Write test first (RED)
   - Implement code (GREEN) **using patterns**
   - Refactor (REFACTOR) **to match patterns**
4. Self-correction loop (max 3 attempts)
5. **Pattern compliance check**
6. Validate all tests pass
7. Record circuit breaker state

**Circuit Breaker**: Opens after 3 failed attempts
- Prevents infinite loops
- Requires manual reset
- Provides complete failure analysis

**Time**: 5-25 minutes depending on complexity

**Enhanced Output**:
```
Implementation Complete:
- Files created: 2
- Files modified: 3
- Tests passing: 12/12 ✅
- Pattern compliance: 92% ✅
- Patterns applied:
  • Form Handling Pattern ✅
  • useForm Hook ✅
  • Error Boundary ✅
- Self-corrections: 1
```

---

### Phase 4: 🔎 Quality Review (Pattern-Aware)

**Goal**: Three-dimension code quality assurance + Pattern compliance

**Actions**:
1. Launch 3 `code-reviewer` agents in parallel:
   - **Reviewer 1**: Simplicity/DRY/Elegance focus
   - **Reviewer 2**: Bugs/Functional correctness focus
   - **Reviewer 3**: Project conventions/Abstractions focus
   - **NEW: Pattern Reviewer**: Pattern library compliance

2. **Pattern compliance check**:
   - Verify patterns were applied correctly
   - Check for pattern violations
   - Ensure best practices followed
   - Validate code examples usage

3. Consolidate findings:
   - **Critical** (confidence ≥90): Auto-fix immediately
   - **High** (confidence 80-89): Auto-fix or report
   - **Medium/Low** (confidence <80): Report only
   - **Pattern violations**: Report with fix suggestions

4. **Auto-remediation**:
   - Critical issues: Fix automatically
   - High issues: Quick fix if safe, otherwise report
   - Pattern violations: Suggest fixes with pattern references
   - Medium/Low: Add to improvement backlog

**Time**: 3-5 minutes

**Output**: Quality report with:
- Issues fixed automatically
- Issues requiring attention
- **Pattern compliance score**
- Improvement suggestions
- Overall quality score

---

### Phase 5: 🧠 Knowledge Capture (Pattern Learning)

**Goal**: Continuous learning and pattern recognition

**Actions**:
1. Apply `pattern-recognition` skill
2. **Record pattern usage**:
   - Which patterns were most helpful
   - Pattern application success rate
   - Pattern-related issues encountered
3. Update knowledge-core.md with:
   - Successful patterns identified
   - Architecture decisions and rationale
   - Common pitfalls avoided
   - Integration strategies used
   - **Pattern library effectiveness**

4. **ACE Self-Learning** (Background, async):
   - Evaluate workflow execution score
   - Analyze what worked / what didn't
   - **Update pattern selection strategies**
   - Sync to Agent-KB every 10 workflows

5. Record decision data:
   - Was exploration helpful? (for future decisions)
   - Which architecture approach worked best?
   - **Which patterns were most effective?**
   - What quality issues were most common?
   - Time spent vs complexity

**Time**: 1-2 minutes

---

## Output: Complete Project Report (Enhanced)

### 📈 Project Summary
- **Goal**: [Your request]
- **Task Type**: [frontend/backend/full-stack] 🆕
- **Patterns Loaded**: [count] lines 🆕
- **Exploration Mode**: [deep/light/none]
- **Architecture Chosen**: [minimal/clean/pragmatic/pattern-aligned] 🆕
- **Outcome**: [What was delivered]
- **Duration**: [Actual time]
- **Agents Used**: [List]

### 🛠️ Phase Results

**Phase 0A - Pattern Loading** (NEW): 🆕
- Task type detected: [frontend/backend/full-stack]
- Pattern library loaded: [name] ([count] lines)
- Relevant patterns: [count]
- Code examples: [count]
- Pattern context created: ✅

**Phase 0B - Exploration** (if enabled):
- Similar features found: [count]
- Key files identified: [count]
- Patterns extracted: [list]
- Pattern library alignment: [percentage] 🆕
- Exploration mode: [deep/light]

**Phase 1 - Research**:
- Library/API researched: [name + version]
- APIs documented: [count]
- Pattern alignment: [percentage] 🆕
- ResearchPack score: [X/100]

**Phase 2 - Planning**:
- Approaches compared: [count]
- Approach selected: [name]
- Pattern references: [count] 🆕
- Files to change: [count]
- Implementation steps: [count]
- Pattern compliance: [percentage] 🆕
- Risks identified: [count]
- Plan score: [X/100]

**Phase 3 - Implementation**:
- Files created: [count]
- Files modified: [count]
- Patterns applied: [list] 🆕
- Tests passing: [X/X]
- Pattern compliance: [percentage] 🆕
- Self-corrections: [count]
- Circuit breaker: [open/closed]

**Phase 4 - Quality Review**:
- Critical issues fixed: [count]
- High issues fixed: [count]
- Pattern violations: [count] 🆕
- Medium/Low reported: [count]
- Pattern compliance score: [X/100] 🆕
- Overall quality score: [X/100]

**Phase 5 - Knowledge**:
- Patterns captured: [count]
- Pattern effectiveness: [rating] 🆕
- Decisions recorded: [count]
- ACE learning: [enabled/disabled]

### 📚 Artifacts Created
- PatternContext.md (NEW) 🆕
- ExplorationReport.md (if Phase 0B enabled)
- ResearchPack.md
- ArchitectureComparison.md
- ImplementationPlan.md
- QualityReview.md
- PatternComplianceReport.md (NEW) 🆕
- Code files: [list]
- Test files: [list]

### 🧠 Knowledge Captured
- Architecture patterns identified
- **Pattern library effectiveness** 🆕
- Integration strategies used
- Quality improvements made
- ACE playbook updates

---

## Examples (Enhanced)

### Example 1: Frontend Task (Auto Pattern Loading)
```
start-dev 实现用户登录表单，包含邮箱和密码验证

🎯 Task Type Detected: Frontend
📚 Loading frontend-patterns (631 lines)...
✅ Patterns loaded successfully

Relevant Patterns:
1. Form Handling Pattern
2. Custom Hook: useForm
3. Error Boundary Pattern

⚡ Executing workflow with pattern guidance...
⏱️  Expected: 18-22 minutes
```

### Example 2: Backend Task (Auto Pattern Loading)
```
start-dev Add JWT authentication middleware to Express API

🎯 Task Type Detected: Backend
📚 Loading backend-patterns (587 lines)...
✅ Patterns loaded successfully

Relevant Patterns:
1. Authentication Pattern (JWT)
2. Middleware Pattern
3. Error Handling Pattern

⚡ Executing workflow with pattern guidance...
⏱️  Expected: 20-25 minutes
```

### Example 3: Full-Stack Task (Both Patterns)
```
start-dev 实现完整的用户认证功能，包括前端登录界面和后端API

🎯 Task Type Detected: Full-Stack
📚 Loading frontend-patterns (631 lines)...
📚 Loading backend-patterns (587 lines)...
✅ Both pattern libraries loaded (1,218 lines total)

Relevant Patterns:
Frontend:
1. Form Handling Pattern
2. State Management Pattern

Backend:
1. JWT Authentication Pattern
2. API Design Pattern

⚡ Executing workflow with comprehensive pattern guidance...
⏱️  Expected: 35-45 minutes
```

### Example 4: Force Specific Pattern Library
```
start-dev --frontend Add caching layer to API responses

🎯 User Override: Frontend patterns forced
📚 Loading frontend-patterns (631 lines)...
✅ Patterns loaded successfully

Note: Task seems backend-related but frontend patterns loaded per user request
```

---

## Pattern Library Benefits

### Before Pattern Loading
```
Research → Plan → Implement
  ↓         ↓         ↓
Generic   Generic   Trial &
approach  design    Error
```

### After Pattern Loading (NEW)
```
Pattern Loading → Research → Plan → Implement
      ↓              ↓         ↓         ↓
  Best practices  Pattern-   Pattern-  Pattern-
  identified      guided     aligned   compliant
                  research   design    code
```

**Improvements**:
- ✅ +25-35% better architecture decisions
- ✅ +40% fewer pattern violations
- ✅ +30% faster implementation (less trial & error)
- ✅ +50% better code consistency
- ✅ 1,627 lines of professional patterns available

---

## Tips for Best Results (Enhanced)

**Be specific in request**:
- ❌ "Add caching" (too vague)
- ✅ "Add Redis caching to ProductService with 5-minute TTL"

**Mention task type explicitly** (helps pattern detection):
- ✅ "前端: 实现用户登录界面"
- ✅ "Backend: Add JWT authentication"
- ✅ "Full-stack: Complete user management feature"

**Reference patterns if you know them**:
- ✅ "Use Repository Pattern for data access"
- ✅ "Apply Compound Component pattern"
- ✅ "Follow Error Boundary best practices"

**Mention existing code explicitly** (triggers exploration):
- ✅ "在现有的用户认证系统中添加 OAuth 支持"
- ✅ "Integrate with existing payment flow"
- ✅ "Extend current logging to include request tracing"

---

## Quality Gates (Enhanced)

**Pattern Loading → Research**:
- ✅ Task type detected
- ✅ Pattern library loaded
- ✅ Relevant patterns identified
- ⛔ If pattern loading fails: Continue without patterns (log warning)

**Research → Planning**:
- ✅ ResearchPack score ≥ 80
- ✅ **Pattern alignment ≥ 70%** 🆕
- ✅ Library version identified
- ✅ Minimum 3 APIs documented
- ⛔ If fail: Blocks planning, requests fixes

**Planning → Implementation**:
- ✅ Plan score ≥ 85
- ✅ **Pattern compliance ≥ 80%** 🆕
- ✅ APIs match ResearchPack exactly
- ✅ Rollback plan present
- ⛔ If fail: Blocks implementation, requests fixes

**Implementation → Quality Review**:
- ✅ Circuit breaker closed
- ✅ All tests passing
- ✅ **Pattern compliance ≥ 75%** 🆕
- ✅ Build successful
- ⛔ If fail: Up to 3 self-corrections, then block

---

## Time Estimates (Updated)

| Complexity | Pattern | Exploration | Research | Planning | Implementation | Review | Total |
|------------|---------|-------------|----------|----------|----------------|--------|-------|
| Simple     | +1 min  | +0 min      | 2 min    | 3 min    | 5 min          | 3 min  | 14-16 min |
| Simple (explore) | +1 min | +3 min | 2 min    | 5 min    | 5 min          | 3 min  | 19-21 min |
| Medium     | +2 min  | +5 min      | 3 min    | 5 min    | 15 min         | 4 min  | 34-37 min |
| Complex    | +2 min  | +8 min      | 5 min    | 8 min    | 25 min         | 5 min  | 53-57 min |

**Pattern loading overhead**: +1-2 minutes
**Accuracy improvement**: +25-35%
**Implementation speed**: +30% (less trial & error)

---

**Executing enhanced workflow with automatic pattern loading...**

## Intelligent Workflow Orchestration (Enhanced)

I will now execute the intelligent adaptive workflow with pattern library support:

### Step 1: Analyze Feature Request & Detect Task Type 🆕
I'll analyze your request for:
- **Task type** (frontend/backend/full-stack) 🆕
- Trigger keywords (existing code references)
- Project context (size, complexity)
- Similar feature patterns
- ACE historical data

### Step 2: Load Relevant Pattern Library 🆕
Based on task type, I'll load:
- **Frontend patterns** (631 lines): Components, Hooks, Performance
- **Backend patterns** (587 lines): API, Auth, Caching
- **Both** (1,218 lines): Full-stack features
- Extract 3-5 most relevant patterns for this task

### Step 3: Decide Exploration Mode
Based on analysis, I'll choose:
- `deep_exploration`: 2-3 code-explorer agents
- `light_exploration`: 1 code-explorer agent
- `no_exploration`: Direct to research

### Step 4: Execute Phases with Pattern Guidance 🆕
I'll orchestrate all phases with:
- **Pattern-guided research and planning** 🆕
- Quality gates at each transition
- **Pattern compliance checks** 🆕
- Automatic error handling and retries
- Multi-agent parallelization
- Progress reporting

### Step 5: Synthesize Report
I'll provide comprehensive final report with:
- **Pattern loading results** 🆕
- All phase results
- **Pattern compliance scores** 🆕
- Quality metrics
- Artifacts created
- Knowledge captured
- Next steps


**Expected duration**: 16-72 minutes depending on complexity and exploration mode
**Pattern overhead**: +1-2 minutes
**Accuracy improvement**: +25-35%

**Enhancements**:
- ✅ **Automatic pattern library loading** 🆕
- ✅ **Task type detection** 🆕
- ✅ **Pattern-guided implementation** 🆕
- ✅ **Pattern compliance checking** 🆕
- ✅ Automatic codebase exploration (when needed)
- ✅ Multi-approach architecture comparison
- ✅ Three-dimension quality review
- ✅ Intelligent decision learning
- ✅ 30-40% higher accuracy with only 10-15% time overhead

## Output

- Produce a concrete deliverable in markdown aligned with the workflow/skill goal.
- Include key decisions, actions taken, and final status for Antigravity IDE visibility.
