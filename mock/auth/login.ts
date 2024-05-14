const menuList = [
  {
    pid: 0,
    id: 1,
    title: '系统总览',
    type: 1,
    path: '/main/analysis',
    key: 'main_analysis',
    icon: 'pajamas:overview'
  },
  {
    pid: 1,
    id: 2,
    title: '核心技术',
    type: 2,
    path: '/main/analysis/technology',
    key: 'main_analysis_technology',
    icon: 'ri:coreos-fill'
  },
  {
    pid: 0,
    id: 3,
    title: '系统管理',
    type: 1,
    path: '/main/system',
    key: 'main_system',
    icon: 'material-symbols:folder-managed-sharp'
  },
  {
    pid: 3,
    id: 4,
    title: '用户管理',
    type: 2,
    path: '/main/system/users',
    key: 'main_system_users',
    icon: 'mdi:user'
  },
  {
    pid: 3,
    id: 5,
    title: '部门管理',
    type: 2,
    path: '/main/system/department',
    key: 'main_system_department',
    icon: 'mingcute:department-fill'
  },
  {
    pid: 3,
    id: 6,
    title: '菜单管理',
    type: 2,
    path: '/main/system/menu',
    key: 'main_system_menu',
    icon: 'line-md:menu'
  },
  {
    pid: 3,
    id: 7,
    title: '角色管理',
    type: 2,
    path: '/main/system/role',
    key: 'main_system_role',
    icon: 'eos-icons:role-binding-outlined'
  },
  {
    pid: 0,
    id: 8,
    title: '商品中心',
    type: 1,
    path: '/main/product',
    key: 'main_product',
    icon: 'iconoir:commodity'
  },
  {
    pid: 8,
    id: 9,
    title: '商品类型',
    type: 2,
    path: '/main/product/type',
    key: 'main_product_type',
    icon: 'lucide:file-type'
  },
  {
    pid: 8,
    id: 10,
    title: '商品信息',
    type: 2,
    path: '/main/product/info',
    key: 'main_product_info',
    icon: 'ep:info-filled'
  }
];

export default {
  url: '/api/mock/login',
  method: 'post',
  response: (req: Mockm.RequestHeaders) => {
    const successInfo = { code: 200, data: menuList, msg: '登录成功~' };
    const errInfo = { code: 0, msg: '登录失败' };
    return req.body.adminName === 'admin' ? successInfo : errInfo;
  }
};
