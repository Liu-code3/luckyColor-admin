<script setup lang="ts">
import type { OperationLogRecord } from '@/api';
import { getOperationLogPageApi } from '@/api';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

interface LogFilters {
  username: string;
  bizModule: string;
  requestUri: string;
  success: number | null;
}

type LocaleKey = 'zh-CN' | 'en-US';

const PAGE_SIZE_OPTIONS = [ 10, 20, 50 ];
const SUCCESS_OPTIONS = [
  { label: '全部结果', value: null },
  { label: '仅成功', value: 1 },
  { label: '仅失败', value: 0 }
];

const LOG_TEXT = {
  'zh-CN': {
    title: '操作日志',
    description: '查看系统操作轨迹，快速定位近期接口调用、执行耗时与失败原因。',
    searchTitle: '筛选条件',
    searchDescription: '支持按用户、业务模块、请求路径和执行结果快速过滤。',
    username: '操作用户',
    usernamePlaceholder: '输入用户名',
    bizModule: '业务模块',
    bizModulePlaceholder: '例如 system-user',
    requestUri: '请求路径',
    requestUriPlaceholder: '输入接口路径关键字',
    result: '执行结果',
    search: '查询',
    reset: '重置',
    totalLogs: '当前页日志',
    successLogs: '成功请求',
    averageDuration: '平均耗时',
    totalLogsHelper: '按当前条件返回的结果数量',
    successLogsHelper: '状态码与业务执行均成功的请求',
    averageDurationHelper: '仅基于当前页数据计算',
    time: '操作时间',
    user: '用户',
    module: '模块',
    method: '方法',
    uri: '请求地址',
    statusCode: '状态码',
    duration: '耗时',
    ip: '来源 IP',
    detail: '详情',
    successTag: '成功',
    failedTag: '失败',
    requestParams: '请求参数',
    errorMessage: '错误信息',
    empty: '暂无操作日志'
  },
  'en-US': {
    title: 'Operation Logs',
    description: 'Review recent operations, API requests, latency, and failure context in one place.',
    searchTitle: 'Filters',
    searchDescription: 'Filter by operator, business module, request URI, and execution result.',
    username: 'User',
    usernamePlaceholder: 'Enter a username',
    bizModule: 'Module',
    bizModulePlaceholder: 'For example system-user',
    requestUri: 'Request URI',
    requestUriPlaceholder: 'Search by URI keyword',
    result: 'Result',
    search: 'Search',
    reset: 'Reset',
    totalLogs: 'Logs on page',
    successLogs: 'Successful requests',
    averageDuration: 'Average duration',
    totalLogsHelper: 'Entries returned under the current filter set',
    successLogsHelper: 'Requests completed successfully',
    averageDurationHelper: 'Calculated from the current page only',
    time: 'Time',
    user: 'User',
    module: 'Module',
    method: 'Method',
    uri: 'Request URI',
    statusCode: 'Status',
    duration: 'Duration',
    ip: 'IP',
    detail: 'Detail',
    successTag: 'Success',
    failedTag: 'Failed',
    requestParams: 'Request params',
    errorMessage: 'Error message',
    empty: 'No operation logs'
  }
} as const;

const { locale } = useI18n();
const currentLocale = computed<LocaleKey>(() => locale.value === 'en-US' ? 'en-US' : 'zh-CN');
const text = computed(() => LOG_TEXT[currentLocale.value]);

const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const filters = reactive<LogFilters>({
  username: '',
  bizModule: '',
  requestUri: '',
  success: null
});
const rows = ref<OperationLogRecord[]>([]);

const summaryCards = computed(() => {
  const currentRows = rows.value;
  const successCount = currentRows.filter(item => item.success === 1).length;
  const averageDuration = currentRows.length
    ? Math.round(currentRows.reduce((sum, item) => sum + Number(item.durationMs || 0), 0) / currentRows.length)
    : 0;

  return [
    {
      title: text.value.totalLogs,
      value: currentRows.length,
      helper: text.value.totalLogsHelper,
      icon: 'solar:list-check-linear'
    },
    {
      title: text.value.successLogs,
      value: successCount,
      helper: text.value.successLogsHelper,
      icon: 'solar:check-circle-linear'
    },
    {
      title: text.value.averageDuration,
      value: `${averageDuration} ms`,
      helper: text.value.averageDurationHelper,
      icon: 'solar:clock-circle-linear'
    }
  ];
});

function formatMultiline(value?: string | null) {
  if (!value) {
    return '--';
  }

  return value.length > 120 ? `${value.slice(0, 120)}...` : value;
}

