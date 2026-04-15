# luckyColor-admin Agent Guide

## 1. 项目定位

- 项目路径：`D:\zl\luckyColor-admin`
- 技术栈：`Vue 3`、`Vite`、`TypeScript`、`Pinia`、`Vue Router`、`Naive UI`、`Playwright`
- 开发环境默认地址：`http://127.0.0.1:9900`
- 默认 API 基础前缀：`/api`
- 默认租户头：`x-tenant-id`
- 业务成功判断：`code === 200`

本项目是 LuckyColor 后台管理前端，不是一次性 demo。AI 在这里协作时，必须优先保证：

- 目录职责稳定。
- 动态路由、权限、租户、菜单契约不被破坏。
- 页面实现尽量沿用现有后台模式。
- 与后端联调方式清晰可追踪。

## 2. 开始工作前先读什么

开始任何非微小改动前，先阅读：

- `README.md`
- `docs/development-principles.md`
- `docs/api-response-spec.md`
- `docs/route-navigation-plan.md`
- `playwright.config.ts`
- 与目标模块对应的 `src/api/`、`src/store/`、`src/router/`、`src/views/`、`src/utils/`

默认流程：

1. 先确认需求落在哪一层。
2. 先找已有页面或模块作为模板。
3. 先确认接口契约、权限标识、菜单路由来源。
4. 再做最小闭环改动。

## 3. 必须遵守的前端规则

### 3.1 架构边界

遵守现有开发原则，特别是：

- `api/` 只负责接口定义、入参和返回类型。
- `store/` 只负责共享状态和派生状态。
- `router/` 只负责路由注册、守卫、白名单、动态注入。
- `views/` 只负责页面编排和页面级交互。
- `components/` 只负责复用 UI 单元。
- `utils/` 只放通用逻辑，不直接耦合页面细节。
- `constants/` 与 `types/` 优先承接重复结构和固定枚举。

### 3.2 契约与状态规则

- 统一遵守当前业务成功判断：`code === 200`。
- 默认 API 基础前缀是 `/api`，不要在页面里写死完整后端地址。
- 统一通过配置与请求封装透传租户头，不在页面层到处手写 `x-tenant-id`。
- 401、`1011007`、`1011008` 继续视为登录失效。
- 改动接口结构时，先同步更新类型定义和接口封装，再改页面消费逻辑。

### 3.3 路由与权限规则

- 动态路由、菜单显隐、外链、iframe、keepAlive、404 兜底属于高敏感区域，优先复用现有实现。
- 按钮权限、角色权限、数据权限优先复用已有常量、指令、组合式函数与工具函数。
- 如果改动菜单模型、路由结构、权限字段，必须同步检查前端路由生成与后端契约是否仍一致。

### 3.4 页面开发规则

后台页面优先沿用现有模式：

- 查询区
- 表格区
- 分页
- 新增/编辑弹窗或抽屉
- 状态切换
- 权限控制

不要在单个页面里堆积：

- 大量接口字段转换
- 重复权限判断
- 重复缓存 key
- 与业务无关的通用逻辑

### 3.5 变更边界规则

- 不要修改 `dist/` 下产物。
- 不要顺手大面积改 UI 风格或重排目录，除非任务明确要求。
- 不要在多个页面复制相同常量、校验、列定义和权限码。
- 不要为了联调方便直接绕开请求封装、权限控制或路由守卫。

## 4. 推荐实现方式

### 4.1 新增后台页面时

优先遵循这个顺序：

1. 先在 `src/api/` 定义接口与类型。
2. 如有复用价值，先补 `types/`、`constants/`、`composables/` 或 `utils/`。
3. 再实现 `views/` 页面编排。
4. 最后接入权限指令、消息提示、路由入口和菜单联动。

### 4.2 改动现有联调逻辑时

以下内容必须成组检查：

- `vite.config.ts` 中 `/api` 代理目标
- `.env.dev` 中 `VITE_API_PROXY_TARGET`
- `.env.dev` 中 `VITE_API_DOC_URL`
- `playwright.config.ts` 中 webServer 指向的后端
- 共享工作流文档 `D:\zl\luckycolor-admin-springboot\LUCKYCOLOR_前后端联调与契约检查工作流.md`

### 4.3 涉及高风险区域时

以下区域默认按高敏感改动处理：

- `src/router/**`
- `src/store/modules/menu.ts`
- `src/utils/menu-*`
- `src/utils/http/**`
- `src/utils/auth*`
- `src/constants/permission.ts`
- `src/directives/permission.ts`
- `src/composables/use-permission.ts`

## 5. 验证要求

至少执行与改动直接相关的验证。

优先命令：

```bash
pnpm build
pnpm test:smoke
pnpm dev
```

验证原则：

- 改类型、路由、构建配置，至少执行 `pnpm build`。
- 改登录、菜单、动态路由、iframe、404、权限路径，优先执行 `pnpm test:smoke`。
- 若 smoke 使用的后端目标不是当前联调后端，先修正环境变量或测试配置，再执行验证。

注意：当前 `playwright.config.ts` 仍默认启动 `../luckyColor-admin-serve`。如果当前联调目标改为 Spring Boot，必须同步检查测试配置和 `.env.dev`，不要让验证结果指向错误后端。

## 6. 文档同步规则

以下变更完成后，检查本地文档是否需要同步：

- 接口响应结构变化
- 菜单/路由规划变化
- 权限模型使用方式变化
- 联调后端、代理目标、API 文档地址变化
- Smoke 测试启动方式变化

优先关注：

- `docs/development-principles.md`
- `docs/api-response-spec.md`
- `docs/route-navigation-plan.md`
- `D:\zl\luckycolor-admin-springboot\LUCKYCOLOR_前后端联调与契约检查工作流.md`

## 7. 面向 AI 的执行原则

- 先读现有实现，再开始编码。
- 先统一类型和常量，再拼页面。
- 先保证契约稳定，再做局部重构。
- 先完成最小闭环，再考虑扩展功能。
- 如果发现前端代码、后端接口、测试脚本、文档之间不一致，优先指出并修正，不要默认绕过。
