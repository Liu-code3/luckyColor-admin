export const DATA_SCOPE_TYPES = {
  ALL: 'ALL',
  TENANT: 'TENANT',
  DEPT: 'DEPT',
  DEPT_AND_CHILD: 'DEPT_AND_CHILD',
  SELF: 'SELF',
  CUSTOM: 'CUSTOM'
} as const;

export type DataScopeType = typeof DATA_SCOPE_TYPES[keyof typeof DATA_SCOPE_TYPES];

export const DATA_SCOPE_OPTION_LIST = [
  {
    label: '全部数据',
    value: DATA_SCOPE_TYPES.ALL,
    description: '不限制任何数据范围，通常只对平台超级管理员开放。'
  },
  {
    label: '当前租户',
    value: DATA_SCOPE_TYPES.TENANT,
    description: '仅查看当前租户下的全部数据，适合租户管理员。'
  },
  {
    label: '本部门',
    value: DATA_SCOPE_TYPES.DEPT,
    description: '仅允许访问当前登录人所属部门的数据。'
  },
  {
    label: '本部门及子部门',
    value: DATA_SCOPE_TYPES.DEPT_AND_CHILD,
    description: '适合主管角色，允许访问本部门及其下级部门。'
  },
  {
    label: '仅本人',
    value: DATA_SCOPE_TYPES.SELF,
    description: '只返回当前登录人的本人数据，适合普通成员角色。'
  },
  {
    label: '自定义部门',
    value: DATA_SCOPE_TYPES.CUSTOM,
    description: '按角色手动勾选可访问的部门范围。'
  }
] as const;

export const DATA_SCOPE_LABEL_MAP = DATA_SCOPE_OPTION_LIST.reduce<Record<DataScopeType, string>>(
  (map, item) => {
    map[item.value] = item.label;
    return map;
  },
  {
    [DATA_SCOPE_TYPES.ALL]: '全部数据',
    [DATA_SCOPE_TYPES.TENANT]: '当前租户',
    [DATA_SCOPE_TYPES.DEPT]: '本部门',
    [DATA_SCOPE_TYPES.DEPT_AND_CHILD]: '本部门及子部门',
    [DATA_SCOPE_TYPES.SELF]: '仅本人',
    [DATA_SCOPE_TYPES.CUSTOM]: '自定义部门'
  }
);

const DATA_SCOPE_TYPE_SET = new Set<string>(Object.values(DATA_SCOPE_TYPES));

export function isDataScopeType(value: unknown): value is DataScopeType {
  return typeof value === 'string' && DATA_SCOPE_TYPE_SET.has(value);
}

export function normalizeDataScopeType(value: unknown, fallback = DATA_SCOPE_TYPES.TENANT): DataScopeType {
  return isDataScopeType(value) ? value : fallback;
}
