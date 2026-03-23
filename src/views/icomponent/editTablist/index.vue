<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import type { VxeGridInstance, VxeGridProps } from 'vxe-table';
import { VxeGrid } from 'vxe-table';
import { Icon } from '@iconify/vue';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';

interface DemoUserRecord {
  id: number;
  username: string;
  role: string;
  phone: string;
  email: string;
  status: boolean;
  createdAt: string;
}

interface UserFormState {
  username: string;
  role: string;
  phone: string;
  email: string;
  status: boolean;
}

interface ColumnSetting {
  field: keyof DemoUserRecord | 'actions';
  title: string;
  visible: boolean;
}

const roleOptions = [
  { label: '平台管理员', value: '平台管理员' },
  { label: '租户管理员', value: '租户管理员' },
  { label: '运营专员', value: '运营专员' },
  { label: '财务人员', value: '财务人员' },
  { label: '审计人员', value: '审计人员' }
];

const seedUsers: DemoUserRecord[] = [
  { id: 1, username: 'admin', role: '平台管理员', phone: '13800000001', email: 'admin@luckycolor.com', status: true, createdAt: '2026-03-01 09:00:00' },
  { id: 2, username: 'tenant_admin', role: '租户管理员', phone: '13800000002', email: 'tenant_admin@luckycolor.com', status: true, createdAt: '2026-03-02 10:15:00' },
  { id: 3, username: 'ops_zhang', role: '运营专员', phone: '13800000003', email: 'ops_zhang@luckycolor.com', status: true, createdAt: '2026-03-03 14:20:00' },
  { id: 4, username: 'ops_li', role: '运营专员', phone: '13800000004', email: 'ops_li@luckycolor.com', status: false, createdAt: '2026-03-04 08:30:00' },
  { id: 5, username: 'finance_wang', role: '财务人员', phone: '13800000005', email: 'finance_wang@luckycolor.com', status: true, createdAt: '2026-03-05 09:45:00' },
  { id: 6, username: 'finance_chen', role: '财务人员', phone: '13800000006', email: 'finance_chen@luckycolor.com', status: true, createdAt: '2026-03-06 11:20:00' },
  { id: 7, username: 'audit_sun', role: '审计人员', phone: '13800000007', email: 'audit_sun@luckycolor.com', status: false, createdAt: '2026-03-07 16:50:00' },
  { id: 8, username: 'audit_he', role: '审计人员', phone: '13800000008', email: 'audit_he@luckycolor.com', status: true, createdAt: '2026-03-08 13:12:00' },
  { id: 9, username: 'demo_user_01', role: '租户管理员', phone: '13800000009', email: 'demo01@luckycolor.com', status: true, createdAt: '2026-03-09 09:18:00' },
  { id: 10, username: 'demo_user_02', role: '运营专员', phone: '13800000010', email: 'demo02@luckycolor.com', status: true, createdAt: '2026-03-10 10:28:00' },
  { id: 11, username: 'demo_user_03', role: '财务人员', phone: '13800000011', email: 'demo03@luckycolor.com', status: false, createdAt: '2026-03-11 11:38:00' },
  { id: 12, username: 'demo_user_04', role: '审计人员', phone: '13800000012', email: 'demo04@luckycolor.com', status: true, createdAt: '2026-03-12 14:08:00' },
  { id: 13, username: 'demo_user_05', role: '平台管理员', phone: '13800000013', email: 'demo05@luckycolor.com', status: true, createdAt: '2026-03-13 15:22:00' },
  { id: 14, username: 'demo_user_06', role: '租户管理员', phone: '13800000014', email: 'demo06@luckycolor.com', status: true, createdAt: '2026-03-14 16:42:00' },
  { id: 15, username: 'demo_user_07', role: '运营专员', phone: '13800000015', email: 'demo07@luckycolor.com', status: false, createdAt: '2026-03-15 09:58:00' },
  { id: 16, username: 'demo_user_08', role: '财务人员', phone: '13800000016', email: 'demo08@luckycolor.com', status: true, createdAt: '2026-03-16 12:10:00' }
];

