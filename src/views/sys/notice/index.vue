<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import type { NoticeRecord } from '@/api';
import { Icon } from '@iconify/vue';
import {
  createNoticeApi,
  deleteNoticeApi,
  getNoticeDetailApi,
  getNoticePageApi,

  updateNoticeApi
} from '@/api';
import { confirmAction } from '@/utils/confirm';

interface NoticeFormState {
  title: string;
  content: string;
  type: string;
  status: boolean;
  publisher: string;
  publishedAt: number | null;
}

interface SummaryCard {
  label: string;
  value: number;
  helper: string;
  tone: 'primary' | 'success' | 'warning' | 'info';
}

const loading = ref(false);
const submitting = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const noticeList = ref<NoticeRecord[]>([]);

const noticeFormRef = ref<FormInst | null>(null);
const showNoticeDrawer = ref(false);
const isEditMode = ref(false);
const editingNoticeId = ref('');
const showPreviewModal = ref(false);
const previewNotice = ref<NoticeRecord | null>(null);
const noticeForm = reactive<NoticeFormState>({
  title: '',
  content: '',
  type: 'system',
  status: false,
  publisher: '',
  publishedAt: null
});

const noticeTypeOptions = [
  { label: '系统公告', value: 'system' },
  { label: '版本发布', value: 'release' },
  { label: '运营通知', value: 'notice' }
];

const summaryCards = computed<SummaryCard[]>(() => [
  {
    label: '\u516C\u544A\u603B\u6570',
    value: total.value,
    helper: '\u57FA\u4E8E\u5F53\u524D\u68C0\u7D22\u6761\u4EF6\u7684\u5168\u90E8\u5185\u5BB9',
    tone: 'primary'
  },
  {
    label: '\u5DF2\u53D1\u5E03',
    value: noticeList.value.filter(item => item.status).length,
    helper: '\u5DF2\u8FDB\u5165\u7EBF\u4E0A\u89E6\u8FBE\u72B6\u6001\u7684\u5185\u5BB9',
    tone: 'success'
  },
  {
    label: '\u8349\u7A3F',
    value: noticeList.value.filter(item => !item.status).length,
    helper: '\u9002\u5408\u7EE7\u7EED\u7F16\u8F91\u6216\u5B89\u6392\u53D1\u5E03\u65F6\u673A',
    tone: 'warning'
  },
  {
    label: '\u53D1\u5E03\u4EBA',
    value: new Set(noticeList.value.map(item => item.publisher?.trim()).filter(Boolean)).size,
    helper: '\u5F53\u524D\u5217\u8868\u4E2D\u7684\u5185\u5BB9\u8D1F\u8D23\u4EBA\u6570',
    tone: 'info'
  }
]);

