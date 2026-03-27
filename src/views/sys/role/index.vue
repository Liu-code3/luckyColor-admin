<script setup lang="ts">
import type { FormInst, FormRules, TreeOption } from 'naive-ui';
import type { DepartmentTreeRecord, MenuRecord, RoleRecord } from '@/api';
import type { DataScopeType } from '@/constants/data-scope';
import { Icon } from '@iconify/vue';
import {
  assignRoleMenusApi,
  createRoleApi,
  deleteRoleApi,

  getDepartmentTreeApi,
  getMenuTreeApi,
  getRoleDataScopeApi,
  getRoleDetailApi,
  getRoleMenusApi,
  getRolePageApi,

  saveRoleDataScopeApi,
  updateRoleApi
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import {
  DATA_SCOPE_LABEL_MAP,
  DATA_SCOPE_OPTION_LIST,
  DATA_SCOPE_TYPES,

  normalizeDataScopeType
} from '@/constants/data-scope';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { getCurrentTenantContext } from '@/utils/auth';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';
import { isSuperAdminIdentity } from '@/utils/permission';
import { belongsToCurrentTenant, filterRecordsByCurrentTenant, filterTreeRecordsByCurrentTenant } from '@/utils/tenant-scope';

interface RoleFormState {
  name: string;
  code: string;
  sort: number | null;
  status: boolean;
  remark: string;
}

interface SummaryCard {
  label: string;
  value: number;
  helper: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

interface RoleDataScopeFormState {
  dataScopeType: DataScopeType;
  customDeptIds: number[];
}

const roleButtonCodes = BUTTON_PERMISSION_CODES.systemRole;
const { hasPermission } = usePermission();

const loading = ref(false);
const submitting = ref(false);
const assigning = ref(false);
const switchingRoleId = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const roleList = ref<RoleRecord[]>([]);

const roleFormRef = ref<FormInst | null>(null);
const showRoleDrawer = ref(false);
const isEditMode = ref(false);
const editingRoleId = ref('');
const roleForm = reactive<RoleFormState>({
  name: '',
  code: '',
  sort: 0,
  status: true,
  remark: ''
});

const roleFormRules: FormRules = {
  name: [
    {
      required: true,
      message: '请输入角色名称',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 30,
      message: '角色名称不能超过 30 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  code: [
    {
      required: true,
      message: '请输入角色编码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-z0-9_]{2,30}$/.test(value),
      message: '角色编码需为 2-30 位小写字母、数字或下划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  remark: [
    {
      validator: (_, value: string) => !value || value.trim().length <= 100,
      message: '备注不能超过 100 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ]
};

const showAssignMenuModal = ref(false);
const showAssignButtonModal = ref(false);
const showAssignDataScopeModal = ref(false);
const selectedRole = ref<RoleRecord | null>(null);
const checkedMenuIds = ref<Array<string | number>>([]);
const checkedButtonIds = ref<Array<string | number>>([]);
const reservedMenuIdsForButtonAssign = ref<number[]>([]);
const assignMenuKeyword = ref('');
const assignButtonKeyword = ref('');
const expandedMenuKeys = ref<Array<string | number>>([]);
const expandedButtonKeys = ref<Array<string | number>>([]);
const rawRoleMenuTree = ref<MenuRecord[]>([]);
const rawRoleButtonTree = ref<MenuRecord[]>([]);
const rawDepartmentTree = ref<DepartmentTreeRecord[]>([]);
const buttonTreeLoading = ref(false);
const dataScopeLoading = ref(false);
const dataScopeSubmitting = ref(false);
const dataScopeFormRef = ref<FormInst | null>(null);
const dataScopeForm = reactive<RoleDataScopeFormState>({
  dataScopeType: DATA_SCOPE_TYPES.TENANT,
  customDeptIds: []
});
const canCreateRole = computed(() => hasPermission(roleButtonCodes.create));
const canGrantRoleMenu = computed(() => hasPermission(roleButtonCodes.grant));
const canUpdateRole = computed(() => hasPermission(roleButtonCodes.update));
const canDeleteRole = computed(() => hasPermission(roleButtonCodes.delete));
const hasRoleActions = computed(() =>
  canGrantRoleMenu.value || canUpdateRole.value || canDeleteRole.value
);
const roleTableColumnCount = computed(() => hasRoleActions.value ? 7 : 6);
const summaryCards = computed<SummaryCard[]>(() => [
  {
    label: '\u89D2\u8272\u603B\u6570',
    value: total.value,
    helper: '\u8986\u76D6\u5F53\u524D\u67E5\u8BE2\u6761\u4EF6\u4E0B\u7684\u5168\u90E8\u89D2\u8272',
    tone: 'primary'
  },
  {
    label: '\u542F\u7528\u4E2D',
    value: roleList.value.filter(item => item.status).length,
    helper: '\u53EF\u6B63\u5E38\u53C2\u4E0E\u6388\u6743\u7684\u89D2\u8272\u6570\u91CF',
    tone: 'success'
  },
  {
    label: '\u5DF2\u586B\u5907\u6CE8',
    value: roleList.value.filter(item => Boolean(item.remark?.trim())).length,
    helper: '\u89D2\u8272\u8BF4\u660E\u66F4\u5B8C\u6574\uFF0C\u4FBF\u4E8E\u4EA4\u63A5\u548C\u5BA1\u8BA1',
    tone: 'info'
  },
  {
    label: '\u6700\u9AD8\u6392\u5E8F',
    value: roleList.value.reduce((max, item) => Math.max(max, item.sort), 0),
    helper: '\u7528\u4E8E\u611F\u77E5\u5F53\u524D\u89D2\u8272\u6392\u5E8F\u533A\u95F4',
    tone: 'warning'
  }
]);
const menuTreeOptions = computed<TreeOption[]>(() =>
  filterRoleMenuTreeByKeyword(rawRoleMenuTree.value, assignMenuKeyword.value).map(menuToTreeOption)
);
const buttonTreeOptions = computed<TreeOption[]>(() =>
  filterRoleButtonTreeByKeyword(rawRoleButtonTree.value, assignButtonKeyword.value).map(buttonToTreeOption)
);
const roleMenuIdSet = computed(() => new Set(collectRoleMenuIds(rawRoleMenuTree.value)));
const roleButtonIdSet = computed(() => new Set(collectRoleButtonIds(rawRoleButtonTree.value)));
const roleButtonCodeMap = computed(() => collectRoleButtonCodeMap(rawRoleButtonTree.value));
const roleMenuTreeStats = computed(() => countRoleMenuStats(rawRoleMenuTree.value));
const roleButtonTreeStats = computed(() => countRoleButtonStats(rawRoleButtonTree.value));
const checkedRoleMenuCount = computed(() =>
  checkedMenuIds.value.filter(item => roleMenuIdSet.value.has(Number(item))).length
);
const checkedRoleButtonCount = computed(() =>
  checkedButtonIds.value.filter(item => roleButtonIdSet.value.has(Number(item))).length
);
const checkedRoleButtonCodeList = computed(() =>
  checkedButtonIds.value
    .map(item => roleButtonCodeMap.value.get(Number(item)))
    .filter((code): code is string => Boolean(code))
);
const selectedRoleIsSuperAdmin = computed(() => isSuperAdminIdentity(selectedRole.value?.code));
const departmentTreeOptions = computed<TreeOption[]>(() => rawDepartmentTree.value.map(departmentToTreeOption));
const selectedDataScopeOption = computed(() =>
  DATA_SCOPE_OPTION_LIST.find(item => item.value === dataScopeForm.dataScopeType) || DATA_SCOPE_OPTION_LIST[1]
);
const selectedDataScopeDeptCount = computed(() => dataScopeForm.customDeptIds.length);
const currentTenant = computed(() => getCurrentTenantContext());
const currentTenantLabel = computed(() =>
  currentTenant.value?.tenantName || currentTenant.value?.tenantId || '未识别租户'
);

const dataScopeFormRules: FormRules = {
  customDeptIds: [
    {
      validator: () => {
        if (dataScopeForm.dataScopeType !== DATA_SCOPE_TYPES.CUSTOM) {
          return true;
        }

        return dataScopeForm.customDeptIds.length > 0;
      },
      message: '请选择至少一个自定义部门范围',
      trigger: [ 'change', 'blur' ]
    }
  ]
};

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function getSummaryCardClass(tone: SummaryCard['tone']) {
  return `summary-card summary-card--${tone}`;
}

function ensureRoleTenantAccess(role: RoleRecord, actionLabel: string) {
  if (belongsToCurrentTenant(role))
    return true;

  message.error(`当前租户上下文无法${actionLabel}角色“${role.name}”`);
  return false;
}

function menuToTreeOption(menu: MenuRecord): TreeOption {
  return {
    key: menu.id,
    label: `${menu.title} (${menu.path})`,
    children: menu.children?.map(menuToTreeOption)
  };
}

function buttonToTreeOption(menu: MenuRecord): TreeOption {
  const permissionKey = menu.key || menu.menuKey || '';

  if (menu.type === 3) {
    return {
      key: menu.id,
      label: permissionKey ? `${menu.title} (${permissionKey})` : menu.title
    };
  }

  return {
    key: menu.id,
    label: `${menu.title} (${menu.path})`,
    checkboxDisabled: true,
    children: menu.children?.map(buttonToTreeOption)
  };
}

function departmentToTreeOption(item: DepartmentTreeRecord): TreeOption {
  return {
    key: item.id,
    label: item.name,
    children: item.children?.map(departmentToTreeOption)
  };
}

async function ensureMenuTreeOptions() {
  if (rawRoleMenuTree.value.length)
    return;

  const { data } = await getMenuTreeApi();
  rawRoleMenuTree.value = filterAssignableRoleMenus(filterTreeRecordsByCurrentTenant(data, { allowShared: true }));
}

async function ensureButtonTreeOptions() {
  if (rawRoleButtonTree.value.length)
    return;

  const { data } = await getMenuTreeApi();
  rawRoleButtonTree.value = filterAssignableRoleButtons(filterTreeRecordsByCurrentTenant(data, { allowShared: true }));
}

async function ensureDepartmentTreeOptions() {
  if (rawDepartmentTree.value.length)
    return;

  const { data } = await getDepartmentTreeApi();
  rawDepartmentTree.value = filterTreeRecordsByCurrentTenant(data);
}

function filterAssignableRoleMenus(menus: MenuRecord[]) {
  return menus.reduce<MenuRecord[]>((result, menu) => {
    if (menu.type === 3)
      return result;

    result.push({
      ...menu,
      children: menu.children ? filterAssignableRoleMenus(menu.children) : []
    });
    return result;
  }, []);
}

function filterRoleMenuTreeByKeyword(menus: MenuRecord[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword)
    return menus;

  return menus.reduce<MenuRecord[]>((result, menu) => {
    const children = menu.children
      ? filterRoleMenuTreeByKeyword(menu.children, normalizedKeyword)
      : [];
    const matched = [
      menu.title,
      menu.name,
      menu.path,
      menu.key,
      menu.menuKey
    ].some(value => value?.toLowerCase().includes(normalizedKeyword));

    if (matched || children.length) {
      result.push({
        ...menu,
        children
      });
    }

    return result;
  }, []);
}

function filterAssignableRoleButtons(menus: MenuRecord[]) {
  return menus.reduce<MenuRecord[]>((result, menu) => {
    const children = menu.children ? filterAssignableRoleButtons(menu.children) : [];
    if (menu.type !== 3 && !children.length)
      return result;

    result.push({
      ...menu,
      children
    });
    return result;
  }, []);
}

function filterRoleButtonTreeByKeyword(menus: MenuRecord[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword)
    return menus;

  return menus.reduce<MenuRecord[]>((result, menu) => {
    const children = menu.children
      ? filterRoleButtonTreeByKeyword(menu.children, normalizedKeyword)
      : [];
    const matched = [
      menu.title,
      menu.name,
      menu.path,
      menu.key,
      menu.menuKey
    ].some(value => value?.toLowerCase().includes(normalizedKeyword));

    if (matched || children.length) {
      result.push({
        ...menu,
        children
      });
    }

    return result;
  }, []);
}

function collectRoleMenuIds(menus: MenuRecord[]) {
  return menus.flatMap(menu => [
    menu.id,
    ...(menu.children ? collectRoleMenuIds(menu.children) : [])
  ]);
}

function collectRoleButtonIds(menus: MenuRecord[]) {
  return menus.flatMap(menu => [
    ...(menu.type === 3 ? [ menu.id ] : []),
    ...(menu.children ? collectRoleButtonIds(menu.children) : [])
  ]);
}

function collectRoleButtonCodeMap(menus: MenuRecord[]) {
  return menus.reduce((map, menu) => {
    if (menu.type === 3) {
      const permissionKey = menu.key || menu.menuKey;
      if (permissionKey)
        map.set(menu.id, permissionKey);
    }

    if (menu.children?.length) {
      collectRoleButtonCodeMap(menu.children).forEach((value, key) => {
        map.set(key, value);
      });
    }

    return map;
  }, new Map<number, string>());
}

function countRoleMenuStats(menus: MenuRecord[]) {
  return menus.reduce(
    (stats, menu) => {
      if (menu.type === 1)
        stats.directoryCount += 1;
      else if (menu.type === 2)
        stats.menuCount += 1;

      if (menu.children?.length) {
        const childStats = countRoleMenuStats(menu.children);
        stats.directoryCount += childStats.directoryCount;
        stats.menuCount += childStats.menuCount;
      }

      return stats;
    },
    { directoryCount: 0, menuCount: 0 }
  );
}

function countRoleButtonStats(menus: MenuRecord[]) {
  return menus.reduce(
    (stats, menu) => {
      if (menu.type === 3)
        stats.buttonCount += 1;
      else
        stats.groupCount += 1;

      if (menu.children?.length) {
        const childStats = countRoleButtonStats(menu.children);
        stats.groupCount += childStats.groupCount;
        stats.buttonCount += childStats.buttonCount;
      }

      return stats;
    },
    { groupCount: 0, buttonCount: 0 }
  );
}

function collectExpandedTreeKeys(options: TreeOption[]) {
  return options.flatMap(option => [
    option.key!,
    ...(option.children?.length ? collectExpandedTreeKeys(option.children) : [])
  ]);
}

function expandAllMenus() {
  expandedMenuKeys.value = collectExpandedTreeKeys(menuTreeOptions.value);
}

function collapseAllMenus() {
  expandedMenuKeys.value = [];
}

function clearCheckedMenus() {
  if (selectedRoleIsSuperAdmin.value)
    return;

  checkedMenuIds.value = [];
}

function expandAllButtons() {
  expandedButtonKeys.value = collectExpandedTreeKeys(buttonTreeOptions.value);
}

function collapseAllButtons() {
  expandedButtonKeys.value = [];
}

function clearCheckedButtons() {
  if (selectedRoleIsSuperAdmin.value)
    return;

  checkedButtonIds.value = [];
}

function fillAllMenuPermissions() {
  checkedMenuIds.value = collectRoleMenuIds(rawRoleMenuTree.value);
}

function fillAllButtonPermissions() {
  checkedButtonIds.value = collectRoleButtonIds(rawRoleButtonTree.value);
}

function resetDataScopeForm() {
  dataScopeForm.dataScopeType = DATA_SCOPE_TYPES.TENANT;
  dataScopeForm.customDeptIds = [];
}

function resetRoleForm() {
  editingRoleId.value = '';
  roleForm.name = '';
  roleForm.code = '';
  roleForm.sort = 0;
  roleForm.status = true;
  roleForm.remark = '';
}

async function fetchRoles(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getRolePageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    const scopedRecords = filterRecordsByCurrentTenant(data.records);

    page.value = data.current;
    pageSize.value = data.size;
    total.value = scopedRecords.length === data.records.length ? data.total : scopedRecords.length;
    roleList.value = scopedRecords;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchRoles(1);
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  fetchRoles(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchRoles(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchRoles(1);
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetRoleForm();
  showRoleDrawer.value = true;
}

async function openEditDrawer(role: RoleRecord) {
  if (!ensureRoleTenantAccess(role, '编辑'))
    return;

  isEditMode.value = true;
  resetRoleForm();
  editingRoleId.value = role.id;
  showRoleDrawer.value = true;

  const { data } = await getRoleDetailApi(role.id);
  if (!ensureRoleTenantAccess(data, '编辑'))
    return;

  roleForm.name = data.name;
  roleForm.code = data.code;
  roleForm.sort = data.sort;
  roleForm.status = data.status;
  roleForm.remark = data.remark || '';
}

function closeRoleDrawer() {
  showRoleDrawer.value = false;
  resetRoleForm();
  roleFormRef.value?.restoreValidation();
}

function isRoleStatusSwitchDisabled(role: RoleRecord) {
  return !canUpdateRole.value || isSuperAdminIdentity(role.code);
}

async function submitRoleForm() {
  await roleFormRef.value?.validate();

  const payload = {
    name: roleForm.name.trim(),
    code: roleForm.code.trim(),
    sort: Number(roleForm.sort ?? 0),
    status: roleForm.status,
    remark: roleForm.remark.trim() || undefined
  };

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateRoleApi(editingRoleId.value, {
        ...payload,
        remark: payload.remark ?? null
      });
      message.success('角色信息已更新');
    }
    else {
      await createRoleApi(payload);
      message.success('角色已创建');
    }

    closeRoleDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await fetchRoles(nextPage);
  }
  finally {
    submitting.value = false;
  }
}

async function handleToggleRoleStatus(role: RoleRecord, value: boolean) {
  if (isRoleStatusSwitchDisabled(role))
    return;
  if (!ensureRoleTenantAccess(role, value ? '启用' : '停用'))
    return;

  const actionText = value ? '启用' : '停用';
  const confirmed = await confirmAction({
    title: `${actionText}角色`,
    content: `确认${actionText}角色“${role.name}”吗？`
  });

  if (!confirmed)
    return;

  switchingRoleId.value = role.id;
  try {
    await updateRoleApi(role.id, { status: value });
    roleList.value = roleList.value.map(item =>
      item.id === role.id
        ? { ...item, status: value }
        : item
    );
    message.success(`已${actionText}角色`);
  }
  finally {
    switchingRoleId.value = '';
  }
}

async function handleDeleteRole(role: RoleRecord) {
  if (!ensureRoleTenantAccess(role, '删除'))
    return;

  const confirmed = await confirmAction({
    title: '删除角色',
    content: `确认删除角色“${role.name}”吗？`
  });

  if (!confirmed)
    return;

  await deleteRoleApi(role.id);
  message.success('角色已删除');
  const nextPage = roleList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await fetchRoles(nextPage);
}

async function openAssignMenu(role: RoleRecord) {
  if (!ensureRoleTenantAccess(role, '分配菜单'))
    return;

  selectedRole.value = role;
  showAssignMenuModal.value = true;
  assignMenuKeyword.value = '';
  await ensureMenuTreeOptions();

  if (isSuperAdminIdentity(role.code)) {
    fillAllMenuPermissions();
    expandAllMenus();
    return;
  }

  const { data } = await getRoleMenusApi(role.id);
  checkedMenuIds.value = data.menuIds.filter(item => roleMenuIdSet.value.has(item));
  expandAllMenus();
}

async function openAssignButton(role: RoleRecord) {
  if (!ensureRoleTenantAccess(role, '配置按钮权限'))
    return;

  selectedRole.value = role;
  showAssignButtonModal.value = true;
  assignButtonKeyword.value = '';
  buttonTreeLoading.value = true;
  try {
    await ensureButtonTreeOptions();

    if (isSuperAdminIdentity(role.code)) {
      reservedMenuIdsForButtonAssign.value = [ ...roleMenuIdSet.value ];
      fillAllButtonPermissions();
      expandAllButtons();
      return;
    }

    const { data } = await getRoleMenusApi(role.id);
    reservedMenuIdsForButtonAssign.value = data.menuIds.filter(item => roleMenuIdSet.value.has(item));
    const checkedIds = new Set<number>([
      ...data.menuIds.filter(item => roleButtonIdSet.value.has(item)),
      ...data.menus.filter(item => item.type === 3).map(item => item.id)
    ]);
    checkedButtonIds.value = [ ...checkedIds ];
    expandAllButtons();
  }
  finally {
    buttonTreeLoading.value = false;
  }
}

async function openAssignDataScope(role: RoleRecord) {
  if (!ensureRoleTenantAccess(role, '配置数据权限'))
    return;

  selectedRole.value = role;
  showAssignDataScopeModal.value = true;
  resetDataScopeForm();
  await ensureDepartmentTreeOptions();

  if (isSuperAdminIdentity(role.code)) {
    dataScopeForm.dataScopeType = DATA_SCOPE_TYPES.ALL;
    dataScopeFormRef.value?.restoreValidation();
    return;
  }

  dataScopeLoading.value = true;
  try {
    const { data } = await getRoleDataScopeApi(role.id);
    dataScopeForm.dataScopeType = normalizeDataScopeType(data.dataScopeType);
    dataScopeForm.customDeptIds = Array.isArray(data.customDeptIds)
      ? data.customDeptIds
      : [];
    dataScopeFormRef.value?.restoreValidation();
  }
  finally {
    dataScopeLoading.value = false;
  }
}

function closeAssignMenu() {
  showAssignMenuModal.value = false;
  selectedRole.value = null;
  assignMenuKeyword.value = '';
  expandedMenuKeys.value = [];
  checkedMenuIds.value = [];
}

function closeAssignButton() {
  showAssignButtonModal.value = false;
  selectedRole.value = null;
  assignButtonKeyword.value = '';
  reservedMenuIdsForButtonAssign.value = [];
  expandedButtonKeys.value = [];
  checkedButtonIds.value = [];
}

function closeAssignDataScope() {
  showAssignDataScopeModal.value = false;
  selectedRole.value = null;
  resetDataScopeForm();
  dataScopeFormRef.value?.restoreValidation();
}

async function submitAssignMenu() {
  if (!selectedRole.value)
    return;

  if (selectedRoleIsSuperAdmin.value) {
    message.info('超级管理员角色默认拥有全部菜单权限，无需单独保存');
    return;
  }

  assigning.value = true;
  try {
    await assignRoleMenusApi(
      selectedRole.value.id,
      checkedMenuIds.value.map(item => Number(item))
    );
    message.success('角色菜单权限保存成功');
    closeAssignMenu();
  }
  finally {
    assigning.value = false;
  }
}

async function submitAssignButton() {
  if (!selectedRole.value)
    return;

  if (selectedRoleIsSuperAdmin.value) {
    message.info('超级管理员角色默认拥有全部按钮权限，无需单独保存');
    return;
  }

  const nextMenuIds = [ ...new Set([
    ...reservedMenuIdsForButtonAssign.value,
    ...checkedButtonIds.value.map(item => Number(item))
  ]) ];

  assigning.value = true;
  try {
    await assignRoleMenusApi(selectedRole.value.id, nextMenuIds);
    message.success('角色按钮权限保存成功');
    closeAssignButton();
  }
  finally {
    assigning.value = false;
  }
}

async function submitAssignDataScope() {
  if (!selectedRole.value)
    return;

  if (selectedRoleIsSuperAdmin.value) {
    message.info('超级管理员角色默认拥有全部数据权限，无需单独保存');
    return;
  }

  await dataScopeFormRef.value?.validate();

  dataScopeSubmitting.value = true;
  try {
    await saveRoleDataScopeApi(selectedRole.value.id, {
      dataScopeType: dataScopeForm.dataScopeType,
      customDeptIds: dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.CUSTOM
        ? [ ...dataScopeForm.customDeptIds ]
        : []
    });
    message.success('角色数据权限保存成功');
    closeAssignDataScope();
  }
  finally {
    dataScopeSubmitting.value = false;
  }
}

onMounted(() => {
  fetchRoles();
});

watch(menuTreeOptions, (options) => {
  if (!showAssignMenuModal.value)
    return;

  expandedMenuKeys.value = collectExpandedTreeKeys(options);
});

watch(buttonTreeOptions, (options) => {
  if (!showAssignButtonModal.value)
    return;

  expandedButtonKeys.value = collectExpandedTreeKeys(options);
});

watch(
  () => dataScopeForm.dataScopeType,
  (value) => {
    if (value !== DATA_SCOPE_TYPES.CUSTOM) {
      dataScopeForm.customDeptIds = [];
    }

    if (showAssignDataScopeModal.value) {
      dataScopeFormRef.value?.restoreValidation();
    }
  }
);
</script>

<template>
  <div class="crud-page">
    <section class="summary-grid">
      <article
        v-for="card in summaryCards"
        :key="card.label"
        :class="getSummaryCardClass(card.tone)"
      >
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
        <small class="summary-card__helper">{{ card.helper }}</small>
      </article>
    </section>

    <div class="tenant-scope-banner">
      <strong>当前租户：</strong>
      <span>{{ currentTenantLabel }}</span>
      <span>角色列表与授权入口会优先按当前租户上下文做前端兜底过滤。</span>
    </div>

    <div class="toolbar">
      <div class="toolbar-item toolbar-item--wide">
        <div class="toolbar-label">
          关键字
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入角色名称或编码"
          @keyup.enter="handleSearch"
        />
      </div>

      <n-button type="primary" @click="handleSearch">
        <template #icon>
          <Icon icon="simple-line-icons:magnifier" />
        </template>
        查询
      </n-button>
      <n-button ghost type="primary" @click="handleReset">
        <template #icon>
          <Icon icon="system-uicons:reset" />
        </template>
        重置
      </n-button>
    </div>

    <div class="content-card">
      <div class="content-actions">
        <n-button
          v-if="canCreateRole"
          v-permission="roleButtonCodes.create"
          type="primary"
          @click="openCreateDrawer"
        >
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增角色
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>角色编码</th>
              <th>状态</th>
              <th>排序</th>
              <th>备注</th>
              <th>更新时间</th>
              <th v-if="hasRoleActions">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in roleList" :key="item.id">
              <td>
                <div class="primary-text">
                  {{ item.name }}
                </div>
                <div class="secondary-text">
                  ID: {{ item.id }}
                </div>
              </td>
              <td>{{ item.code }}</td>
              <td>
                <div class="status-field">
                  <n-switch
                    :value="item.status"
                    size="small"
                    :loading="switchingRoleId === item.id"
                    :disabled="isRoleStatusSwitchDisabled(item)"
                    @update:value="value => handleToggleRoleStatus(item, value)"
                  >
                    <template #checked>
                      启用
                    </template>
                    <template #unchecked>
                      停用
                    </template>
                  </n-switch>
                  <span
                    class="status-text"
                    :class="item.status ? 'status-text--success' : 'status-text--warning'"
                  >
                    {{ item.status ? '启用' : '停用' }}
                  </span>
                </div>
                <div v-if="isSuperAdminIdentity(item.code)" class="secondary-text">
                  超级管理员角色默认保留启用
                </div>
              </td>
              <td>{{ item.sort }}</td>
              <td>{{ item.remark || '-' }}</td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td v-if="hasRoleActions" class="operation-cell">
                <div class="operation-actions">
                  <n-button
                    v-if="canGrantRoleMenu"
                    v-permission="roleButtonCodes.grant"
                    quaternary
                    type="primary"
                    @click="openAssignMenu(item)"
                  >
                    分配菜单
                  </n-button>
                  <n-button
                    v-if="canGrantRoleMenu"
                    v-permission="roleButtonCodes.grant"
                    quaternary
                    type="primary"
                    @click="openAssignButton(item)"
                  >
                    按钮权限
                  </n-button>
                  <n-button
                    v-if="canGrantRoleMenu"
                    v-permission="roleButtonCodes.grant"
                    quaternary
                    type="primary"
                    @click="openAssignDataScope(item)"
                  >
                    数据权限
                  </n-button>
                  <n-button
                    v-if="canUpdateRole"
                    v-permission="roleButtonCodes.update"
                    quaternary
                    type="primary"
                    @click="openEditDrawer(item)"
                  >
                    编辑
                  </n-button>
                  <n-button
                    v-if="canDeleteRole"
                    v-permission="roleButtonCodes.delete"
                    quaternary
                    type="error"
                    @click="handleDeleteRole(item)"
                  >
                    删除
                  </n-button>
                </div>
              </td>
            </tr>
            <tr v-if="!roleList.length">
              <td :colspan="roleTableColumnCount">
                <n-empty description="暂无角色数据" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-spin>

      <div class="pagination-wrap">
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          show-size-picker
          :item-count="total"
          :page-sizes="[10, 20, 50, 100]"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </div>
  </div>

  <n-modal v-model:show="showAssignMenuModal" preset="card" title="分配菜单" style="width: 720px;">
    <div class="assign-summary">
      当前角色：{{ selectedRole?.name || '-' }}
    </div>

    <div class="assign-panel">
      <div class="assign-panel__toolbar">
        <n-input
          v-model:value="assignMenuKeyword"
          clearable
          placeholder="搜索菜单名称、路由名称或访问路径"
        >
          <template #prefix>
            <Icon icon="simple-line-icons:magnifier" />
          </template>
        </n-input>
        <n-button quaternary type="primary" @click="expandAllMenus">
          展开全部
        </n-button>
        <n-button quaternary @click="collapseAllMenus">
          收起全部
        </n-button>
        <n-button quaternary type="warning" @click="clearCheckedMenus">
          <template v-if="selectedRoleIsSuperAdmin">
            保留全量
          </template>
          <template v-else>
            清空勾选
          </template>
        </n-button>
      </div>

      <div class="assign-panel__stats">
        <n-tag type="info">
          目录 {{ roleMenuTreeStats.directoryCount }}
        </n-tag>
        <n-tag type="success">
          菜单 {{ roleMenuTreeStats.menuCount }}
        </n-tag>
        <n-tag type="primary">
          已选 {{ checkedRoleMenuCount }}
        </n-tag>
      </div>
    </div>

    <div v-if="selectedRoleIsSuperAdmin" class="assign-hint">
      超级管理员角色默认直通全部菜单权限，当前为全量预览状态。
    </div>

    <n-spin :show="assigning">
      <n-tree
        v-model:checked-keys="checkedMenuIds"
        v-model:expanded-keys="expandedMenuKeys"
        block-line
        cascade
        checkable
        check-on-click
        expand-on-click
        :data="menuTreeOptions"
      />
    </n-spin>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="closeAssignMenu">
          取消
        </n-button>
        <n-button type="primary" :loading="assigning" :disabled="selectedRoleIsSuperAdmin" @click="submitAssignMenu">
          {{ selectedRoleIsSuperAdmin ? '无需保存' : '保存' }}
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-modal v-model:show="showAssignButtonModal" preset="card" title="按钮权限树" style="width: 760px;">
    <div class="assign-summary">
      当前角色：{{ selectedRole?.name || '-' }}
    </div>

    <div class="assign-panel">
      <div class="assign-panel__toolbar">
        <n-input
          v-model:value="assignButtonKeyword"
          clearable
          placeholder="搜索按钮名称、权限标识或所属路径"
        >
          <template #prefix>
            <Icon icon="simple-line-icons:magnifier" />
          </template>
        </n-input>
        <n-button quaternary type="primary" @click="expandAllButtons">
          展开全部
        </n-button>
        <n-button quaternary @click="collapseAllButtons">
          收起全部
        </n-button>
        <n-button quaternary type="warning" @click="clearCheckedButtons">
          <template v-if="selectedRoleIsSuperAdmin">
            保留全量
          </template>
          <template v-else>
            清空勾选
          </template>
        </n-button>
      </div>

      <div class="assign-panel__stats">
        <n-tag type="info">
          分组 {{ roleButtonTreeStats.groupCount }}
        </n-tag>
        <n-tag type="success">
          按钮 {{ roleButtonTreeStats.buttonCount }}
        </n-tag>
        <n-tag type="primary">
          已选 {{ checkedRoleButtonCount }}
        </n-tag>
      </div>
    </div>

    <div class="assign-hint">
      <template v-if="selectedRoleIsSuperAdmin">
        超级管理员角色默认直通全部按钮权限，当前为全量预览状态。
      </template>
      <template v-else>
        保存按钮权限时会自动保留当前菜单授权，仅更新本次勾选的按钮节点。
      </template>
    </div>

    <n-spin :show="buttonTreeLoading">
      <template v-if="buttonTreeOptions.length">
        <n-tree
          v-model:checked-keys="checkedButtonIds"
          v-model:expanded-keys="expandedButtonKeys"
          block-line
          cascade
          checkable
          check-on-click
          expand-on-click
          :data="buttonTreeOptions"
        />
      </template>
      <n-empty v-else description="暂无可分配的按钮权限节点" />
    </n-spin>

    <div v-if="checkedRoleButtonCodeList.length" class="checked-code-panel">
      <div class="checked-code-panel__title">
        已选权限码预览
      </div>
      <n-space>
        <n-tag v-for="code in checkedRoleButtonCodeList.slice(0, 12)" :key="code" type="warning">
          {{ code }}
        </n-tag>
      </n-space>
      <div v-if="checkedRoleButtonCodeList.length > 12" class="checked-code-panel__more">
        仅预览前 12 项，当前共 {{ checkedRoleButtonCodeList.length }} 项。
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="closeAssignButton">
          取消
        </n-button>
        <n-button type="primary" :loading="assigning" :disabled="selectedRoleIsSuperAdmin" @click="submitAssignButton">
          {{ selectedRoleIsSuperAdmin ? '无需保存' : '保存' }}
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-drawer v-model:show="showRoleDrawer" :width="520" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑角色' : '新增角色'">
      <n-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-placement="top">
        <div class="lc-form-stack">
          <section class="lc-form-section">
            <div class="lc-form-section__header">
              <div>
                <p class="lc-form-section__eyebrow">
                  Role
                </p>
                <h3 class="lc-form-section__title">
                  {{ isEditMode ? '\u7f16\u8f91\u89d2\u8272' : '\u521b\u5efa\u89d2\u8272' }}
                </h3>
                <p class="lc-form-section__description">
                  {{ '\u4f7f\u89d2\u8272\u547d\u540d\uff0c\u72b6\u6001\u548c\u5907\u6ce8\u4fdd\u6301\u53ef\u7406\u89e3\uff0c\u65b9\u4fbf\u540e\u7eed\u83dc\u5355\u4e0e\u6309\u94ae\u6388\u6743\u3002' }}
                </p>
              </div>
            </div>
            <n-form-item label="角色名称" path="name">
              <n-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
            </n-form-item>
            <n-form-item label="角色编码" path="code">
              <n-input v-model:value="roleForm.code" placeholder="请输入角色编码" />
            </n-form-item>
            <n-form-item label="排序" path="sort">
              <n-input-number v-model:value="roleForm.sort" class="w-full" :min="0" />
            </n-form-item>
            <n-form-item label="状态" path="status">
              <n-switch v-model:value="roleForm.status">
                <template #checked>
                  启用
                </template>
                <template #unchecked>
                  停用
                </template>
              </n-switch>
            </n-form-item>
            <n-form-item label="备注" path="remark">
              <n-input
                v-model:value="roleForm.remark"
                type="textarea"
                placeholder="请输入备注"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </n-form-item>
          </section>
        </div>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeRoleDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitRoleForm">
            保存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>

  <n-modal v-model:show="showAssignDataScopeModal" preset="card" title="数据权限" style="width: 760px;">
    <div class="assign-summary">
      当前角色：{{ selectedRole?.name || '-' }}
    </div>

    <n-spin :show="dataScopeLoading">
      <n-form ref="dataScopeFormRef" :model="dataScopeForm" :rules="dataScopeFormRules" label-placement="top">
        <div class="scope-panel">
          <div class="scope-panel__intro">
            <strong>{{ DATA_SCOPE_LABEL_MAP[dataScopeForm.dataScopeType] }}</strong>
            <span>{{ selectedDataScopeOption.description }}</span>
          </div>

          <div class="scope-option-list">
            <button
              v-for="item in DATA_SCOPE_OPTION_LIST"
              :key="item.value"
              type="button"
              class="scope-option-card"
              :class="{ 'scope-option-card--active': dataScopeForm.dataScopeType === item.value }"
              :disabled="selectedRoleIsSuperAdmin"
              @click="dataScopeForm.dataScopeType = item.value"
            >
              <strong>{{ item.label }}</strong>
              <span>{{ item.description }}</span>
            </button>
          </div>

          <div class="scope-meta">
            <n-tag type="info">
              当前范围 {{ DATA_SCOPE_LABEL_MAP[dataScopeForm.dataScopeType] }}
            </n-tag>
            <n-tag v-if="dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.CUSTOM" type="success">
              已选部门 {{ selectedDataScopeDeptCount }}
            </n-tag>
            <n-tag v-if="dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.SELF" type="warning">
              自动透传当前用户 ID
            </n-tag>
          </div>

          <div v-if="selectedRoleIsSuperAdmin" class="assign-hint">
            超级管理员角色默认直通全部数据权限，当前为全量预览状态。
          </div>

          <n-form-item
            v-if="dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.CUSTOM"
            label="自定义部门范围"
            path="customDeptIds"
          >
            <div class="scope-select-wrap">
              <n-tree-select
                v-model:value="dataScopeForm.customDeptIds"
                multiple
                clearable
                filterable
                checkable
                default-expand-all
                :options="departmentTreeOptions"
                placeholder="请选择可访问的部门范围"
              />
            </div>
          </n-form-item>

          <div v-if="dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.SELF" class="assign-hint">
            本人范围下，列表查询会自动携带当前登录人的用户 ID，由后端按本人数据过滤。
          </div>

          <div v-if="dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.DEPT || dataScopeForm.dataScopeType === DATA_SCOPE_TYPES.DEPT_AND_CHILD" class="assign-hint">
            部门范围下，列表查询会自动携带当前登录人的用户 ID，由后端换算所属部门后过滤数据。
          </div>
        </div>
      </n-form>
    </n-spin>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="closeAssignDataScope">
          取消
        </n-button>
        <n-button
          type="primary"
          :loading="dataScopeSubmitting"
          :disabled="selectedRoleIsSuperAdmin"
          @click="submitAssignDataScope"
        >
          {{ selectedRoleIsSuperAdmin ? '无需保存' : '保存' }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped lang="less">
.crud-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.tenant-scope-banner {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  color: var(--text-color-2);
  background-color: var(--table-color-hover);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-item {
  display: flex;
  align-items: center;
  width: 360px;
}

.toolbar-item--wide {
  width: 420px;
}

.toolbar-label {
  width: 72px;
  flex-shrink: 0;
}

.content-card {
  min-height: calc(100vh - 236px);
}

.content-actions {
  margin-bottom: 16px;
}

.primary-text {
  font-weight: 600;
}

.secondary-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-color-2);
}

.status-field {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.status-text {
  font-size: 13px;
  font-weight: 600;
}

.status-text--success {
  color: var(--success-color, #18a058);
}

.status-text--warning {
  color: var(--warning-color, #f0a020);
}

@import '@/styles/table-operation.less';

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.assign-summary {
  margin-bottom: 16px;
  color: var(--text-color-2);
}

.assign-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.assign-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assign-panel__toolbar :deep(.n-input) {
  flex: 1;
}

.assign-panel__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assign-hint {
  margin-bottom: 16px;
  padding: 12px 14px;
  color: var(--text-color-2);
  background-color: var(--table-color-hover);
  border-radius: 8px;
}

.checked-code-panel {
  margin-top: 16px;
  padding: 14px 16px;
  background-color: var(--table-color-hover);
  border-radius: 8px;
}

.checked-code-panel__title {
  margin-bottom: 12px;
  font-weight: 600;
}

.checked-code-panel__more {
  margin-top: 12px;
  color: var(--text-color-2);
}

.scope-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scope-panel__intro {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scope-panel__intro strong {
  font-size: 16px;
}

.scope-panel__intro span {
  color: var(--text-color-2);
  line-height: 1.7;
}

.scope-option-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.scope-option-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  text-align: left;
  border: 1px solid var(--lc-border, rgba(148, 163, 184, 0.2));
  border-radius: 16px;
  background: var(--lc-surface, var(--card-color));
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.scope-option-card strong {
  color: var(--text-color-1);
}

.scope-option-card span {
  color: var(--text-color-2);
  font-size: 13px;
  line-height: 1.7;
}

.scope-option-card:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--primary-color);
}

.scope-option-card--active {
  border-color: var(--primary-color);
  box-shadow: 0 12px 30px rgba(15, 118, 110, 0.12);
}

.scope-option-card:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.scope-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.scope-select-wrap {
  width: 100%;
}

.scope-select-wrap :deep(.n-tree-select) {
  width: 100%;
}

.modal-footer,
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .assign-panel__toolbar {
    flex-wrap: wrap;
  }

  .scope-option-list {
    grid-template-columns: 1fr;
  }

  .toolbar-item,
  .toolbar-item--wide {
    width: 100%;
  }
}
</style>
