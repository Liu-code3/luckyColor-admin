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
    path: '/main',
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
    path: '/main/index',
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
    path: '/main/system',
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
    path: '/main/system/users',
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
    path: '/main/system/department',
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
    path: '/main/system/menu',
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
    path: '/main/system/role',
    key: 'main_system_role',
    icon: 'eos-icons:role-binding-outlined',
    isVisible: true,
    component: 'sys/role/index'
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
    id: 11,
    title: '数据字典',
    name: 'dict',
    type: 2,
    path: '/icomponent/dict',
    key: 'icomponent_dict',
    icon: 'arcticons:colordict',
    isVisible: true,
    component: 'icomponent/dict/index',
    meta: {
      keepAlive: true
    }
  }
  // {
  //   pid: 9,
  //   id: 11,
  //   title: '商品信息',
  //   type: 2,
  //   path: '/main/product/info',
  //   key: 'main_product_info',
  //   icon: 'ep:info-filled',
  //   component: 'goods/info'
  // }
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
