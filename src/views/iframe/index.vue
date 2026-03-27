<script setup lang="ts">
import { useRoute } from 'vue-router';

defineOptions({
  name: 'menuIframeView'
});

const route = useRoute();
const iframeRef = ref<HTMLIFrameElement | null>(null);
const frameKey = ref(0);
const loading = ref(true);
const loadError = ref(false);

const pageTitle = computed(() => String(route.meta?.title || '内嵌页面'));
const iframeUrl = computed(() => String(route.meta?.url || ''));

let loadTimer: number | null = null;

function clearLoadTimer() {
  if (loadTimer !== null) {
    window.clearTimeout(loadTimer);
    loadTimer = null;
  }
}

function startLoadingState() {
  loading.value = true;
  loadError.value = false;
  clearLoadTimer();
  loadTimer = window.setTimeout(() => {
    if (loading.value) {
      loadError.value = true;
    }
  }, 8000);
}

function handleIframeLoad() {
  loading.value = false;
  loadError.value = false;
  clearLoadTimer();
}

function reloadFrame() {
  if (!iframeUrl.value) {
    return;
  }

  frameKey.value += 1;
  startLoadingState();
}

function openInNewTab() {
  if (!iframeUrl.value) {
    return;
  }

  window.open(iframeUrl.value, '_blank', 'noopener,noreferrer');
}

watch(
  () => route.fullPath,
  () => {
    frameKey.value += 1;
    startLoadingState();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  clearLoadTimer();
});
</script>

<template>
  <div class="menu-iframe-page">
    <section class="menu-iframe-page__hero">
      <div>
        <span class="menu-iframe-page__eyebrow">iframe 菜单</span>
        <h1>{{ pageTitle }}</h1>
        <p>
          当前菜单通过 iframe 方式承载外部页面，地址为
          <code>{{ iframeUrl || '未配置地址' }}</code>
        </p>
      </div>

      <div class="menu-iframe-page__actions">
        <n-button secondary :disabled="!iframeUrl" @click="openInNewTab">
          新窗口打开
        </n-button>
        <n-button type="primary" :disabled="!iframeUrl" @click="reloadFrame">
          重新加载
        </n-button>
      </div>
    </section>

    <section class="menu-iframe-page__card">
      <div class="menu-iframe-page__frame-wrap">
        <PlatformState
          v-if="!iframeUrl"
          title="当前菜单还没有配置页面地址"
          description="请先为这个菜单补充 iframe 链接，或者切换到其他已配置的菜单项。"
          class="menu-iframe-page__empty"
        />
        <PlatformState
          v-else-if="loadError"
          type="error"
          title="页面暂时无法嵌入"
          description="目标站点可能禁止 iframe 嵌入，或者当前页面加载超时。你可以尝试重新加载，或直接在新窗口中打开。"
          class="menu-iframe-page__empty"
        >
          <n-button secondary @click="reloadFrame">
            重新加载
          </n-button>
          <n-button type="primary" secondary @click="openInNewTab">
            新窗口打开
          </n-button>
        </PlatformState>
        <n-spin v-else :show="loading">
          <iframe
            :key="frameKey"
            ref="iframeRef"
            :src="iframeUrl"
            :title="`${pageTitle} iframe`"
            class="menu-iframe-page__frame"
            @load="handleIframeLoad"
          />
        </n-spin>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.menu-iframe-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.menu-iframe-page__hero,
.menu-iframe-page__card {
  background: var(--primary-bgColor);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.menu-iframe-page__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  background:
    radial-gradient(circle at top right, rgba(56, 189, 248, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(15, 23, 42, 0.02));
}

.menu-iframe-page__eyebrow {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(14, 165, 233, 0.12);
  color: #0284c7;
  font-size: 12px;
  font-weight: 700;
}

.menu-iframe-page__hero h1 {
  margin: 14px 0 10px;
  font-size: 32px;
  line-height: 1.1;
}

.menu-iframe-page__hero p {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.7;
}

.menu-iframe-page__hero code {
  font-family: Consolas, Monaco, monospace;
}

.menu-iframe-page__actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.menu-iframe-page__card {
  padding: 16px;
}

.menu-iframe-page__frame-wrap {
  min-height: calc(100vh - 280px);
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
}

.menu-iframe-page__empty {
  min-height: calc(100vh - 280px);
}

.menu-iframe-page__frame {
  width: 100%;
  min-height: calc(100vh - 280px);
  border: none;
  background: #fff;
}

@media (max-width: 900px) {
  .menu-iframe-page__hero {
    flex-direction: column;
  }

  .menu-iframe-page__actions {
    justify-content: flex-start;
  }
}
</style>
