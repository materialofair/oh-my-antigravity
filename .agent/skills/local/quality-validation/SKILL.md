---
name: quality-validation
description: Validate ResearchPacks and Implementation Plans with scoring rubrics and quality gates. Prevents garbage-in-garbage-out scenarios.
auto_invoke: false
tags: [validation, quality, verification, gates]
version: 0.1.0
source: fork
checksum: 8c8656ea4d93dad0d4a86a99cd971a4c63a0199d5ee969196a54d0b5b270562d
updated_at: 2026-02-05T16:22:10+08:00
layer: quality
---


# Quality Validation Skill

This skill provides systematic validation methodology to ensure ResearchPacks and Implementation Plans meet quality standards before proceeding to implementation.

> Codex CLI: Manual invocation only (`$quality-validation`). No hooks or auto-run.

## When to Use This Skill (Manual)

Use this skill manually when:
- ResearchPack completed and needs validation before planning
- Implementation Plan completed and needs validation before coding
- User explicitly requests quality check ("validate this", "is this complete?")
- About to proceed to next workflow phase (quality gate trigger)

## Core Principles (BRAHMA Constitution)

1. **Verification over speculation** - Validate with objective criteria
2. **Quality gates** - Don't proceed with bad inputs
3. **Reproducibility** - Same input quality = same score
4. **Explicit defects** - List specific problems, not vague "could be better"

## Validation Targets

### Research Type Detection

Before scoring, detect research type to apply appropriate rubric:

#### Type 1: API/Library Research
**Indicators**:
- Contains API endpoints, function signatures, method calls
- Code examples with specific library imports
- Configuration/setup steps for external dependencies
- Version numbers for libraries/frameworks

**Scoring**: Use API Research Rubric (80+ pass threshold)

#### Type 2: Philosophy Research
**Indicators**:
- Contains themes, principles, patterns, methodologies
- Thematic organization (Theme 1, Theme 2, etc.)
- Cross-source synthesis
- Engineering philosophy or best practices analysis
- Pattern extraction from multiple sources

**Scoring**: Use Philosophy Research Rubric (70+ pass threshold)

**Examples**: Engineering philosophy, architectural patterns, best practices, methodology research

#### Type 3: Pattern Research
**Indicators**:
- Contains code patterns, design patterns, anti-patterns
- Architectural decisions and tradeoffs
- Implementation strategies
- Performance optimization patterns

**Scoring**: Use Pattern Research Rubric (70+ pass threshold)