async function loadLogs() {
  loading.value = true;
  try {
    const response = await getOperationLogPageApi({
      pageNo: page.value,
      pageSize: pageSize.value,
      username: filters.username || undefined,
      bizModule: filters.bizModule || undefined,
      requestUri: filters.requestUri || undefined,
      success: filters.success ?? undefined
    });

    rows.value = response.data.records;
    total.value = response.data.total;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  void loadLogs();
}

function handleReset() {
  filters.username = '';
  filters.bizModule = '';
  filters.requestUri = '';
  filters.success = null;
  page.value = 1;
  void loadLogs();
}

function handlePageChange(value: number) {
  page.value = value;
  void loadLogs();
}

function handlePageSizeChange(value: number) {
  pageSize.value = value;
  page.value = 1;
  void loadLogs();
}

onMounted(() => {
  void loadLogs();
});
</script>

<template>
  <div class="operation-log-page">
    <section class="hero-card">
      <div>
        <p class="hero-card__eyebrow">System Trace</p>
        <h1>{{ text.title }}</h1>
        <p class="hero-card__description">
          {{ text.description }}
        </p>
      </div>
      <div class="hero-card__badge">
        <Icon icon="solar:history-linear" />
      </div>
    </section>

    <section class="search-card">
      <div class="search-card__header">
        <div>
          <h2>{{ text.searchTitle }}</h2>
          <p>{{ text.searchDescription }}</p>
        </div>
      </div>

      <div class="search-grid">
        <label>
          <span>{{ text.username }}</span>
          <n-input v-model:value="filters.username" :placeholder="text.usernamePlaceholder" clearable />
        </label>
        <label>
          <span>{{ text.bizModule }}</span>
          <n-input v-model:value="filters.bizModule" :placeholder="text.bizModulePlaceholder" clearable />
        </label>
        <label>
          <span>{{ text.requestUri }}</span>
          <n-input v-model:value="filters.requestUri" :placeholder="text.requestUriPlaceholder" clearable />
        </label>
        <label>
          <span>{{ text.result }}</span>
          <n-select v-model:value="filters.success" :options="SUCCESS_OPTIONS" clearable />
        </label>
      </div>

      <div class="search-actions">
        <n-button type="primary" @click="handleSearch">
          {{ text.search }}
        </n-button>
        <n-button @click="handleReset">
          {{ text.reset }}
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
                <th>{{ text.time }}</th>
                <th>{{ text.user }}</th>
                <th>{{ text.module }}</th>
                <th>{{ text.method }}</th>
                <th>{{ text.uri }}</th>
                <th>{{ text.result }}</th>
                <th>{{ text.statusCode }}</th>
                <th>{{ text.duration }}</th>
                <th>{{ text.ip }}</th>
                <th>{{ text.detail }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in rows" :key="item.id">
                <td>{{ item.createTime || '--' }}</td>
                <td>{{ item.username || '--' }}</td>
                <td>{{ item.bizModule || '--' }}</td>
                <td>
                  <n-tag size="small" :bordered="false" type="info">
                    {{ item.requestMethod || '--' }}
                  </n-tag>
                </td>
                <td>{{ item.requestUri || '--' }}</td>
                <td>
                  <n-tag size="small" :bordered="false" :type="item.success === 1 ? 'success' : 'error'">
                    {{ item.success === 1 ? text.successTag : text.failedTag }}
                  </n-tag>
                </td>
                <td>{{ item.statusCode ?? '--' }}</td>
                <td>{{ item.durationMs ?? 0 }} ms</td>
                <td>{{ item.remoteIp || '--' }}</td>
                <td>
                  <div class="detail-cell">
                    <span :title="item.requestParams || ''">
                      {{ formatMultiline(item.requestParams) }}
                    </span>
                    <span v-if="item.errorMessage" class="detail-cell__error" :title="item.errorMessage">
                      {{ formatMultiline(item.errorMessage) }}
                    </span>
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
  </div>
</template>

<style scoped>
.operation-log-page {
  display: grid;
  gap: 20px;
}

.hero-card,
.search-card,
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
  background: linear-gradient(135deg, #f8fbff 0%, #eef6ff 100%);
}

.hero-card h1,
.search-card h2 {
  margin: 0;
  font-size: 24px;
}

.hero-card__eyebrow {
  margin: 0 0 8px;
  color: #2563eb;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card__description,
.search-card__header p,
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
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 32px;
}

.search-card,
.table-card {
  padding: 24px;
}

.search-grid,
.summary-grid {
  display: grid;
  gap: 16px;
}

.search-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin-top: 20px;
}

.search-grid label {
  display: grid;
  gap: 8px;
  color: #334155;
  font-size: 13px;
}

.search-actions {
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
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
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
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
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

.detail-cell {
  display: grid;
  gap: 6px;
  min-width: 220px;
}

.detail-cell__error {
  color: #dc2626;
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

  .search-actions,
  .pagination-bar {
    justify-content: stretch;
  }

  .search-actions :deep(.n-button),
  .pagination-bar :deep(.n-pagination) {
    width: 100%;
  }
}
</style>
