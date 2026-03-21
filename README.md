# luckyColor-admin

当前仓库已经拆成两部分：

- 前端：根目录，`Vue 3 + Vite + Pinia + Naive UI`
- 后端：`D:\zl\luckyColor-admin-serve\server`，`NestJS + Prisma + MySQL`

## 目录结构

```text
luckyColor-admin/
├─ src/                  # 前端源码
└─ mock/                 # 旧 mock 数据，当前仅作为迁移数据来源保留
```

## 前端启动

```bash
pnpm install
pnpm dev
```

前端开发环境会把 `/api` 代理到 `http://127.0.0.1:3001`。

## 后端启动

1. 安装依赖

```bash
pnpm --dir ../luckyColor-admin-serve/server install
```

2. 准备环境变量

```bash
cp ../luckyColor-admin-serve/server/.env.example ../luckyColor-admin-serve/server/.env
```

Windows PowerShell:

```powershell
Copy-Item ..\luckyColor-admin-serve\server\.env.example ..\luckyColor-admin-serve\server\.env
```

3. 启动 MySQL

```bash
cd ../luckyColor-admin-serve/server
docker compose up -d
```

4. 初始化 Prisma 与种子数据

```bash
pnpm --dir ../luckyColor-admin-serve/server prisma:generate
pnpm --dir ../luckyColor-admin-serve/server prisma:db:push
pnpm --dir ../luckyColor-admin-serve/server prisma:seed
```

5. 启动后端

```bash
pnpm --dir ../luckyColor-admin-serve/server dev
```

默认端口：`3001`

## 已迁移接口

- `POST /api/auth/login`
- `POST /api/auth/menu-list`
- `GET /api/dict/tree`
- `GET /api/dict/page`

这些接口已经兼容当前前端页面使用的数据结构，前端不再依赖 `vite-plugin-mock`。

## 默认账号

- 用户名：`admin`
- 密码：`123456`

## 数据说明

- 字典数据来自原 `mock/dict/dictTreeData.ts`
- 菜单数据来自原 mock 菜单结构，已写入 Prisma seed
- 当前后端以“先兼容现有管理台页面”为目标，后续可以继续扩展租户、角色、权限、JWT、审计日志等 SaaS 能力