const gridRef = ref<VxeGridInstance<DemoUserRecord> | null>(null);
const userFormRef = ref<FormInst | null>(null);
const importInputRef = ref<HTMLInputElement | null>(null);

const sourceUsers = ref<DemoUserRecord[]>([ ...seedUsers ]);
const checkedRowIds = ref<number[]>([]);
const showUserDrawer = ref(false);
const isEditMode = ref(false);
const editingUserId = ref<number | null>(null);
const isFullscreen = ref(false);

const searchForm = reactive({
  username: '',
  role: ''
});

const pagerConfig = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const userForm = reactive<UserFormState>({
  username: '',
  role: '',
  phone: '',
  email: '',
  status: true
});

const columnSettings = ref<ColumnSetting[]>([
  { field: 'username', title: '用户名', visible: true },
  { field: 'role', title: '角色', visible: true },
  { field: 'phone', title: '手机号', visible: true },
  { field: 'email', title: '邮箱', visible: true },
  { field: 'status', title: '状态', visible: true },
  { field: 'createdAt', title: '创建时间', visible: true }
]);

const userFormRules: FormRules = {
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: [ 'blur', 'input' ]
    }
  ],
  role: [
    {
      required: true,
      message: '请选择角色',
      trigger: [ 'blur', 'change' ]
    }
  ],
  phone: [
    {
      required: true,
      message: '请输入手机号',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^1\d{10}$/.test(value.trim()),
      message: '请输入正确的手机号',
      trigger: [ 'blur', 'input' ]
    }
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: '请输入正确的邮箱',
      trigger: [ 'blur', 'input' ]
    }
  ]
};

const filteredUsers = computed(() => {
  const keyword = searchForm.username.trim().toLowerCase();
  const role = searchForm.role;

  return sourceUsers.value.filter((item) => {
    const matchedKeyword = !keyword || item.username.toLowerCase().includes(keyword);
    const matchedRole = !role || item.role === role;
    return matchedKeyword && matchedRole;
  });
});

const pagedUsers = computed(() => {
  const start = (pagerConfig.currentPage - 1) * pagerConfig.pageSize;
  return filteredUsers.value.slice(start, start + pagerConfig.pageSize);
});

const gridColumns = computed<VxeGridProps<DemoUserRecord>['columns']>(() => {
  const visibleMap = new Map(columnSettings.value.map(item => [ item.field, item.visible ]));

  return [
    { type: 'checkbox', width: 56, fixed: 'left' },
    { field: 'username', title: '用户名', minWidth: 160, visible: visibleMap.get('username') !== false },
    { field: 'role', title: '角色', minWidth: 140, slots: { default: 'role' }, visible: visibleMap.get('role') !== false },
    { field: 'phone', title: '手机号', minWidth: 150, visible: visibleMap.get('phone') !== false },
    { field: 'email', title: '邮箱', minWidth: 220, visible: visibleMap.get('email') !== false },
    { field: 'status', title: '状态', width: 120, slots: { default: 'status' }, visible: visibleMap.get('status') !== false },
    { field: 'createdAt', title: '创建时间', minWidth: 180, visible: visibleMap.get('createdAt') !== false },
    { field: 'actions', title: '操作', width: 160, fixed: 'right', slots: { default: 'actions' } }
  ];
});

const gridOptions = reactive<VxeGridProps<DemoUserRecord>>({
  border: true,
  stripe: true,
  showOverflow: true,
  pagerConfig: {
    enabled: true
  },
  rowConfig: {
    keyField: 'id',
    isHover: true
  },
  columnConfig: {
    resizable: true
  },
  columns: [],
  data: []
});

watchEffect(() => {
  pagerConfig.total = filteredUsers.value.length;

  const maxPage = Math.max(Math.ceil((pagerConfig.total || 1) / pagerConfig.pageSize), 1);
  if (pagerConfig.currentPage > maxPage) {
    pagerConfig.currentPage = maxPage;
    return;
  }

  gridOptions.columns = gridColumns.value;
  gridOptions.data = pagedUsers.value;
});

