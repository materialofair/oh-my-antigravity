---
name: test-gen
description: Use this skill after code changes to generate or update targeted tests, acceptance coverage, and regression checks with stack-aware verification.
version: 0.3.0
source: fork
checksum: b1ebfd132bb3dad91e0dcd418ff413c01aedf317a598fbb13d32b1c7038747bc
updated_at: 2026-03-12T18:57:03+08:00
intent: testing
layer: quality
---


# Test Gen Skill

> Codex invocation: use `$test-gen ...` or `test-gen: ...`

Generate smart post-implementation tests for changed code with explicit regression coverage.

## Capabilities

- Detect changed files and test stack automatically.
- Classify risk signals and derive acceptance/regression checklists.
- Generate or update closest-fit tests (unit/integration/e2e).
- Prefer existing test conventions over creating new patterns.
- Report residual testing gaps honestly.

## Input Requirements

- `target` (required): changed file, module, or feature area.
- `intent` (optional): bugfix | feature | refactor.
- `scope` (optional): specific paths to include/exclude.
- `risk_level` (optional): low | medium | high.
- `verify_mode` (optional): targeted | full.

## How to Use

```text
$test-gen src/router/skill-router.js
$test-gen Cover changed auth files with regression tests
$test-gen Generate tests for checkout flow refactor
```

## Routing Boundary

- Use `$test-gen` after implementation changes already exist.
- Use `$tdd-workflow` when you need strict test-first flow before coding.
- Use `$verification-loop` when verification is failing and you need repeated fix cycles.

## Workflow

State file: `.omc/state/test-gen-state.json`

### Phase 1: Detect Context

```bash
omcodex test detect-stack
omcodex test changed
omcodex test analyze <target>
```

Collect:

- target kind and complexity
- risk signals
- nearby existing tests
- stack and runner commands

### Phase 2: Generate Testing Pack

```bash
omcodex test gen <target>
```

Expected artifacts:

- test plan
- acceptance checklist
- regression checklist
- testing playbook

### Phase 3: Write or Update Tests

Decision policy:

- pure logic -> unit tests
- UI behavior -> component/integration tests
- async + IO -> integration tests
- high-risk path -> regression-focused assertions

Prefer editing nearby existing tests when possible.

### Phase 4: Verify

Run smallest useful command first, then widen only when needed.

Examples:

```bash
npm test -- <target-test-file>
npm run test:coverage
npm run test
```

For non-node stacks, use repository-native equivalents.

## Verification Escalation Rules

1. targeted test command fails -> run module-level suite
2. module-level suite fails -> run full test suite
3. full suite fails -> handoff to `$verification-loop`

## Output Contract

```text
[TEST-GEN]
- target files analyzed
- risk summary

[GENERATED]
- tests added/updated
- acceptance items covered
- regression items covered

[VERIFY]
- commands executed
- pass/fail results

[GAPS]
- unautomated scenarios
- manual regression checklist (if needed)

[STATUS]
- phase: <detect|generate|write|verify>
- result: <complete|blocked|in_progress>
- promise: <PROMISE tag>
```

## Completion and Blocking Tags

- `[PROMISE:TEST_GEN_COMPLETE]`
- `[PROMISE:TEST_GEN_BLOCKED]`

Block when:

- no runnable test environment is available
- required fixtures/mocks are unavailable
- changed behavior cannot be validated automatically

## Rules

- Do not stop at happy path.
- Always add regression assertions for high-risk changes.
- Avoid implementation-detail-only tests.
- If automation is unsafe, provide an explicit manual checklist.
