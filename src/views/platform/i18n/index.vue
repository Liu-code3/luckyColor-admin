<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import type { I18nResourceRecord } from '@/api';
import {
  bumpI18nResourceVersionApi,
  createI18nResourceApi,
  getI18nResourceDetailApi,
  getI18nResourcePageApi,
  updateI18nResourceApi,
  updateI18nResourceStatusApi
} from '@/api';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { confirmAction } from '@/utils/confirm';

interface Filters {
  locale: string;
  namespace: string;
  resourceKey: string;
  status: number | null;
}

interface FormState {
  locale: string;
  namespace: string;
  resourceKey: string;
  resourceValue: string;
  enabled: boolean;
  remark: string;
}

type LocaleKey = 'zh-CN' | 'en-US';

const PAGE_SIZE_OPTIONS = [ 10, 20, 50 ];
const STATUS_OPTIONS = [
  { label: '全部状态', value: null },
  { label: '启用', value: 0 },
  { label: '停用', value: 1 }
];

const I18N_TEXT = {
  'zh-CN': {
    title: '国际化资源',
    description: '维护多语言键值、命名空间与版本号，支持快速启停与灰度更新。',
    locale: '语言',
    namespace: '命名空间',
    resourceKey: '资源键',
    resourceValue: '资源值',
    status: '状态',
    remark: '备注',
    localePlaceholder: '例如 zh-CN',
    namespacePlaceholder: '例如 dashboard',
    resourceKeyPlaceholder: '例如 common.actions.save',
    search: '查询',
    reset: '重置',
    create: '新增资源',
    total: '当前结果',
    enabledTotal: '启用中',
    versionPeak: '最高版本',
    totalHelper: '当前筛选条件下的资源数',
    enabledHelper: '状态为启用的资源条目',
    versionHelper: '当前页内最大的版本号',
    operation: '操作',
    version: '版本',
    edit: '编辑',
    enable: '启用',
    disable: '停用',
    bumpVersion: '升版',
    cancel: '取消',
    save: '保存',
    createTitle: '新增国际化资源',
    editTitle: '编辑国际化资源',
    enabled: '启用',
    disabled: '停用',
    empty: '暂无国际化资源',
    toggleTitle: '切换资源状态',
    versionTitle: '升级资源版本',
    enableContent: '确认启用资源“{key}”吗？',
    disableContent: '确认停用资源“{key}”吗？',
    versionContent: '确认将资源“{key}”的版本号加 1 吗？',
    localeRequired: '请输入语言标识',
    namespaceRequired: '请输入命名空间',
    keyRequired: '请输入资源键',
    valueRequired: '请输入资源值'
  },
  'en-US': {
    title: 'I18n Resources',
    description: 'Manage localized keys, namespaces, versions, and activation state in one workspace.',
    locale: 'Locale',
    namespace: 'Namespace',
    resourceKey: 'Resource key',
    resourceValue: 'Resource value',
    status: 'Status',
    remark: 'Remark',
    localePlaceholder: 'For example zh-CN',
    namespacePlaceholder: 'For example dashboard',
    resourceKeyPlaceholder: 'For example common.actions.save',
    search: 'Search',
    reset: 'Reset',
    create: 'Create resource',
    total: 'Resources on page',
    enabledTotal: 'Enabled',
    versionPeak: 'Highest version',
    totalHelper: 'Resources returned by the current filters',
    enabledHelper: 'Entries currently enabled',
    versionHelper: 'Maximum version on the current page',
    operation: 'Actions',
    version: 'Version',
    edit: 'Edit',
    enable: 'Enable',
    disable: 'Disable',
    bumpVersion: 'Bump version',
    cancel: 'Cancel',
    save: 'Save',
    createTitle: 'Create i18n resource',
    editTitle: 'Edit i18n resource',
    enabled: 'Enabled',
    disabled: 'Disabled',
    empty: 'No i18n resources',
    toggleTitle: 'Toggle resource status',
    versionTitle: 'Bump resource version',
    enableContent: 'Enable resource "{key}"?',
    disableContent: 'Disable resource "{key}"?',
    versionContent: 'Increase the version of resource "{key}" by 1?',
    localeRequired: 'Please enter a locale',
    namespaceRequired: 'Please enter a namespace',
    keyRequired: 'Please enter a resource key',
    valueRequired: 'Please enter a resource value'
  }
} as const;