const noticeFormRules: FormRules = {
  title: [
    {
      required: true,
      message: '请输入公告标题',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 100,
      message: '公告标题不能超过 100 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  content: [
    {
      required: true,
      message: '请输入公告内容',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 2000,
      message: '公告内容不能超过 2000 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  type: [
    {
      required: true,
      message: '请选择公告类型',
      trigger: [ 'change', 'blur' ]
    }
  ],
  publisher: [
    {
      validator: (_, value: string) => !value || value.trim().length <= 30,
      message: '发布人不能超过 30 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ]
};

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function getSummaryCardClass(tone: SummaryCard['tone']) {
  return `summary-card summary-card--${tone}`;
}

function getNoticeTypeLabel(type: string) {
  const match = noticeTypeOptions.find(option => option.value === type);
  return match?.label || type;
}

function resetNoticeForm() {
  editingNoticeId.value = '';
  noticeForm.title = '';
  noticeForm.content = '';
  noticeForm.type = 'system';
  noticeForm.status = false;
  noticeForm.publisher = '';
  noticeForm.publishedAt = null;
}

async function fetchNotices(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getNoticePageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    noticeList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchNotices(1);
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  fetchNotices(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchNotices(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchNotices(1);
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetNoticeForm();
  showNoticeDrawer.value = true;
}

async function openEditDrawer(notice: NoticeRecord) {
  isEditMode.value = true;
  resetNoticeForm();
  editingNoticeId.value = notice.id;
  showNoticeDrawer.value = true;

  const { data } = await getNoticeDetailApi(notice.id);
  noticeForm.title = data.title;
  noticeForm.content = data.content;
  noticeForm.type = data.type;
  noticeForm.status = data.status;
  noticeForm.publisher = data.publisher || '';
  noticeForm.publishedAt = data.publishedAt ? new Date(data.publishedAt).getTime() : null;
}

function closeNoticeDrawer() {
  showNoticeDrawer.value = false;
  resetNoticeForm();
  noticeFormRef.value?.restoreValidation();
}

function openPreviewModal(notice: NoticeRecord) {
  previewNotice.value = notice;
  showPreviewModal.value = true;
}

function closePreviewModal() {
  showPreviewModal.value = false;
  previewNotice.value = null;
}

async function submitNoticeForm() {
  await noticeFormRef.value?.validate();

  const publishedAt = noticeForm.status
    ? (noticeForm.publishedAt ? new Date(noticeForm.publishedAt).toISOString() : new Date().toISOString())
    : (noticeForm.publishedAt ? new Date(noticeForm.publishedAt).toISOString() : undefined);

  const payload = {
    title: noticeForm.title.trim(),
    content: noticeForm.content.trim(),
    type: noticeForm.type,
    status: noticeForm.status,
    publisher: noticeForm.publisher.trim() || undefined,
    publishedAt
  };

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateNoticeApi(editingNoticeId.value, {
        ...payload,
        publisher: payload.publisher ?? null,
        publishedAt: payload.publishedAt ?? null
      });
    }
    else {
      await createNoticeApi(payload);
    }

    closeNoticeDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await fetchNotices(nextPage);
  }
  finally {
    submitting.value = false;
  }
}

async function handleDeleteNotice(notice: NoticeRecord) {
  const confirmed = await confirmAction({
    title: '删除公告',
    content: `确认删除公告“${notice.title}”吗？`
  });

  if (!confirmed)
    return;

  await deleteNoticeApi(notice.id);
  const nextPage = noticeList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await fetchNotices(nextPage);
}

onMounted(() => {
  fetchNotices();
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
        <small class="summary-card__helper">{{ card.helper }}</small>
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
          placeholder="输入公告标题或内容"
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
        <n-button type="primary" @click="openCreateDrawer">
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增公告
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>公告标题</th>
              <th>类型</th>
              <th>发布状态</th>
              <th>发布人</th>
              <th>发布时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in noticeList" :key="item.id">
              <td>
                <div class="primary-text">
                  {{ item.title }}
                </div>
                <div class="secondary-text notice-snippet">
                  {{ item.content }}
                </div>
              </td>
              <td>{{ getNoticeTypeLabel(item.type) }}</td>
              <td>
                <n-tag :type="item.status ? 'success' : 'warning'">
                  {{ item.status ? '已发布' : '草稿' }}
                </n-tag>
              </td>
              <td>{{ item.publisher || '-' }}</td>
              <td>{{ formatDateTime(item.publishedAt) }}</td>
              <td class="operation-cell">
                <div class="operation-actions">
                  <n-button quaternary @click="openPreviewModal(item)">
                    预览
                  </n-button>
                  <n-button quaternary type="primary" @click="openEditDrawer(item)">
                    编辑
                  </n-button>
                  <n-button quaternary type="error" @click="handleDeleteNotice(item)">
                    删除
                  </n-button>
                </div>
              </td>
            </tr>
            <tr v-if="!noticeList.length">
              <td colspan="6">
                <n-empty description="暂无公告数据" />
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

  <n-drawer v-model:show="showNoticeDrawer" :width="640" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑公告' : '新增公告'">
      <n-form ref="noticeFormRef" :model="noticeForm" :rules="noticeFormRules" label-placement="top">
        <div class="lc-form-stack">
          <section class="lc-form-section">
            <div class="lc-form-section__header">
              <div>
                <p class="lc-form-section__eyebrow">
                  Publish
                </p>
                <h3 class="lc-form-section__title">
                  {{ isEditMode ? '\u7f16\u8f91\u516c\u544a' : '\u521b\u5efa\u516c\u544a' }}
                </h3>
                <p class="lc-form-section__description">
                  {{ '\u7edf\u4e00\u5904\u7406\u6807\u9898\uff0c\u7c7b\u578b\uff0c\u53d1\u5e03\u72b6\u6001\u4e0e\u65f6\u95f4\uff0c\u63d0\u5347\u5185\u5bb9\u8fd0\u8425\u7684\u8282\u594f\u611f\u3002' }}
                </p>
              </div>
            </div>
            <n-form-item label="公告标题" path="title">
              <n-input v-model:value="noticeForm.title" placeholder="请输入公告标题" />
            </n-form-item>
            <n-form-item label="公告类型" path="type">
              <n-select v-model:value="noticeForm.type" :options="noticeTypeOptions" />
            </n-form-item>
            <n-form-item label="发布状态" path="status">
              <n-switch v-model:value="noticeForm.status">
                <template #checked>
                  已发布
                </template>
                <template #unchecked>
                  草稿
                </template>
              </n-switch>
            </n-form-item>
            <n-form-item label="发布人" path="publisher">
              <n-input v-model:value="noticeForm.publisher" placeholder="请输入发布人" />
            </n-form-item>
            <n-form-item label="发布时间" path="publishedAt">
              <n-date-picker
                v-model:value="noticeForm.publishedAt"
                class="w-full"
                clearable
                type="datetime"
              />
            </n-form-item>
            <n-form-item label="公告内容" path="content">
              <n-input
                v-model:value="noticeForm.content"
                type="textarea"
                placeholder="请输入公告内容"
                :autosize="{ minRows: 5, maxRows: 8 }"
              />
            </n-form-item>
          </section>
        </div>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeNoticeDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitNoticeForm">
            保存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>

  <n-modal
    v-model:show="showPreviewModal"
    preset="card"
    title="公告预览"
    style="width: min(720px, calc(100vw - 32px));"
    @close="closePreviewModal"
  >
    <div v-if="previewNotice" class="preview-modal">
      <div class="preview-header">
        <div class="preview-title">
          {{ previewNotice.title }}
        </div>
        <div class="preview-meta">
          <span>类型：{{ getNoticeTypeLabel(previewNotice.type) }}</span>
          <span>状态：{{ previewNotice.status ? '已发布' : '草稿' }}</span>
          <span>发布人：{{ previewNotice.publisher || '-' }}</span>
          <span>发布时间：{{ formatDateTime(previewNotice.publishedAt) }}</span>
        </div>
      </div>
      <div class="preview-content">
        {{ previewNotice.content }}
      </div>
    </div>

    <template #footer>
      <div class="drawer-footer">
        <n-button @click="closePreviewModal">
          关闭
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
  width: 360px;
}

.toolbar-item--wide {
  width: 420px;
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

.primary-text {
  font-weight: 600;
}

.secondary-text {
  margin-top: 4px;
  font-size: 12px;
}

.notice-snippet {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 1.6;
}

@import '@/styles/table-operation.less';

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

.preview-modal {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.preview-title {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
}

.preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-top: 12px;
  color: var(--text-color-2);
  font-size: 13px;
}

.preview-content {
  max-height: 60vh;
  overflow: auto;
  color: var(--text-color-1);
  line-height: 1.8;
  white-space: pre-wrap;
  word-break: break-word;
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
