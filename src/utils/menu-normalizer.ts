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
const LEGACY_DICT_PATH = '/icomponent/dict'
const LEGACY_DICT_COMPONENT = 'icomponent/dict/index'
const TARGET_DICT_PATH = '/systemManagement/system/dict'
const TARGET_DICT_COMPONENT = 'sys/dict/index'
const TARGET_DICT_KEY = 'main_system_dict'
const TARGET_DICT_NAME = 'systemDict'
const TARGET_DICT_TITLE = '字典管理'
const TARGET_DICT_ICON = 'arcticons:colordict'
const TARGET_DICT_SORT = 8

function cloneNode<T extends MenuNodeLike<T>>(node: T): T {
  return {
    ...node,
    children: node.children?.map(child => cloneNode(child))
  } as T
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

function sortMenus<T extends MenuNodeLike<T>>(items: T[]) {
  return [ ...items ].sort((left, right) => {
    const sortDiff = Number(left.sort ?? 0) - Number(right.sort ?? 0)
    if (sortDiff !== 0) {
      return sortDiff
    }

    return Number(left.id) - Number(right.id)
  })
}

function toSystemDictMenu<T extends MenuNodeLike<T>>(node: T, parentId?: number): T {
  const nextNode = {
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

  return nextNode
}

export function normalizeMenuTree<T extends MenuNodeLike<T>>(menus: T[] | null | undefined): T[] {
  if (!menus?.length) {
    return []
  }

  const normalizedTree = menus.map(menu => cloneNode(menu))
  const systemRoot = normalizedTree.find(menu => menu.path === SYSTEM_ROOT_PATH)
  const componentRoot = normalizedTree.find(menu => menu.path === COMPONENT_ROOT_PATH)
  const legacyDict = componentRoot?.children?.find(child => isLegacyDictMenu(child))
  const systemDict = systemRoot?.children?.find(child => isSystemDictMenu(child))

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

  if (componentRoot?.children?.length) {
    componentRoot.children = sortMenus(
      componentRoot.children.filter(child => !isLegacyDictMenu(child))
    )
  }

  return sortMenus(normalizedTree)
}
