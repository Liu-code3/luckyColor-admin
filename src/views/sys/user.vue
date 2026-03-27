<script setup lang="ts">
import type { FormInst, FormRules, TreeOption } from 'naive-ui';
import type { DepartmentTreeRecord, RoleRecord, UserRecord } from '@/api';
import { Icon } from '@iconify/vue';
import {
  assignUserRolesApi,
  createUserApi,
  deleteUserApi,

  getDepartmentTreeApi,
  getRolePageApi,
  getUserDetailApi,
  getUserPageApi,
  getUserRolesApi,

  updateUserApi

} from '@/api';
import { usePermission } from '@/composables/use-permission';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { getCurrentTenantContext } from '@/utils/auth';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';
import { belongsToCurrentTenant, filterRecordsByCurrentTenant, filterTreeRecordsByCurrentTenant } from '@/utils/tenant-scope';

defineOptions({
  name: 'SystemUser'
});

interface UserFormState {
  username: string;
  password: string;
  nickname: string;
  status: boolean;
  departmentId: number | null;
}

interface ResetPasswordFormState {
  password: string;
  confirmPassword: string;
}

interface SummaryCard {
  label: string;
  value: number;
  helper: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

interface ImportUserRow {
  lineNo: number;
  username: string;
  password: string;
  nickname: string;
  departmentId: number | null;
  status: boolean;
}

const userButtonCodes = BUTTON_PERMISSION_CODES.systemUser;
const { hasPermission } = usePermission();

const loading = ref(false);
const submitting = ref(false);
const assigning = ref(false);
const importing = ref(false);
const passwordSubmitting = ref(false);
const departmentTreeLoading = ref(false);
const switchLoadingUserId = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const userList = ref<UserRecord[]>([]);
const selectedUserIds = ref<string[]>([]);
const rawDepartmentTree = ref<DepartmentTreeRecord[]>([]);

const userFormRef = ref<FormInst | null>(null);
const resetPasswordFormRef = ref<FormInst | null>(null);
const importInputRef = ref<HTMLInputElement | null>(null);
const showUserDrawer = ref(false);
const showAssignRoleModal = ref(false);
const showResetPasswordModal = ref(false);
const showImportModal = ref(false);
const isEditMode = ref(false);
const editingUserId = ref('');
const selectedUser = ref<UserRecord | null>(null);
const resetPasswordUser = ref<UserRecord | null>(null);
const roleOptions = ref<RoleRecord[]>([]);
const selectedRoleIds = ref<string[]>([]);
const importRows = ref<ImportUserRow[]>([]);

const userForm = reactive<UserFormState>({
  username: '',
  password: '',
  nickname: '',
  status: true,
  departmentId: null
});

const resetPasswordForm = reactive<ResetPasswordFormState>({
  password: '',
  confirmPassword: ''
});

const canCreateUser = computed(() => hasPermission(userButtonCodes.create));
const canAssignUserRole = computed(() => hasPermission(userButtonCodes.assign));
const canUpdateUser = computed(() => hasPermission(userButtonCodes.update));
const canDeleteUser = computed(() => hasPermission(userButtonCodes.delete));
const hasUserActions = computed(() =>
  canAssignUserRole.value || canUpdateUser.value || canDeleteUser.value
);
const userTableColumnCount = computed(() => hasUserActions.value ? 7 : 6);
const enabledUserCount = computed(() => userList.value.filter(item => item.status !== false).length);
const selectedDepartmentCount = computed(() =>
  new Set(
    userList.value
      .map(item => item.departmentId)
      .filter((value): value is number => typeof value === 'number')
  ).size
);
const summaryCards = computed<SummaryCard[]>(() => [
  {
    label: '用户总数',
    value: total.value,
    helper: '基于当前筛选条件的总记录数',
    tone: 'primary'
  },
  {
    label: '当前启用',
    value: enabledUserCount.value,
    helper: '本页状态正常、可登录的用户数量',
    tone: 'success'
  },
  {
    label: '已选记录',
    value: selectedUserIds.value.length,
    helper: selectedUserIds.value.length ? '可执行批量删除' : '当前未勾选任何用户',
    tone: 'warning'
  },
  {
    label: '涉及部门',
    value: selectedDepartmentCount.value,
    helper: '帮助快速感知当前结果集的组织覆盖',
    tone: 'info'
  }
]);
const allRowsSelected = computed(() =>
  !!userList.value.length && userList.value.every(item => selectedUserIds.value.includes(item.id))
);
const partiallySelected = computed(() =>
  selectedUserIds.value.length > 0 && !allRowsSelected.value
);
const departmentTreeOptions = computed<TreeOption[]>(() =>
  rawDepartmentTree.value.map(departmentToTreeOption)
);
const departmentLabelMap = computed(() => collectDepartmentLabelMap(rawDepartmentTree.value));
const availableDepartmentIdSet = computed(() => new Set(collectDepartmentIds(rawDepartmentTree.value)));
const currentTenant = computed(() => getCurrentTenantContext());
const currentTenantLabel = computed(() =>
  currentTenant.value?.tenantName || currentTenant.value?.tenantId || '未识别租户'
);

const userFormRules = computed<FormRules>(() => ({
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^\w{3,20}$/.test(value),
      message: '用户名需为 3-20 位字母、数字或下划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  password: [
    {
      required: !isEditMode.value,
      message: '请输入密码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => !value || value.trim().length >= 6,
      message: '密码至少 6 位',
      trigger: [ 'blur', 'input' ]
    }
  ],
  nickname: [
    {
      validator: (_, value: string) => !value || value.trim().length <= 20,
      message: '昵称不能超过 20 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ]
}));

const resetPasswordRules = computed<FormRules>(() => ({
  password: [
    {
      required: true,
      message: '请输入新密码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length >= 6,
      message: '新密码至少 6 位',
      trigger: [ 'blur', 'input' ]
    }
  ],
  confirmPassword: [
    {
      required: true,
      message: '请再次输入新密码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim() === resetPasswordForm.password.trim(),
      message: '两次输入的密码不一致',
      trigger: [ 'blur', 'input' ]
    }
  ]
}));

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function isWithinDays(value: string | null | undefined, days: number) {
  if (!value)
    return false;

  const diff = Date.now() - new Date(value).getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function isUserEnabled(user: UserRecord) {
  return user.status !== false;
}

function getSummaryCardClass(tone: SummaryCard['tone']) {
  return `summary-card summary-card--${tone}`;
}

function departmentToTreeOption(item: DepartmentTreeRecord): TreeOption {
  return {
    key: item.id,
    label: item.name,
    children: item.children?.map(departmentToTreeOption)
  };
}

function collectDepartmentLabelMap(tree: DepartmentTreeRecord[]) {
  return tree.reduce((map, item) => {
    map.set(item.id, item.name);
    if (item.children?.length) {
      collectDepartmentLabelMap(item.children).forEach((name, id) => {
        map.set(id, name);
      });
    }
    return map;
  }, new Map<number, string>());
}

function collectDepartmentIds(tree: DepartmentTreeRecord[]) {
  return tree.flatMap(item => [
    item.id,
    ...(item.children?.length ? collectDepartmentIds(item.children) : [])
  ]);
}

function getDepartmentName(user: UserRecord) {
  if (user.departmentName?.trim())
    return user.departmentName;

  if (typeof user.departmentId === 'number') {
    return departmentLabelMap.value.get(user.departmentId) || `部门 ${user.departmentId}`;
  }

  return '未设置';
}

function ensureUserTenantAccess(user: UserRecord, actionLabel: string) {
  if (belongsToCurrentTenant(user))
    return true;

  message.error(`当前租户上下文无法${actionLabel}用户“${user.username}”`);
  return false;
}

function resetUserForm() {
  editingUserId.value = '';
  userForm.username = '';
  userForm.password = '';
  userForm.nickname = '';
  userForm.status = true;
  userForm.departmentId = null;
}

function resetPasswordState() {
  resetPasswordUser.value = null;
  resetPasswordForm.password = '';
  resetPasswordForm.confirmPassword = '';
}

function clearSelectedUsers() {
  selectedUserIds.value = [];
}

async function ensureDepartmentTreeOptions() {
  if (rawDepartmentTree.value.length || departmentTreeLoading.value)
    return;

  departmentTreeLoading.value = true;
  try {
    const { data } = await getDepartmentTreeApi();
    rawDepartmentTree.value = filterTreeRecordsByCurrentTenant(data);
  }
  finally {
    departmentTreeLoading.value = false;
  }
}

async function fetchUsers(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getUserPageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    const scopedRecords = filterRecordsByCurrentTenant(data.records);

    page.value = data.current;
    pageSize.value = data.size;
    total.value = scopedRecords.length === data.records.length ? data.total : scopedRecords.length;
    userList.value = scopedRecords;
    selectedUserIds.value = selectedUserIds.value.filter(id => scopedRecords.some(item => item.id === id));
  }
  finally {
    loading.value = false;
  }
}

async function loadRoleOptions() {
  if (roleOptions.value.length)
    return;

  const { data } = await getRolePageApi({
    page: 1,
    size: 200
  });
  roleOptions.value = filterRecordsByCurrentTenant(data.records);
}

function handleSearch() {
  page.value = 1;
  clearSelectedUsers();
  fetchUsers(1);
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  clearSelectedUsers();
  fetchUsers(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  clearSelectedUsers();
  fetchUsers(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  clearSelectedUsers();
  fetchUsers(1);
}

function toggleRowSelection(id: string, checked: boolean) {
  if (checked) {
    if (!selectedUserIds.value.includes(id))
      selectedUserIds.value = [ ...selectedUserIds.value, id ];
    return;
  }

  selectedUserIds.value = selectedUserIds.value.filter(item => item !== id);
}

function toggleSelectAll(checked: boolean) {
  selectedUserIds.value = checked ? userList.value.map(item => item.id) : [];
}

async function openCreateDrawer() {
  isEditMode.value = false;
  resetUserForm();
  await ensureDepartmentTreeOptions();
  showUserDrawer.value = true;
}

async function openEditDrawer(user: UserRecord) {
  if (!ensureUserTenantAccess(user, '编辑'))
    return;

  isEditMode.value = true;
  resetUserForm();
  editingUserId.value = user.id;
  await ensureDepartmentTreeOptions();
  showUserDrawer.value = true;

  const { data } = await getUserDetailApi(user.id);
  if (!ensureUserTenantAccess(data, '编辑'))
    return;

  userForm.username = data.username;
  userForm.nickname = data.nickname || '';
  userForm.status = data.status ?? isUserEnabled(user);
  userForm.departmentId = data.departmentId ?? user.departmentId ?? null;
}

function closeUserDrawer() {
  showUserDrawer.value = false;
  resetUserForm();
  userFormRef.value?.restoreValidation();
}

async function submitUserForm() {
  await userFormRef.value?.validate();

  const payload = {
    username: userForm.username.trim(),
    nickname: userForm.nickname.trim() || undefined,
    status: userForm.status,
    departmentId: userForm.departmentId ?? null,
    ...(userForm.password.trim() ? { password: userForm.password.trim() } : {})
  };

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateUserApi(editingUserId.value, payload);
      message.success('用户信息已更新');
    }
    else {
      await createUserApi({
        username: payload.username,
        password: payload.password!,
        nickname: payload.nickname,
        status: payload.status,
        departmentId: payload.departmentId
      });
      message.success('用户已创建');
    }

    closeUserDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    clearSelectedUsers();
    await fetchUsers(nextPage);
  }
  finally {
    submitting.value = false;
  }
}

async function handleToggleUserStatus(user: UserRecord, value: boolean) {
  if (!canUpdateUser.value)
    return;
  if (!ensureUserTenantAccess(user, value ? '启用' : '停用'))
    return;

  const actionText = value ? '启用' : '停用';
  const confirmed = await confirmAction({
    title: `${actionText}用户`,
    content: `确认${actionText}用户“${user.username}”吗？`
  });

  if (!confirmed)
    return;

  switchLoadingUserId.value = user.id;
  try {
    await updateUserApi(user.id, { status: value });
    userList.value = userList.value.map(item =>
      item.id === user.id
        ? { ...item, status: value }
        : item
    );
    message.success(`已${actionText}用户`);
  }
  finally {
    switchLoadingUserId.value = '';
  }
}

async function handleDeleteUser(user: UserRecord) {
  if (!ensureUserTenantAccess(user, '删除'))
    return;

  const confirmed = await confirmAction({
    title: '删除用户',
    content: `确认删除用户“${user.username}”吗？`
  });

  if (!confirmed)
    return;

  await deleteUserApi(user.id);
  message.success('用户已删除');
  selectedUserIds.value = selectedUserIds.value.filter(id => id !== user.id);
  const nextPage = userList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await fetchUsers(nextPage);
}

async function handleBatchDelete() {
  if (!selectedUserIds.value.length) {
    message.error('请先勾选需要删除的用户');
    return;
  }

  const confirmed = await confirmAction({
    title: '批量删除用户',
    content: `确认删除当前选中的 ${selectedUserIds.value.length} 个用户吗？`
  });

  if (!confirmed)
    return;

  const deleteCount = selectedUserIds.value.length;
  await Promise.all(selectedUserIds.value.map(id => deleteUserApi(id)));
  message.success(`已删除 ${deleteCount} 个用户`);
  const nextPage = userList.value.length === deleteCount && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  clearSelectedUsers();
  await fetchUsers(nextPage);
}

async function openAssignRole(user: UserRecord) {
  if (!ensureUserTenantAccess(user, '分配角色'))
    return;

  selectedUser.value = user;
  showAssignRoleModal.value = true;
  await loadRoleOptions();
  const { data } = await getUserRolesApi(user.id);
  selectedRoleIds.value = data.roleIds;
}

function closeAssignRole() {
  showAssignRoleModal.value = false;
  selectedUser.value = null;
  selectedRoleIds.value = [];
}

async function submitAssignRole() {
  if (!selectedUser.value)
    return;

  assigning.value = true;
  try {
    await assignUserRolesApi(selectedUser.value.id, selectedRoleIds.value);
    message.success('角色分配已保存');
    closeAssignRole();
  }
  finally {
    assigning.value = false;
  }
}

function openResetPasswordModal(user: UserRecord) {
  if (!ensureUserTenantAccess(user, '重置密码'))
    return;

  resetPasswordUser.value = user;
  resetPasswordForm.password = '';
  resetPasswordForm.confirmPassword = '';
  showResetPasswordModal.value = true;
}

function closeResetPasswordModal() {
  showResetPasswordModal.value = false;
  resetPasswordState();
  resetPasswordFormRef.value?.restoreValidation();
}

function generateTemporaryPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const value = Array.from({ length: 10 }).fill(chars[Math.floor(Math.random() * chars.length)]).join('');
  resetPasswordForm.password = value;
  resetPasswordForm.confirmPassword = value;
}

async function submitResetPassword() {
  if (!resetPasswordUser.value)
    return;

  await resetPasswordFormRef.value?.validate();

  passwordSubmitting.value = true;
  try {
    await updateUserApi(resetPasswordUser.value.id, {
      password: resetPasswordForm.password.trim()
    });
    message.success(`已重置用户“${resetPasswordUser.value.username}”的密码`);
    closeResetPasswordModal();
  }
  finally {
    passwordSubmitting.value = false;
  }
}

function escapeCsvCell(value: string | number | boolean | null | undefined) {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes(',') || text.includes('\n'))
    return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([ content ], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function downloadImportTemplate() {
  const header = [ 'username', 'password', 'nickname', 'departmentId', 'status' ];
  const example = [ 'demo_user', 'Lucky123', '演示用户', '1', '启用' ];
  const csv = [ header, example ]
    .map(row => row.map(cell => escapeCsvCell(cell)).join(','))
    .join('\n');

  downloadTextFile('user-import-template.csv', `\uFEFF${csv}`);
}

async function openImportFilePicker() {
  await ensureDepartmentTreeOptions();
  importInputRef.value?.click();
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      }
      else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current);
  return cells.map(cell => cell.trim());
}

