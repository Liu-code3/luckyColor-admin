# 按钮权限标识规则

本文档对应 `B3-01`，用于统一 `luckyColor-admin` 的按钮权限命名规则、菜单落库字段和前端接入约定。

## 1. 统一格式

统一使用：

```text
<domain>:<resource>:<action>
```

示例：

```text
system:user:create
system:user:update
tenant:manage:create
tenant:package:delete
```

## 2. 命名约束

### 2.1 domain

推荐固定值：

- `system`：系统管理域
- `tenant`：租户中心域
- `dashboard`：工作台域
- `tool`：工具能力域

约束：

- 统一使用小写英文
- 不使用拼音
- 不混用 `sys` / `system` / `admin`，系统管理统一为 `system`

### 2.2 resource

资源名统一使用小写英文，多个单词使用 `kebab-case`。

推荐资源名：

- `user`
- `role`
- `menu`
- `department`
- `dict`
- `config`
- `notice`
- `manage`
- `package`

约束：

- 同一业务对象只保留一种写法
- 不把按钮文案直接作为 `resource`
- 系统部门统一使用 `department`，不要再新增 `dept`

### 2.3 action

动作名统一从固定动作词表中选择：

- `query`
- `create`
- `update`
- `delete`
- `export`
- `import`
- `change-status`
- `reset-password`
- `assign`
- `bind`
- `grant`

约束：

- 查询统一用 `query`
- 新增统一用 `create`
- 编辑统一用 `update`
- 删除统一用 `delete`
- 状态切换统一用 `change-status`

## 3. 推荐权限码

### 3.1 用户管理

```text
system:user:query
system:user:create
system:user:update
system:user:delete
system:user:reset-password
system:user:assign
system:user:import
system:user:export
system:user:change-status
```

### 3.2 角色管理

```text
system:role:query
system:role:create
system:role:update
system:role:delete
system:role:grant
system:role:change-status
```

### 3.3 菜单管理

```text
system:menu:query
system:menu:create
system:menu:update
system:menu:delete
system:menu:change-status
```

### 3.4 部门管理

```text
system:department:query
system:department:create
system:department:update
system:department:delete
system:department:change-status
```

### 3.5 租户管理

```text
tenant:manage:query
tenant:manage:create
tenant:manage:update
tenant:manage:delete
tenant:manage:change-status
tenant:manage:bind
```

### 3.6 租户套餐

```text
tenant:package:query
tenant:package:create
tenant:package:update
tenant:package:delete
tenant:package:bind
```

## 4. 与菜单字段的关系

按钮权限标识最终统一落在菜单数据的 `permissionKey` 字段中。

约定：

- 目录菜单通常不配置按钮权限标识
- 页面菜单可配置访问级权限标识，但不强制当作按钮码
- 按钮菜单必须配置 `permissionKey`，并遵循本文档规则

## 5. 前端接入约定

统一通过以下入口接入：

- 常量：`src/constants/permission.ts`
- 工具函数：`src/utils/permission/index.ts`
- 组合式封装：`src/composables/use-permission.ts`
- 全局指令：`v-permission`

接入原则：

- 页面里不要散落硬编码权限字符串
- 优先从 `src/constants/permission.ts` 引用权限码
- 同一页面的权限码应集中声明后复用

## 6. 超级管理员约定

保留以下通配权限码：

```text
*
*:*:*
```

说明：

- 只用于权限判断层
- 不作为普通按钮权限码下发或保存

## 7. 联调兼容约定

后端返回权限字段时，前端兼容读取：

- `buttonCodeList`
- `buttonCodes`
- `permissions`
- `permissionCodes`

在后端未稳定返回前，本地 `admin` 账号允许注入一组演示权限；一旦后端返回真实权限码，以接口返回值为准。

## 8. 禁止项

以下写法禁止新增：

- `system:user:add`
- `system:user:edit`
- `system:user:remove`
- `system:dept:create`
- `tenant-package:create`
- `tenant_manage_create`
- `tenant:manage`

## 9. 后续依赖

- `B3-02` 按本文档封装按钮权限判断工具
- `B3-03` 按本文档接入按钮权限指令
- `B3-04` 按本文档提供组合式封装
- `B3-05 ~ B3-09` 在各业务页按本文档落按钮权限码
- `B4-03` 定义角色按钮权限结构时直接复用本文档规则
- `C4-15` 对菜单 `permissionKey` 做格式校验时以本文档为准
