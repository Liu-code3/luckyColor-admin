<script setup lang="ts">
import { useRouter } from 'vue-router';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';
import { buildCodeBundle, buildGeneratedCodeFiles } from './generator';
import { useCodegenPreviewDraft } from './shared';

defineOptions({
  name: 'toolCodegenPreview'
});

const router = useRouter();
const previewDraft = useCodegenPreviewDraft();
const codeFiles = computed(() => previewDraft.value ? buildGeneratedCodeFiles(previewDraft.value) : []);

async function goBack() {
  await router.push('/tool/codegen');
}

async function downloadBundle() {
  if (!previewDraft.value) {
    message.warning('当前没有可下载的生成结果');
    return;
  }

  const confirmed = await confirmAction({
    title: '确认下载预览结果',
    content: `将导出 ${previewDraft.value.tableComment} 的代码骨架，请确认当前字段配置已经检查完成。`
  });

  if (!confirmed) {
    return;
  }

  const content = buildCodeBundle(previewDraft.value);
  const blob = new Blob([ content ], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${previewDraft.value.tableName}-preview.txt`;
  link.click();
  URL.revokeObjectURL(url);
  message.success('预览代码已下载');
}
</script>

<template>
  <div class="codegen-preview-page">
    <section class="preview-hero">
      <div>
        <span class="preview-hero__eyebrow">代码预览</span>
        <h1>{{ previewDraft?.tableComment || '代码生成预览' }}</h1>
        <p v-if="previewDraft">
          当前正在预览 <code>{{ previewDraft.tableName }}</code> 的生成结果，
          路由目标为 <code>{{ previewDraft.routePath }}</code>，模板类型为 <code>{{ previewDraft.templateType }}</code>。
        </p>
        <p v-else>
          当前没有可预览的配置，请返回代码生成器选择业务表后再进入。
        </p>
      </div>

      <div class="preview-hero__actions">
        <n-button secondary @click="goBack">
          返回生成器
        </n-button>
        <n-button type="primary" :disabled="!previewDraft" @click="downloadBundle">
          下载预览结果
        </n-button>
      </div>
    </section>

    <n-alert v-if="previewDraft" type="warning" :show-icon="false">
      预览结果只展示当前骨架文件，真实业务仍需补齐联表逻辑、权限校验、远程字典和审计埋点。
    </n-alert>

    <section v-if="previewDraft" class="preview-card">
      <n-tabs type="line" animated>
        <n-tab-pane
          v-for="file in codeFiles"
          :key="file.name"
          :name="file.name"
          :tab="file.name"
        >
          <div class="preview-file-meta">
            <strong>{{ file.name }}</strong>
            <span>{{ file.description }}</span>
          </div>
          <pre class="preview-code"><code>{{ file.content }}</code></pre>
        </n-tab-pane>
      </n-tabs>
    </section>

    <section v-else class="preview-empty">
      <PlatformState
        description="请先返回代码生成器选择业务表，再进入预览页查看生成结果。"
        title="当前还没有可预览的代码结果"
      />
    </section>
  </div>
</template>

<style scoped lang="less">
.codegen-preview-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.preview-hero,
.preview-card,
.preview-empty {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: var(--primary-bgColor);
}

.preview-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 28px;
  background:
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(249, 115, 22, 0.08));
}

.preview-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}

.preview-hero h1 {
  margin: 14px 0 10px;
  font-size: 34px;
}

.preview-hero p {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.75;
}

.preview-hero__actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.preview-card {
  padding: 16px;
}

.preview-file-meta {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.preview-file-meta strong,
.preview-file-meta span {
  display: block;
}

.preview-file-meta span {
  color: var(--text-color-2);
  font-size: 13px;
}

.preview-code {
  margin: 0;
  padding: 18px;
  border-radius: 12px;
  background: #0f172a;
  color: #e2e8f0;
  overflow: auto;
  font-size: 13px;
  line-height: 1.75;
}

.preview-empty {
  padding: 48px 20px;
}

@media (max-width: 900px) {
  .preview-hero {
    flex-direction: column;
  }

  .preview-hero__actions {
    justify-content: flex-start;
  }
}
</style>
