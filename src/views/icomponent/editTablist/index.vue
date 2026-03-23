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

type ColumnField = keyof DemoUserRecord | 'actions';
type ColumnFixed = 'left' | 'right' | undefined;
type ColumnFixedValue = 'none' | 'left' | 'right';
type StatusQuickFilter = 'all' | 'enabled' | 'disabled';

interface ColumnSetting {
  field: ColumnField;
  title: string;
  visible: boolean;
  fixed?: ColumnFixed;
}

interface SummaryMetric {
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

interface ImportIssue {
  lineNumber: number;
  raw: string;
  reason: string;
}

interface ImportResultSummary {
  fileName: string;
  totalRows: number;
  successCount: number;
  skippedCount: number;
  issues: ImportIssue[];
}

const roleOptions = [
  { label: '平台管理员', value: '平台管理员' },
  { label: '租户管理员', value: '租户管理员' },
  { label: '运营专员', value: '运营专员' },
  { label: '财务人员', value: '财务人员' },
  { label: '审计人员', value: '审计人员' }
];

const fixedOptions = [
  { label: '不固定', value: 'none' },
  { label: '左侧固定', value: 'left' },
  { label: '右侧固定', value: 'right' }
];

const defaultColumnSettings: ColumnSetting[] = [
  { field: 'username', title: '用户名', visible: true },
  { field: 'role', title: '角色', visible: true },
  { field: 'phone', title: '手机号', visible: true },
  { field: 'email', title: '邮箱', visible: true },
  { field: 'status', title: '状态', visible: true },
  { field: 'createdAt', title: '创建时间', visible: true },
  { field: 'actions', title: '操作', visible: true, fixed: 'right' }
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
const tableCardRef = ref<HTMLElement | null>(null);

const sourceUsers = ref<DemoUserRecord[]>([ ...seedUsers ]);
const checkedRowIds = ref<number[]>([]);
const showUserDrawer = ref(false);
const isEditMode = ref(false);
const editingUserId = ref<number | null>(null);
const isFullscreen = ref(false);
const showColumnPopover = ref(false);
const showDetailDrawer = ref(false);
const showImportResultModal = ref(false);
const detailUser = ref<DemoUserRecord | null>(null);
const columnSettings = ref<ColumnSetting[]>(defaultColumnSettings.map(item => ({ ...item })));
const draftColumnSettings = ref<ColumnSetting[]>(defaultColumnSettings.map(item => ({ ...item })));
const importResult = reactive<ImportResultSummary>({
  fileName: '',
  totalRows: 0,
  successCount: 0,
  skippedCount: 0,
  issues: []
});

const searchForm = reactive({
  username: '',
  role: ''
});
const statusQuickFilter = ref<StatusQuickFilter>('all');

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
  const statusFilter = statusQuickFilter.value;

  return sourceUsers.value.filter((item) => {
    const matchedKeyword = !keyword || item.username.toLowerCase().includes(keyword);
    const matchedRole = !role || item.role === role;
    const matchedStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'enabled'
        ? item.status
        : !item.status;

    return matchedKeyword && matchedRole && matchedStatus;
  });
});

const pagedUsers = computed(() => {
  const start = (pagerConfig.currentPage - 1) * pagerConfig.pageSize;
  return filteredUsers.value.slice(start, start + pagerConfig.pageSize);
});

const printableColumns = computed(() =>
  columnSettings.value.filter(item => item.visible && item.field !== 'actions')
);

const visibleColumnCount = computed(() =>
  columnSettings.value.filter(item => item.visible).length
);

const gridMaxHeight = computed(() => isFullscreen.value ? 860 : 560);

const summaryMetrics = computed<SummaryMetric[]>(() => [
  { label: '用户总数', value: sourceUsers.value.length, tone: 'primary' },
  { label: '筛选结果', value: filteredUsers.value.length, tone: 'success' },
  { label: '已选记录', value: checkedRowIds.value.length, tone: 'warning' },
  { label: '展示字段', value: visibleColumnCount.value, tone: 'info' }
]);

const currentRoleLabel = computed(() =>
  roleOptions.find(item => item.value === searchForm.role)?.label || ''
);

const currentStatusFilterLabel = computed(() => {
  if (statusQuickFilter.value === 'enabled')
    return '启用';

  if (statusQuickFilter.value === 'disabled')
    return '停用';

  return '';
});

const quickStatusOptions = computed(() => {
  const enabledCount = sourceUsers.value.filter(item => item.status).length;
  const disabledCount = sourceUsers.value.filter(item => !item.status).length;

  return [
    { key: 'all' as const, label: '全部用户', count: sourceUsers.value.length },
    { key: 'enabled' as const, label: '启用中', count: enabledCount },
    { key: 'disabled' as const, label: '已停用', count: disabledCount }
  ];
});