function resetUserForm() {
  userForm.username = '';
  userForm.role = '';
  userForm.phone = '';
  userForm.email = '';
  userForm.status = true;
  editingUserId.value = null;
}

function syncCheckedRows() {
  checkedRowIds.value = (gridRef.value?.getCheckboxRecords() || []).map(item => item.id);
}

function clearSelection() {
  checkedRowIds.value = [];
  gridRef.value?.clearCheckboxRow?.();
}

function handleSearch() {
  pagerConfig.currentPage = 1;
  clearSelection();
}

function handleReset() {
  searchForm.username = '';
  searchForm.role = '';
  pagerConfig.currentPage = 1;
  clearSelection();
}

function handlePageChange(page: number) {
  pagerConfig.currentPage = page;
  clearSelection();
}

function handlePageSizeChange(pageSize: number) {
  pagerConfig.pageSize = pageSize;
  pagerConfig.currentPage = 1;
  clearSelection();
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetUserForm();
  showUserDrawer.value = true;
}

function openEditDrawer(row: DemoUserRecord) {
  isEditMode.value = true;
  editingUserId.value = row.id;
  userForm.username = row.username;
  userForm.role = row.role;
  userForm.phone = row.phone;
  userForm.email = row.email;
  userForm.status = row.status;
  showUserDrawer.value = true;
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
    role: userForm.role,
    phone: userForm.phone.trim(),
    email: userForm.email.trim(),
    status: userForm.status
  };

  if (isEditMode.value && editingUserId.value !== null) {
    sourceUsers.value = sourceUsers.value.map(item =>
      item.id === editingUserId.value
        ? { ...item, ...payload }
        : item
    );
    message.success('用户信息已更新');
  }
  else {
    const nextId = Math.max(...sourceUsers.value.map(item => item.id), 0) + 1;
    sourceUsers.value = [
      {
        id: nextId,
        ...payload,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      },
      ...sourceUsers.value
    ];
    message.success('用户已新增');
  }

  pagerConfig.currentPage = 1;
  closeUserDrawer();
  clearSelection();
}

async function handleDelete(row: DemoUserRecord) {
  const confirmed = await confirmAction({
    title: '删除用户',
    content: `确认删除用户“${row.username}”吗？`
  });

  if (!confirmed) {
    return;
  }

  sourceUsers.value = sourceUsers.value.filter(item => item.id !== row.id);
  message.success('用户已删除');
  clearSelection();
}

async function handleBatchDelete() {
  if (!checkedRowIds.value.length) {
    message.warning('请先选择要删除的用户');
    return;
  }

  const confirmed = await confirmAction({
    title: '批量删除用户',
    content: `确认删除已选中的 ${checkedRowIds.value.length} 个用户吗？`
  });

  if (!confirmed) {
    return;
  }

  const rowIdSet = new Set(checkedRowIds.value);
  sourceUsers.value = sourceUsers.value.filter(item => !rowIdSet.has(item.id));
  message.success('批量删除成功');
  clearSelection();
}

