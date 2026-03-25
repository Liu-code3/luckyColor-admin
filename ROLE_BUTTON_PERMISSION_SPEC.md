# 角色按钮权限结构说明

本文档对应 `B4-03`，用于定义角色按钮权限的数据结构、按钮节点来源和前后端字段约定，作为后续 `B4-05`、`B4-07` 的基础约束。

## 1. 目标

- 明确角色按钮授权的数据结构。
- 统一角色按钮权限与登录态按钮权限的字段口径。
- 为按钮权限树回显、保存和会话权限注入提供同一套编码来源。

## 2. 授权主体

角色按钮权限的授权主体统一复用角色基础字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roleId` | `string` | 角色 ID |
| `name` | `string` | 角色名称 |
| `code` | `string` | 角色编码 |

## 3. 按钮节点来源

角色按钮权限节点来源于菜单体系中的按钮类型节点：

- `type = 3`：按钮节点

编码来源约定：

- 按钮权限码统一取自按钮菜单的 `permissionKey`
- 当前前端接口层兼容字段：`key / menuKey`
- 最终用于权限判断的值必须是三段式权限码，如 `system:user:create`

不属于按钮权限结构的节点：

- `type = 1`：目录节点
- `type = 2`：菜单节点

## 4. 推荐接口结构

当前仓库尚未实现角色按钮授权接口，前端推荐后续按以下结构落地：

```ts
interface RoleAssignedButton {
  id: number;
  pid: number;
  title: string;
  type: 3;
  permissionKey: string;
  sort: number;
  isVisible?: boolean;
}

interface RoleButtonAssignment {
  roleId: string;
  name: string;
  code: string;
  buttonIds: number[];
  buttonCodes: string[];
  buttons: RoleAssignedButton[];
}
```

说明：

- `buttonIds` 用于树勾选回显。
- `buttonCodes` 用于会话权限、按钮鉴权和接口透传。
- `buttons` 用于前端展示已分配按钮的详情列表。

## 5. 按钮节点字段

角色按钮权限节点统一使用以下字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | 按钮节点 ID |
| `pid` | `number` | 是 | 所属菜单或上级节点 ID |
| `title` | `string` | 是 | 按钮名称 |
| `type` | `3` | 是 | 固定为按钮节点 |
| `permissionKey` | `string` | 是 | 按钮权限码 |
| `sort` | `number` | 否 | 排序值 |
| `isVisible` | `boolean` | 否 | 是否显示，主要用于展示提示 |

权限码要求：

- 必须符合 `BUTTON_PERMISSION_SPEC.md` 中的三段式规范。
- 禁止保存 `*` 或 `*:*:*` 作为普通按钮权限码。
- 禁止保存空字符串、中文文案或不完整权限码。

## 6. 前端树结构约定

角色按钮授权页前端推荐使用如下树节点结构：

```ts
interface RoleButtonTreeNode {
  key: number;
  label: string;
  permissionKey: string;
  type: 3;
  children?: RoleButtonTreeNode[];
}
```

生成规则：

- 只保留按钮节点，必要时可按所属菜单进行分组展示。
- `label` 默认使用按钮标题。
- `permissionKey` 作为节点辅助信息展示，便于核对权限码。
- `key` 使用按钮节点 `id`，保持和保存体一致。

## 7. 保存结构约定

角色按钮权限保存时，前端推荐统一提交：

```ts
{
  buttonIds: number[],
  buttonCodes: string[]
}
```

推荐理由：

- `buttonIds` 适合与菜单树节点保持一致，便于树组件勾选回显。
- `buttonCodes` 可直接复用到登录态 `buttonCodeList / buttonCodes / permissions / permissionCodes`。
- 后端即使只保存其中一类字段，也可以根据另一类字段进行校验或反查。

如果后端最终仅接受一种字段，优先级建议如下：

1. 优先保留 `buttonCodes`
2. 次选 `buttonIds`

原因：

- 前端运行时权限判断最终依赖的是权限码，而不是按钮 ID。
- 登录态、指令、组合式权限判断工具都以权限码作为最终输入。

## 8. 与登录态权限字段的关系

当前前端登录态兼容以下按钮权限字段：

- `buttonCodeList`
- `buttonCodes`
- `permissions`
- `permissionCodes`

约定：

- 角色按钮授权保存后，后端返回给用户会话的按钮权限应优先落在上述字段之一。
- 前端会对这些字段统一归并，最终得到当前登录用户的按钮权限码列表。
- 超级管理员仍可保留 `*` 或 `*:*:*` 通配码作为鉴权直通，但该值不参与普通角色按钮授权保存。

## 9. 与后续任务的关系

- `B4-05` 新增角色按钮权限树页时，直接按本文档的按钮节点结构组织数据。
- `B4-07` 接入角色按钮权限保存时，保存体优先采用 `buttonCodes` 或 `buttonIds + buttonCodes`。
- `B4-08` 超级管理员权限直通能力，只影响鉴权判断，不改变普通角色按钮结构。
