<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import { Icon } from '@iconify/vue';
import {
  createConfigApi,
  deleteConfigApi,
  getConfigDetailApi,
  getConfigPageApi,
  refreshConfigCacheApi,
  updateConfigApi,
  type ConfigRecord
} from '@/api';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';

interface ConfigFormState {
  configKey: string;
  configName: string;
  configValue: string;
  valueType: string;
  status: boolean;
  remark: string;
}

interface ConfigGroupRecord {
  key: string;
  label: string;
  count: number;
  description: string;
}

const loading = ref(false);
const groupLoading = ref(false);
const submitting = ref(false);
const refreshingCache = ref(false);
const togglingConfigId = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const selectedGroupKey = ref('all');
const configList = ref<ConfigRecord[]>([]);
const configGroupSourceList = ref<ConfigRecord[]>([]);

const configFormRef = ref<FormInst | null>(null);
const showConfigDrawer = ref(false);
const isEditMode = ref(false);
const editingConfigId = ref('');
const configForm = reactive<ConfigFormState>({
  configKey: '',
  configName: '',
  configValue: '',
  valueType: 'string',
  status: true,
  remark: ''
});

const valueTypeOptions = [
  { label: 'string', value: 'string' },
  { label: 'number', value: 'number' },
  { label: 'boolean', value: 'boolean' },
  { label: 'json', value: 'json' }
];

const configGroupList = computed<ConfigGroupRecord[]>(() => {
  const groupMap = new Map<string, ConfigGroupRecord>();

  for (const item of configGroupSourceList.value) {
    const groupKey = resolveConfigGroupKey(item.configKey);
    const currentGroup = groupMap.get(groupKey);

    if (currentGroup) {
      currentGroup.count += 1;
      continue;
    }

    groupMap.set(groupKey, {
      key: groupKey,
      label: formatConfigGroupLabel(groupKey),
      count: 1,
      description: item.configKey
    });
  }

  const groups = Array.from(groupMap.values()).sort((left, right) => {
    if (right.count !== left.count)
      return right.count - left.count;

    return left.label.localeCompare(right.label, 'zh-CN');
  });

  return [
    {
      key: 'all',
      label: '全部配置',
      count: configGroupSourceList.value.length,
      description: '查看当前系统的全部配置项'
    },
    ...groups
  ];
});

const activeGroup = computed(() =>
  configGroupList.value.find(item => item.key === selectedGroupKey.value) ?? configGroupList.value[0]
);

