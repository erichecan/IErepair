# IRA Development Team Protocol v2.0
# IRA 开发团队协议 v2.0

---

## 1. Team Architecture / 团队架构

| Role / 角色 | Name / 名称 | Responsibility / 职责 | Scope / 工作范围 |
|---|---|---|---|
| **Lead** | Lead Architect | Architecture design, task dispatch, code merge, conflict resolution / 架构设计、任务分发、代码合并、冲突处理 | Full project / 全项目 |
| **Coder-Alpha** | Backend Engineer | Backend logic, API implementation, database / 后端逻辑、API实现、数据库 | `/server`, `/prisma`, database migrations |
| **Coder-Beta** | Frontend Engineer | Frontend components, pages, state management / 前端组件、页面、状态管理 | `/client/src`, `/public` |
| **QA-Bot** | Test & Security | Write tests, run test suites, security audit / 编写测试、运行测试、安全审计 | Read-Only + Terminal (test runner) |

---

## 2. Workflow / 协作流程

### 2.1 Task Lifecycle / 任务生命周期

```
Ready → In-Progress → Review → Testing → Done
就绪  →    进行中    → 审查  →  测试中  → 完成

                 ↘ Blocked (需要协助)
```

### 2.2 Step-by-Step Process / 逐步流程

1. **Requirement Init / 需求初始化**
   - [Lead] receives user instruction, breaks it into tasks
   - [Lead] writes tasks to `.claude/tasks.json`
   - Each task has: `id`, `title`, `assignee`, `status`, `priority`, `branch`, `files`, `notes`

2. **Task Claim / 任务认领**
   - [Coder-Alpha/Beta] scans `tasks.json` for tasks with status `"Ready"`
   - Claims task by changing status to `"In-Progress"`
   - Creates feature branch: `feature/agent-[name]-[task-id]`

3. **Development Isolation / 开发隔离**
   - Each agent works ONLY on their designated branch
   - **RULE**: No agent may modify files outside their scope
   - Backend (Alpha): `/server/**`, `/prisma/**`
   - Frontend (Beta): `/client/src/**`, `/public/**`

4. **Progress Reporting / 进度汇报**
   - Format: `[Status: Done/Blocked] | [Files Changed: ...] | [Next Step: ...]`
   - On blocker: tag `@Lead` with description

5. **Review & Merge / 审查与合并**
   - [Lead] calls [QA-Bot] to run full test suite
   - All tests pass → [Lead] merges to `main`
   - Tests fail → task returns to `In-Progress` with bug notes

---

## 3. Communication Rules / 沟通规范

### Report Format / 汇报格式
```
[Agent: Coder-Alpha]
[Status: Done]
[Files Changed: server/src/routes/client/booking.routes.js, server/src/services/booking.service.js]
[Next Step: Waiting for QA-Bot test run]
```

### Conflict Resolution / 冲突处理
- **FORBIDDEN**: Sub-agents modifying each other's directory files / 禁止子Agent修改对方目录
- If an interface change is needed (e.g., API contract change), MUST go through [Lead]
- 如需接口变动（如API契约变更），必须通过 [Lead] 协调

---

## 4. Auto-Triggers / 自动化触发

| Trigger / 触发条件 | Action / 动作 |
|---|---|
| QA-Bot reports test failure / QA报错 | [Lead] suspends all dev tasks until bug is fixed / 挂起所有开发直到修复 |
| Token consumption > 20% threshold / Token消耗超20%预警 | [Lead] summarizes progress and requests user permission to continue / 整理进度请求用户许可 |
| Merge conflict detected / 检测到合并冲突 | [Lead] resolves conflict, no sub-agent may force push / Lead解决冲突，禁止子Agent强推 |

---

## 5. Branch Strategy / 分支策略

```
main (protected / 受保护)
├── feature/agent-alpha-TASK-001    (Backend tasks / 后端任务)
├── feature/agent-alpha-TASK-002
├── feature/agent-beta-TASK-003     (Frontend tasks / 前端任务)
├── feature/agent-beta-TASK-004
└── fix/agent-[name]-BUG-XXX       (Bug fixes / 缺陷修复)
```

---

## 6. Task Priority Levels / 任务优先级

| Priority / 优先级 | Label / 标签 | Description / 说明 |
|---|---|---|
| P0 | Critical / 紧急 | Blocks other tasks, must fix immediately / 阻塞其他任务，立即修复 |
| P1 | High / 高 | Core feature, current sprint / 核心功能，当前迭代 |
| P2 | Medium / 中 | Important but not blocking / 重要但不阻塞 |
| P3 | Low / 低 | Nice-to-have, backlog / 锦上添花，后续再做 |

---

## 7. Definition of Done / 完成标准

A task is considered "Done" when:
任务满足以下条件视为"完成"：

- [ ] Code is written and follows project conventions / 代码已编写且符合项目规范
- [ ] No lint errors / 无 lint 错误
- [ ] API endpoints have corresponding route + service + validation / API 端点有对应的路由+服务+校验
- [ ] Frontend pages are responsive (mobile-first) / 前端页面响应式（移动端优先）
- [ ] Tests pass (when QA-Bot runs) / 测试通过
- [ ] Branch merged to main by [Lead] / 分支已由 Lead 合并到 main