**Why Different Thresholds?**
- API research is more objective (APIs exist or don't, versions are correct or wrong)
- Philosophy research is more subjective (thematic organization, synthesis quality)
- Philosophy research provides strategic value even if not as "complete" as API docs

### 1. ResearchPack Validation - API/Library Type

**Purpose**: Ensure research is complete, accurate, and actionable before planning

**Validation Rubric for API/Library Research** (100 points total, 80+ pass threshold):

#### Completeness (40 points)
- ✓ Library/API identified with version (10 pts)
- ✓ At least 3 key APIs documented (10 pts)
- ✓ Setup/configuration steps provided (10 pts)
- ✓ At least 1 complete code example (10 pts)

#### Accuracy (30 points)
- ✓ All API signatures match official docs exactly (15 pts)
  - Check: No paraphrasing, exact parameter types, correct returns
- ✓ Version numbers correct and consistent (5 pts)
- ✓ URLs all valid and point to official sources (10 pts)
  - Test: Each URL should be from official domain

#### Citation (20 points)
- ✓ Every API has source URL (10 pts)
- ✓ Sources include version and section references (5 pts)
- ✓ Confidence level stated and justified (5 pts)

#### Actionability (10 points)
- ✓ Implementation checklist provided (5 pts)
- ✓ Open questions identify real decisions (5 pts)

**Passing Score**: 80/100 or higher

**Validation Process**:

```python
# Pseudo-code for validation logic
def validate_research_pack(research_pack):
    score = 0
    defects = []

    # Completeness checks
    if has_library_with_version(research_pack):
        score += 10
    else:
        defects.append("CRITICAL: Library/version not identified")

    api_count = count_documented_apis(research_pack)
    if api_count >= 3:
        score += 10
    elif api_count > 0:
        score += (api_count / 3) * 10
        defects.append(f"MINOR: Only {api_count} APIs documented, need 3+")
    else:
        defects.append("CRITICAL: No APIs documented")

    # ... (continue for all criteria)

    return {
        "score": score,
        "grade": "PASS" if score >= 80 else "FAIL",
        "defects": defects,
        "recommendations": generate_recommendations(defects)
    }
```

**Output Format**:

```markdown
## 📊 ResearchPack Validation Report

**Overall Score**: [X]/100
**Grade**: [PASS ✅ / FAIL ❌]

### Breakdown
- Completeness: [X]/40
- Accuracy: [X]/30
- Citation: [X]/20
- Actionability: [X]/10

### Defects Found ([N])

#### CRITICAL (blocks implementation)
1. [Specific defect with example]
2. [Another defect]

#### MAJOR (should fix before proceeding)
1. [Defect]

#### MINOR (nice to have)
1. [Defect]

### Recommendations

**To reach passing score**:
1. [Specific action to take]
2. [Another action]

**If score >= 80**: ✅ **APPROVED** - Proceed to implementation-planner

**If score < 80**: ❌ **BLOCKED** - Fix critical/major defects and re-validate
```

### 1b. ResearchPack Validation - Philosophy Research Type

**Purpose**: Ensure philosophy/pattern research is well-organized, sourced, and actionable

**Validation Rubric for Philosophy Research** (100 points total, 70+ pass threshold):

#### Thematic Organization (30 points)
- ✓ Clear themes/patterns identified with descriptive names (10 pts)
  - Check: Each theme has a clear title and scope
  - Examples: "Agent Architecture", "Context Engineering", "Multi-Agent Patterns"
- ✓ Each theme well-documented with examples and evidence (10 pts)
  - Check: Themes have sub-sections, not just bullet points
  - Check: Examples or quotes support each theme
- ✓ Cross-theme synthesis and relationships explained (10 pts)
  - Check: "How patterns connect" or "Synthesis" section present
  - Check: Explains how themes relate or build on each other

#### Source Quality (20 points)
- ✓ Official/authoritative sources cited (10 pts)
  - Check: URLs from official domains (anthropic.com, docs.*, official repos)
  - Examples: Anthropic blog, official documentation, framework guides
- ✓ Multiple sources per theme (5 pts)
  - Check: Each major theme cites 2+ sources
  - No single-source themes (indicates narrow research)
- ✓ Date/version information when applicable (5 pts)
  - Check: Article dates, release versions, "as of [date]" present
  - Helps determine if research is current

#### Actionable Insights (30 points)
- ✓ Implementation checklist provided (15 pts)
  - Check: Concrete next steps for applying research
  - Format: "Enhancement 1.1:", "Step 1:", "Action Items"
  - Examples: "Add think protocol to agents", "Create context-engineering skill"
- ✓ Specific patterns extracted and documented (10 pts)
  - Check: Patterns section with clear pattern names
  - Check: Each pattern has description and when to use
  - Examples: "Pattern 1: Minimal Scaffolding", "Pattern 2: Think Before Act"
- ✓ Open questions identified for planning phase (5 pts)
  - Check: Research acknowledges what's unknown or needs deciding
  - Examples: "Which agents need think tool?", "When to use multi-agent?"

#### Depth & Coverage (20 points)
- ✓ Comprehensive coverage of topic (10 pts)
  - Check: Multiple aspects of topic covered
  - Check: Not surface-level (goes beyond basic definitions)
  - Examples: 7+ themes, 10+ sources for major topics
- ✓ Sufficient detail for implementation (10 pts)
  - Check: Enough context to make decisions
  - Check: Includes performance metrics, tradeoffs, examples
  - Examples: "39% improvement", "15x cost", specific numbers

**Passing Score**: 70/100 or higher

**Why Lower Threshold Than API Research?**

Philosophy research is inherently more subjective and thematic. A well-organized thematic analysis with 7 patterns from 11 sources (like the Anthropic ResearchPack) deserves to pass even if it doesn't have "3+ API endpoints with exact signatures."

Philosophy research provides **strategic value**:
- Informs how to build, not just what APIs to call
- Establishes principles that apply across implementations
- Captures institutional knowledge and best practices
- Enables better decision-making during planning

**Example: Anthropic Engineering Philosophy ResearchPack**

Would score:
- **Thematic Organization**: 30/30 (7 clear themes, cross-synthesis section)
- **Source Quality**: 20/20 (11 official Anthropic articles, all dated)
- **Actionable Insights**: 28/30 (Implementation checklist present, 7 patterns extracted, open questions listed)
- **Depth & Coverage**: 18/20 (Comprehensive, but more examples would help)
- **Total**: 96/100 ✅ **PASS** (well above 70 threshold)

**Output Format**:

```markdown
## 📊 ResearchPack Validation Report (Philosophy Research)

**Overall Score**: [X]/100
**Grade**: [PASS ✅ / FAIL ❌]
**Research Type**: Philosophy/Pattern Research

### Breakdown

**Thematic Organization** ([X]/30):
- Clear themes: [Y/10] [✓/✗]
- Theme documentation: [Y/10] [✓/✗]
- Cross-synthesis: [Y/10] [✓/✗]

**Source Quality** ([X]/20):
- Official sources: [Y/10] [✓/✗]
- Multiple sources per theme: [Y/5] [✓/✗]
- Date/version info: [Y/5] [✓/✗]

**Actionable Insights** ([X]/30):
- Implementation checklist: [Y/15] [✓/✗]
- Patterns extracted: [Y/10] [✓/✗]
- Open questions: [Y/5] [✓/✗]

**Depth & Coverage** ([X]/20):
- Comprehensive coverage: [Y/10] [✓/✗]
- Sufficient detail: [Y/10] [✓/✗]

### Defects Found ([N])

#### CRITICAL (blocks implementation)
1. [Defect - if no themes identified, no patterns extracted, etc.]

#### MAJOR (should fix before proceeding)
1. [Defect - if only 1 source per theme, missing implementation checklist, etc.]

#### MINOR (nice to have)
1. [Defect - if some themes lack examples, could use more sources, etc.]

### Recommendations

**To reach passing score** (if < 70):
1. [Specific action to take]
2. [Another action]

**If score >= 70**: ✅ **APPROVED** - Proceed to implementation-planner

**If score < 70**: ❌ **BLOCKED** - Fix critical/major defects and re-validate

**Philosophy Research Note**: This research provides strategic guidance for implementation. Even if specific API details are needed later, the principles and patterns documented here are valuable for decision-making.
```

### 2. Implementation Plan Validation

**Purpose**: Ensure plan is complete, safe, and executable before coding

**Validation Rubric** (100 points total):

#### Completeness (35 points)
- ✓ All file changes listed with purposes (10 pts)
- ✓ Step-by-step implementation sequence (10 pts)
- ✓ Each step has verification method (10 pts)
- ✓ Test plan included (5 pts)

#### Safety (30 points)
- ✓ Rollback plan complete and specific (15 pts)
  - Must include: exact commands, verification steps, triggers
- ✓ Risk assessment done (10 pts)
  - At least 3 risks identified with mitigations
- ✓ Changes are minimal (fewest files possible) (5 pts)

#### Clarity (20 points)
- ✓ Steps are actionable (no ambiguity) (10 pts)
- ✓ Success criteria defined (5 pts)
- ✓ Time estimates provided (5 pts)

#### Alignment (15 points)
- ✓ Plan matches ResearchPack APIs (10 pts)
- ✓ Plan addresses all requirements from user (5 pts)

**Passing Score**: 85/100 or higher (higher bar than research)

**Validation Process**:

```python
def validate_implementation_plan(plan, research_pack):
    score = 0
    defects = []

    # Completeness checks
    if has_file_changes_list(plan):
        score += 10
    else:
        defects.append("CRITICAL: No file changes specified")

    steps = extract_steps(plan)
    if all(step_has_verification(s) for s in steps):
        score += 10
    else:
        missing = [s for s in steps if not step_has_verification(s)]
        score += (len(steps) - len(missing)) / len(steps) * 10
        defects.append(f"MAJOR: Steps {missing} lack verification")

    # Safety checks
    rollback = extract_rollback_plan(plan)
    if has_exact_commands(rollback) and has_triggers(rollback):
        score += 15
    elif has_rollback_section(plan):
        score += 8
        defects.append("MAJOR: Rollback plan incomplete (missing commands or triggers)")
    else:
        defects.append("CRITICAL: No rollback plan")

    # Alignment checks
    apis_used = extract_apis_from_plan(plan)
    research_apis = extract_apis_from_research(research_pack)
    if all(api_matches_research(a, research_apis) for a in apis_used):
        score += 10
    else:
        mismatches = find_api_mismatches(apis_used, research_apis)
        defects.append(f"CRITICAL: APIs don't match ResearchPack: {mismatches}")

    # ... (continue for all criteria)

    return {
        "score": score,
        "grade": "PASS" if score >= 85 else "FAIL",
        "defects": defects,
        "recommendations": generate_recommendations(defects)
    }
```

**Output Format**:

```markdown
## 📊 Implementation Plan Validation Report

**Overall Score**: [X]/100
**Grade**: [PASS ✅ / FAIL ❌]

### Breakdown
- Completeness: [X]/35
- Safety: [X]/30
- Clarity: [X]/20
- Alignment: [X]/15

### Defects Found ([N])

#### CRITICAL (blocks implementation)
1. [Specific defect]

#### MAJOR (should fix)
1. [Defect]

#### MINOR (nice to have)
1. [Defect]

### API Alignment Check
✅ All APIs match ResearchPack
OR
❌ Mismatches found:
- Plan uses `foo(x, y)` but ResearchPack shows `foo(x: string, y?: number)`

### Recommendations

**To reach passing score**:
1. [Action]

**If score >= 85**: ✅ **APPROVED** - Proceed to code-implementer

**If score < 85**: ❌ **BLOCKED** - Fix defects and re-validate
```

## Quality Gate Protocol

**Gates are MANDATORY checkpoints** - cannot proceed to next phase without passing validation.

### Gate 1: Research → Planning

```
Trigger: @docs-researcher completes ResearchPack
Action: Validate ResearchPack
Decision:
  - Score >= 80: ✅ Allow @implementation-planner to proceed
  - Score < 80: ❌ Block, return to @docs-researcher with defect list
```

### Gate 2: Planning → Implementation

```
Trigger: @implementation-planner completes Implementation Plan
Action: Validate Implementation Plan + check alignment with ResearchPack
Decision:
  - Score >= 85 AND APIs match: ✅ Allow @code-implementer to proceed
  - Score < 85 OR APIs mismatch: ❌ Block, return to @implementation-planner with defect list
```

### Gate 3: Implementation → Completion

```
Trigger: @code-implementer reports completion
Action: Validate tests passed, build succeeded, no regressions
Decision:
  - All checks pass: ✅ Mark complete
  - Any check fails: ❌ Trigger self-correction loop (up to 3 attempts)
```

## Manual Gate (Codex)

Codex CLI does not support hooks. Run this skill manually at each gate:
1. Run `$quality-validation` after ResearchPack completion.
2. Run `$quality-validation` after Implementation Plan completion.
3. Run `$quality-validation` after implementation to confirm tests/build/regressions.

## Common Validation Failures

### ResearchPack Failures

**Hallucinated APIs**:
```
❌ CRITICAL: API `redis.client.fetch()` not found in official docs
   ResearchPack cites: redis.io/docs/clients/nodejs
   Actual API: `client.get()` (verified at redis.io/docs/clients/nodejs#get)
   FIX: Replace all instances of `fetch` with correct `get` API
```

**Version mismatch**:
```
❌ MAJOR: ResearchPack uses v3.x docs but project has v4.6.0
   Example: v3 uses callbacks, v4 uses promises
   FIX: Re-fetch docs for v4.6.0 specifically
```

**Missing citations**:
```
❌ MAJOR: 5 APIs listed without source URLs
   APIs: set(), del(), ttl(), exists(), keys()
   FIX: Add source URL for each (format: docs.com/path#section)
```

### Implementation Plan Failures

**No rollback plan**:
```
❌ CRITICAL: Rollback plan missing
   FIX: Add section "## 🔄 Rollback Plan" with:
   - Exact git commands to revert
   - Configuration restoration steps
   - Verification after rollback
   - Triggers for when to rollback
```

**Ambiguous steps**:
```
❌ MAJOR: Step 3 says "Update the service" (too vague)
   FIX: Specify:
   - Which service? (path/to/ServiceName.ts)
   - What update? (Add method X, modify method Y)
   - How to verify? (run `npm test path/to/test.ts`)
```

**API misalignment**:
```
❌ CRITICAL: Plan uses `client.fetch(key)` but ResearchPack shows `client.get(key)`
   FIX: Update plan to use correct API signature from ResearchPack
```

## Performance Targets

- **Validation time**: < 15 seconds per validation
- **Defect detection rate**: 95%+ of major issues caught
- **False positive rate**: < 5% (don't block good work)

---

**This skill enforces objective quality gates for the Research → Plan → Implement workflow.**
