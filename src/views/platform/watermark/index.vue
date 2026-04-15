<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import { getCurrentWatermarkConfigApi, saveCurrentWatermarkConfigApi } from '@/api';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

interface WatermarkFormState {
  enabled: boolean;
  content: string;
  color: string;
  fontSize: number;
  opacityPercent: number;
  rotateDegree: number;
  gapX: number;
  gapY: number;
}

type LocaleKey = 'zh-CN' | 'en-US';

const WATERMARK_TEXT = {
  'zh-CN': {
    title: '水印设置',
    description: '配置租户侧统一水印内容、透明度、旋转角度与间距，预览保存结果。',
    enabled: '启用水印',
    content: '水印内容',
    color: '字体颜色',
    fontSize: '字体大小',
    opacityPercent: '透明度',
    rotateDegree: '旋转角度',
    gapX: '横向间距',
    gapY: '纵向间距',
    contentPlaceholder: '请输入水印内容',
    save: '保存配置',
    previewTitle: '预览效果',
    previewDescription: '预览区域会按当前表单值实时渲染，便于调整密度与识别度。',
    rulesTitle: '推荐设置',
    disabled: '已关闭',
    ruleOne: '字体大小建议控制在 14 到 24 之间，兼顾识别度和页面干扰。',
    ruleTwo: '透明度建议在 8% 到 18% 之间，避免遮挡正文信息。',
    ruleThree: '间距越小越密集，适合截图防扩散场景。',
    contentRequired: '请输入水印内容',
    colorRequired: '请输入字体颜色'
  },
  'en-US': {
    title: 'Watermark Settings',
    description: 'Configure tenant watermark content, opacity, rotation, and spacing with a live preview.',
    enabled: 'Enable watermark',
    content: 'Content',
    color: 'Font color',
    fontSize: 'Font size',
    opacityPercent: 'Opacity',
    rotateDegree: 'Rotation',
    gapX: 'Horizontal gap',
    gapY: 'Vertical gap',
    contentPlaceholder: 'Enter watermark content',
    save: 'Save configuration',
    previewTitle: 'Live preview',
    previewDescription: 'The preview updates in real time so you can balance readability and protection.',
    rulesTitle: 'Recommended defaults',
    disabled: 'Disabled',
    ruleOne: 'Keep the font size between 14 and 24 for a readable but unobtrusive result.',
    ruleTwo: 'An opacity range of 8% to 18% usually avoids blocking body content.',
    ruleThree: 'Smaller gaps create denser coverage for screenshot-heavy workflows.',
    contentRequired: 'Please enter watermark content',
    colorRequired: 'Please enter a font color'
  }
} as const;

const { locale } = useI18n();
const currentLocale = computed<LocaleKey>(() => locale.value === 'en-US' ? 'en-US' : 'zh-CN');
const text = computed(() => WATERMARK_TEXT[currentLocale.value]);

const loading = ref(false);
const submitting = ref(false);
const formRef = ref<FormInst | null>(null);
const form = reactive<WatermarkFormState>({
  enabled: true,
  content: 'LuckyColor Admin',
  color: '#0f172a',
  fontSize: 16,
  opacityPercent: 12,
  rotateDegree: -18,
  gapX: 180,
  gapY: 120
});

const formRules = computed<FormRules>(() => ({
  content: [
    { required: true, message: text.value.contentRequired, trigger: [ 'blur', 'input' ] }
  ],
  color: [
    { required: true, message: text.value.colorRequired, trigger: [ 'blur', 'change' ] }
  ]
}));