const configFormRules = computed<FormRules>(() => ({
  configKey: [
    {
      required: true,
      message: '请输入配置键',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-zA-Z][a-zA-Z0-9_.:-]{1,50}$/.test(value),
      message: '配置键需以字母开头，支持字母、数字、点、下划线、冒号和中划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  configName: [
    {
      required: true,
      message: '请输入配置名称',
      trigger: [ 'blur', 'input' ]
    }
  ],
  configValue: [
    {
      required: true,
      message: '请输入配置值',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => validateConfigValue(value, configForm.valueType),
      message: getConfigValueValidationMessage(configForm.valueType),
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
}));

function validateConfigValue(value: string, valueType: string) {
  const content = value.trim();

  if (valueType === 'number')
    return !Number.isNaN(Number(content));

  if (valueType === 'boolean')
    return [ 'true', 'false' ].includes(content.toLowerCase());

  if (valueType === 'json') {
    try {
      JSON.parse(content);
      return true;
    }
    catch {
      return false;
    }
  }

  return true;
}

function getConfigValueValidationMessage(valueType: string) {
  if (valueType === 'number')
    return '配置值必须是合法数字';

  if (valueType === 'boolean')
    return '布尔值只可填写 true 或 false';

  if (valueType === 'json')
    return '配置值必须是合法 JSON';

  return '请输入合法的配置值';
}

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function resolveConfigGroupKey(configKey: string) {
  const trimmedKey = configKey.trim();

  if (!trimmedKey)
    return 'misc';

  const [ primarySegment ] = trimmedKey.split(/[.:]/).filter(Boolean);

  if (primarySegment)
    return primarySegment.toLowerCase();

  const [ secondarySegment ] = trimmedKey.split(/[_-]/).filter(Boolean);

  if (secondarySegment)
    return secondarySegment.toLowerCase();

  return 'misc';
}

function formatConfigGroupLabel(groupKey: string) {
  if (groupKey === 'misc')
    return '未分组';

  return groupKey;
}

function resolveValueTypeTagType(valueType: string) {
  if (valueType === 'json')
    return 'info';

  if (valueType === 'boolean')
    return 'success';

  if (valueType === 'number')
    return 'warning';

  return 'default';
}

function resetConfigForm() {
  editingConfigId.value = '';
  configForm.configKey = '';
  configForm.configName = '';
  configForm.configValue = '';
  configForm.valueType = 'string';
  configForm.status = true;
  configForm.remark = '';
}

async function fetchConfigs(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getConfigPageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    configList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

async function fetchConfigGroups() {
  groupLoading.value = true;

  try {
    const { data } = await getConfigPageApi({
      page: 1,
      size: 1000
    });

    configGroupSourceList.value = data.records;
  }
  finally {
    groupLoading.value = false;
  }
}

function handleSearch() {
  selectedGroupKey.value = 'all';
  page.value = 1;
  fetchConfigs(1);
}

function handleReset() {
  keyword.value = '';
  selectedGroupKey.value = 'all';
  page.value = 1;
  fetchConfigs(1);
}

function handleSelectGroup(groupKey: string) {
  selectedGroupKey.value = groupKey;
  keyword.value = groupKey === 'all' ? '' : groupKey;
  page.value = 1;
  fetchConfigs(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchConfigs(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchConfigs(1);
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetConfigForm();
  showConfigDrawer.value = true;
}

async function openEditDrawer(config: ConfigRecord) {
  isEditMode.value = true;
  resetConfigForm();
  editingConfigId.value = config.id;
  showConfigDrawer.value = true;

  const { data } = await getConfigDetailApi(config.id);
  configForm.configKey = data.configKey;
  configForm.configName = data.configName;
  configForm.configValue = data.configValue;
  configForm.valueType = data.valueType;
  configForm.status = data.status;
  configForm.remark = data.remark || '';
}

function closeConfigDrawer() {
  showConfigDrawer.value = false;
  resetConfigForm();
  configFormRef.value?.restoreValidation();
}

async function submitConfigForm() {
  await configFormRef.value?.validate();

  if (!validateConfigValue(configForm.configValue, configForm.valueType)) {
    message.error(getConfigValueValidationMessage(configForm.valueType));
    return;
  }

  const payload = {
    configKey: configForm.configKey.trim(),
    configName: configForm.configName.trim(),
    configValue: configForm.configValue.trim(),
    valueType: configForm.valueType,
    status: configForm.status,
    remark: configForm.remark.trim() || undefined
  };

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateConfigApi(editingConfigId.value, {
        ...payload,
        remark: payload.remark ?? null
      });
    }
    else {
      await createConfigApi(payload);
    }

    closeConfigDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await Promise.all([
      fetchConfigs(nextPage),
      fetchConfigGroups()
    ]);
  }
  finally {
    submitting.value = false;
  }
}

async function handleRefreshCache() {
  refreshingCache.value = true;
  try {
    const { data } = await refreshConfigCacheApi();
    message.success(`配置缓存刷新成功，共写入 ${data.count} 项`);
  }
  finally {
    refreshingCache.value = false;
  }
}

async function handleToggleStatus(config: ConfigRecord, status: boolean) {
  togglingConfigId.value = config.id;
  try {
    await updateConfigApi(config.id, { status });
    config.status = status;
  }
  finally {
    togglingConfigId.value = '';
  }
}

async function handleDeleteConfig(config: ConfigRecord) {
  const confirmed = await confirmAction({
    title: '删除配置',
    content: `确认删除配置“${config.configName}”吗？`
  });

  if (!confirmed)
    return;

  await deleteConfigApi(config.id);
  const nextPage = configList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await Promise.all([
    fetchConfigs(nextPage),
    fetchConfigGroups()
  ]);
}

onMounted(() => {
  fetchConfigGroups();
  fetchConfigs();
});
</script>

<template>
  <div class="crud-page">
    <div class="toolbar">
      <div class="toolbar-item">
        <div class="toolbar-label">
          关键字
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入配置名称或配置键"
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

    <div class="content-grid">
      <aside class="group-card">
        <div class="group-card__header">
          <div>
            <p>Config Groups</p>
            <h3>配置分组</h3>
          </div>
          <n-tag round size="small" type="info">
            共 {{ Math.max(configGroupList.length - 1, 0) }} 组
          </n-tag>
        </div>

        <div class="group-card__tip">
          按配置键前缀自动归类，可快速定位系统参数、登录策略、通知能力等常用配置。
        </div>

        <n-spin :show="groupLoading">
          <div class="group-list">
            <button
              v-for="group in configGroupList"
              :key="group.key"
              type="button"
              class="group-item"
              :class="{ 'group-item--active': selectedGroupKey === group.key }"
              @click="handleSelectGroup(group.key)"
            >
              <div class="group-item__copy">
                <strong>{{ group.label }}</strong>
                <span>{{ group.description }}</span>
              </div>
              <n-tag round size="small" :type="selectedGroupKey === group.key ? 'success' : 'default'">
                {{ group.count }}
              </n-tag>
            </button>
          </div>
        </n-spin>
      </aside>

      <div class="content-card">
        <div class="content-card__header">
          <div>
            <p>System Configurations</p>
            <h3>配置列表</h3>
          </div>
          <n-tag round :type="selectedGroupKey === 'all' ? 'info' : 'success'">
            {{ activeGroup?.label || '全部配置' }}
          </n-tag>
        </div>

        <div class="content-card__tip">
          {{ selectedGroupKey === 'all'
            ? '当前展示全部系统配置，支持通过关键字搜索配置名称或配置键。'
            : `当前按“${activeGroup?.label}”分组筛选，可继续搜索缩小范围。` }}
        </div>

        <div class="content-actions">
          <n-space>
            <n-button type="primary" @click="openCreateDrawer">
              <template #icon>
                <Icon icon="material-symbols:add" />
              </template>
              新增配置
            </n-button>
            <n-button :loading="refreshingCache" @click="handleRefreshCache">
              <template #icon>
                <Icon icon="material-symbols:refresh-rounded" />
              </template>
              刷新缓存
            </n-button>
          </n-space>
        </div>

        <n-spin :show="loading">
          <n-table :bordered="false" :single-line="false" class="config-table">
            <colgroup>
              <col style="width: 19%">
              <col style="width: 21%">
              <col style="width: 22%">
              <col style="width: 10%">
              <col style="width: 10%">
              <col style="width: 12%">
              <col style="width: 16%">
            </colgroup>
            <thead>
              <tr>
                <th>配置名称</th>
                <th>配置键</th>
                <th>配置值</th>
                <th>值类型</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in configList" :key="item.id">
                <td>
                  <div class="config-cell">
                    <strong class="config-name">{{ item.configName }}</strong>
                    <span class="config-subline">{{ item.remark || 'No remark' }}</span>
                  </div>
                </td>
                <td>
                  <code class="config-key" :title="item.configKey">{{ item.configKey }}</code>
                </td>
                <td>
                  <div class="config-value" :title="item.configValue">
                    {{ item.configValue }}
                  </div>
                </td>
                <td>
                  <n-tag round size="small" :type="resolveValueTypeTagType(item.valueType)">
                    {{ item.valueType }}
                  </n-tag>
                </td>
                <td>
                  <div class="config-status">
                    <n-switch
                    :value="item.status"
                    :loading="togglingConfigId === item.id"
                    @update:value="value => handleToggleStatus(item, value)"
                  >
                    <template #checked>
                      启用
                    </template>
                    <template #unchecked>
                      停用
                    </template>
                    </n-switch>
                  </div>
                </td>
                <td>
                  <div class="config-time">
                    {{ formatDateTime(item.updatedAt) }}
                  </div>
                </td>
                <td class="operation-cell operation-cell--end">
                  <n-button quaternary type="primary" @click="openEditDrawer(item)">
                    编辑
                  </n-button>
                  <n-button quaternary type="error" @click="handleDeleteConfig(item)">
                    删除
                  </n-button>
                </td>
              </tr>
              <tr v-if="!configList.length">
                <td colspan="7">
                  <n-empty description="暂无配置数据" />
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
  </div>

  <n-drawer v-model:show="showConfigDrawer" :width="560" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑配置' : '新增配置'">
      <n-form ref="configFormRef" :model="configForm" :rules="configFormRules" label-placement="top">
        <n-form-item label="配置名称" path="configName">
          <n-input v-model:value="configForm.configName" placeholder="请输入配置名称" />
        </n-form-item>
        <n-form-item label="配置键" path="configKey">
          <n-input v-model:value="configForm.configKey" placeholder="请输入配置键" />
        </n-form-item>
        <n-form-item label="配置值" path="configValue">
          <n-input v-model:value="configForm.configValue" placeholder="请输入配置值" />
        </n-form-item>
        <n-form-item label="值类型" path="valueType">
          <n-select v-model:value="configForm.valueType" :options="valueTypeOptions" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-switch v-model:value="configForm.status">
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
            v-model:value="configForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeConfigDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitConfigForm">
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
  gap: 16px;
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

.toolbar-label {
  width: 72px;
  flex-shrink: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.group-card,
.content-card {
  min-height: calc(100vh - 236px);
  padding: 22px;
  border-radius: 20px;
  background: var(--n-color);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.group-card__header,
.content-card__header {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.group-card__header p,
.content-card__header p {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
}

.group-card__header h3,
.content-card__header h3 {
  margin: 4px 0 0;
  font-size: 22px;
  color: #0f172a;
}

.group-card__tip,
.content-card__tip {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #475569;
  line-height: 1.6;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(240, 253, 250, 0.95));
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-item {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  appearance: none;
  background: rgba(248, 250, 252, 0.92);
  transition: all 0.2s ease;
}

.group-item:hover {
  border-color: rgba(14, 116, 144, 0.24);
  background: rgba(241, 245, 249, 0.98);
  transform: translateY(-1px);
}

.group-item--active {
  border-color: rgba(13, 148, 136, 0.28);
  background: linear-gradient(135deg, rgba(236, 253, 245, 0.96), rgba(239, 246, 255, 0.96));
  box-shadow: 0 10px 24px rgba(13, 148, 136, 0.1);
}

.group-item__copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-item__copy strong {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.group-item__copy span {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
  word-break: break-all;
}

.content-actions {
  margin-bottom: 16px;
}

.config-table :deep(table) {
  width: 100%;
  table-layout: fixed;
}

.config-table :deep(th),
.config-table :deep(td) {
  vertical-align: middle;
}

.config-cell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-name {
  color: var(--lc-text-strong);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.config-subline {
  color: var(--lc-text-soft);
  font-size: 12px;
  line-height: 1.6;
}

.config-key {
  display: block;
  overflow: hidden;
  padding: 8px 10px;
  border: 1px solid var(--lc-border);
  border-radius: 12px;
  color: var(--lc-text-strong);
  background: var(--lc-surface-muted);
  font-family: 'Consolas', 'JetBrains Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.config-value {
  overflow: hidden;
  color: var(--lc-text-strong);
  line-height: 1.7;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.config-status,
.config-time {
  display: flex;
  min-height: 40px;
  align-items: center;
}

.config-status {
  justify-content: center;
}

.config-time {
  color: var(--lc-text-soft);
  font-size: 13px;
  line-height: 1.6;
}

.operation-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.operation-cell--end {
  justify-content: flex-end;
  align-items: center;
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

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .group-card,
  .content-card {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .toolbar-item {
    width: 100%;
  }

  .group-card,
  .content-card {
    padding: 18px;
  }
}
</style>

