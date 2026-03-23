const menuList = [
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
    component: 'index/index'
  },
  {
    pid: 0,
    id: 2,
    title: '系统总览',
    name: 'analysis',
    type: 1,
    path: '/systemOverview',
    key: 'main_analysis',
    icon: 'pajamas:overview',
    isVisible: true,
    component: 'sys'
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
    component: 'sys/overview/index'
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
    component: 'sys'
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
    component: 'sys/user'
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
    component: 'sys/department/department'
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
    component: 'sys/role/index'
  },
  {
    pid: 4,
    id: 11,
    title: '字典管理',
    name: 'systemDict',
    type: 2,
    path: '/systemManagement/system/dict',
    key: 'main_system_dict',
    icon: 'arcticons:colordict',
    isVisible: true,
    component: 'sys/dict/index',
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 13,
    title: '租户中心',
    name: 'tenantCenter',
    type: 1,
    path: '/tenantCenter',
    key: 'main_tenant_center',
    icon: 'mdi:domain',
    isVisible: true,
    component: 'sys'
  },
  {
    pid: 13,
    id: 14,
    title: '租户管理',
    name: 'systemTenant',
    type: 2,
    path: '/tenantCenter/tenant',
    key: 'main_tenant_center_tenant',
    icon: 'mdi:office-building-cog-outline',
    isVisible: true,
    component: 'sys/tenant/index',
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 13,
    id: 15,
    title: '租户套餐',
    name: 'systemTenantPackage',
    type: 2,
    path: '/tenantCenter/tenantPackage',
    key: 'main_tenant_center_tenant_package',
    icon: 'mdi:package-variant-closed',
    isVisible: true,
    component: 'sys/tenantPackage/index',
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 16,
    title: 'Apifox',
    name: 'apifox',
    type: 1,
    path: '/apifox',
    key: 'main_apifox',
    icon: 'simple-icons:apifox',
    isVisible: true,
    component: 'sys',
    redirect: '/apifox/index',
    meta: {
      title: 'Apifox'
    }
  },
  {
    pid: 16,
    id: 17,
    title: '接口文档',
    name: 'apifoxDoc',
    type: 2,
    path: '/apifox/index',
    key: 'main_apifox_doc',
    icon: 'simple-icons:apifox',
    isVisible: true,
    component: 'tool/apifox/index',
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 0,
    id: 9,
    title: '组件封装',
    name: 'icomponent',
    type: 1,
    path: '/icomponent',
    key: 'main',
    icon: 'iconoir:commodity',
    isVisible: true,
    component: 'icomponent'
  },
  {
    pid: 9,
    id: 10,
    title: '富文本编辑器',
    name: 'editor',
    type: 2,
    path: '/icomponent/editor',
    key: 'icomponent_editor',
    icon: 'bi:file-earmark-richtext',
    isVisible: true,
    component: 'icomponent/editor',
    meta: {
      keepAlive: true
    }
  },
  {
    pid: 9,
    id: 12,
    title: '编辑表格',
    name: 'editTablist',
    type: 2,
    path: '/icomponent/editTablist',
    key: 'icomponent_editTablist',
    icon: 'arcticons:colordict',
    isVisible: true,
    component: 'icomponent/editTablist/index',
    meta: {
      keepAlive: true
    }
  }
];

export default {
  url: '/api/mock/menuList',
  method: 'post',
  response: (req: Mockm.Root) => {
    const successInfo = {
      code: 200,
      data: menuList,
      msg: '获取菜单成功~'
    };
    const errInfo = { code: 0, msg: '获取菜单失败' };
    return req.body.token === '111111111111111' ? successInfo : errInfo;
  }
};
