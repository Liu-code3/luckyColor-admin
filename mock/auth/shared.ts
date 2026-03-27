interface MockUserProfile {
  id: string;
  tenantId: string;
  tenantName: string;
  username: string;
  nickname: string;
  roleCodes: string[];
}

interface FlatMenuRecord {
  pid?: number;
  parentId?: number | null;
  id: number;
  title: string;
  name: string;
  type: number;
  path: string;
  key?: string;
  menuKey?: string;
  icon?: string;
  layout?: string;
  isVisible?: boolean;
  status?: boolean;
  component: string;
  redirect?: string | null;
  meta?: Record<string, unknown> | null;
  sort?: number;
}

export const mockUserProfile: MockUserProfile = {
  id: 'mock-user-admin',
  tenantId: 'tenant_001',
  tenantName: '演示租户',
  username: 'admin',
  nickname: 'LuckyColor 管理员',
  roleCodes: [ 'platform_admin' ]
};

const flatMenuRecords: FlatMenuRecord[] = [
  {
    pid: 0,
    id: 1,
    title: '首页',
    name: 'indexIndex',
    type: 1,
    path: '/index',
    key: 'main_analysis',
    icon: 'pajamas:overview',
    layout: '',
    isVisible: true,
    component: 'index/index',
    sort: 1
  },
  {
    pid: 0,
    id: 2,
    title: '系统总览',
    name: 'analysis',
    type: 1,
    path: '/systemOverview',
    key: 'main_analysis_root',
    icon: 'pajamas:overview',
    isVisible: true,
    component: 'sys',
    sort: 2
  },
  {
    pid: 2,
    id: 3,
    title: '核心技术',
    name: 'mainIndex',
    type: 2,
    path: '/systemOverview/index',
    key: 'main_analysis_technology',
    icon: 'ri:coreos-fill',
    isVisible: true,
    component: 'sys/overview/index',
    sort: 1,
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 4,
    title: '系统管理',
    name: 'system',
    type: 1,
    path: '/systemManagement',
    key: 'main_system',
    icon: 'material-symbols:folder-managed-sharp',
    isVisible: true,
    component: 'sys',
    sort: 3
  },
  {
    pid: 4,
    id: 5,
    title: '用户管理',
    name: 'systemUsers',
    type: 2,
    path: '/systemManagement/system/users',
    key: 'main_system_users',
    icon: 'mdi:user',
    isVisible: true,
    component: 'sys/user',
    sort: 1
  },
  {
    pid: 4,
    id: 6,
    title: '部门管理',
    name: 'department',
    type: 2,
    path: '/systemManagement/system/department',
    key: 'main_system_department',
    icon: 'mingcute:department-fill',
    isVisible: true,
    component: 'sys/department/department',
    sort: 2
  },
  {
    pid: 4,
    id: 7,
    title: '菜单管理',
    name: 'menu',
    type: 2,
    path: '/systemManagement/system/menu',
    key: 'main_system_menu',
    icon: 'line-md:menu',
    isVisible: true,
    component: 'sys/menu/index',
    sort: 3,
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 4,
    id: 8,
    title: '角色管理',
    name: 'systemRole',
    type: 2,
    path: '/systemManagement/system/role',
    key: 'main_system_role',
    icon: 'eos-icons:role-binding-outlined',
    isVisible: true,
    component: 'sys/role/index',
    sort: 4
  },
  {
    pid: 4,
    id: 9,
    title: '字典管理',
    name: 'systemDict',
    type: 2,
    path: '/systemManagement/system/dict',
    key: 'main_system_dict',
    icon: 'arcticons:colordict',
    isVisible: true,
    component: 'sys/dict/index',
    sort: 5,
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 10,
    title: '租户中心',
    name: 'tenantCenter',
    type: 1,
    path: '/tenantCenter',
    key: 'main_tenant_center',
    icon: 'mdi:domain',
    isVisible: true,
    component: 'sys',
    sort: 4
  },
  {
    pid: 10,
    id: 11,
    title: '租户管理',
    name: 'systemTenant',
    type: 2,
    path: '/tenantCenter/tenant',
    key: 'main_tenant_center_tenant',
    icon: 'mdi:office-building-cog-outline',
    isVisible: true,
    component: 'sys/tenant/index',
    sort: 1,
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 10,
    id: 12,
    title: '租户套餐',
    name: 'systemTenantPackage',
    type: 2,
    path: '/tenantCenter/tenantPackage',
    key: 'main_tenant_center_tenant_package',
    icon: 'mdi:package-variant-closed',
    isVisible: true,
    component: 'sys/tenantPackage/index',
    sort: 2,
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 13,
    title: 'Apifox',
    name: 'apifox',
    type: 1,
    path: '/apifox',
    key: 'main_apifox',
    icon: 'simple-icons:apifox',
    isVisible: true,
    component: 'sys',
    redirect: '/apifox/index',
    sort: 5,
    meta: {
      title: 'Apifox'
    }
  },
  {
    pid: 13,
    id: 14,
    title: '接口文档',
    name: 'apifoxDoc',
    type: 2,
    path: '/apifox/index',
    key: 'main_apifox_doc',
    icon: 'simple-icons:apifox',
    isVisible: true,
    component: 'tool/apifox/index',
    sort: 1,
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 15,
    title: '功能演示',
    name: 'featureDemo',
    type: 1,
    path: '/featureDemo',
    key: 'main_feature_demo',
    icon: 'carbon:function-math',
    isVisible: true,
    component: 'sys',
    sort: 6
  },
  {
    pid: 15,
    id: 16,
    title: 'VxeTable',
    name: 'featureDemoVxeTable',
    type: 2,
    path: '/featureDemo/vxeTable',
    key: 'main_feature_demo_vxe_table',
    icon: 'carbon:data-table',
    isVisible: true,
    component: 'icomponent/editTablist/index',
    sort: 1,
    meta: {
      keepAlive: true
    }
  }
];

export function createMockAccessToken(username = mockUserProfile.username) {
  const header = Buffer.from(JSON.stringify({
    alg: 'HS256',
    typ: 'JWT'
  })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + 2 * 60 * 60
  })).toString('base64url');

  return `${header}.${payload}.mock-signature`;
}

export function buildMockMenuTree() {
  const nodeMap = new Map<number, FlatMenuRecord & { children: FlatMenuRecord[] }>();

  flatMenuRecords.forEach((record) => {
    nodeMap.set(record.id, {
      ...record,
      parentId: record.parentId ?? record.pid ?? 0,
      menuKey: record.menuKey ?? record.key,
      status: record.status ?? true,
      children: []
    });
  });

  const roots: Array<FlatMenuRecord & { children: FlatMenuRecord[] }> = [];

  nodeMap.forEach((node) => {
    const parentId = Number(node.parentId ?? node.pid ?? 0);
    if (parentId > 0 && nodeMap.has(parentId)) {
      nodeMap.get(parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  return sortMenuNodes(roots);
}

function sortMenuNodes(nodes: Array<FlatMenuRecord & { children: FlatMenuRecord[] }>) {
  return nodes
    .map(node => ({
      ...node,
      children: node.children?.length ? sortMenuNodes(node.children) : undefined
    }))
    .sort((left, right) => {
      const sortDiff = Number(left.sort ?? 0) - Number(right.sort ?? 0);
      if (sortDiff !== 0) {
        return sortDiff;
      }

      return Number(left.id) - Number(right.id);
    });
}