const { locale } = useI18n();
const currentLocale = computed<LocaleKey>(() => locale.value === 'en-US' ? 'en-US' : 'zh-CN');
const text = computed(() => I18N_TEXT[currentLocale.value]);

const loading = ref(false);
const submitting = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const rows = ref<I18nResourceRecord[]>([]);
const filters = reactive<Filters>({
  locale: '',
  namespace: '',
  resourceKey: '',
  status: null
});

const showDrawer = ref(false);
const isEditMode = ref(false);
const editingId = ref<number | null>(null);
const formRef = ref<FormInst | null>(null);
const form = reactive<FormState>({
  locale: 'zh-CN',
  namespace: '',
  resourceKey: '',
  resourceValue: '',
  enabled: true,
  remark: ''
});

const summaryCards = computed(() => {
  const currentRows = rows.value;
  return [
    {
      title: text.value.total,
      value: currentRows.length,
      helper: text.value.totalHelper,
      icon: 'solar:translation-linear'
    },
    {
      title: text.value.enabledTotal,
      value: currentRows.filter(item => item.status === 0).length,
      helper: text.value.enabledHelper,
      icon: 'solar:check-circle-linear'
    },
    {
      title: text.value.versionPeak,
      value: currentRows.reduce((max, item) => Math.max(max, Number(item.version || 0)), 0),
      helper: text.value.versionHelper,
      icon: 'solar:refresh-circle-linear'
    }
  ];
});

const formRules = computed<FormRules>(() => ({
  locale: [
    { required: true, message: text.value.localeRequired, trigger: [ 'blur', 'input' ] }
  ],
  namespace: [
    { required: true, message: text.value.namespaceRequired, trigger: [ 'blur', 'input' ] }
  ],
  resourceKey: [
    { required: true, message: text.value.keyRequired, trigger: [ 'blur', 'input' ] }
  ],
  resourceValue: [
    { required: true, message: text.value.valueRequired, trigger: [ 'blur', 'input' ] }
  ]
}));

function formatText(template: string, params: Record<string, string | number>) {
  return template.replaceAll(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? ''));
}

function resetForm() {
  form.locale = 'zh-CN';
  form.namespace = '';
  form.resourceKey = '';
  form.resourceValue = '';
  form.enabled = true;
  form.remark = '';
  editingId.value = null;
}

async function loadResources() {
  loading.value = true;
  try {
    const response = await getI18nResourcePageApi({
      pageNo: page.value,
      pageSize: pageSize.value,
      locale: filters.locale || undefined,
      namespace: filters.namespace || undefined,
      resourceKey: filters.resourceKey || undefined,
      status: filters.status ?? undefined
    });
    rows.value = response.data.records;
    total.value = response.data.total;
  }
  finally {
    loading.value = false;
  }
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetForm();
  showDrawer.value = true;
}

async function openEditDrawer(row: I18nResourceRecord) {
  isEditMode.value = true;
  showDrawer.value = true;
  const response = await getI18nResourceDetailApi(row.id);
  editingId.value = row.id;
  form.locale = response.data.locale;
  form.namespace = response.data.namespace;
  form.resourceKey = response.data.resourceKey;
  form.resourceValue = response.data.resourceValue;
  form.enabled = response.data.status === 0;
  form.remark = response.data.remark || '';
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  }
  catch {
    return;
  }

  submitting.value = true;
  const payload = {
    locale: form.locale.trim(),
    namespace: form.namespace.trim(),
    resourceKey: form.resourceKey.trim(),
    resourceValue: form.resourceValue.trim(),
    status: form.enabled ? 0 : 1,
    remark: form.remark.trim() || undefined
  };

  try {
    if (isEditMode.value && editingId.value !== null) {
      await updateI18nResourceApi(editingId.value, payload);
    }
    else {
      await createI18nResourceApi(payload);
    }
    showDrawer.value = false;
    await loadResources();
  }
  finally {
    submitting.value = false;
  }
}

