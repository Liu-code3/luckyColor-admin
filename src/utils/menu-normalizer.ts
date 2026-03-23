type MenuNodeLike<T> = T & {
  pid?: number
  parentId?: number | null
  id: number
  title: string
  name: string
  type: number
  path: string
  key?: string
  menuKey?: string
  icon?: string
  layout?: string
  isVisible?: boolean
  component: string
  redirect?: string | null
  meta?: Record<string, unknown> | null
  sort?: number
  children?: T[]
}

const SYSTEM_ROOT_PATH = '/systemManagement'
const COMPONENT_ROOT_PATH = '/icomponent'
const FEATURE_DEMO_ROOT_PATH = '/featureDemo'

const LEGACY_DICT_PATH = '/icomponent/dict'
const LEGACY_DICT_COMPONENT = 'icomponent/dict/index'
const TARGET_DICT_PATH = '/systemManagement/system/dict'
const TARGET_DICT_COMPONENT = 'sys/dict/index'
const TARGET_DICT_KEY = 'main_system_dict'
const TARGET_DICT_NAME = 'systemDict'
const TARGET_DICT_TITLE = '字典管理'
const TARGET_DICT_ICON = 'arcticons:colordict'
const TARGET_DICT_SORT = 8

const LEGACY_VXE_TABLE_PATH = '/icomponent/editTablist'
const LEGACY_VXE_TABLE_COMPONENT = 'icomponent/editTablist/index'
const LEGACY_VXE_TABLE_KEY = 'icomponent_editTablist'
const TARGET_FEATURE_DEMO_NAME = 'featureDemo'
const TARGET_FEATURE_DEMO_TITLE = '功能演示'
const TARGET_FEATURE_DEMO_KEY = 'main_feature_demo'
const TARGET_FEATURE_DEMO_ICON = 'carbon:function-math'
const TARGET_FEATURE_DEMO_SORT = 7
const TARGET_VXE_TABLE_PATH = '/featureDemo/vxeTable'
const TARGET_VXE_TABLE_NAME = 'featureDemoVxeTable'
const TARGET_VXE_TABLE_TITLE = 'VxeTable'
const TARGET_VXE_TABLE_KEY = 'main_feature_demo_vxe_table'
const TARGET_VXE_TABLE_ICON = 'carbon:data-table'
const TARGET_VXE_TABLE_SORT = 1

function cloneNode<T extends MenuNodeLike<T>>(node: T): T {
  return {
    ...node,
    children: node.children?.map(child => cloneNode(child))
  } as T
}

function sortMenus<T extends MenuNodeLike<T>>(items: T[]) {
  return [ ...items ].sort((left, right) => {
    const sortDiff = Number(left.sort ?? 0) - Number(right.sort ?? 0)
    if (sortDiff !== 0) {
      return sortDiff
    }

    return Number(left.id) - Number(right.id)
  })
}

function isLegacyDictMenu<T extends MenuNodeLike<T>>(node: T) {
  return node.path === LEGACY_DICT_PATH
    || node.component === LEGACY_DICT_COMPONENT
    || node.key === 'icomponent_dict'
    || node.menuKey === 'icomponent_dict'
    || node.name === 'dict'
}

function isSystemDictMenu<T extends MenuNodeLike<T>>(node: T) {
  return node.path === TARGET_DICT_PATH
    || node.component === TARGET_DICT_COMPONENT
    || node.key === TARGET_DICT_KEY
    || node.menuKey === TARGET_DICT_KEY
    || node.name === TARGET_DICT_NAME
}

function isLegacyVxeTableMenu<T extends MenuNodeLike<T>>(node: T) {
  return node.path === LEGACY_VXE_TABLE_PATH
    || node.component === LEGACY_VXE_TABLE_COMPONENT
    || node.key === LEGACY_VXE_TABLE_KEY
    || node.menuKey === LEGACY_VXE_TABLE_KEY
    || node.name === 'editTablist'
}

function isFeatureDemoRoot<T extends MenuNodeLike<T>>(node: T) {
  return node.path === FEATURE_DEMO_ROOT_PATH
    || node.key === TARGET_FEATURE_DEMO_KEY
    || node.menuKey === TARGET_FEATURE_DEMO_KEY
    || node.name === TARGET_FEATURE_DEMO_NAME
}

function isFeatureDemoVxeTable<T extends MenuNodeLike<T>>(node: T) {
  return node.path === TARGET_VXE_TABLE_PATH
    || node.key === TARGET_VXE_TABLE_KEY
    || node.menuKey === TARGET_VXE_TABLE_KEY
    || node.name === TARGET_VXE_TABLE_NAME
    || isLegacyVxeTableMenu(node)
}

function toSystemDictMenu<T extends MenuNodeLike<T>>(node: T, parentId?: number): T {
  return {
    ...node,
    pid: parentId ?? node.pid,
    parentId: parentId ?? node.parentId,
    title: TARGET_DICT_TITLE,
    name: TARGET_DICT_NAME,
    path: TARGET_DICT_PATH,
    key: TARGET_DICT_KEY,
    menuKey: TARGET_DICT_KEY,
    icon: node.icon || TARGET_DICT_ICON,
    component: TARGET_DICT_COMPONENT,
    isVisible: node.isVisible ?? true,
    sort: TARGET_DICT_SORT,
    meta: {
      ...(node.meta || {}),
      title: TARGET_DICT_TITLE,
      keepAlive: true
    }
  } as T
}