function parseImportStatus(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized || [ 'true', '1', 'yes', 'enabled', '启用', '是' ].includes(normalized))
    return true;
  if ([ 'false', '0', 'no', 'disabled', '停用', '否' ].includes(normalized))
    return false;
  return null;
}

function parseDepartmentId(value: string) {
  const normalized = value.trim();
  if (!normalized)
    return null;

  const parsed = Number(normalized);
  if (!Number.isInteger(parsed) || parsed <= 0)
    return Number.NaN;

  return parsed;
}

function parseImportRows(content: string) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim();
  if (!normalized)
    return [];

  const lines = normalized.split('\n').filter(Boolean);
  if (lines.length <= 1)
    return [];

  const header = splitCsvLine(lines[0]);
  const expected = [ 'username', 'password', 'nickname', 'departmentId', 'status' ];
  const headerValid = expected.every((key, index) => header[index] === key);
  if (!headerValid)
    throw new Error('CSV 表头不正确，请先下载模板后填写');

  return lines.slice(1).map((line, index) => {
    const [ username, password, nickname, departmentIdText, statusText ] = splitCsvLine(line);
    return {
      lineNo: index + 2,
      username: username || '',
      password: password || '',
      nickname: nickname || '',
      departmentId: parseDepartmentId(departmentIdText),
      status: parseImportStatus(statusText) ?? true
    };
  }).filter(row => row.username || row.password || row.nickname || row.departmentId !== null);
}

