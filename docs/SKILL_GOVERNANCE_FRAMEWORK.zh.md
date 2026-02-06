# Skill 治理框架（跨项目版）

本框架用于 `oh-my-codex`、`oh-my-antigravity` 这类维护 Skill 体系的仓库，目标是“可执行、可演进、可度量”。

## 1. 治理目标

1. 保证 Skill 在当前运行时可执行（不含过期语法和不可用能力）。
2. 保证规模增长后质量稳定（结构一致、边界清晰、可验证）。
3. 控制维护成本（明确 owner、债务可见、持续清理）。
4. 维持用户信任（默认安全、行为可预测、变更可迁移）。

## 2. 治理对象与分类

治理对象：
- Skill 定义（`SKILL.md` + 配套资产）
- 安装/分发脚本
- 治理脚本、allowlist、治理文档

Skill 分类：
- `core`：高频基础能力（plan/review/verify/tdd）
- `domain`：项目或平台专属能力
- `experimental`：试验态能力
- `deprecated`：迁移窗口保留能力

## 3. Skill 最小契约

每个 Skill 必须满足：
1. 元数据契约：`name`、`description`、触发条件。
2. 运行时契约：示例可在目标 CLI/运行时直接执行。
3. 边界契约：明确“何时使用/何时不使用”。
4. 依赖契约：外部工具、路径、前置条件可见。
5. 输出契约：输出格式、完成标准明确。

## 4. 生命周期与门禁

生命周期：
1. Proposal：问题定义 + 重复能力检查。
2. Draft：按契约编写 Skill。
3. Validation：治理检查 + 示例演练。
4. Release：可安装、可文档化。
5. Observe：收集使用与失败信号。
6. Evolve/Retire：合并、拆分、废弃、归档。

必过门禁（PR 前）：
1. `npm run governance:skills` 通过。
2. 不允许新增未审批债务。
3. 重命名/下线必须给出迁移说明。
4. 每个 Skill 至少一个可运行调用示例。

推荐门禁：
1. 重复意图检测（多 Skill 覆盖同一意图）。
2. 文档链接/路径有效性检查。
3. 安装冒烟验证（本地与全局安装）。

## 5. 债务治理策略

债务类型：
- 语法债：旧命令/旧 API 语法
- 语义债：边界不清、职责重叠
- 工具债：引用不可用插件/命令

治理规则：
1. 新债务默认禁止。
2. 存量债务进入 allowlist，必须有 owner 与清理目标时间。
3. 清理代码与移除 allowlist 条目同一次提交完成。
4. 运行时无效指令属于 P0，优先清除。

## 6. 拓扑与去重

采用四层拓扑：
1. Foundation：通用基础层
2. Domain：业务/平台层
3. Orchestration：编排层
4. Governance：治理层

去重规则：
1. 一个意图只保留一个 canonical skill。
2. 变体写入 canonical skill 的 playbook，不新增顶层重复 skill。
3. 别名仅用于迁移窗口，必须有 sunset 日期。

## 7. 角色与责任（RACI）

- Maintainer（A）：合并/下线最终责任
- Skill Owner（R）：内容维护与兼容性
- Reviewer（R/C）：质量与风险评审
- Consumer（C）：可用性反馈

每个 Skill 建议声明：
- Owner
- Last reviewed
- Maturity（`core/domain/experimental/deprecated`）

## 8. 指标与 SLO

月度指标：
1. 治理通过率（`governance:skills`）
2. 债务净变化（allowlist burndown）
3. 重复率（同意图多 skill）
4. 失效 skill 修复时长
5. 废弃迁移完成率

建议 SLO：
- P0 治理故障 24 小时内修复
- 连续两个周期无净新增未解决债务
- 重复意图技能数持续下降

## 9. 发布与变更管理

每次 Skill 相关发布必须包含：
1. Changelog：新增/变更/废弃/移除
2. 迁移说明：旧调用 -> 新调用映射
3. 安装验证：本地与全局
4. 回滚路径：可回退到上一个稳定 tag

## 10. Codex 与 Antigravity 的联邦治理

建议模型：
1. 共享基线：统一使用本框架文档
2. 项目叠加：各自维护 `docs/SKILL_GOVERNANCE.md`
3. 共享分类法：统一 maturity 和生命周期状态
4. 共享迁移语言：统一废弃与替代模板

## 11. 落地蓝图（每个仓库都做）

1. 文档：
   - `docs/SKILL_GOVERNANCE_FRAMEWORK.md`
   - `docs/SKILL_GOVERNANCE.md`
2. 机制：
   - `scripts/check-skill-governance.sh`
   - `.governance/skill-lint.allowlist`
   - `package.json` 中 `governance:skills`
3. CI：
   - 触达 skill 变更的 PR 必跑治理检查
4. 元数据：
   - owner + maturity + last-reviewed 策略

## 12. 30/60/90 推进计划

0-30 天：
1. 建立基线检查与债务清单
2. 冻结净新增债务
3. 给全部 skill 标注 owner 与 maturity

31-60 天：
1. 合并重复意图 skill
2. 别名降级为迁移 shim
3. 形成月度治理报告

61-90 天：
1. 移除过期 deprecated skills
2. 对齐跨仓库分类与模板
3. 执行 SLO 驱动评审节奏

## 13. 治理完成定义（DoD）

满足以下条件即视为进入“受治理状态”：
1. 治理检查强制且稳定通过
2. 债务显式、有人负责、持续下降
3. 每个活跃 skill 都有 owner 与 maturity
4. 重复意图已完成收敛
5. 发布说明包含迁移指引

## 14. 导入 oh-my-antigravity 快速清单

1. 复制本文件到 `docs/SKILL_GOVERNANCE_FRAMEWORK.md`。
2. 编写 `docs/SKILL_GOVERNANCE.md`（填入 antigravity 运行时 blocker）。
3. 迁移治理脚本 + allowlist + npm 命令。
4. 跑基线扫描并建立债务台账。
5. 按“P0 blocker -> 重复收敛”顺序执行。