const importIssuePreview = computed(() => importResult.issues.slice(0, 6));

type GridColumn = NonNullable<VxeGridProps<DemoUserRecord>['columns']>[number];

const baseColumnMap: Record<ColumnField, GridColumn> = {
  username: {
    field: 'username',
    title: '用户名',
    minWidth: 160,
    slots: { default: 'username' }
  },
  role: {
    field: 'role',
    title: '角色',
    minWidth: 140,
    slots: { default: 'role' }
  },
  phone: {
    field: 'phone',
    title: '手机号',
    minWidth: 150
  },
  email: {
    field: 'email',
    title: '邮箱',
    minWidth: 220
  },
  status: {
    field: 'status',
    title: '状态',
    width: 120,
    slots: { default: 'status' }
  },
  createdAt: {
    field: 'createdAt',
    title: '创建时间',
    minWidth: 180
  },
  actions: {
    field: 'actions',
    title: '操作',
    width: 160,
    slots: { default: 'actions' }
  }
};

const gridColumns = computed<VxeGridProps<DemoUserRecord>['columns']>(() => {
  const settingsMap = new Map(columnSettings.value.map(item => [ item.field, item ]));
  const actionsSetting = settingsMap.get('actions');

  return [
    { type: 'checkbox', width: 56, fixed: 'left' },
    {
      field: 'username',
      title: '用户名',
      minWidth: 160,
      slots: { default: 'username' },
      visible: settingsMap.get('username')?.visible !== false,
      fixed: settingsMap.get('username')?.fixed
    },
    {
      field: 'role',
      title: '角色',
      minWidth: 140,
      slots: { default: 'role' },
      visible: settingsMap.get('role')?.visible !== false,
      fixed: settingsMap.get('role')?.fixed
    },
    {
      field: 'phone',
      title: '手机号',
      minWidth: 150,
      visible: settingsMap.get('phone')?.visible !== false,
      fixed: settingsMap.get('phone')?.fixed
    },
    {
      field: 'email',
      title: '邮箱',
      minWidth: 220,
      visible: settingsMap.get('email')?.visible !== false,
      fixed: settingsMap.get('email')?.fixed
    },
    {
      field: 'status',
      title: '状态',
      width: 120,
      slots: { default: 'status' },
      visible: settingsMap.get('status')?.visible !== false,
      fixed: settingsMap.get('status')?.fixed
    },
    {
      field: 'createdAt',
      title: '创建时间',
      minWidth: 180,
      visible: settingsMap.get('createdAt')?.visible !== false,
      fixed: settingsMap.get('createdAt')?.fixed
    },
    {
      field: 'actions',
      title: '操作',
      width: 160,
      slots: { default: 'actions' },
      visible: actionsSetting?.visible !== false,
      fixed: actionsSetting?.fixed
    }
  ];
});

const orderedGridColumns = computed<VxeGridProps<DemoUserRecord>['columns']>(() => [
  { type: 'checkbox', width: 56, fixed: 'left' },
  ...columnSettings.value.map((item) => {
    const baseColumn = baseColumnMap[item.field];
    return {
      ...baseColumn,
      visible: item.visible,
      fixed: item.fixed
    };
  })
]);

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
  maxHeight: 560,
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

  gridOptions.columns = orderedGridColumns.value;
  gridOptions.data = pagedUsers.value;
  gridOptions.maxHeight = gridMaxHeight.value;
});

function cloneColumnSettings(settings: ColumnSetting[]) {
  return settings.map(item => ({ ...item }));
}

function getFixedValue(fixed?: ColumnFixed): ColumnFixedValue {
  return fixed || 'none';
}

