import { pathToFileURL } from 'node:url';

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

  const data = parseJsonWithSafeIntegers(await response.text());
  if (!response.ok || data.code !== 200)
    throw new Error(`Request failed for ${path}: ${JSON.stringify(data)}`);

  return data.data;
}

function parseJsonWithSafeIntegers(payload) {
  return JSON.parse(payload.replace(/(?<!["\d])(-?\d{16,})(?![\d"])/gu, '"$1"'));
}

async function login() {
  const captchaChallenge = await request('/api/auth/captcha/challenge', {
    method: 'GET'
  });

  const captchaTokenPayload = await request('/api/auth/captcha/verify', {
    method: 'POST',
    body: JSON.stringify({
      captchaId: captchaChallenge.captchaId,
      answer: resolveCaptchaAnswer(captchaChallenge.captchaSvg)
    })
  });

  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: LOGIN_USERNAME,
      password: LOGIN_PASSWORD,
      captchaToken: captchaTokenPayload.captchaToken
    })
  });

  return data.accessToken;
}

function resolveCaptchaAnswer(captchaSvg) {
  const expression = extractCaptchaExpression(captchaSvg);
  const match = expression.match(/(\d+)\s*([+-])\s*(\d+)\s*=\s*\?/u);

  if (!match) {
    throw new Error(`Unrecognized captcha expression: ${expression}`);
  }

  const left = Number.parseInt(match[1], 10);
  const operator = match[2];
  const right = Number.parseInt(match[3], 10);
  return String(operator === '+' ? left + right : left - right);
}

function extractCaptchaExpression(captchaSvg) {
  const match = captchaSvg.match(/<text[^>]*>([^<]+)<\/text>/iu);
  if (!match?.[1]) {
    throw new Error(`Captcha SVG does not contain an expression: ${captchaSvg}`);
  }

  return match[1].replace(/\s+/gu, ' ').trim();
}