async function handleToggleStatus(row: I18nResourceRecord) {
  const nextStatus = row.status === 0 ? 1 : 0;
  const confirmed = await confirmAction({
    title: text.value.toggleTitle,
    content: formatText(nextStatus === 0 ? text.value.enableContent : text.value.disableContent, { key: row.resourceKey })
  });
  if (!confirmed) {
    return;
  }

  await updateI18nResourceStatusApi(row.id, nextStatus);
  await loadResources();
}

async function handleBumpVersion(row: I18nResourceRecord) {
  const confirmed = await confirmAction({
    title: text.value.versionTitle,
    content: formatText(text.value.versionContent, { key: row.resourceKey })
  });
  if (!confirmed) {
    return;
  }

  await bumpI18nResourceVersionApi(row.id);
  await loadResources();
}

function handleSearch() {
  page.value = 1;
  void loadResources();
}

function handleReset() {
  filters.locale = '';
  filters.namespace = '';
  filters.resourceKey = '';
  filters.status = null;
  page.value = 1;
  void loadResources();
}

function handlePageChange(value: number) {
  page.value = value;
  void loadResources();
}

function handlePageSizeChange(value: number) {
  pageSize.value = value;
  page.value = 1;
  void loadResources();
}

watch(showDrawer, (visible) => {
  if (!visible) {
    resetForm();
  }
});

onMounted(() => {
  void loadResources();
});
</script>

<template>
  <div class="i18n-page">
    <section class="hero-card">
      <div>
        <p class="hero-card__eyebrow">Localization</p>
        <h1>{{ text.title }}</h1>
        <p class="hero-card__description">
          {{ text.description }}
        </p>
      </div>
      <div class="hero-card__badge">
        <Icon icon="solar:translation-linear" />
      </div>
    </section>

    <section class="toolbar-card">
      <div class="toolbar-grid">
        <label>
          <span>{{ text.locale }}</span>
          <n-input v-model:value="filters.locale" :placeholder="text.localePlaceholder" clearable />
        </label>
        <label>
          <span>{{ text.namespace }}</span>
          <n-input v-model:value="filters.namespace" :placeholder="text.namespacePlaceholder" clearable />
        </label>
        <label>
          <span>{{ text.resourceKey }}</span>
          <n-input v-model:value="filters.resourceKey" :placeholder="text.resourceKeyPlaceholder" clearable />
        </label>
        <label>
          <span>{{ text.status }}</span>
          <n-select v-model:value="filters.status" :options="STATUS_OPTIONS" clearable />
        </label>
      </div>

      <div class="toolbar-actions">
        <n-button type="primary" @click="handleSearch">
          {{ text.search }}
        </n-button>
        <n-button @click="handleReset">
          {{ text.reset }}
        </n-button>
        <n-button type="primary" tertiary @click="openCreateDrawer">
          {{ text.create }}
        </n-button>
      </div>
    </section>

    <section class="summary-grid">
      <article v-for="card in summaryCards" :key="card.title" class="summary-card">
        <div class="summary-card__icon">
          <Icon :icon="card.icon" />
        </div>
        <div>
          <p>{{ card.title }}</p>
          <strong>{{ card.value }}</strong>
          <span>{{ card.helper }}</span>
        </div>
      </article>
    </section>

    <section class="table-card">
      <n-spin :show="loading">
        <div v-if="rows.length" class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{{ text.locale }}</th>
                <th>{{ text.namespace }}</th>
                <th>{{ text.resourceKey }}</th>
                <th>{{ text.resourceValue }}</th>
                <th>{{ text.version }}</th>
                <th>{{ text.status }}</th>
                <th>{{ text.remark }}</th>
                <th>{{ text.operation }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rows" :key="item.id">
                <td>{{ item.locale }}</td>
                <td>{{ item.namespace }}</td>
                <td>{{ item.resourceKey }}</td>
                <td class="value-cell" :title="item.resourceValue">{{ item.resourceValue }}</td>
                <td>{{ item.version }}</td>
                <td>
                  <n-tag size="small" :bordered="false" :type="item.status === 0 ? 'success' : 'warning'">
                    {{ item.status === 0 ? text.enabled : text.disabled }}
                  </n-tag>
                </td>
                <td>{{ item.remark || '--' }}</td>
                <td>
                  <div class="action-group">
                    <n-button text type="primary" @click="openEditDrawer(item)">
                      {{ text.edit }}
                    </n-button>
                    <n-button text @click="handleToggleStatus(item)">
                      {{ item.status === 0 ? text.disable : text.enable }}
                    </n-button>
                    <n-button text @click="handleBumpVersion(item)">
                      {{ text.bumpVersion }}
                    </n-button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <n-empty v-else :description="text.empty" class="table-empty" />
      </n-spin>

      <div class="pagination-bar">
        <n-pagination
          :page="page"
          :page-size="pageSize"
          :item-count="total"
          :page-sizes="PAGE_SIZE_OPTIONS"
          show-size-picker
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </section>

    <n-drawer v-model:show="showDrawer" width="520">
      <n-drawer-content :title="isEditMode ? text.editTitle : text.createTitle" closable>
        <n-form ref="formRef" :model="form" :rules="formRules" label-placement="top">
          <n-form-item :label="text.locale" path="locale">
            <n-input v-model:value="form.locale" :placeholder="text.localePlaceholder" />
          </n-form-item>
          <n-form-item :label="text.namespace" path="namespace">
            <n-input v-model:value="form.namespace" :placeholder="text.namespacePlaceholder" />
          </n-form-item>
          <n-form-item :label="text.resourceKey" path="resourceKey">
            <n-input v-model:value="form.resourceKey" :placeholder="text.resourceKeyPlaceholder" />
          </n-form-item>
          <n-form-item :label="text.resourceValue" path="resourceValue">
            <n-input v-model:value="form.resourceValue" type="textarea" :autosize="{ minRows: 4, maxRows: 8 }" />
          </n-form-item>
          <n-form-item :label="text.status">
            <n-switch v-model:value="form.enabled" />
          </n-form-item>
          <n-form-item :label="text.remark">
            <n-input v-model:value="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" />
          </n-form-item>
        </n-form>

        <template #footer>
          <div class="drawer-actions">
            <n-button @click="showDrawer = false">
              {{ text.cancel }}
            </n-button>
            <n-button type="primary" :loading="submitting" @click="handleSubmit">
              {{ text.save }}
            </n-button>
          </div>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<style scoped>
.i18n-page {
  display: grid;
  gap: 20px;
}

.hero-card,
.toolbar-card,
.table-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #fff8f2 0%, #fef3e6 100%);
}

