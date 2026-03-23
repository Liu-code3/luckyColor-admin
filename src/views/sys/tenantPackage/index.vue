<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import { Icon } from '@iconify/vue';
import {
  createTenantPackageApi,
  deleteTenantPackageApi,
  getTenantPackageDetailApi,
  getTenantPackagePageApi,
  updateTenantPackageApi,
  type TenantPackageRecord
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';

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

interface SummaryCard {
  label: string;
  value: number;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

const packageButtonCodes = BUTTON_PERMISSION_CODES.tenantPackage;
const { hasPermission } = usePermission();

const knownFeatureLabels: Record<string, string> = {
  watermark: '水印',
  dictionary: '字典',
  notices: '公告',
  analytics: '统计分析'
};

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

const summaryCards = computed<SummaryCard[]>(() => [
  { label: '套餐总数', value: total.value, tone: 'primary' },
  {
    label: '启用中',
    value: packageList.value.filter(item => item.status).length,
    tone: 'success'
  },
  {
    label: '停用中',
    value: packageList.value.filter(item => !item.status).length,
    tone: 'warning'
  },
  {
    label: '最高用户额度',
    value: packageList.value.reduce((max, item) => Math.max(max, item.maxUsers ?? 0), 0),
    tone: 'info'
  }
]);

const featureFlagsPreview = computed(() => {
  const parsed = parseFeatureFlags(packageForm.featureFlagsText);
  if (!parsed)
    return [];

  return toFeatureFlagEntries(parsed);
});
const canCreatePackage = computed(() => hasPermission(packageButtonCodes.create));
const canUpdatePackage = computed(() => hasPermission(packageButtonCodes.update));
const canDeletePackage = computed(() => hasPermission(packageButtonCodes.delete));
const hasPackageActions = computed(() => canUpdatePackage.value || canDeletePackage.value);
const packageTableColumnCount = computed(() => hasPackageActions.value ? 7 : 6);

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
      validator: (_, value: string) => parseFeatureFlags(value) !== null,
      message: '能力开关必须是合法的 JSON 对象',
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
};

function parseFeatureFlags(value: string) {
  try {
    const parsed = JSON.parse(value.trim() || '{}') as unknown;
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object')
      return null;

    return parsed as Record<string, unknown>;
  }
  catch {
    return null;
  }
}

function toFeatureFlagEntries(value?: Record<string, unknown> | null) {
  if (!value)
    return [];

  return Object.entries(value).map(([ key, flag ]) => ({
    key,
    label: knownFeatureLabels[key] || key,
    enabled: Boolean(flag),
    raw: flag
  }));
}

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function formatQuota(item: TenantPackageRecord) {
  return `用户 ${item.maxUsers ?? 0} / 角色 ${item.maxRoles ?? 0} / 菜单 ${item.maxMenus ?? 0}`;
}

function getSummaryCardClass(tone: SummaryCard['tone']) {
  return `summary-card summary-card--${tone}`;
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

  const featureFlags = parseFeatureFlags(packageForm.featureFlagsText);
  if (!featureFlags) {
    message.error('能力开关必须是合法的 JSON 对象');
    return;
  }

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
      message.success('租户套餐已更新');
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
      message.success('租户套餐已创建');
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
  const confirmed = await confirmAction({
    title: '删除租户套餐',
    content: `确认删除租户套餐“${item.name}”吗？`
  });

  if (!confirmed)
    return;

  await deleteTenantPackageApi(item.id);
  message.success('租户套餐已删除');
  const nextPage = packageList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await fetchPackages(nextPage);
}

onMounted(() => {
  fetchPackages();
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
      <div v-if="canCreatePackage" class="content-actions">
        <n-button
          v-permission="packageButtonCodes.create"
          type="primary"
          @click="openCreateDrawer"
        >
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
              <th>配额</th>
              <th>能力开关</th>
              <th>更新时间</th>
              <th v-if="hasPackageActions">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in packageList" :key="item.id">
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
                <n-tag :type="item.status ? 'success' : 'warning'">
                  {{ item.status ? '启用' : '停用' }}
                </n-tag>
              </td>
              <td>{{ formatQuota(item) }}</td>
              <td class="feature-flags-cell">
                <n-space v-if="toFeatureFlagEntries(item.featureFlags).length" size="small">
                  <n-tag
                    v-for="flag in toFeatureFlagEntries(item.featureFlags)"
                    :key="`${item.id}-${flag.key}`"
                    size="small"
                    :type="flag.enabled ? 'info' : 'default'"
                  >
                    {{ flag.label }}: {{ String(flag.raw) }}
                  </n-tag>
                </n-space>
                <span v-else>-</span>
              </td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td v-if="hasPackageActions" class="operation-cell">
                <n-button
                  v-permission="packageButtonCodes.update"
                  quaternary
                  type="primary"
                  @click="openEditDrawer(item)"
                >
                  编辑
                </n-button>
                <n-button
                  v-permission="packageButtonCodes.delete"
                  quaternary
                  type="error"
                  @click="handleDeletePackage(item)"
                >
                  删除
                </n-button>
              </td>
            </tr>
            <tr v-if="!packageList.length">
              <td :colspan="packageTableColumnCount">
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

  <n-drawer v-model:show="showPackageDrawer" :width="680" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑租户套餐' : '新增租户套餐'">
      <n-form ref="packageFormRef" :model="packageForm" :rules="packageFormRules" label-placement="top">
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="套餐编码" path="code">
            <n-input v-model:value="packageForm.code" placeholder="例如 basic" />
          </n-form-item-gi>
          <n-form-item-gi label="套餐名称" path="name">
            <n-input v-model:value="packageForm.name" placeholder="请输入套餐名称" />
          </n-form-item-gi>
          <n-form-item-gi label="套餐状态" path="status">
            <n-switch v-model:value="packageForm.status">
              <template #checked>
                启用
              </template>
              <template #unchecked>
                停用
              </template>
            </n-switch>
          </n-form-item-gi>
          <n-form-item-gi label="用户上限" path="maxUsers">
            <n-input-number v-model:value="packageForm.maxUsers" class="w-full" :min="0" />
          </n-form-item-gi>
          <n-form-item-gi label="角色上限" path="maxRoles">
            <n-input-number v-model:value="packageForm.maxRoles" class="w-full" :min="0" />
          </n-form-item-gi>
          <n-form-item-gi label="菜单上限" path="maxMenus">
            <n-input-number v-model:value="packageForm.maxMenus" class="w-full" :min="0" />
          </n-form-item-gi>
        </n-grid>

        <div class="quota-hint">
          套餐 ID 会根据编码自动生成，默认格式为 `pkg_编码`。
        </div>

        <n-form-item label="能力开关（JSON 对象）" path="featureFlagsText">
          <n-input
            v-model:value="packageForm.featureFlagsText"
            type="textarea"
            placeholder="{&quot;watermark&quot;: true, &quot;dictionary&quot;: true}"
            :autosize="{ minRows: 6, maxRows: 10 }"
          />
        </n-form-item>

        <div class="preview-block">
          <div class="preview-block__title">
            能力预览
          </div>
          <n-space v-if="featureFlagsPreview.length" size="small">
            <n-tag
              v-for="flag in featureFlagsPreview"
              :key="`preview-${flag.key}`"
              size="small"
              :type="flag.enabled ? 'info' : 'default'"
            >
              {{ flag.label }}: {{ String(flag.raw) }}
            </n-tag>
          </n-space>
          <n-empty v-else description="暂无能力开关" />
        </div>

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

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 10px;
  background: var(--primary-bgColor);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.summary-card span {
  color: var(--text-color-2);
  font-size: 13px;
}

.summary-card strong {
  font-size: 26px;
  line-height: 1;
}

.summary-card--primary strong {
  color: #2563eb;
}

.summary-card--success strong {
  color: #059669;
}

.summary-card--warning strong {
  color: #d97706;
}

.summary-card--info strong {
  color: #0891b2;
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
  min-height: calc(100vh - 292px);
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
}

.content-actions {
  margin-bottom: 16px;
}

.primary-text {
  font-weight: 600;
  color: var(--text-color-1);
}

.secondary-text {
  margin-top: 4px;
  color: var(--text-color-3);
  font-size: 12px;
}

.feature-flags-cell {
  max-width: 420px;
  white-space: normal;
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

.quota-hint {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.06);
  color: var(--text-color-2);
}

.preview-block {
  margin-bottom: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  background: rgba(148, 163, 184, 0.08);
}

.preview-block__title {
  margin-bottom: 12px;
  font-weight: 600;
}

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
}
</style>
