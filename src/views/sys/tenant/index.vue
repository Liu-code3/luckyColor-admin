<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import type { TenantInitResult, TenantPackageRecord, TenantRecord, TenantStatus } from '@/api';
import { Icon } from '@iconify/vue';
import {
  createTenantApi,
  getTenantDetailApi,
  getTenantPackagePageApi,
  getTenantPageApi,

  updateTenantApi
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import sysConfig from '@/config';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { message } from '@/utils/message';

defineOptions({
  name: 'SystemTenant'
});

interface TenantFormState {
  code: string;
  name: string;
  packageId: string | null;
  status: TenantStatus;
  expiresAt: number | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  remark: string;
  adminUsername: string;
  adminPassword: string;
  adminNickname: string;
}

interface SummaryCard {
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

const tenantButtonCodes = BUTTON_PERMISSION_CODES.tenantManage;
const { hasPermission } = usePermission();
const defaultAdminUsername = sysConfig.DEFAULT_LOGIN_USERNAME;
const defaultAdminPassword = sysConfig.DEFAULT_LOGIN_PASSWORD;

const tenantStatusOptions: Array<{ label: string; value: TenantStatus }> = [
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
  { label: '冻结', value: 'FROZEN' }
];

const loading = ref(false);
const submitting = ref(false);
const packageLoading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const statusFilter = ref<TenantStatus | null>(null);
const tenantList = ref<TenantRecord[]>([]);
const tenantPackages = ref<TenantPackageRecord[]>([]);

const tenantFormRef = ref<FormInst | null>(null);
const showTenantDrawer = ref(false);
const isEditMode = ref(false);
const editingTenantId = ref('');
const showInitResultModal = ref(false);
const tenantInitResult = ref<TenantInitResult | null>(null);

const tenantForm = reactive<TenantFormState>({
  code: '',
  name: '',
  packageId: null,
  status: 'ACTIVE',
  expiresAt: null,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  remark: '',
  adminUsername: defaultAdminUsername,
  adminPassword: defaultAdminPassword,
  adminNickname: ''
});

const tenantPackageOptions = computed(() =>
  tenantPackages.value.map(item => ({
    label: `${item.name}（${item.code}）${item.status ? '' : ' · 已停用'}`,
    value: item.id,
    disabled: !item.status
  }))
);

const selectedPackage = computed(() =>
  tenantPackages.value.find(item => item.id === tenantForm.packageId) || null
);
const canCreateTenant = computed(() => hasPermission(tenantButtonCodes.create));
const canUpdateTenant = computed(() => hasPermission(tenantButtonCodes.update));
const tenantTableColumnCount = computed(() => canUpdateTenant.value ? 8 : 7);

const summaryCards = computed<SummaryCard[]>(() => {
  const now = Date.now();
  const expiringSoon = tenantList.value.filter((item) => {
    if (!item.expiresAt)
      return false;

    const diff = new Date(item.expiresAt).getTime() - now;
    return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  return [
    { label: '租户总数', value: total.value, tone: 'primary' },
    {
      label: '启用中',
      value: tenantList.value.filter(item => item.status === 'ACTIVE').length,
      tone: 'success'
    },
    {
      label: '冻结/停用',
      value: tenantList.value.filter(item => item.status !== 'ACTIVE').length,
      tone: 'warning'
    },
    { label: '30 天内到期', value: expiringSoon, tone: 'info' }
  ];
});

const tenantFormRules = computed<FormRules>(() => ({
  code: isEditMode.value
    ? []
    : [
        {
          required: true,
          message: '请输入租户编码',
          trigger: [ 'blur', 'input' ]
        },
        {
          validator: (_, value: string) => /^[a-z][a-z0-9_-]{1,30}$/.test(value.trim()),
          message: '租户编码需以小写字母开头，支持小写字母、数字、下划线和中划线',
          trigger: [ 'blur', 'input' ]
        }
      ],
  name: [
    {
      required: true,
      message: '请输入租户名称',
      trigger: [ 'blur', 'input' ]
    }
  ],
  contactPhone: [
    {
      validator: (_, value: string) => !value || /^[0-9\-+() ]{6,20}$/.test(value.trim()),
      message: '请输入合法的联系电话',
      trigger: [ 'blur', 'input' ]
    }
  ],
  contactEmail: [
    {
      validator: (_, value: string) => !value || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value.trim()),
      message: '请输入合法的联系邮箱',
      trigger: [ 'blur', 'input' ]
    }
  ],
  adminUsername: isEditMode.value
    ? []
    : [
        {
          required: true,
          message: '请输入管理员账号',
          trigger: [ 'blur', 'input' ]
        },
        {
          validator: (_, value: string) => /^\w{3,20}$/.test(value.trim()),
          message: '管理员账号需为 3-20 位字母、数字或下划线',
          trigger: [ 'blur', 'input' ]
        }
      ],
  adminPassword: isEditMode.value
    ? []
    : [
        {
          required: true,
          message: '请输入管理员初始密码',
          trigger: [ 'blur', 'input' ]
        },
        {
          validator: (_, value: string) => value.trim().length >= 6,
          message: '管理员初始密码至少 6 位',
          trigger: [ 'blur', 'input' ]
        }
      ],
  remark: [
    {
      validator: (_, value: string) => !value || value.trim().length <= 200,
      message: '备注不能超过 200 个字符',
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

function formatExpiresAt(value?: string | null) {
  if (!value)
    return '长期有效';

  return formatDateTime(value);
}

function getTenantStatusLabel(status: TenantStatus) {
  return tenantStatusOptions.find(option => option.value === status)?.label || status;
}

function getTenantStatusType(status: TenantStatus) {
  if (status === 'ACTIVE')
    return 'success';
  if (status === 'FROZEN')
    return 'warning';
  return 'error';
}

function getSummaryCardClass(tone: SummaryCard['tone']) {
  return `summary-card summary-card--${tone}`;
}

function resetTenantForm() {
  editingTenantId.value = '';
  tenantForm.code = '';
  tenantForm.name = '';
  tenantForm.packageId = null;
  tenantForm.status = 'ACTIVE';
  tenantForm.expiresAt = null;
  tenantForm.contactName = '';
  tenantForm.contactPhone = '';
  tenantForm.contactEmail = '';
  tenantForm.remark = '';
  tenantForm.adminUsername = defaultAdminUsername;
  tenantForm.adminPassword = defaultAdminPassword;
  tenantForm.adminNickname = '';
}

async function ensureTenantPackages(force = false) {
  if (tenantPackages.value.length && !force)
    return;

  packageLoading.value = true;
  try {
    const { data } = await getTenantPackagePageApi({
      page: 1,
      size: 200
    });
    tenantPackages.value = data.records;
  }
  finally {
    packageLoading.value = false;
  }
}

async function fetchTenants(currentPage = page.value) {
  loading.value = true;
  try {
    const { data } = await getTenantPageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: statusFilter.value || undefined
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    tenantList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchTenants(1);
}

function handleReset() {
  keyword.value = '';
  statusFilter.value = null;
  page.value = 1;
  fetchTenants(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchTenants(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchTenants(1);
}

async function openCreateDrawer() {
  isEditMode.value = false;
  resetTenantForm();
  await ensureTenantPackages();
  showTenantDrawer.value = true;
}

async function openEditDrawer(tenant: TenantRecord) {
  isEditMode.value = true;
  resetTenantForm();
  editingTenantId.value = tenant.id;
  await ensureTenantPackages();
  showTenantDrawer.value = true;

  const { data } = await getTenantDetailApi(tenant.id);
  tenantForm.code = data.code;
  tenantForm.name = data.name;
  tenantForm.packageId = data.tenantPackage?.id || null;
  tenantForm.status = data.status;
  tenantForm.expiresAt = data.expiresAt ? new Date(data.expiresAt).getTime() : null;
  tenantForm.contactName = data.contactName || '';
  tenantForm.contactPhone = data.contactPhone || '';
  tenantForm.contactEmail = data.contactEmail || '';
  tenantForm.remark = data.remark || '';
}

function closeTenantDrawer() {
  showTenantDrawer.value = false;
  resetTenantForm();
  tenantFormRef.value?.restoreValidation();
}

function closeInitResultModal() {
  showInitResultModal.value = false;
  tenantInitResult.value = null;
}

async function submitTenantForm() {
  await tenantFormRef.value?.validate();

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateTenantApi(editingTenantId.value, {
        name: tenantForm.name.trim(),
        packageId: tenantForm.packageId || undefined,
        status: tenantForm.status,
        expiresAt: tenantForm.expiresAt ? new Date(tenantForm.expiresAt).toISOString() : null,
        contactName: tenantForm.contactName.trim() || null,
        contactPhone: tenantForm.contactPhone.trim() || null,
        contactEmail: tenantForm.contactEmail.trim() || null,
        remark: tenantForm.remark.trim() || null
      });
      message.success('租户信息已更新');
    }
    else {
      const { data } = await createTenantApi({
        code: tenantForm.code.trim(),
        name: tenantForm.name.trim(),
        packageId: tenantForm.packageId || undefined,
        status: tenantForm.status,
        expiresAt: tenantForm.expiresAt ? new Date(tenantForm.expiresAt).toISOString() : undefined,
        contactName: tenantForm.contactName.trim() || undefined,
        contactPhone: tenantForm.contactPhone.trim() || undefined,
        contactEmail: tenantForm.contactEmail.trim() || undefined,
        remark: tenantForm.remark.trim() || undefined,
        adminUsername: tenantForm.adminUsername.trim() || undefined,
        adminPassword: tenantForm.adminPassword.trim(),
        adminNickname: tenantForm.adminNickname.trim() || undefined
      });

      tenantInitResult.value = data;
      showInitResultModal.value = true;
      message.success(`租户初始化完成，管理员账号：${data.adminUser.username}`);
    }

    closeTenantDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await Promise.all([
      ensureTenantPackages(true),
      fetchTenants(nextPage)
    ]);
  }
  finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([
    ensureTenantPackages(),
    fetchTenants()
  ]);
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
      </article>
    </section>

    <div class="toolbar">
      <div class="toolbar-item toolbar-item--wide">
        <div class="toolbar-label">
          关键字
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入租户名称或编码"
          @keyup.enter="handleSearch"
        />
      </div>
      <div class="toolbar-item">
        <div class="toolbar-label">
          状态
        </div>
        <n-select
          v-model:value="statusFilter"
          clearable
          :options="tenantStatusOptions"
          placeholder="全部状态"
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
      <div v-if="canCreateTenant" class="content-actions">
        <n-button
          v-permission="tenantButtonCodes.create"
          type="primary"
          @click="openCreateDrawer"
        >
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增租户
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>租户名称</th>
              <th>租户编码</th>
              <th>租户套餐</th>
              <th>状态</th>
              <th>联系人</th>
              <th>到期时间</th>
              <th>更新时间</th>
              <th v-if="canUpdateTenant">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tenantList" :key="item.id">
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
                <div class="primary-text">
                  {{ item.tenantPackage?.name || '未绑定套餐' }}
                </div>
                <div class="secondary-text">
                  {{ item.tenantPackage?.code || '-' }}
                </div>
              </td>
              <td>
                <n-tag :type="getTenantStatusType(item.status)">
                  {{ getTenantStatusLabel(item.status) }}
                </n-tag>
              </td>
              <td>
                <div class="primary-text">
                  {{ item.contactName || '-' }}
                </div>
                <div class="secondary-text">
                  {{ item.contactPhone || item.contactEmail || '-' }}
                </div>
              </td>
              <td>{{ formatExpiresAt(item.expiresAt) }}</td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td v-if="canUpdateTenant" class="operation-cell">
                <div class="operation-actions">
                  <n-button
                    v-permission="tenantButtonCodes.update"
                    quaternary
                    type="primary"
                    @click="openEditDrawer(item)"
                  >
                    编辑
                  </n-button>
                </div>
              </td>
            </tr>
            <tr v-if="!tenantList.length">
              <td :colspan="tenantTableColumnCount">
                <n-empty description="暂无租户数据" />
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

  <n-drawer v-model:show="showTenantDrawer" :width="720" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑租户' : '新增租户'">
      <n-form ref="tenantFormRef" :model="tenantForm" :rules="tenantFormRules" label-placement="top">
        <div class="lc-form-stack">
          <section class="lc-form-section">
            <div class="lc-form-section__header">
              <div>
                <p class="lc-form-section__eyebrow">
                  Tenant
                </p>
                <h3 class="lc-form-section__title">
                  {{ isEditMode ? '\u7f16\u8f91\u79df\u6237' : '\u521b\u5efa\u79df\u6237' }}
                </h3>
                <p class="lc-form-section__description">
                  {{ '\u5c06\u79df\u6237\u57fa\u7840\u4fe1\u606f\uff0c\u5957\u9910\u548c\u8054\u7cfb\u65b9\u5f0f\u96c6\u4e2d\u914d\u7f6e\uff0c\u65b9\u4fbf\u5feb\u901f\u5b8c\u6210\u5165\u9a7b\u3002' }}
                </p>
              </div>
            </div>
            <n-grid :cols="2" :x-gap="12">
              <n-form-item-gi label="租户编码" path="code">
                <n-input
                  v-model:value="tenantForm.code"
                  :disabled="isEditMode"
                  placeholder="例如 acme"
                />
              </n-form-item-gi>
              <n-form-item-gi label="租户名称" path="name">
                <n-input v-model:value="tenantForm.name" placeholder="请输入租户名称" />
              </n-form-item-gi>
              <n-form-item-gi label="租户套餐" path="packageId">
                <n-select
                  v-model:value="tenantForm.packageId"
                  clearable
                  :loading="packageLoading"
                  :options="tenantPackageOptions"
                  placeholder="请选择租户套餐"
                />
              </n-form-item-gi>
              <n-form-item-gi label="租户状态" path="status">
                <n-select v-model:value="tenantForm.status" :options="tenantStatusOptions" />
              </n-form-item-gi>
              <n-form-item-gi label="到期时间" path="expiresAt">
                <n-date-picker
                  v-model:value="tenantForm.expiresAt"
                  class="w-full"
                  clearable
                  type="datetime"
                />
              </n-form-item-gi>
              <n-form-item-gi label="联系人" path="contactName">
                <n-input v-model:value="tenantForm.contactName" placeholder="请输入联系人" />
              </n-form-item-gi>
              <n-form-item-gi label="联系电话" path="contactPhone">
                <n-input v-model:value="tenantForm.contactPhone" placeholder="请输入联系电话" />
              </n-form-item-gi>
              <n-form-item-gi label="联系邮箱" path="contactEmail">
                <n-input v-model:value="tenantForm.contactEmail" placeholder="请输入联系邮箱" />
              </n-form-item-gi>
            </n-grid>

            <div v-if="selectedPackage" class="package-hint">
              <div class="package-hint__header">
                <strong>{{ selectedPackage.name }}</strong>
                <n-tag size="small" :type="selectedPackage.status ? 'success' : 'warning'">
                  {{ selectedPackage.status ? '可用' : '已停用' }}
                </n-tag>
              </div>
              <div class="package-hint__meta">
                用户上限 {{ selectedPackage.maxUsers ?? 0 }} / 角色上限 {{ selectedPackage.maxRoles ?? 0 }} /
                菜单上限 {{ selectedPackage.maxMenus ?? 0 }}
              </div>
            </div>

            <template v-if="!isEditMode">
              <n-divider>初始化管理员</n-divider>
              <n-grid :cols="2" :x-gap="12">
                <n-form-item-gi label="管理员账号" path="adminUsername">
                  <n-input v-model:value="tenantForm.adminUsername" placeholder="默认 admin" />
                </n-form-item-gi>
                <n-form-item-gi label="管理员昵称" path="adminNickname">
                  <n-input v-model:value="tenantForm.adminNickname" placeholder="选填" />
                </n-form-item-gi>
                <n-form-item-gi :span="2" label="管理员初始密码" path="adminPassword">
                  <n-input
                    v-model:value="tenantForm.adminPassword"
                    type="password"
                    show-password-on="mousedown"
                    placeholder="请输入管理员初始密码"
                  />
                </n-form-item-gi>
              </n-grid>
            </template>

            <n-form-item label="备注" path="remark">
              <n-input
                v-model:value="tenantForm.remark"
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
          <n-button @click="closeTenantDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitTenantForm">
            保存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>

  <n-modal v-model:show="showInitResultModal" preset="card" title="租户初始化完成" style="width: 760px;">
    <template v-if="tenantInitResult">
      <div class="result-grid">
        <article class="result-panel">
          <div class="result-panel__title">
            租户信息
          </div>
          <div class="result-line">
            <span>租户名称</span>
            <strong>{{ tenantInitResult.tenant.name }}</strong>
          </div>
          <div class="result-line">
            <span>租户编码</span>
            <strong>{{ tenantInitResult.tenant.code }}</strong>
          </div>
          <div class="result-line">
            <span>绑定套餐</span>
            <strong>{{ tenantInitResult.tenant.tenantPackage?.name || '未绑定' }}</strong>
          </div>
        </article>

        <article class="result-panel">
          <div class="result-panel__title">
            管理员账号
          </div>
          <div class="result-line">
            <span>用户名</span>
            <strong>{{ tenantInitResult.adminUser.username }}</strong>
          </div>
          <div class="result-line">
            <span>昵称</span>
            <strong>{{ tenantInitResult.adminUser.nickname || '-' }}</strong>
          </div>
          <div class="result-line">
            <span>系统角色</span>
            <strong>{{ tenantInitResult.roles.length }} 个</strong>
          </div>
        </article>
      </div>

      <div class="result-list">
        <div class="result-list__title">
          初始化角色
        </div>
        <n-space>
          <n-tag v-for="role in tenantInitResult.roles" :key="role.id" type="info">
            {{ role.name }} / {{ role.code }}
          </n-tag>
        </n-space>
      </div>

      <div class="result-list">
        <div class="result-list__title">
          初始化部门
        </div>
        <n-space>
          <n-tag v-for="department in tenantInitResult.departments" :key="department.id" type="success">
            {{ department.name }}
          </n-tag>
        </n-space>
      </div>

      <div class="result-grid result-grid--compact">
        <article class="result-panel">
          <div class="result-panel__title">
            已分配菜单
          </div>
          <strong class="result-count">{{ tenantInitResult.menuIds.length }}</strong>
        </article>
        <article class="result-panel">
          <div class="result-panel__title">
            已初始化字典
          </div>
          <strong class="result-count">{{ tenantInitResult.dictionaryIds.length }}</strong>
        </article>
      </div>
    </template>

    <template #footer>
      <div class="drawer-footer">
        <n-button type="primary" @click="closeInitResultModal">
          我知道了
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

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-item {
  display: flex;
  align-items: center;
  width: 260px;
}

.toolbar-item--wide {
  width: 360px;
}

.toolbar-label {
  width: 72px;
  flex-shrink: 0;
}

.content-card {
  min-height: calc(100vh - 292px);
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
}

@import '@/styles/table-operation.less';

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.package-hint {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid var(--lc-accent-border);
  background: linear-gradient(180deg, var(--lc-accent-faint), transparent 78%);
}

.package-hint__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.package-hint__meta {
  margin-top: 8px;
  color: var(--lc-text-soft);
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.result-grid--compact {
  margin-top: 16px;
}

.result-panel {
  padding: 16px;
  border-radius: 16px;
}

.result-panel__title,
.result-list__title {
  margin-bottom: 12px;
  font-weight: 600;
}

.result-line {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
}

.result-line span {
  color: var(--lc-text-soft);
}

.result-count {
  display: block;
  font-size: 30px;
  color: var(--lc-accent);
}

.result-list {
  margin-top: 16px;
}

@media (max-width: 1280px) {
  .summary-grid,
  .result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .summary-grid,
  .result-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-item,
  .toolbar-item--wide {
    width: 100%;
  }
}
</style>
