# Mock 与真实接口切换说明

## 目标

为了同时满足本地离线演示、局部页面联调和完整后端联调三种场景，前端接口层统一保留 `/api` 前缀，通过环境变量控制请求最终落到本地 Mock 还是后端服务。

## 当前请求链路

1. 前端业务页面统一调用 `src/api/*`
2. `src/api/*` 统一走 `src/utils/http/index.ts`
3. Axios 默认基于 `VITE_API_BASEURL`
4. 开发环境通过 Vite `server.proxy` 将 `/api` 转发到 `VITE_API_PROXY_TARGET`
5. 本地 `mock/` 目录保留一批历史 Mock 数据，可作为开发模式的本地接口源

## 推荐模式

### 1. 真实接口模式

- `VITE_API_MOCK_ENABLED=false`
- `VITE_API_PROXY_ENABLED=true`
- 适用于完整联调、联查权限和租户真实数据

### 2. Mock 模式

- `VITE_API_MOCK_ENABLED=true`
- `VITE_API_PROXY_ENABLED=false`
- 适用于离线演示、只验证前端交互

### 3. 混合模式

- `VITE_API_MOCK_ENABLED=true`
- `VITE_API_PROXY_ENABLED=true`
- 已覆盖的接口优先命中本地 Mock，未覆盖的接口继续代理到真实后端
- 适用于登录、菜单、字典等基础数据走本地 Mock，系统管理等复杂页面继续联调真实接口

## Mock 覆盖范围

当前计划优先覆盖以下高频入口：

- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/captcha/challenge`
- `POST /api/auth/captcha/verify`
- `GET /api/menus/tree`
- `GET /api/dict/tree`
- `GET /api/dict/page`

## 设计原则

- 不改业务页面中的接口调用路径，统一通过配置切换
- 优先保证默认开发模式仍可直接联调真实后端
- Mock 仅覆盖高频基础接口，避免为低频 CRUD 维护重复数据源
- 文档、环境变量、脚本名称保持一致，避免“代码可切换但团队不会切换”