function validateImportRows(rows: ImportUserRow[]) {
  const invalid = rows.find((row) => {
    if (!/^\w{3,20}$/.test(row.username.trim()))
      return true;

    if (row.password.trim().length < 6)
      return true;

    if (Number.isNaN(row.departmentId))
      return true;

    if (typeof row.departmentId === 'number' && !availableDepartmentIdSet.value.has(row.departmentId))
      return true;

    return false;
  });

  if (!invalid)
    return;

  if (Number.isNaN(invalid.departmentId)) {
    throw new TypeError(`第 ${invalid.lineNo} 行部门 ID 格式错误，请填写正整数或留空`);
  }

  if (typeof invalid.departmentId === 'number' && !availableDepartmentIdSet.value.has(invalid.departmentId)) {
    throw new Error(`第 ${invalid.lineNo} 行部门 ID 不存在，请检查部门树`);
  }

  if (!/^\w{3,20}$/.test(invalid.username.trim())) {
    throw new Error(`第 ${invalid.lineNo} 行用户名不符合 3-20 位规则`);
  }

  throw new Error(`第 ${invalid.lineNo} 行密码长度不能少于 6 位`);
}

async function handleImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file)
    return;

  try {
    await ensureDepartmentTreeOptions();
    const content = await file.text();
    const rows = parseImportRows(content);

    if (!rows.length) {
      message.error('导入文件中没有可用的用户数据');
      return;
    }

    validateImportRows(rows);
    importRows.value = rows;
    showImportModal.value = true;
  }
  catch (error) {
    message.error(error instanceof Error ? error.message : '导入文件解析失败');
  }
}

