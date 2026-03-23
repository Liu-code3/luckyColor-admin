const API_BASE_URL = process.env.MENU_SYNC_API_URL || 'http://127.0.0.1:3001';
const LOGIN_USERNAME = process.env.MENU_SYNC_USERNAME || 'admin';
const LOGIN_PASSWORD = process.env.MENU_SYNC_PASSWORD || '123456';
const TENANT_ID = process.env.MENU_SYNC_TENANT_ID || 'tenant_001';

async function request(path, options = {}, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-tenant-id': TENANT_ID,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok || data.code !== 200)
    throw new Error(`Request failed for ${path}: ${JSON.stringify(data)}`);

  return data.data;
}

async function login() {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: LOGIN_USERNAME,
      password: LOGIN_PASSWORD
    })
  });

  return data.accessToken;
}

async function syncMenus() {
  const token = await login();
  const menuPage = await request('/api/menus?page=1&size=500', {}, token);
  const systemRoot = menuPage.records.find(item => item.path === '/systemManagement');

  if (!systemRoot)
    throw new Error('System root menu not found');

  const desiredMenus = [
    {
      title: '字典管理',
      name: 'systemDict',
      path: '/systemManagement/system/dict',
      menuKey: 'main_system_dict',
      icon: 'arcticons:colordict',
      component: 'sys/dict/index',
      sort: 8
    },
    {
      title: '配置管理',
      name: 'systemConfig',
      path: '/systemManagement/system/config',
      menuKey: 'main_system_config',
      icon: 'solar:settings-bold',
      component: 'sys/config/index',
      sort: 9
    },
    {
      title: '公告管理',
      name: 'systemNotice',
      path: '/systemManagement/system/notice',
      menuKey: 'main_system_notice',
      icon: 'mdi:bullhorn-outline',
      component: 'sys/notice/index',
      sort: 10
    },
    {
      title: '租户管理',
      name: 'systemTenant',
      path: '/systemManagement/system/tenant',
      menuKey: 'main_system_tenant',
      icon: 'mdi:office-building-cog-outline',
      component: 'sys/tenant/index',
      sort: 11
    },
    {
      title: '租户套餐',
      name: 'systemTenantPackage',
      path: '/systemManagement/system/tenantPackage',
      menuKey: 'main_system_tenant_package',
      icon: 'mdi:package-variant-closed',
      component: 'sys/tenantPackage/index',
      sort: 12
    }
  ];

  const ensuredMenuIds = [];

  for (const item of desiredMenus) {
    const existing = menuPage.records.find(menu => menu.path === item.path || menu.name === item.name);
    const payload = {
      parentId: systemRoot.id,
      title: item.title,
      name: item.name,
      type: 2,
      path: item.path,
      menuKey: item.menuKey,
      icon: item.icon,
      layout: '',
      isVisible: true,
      component: item.component,
      redirect: null,
      meta: {
        title: item.title,
        keepAlive: true
      },
      sort: item.sort
    };

    if (existing) {
      const updated = await request(`/api/menus/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }, token);
      ensuredMenuIds.push(updated.id);
      continue;
    }

    const created = await request('/api/menus', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, token);
    ensuredMenuIds.push(created.id);
  }

  const rolePage = await request('/api/roles?page=1&size=200', {}, token);
  const targetRoles = rolePage.records.filter(role => [ 'super_admin', 'tenant_admin' ].includes(role.code));

  for (const role of targetRoles) {
    const roleMenuData = await request(`/api/roles/${role.id}/menus`, {}, token);
    const nextMenuIds = Array.from(new Set([ ...roleMenuData.menuIds, ...ensuredMenuIds ])).sort((a, b) => a - b);

    await request(`/api/roles/${role.id}/menus`, {
      method: 'PUT',
      body: JSON.stringify({
        menuIds: nextMenuIds
      })
    }, token);
  }

  return {
    tenantId: TENANT_ID,
    systemRootId: systemRoot.id,
    ensuredMenuIds,
    assignedRoleCodes: targetRoles.map(role => role.code)
  };
}

syncMenus()
  .then((result) => {
    console.log(`Synced menus for tenant ${result.tenantId} under root ${result.systemRootId}: ${result.ensuredMenuIds.join(', ')}`);
    console.log(`Assigned roles: ${result.assignedRoleCodes.join(', ')}`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
