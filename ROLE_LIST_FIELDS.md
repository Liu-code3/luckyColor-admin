# 角色列表字段说明

本文档对应 `B4-01`，用于统一角色管理页的查询字段、列表字段、表单字段与接口结构，作为后续 `B4-02 ~ B4-08` 的基础约束。

## 1. 数据来源

- 查询接口：`GET /roles`
- 详情接口：`GET /roles/{id}`
- 新增接口：`POST /roles`
- 编辑接口：`PATCH /roles/{id}`
- 删除接口：`DELETE /roles/{id}`

当前前端类型定义位于：

- `src/api/roles.ts`
- `src/views/sys/role/index.vue`

## 2. 查询字段

角色列表页当前使用以下查询参数：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `page` | `number` | 当前页码 |
| `size` | `number` | 每页条数 |
| `keyword` | `string` | 角色名称或角色编码关键字 |

约定：

- `keyword` 同时匹配角色名称与角色编码。
- 分页参数沿用全局分页结构，不单独扩展角色专属分页字段。

## 3. 列表项字段

角色列表数据结构统一使用 `RoleRecord`：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `string` | 是 | 角色主键 |
| `name` | `string` | 是 | 角色名称 |
| `code` | `string` | 是 | 角色编码 |
| `sort` | `number` | 是 | 排序值 |
| `status` | `boolean` | 是 | 启用状态，`true` 为启用 |
| `remark` | `string \| null` | 否 | 备注 |
| `createdAt` | `string` | 是 | 创建时间 |
| `updatedAt` | `string` | 是 | 更新时间 |

当前前端接口定义：

```ts
export interface RoleRecord {
  id: string;
  name: string;
  code: string;
  sort: number;
  status: boolean;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## 4. 列表展示字段

角色管理页表格当前展示字段统一为：

| 列名 | 对应字段 | 说明 |
| --- | --- | --- |
| 角色名称 | `name` | 主展示字段 |
| 角色编码 | `code` | 唯一业务编码 |
| 状态 | `status` | 前端显示为“启用 / 停用” |
| 排序 | `sort` | 数值越小越靠前 |
| 备注 | `remark` | 无值时显示 `-` |
| 更新时间 | `updatedAt` | 使用本地时间格式化展示 |
| 操作 | - | 分配菜单、编辑、删除等动作入口 |

说明：

- 当前列表未直接展示 `id`、`createdAt`，但仍保留在接口结构中，供详情回显和后续扩展使用。
- `status` 当前在列表中使用标签展示，而不是开关组件。

## 5. 表单字段

角色新增/编辑表单当前统一使用以下字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 角色名称 |
| `code` | `string` | 角色编码 |
| `sort` | `number \| null` | 排序值 |
| `status` | `boolean` | 启用状态 |
| `remark` | `string` | 备注 |

表单约束：

- `name`：必填，去首尾空格后长度不超过 30。
- `code`：必填，格式为 `2-30` 位小写字母、数字或下划线。
- `sort`：提交时转为数字。
- `remark`：非必填，长度不超过 100。

## 6. 与后续任务的关系

- `B4-02` 定义角色菜单权限结构时，基于当前 `id / name / code` 建立授权主体。
- `B4-03` 定义角色按钮权限结构时，继续复用当前角色主字段。
- `B4-04 ~ B4-07` 的权限弹窗、保存逻辑与回显逻辑，都以本文档字段为准。
- `B4-08` 超级管理员权限直通能力，不改变当前角色基础字段结构。
