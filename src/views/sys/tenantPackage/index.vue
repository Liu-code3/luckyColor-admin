<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { useMessage } from 'naive-ui';
import {
  createTenantPackageApi,
  deleteTenantPackageApi,
  getTenantPackageDetailApi,
  getTenantPackagePageApi,
  updateTenantPackageApi,
  type TenantPackageRecord
} from '@/api';

interface TenantPackageFormState {
  code: string;
  name: string;
  status: boolean;
  maxUsers: number | null;
  maxRoles: number | null;
  maxMenus: number | null;
  featureFlagsText: string;
  remark: string;
}

const message = useMessage();

const loading = ref(false);
const submitting = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const statusFilter = ref<boolean | null>(null);
const packageList = ref<TenantPackageRecord[]>([]);

const packageFormRef = ref<FormInst | null>(null);
const showPackageDrawer = ref(false);
const isEditMode = ref(false);
const editingPackageId = ref('');
const packageForm = reactive<TenantPackageFormState>({
  code: '',
  name: '',
  status: true,
  maxUsers: 50,
  maxRoles: 20,
  maxMenus: 100,
  featureFlagsText: JSON.stringify({
    watermark: true,
    dictionary: true,
    notices: true
  }, null, 2),
  remark: ''
});

const statusOptions = [
  { label: '启用', value: true },
  { label: '停用', value: false }
];

