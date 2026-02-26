---
name: ai-commenting
description: AI-native code annotation protocol that encodes intent, risk, dependencies, constraints, and test expectations in machine-parseable comments.
argument-hint: <goal or target files>
owner: "@maintainers"
maturity: core
last-reviewed: "2026-02-26"
---

# AI Commenting Skill

Create and maintain AI-native annotations so models can understand project intent quickly and safely, not just code syntax.

## Why This Skill Exists

Traditional comments are optimized for human reading, but coding agents need dense, structured context to avoid unsafe edits and repeated discovery work.

This skill defines a compact annotation protocol that turns files into a machine-readable context layer for:
- Faster onboarding into unfamiliar modules
- Risk-aware edit strategy
- Better test planning
- Lower regression rate in high-coupling code

## Annotation Format

Canonical format (single line):

```text
/*@ai:key=value|key=value|key=value*/
```

Rules:
- Use ASCII keys and values
- Separate fields with `|`
- No spaces around `=`
- Keep one annotation to one scope (file or block)

## Field Schema

Core fields (recommended at file level):
- `risk=1-5`: change risk (5 is highest)
- `core=<domain>`: core responsibility (`UserCRUD`, `BillingLedger`)
- `deps=<A,B,C>`: critical dependencies
- `intent=<why>`: non-obvious business intent
- `test=<unit|integration|e2e|contract>`: minimum test gate

Extended fields (use when needed):
- `chain=<A->B->C>`: business or data flow chain
- `async=<low|medium|complex>`: async/concurrency complexity
- `api=<internal|external>`: API boundary type
- `auth=<none|required|strict>`: authorization level
- `invariant=<must_hold>`: critical invariant
- `sidefx=<db,cache,queue,event>`: side effects
- `perf=<budget>`: performance constraint (`p95<200ms`)
- `security=<pii|payment|secret|none>`: security sensitivity
- `rollback=<strategy>`: safe fallback strategy

## Risk Rubric

- `risk=1`: isolated logic, low coupling, fast rollback
- `risk=2`: local impact, clear tests, low side effects
- `risk=3`: moderate coupling or external contract dependency
- `risk=4`: cross-module critical path, data/auth impact
- `risk=5`: security/payment/core-state changes, high blast radius

Escalate risk by +1 when any condition applies:
- touches auth/session/payment/PII/secrets
- changes distributed state consistency
- modifies external API contract
- lacks reproducible integration tests

## Placement Strategy

1. File header annotation (critical modules)
- Place near imports/module declaration
- Include at least: `risk`, `core`, `deps`, `intent`, `test`

2. Critical block annotation (selective)
- Place above risky functions/flows
- Include only needed fields (`invariant`, `auth`, `sidefx`, `perf`)

Do not annotate every function. Keep density high-signal.

## Example

```typescript
/*@ai:risk=5|core=UserCRUD|intent=protect_user_consistency|deps=UserModel,AuthService,AuditService*/
/*@ai:chain=Auth->User->Permission->Audit|auth=strict|sidefx=db,event|test=integration|rollback=feature_flag*/
class UserManager {
  /*@ai:risk=4|invariant=user_id_unique|security=pii|perf=p95<200ms*/
  async deleteUser(userId: string) {
    // ...
  }
}
```

## Workflow

1. Discover scope and high-risk boundaries
2. Add file-level core fields
3. Add block-level fields only for risky paths
4. Validate parseable `/*@ai:...*/` syntax
5. Ensure `risk>=4` has explicit `test` and `rollback`

## Quality Gates

- All `risk>=4` files have file-level `@ai` annotations
- `security!=none` implies `auth!=none`
- No contradictory tags in one scope
- Prefer 1 annotation per 60-120 LOC

## Parsing Helpers

```javascript
const aiTagPattern = /\/\*@ai:([^*]+)\*\//g;
const fieldPattern = /(\w+)=([^|*]+)/g;
```

Normalize extracted tags into key-value JSON for risk maps and retrieval.

## Output

- Produce a concrete markdown deliverable with:
  - Result summary
  - Files changed
  - Validation evidence
  - Risks / next actions
