# 角色菜单权限结构说明

本文档对应 `B4-02`，用于定义角色菜单权限的数据结构、菜单节点边界和前端授权页的数据组织方式，作为后续 `B4-04`、`B4-06` 的基础约束。

## 1. 目标

- 明确角色菜单授权的数据结构。
- 区分“菜单权限”与“按钮权限”的节点边界。
- 为角色菜单授权树的回显与保存提供统一字段约定。

## 2. 授权主体

角色菜单权限的授权主体统一复用角色基础字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `roleId` | `string` | 角色 ID |
| `name` | `string` | 角色名称 |
| `code` | `string` | 角色编码 |

## 3. 当前接口结构

当前前端已存在角色菜单授权接口结构：

```ts
export interface RoleAssignedMenu {
  id: number;
  pid: number;
  title: string;
  name: string;
  type: number;
  path: string;
  key: string;
  isVisible: boolean;
  sort: number;
}

export interface RoleMenuAssignment {
  roleId: string;
  name: string;
  code: string;
  menuIds: number[];
  menus: RoleAssignedMenu[];
}
```

说明：

- `menuIds` 表示角色当前已勾选的菜单节点 ID 集合。
- `menus` 表示角色当前已分配的菜单节点详情列表。
- 当前结构已满足“菜单授权弹窗回显 + 保存”两类基础场景。

## 4. 菜单节点边界

角色菜单权限只包含以下两类节点：

- `type = 1`：目录节点
- `type = 2`：菜单节点

以下节点不属于本结构：

- `type = 3`：按钮节点

约定：

- 按钮节点统一在 `B4-03` 的角色按钮权限结构中定义。
- 角色菜单授权树在展示前，应过滤掉 `type = 3` 的节点，避免与按钮授权混用。

## 5. 菜单节点字段

角色菜单权限节点统一使用以下字段：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `id` | `number` | 是 | 菜单节点 ID |
| `pid` | `number` | 是 | 上级节点 ID |
| `title` | `string` | 是 | 菜单标题 |
| `name` | `string` | 是 | 路由名称 |
| `type` | `1 \| 2` | 是 | 节点类型，只允许目录或菜单 |
| `path` | `string` | 是 | 访问路径 |
| `key` | `string` | 否 | 菜单权限标识或菜单 key |
| `isVisible` | `boolean` | 否 | 菜单显隐状态 |
| `sort` | `number` | 否 | 排序值 |

补充说明：

- `key` 当前兼容后端返回的菜单标识字段，后续若统一改为 `menuKey / permissionKey`，需在接口层做兼容映射。
- `isVisible` 只影响前端展示提示，不影响授权结构本身是否可保存。

## 6. 前端树结构约定

角色菜单授权页前端推荐使用如下树节点结构：

```ts
interface RoleMenuTreeNode {
  key: number;
  label: string;
  type: 1 | 2;
  path: string;
  disabled?: boolean;
  children?: RoleMenuTreeNode[];
}
```

生成规则：

- `key` 使用菜单 `id`。
- `label` 默认使用 `title`，必要时可拼接 `path` 作为辅助信息。
- 只保留目录和菜单节点。
- 子节点按 `sort` 升序组织。

## 7. 保存结构约定

角色菜单权限保存时，前端统一提交：

```ts
{
  menuIds: number[]
}
```

约定：

- 只提交最终勾选的菜单节点 ID 集合。
- 不单独提交标题、路径、显隐等冗余字段。
- 如果后端需要半选节点，统一由后端根据树关系自行推导，前端不额外拼装半选字段。

## 8. 与后续任务的关系

- `B4-04` 新增角色菜单权限树页时，直接按本文档过滤并生成树节点。
- `B4-06` 接入角色菜单权限保存时，保存体统一使用 `menuIds`。
- `B4-03` 角色按钮权限结构与本文档并行，但节点范围仅限按钮节点。