function closeImportModal() {
  showImportModal.value = false;
  importRows.value = [];
}

async function submitImportRows() {
  if (!importRows.value.length)
    return;

  importing.value = true;
  let successCount = 0;

  try {
    for (const row of importRows.value) {
      await createUserApi({
        username: row.username.trim(),
        password: row.password.trim(),
        nickname: row.nickname.trim() || undefined,
        departmentId: row.departmentId,
        status: row.status
      });
      successCount += 1;
    }

    message.success(`成功导入 ${successCount} 个用户`);
    closeImportModal();
    page.value = 1;
    clearSelectedUsers();
    await fetchUsers(1);
  }
  finally {
    importing.value = false;
  }
}

function exportCurrentPage() {
  if (!userList.value.length) {
    message.error('当前页没有可导出的用户数据');
    return;
  }

  const header = [ 'username', 'nickname', 'department', 'status', 'createdAt', 'updatedAt' ];
  const rows = userList.value.map(item => [
    item.username,
    item.nickname || '',
    getDepartmentName(item),
    isUserEnabled(item) ? '启用' : '停用',
    item.createdAt || '',
    item.updatedAt || ''
  ]);
  const csv = [ header, ...rows ]
    .map(row => row.map(cell => escapeCsvCell(cell)).join(','))
    .join('\n');

  downloadTextFile(`users-page-${page.value}.csv`, `\uFEFF${csv}`);
  message.success('当前页用户已导出');
}