function isValidPhone(value: string) {
  return /^1\d{10}$/.test(value.trim());
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function normalizeCsvCell(value?: string) {
  const normalizedValue = (value || '').replace(/^\uFEFF/, '').trim();

  if (normalizedValue.startsWith('"') && normalizedValue.endsWith('"')) {
    return normalizedValue.slice(1, -1).trim();
  }

  return normalizedValue;
}

function parseImportStatus(value: string) {
  const normalizedValue = value.trim().toLowerCase();

  if ([ 'true', 'enabled', '1', 'yes', '启用', '是' ].includes(normalizedValue)) {
    return true;
  }

  if ([ 'false', 'disabled', '0', 'no', '停用', '否' ].includes(normalizedValue)) {
    return false;
  }

  return null;
}

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

function handleStatusQuickFilterChange(value: StatusQuickFilter) {
  statusQuickFilter.value = value;
  pagerConfig.currentPage = 1;
  clearSelection();
}

function handleReset() {
  searchForm.username = '';
  searchForm.role = '';
  statusQuickFilter.value = 'all';
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

function openDetailDrawer(row: DemoUserRecord) {
  detailUser.value = { ...row };
  showDetailDrawer.value = true;
}

function closeUserDrawer() {
  showUserDrawer.value = false;
  resetUserForm();
  userFormRef.value?.restoreValidation();
}

function closeDetailDrawer() {
  showDetailDrawer.value = false;
  detailUser.value = null;
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

  if (detailUser.value?.id === row.id) {
    closeDetailDrawer();
  }

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

  if (detailUser.value && rowIdSet.has(detailUser.value.id)) {
    closeDetailDrawer();
  }

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

  {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);

    if (rows.length <= 1) {
      message.warning('导入文件内容为空');
      input.value = '';
      return;
    }

    const existingUsernames = new Set(sourceUsers.value.map(item => item.username.toLowerCase()));
    const importedUsernames = new Set<string>();
    const importedUsers: DemoUserRecord[] = [];
    const issues: ImportIssue[] = [];

    rows.slice(1).forEach((line, index) => {
      const lineNumber = index + 2;
      const cells = line.split(',').map(cell => normalizeCsvCell(cell));
      const [ username, role, phone, email, statusText ] = cells;

      const pushIssue = (reason: string) => {
        issues.push({
          lineNumber,
          raw: line,
          reason
        });
      };

      if (cells.length < 5) {
        pushIssue('字段数量不足，请按模板补齐 5 列');
        return;
      }

      if (!username) {
        pushIssue('用户名不能为空');
        return;
      }

      if (!roleOptions.some(item => item.value === role)) {
        pushIssue('角色不存在，请选择系统内置角色');
        return;
      }

      if (!isValidPhone(phone)) {
        pushIssue('手机号格式不正确');
        return;
      }

      if (!isValidEmail(email)) {
        pushIssue('邮箱格式不正确');
        return;
      }

      const parsedStatus = parseImportStatus(statusText);
      if (parsedStatus === null) {
        pushIssue('状态仅支持启用/停用、true/false、1/0');
        return;
      }

      const normalizedUsername = username.toLowerCase();
      if (existingUsernames.has(normalizedUsername) || importedUsernames.has(normalizedUsername)) {
        pushIssue('用户名重复，已自动跳过');
        return;
      }

      importedUsernames.add(normalizedUsername);
      importedUsers.push({
        id: Math.max(...sourceUsers.value.map(item => item.id), 0) + importedUsers.length + 1,
        username,
        role,
        phone,
        email,
        status: parsedStatus,
        createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
      });
    });

    importResult.fileName = file.name;
    importResult.totalRows = rows.length - 1;
    importResult.successCount = importedUsers.length;
    importResult.skippedCount = issues.length;
    importResult.issues = issues;
    showImportResultModal.value = true;

    if (importedUsers.length) {
      sourceUsers.value = [ ...importedUsers, ...sourceUsers.value ];
      pagerConfig.currentPage = 1;
      clearSelection();
    }

    if (importedUsers.length && issues.length) {
      message.warning(`已导入 ${importedUsers.length} 条，跳过 ${issues.length} 条`);
    }
    else if (importedUsers.length) {
      message.success(`成功导入 ${importedUsers.length} 个用户`);
    }
    else {
      message.warning('没有可导入的数据，请查看导入结果');
    }

    input.value = '';
    return;
  }
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

function handleDownloadTemplate() {
  const header = '用户名,角色,手机号,邮箱,状态';
  const rows = [
    'demo_admin,平台管理员,13800001001,demo_admin@luckycolor.com,启用',
    'demo_operator,运营专员,13800001002,demo_operator@luckycolor.com,停用'
  ];

  downloadTextFile('vxe-table-import-template.csv', `\uFEFF${[ header, ...rows ].join('\n')}`);
  message.success('模板已下载');
}

function handleExport() {
  const header = printableColumns.value.map(item => item.title).join(',');
  const rows = filteredUsers.value.map(item =>
    printableColumns.value.map((column) => {
      if (column.field === 'status')
        return item.status ? '启用' : '停用';

      return String(item[column.field as keyof DemoUserRecord] ?? '');
    }).join(',')
  );

  downloadTextFile('vxe-table-users.csv', `\uFEFF${[ header, ...rows ].join('\n')}`);
  message.success('导出成功');
}

function buildPrintTable() {
  const headerHtml = printableColumns.value.map(item => `<th>${item.title}</th>`).join('');
  const bodyHtml = filteredUsers.value.map((item) => {
    const cells = printableColumns.value.map((column) => {
      const value = column.field === 'status'
        ? (item.status ? '启用' : '停用')
        : item[column.field as keyof DemoUserRecord];
      return `<td>${String(value ?? '')}</td>`;
    }).join('');

    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <!doctype html>
    <html lang="zh-CN">
      <head>
        <meta charset="utf-8" />
        <title>VxeTable 打印预览</title>
        <style>
          body { margin: 24px; font-family: "Microsoft YaHei", sans-serif; color: #0f172a; }
          h1 { margin: 0 0 16px; font-size: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #dbe3ee; padding: 10px 12px; text-align: left; font-size: 14px; }
          th { background: #f8fafc; }
          tr:nth-child(even) td { background: #f8fafc; }
        </style>
      </head>
      <body>
        <h1>VxeTable 用户列表</h1>
        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${bodyHtml || `<tr><td colspan="${Math.max(printableColumns.value.length, 1)}">暂无数据</td></tr>`}
          </tbody>
        </table>
      </body>
    </html>
  `;
}

async function handlePrint() {
  if (!printableColumns.value.length) {
    message.warning('请至少保留一个可打印字段');
    return;
  }

  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (!printWindow) {
    message.warning('打印窗口被浏览器拦截，请允许弹窗后重试');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(buildPrintTable());
  printWindow.document.close();

  {
    let hasTriggeredPrint = false;
    const triggerPrint = () => {
      if (hasTriggeredPrint) {
        return;
      }

      hasTriggeredPrint = true;
      printWindow.focus();
      printWindow.print();
    };

    printWindow.onload = triggerPrint;
    printWindow.onafterprint = () => {
      printWindow.close();
    };
    window.setTimeout(triggerPrint, 260);
    return;
  }
}

function handleRefresh() {
  sourceUsers.value = [ ...seedUsers ];
  pagerConfig.currentPage = 1;
  searchForm.username = '';
  searchForm.role = '';
  statusQuickFilter.value = 'all';
  clearSelection();
  message.success('表格已刷新');
}

function syncFullscreenState() {
  isFullscreen.value = document.fullscreenElement === tableCardRef.value;
}

async function handleToggleFullscreen() {
  const target = tableCardRef.value;

  if (!target) {
    return;
  }

  try {
    if (document.fullscreenElement === target) {
      await document.exitFullscreen();
      return;
    }

    if (document.fullscreenElement && document.fullscreenElement !== target) {
      await document.exitFullscreen();
    }

    await target.requestFullscreen();
  }
  catch {
    message.warning('当前环境暂不支持全屏展示');
  }
}

function syncDraftColumnSettings() {
  draftColumnSettings.value = cloneColumnSettings(columnSettings.value);
}

function handleColumnPopoverShow(show: boolean) {
  showColumnPopover.value = show;

  if (show) {
    syncDraftColumnSettings();
  }
}

function updateDraftVisible(field: ColumnField, checked: boolean) {
  draftColumnSettings.value = draftColumnSettings.value.map(item =>
    item.field === field
      ? { ...item, visible: checked }
      : item
  );
}

function updateDraftFixed(field: ColumnField, value: ColumnFixedValue) {
  draftColumnSettings.value = draftColumnSettings.value.map(item =>
    item.field === field
      ? { ...item, fixed: value === 'none' ? undefined : value }
      : item
  );
}

function canMoveDraftColumn(field: ColumnField, direction: 'up' | 'down') {
  const currentIndex = draftColumnSettings.value.findIndex(item => item.field === field);
  if (currentIndex < 0) {
    return false;
  }

  return direction === 'up'
    ? currentIndex > 0
    : currentIndex < draftColumnSettings.value.length - 1;
}

function moveDraftColumn(field: ColumnField, direction: 'up' | 'down') {
  const currentIndex = draftColumnSettings.value.findIndex(item => item.field === field);
  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= draftColumnSettings.value.length) {
    return;
  }

  const nextSettings = cloneColumnSettings(draftColumnSettings.value);
  [ nextSettings[currentIndex], nextSettings[targetIndex] ] = [ nextSettings[targetIndex], nextSettings[currentIndex] ];
  draftColumnSettings.value = nextSettings;
}

function resetDraftColumnSettings() {
  draftColumnSettings.value = cloneColumnSettings(defaultColumnSettings);
}

function applyColumnSettings() {
  if (!draftColumnSettings.value.some(item => item.visible)) {
    message.warning('至少保留一个展示字段');
    return;
  }

  columnSettings.value = cloneColumnSettings(draftColumnSettings.value);
  showColumnPopover.value = false;
  message.success('列设置已更新');
}

function handleStatusChange(row: DemoUserRecord, value: boolean) {
  row.status = value;
  sourceUsers.value = sourceUsers.value.map(item =>
    item.id === row.id ? { ...item, status: value } : item
  );
}

onMounted(() => {
  document.addEventListener('fullscreenchange', syncFullscreenState);
});

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', syncFullscreenState);
});
</script>

<template>
  <div class="vxe-demo-page">
    <section class="hero-card">
      <div class="hero-copy">
        <span class="hero-badge">Feature Demo</span>
        <h2>VxeTable 用户管理演示</h2>
        <p>把搜索、批量操作、字段配置、分页和表单编辑放在一张高频后台列表里，方便后续做业务页复用。</p>
      </div>

      <div class="hero-metrics">
        <article
          v-for="item in summaryMetrics"
          :key="item.label"
          class="metric-card"
          :class="`metric-card--${item.tone}`"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </section>

    <div class="filter-card">
      <div class="filter-card__inner">
        <div class="filter-card__heading">
          <strong>快速筛选</strong>
          <span>支持按用户名和角色组合查询，常用筛选放在第一屏就能完成。</span>
        </div>

        <div class="quick-filter-row">
          <button
            v-for="item in quickStatusOptions"
            :key="item.key"
            type="button"
            class="quick-filter-chip"
            :class="{ 'quick-filter-chip--active': statusQuickFilter === item.key }"
            @click="handleStatusQuickFilterChange(item.key)"
          >
            <span>{{ item.label }}</span>
            <strong>{{ item.count }}</strong>
          </button>
        </div>

        <n-form :model="searchForm" inline label-placement="left" class="filter-form">
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
    </div>

    <div
      ref="tableCardRef"
      class="table-card"
      :class="{ 'table-card--fullscreen': isFullscreen }"
    >
      <div class="table-card__header">
        <div class="table-card__copy">
          <strong>用户列表</strong>
          <span>当前筛选后共 {{ filteredUsers.length }} 条数据，分页展示 {{ pagedUsers.length }} 条。</span>
        </div>

        <div class="table-card__tags">
          <n-tag size="small" round type="info">
            页大小 {{ pagerConfig.pageSize }}
          </n-tag>
          <n-tag v-if="searchForm.username" size="small" round type="success">
            用户名: {{ searchForm.username }}
          </n-tag>
          <n-tag v-if="currentRoleLabel" size="small" round type="warning">
            角色: {{ currentRoleLabel }}
          </n-tag>
          <n-tag v-if="currentStatusFilterLabel" size="small" round type="success">
            状态: {{ currentStatusFilterLabel }}
          </n-tag>
          <n-tag v-if="checkedRowIds.length" size="small" round type="error">
            已勾选 {{ checkedRowIds.length }} 条
          </n-tag>
        </div>
      </div>

      <div class="table-toolbar">
        <div class="table-toolbar__left action-bar">
          <div class="action-bar__group action-bar__group--primary">
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

          <div class="action-bar__hint">
            <Icon icon="solar:info-circle-linear" />
            <span>勾选数据后可直接批量删除，字段配置会实时影响导出与打印。</span>
          </div>
        </div>

        <div class="table-toolbar__right action-bar">
          <input
            ref="importInputRef"
            type="file"
            accept=".csv"
            class="hidden-input"
            @change="handleImportFile"
          >

          <div class="action-bar__group action-bar__group--icon">
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  title="下载模板"
                  aria-label="下载模板"
                  @click="handleDownloadTemplate"
                >
                  <Icon icon="mdi:file-download-outline" />
                </n-button>
              </template>
              下载模板
            </n-tooltip>

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  title="导入"
                  aria-label="导入"
                  @click="handleImportClick"
                >
                  <Icon icon="mdi:import" />
                </n-button>
              </template>
              导入
            </n-tooltip>

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  title="导出"
                  aria-label="导出"
                  @click="handleExport"
                >
                  <Icon icon="mdi:export-variant" />
                </n-button>
              </template>
              导出
            </n-tooltip>

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  title="打印"
                  aria-label="打印"
                  @click="handlePrint"
                >
                  <Icon icon="mdi:printer-outline" />
                </n-button>
              </template>
              打印
            </n-tooltip>

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  title="刷新"
                  aria-label="刷新"
                  @click="handleRefresh"
                >
                  <Icon icon="mdi:refresh" />
                </n-button>
              </template>
              刷新
            </n-tooltip>

            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  :title="isFullscreen ? '退出全屏' : '全屏放大'"
                  :aria-label="isFullscreen ? '退出全屏' : '全屏放大'"
                  @click="handleToggleFullscreen"
                >
                  <Icon :icon="isFullscreen ? 'mdi:fullscreen-exit' : 'mdi:fullscreen'" />
                </n-button>
              </template>
              {{ isFullscreen ? '退出全屏' : '全屏放大' }}
            </n-tooltip>

            <n-popover
              trigger="click"
              placement="bottom-end"
              :show="showColumnPopover"
              @update:show="handleColumnPopoverShow"
            >
              <template #trigger>
                <n-tooltip trigger="hover">
                  <template #trigger>
                    <n-button
                      quaternary
                      circle
                      title="列字段操作"
                      aria-label="列字段操作"
                    >
                      <Icon icon="mdi:view-column-outline" />
                    </n-button>
                  </template>
                  列字段操作
                </n-tooltip>
              </template>

              <div class="column-panel">
                <div class="column-panel__header">
                  <span>列字段设置</span>
                  <span>可见性与固定位置</span>
                </div>

                <div class="column-panel__body">
                  <div
                    v-for="(item, index) in draftColumnSettings"
                    :key="item.field"
                    class="column-panel__row"
                  >
                    <span class="column-panel__index">{{ index + 1 }}</span>

                    <n-checkbox
                      :checked="item.visible"
                      @update:checked="(checked: boolean) => updateDraftVisible(item.field, checked)"
                    >
                      {{ item.title }}
                    </n-checkbox>

                    <div class="column-panel__sorters">
                      <n-button
                        quaternary
                        circle
                        size="small"
                        :disabled="!canMoveDraftColumn(item.field, 'up')"
                        :title="`上移${item.title}`"
                        :aria-label="`上移${item.title}`"
                        @click="moveDraftColumn(item.field, 'up')"
                      >
                        <Icon icon="mdi:arrow-up" />
                      </n-button>
                      <n-button
                        quaternary
                        circle
                        size="small"
                        :disabled="!canMoveDraftColumn(item.field, 'down')"
                        :title="`下移${item.title}`"
                        :aria-label="`下移${item.title}`"
                        @click="moveDraftColumn(item.field, 'down')"
                      >
                        <Icon icon="mdi:arrow-down" />
                      </n-button>
                    </div>

                    <n-select
                      size="small"
                      class="column-panel__select"
                      :value="getFixedValue(item.fixed)"
                      :options="fixedOptions"
                      @update:value="(value: ColumnFixedValue) => updateDraftFixed(item.field, value)"
                    />
                  </div>
                </div>

                <div class="column-panel__footer">
                  <n-button size="small" @click="resetDraftColumnSettings">
                    重置
                  </n-button>
                  <n-button size="small" type="primary" @click="applyColumnSettings">
                    确认
                  </n-button>
                </div>
              </div>
            </n-popover>
          </div>

          <div class="action-bar__meta">
            <span>可视列 {{ visibleColumnCount }}</span>
          </div>
        </div>
      </div>

      <div v-if="checkedRowIds.length" class="selection-bar">
        <div class="selection-bar__copy">
          <Icon icon="solar:check-circle-linear" />
          <span>已选中 {{ checkedRowIds.length }} 条记录，可以直接进行批量删除或切换字段观察。</span>
        </div>
        <n-button text type="primary" @click="clearSelection">
          清空选择
        </n-button>
      </div>

      <div class="table-shell">
        <VxeGrid
          ref="gridRef"
          v-bind="gridOptions"
          @checkbox-change="syncCheckedRows"
          @checkbox-all="syncCheckedRows"
        >
          <template #username="{ row }">
            <n-button text class="username-link" @click="openDetailDrawer(row)">
              <span>{{ row.username }}</span>
            </n-button>
          </template>

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

    <n-drawer v-model:show="showDetailDrawer" :width="420" placement="right">
      <n-drawer-content title="用户详情">
        <template v-if="detailUser">
          <div class="detail-panel">
            <div class="detail-panel__hero">
              <div>
                <strong>{{ detailUser.username }}</strong>
                <span>{{ detailUser.role }}</span>
              </div>
              <n-tag :type="detailUser.status ? 'success' : 'warning'" round>
                {{ detailUser.status ? '启用' : '停用' }}
              </n-tag>
            </div>

            <div class="detail-panel__list">
              <div class="detail-item">
                <span>手机号</span>
                <strong>{{ detailUser.phone }}</strong>
              </div>
              <div class="detail-item">
                <span>邮箱</span>
                <strong>{{ detailUser.email }}</strong>
              </div>
              <div class="detail-item">
                <span>创建时间</span>
                <strong>{{ detailUser.createdAt }}</strong>
              </div>
            </div>

            <div class="detail-panel__tips">
              <Icon icon="solar:lightbulb-linear" />
              <span>这个详情抽屉适合后续扩展最近登录、数据权限、关联租户等扩展信息。</span>
            </div>
          </div>
        </template>

        <template #footer>
          <div class="drawer-footer">
            <n-button @click="closeDetailDrawer">
              关闭
            </n-button>
            <n-button
              v-if="detailUser"
              type="primary"
              @click="openEditDrawer(detailUser); closeDetailDrawer()"
            >
              编辑当前用户
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
    <n-modal
      v-model:show="showImportResultModal"
      preset="card"
      title="导入结果"
      class="import-result-modal"
      :style="{ width: 'min(720px, 92vw)' }"
    >
      <div class="import-result">
        <div class="import-result__metrics">
          <article class="import-result__metric">
            <span>导入文件</span>
            <strong>{{ importResult.fileName || '--' }}</strong>
          </article>
          <article class="import-result__metric">
            <span>数据总行数</span>
            <strong>{{ importResult.totalRows }}</strong>
          </article>
          <article class="import-result__metric import-result__metric--success">
            <span>成功导入</span>
            <strong>{{ importResult.successCount }}</strong>
          </article>
          <article class="import-result__metric import-result__metric--warning">
            <span>跳过记录</span>
            <strong>{{ importResult.skippedCount }}</strong>
          </article>
        </div>

        <div class="import-result__headline">
          <strong>{{ importResult.successCount ? '导入已完成' : '未导入任何数据' }}</strong>
          <span v-if="importResult.skippedCount">
            以下展示前 {{ importIssuePreview.length }} 条异常记录，方便快速修正后再次导入。
          </span>
          <span v-else>本次导入没有异常记录，可以继续后续操作。</span>
        </div>

        <div v-if="importIssuePreview.length" class="import-result__issues">
          <article
            v-for="item in importIssuePreview"
            :key="`${item.lineNumber}-${item.reason}`"
            class="import-result__issue"
          >
            <div class="import-result__issue-header">
              <strong>第 {{ item.lineNumber }} 行</strong>
              <span>{{ item.reason }}</span>
            </div>
            <p>{{ item.raw }}</p>
          </article>
        </div>
        <n-empty v-else description="本次导入没有异常记录" />
      </div>

      <template #footer>
        <div class="drawer-footer">
          <n-button type="primary" @click="showImportResultModal = false">
            我知道了
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped lang="less">
.vxe-demo-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.hero-card {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(340px, 460px);
  gap: 18px;
  padding: 22px 24px;
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.02), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.hero-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
}

.hero-badge {
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.15;
  color: #0f172a;
}

.hero-copy p {
  margin: 0;
  max-width: 720px;
  color: #475569;
  line-height: 1.7;
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.14);
  backdrop-filter: blur(12px);
}

.metric-card span {
  display: block;
  color: #64748b;
  font-size: 12px;
}

.metric-card strong {
  display: block;
  margin-top: 10px;
  font-size: 30px;
  line-height: 1;
}

.metric-card--primary strong {
  color: #2563eb;
}

.metric-card--success strong {
  color: #059669;
}

.metric-card--warning strong {
  color: #d97706;
}

.metric-card--info strong {
  color: #0891b2;
}

.filter-card,
.table-card {
  padding: 20px 22px;
  border-radius: 16px;
  background: var(--primary-bgColor);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.04);
}

.filter-card {
  display: flex;
  justify-content: center;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.03), transparent 100%),
    var(--primary-bgColor);
}

.filter-card__inner {
  width: min(100%, 920px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
}

.filter-card__heading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.filter-card__heading strong {
  font-size: 16px;
  color: #0f172a;
}

.filter-card__heading span {
  color: #64748b;
  font-size: 13px;
}

.quick-filter-row {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.quick-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.9);
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-filter-chip span {
  font-size: 13px;
}

.quick-filter-chip strong {
  min-width: 24px;
  font-size: 14px;
}

.quick-filter-chip:hover {
  border-color: rgba(37, 99, 235, 0.24);
  transform: translateY(-1px);
}

.quick-filter-chip--active {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.14), rgba(14, 165, 233, 0.08));
  border-color: rgba(37, 99, 235, 0.34);
  color: #1d4ed8;
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.08);
}

.filter-form {
  justify-content: center;
}

.table-card {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-card--fullscreen {
  position: relative;
  height: 100%;
}

.table-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.table-card__copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.table-card__copy strong {
  font-size: 18px;
  color: #0f172a;
}

.table-card__copy span {
  color: #64748b;
  font-size: 13px;
}

.table-card__tags {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.table-card:fullscreen {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 22px 24px;
  border-radius: 0;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95));
  box-sizing: border-box;
}

.table-card:fullscreen .table-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
}

.table-card:fullscreen :deep(.vxe-grid) {
  height: calc(100vh - 210px);
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-bar__group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.action-bar__group--primary {
  padding: 10px 12px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.03), rgba(15, 23, 42, 0.01));
  border: 1px solid rgba(37, 99, 235, 0.08);
}

.action-bar__group--icon {
  padding: 6px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.action-bar__hint,
.action-bar__meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 12px;
}

.action-bar__hint {
  padding: 0 4px;
}

.action-bar__hint :deep(svg),
.action-bar__meta :deep(svg) {
  font-size: 14px;
}

.table-toolbar__left,
.table-toolbar__right,
.drawer-footer {
  display: flex;
  gap: 10px;
}

.table-toolbar__left,
.table-toolbar__right {
  flex-wrap: wrap;
  align-items: center;
}

.table-shell {
  padding: 12px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.selection-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.selection-bar__copy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1e40af;
  font-size: 13px;
}

.selection-bar__copy :deep(svg) {
  font-size: 16px;
}

.table-shell :deep(.vxe-grid) {
  border-radius: 12px;
  overflow: hidden;
}

.table-shell :deep(.vxe-table--header-wrapper) {
  position: sticky;
  top: 0;
  z-index: 4;
}

.table-shell :deep(.vxe-table--header-wrapper) {
  background: #f8fafc;
}

.table-shell :deep(.vxe-header--column) {
  background: #f8fafc;
  font-weight: 600;
  color: #334155;
}

.table-shell :deep(.vxe-body--row.row--hover) {
  background-color: rgba(37, 99, 235, 0.03);
}

.table-shell :deep(.vxe-body--column) {
  transition: background-color 0.2s ease;
}

.username-link {
  padding: 0;
  font-weight: 600;
}

.username-link span {
  border-bottom: 1px dashed rgba(37, 99, 235, 0.3);
}

.detail-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-panel__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(14, 165, 233, 0.04));
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.detail-panel__hero strong {
  display: block;
  font-size: 22px;
  color: #0f172a;
}

.detail-panel__hero span {
  display: block;
  margin-top: 6px;
  color: #64748b;
}

.detail-panel__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.detail-item span {
  color: #64748b;
}

.detail-item strong {
  color: #0f172a;
  text-align: right;
}

.detail-panel__tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(14, 165, 233, 0.08);
  color: #0f172a;
  line-height: 1.7;
}

.detail-panel__tips :deep(svg) {
  margin-top: 2px;
  font-size: 18px;
  color: #0284c7;
}

.column-panel {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px;
}

.column-panel__header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 2px 2px 0;
}

.column-panel__header span:first-child {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.column-panel__header span:last-child {
  font-size: 12px;
  color: #64748b;
}

.column-panel__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.column-panel__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.column-panel__index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.column-panel__sorters {
  display: flex;
  align-items: center;
  gap: 4px;
}

.column-panel__select {
  width: 124px;
  flex-shrink: 0;
  margin-left: auto;
}

.import-result {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.import-result__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.import-result__metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 14px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.import-result__metric span {
  font-size: 12px;
  color: #64748b;
}

.import-result__metric strong {
  font-size: 18px;
  color: #0f172a;
  word-break: break-all;
}

.import-result__metric--success {
  background: rgba(22, 163, 74, 0.08);
  border-color: rgba(22, 163, 74, 0.18);
}

.import-result__metric--warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.22);
}

.import-result__headline {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.import-result__headline strong {
  font-size: 16px;
  color: #0f172a;
}

.import-result__headline span {
  font-size: 13px;
  color: #64748b;
}

.import-result__issues {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.import-result__issue {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 251, 235, 0.92);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.import-result__issue-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.import-result__issue-header strong {
  color: #92400e;
}

.import-result__issue-header span,
.import-result__issue p {
  font-size: 13px;
  color: #78350f;
}

.import-result__issue p {
  margin: 0;
  word-break: break-all;
}

.column-panel__footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 6px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
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
  .hero-card {
    grid-template-columns: 1fr;
  }

  .hero-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .table-toolbar {
    align-items: flex-start;
  }

  .table-toolbar__left,
  .table-toolbar__right {
    width: 100%;
  }

  .table-card__header {
    flex-direction: column;
  }

  .filter-card__inner {
    justify-content: flex-start;
  }

  .filter-card__heading {
    align-items: flex-start;
    text-align: left;
  }

  .filter-form {
    justify-content: flex-start;
  }

  .quick-filter-row {
    justify-content: flex-start;
  }

  .action-bar {
    width: 100%;
    align-items: flex-start;
    flex-direction: column;
  }

  .selection-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .action-bar__group--icon {
    border-radius: 16px;
  }

  .column-panel {
    width: min(86vw, 320px);
  }

  .column-panel__row {
    align-items: flex-start;
    flex-direction: column;
  }

  .column-panel__sorters {
    align-self: flex-end;
  }

  .column-panel__select {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .hero-metrics {
    grid-template-columns: 1fr;
  }

  .metric-card strong {
    font-size: 26px;
  }

  .import-result__metrics {
    grid-template-columns: 1fr;
  }

  .import-result__issue-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