function createFeatureDemoRoot<T extends MenuNodeLike<T>>(templateNode: T | undefined, nextId: number): T {
  return {
    ...(templateNode || {}),
    pid: 0,
    parentId: 0,
    id: nextId,
    title: TARGET_FEATURE_DEMO_TITLE,
    name: TARGET_FEATURE_DEMO_NAME,
    type: 1,
    path: FEATURE_DEMO_ROOT_PATH,
    key: TARGET_FEATURE_DEMO_KEY,
    menuKey: TARGET_FEATURE_DEMO_KEY,
    icon: TARGET_FEATURE_DEMO_ICON,
    layout: templateNode?.layout || '',
    isVisible: templateNode?.isVisible ?? true,
    component: 'sys',
    redirect: null,
    sort: TARGET_FEATURE_DEMO_SORT,
    meta: {
      ...(templateNode?.meta || {}),
      title: TARGET_FEATURE_DEMO_TITLE
    },
    children: []
  } as T
}

function toFeatureDemoVxeTable<T extends MenuNodeLike<T>>(node: T, parentId?: number): T {
  return {
    ...node,
    pid: parentId ?? node.pid,
    parentId: parentId ?? node.parentId,
    title: TARGET_VXE_TABLE_TITLE,
    name: TARGET_VXE_TABLE_NAME,
    path: TARGET_VXE_TABLE_PATH,
    key: TARGET_VXE_TABLE_KEY,
    menuKey: TARGET_VXE_TABLE_KEY,
    icon: node.icon || TARGET_VXE_TABLE_ICON,
    component: LEGACY_VXE_TABLE_COMPONENT,
    isVisible: node.isVisible ?? true,
    sort: TARGET_VXE_TABLE_SORT,
    meta: {
      ...(node.meta || {}),
      title: TARGET_VXE_TABLE_TITLE,
      keepAlive: true
    }
  } as T
}

export function normalizeMenuTree<T extends MenuNodeLike<T>>(menus: T[] | null | undefined): T[] {
  if (!menus?.length) {
    return []
  }

  const normalizedTree = menus.map(menu => cloneNode(menu))
  const systemRoot = normalizedTree.find(menu => menu.path === SYSTEM_ROOT_PATH)
  const componentRoot = normalizedTree.find(menu => menu.path === COMPONENT_ROOT_PATH)
  let featureDemoRoot = normalizedTree.find(menu => isFeatureDemoRoot(menu))

  const legacyDict = componentRoot?.children?.find(child => isLegacyDictMenu(child))
  const systemDict = systemRoot?.children?.find(child => isSystemDictMenu(child))
  const legacyVxeTable = componentRoot?.children?.find(child => isLegacyVxeTableMenu(child))
  const featureDemoVxeTable = featureDemoRoot?.children?.find(child => isFeatureDemoVxeTable(child))

  if (systemRoot) {
    const nextSystemChildren = systemRoot.children ? [ ...systemRoot.children ] : []

    if (systemDict) {
      const index = nextSystemChildren.findIndex(child => child.id === systemDict.id)
      nextSystemChildren[index] = toSystemDictMenu(systemDict, systemRoot.id)
    }
    else if (legacyDict) {
      nextSystemChildren.push(toSystemDictMenu(legacyDict, systemRoot.id))
    }

    systemRoot.children = sortMenus(nextSystemChildren)
  }

  if (!featureDemoRoot && legacyVxeTable) {
    const nextId = normalizedTree.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1
    featureDemoRoot = createFeatureDemoRoot(componentRoot as T | undefined, nextId)
    normalizedTree.push(featureDemoRoot)
  }

  if (featureDemoRoot) {
    const nextFeatureDemoChildren = featureDemoRoot.children ? [ ...featureDemoRoot.children ] : []

    if (featureDemoVxeTable) {
      const index = nextFeatureDemoChildren.findIndex(child => child.id === featureDemoVxeTable.id)
      nextFeatureDemoChildren[index] = toFeatureDemoVxeTable(featureDemoVxeTable, featureDemoRoot.id)
    }
    else if (legacyVxeTable) {
      nextFeatureDemoChildren.push(toFeatureDemoVxeTable(legacyVxeTable, featureDemoRoot.id))
    }

    featureDemoRoot.title = TARGET_FEATURE_DEMO_TITLE
    featureDemoRoot.name = TARGET_FEATURE_DEMO_NAME
    featureDemoRoot.path = FEATURE_DEMO_ROOT_PATH
    featureDemoRoot.key = TARGET_FEATURE_DEMO_KEY
    featureDemoRoot.menuKey = TARGET_FEATURE_DEMO_KEY
    featureDemoRoot.icon = featureDemoRoot.icon || TARGET_FEATURE_DEMO_ICON
    featureDemoRoot.component = 'sys'
    featureDemoRoot.isVisible = featureDemoRoot.isVisible ?? true
    featureDemoRoot.sort = TARGET_FEATURE_DEMO_SORT
    featureDemoRoot.meta = {
      ...(featureDemoRoot.meta || {}),
      title: TARGET_FEATURE_DEMO_TITLE
    }
    featureDemoRoot.children = sortMenus(nextFeatureDemoChildren)
  }

  if (componentRoot?.children?.length) {
    componentRoot.children = sortMenus(
      componentRoot.children.filter(child => !isLegacyDictMenu(child) && !isLegacyVxeTableMenu(child))
    )
  }

  return sortMenus(normalizedTree)
}
