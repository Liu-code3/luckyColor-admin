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

const loading = ref(false);
const submitting = ref(false);
const refreshingCache = ref(false);
const togglingConfigId = ref('');
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const configList = ref<ConfigRecord[]>([]);

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

function handleSearch() {
  page.value = 1;
  fetchConfigs(1);
}

function handleReset() {
  keyword.value = '';
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
    await fetchConfigs(nextPage);
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
  await fetchConfigs(nextPage);
}

onMounted(() => {
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

    <div class="content-card">
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
        <n-table :bordered="false" :single-line="false">
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
              <td>{{ item.configName }}</td>
              <td>{{ item.configKey }}</td>
              <td>{{ item.configValue }}</td>
              <td>{{ item.valueType }}</td>
              <td>
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
              </td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td class="operation-cell">
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

.content-card {
  min-height: calc(100vh - 236px);
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

@media (max-width: 768px) {
  .toolbar-item {
    width: 100%;
  }
}
</style>