function handleImportClick() {
  importInputRef.value?.click();
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const text = await file.text();
  const rows = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

  if (rows.length <= 1) {
    message.warning('导入文件内容为空');
    input.value = '';
    return;
  }

  const importedUsers = rows.slice(1).map((line, index) => {
    const [ username, role, phone, email, status ] = line.split(',').map(item => item.trim());
    return {
      id: Math.max(...sourceUsers.value.map(item => item.id), 0) + index + 1,
      username,
      role,
      phone,
      email,
      status: [ 'true', '启用', '1', '是' ].includes(status),
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
    } satisfies DemoUserRecord;
  }).filter(item => item.username && item.role);

  if (!importedUsers.length) {
    message.warning('没有识别到可导入的数据');
    input.value = '';
    return;
  }

  sourceUsers.value = [ ...importedUsers, ...sourceUsers.value ];
  pagerConfig.currentPage = 1;
  clearSelection();
  message.success(`成功导入 ${importedUsers.length} 个用户`);
  input.value = '';
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([ content ], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function handleExport() {
  const header = '用户名,角色,手机号,邮箱,状态,创建时间';
  const rows = filteredUsers.value.map(item =>
    [
      item.username,
      item.role,
      item.phone,
      item.email,
      item.status ? '启用' : '停用',
      item.createdAt
    ].join(',')
  );
  downloadTextFile('vxe-table-users.csv', `\uFEFF${[ header, ...rows ].join('\n')}`);
  message.success('导出成功');
}

async function handlePrint() {
  const grid = gridRef.value as unknown as { print?: () => Promise<void> | void };
  if (grid?.print) {
    await grid.print();
    return;
  }

  window.print();
}

function handleRefresh() {
  sourceUsers.value = [ ...seedUsers ];
  pagerConfig.currentPage = 1;
  searchForm.username = '';
  searchForm.role = '';
  clearSelection();
  message.success('表格已刷新');
}

function handleToggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

function handleColumnVisibleChange(field: ColumnSetting['field'], checked: boolean) {
  const visibleCount = columnSettings.value.filter(item => item.visible).length;

  if (!checked && visibleCount === 1) {
    message.warning('至少保留一个展示字段');
    return;
  }

  columnSettings.value = columnSettings.value.map(item =>
    item.field === field
      ? { ...item, visible: checked }
      : item
  );
}

function handleStatusChange(row: DemoUserRecord, value: boolean) {
  row.status = value;
  sourceUsers.value = sourceUsers.value.map(item =>
    item.id === row.id ? { ...item, status: value } : item
  );
}
</script>

<template>
  <div class="vxe-demo-page" :class="{ 'vxe-demo-page--fullscreen': isFullscreen }">
    <div class="filter-card">
      <n-form :model="searchForm" inline label-placement="left">
        <n-form-item label="用户名">
          <n-input
            v-model:value="searchForm.username"
            clearable
            placeholder="请输入用户名"
            @keyup.enter="handleSearch"
          />
        </n-form-item>
        <n-form-item label="角色">
          <n-select
            v-model:value="searchForm.role"
            clearable
            filterable
            placeholder="请选择角色"
            :options="roleOptions"
          />
        </n-form-item>
        <n-space>
          <n-button type="primary" @click="handleSearch">
            <template #icon>
              <Icon icon="simple-line-icons:magnifier" />
            </template>
            搜索
          </n-button>
          <n-button @click="handleReset">
            <template #icon>
              <Icon icon="system-uicons:reset" />
            </template>
            重置
          </n-button>
        </n-space>
      </n-form>
    </div>

    <div class="table-card">
      <div class="table-toolbar">
        <div class="table-toolbar__left">
          <n-button type="primary" @click="openCreateDrawer">
            <template #icon>
              <Icon icon="material-symbols:add" />
            </template>
            新增用户
          </n-button>
          <n-button type="error" ghost :disabled="!checkedRowIds.length" @click="handleBatchDelete">
            <template #icon>
              <Icon icon="material-symbols:delete-outline" />
            </template>
            批量删除
          </n-button>
        </div>

        <div class="table-toolbar__right">
          <input
            ref="importInputRef"
            type="file"
            accept=".csv"
            class="hidden-input"
            @change="handleImportFile"
          >
          <n-button quaternary @click="handleImportClick">
            导入
          </n-button>
          <n-button quaternary @click="handleExport">
            导出
          </n-button>
          <n-button quaternary @click="handlePrint">
            打印
          </n-button>
          <n-button quaternary @click="handleRefresh">
            刷新
          </n-button>
          <n-button quaternary @click="handleToggleFullscreen">
            {{ isFullscreen ? '还原' : '放大' }}
          </n-button>
          <n-popover trigger="click" placement="bottom-end">
            <template #trigger>
              <n-button quaternary>
                列字段操作
              </n-button>
            </template>
            <div class="column-panel">
              <n-checkbox
                v-for="item in columnSettings"
                :key="item.field"
                :checked="item.visible"
                @update:checked="(checked: boolean) => handleColumnVisibleChange(item.field, checked)"
              >
                {{ item.title }}
              </n-checkbox>
            </div>
          </n-popover>
        </div>
      </div>

      <VxeGrid
        ref="gridRef"
        v-bind="gridOptions"
        @checkbox-change="syncCheckedRows"
        @checkbox-all="syncCheckedRows"
      >
        <template #role="{ row }">
          <n-tag type="info" size="small">
            {{ row.role }}
          </n-tag>
        </template>

        <template #status="{ row }">
          <n-switch
            :value="row.status"
            size="small"
            @update:value="(value: boolean) => handleStatusChange(row, value)"
          >
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </n-switch>
        </template>

        <template #actions="{ row }">
          <n-space :size="8">
            <n-button text type="primary" @click="openEditDrawer(row)">
              修改
            </n-button>
            <n-button text type="error" @click="handleDelete(row)">
              删除
            </n-button>
          </n-space>
        </template>

        <template #empty>
          <div class="empty-block">
            <n-empty description="暂无用户数据" />
          </div>
        </template>

        <template #pager>
          <n-pagination
            v-model:page="pagerConfig.currentPage"
            v-model:page-size="pagerConfig.pageSize"
            class="pager-wrap"
            show-size-picker
            :item-count="pagerConfig.total"
            :page-sizes="[10, 20, 50, 100]"
            :on-update:page="handlePageChange"
            :on-update:page-size="handlePageSizeChange"
          />
        </template>
      </VxeGrid>
    </div>

    <n-drawer v-model:show="showUserDrawer" :width="480" placement="right">
      <n-drawer-content :title="isEditMode ? '修改用户' : '新增用户'">
        <n-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-placement="top">
          <n-form-item label="用户名" path="username">
            <n-input v-model:value="userForm.username" placeholder="请输入用户名" />
          </n-form-item>
          <n-form-item label="角色" path="role">
            <n-select v-model:value="userForm.role" placeholder="请选择角色" :options="roleOptions" />
          </n-form-item>
          <n-form-item label="手机号" path="phone">
            <n-input v-model:value="userForm.phone" placeholder="请输入手机号" />
          </n-form-item>
          <n-form-item label="邮箱" path="email">
            <n-input v-model:value="userForm.email" placeholder="请输入邮箱" />
          </n-form-item>
          <n-form-item label="状态">
            <n-switch v-model:value="userForm.status">
              <template #checked>
                启用
              </template>
              <template #unchecked>
                停用
              </template>
            </n-switch>
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="closeUserDrawer">
              取消
            </n-button>
            <n-button type="primary" @click="submitUserForm">
              保存
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped lang="less">
.vxe-demo-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vxe-demo-page--fullscreen {
  position: fixed;
  inset: 12px;
  z-index: 2100;
  padding: 12px;
  background: #f5f7fa;
}

.filter-card,
.table-card {
  padding: 18px 20px;
  border-radius: 12px;
  background: var(--primary-bgColor);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-toolbar__left,
.table-toolbar__right,
.drawer-footer,
.column-panel {
  display: flex;
  gap: 10px;
}

.table-toolbar__left,
.table-toolbar__right {
  flex-wrap: wrap;
}

.column-panel {
  min-width: 160px;
  flex-direction: column;
}

.empty-block {
  padding: 40px 0;
}

.pager-wrap {
  margin-top: 16px;
  justify-content: flex-end;
}

.drawer-footer {
  justify-content: flex-end;
}

.hidden-input {
  display: none;
}

@media (max-width: 900px) {
  .table-toolbar {
    align-items: flex-start;
  }

  .table-toolbar__left,
  .table-toolbar__right {
    width: 100%;
  }
}
</style>