async function ensureMenu({ existingMenus, token, payload, matchers }) {
  const existing = existingMenus.find(menu => matchers.some(matcher => matcher(menu)));

  if (existing) {
    try {
      const updated = await request(`/api/menus/${existing.id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      }, token);

      const existingIndex = existingMenus.findIndex(menu => menu.id === existing.id);
      if (existingIndex >= 0)
        existingMenus[existingIndex] = updated;

      return updated.id;
    }
    catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!message.includes('菜单不存在'))
        throw error;

      const staleIndex = existingMenus.findIndex(menu => menu.id === existing.id);
      if (staleIndex >= 0)
        existingMenus.splice(staleIndex, 1);
    }
  }

  const created = await request('/api/menus', {
    method: 'POST',
    body: JSON.stringify(payload)
  }, token);

  existingMenus.push(created);
  return created.id;
}

export async function syncMenus() {
  const token = await login();
  const menuTree = await request('/api/menus/tree', {}, token);
  const existingMenus = flattenMenus(menuTree);
  const systemRoot = existingMenus.find(item => item.path === '/systemManagement');

  if (!systemRoot)
    throw new Error('System root menu not found');

  const tenantCenterRootId = await ensureMenu({
    existingMenus,
    token,
    payload: {
      parentId: null,
      title: '租户中心',
      name: 'tenantCenter',
      type: 1,
      path: '/tenantCenter',
      menuKey: 'main_tenant_center',
      icon: 'mdi:domain',
      layout: '',
      isVisible: true,
      component: 'sys',
      redirect: null,
      meta: {
        title: '租户中心'
      },
      sort: 5
    },
    matchers: [
      menu => menu.path === '/tenantCenter',
      menu => menu.name === 'tenantCenter',
      menu => menu.key === 'main_tenant_center'
    ]
  });

  const systemMenus = [
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
    }
  ];

  const tenantMenus = [
    {
      title: '租户管理',
      name: 'systemTenant',
      path: '/tenantCenter/tenant',
      legacyPaths: ['/systemManagement/system/tenant'],
      menuKey: 'main_tenant_center_tenant',
      icon: 'mdi:office-building-cog-outline',
      component: 'sys/tenant/index',
      sort: 1
    },
    {
      title: '租户套餐',
      name: 'systemTenantPackage',
      path: '/tenantCenter/tenantPackage',
      legacyPaths: ['/systemManagement/system/tenantPackage'],
      menuKey: 'main_tenant_center_tenant_package',
      icon: 'mdi:package-variant-closed',
      component: 'sys/tenantPackage/index',
      sort: 2
    }
  ];

  const featureDemoRootId = await ensureMenu({
    existingMenus,
    token,
    payload: {
      parentId: null,
      title: '功能演示',
      name: 'featureDemo',
      type: 1,
      path: '/featureDemo',
      menuKey: 'main_feature_demo',
      icon: 'carbon:function-math',
      layout: '',
      isVisible: true,
      component: 'sys',
      redirect: null,
      meta: {
        title: '功能演示'
      },
      sort: 7
    },
    matchers: [
      menu => menu.path === '/featureDemo',
      menu => menu.name === 'featureDemo',
      menu => menu.key === 'main_feature_demo',
      menu => menu.menuKey === 'main_feature_demo'
    ]
  });

  const ensuredMenuIds = [tenantCenterRootId, featureDemoRootId];

  const apifoxMenuId = await ensureMenu({
    existingMenus,
    token,
    payload: {
      parentId: null,
      title: 'Apifox',
      name: 'apifox',
      type: 1,
      path: '/apifox',
      menuKey: 'main_apifox',
      icon: 'simple-icons:apifox',
      layout: '',
      isVisible: true,
      component: 'sys',
      redirect: '/apifox/index',
      meta: {
        title: 'Apifox'
      },
      sort: 6
    },
    matchers: [
      menu => menu.path === '/apifox',
      menu => menu.name === 'apifox',
      menu => menu.key === 'main_apifox',
      menu => menu.menuKey === 'main_apifox'
    ]
  });

  ensuredMenuIds.push(apifoxMenuId);

  const apifoxDocMenuId = await ensureMenu({
    existingMenus,
    token,
    payload: {
      parentId: apifoxMenuId,
      title: '接口文档',
      name: 'apifoxDoc',
      type: 2,
      path: '/apifox/index',
      menuKey: 'main_apifox_doc',
      icon: 'simple-icons:apifox',
      layout: '',
      isVisible: true,
      component: 'tool/apifox/index',
      redirect: null,
      meta: {
        title: '接口文档',
        keepAlive: true
      },
      sort: 1
    },
    matchers: [
      menu => menu.path === '/apifox/index',
      menu => menu.name === 'apifoxDoc',
      menu => menu.key === 'main_apifox_doc',
      menu => menu.menuKey === 'main_apifox_doc'
    ]
  });

  ensuredMenuIds.push(apifoxDocMenuId);

  const apifoxCodegenMenuId = await ensureMenu({
    existingMenus,
    token,
    payload: {
      parentId: apifoxMenuId,
      title: '代码生成器',
      name: 'toolCodegen',
      type: 2,
      path: '/tool/codegen',
      menuKey: 'main_apifox_codegen',
      icon: 'carbon:code',
      layout: '',
      isVisible: true,
      component: 'tool/codegen/index',
      redirect: null,
      meta: {
        title: '代码生成器',
        keepAlive: true
      },
      sort: 2
    },
    matchers: [
      menu => menu.path === '/tool/codegen',
      menu => menu.name === 'toolCodegen',
      menu => menu.key === 'main_apifox_codegen',
      menu => menu.menuKey === 'main_apifox_codegen'
    ]
  });

  ensuredMenuIds.push(apifoxCodegenMenuId);

  const vxeTableMenuId = await ensureMenu({
    existingMenus,
    token,
    payload: {
      parentId: featureDemoRootId,
      title: 'VxeTable',
      name: 'featureDemoVxeTable',
      type: 2,
      path: '/featureDemo/vxeTable',
      menuKey: 'main_feature_demo_vxe_table',
      icon: 'carbon:data-table',
      layout: '',
      isVisible: true,
      component: 'icomponent/editTablist/index',
      redirect: null,
      meta: {
        title: 'VxeTable',
        keepAlive: true
      },
      sort: 1
    },
    matchers: [
      menu => menu.path === '/featureDemo/vxeTable',
      menu => menu.path === '/icomponent/editTablist',
      menu => menu.name === 'featureDemoVxeTable',
      menu => menu.name === 'editTablist',
      menu => menu.key === 'main_feature_demo_vxe_table',
      menu => menu.menuKey === 'main_feature_demo_vxe_table'
    ]
  });

  ensuredMenuIds.push(vxeTableMenuId);

  for (const item of systemMenus) {
    const id = await ensureMenu({
      existingMenus,
      token,
      payload: {
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
      },
      matchers: [
        menu => menu.path === item.path,
        menu => menu.name === item.name
      ]
    });
    ensuredMenuIds.push(id);
  }

  for (const item of tenantMenus) {
    const id = await ensureMenu({
      existingMenus,
      token,
      payload: {
        parentId: tenantCenterRootId,
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
      },
      matchers: [
        menu => menu.path === item.path,
        menu => item.legacyPaths.includes(menu.path),
        menu => menu.name === item.name
      ]
    });
    ensuredMenuIds.push(id);
  }

  const rolePage = await request('/api/roles?page=1&size=200', {}, token);
  const targetRoles = rolePage.records.filter(role => ['super_admin', 'tenant_admin'].includes(role.code));

  for (const role of targetRoles) {
    const roleMenuData = await request(`/api/roles/${role.id}/menus`, {}, token);
    const nextMenuIds = uniqueSortedIds([...(roleMenuData.menuIds || []), ...ensuredMenuIds]);

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
    tenantCenterRootId,
    ensuredMenuIds,
    assignedRoleCodes: targetRoles.map(role => role.code)
  };
}

function uniqueSortedIds(values) {
  return Array.from(new Set(values.map(value => String(value)))).sort((left, right) => {
    const leftId = BigInt(left);
    const rightId = BigInt(right);
    if (leftId === rightId)
      return 0;
    return leftId < rightId ? -1 : 1;
  });
}

function flattenMenus(items) {
  const flattened = [];

  const visit = (records) => {
    for (const record of records || []) {
      flattened.push(record);
      if (Array.isArray(record.children) && record.children.length > 0) {
        visit(record.children);
      }
    }
  };

  visit(items);
  return flattened;
}

const invokedPath = process.argv[1];
const isDirectRun = invokedPath ? import.meta.url === pathToFileURL(invokedPath).href : false;

if (isDirectRun) {
  syncMenus()
    .then((result) => {
      console.log(`Synced menus for tenant ${result.tenantId}: system root ${result.systemRootId}, tenant root ${result.tenantCenterRootId}`);
      console.log(`Ensured menu ids: ${result.ensuredMenuIds.join(', ')}`);
      console.log(`Assigned roles: ${result.assignedRoleCodes.join(', ')}`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
