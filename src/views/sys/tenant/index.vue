<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { useMessage } from 'naive-ui';
import {
  createTenantApi,
  getTenantDetailApi,
  getTenantPageApi,
  getTenantPackagePageApi,
  updateTenantApi,
  type TenantPackageRecord,
  type TenantRecord,
  type TenantStatus
} from '@/api';

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

const message = useMessage();

const loading = ref(false);
const submitting = ref(false);
const packageLoading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const statusFilter = ref<TenantStatus | null>(null);
const tenantList = ref<TenantRecord[]>([]);
const tenantPackageOptions = ref<Array<{ label: string, value: string }>>([]);

const tenantFormRef = ref<FormInst | null>(null);
const showTenantDrawer = ref(false);
const isEditMode = ref(false);
const editingTenantId = ref('');
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
  adminUsername: 'admin',
  adminPassword: '123456',
  adminNickname: ''
});

const tenantStatusOptions = [
  { label: '启用', value: 'ACTIVE' },
  { label: '停用', value: 'DISABLED' },
  { label: '冻结', value: 'FROZEN' }
];

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
  contactEmail: [
    {
      validator: (_, value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
      message: '请输入合法邮箱地址',
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
      ]
}));

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
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
  tenantForm.adminUsername = 'admin';
  tenantForm.adminPassword = '123456';
  tenantForm.adminNickname = '';
}

async function ensureTenantPackages() {
  if (tenantPackageOptions.value.length) {
    return;
  }

  packageLoading.value = true;
  try {
    const { data } = await getTenantPackagePageApi({
      page: 1,
      size: 200
    });

    tenantPackageOptions.value = data.records.map((item: TenantPackageRecord) => ({
      label: `${item.name} (${item.code})`,
      value: item.id
    }));
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
    }
    else {
      const result = await createTenantApi({
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

      message.success(`租户初始化完成，管理员账号：${result.data.adminUser.username}`);
    }

    closeTenantDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await fetchTenants(nextPage);
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
      <div class="content-actions">
        <n-button type="primary" @click="openCreateDrawer">
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
              <th>套餐</th>
              <th>状态</th>
              <th>联系人</th>
              <th>到期时间</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in tenantList" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.code }}</td>
              <td>{{ item.tenantPackage?.name || '-' }}</td>
              <td>
                <n-tag :type="getTenantStatusType(item.status)">
                  {{ getTenantStatusLabel(item.status) }}
                </n-tag>
              </td>
              <td>{{ item.contactName || item.contactPhone || '-' }}</td>
              <td>{{ formatDateTime(item.expiresAt) }}</td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td class="operation-cell">
                <n-button quaternary type="primary" @click="openEditDrawer(item)">
                  编辑
                </n-button>
              </td>
            </tr>
            <tr v-if="!tenantList.length">
              <td colspan="8">
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

  <n-drawer v-model:show="showTenantDrawer" :width="640" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑租户' : '新增租户'">
      <n-form ref="tenantFormRef" :model="tenantForm" :rules="tenantFormRules" label-placement="top">
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
          <n-form-item-gi label="状态" path="status">
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
                placeholder="请输入管理员初始密码"
                type="password"
                show-password-on="mousedown"
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
</template>

<style scoped lang="less">
.crud-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
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
  min-height: calc(100vh - 236px);
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
}

.content-actions {
  margin-bottom: 16px;
}

.operation-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