const packageFormRules: FormRules = {
  code: [
    {
      required: true,
      message: '请输入套餐编码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-z][a-z0-9_-]{1,30}$/.test(value.trim()),
      message: '套餐编码需以小写字母开头，支持小写字母、数字、下划线和中划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  name: [
    {
      required: true,
      message: '请输入套餐名称',
      trigger: [ 'blur', 'input' ]
    }
  ],
  featureFlagsText: [
    {
      validator: (_, value: string) => isValidJson(value),
      message: '能力开关必须是合法 JSON',
      trigger: [ 'blur', 'input' ]
    }
  ]
};

function isValidJson(value: string) {
  try {
    JSON.parse(value.trim() || '{}');
    return true;
  }
  catch {
    return false;
  }
}

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function formatFeatureFlags(value?: Record<string, unknown> | null) {
  if (!value || !Object.keys(value).length)
    return '-';

  return Object.entries(value).map(([ key, flag ]) => `${key}: ${String(flag)}`).join(' / ');
}

function resetPackageForm() {
  editingPackageId.value = '';
  packageForm.code = '';
  packageForm.name = '';
  packageForm.status = true;
  packageForm.maxUsers = 50;
  packageForm.maxRoles = 20;
  packageForm.maxMenus = 100;
  packageForm.featureFlagsText = JSON.stringify({
    watermark: true,
    dictionary: true,
    notices: true
  }, null, 2);
  packageForm.remark = '';
}

async function fetchPackages(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getTenantPackagePageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      status: statusFilter.value === null ? undefined : statusFilter.value
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    packageList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchPackages(1);
}

function handleReset() {
  keyword.value = '';
  statusFilter.value = null;
  page.value = 1;
  fetchPackages(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchPackages(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchPackages(1);
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetPackageForm();
  showPackageDrawer.value = true;
}

async function openEditDrawer(item: TenantPackageRecord) {
  isEditMode.value = true;
  resetPackageForm();
  editingPackageId.value = item.id;
  showPackageDrawer.value = true;

  const { data } = await getTenantPackageDetailApi(item.id);
  packageForm.code = data.code;
  packageForm.name = data.name;
  packageForm.status = data.status;
  packageForm.maxUsers = data.maxUsers ?? 0;
  packageForm.maxRoles = data.maxRoles ?? 0;
  packageForm.maxMenus = data.maxMenus ?? 0;
  packageForm.featureFlagsText = JSON.stringify(data.featureFlags || {}, null, 2);
  packageForm.remark = data.remark || '';
}

function closePackageDrawer() {
  showPackageDrawer.value = false;
  resetPackageForm();
  packageFormRef.value?.restoreValidation();
}

async function submitPackageForm() {
  await packageFormRef.value?.validate();

  const featureFlags = JSON.parse(packageForm.featureFlagsText.trim() || '{}') as Record<string, unknown>;

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateTenantPackageApi(editingPackageId.value, {
        code: packageForm.code.trim(),
        name: packageForm.name.trim(),
        status: packageForm.status,
        maxUsers: Number(packageForm.maxUsers ?? 0),
        maxRoles: Number(packageForm.maxRoles ?? 0),
        maxMenus: Number(packageForm.maxMenus ?? 0),
        featureFlags,
        remark: packageForm.remark.trim() || null
      });
    }
    else {
      await createTenantPackageApi({
        code: packageForm.code.trim(),
        name: packageForm.name.trim(),
        status: packageForm.status,
        maxUsers: Number(packageForm.maxUsers ?? 0),
        maxRoles: Number(packageForm.maxRoles ?? 0),
        maxMenus: Number(packageForm.maxMenus ?? 0),
        featureFlags,
        remark: packageForm.remark.trim() || undefined
      });
    }

    closePackageDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await fetchPackages(nextPage);
  }
  finally {
    submitting.value = false;
  }
}

async function handleDeletePackage(item: TenantPackageRecord) {
  const confirmed = window.confirm(`确认删除租户套餐“${item.name}”吗？`);

  if (!confirmed)
    return;

  try {
    await deleteTenantPackageApi(item.id);
    const nextPage = packageList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
    page.value = nextPage;
    await fetchPackages(nextPage);
  }
  catch (error) {
    message.error(error instanceof Error ? error.message : '删除租户套餐失败');
  }
}

onMounted(() => {
  fetchPackages();
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
          placeholder="输入套餐名称或编码"
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
          :options="statusOptions"
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
          新增套餐
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>套餐名称</th>
              <th>套餐编码</th>
              <th>状态</th>
              <th>额度</th>
              <th>能力开关</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in packageList" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.code }}</td>
              <td>
                <n-tag :type="item.status ? 'success' : 'warning'">
                  {{ item.status ? '启用' : '停用' }}
                </n-tag>
              </td>
              <td>{{ `用户 ${item.maxUsers ?? 0} / 角色 ${item.maxRoles ?? 0} / 菜单 ${item.maxMenus ?? 0}` }}</td>
              <td class="feature-flags-cell">
                {{ formatFeatureFlags(item.featureFlags) }}
              </td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td class="operation-cell">
                <n-button quaternary type="primary" @click="openEditDrawer(item)">
                  编辑
                </n-button>
                <n-button quaternary type="error" @click="handleDeletePackage(item)">
                  删除
                </n-button>
              </td>
            </tr>
            <tr v-if="!packageList.length">
              <td colspan="7">
                <n-empty description="暂无租户套餐数据" />
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

  <n-drawer v-model:show="showPackageDrawer" :width="640" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑租户套餐' : '新增租户套餐'">
      <n-form ref="packageFormRef" :model="packageForm" :rules="packageFormRules" label-placement="top">
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="套餐编码" path="code">
            <n-input v-model:value="packageForm.code" placeholder="例如 basic" />
          </n-form-item-gi>
          <n-form-item-gi label="套餐名称" path="name">
            <n-input v-model:value="packageForm.name" placeholder="请输入套餐名称" />
          </n-form-item-gi>
          <n-form-item-gi label="状态" path="status">
            <n-switch v-model:value="packageForm.status">
              <template #checked>
                启用
              </template>
              <template #unchecked>
                停用
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi label="最大用户数" path="maxUsers">
            <n-input-number v-model:value="packageForm.maxUsers" class="w-full" :min="0" />
          </n-form-item-gi>
          <n-form-item-gi label="最大角色数" path="maxRoles">
            <n-input-number v-model:value="packageForm.maxRoles" class="w-full" :min="0" />
          </n-form-item-gi>
          <n-form-item-gi label="最大菜单数" path="maxMenus">
            <n-input-number v-model:value="packageForm.maxMenus" class="w-full" :min="0" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="能力开关（JSON）" path="featureFlagsText">
          <n-input
            v-model:value="packageForm.featureFlagsText"
            type="textarea"
            placeholder="{&quot;watermark&quot;:true,&quot;dictionary&quot;:true}"
            :autosize="{ minRows: 6, maxRows: 10 }"
          />
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="packageForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closePackageDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitPackageForm">
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

.feature-flags-cell {
  max-width: 360px;
  white-space: normal;
  word-break: break-word;
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
