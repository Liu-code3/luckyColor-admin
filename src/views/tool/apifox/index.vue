<script setup lang="ts">
import sysConfig from '@/config';
import { message } from '@/utils/message';

defineOptions({
  name: 'apifoxDoc'
});

const iframeRef = ref<HTMLIFrameElement | null>(null);
const apiDocUrl = sysConfig.API_DOC_URL;
const loading = ref(true);
const loadError = ref(false);

let loadTimer: number | null = null;

function handleIframeLoad() {
  loading.value = false;
  loadError.value = false;

  if (loadTimer !== null) {
    window.clearTimeout(loadTimer);
    loadTimer = null;
  }
}

function reloadDoc() {
  loading.value = true;
  loadError.value = false;

  if (iframeRef.value) {
    iframeRef.value.src = apiDocUrl;
  }
}

function openInNewTab() {
  window.open(apiDocUrl, '_blank', 'noopener,noreferrer');
}

function copyDocUrl() {
  navigator.clipboard.writeText(apiDocUrl);
  message.success('接口文档地址已复制');
}

onMounted(() => {
  loadTimer = window.setTimeout(() => {
    if (loading.value) {
      loadError.value = true;
    }
  }, 8000);
});

onBeforeUnmount(() => {
  if (loadTimer !== null) {
    window.clearTimeout(loadTimer);
  }
});
</script>

<template>
  <div class="api-doc-page">
    <section class="api-doc-hero">
      <div class="api-doc-hero__content">
        <span class="api-doc-hero__eyebrow">接口文档</span>
        <h1>Apifox</h1>
        <p>
          当前页面接入的是后端服务的在线接口文档，默认指向
          <code>{{ apiDocUrl }}</code>
        </p>
      </div>

      <div class="api-doc-hero__actions">
        <n-button secondary @click="copyDocUrl">
          复制地址
        </n-button>
        <n-button secondary @click="openInNewTab">
          新窗口打开
        </n-button>
        <n-button type="primary" @click="reloadDoc">
          重新加载
        </n-button>
      </div>
    </section>

    <section class="api-doc-card">
      <div class="api-doc-card__header">
        <div>
          <strong>LuckyColor Admin Serve API</strong>
          <span>{{ apiDocUrl }}</span>
        </div>
        <n-tag type="info" size="small">
          后端接口信息
        </n-tag>
      </div>

      <n-alert v-if="loadError" type="warning" :show-icon="false" class="api-doc-alert">
        文档页加载较慢或当前环境禁止 iframe 嵌入，可使用“新窗口打开”直接查看。
      </n-alert>

      <div class="api-doc-frame-wrap">
        <n-spin :show="loading">
          <iframe
            ref="iframeRef"
            :src="apiDocUrl"
            title="Apifox API Docs"
            class="api-doc-frame"
            @load="handleIframeLoad"
          />
        </n-spin>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
.api-doc-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.api-doc-hero,
.api-doc-card {
  background: var(--primary-bgColor);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.api-doc-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(244, 114, 182, 0.08));
}

.api-doc-hero__content {
  max-width: 760px;
}

.api-doc-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.api-doc-hero h1 {
  margin: 14px 0 10px;
  font-size: 34px;
  line-height: 1.1;
}

.api-doc-hero p {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.7;
}

.api-doc-hero code {
  font-family: Consolas, Monaco, monospace;
}

.api-doc-hero__actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.api-doc-card {
  padding: 16px;
}

.api-doc-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.api-doc-card__header strong,
.api-doc-card__header span {
  display: block;
}

.api-doc-card__header span {
  margin-top: 6px;
  color: var(--text-color-2);
  font-size: 13px;
}

.api-doc-alert {
  margin-bottom: 12px;
}

.api-doc-frame-wrap {
  min-height: calc(100vh - 280px);
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
}

.api-doc-frame {
  width: 100%;
  min-height: calc(100vh - 280px);
  border: none;
  background: #fff;
}

@media (max-width: 900px) {
  .api-doc-hero {
    flex-direction: column;
  }

  .api-doc-hero__actions {
    justify-content: flex-start;
  }
}
</style>