const previewColor = computed(() => {
  const hex = form.color.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return `rgba(15, 23, 42, ${form.opacityPercent / 100})`;
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${form.opacityPercent / 100})`;
});

async function loadConfig() {
  loading.value = true;
  try {
    const response = await getCurrentWatermarkConfigApi();
    form.enabled = response.data.enabled === 1;
    form.content = response.data.content;
    form.color = response.data.color;
    form.fontSize = response.data.fontSize;
    form.opacityPercent = response.data.opacityPercent;
    form.rotateDegree = response.data.rotateDegree;
    form.gapX = response.data.gapX;
    form.gapY = response.data.gapY;
  }
  finally {
    loading.value = false;
  }
}

async function handleSubmit() {
  try {
    await formRef.value?.validate();
  }
  catch {
    return;
  }

  submitting.value = true;
  try {
    await saveCurrentWatermarkConfigApi({
      enabled: form.enabled ? 1 : 0,
      content: form.content.trim(),
      color: form.color,
      fontSize: form.fontSize,
      opacityPercent: form.opacityPercent,
      rotateDegree: form.rotateDegree,
      gapX: form.gapX,
      gapY: form.gapY
    });
    await loadConfig();
  }
  finally {
    submitting.value = false;
  }
}

onMounted(() => {
  void loadConfig();
});
</script>

<template>
  <div class="watermark-page">
    <section class="hero-card">
      <div>
        <p class="hero-card__eyebrow">Watermark</p>
        <h1>{{ text.title }}</h1>
        <p class="hero-card__description">
          {{ text.description }}
        </p>
      </div>
      <div class="hero-card__badge">
        <Icon icon="solar:text-field-focus-linear" />
      </div>
    </section>

    <div class="content-grid">
      <section class="form-card">
        <n-spin :show="loading">
          <n-form ref="formRef" :model="form" :rules="formRules" label-placement="top">
            <div class="switch-row">
              <div>
                <h2>{{ text.enabled }}</h2>
              </div>
              <n-switch v-model:value="form.enabled" />
            </div>

            <n-form-item :label="text.content" path="content">
              <n-input v-model:value="form.content" :placeholder="text.contentPlaceholder" />
            </n-form-item>

            <div class="field-grid">
              <n-form-item :label="text.color" path="color">
                <n-color-picker v-model:value="form.color" :modes="['hex']" />
              </n-form-item>
              <n-form-item :label="text.fontSize">
                <n-input-number v-model:value="form.fontSize" :min="10" :max="96" :step="1" class="full-width" />
              </n-form-item>
              <n-form-item :label="text.opacityPercent">
                <n-input-number v-model:value="form.opacityPercent" :min="1" :max="100" :step="1" class="full-width" />
              </n-form-item>
              <n-form-item :label="text.rotateDegree">
                <n-input-number v-model:value="form.rotateDegree" :min="-180" :max="180" :step="1" class="full-width" />
              </n-form-item>
              <n-form-item :label="text.gapX">
                <n-input-number v-model:value="form.gapX" :min="40" :max="400" :step="10" class="full-width" />
              </n-form-item>
              <n-form-item :label="text.gapY">
                <n-input-number v-model:value="form.gapY" :min="40" :max="400" :step="10" class="full-width" />
              </n-form-item>
            </div>

            <div class="form-actions">
              <n-button type="primary" :loading="submitting" @click="handleSubmit">
                {{ text.save }}
              </n-button>
            </div>
          </n-form>
        </n-spin>
      </section>

      <section class="preview-card">
        <div class="preview-card__header">
          <div>
            <h2>{{ text.previewTitle }}</h2>
            <p>{{ text.previewDescription }}</p>
          </div>
        </div>

        <n-watermark
          v-if="form.enabled"
          class="preview-board"
          :content="form.content"
          :font-size="form.fontSize"
          :line-height="form.fontSize"
          :width="form.gapX"
          :height="form.gapY"
          :rotate="form.rotateDegree"
          :font-color="previewColor"
          :x-offset="12"
          :y-offset="12"
        >
          <div class="preview-board__surface">
            <strong>LuckyColor Admin</strong>
            <span>{{ text.enabled }}</span>
          </div>
        </n-watermark>
        <div v-else class="preview-board preview-board--disabled">
          <div class="preview-board__surface">
            <strong>LuckyColor Admin</strong>
            <span>{{ text.disabled }}</span>
          </div>
        </div>

        <div class="rules-card">
          <h3>{{ text.rulesTitle }}</h3>
          <ul>
            <li>{{ text.ruleOne }}</li>
            <li>{{ text.ruleTwo }}</li>
            <li>{{ text.ruleThree }}</li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.watermark-page {
  display: grid;
  gap: 20px;
}

.hero-card,
.form-card,
.preview-card {
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
  background: linear-gradient(135deg, #f7fff9 0%, #eefcf3 100%);
}

.hero-card h1,
.preview-card h2,
.switch-row h2,
.rules-card h3 {
  margin: 0;
}

.hero-card__eyebrow {
  margin: 0 0 8px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card__description,
.preview-card__header p,
.rules-card li {
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
  background: rgba(22, 163, 74, 0.12);
  color: #16a34a;
  font-size: 32px;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 20px;
}

.form-card,
.preview-card {
  padding: 24px;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.full-width {
  width: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.preview-board {
  margin-top: 20px;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.preview-board__surface {
  display: grid;
  place-items: center;
  min-height: 280px;
  gap: 8px;
  color: #0f172a;
}

.preview-board__surface strong {
  font-size: 28px;
}

.rules-card {
  margin-top: 20px;
  padding: 20px;
  border-radius: 20px;
  background: #f8fafc;
}

.rules-card ul {
  margin: 12px 0 0;
  padding-left: 18px;
}

@media (max-width: 960px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .hero-card,
  .switch-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    width: 100%;
  }

  .form-actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
