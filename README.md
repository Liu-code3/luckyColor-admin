# luckyColor-admin

LuckyColor 的后台管理前端项目，负责登录鉴权、动态菜单、权限路由、系统管理页面以及常用业务组件示例展示。

项目基于 `Vue 3`、`Vite`、`TypeScript`、`Pinia`、`Naive UI` 构建，开发环境通过 Vite 代理将 `/api` 请求转发到同级目录的后端服务 `luckyColor-admin-serve`。

![luckyColor-admin 预览图](./src/assets/images/luckColor.png)

## 项目概览

- 当前仓库为管理后台前端项目，目录位于 `D:\zl\luckyColor-admin`
- 配套后端项目位于 `D:\zl\luckyColor-admin-serve`
- `mock/` 目录中的数据仅作为历史迁移参考保留，当前联调以真实后端接口为主
- 开发环境默认端口为 `9900`，后端代理目标默认为 `http://127.0.0.1:3001`

## 功能模块

- 登录页与滑块验证
- 基于接口返回结果的动态菜单与权限路由
- 多标签页、模块切换、主题切换、锁屏等后台基础交互
- 系统管理：用户管理、部门管理、菜单管理、角色管理
- 组件示例：富文本编辑器、数据字典、可编辑表格

## 技术栈

- `Vue 3`
- `TypeScript`
- `Vite`
- `Pinia`
- `Vue Router`
- `Naive UI`
- `UnoCSS`
- `Axios`
- `vxe-table`
- `wangEditor`

## 目录结构

```text
luckyColor-admin/
├─ public/                 静态资源
├─ mock/                   历史 mock 数据与迁移参考
├─ src/
│  ├─ api/                 接口封装
│  ├─ components/          通用组件
│  ├─ config/              系统配置
│  ├─ layouts/             后台布局
│  ├─ router/              路由与动态菜单处理
│  ├─ store/               Pinia 状态管理
│  ├─ utils/               工具函数与请求封装
│  └─ views/               页面模块
├─ .env.development        开发环境变量
├─ .env.production         生产环境变量
├─ package.json
└─ README.md
```

## 环境要求

- `Node.js >= 18`
- `pnpm >= 8`

## 快速开始

### 1. 安装前端依赖

```bash
pnpm install
```

### 2. 启动前端项目

```bash
pnpm dev
```

启动后默认访问地址：

```text
http://127.0.0.1:9900
```

### 3. 构建与预览

```bash
pnpm build
pnpm preview
```

## 配套后端启动

后端项目默认放在当前仓库同级目录：`../luckyColor-admin-serve`

### 1. 安装后端依赖

```bash
pnpm --dir ../luckyColor-admin-serve install
```

### 2. 准备环境变量

```bash
cp ../luckyColor-admin-serve/.env.example ../luckyColor-admin-serve/.env
```

Windows PowerShell:

```powershell
Copy-Item ..\luckyColor-admin-serve\.env.example ..\luckyColor-admin-serve\.env
```

### 3. 初始化数据库

```bash
pnpm --dir ../luckyColor-admin-serve prisma:generate
pnpm --dir ../luckyColor-admin-serve prisma:db:push
pnpm --dir ../luckyColor-admin-serve prisma:seed
```

### 4. 启动后端服务

```bash
pnpm --dir ../luckyColor-admin-serve dev
```

默认端口：

```text
http://127.0.0.1:3001
```

## 联调说明

- 开发环境下，前端会将 `/api` 请求代理到 `VITE_API_PROXY_TARGET`
- 当前默认代理地址为 `http://127.0.0.1:3001`
- 已对接并兼容当前页面结构的接口包括：
  - `POST /api/auth/login`
  - `POST /api/auth/menu-list`
  - `GET /api/dict/tree`
  - `GET /api/dict/page`
- 当前页面运行不再依赖 `vite-plugin-mock` 提供接口数据

## 默认账号

- 用户名：`admin`
- 密码：`123456`

## Git 提交约定

为便于后续学习和回顾，本项目从现在开始遵循以下提交规则：

- 每次新增功能、修改功能、修复问题或更新文档后，都必须完成一次对应的 git 提交，不把多个目标混在同一个提交中
- 提交规范遵循 gitflow，按改动类型选择合适前缀，保持提交历史清晰
- 提交信息使用 `type: 中文说明` 的格式，要求简洁明了

推荐类型：

- `feat`: 新增功能
- `fix`: 修复问题
- `refactor`: 重构实现
- `docs`: 文档更新
- `style`: 样式调整
- `test`: 测试补充
- `chore`: 构建、配置、脚本、依赖调整

提交信息示例：

```text
feat: 新增用户管理筛选
fix: 修复菜单路由刷新丢失
feat: 优化登录页交互
docs: 完善项目说明文档
```
