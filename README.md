# luckyColor-admin

LuckyColor 后台管理前端项目，基于 `Vue 3`、`Vite`、`TypeScript`、`Pinia`、`Vue Router`、`Naive UI` 构建。

## 环境说明

项目现在只保留两套环境：

- `dev`：本地开发环境，通过 Vite 代理将 `/api` 请求转发到真实后端
- `prod`：生产构建环境，不再包含本地 Mock 或混合模式

## 目录结构

```text
luckyColor-admin/
├─ public/                  静态资源
├─ src/
│  ├─ api/                  接口封装
│  ├─ components/           通用组件
│  ├─ config/               系统配置
│  ├─ layouts/              后台布局
│  ├─ router/               路由配置
│  ├─ store/                Pinia 状态管理
│  ├─ utils/                工具函数
│  └─ views/                页面模块
├─ .env                     通用环境变量
├─ .env.dev                 开发环境变量
├─ .env.prod                生产环境变量
├─ package.json
└─ vite.config.ts
```

## 环境要求

- `Node.js >= 18`
- `pnpm >= 8`

## 启动项目

安装依赖：

```bash
pnpm install
```

启动开发环境：

```bash
pnpm dev
```

默认访问地址：

```text
http://127.0.0.1:9900
```

## 构建

开发构建：

```bash
pnpm build:dev
```

生产构建：

```bash
pnpm build
```

本地预览生产构建：

```bash
pnpm preview
```

## 后端项目

配套后端默认位于：

```text
../luckyColor-admin-serve
```

后端启动示例：

```bash
pnpm --dir ../luckyColor-admin-serve install
pnpm --dir ../luckyColor-admin-serve prisma:generate
pnpm --dir ../luckyColor-admin-serve prisma:db:push
pnpm --dir ../luckyColor-admin-serve prisma:seed
pnpm --dir ../luckyColor-admin-serve dev
```

默认后端地址：

```text
http://127.0.0.1:3001
```

## 默认账号

- 用户名：`admin`
- 密码：`123456`