onMounted(() => {
  fetchUsers();
  ensureDepartmentTreeOptions();
});
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
      <span>用户列表会优先按当前租户上下文做前端兜底过滤。</span>
    </div>

    <div class="toolbar">
      <div class="toolbar-item toolbar-item--wide">
        <div class="toolbar-label">
          关键字
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入用户名或昵称"
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
          v-if="canCreateUser"
          v-permission="userButtonCodes.create"
          type="primary"
          @click="openCreateDrawer"
        >
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增用户
        </n-button>
        <n-button
          v-if="canDeleteUser"
          v-permission="userButtonCodes.delete"
          secondary
          type="error"
          :disabled="!selectedUserIds.length"
          @click="handleBatchDelete"
        >
          <template #icon>
            <Icon icon="solar:trash-bin-minimalistic-bold" />
          </template>
          批量删除
        </n-button>
        <n-button
          v-if="canCreateUser"
          v-permission="userButtonCodes.create"
          secondary
          @click="downloadImportTemplate"
        >
          <template #icon>
            <Icon icon="solar:file-download-bold" />
          </template>
          下载模板
        </n-button>
        <n-button
          v-if="canCreateUser"
          v-permission="userButtonCodes.create"
          secondary
          @click="openImportFilePicker"
        >
          <template #icon>
            <Icon icon="solar:upload-bold" />
          </template>
          导入 CSV
        </n-button>
        <n-button secondary @click="exportCurrentPage">
          <template #icon>
            <Icon icon="solar:download-bold" />
          </template>
          导出当前页
        </n-button>
      </div>

      <div v-if="selectedUserIds.length" class="selection-bar">
        <div class="selection-bar__copy">
          <Icon icon="solar:checklist-minimalistic-bold" />
          <span>已选中 {{ selectedUserIds.length }} 条记录，可直接批量删除。</span>
        </div>
        <n-button text type="primary" @click="clearSelectedUsers">
          清空勾选
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th class="select-col">
                <n-checkbox
                  :checked="allRowsSelected"
                  :indeterminate="partiallySelected"
                  @update:checked="toggleSelectAll"
                />
              </th>
              <th>用户名</th>
              <th>昵称</th>
              <th>所属部门</th>
              <th>状态</th>
              <th>更新时间</th>
              <th v-if="hasUserActions">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in userList" :key="item.id">
              <td class="select-col">
                <n-checkbox
                  :checked="selectedUserIds.includes(item.id)"
                  @update:checked="value => toggleRowSelection(item.id, value)"
                />
              </td>
              <td>
                <div class="primary-text">
                  {{ item.username }}
                </div>
                <div class="secondary-text">
                  ID: {{ item.id }}
                </div>
              </td>
              <td>
                <div>{{ item.nickname || '-' }}</div>
                <div v-if="isWithinDays(item.updatedAt, 7)" class="fresh-tip">
                  近 7 天有更新
                </div>
              </td>
              <td>
                <n-tag size="small" round :type="item.departmentId ? 'info' : 'default'">
                  {{ getDepartmentName(item) }}
                </n-tag>
              </td>
              <td class="status-cell">
                <n-switch
                  :value="isUserEnabled(item)"
                  size="small"
                  :loading="switchLoadingUserId === item.id"
                  :disabled="!canUpdateUser"
                  @update:value="value => handleToggleUserStatus(item, value)"
                >
                  <template #checked>
                    启用
                  </template>
                  <template #unchecked>
                    停用
                  </template>
                </n-switch>
              </td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td v-if="hasUserActions" class="operation-cell">
                <div class="operation-actions">
                  <n-button
                    v-if="canAssignUserRole"
                    v-permission="userButtonCodes.assign"
                    quaternary
                    type="primary"
                    @click="openAssignRole(item)"
                  >
                    分配角色
                  </n-button>
                  <n-button
                    v-if="canUpdateUser"
                    v-permission="userButtonCodes.update"
                    quaternary
                    type="warning"
                    @click="openResetPasswordModal(item)"
                  >
                    重置密码
                  </n-button>
                  <n-button
                    v-if="canUpdateUser"
                    v-permission="userButtonCodes.update"
                    quaternary
                    type="primary"
                    @click="openEditDrawer(item)"
                  >
                    编辑
                  </n-button>
                  <n-button
                    v-if="canDeleteUser"
                    v-permission="userButtonCodes.delete"
                    quaternary
                    type="error"
                    @click="handleDeleteUser(item)"
                  >
                    删除
                  </n-button>
                </div>
              </td>
            </tr>
            <tr v-if="!userList.length">
              <td :colspan="userTableColumnCount">
                <n-empty description="暂无用户数据" />
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

    <input
      ref="importInputRef"
      type="file"
      accept=".csv,text/csv"
      class="hidden-file-input"
      @change="handleImportFileChange"
    >

    <n-modal v-model:show="showAssignRoleModal" preset="card" title="分配角色" style="width: 560px;">
      <div class="lc-modal-intro">
        <div class="assign-summary">
          当前用户：{{ selectedUser?.nickname || selectedUser?.username || '-' }}
        </div>

        <div class="lc-metrics-grid">
          <article class="lc-metric">
            <span>当前已选角色</span>
            <strong>{{ selectedRoleIds.length }}</strong>
          </article>
          <article class="lc-metric">
            <span>可选角色</span>
            <strong>{{ roleOptions.length }}</strong>
          </article>
        </div>
      </div>

      <n-spin :show="assigning">
        <n-checkbox-group v-model:value="selectedRoleIds" class="role-checkboxes">
          <n-space vertical>
            <n-checkbox
              v-for="role in roleOptions"
              :key="role.id"
              :value="role.id"
              :label="`${role.name}（${role.code}）`"
            />
          </n-space>
        </n-checkbox-group>
      </n-spin>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="closeAssignRole">
            取消
          </n-button>
          <n-button type="primary" :loading="assigning" @click="submitAssignRole">
            保存
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showResetPasswordModal" preset="card" title="重置密码" style="width: 520px;">
      <n-form ref="resetPasswordFormRef" :model="resetPasswordForm" :rules="resetPasswordRules" label-placement="top">
        <div class="assign-summary">
          当前用户：{{ resetPasswordUser?.nickname || resetPasswordUser?.username || '-' }}
        </div>

        <div class="password-actions">
          <n-button quaternary type="primary" @click="generateTemporaryPassword">
            生成临时密码
          </n-button>
          <span class="password-helper">
            建议先生成临时密码，再由用户首次登录后自行修改。
          </span>
        </div>

        <n-form-item label="新密码" path="password">
          <n-input
            v-model:value="resetPasswordForm.password"
            type="password"
            show-password-on="click"
            placeholder="请输入新密码"
          />
        </n-form-item>
        <n-form-item label="确认新密码" path="confirmPassword">
          <n-input
            v-model:value="resetPasswordForm.confirmPassword"
            type="password"
            show-password-on="click"
            placeholder="请再次输入新密码"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="closeResetPasswordModal">
            取消
          </n-button>
          <n-button type="primary" :loading="passwordSubmitting" @click="submitResetPassword">
            确认重置
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-drawer v-model:show="showUserDrawer" :width="560" placement="right">
      <n-drawer-content :title="isEditMode ? '编辑用户' : '新增用户'">
        <n-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-placement="top">
          <div class="lc-form-stack">
            <section class="lc-form-section">
              <div class="lc-form-section__header">
                <div>
                  <p class="lc-form-section__eyebrow">
                    Account
                  </p>
                  <h3 class="lc-form-section__title">
                    {{ isEditMode ? '编辑账号' : '创建账号' }}
                  </h3>
                  <p class="lc-form-section__description">
                    统一维护账号信息、启用状态与部门归属，方便后续角色授权和组织管理。
                  </p>
                </div>
              </div>

              <n-grid :cols="2" :x-gap="16">
                <n-form-item-gi label="用户名" path="username">
                  <n-input v-model:value="userForm.username" placeholder="请输入用户名" />
                </n-form-item-gi>
                <n-form-item-gi label="昵称" path="nickname">
                  <n-input v-model:value="userForm.nickname" placeholder="请输入昵称" />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="密码" path="password">
                  <n-input
                    v-model:value="userForm.password"
                    type="password"
                    show-password-on="click"
                    :placeholder="isEditMode ? '留空则不修改密码' : '请输入密码'"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="所属部门" path="departmentId">
                  <n-tree-select
                    v-model:value="userForm.departmentId"
                    clearable
                    filterable
                    default-expand-all
                    :options="departmentTreeOptions"
                    placeholder="请选择所属部门"
                  />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="状态" path="status">
                  <n-switch v-model:value="userForm.status">
                    <template #checked>
                      启用
                    </template>
                    <template #unchecked>
                      停用
                    </template>
                  </n-switch>
                </n-form-item-gi>
              </n-grid>
            </section>
          </div>
        </n-form>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="closeUserDrawer">
              取消
            </n-button>
            <n-button type="primary" :loading="submitting" @click="submitUserForm">
              保存
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showImportModal" preset="card" title="CSV 导入预览" style="width: min(860px, 94vw)">
      <div class="assign-hint">
        导入前请确认 `username / password / nickname / departmentId / status` 五列完整无误，提交后将逐条创建用户账号。
      </div>
      <div class="table-wrap import-table-wrap">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>行号</th>
              <th>用户名</th>
              <th>昵称</th>
              <th>部门</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in importRows" :key="`${row.lineNo}-${row.username}`">
              <td>{{ row.lineNo }}</td>
              <td>{{ row.username }}</td>
              <td>{{ row.nickname || '-' }}</td>
              <td>{{ row.departmentId ? (departmentLabelMap.get(row.departmentId) || `部门 ${row.departmentId}`) : '未设置' }}</td>
              <td>{{ row.status ? '启用' : '停用' }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <template #footer>
        <div class="modal-footer">
          <n-button @click="closeImportModal">
            取消
          </n-button>
          <n-button type="primary" :loading="importing" @click="submitImportRows">
            确认导入 {{ importRows.length }} 条
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
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
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 10px;
  background-color: var(--table-color-hover);
}

.selection-bar__copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
}

.select-col {
  width: 48px;
  text-align: center;
}

.primary-text {
  font-weight: 600;
}

.secondary-text {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-color-2);
}

.fresh-tip {
  margin-top: 4px;
  font-size: 12px;
  color: var(--primary-color);
}

.status-cell {
  min-width: 110px;
}

@import '@/styles/table-operation.less';

.table-wrap {
  overflow: hidden;
  border-radius: 12px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.assign-summary {
  margin-bottom: 16px;
  color: var(--text-color-2);
}

.assign-hint {
  margin-bottom: 16px;
  padding: 12px 14px;
  color: var(--text-color-2);
  background-color: var(--table-color-hover);
  border-radius: 8px;
}

.role-checkboxes {
  display: block;
}

.password-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.password-helper {
  color: var(--text-color-2);
  font-size: 13px;
}

.import-table-wrap {
  max-height: 420px;
  overflow: auto;
}

.hidden-file-input {
  display: none;
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

  .toolbar-item,
  .toolbar-item--wide {
    width: 100%;
  }

  .selection-bar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