.hero-card h1 {
  margin: 0;
  font-size: 24px;
}

.hero-card__eyebrow {
  margin: 0 0 8px;
  color: #ea580c;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card__description,
.summary-card span {
  margin: 8px 0 0;
  color: #64748b;
  line-height: 1.6;
}

.hero-card__badge {
  display: grid;
  place-items: center;
  min-width: 72px;
  height: 72px;
  border-radius: 24px;
  background: rgba(234, 88, 12, 0.12);
  color: #ea580c;
  font-size: 32px;
}

.toolbar-card,
.table-card {
  padding: 24px;
}

.toolbar-grid,
.summary-grid {
  display: grid;
  gap: 16px;
}

.toolbar-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.toolbar-grid label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 13px;
}

.toolbar-actions,
.drawer-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(180deg, #fff 0%, #fff7ed 100%);
  border: 1px solid rgba(251, 146, 60, 0.18);
}

.summary-card p {
  margin: 0;
  color: #475569;
}

.summary-card strong {
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-size: 28px;
}

.summary-card__icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(249, 115, 22, 0.12);
  color: #ea580c;
  font-size: 22px;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  text-align: left;
  vertical-align: top;
}

th {
  color: #475569;
  font-weight: 600;
  white-space: nowrap;
}

td {
  color: #0f172a;
  font-size: 13px;
}

.value-cell {
  min-width: 260px;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.table-empty,
.pagination-bar {
  margin-top: 20px;
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .hero-card {
    flex-direction: column;
  }

  .toolbar-actions,
  .drawer-actions,
  .pagination-bar {
    justify-content: stretch;
    flex-direction: column;
  }
}
</style>
