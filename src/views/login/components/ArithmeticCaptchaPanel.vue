<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { LoginCaptchaChallengePayload } from '@/api';

const props = withDefaults(defineProps<{
  challenge: LoginCaptchaChallengePayload | null;
  modelValue: string;
  loading?: boolean;
  verifying?: boolean;
}>(), {
  loading: false,
  verifying: false
});

const emit = defineEmits<{
  (e: 'refresh'): void;
  (e: 'submit'): void;
  (e: 'update:modelValue', value: string): void;
}>();

const helperText = computed(() => {
  if (!props.challenge?.expiresAt)
    return '后端实时生成算术题，验证通过后会签发一次性登录令牌。';

  const expiresAt = new Date(props.challenge.expiresAt);
  if (Number.isNaN(expiresAt.getTime()))
    return '题面已生成，请尽快完成本次安全校验。';

  return `题面有效至 ${expiresAt.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })}`;
});

function handleInput(value: string) {
  emit('update:modelValue', value.replace(/[^\d-]/g, ''));
}
</script>

<template>
  <div class="captcha-panel">
    <div class="captcha-panel__header">
      <div>
        <div class="captcha-panel__label">
          算术校验
        </div>
        <strong>{{ challenge?.prompt || '请输入图中算式结果' }}</strong>
      </div>
      <n-button
        quaternary
        circle
        size="small"
        type="primary"
        :disabled="loading || verifying"
        @click="emit('refresh')"
      >
        <template #icon>
          <Icon icon="solar:refresh-linear" />
        </template>
      </n-button>
    </div>

    <div class="captcha-panel__surface" :class="{ 'captcha-panel__surface--disabled': !challenge?.captchaSvg }">
      <n-spin :show="loading">
        <div v-if="challenge?.captchaSvg" class="captcha-panel__svg" v-html="challenge.captchaSvg" />
        <div v-else class="captcha-panel__empty">
          验证题面加载失败，请点击右上角重新获取
        </div>
      </n-spin>
    </div>

    <div class="captcha-panel__helper">
      <Icon icon="solar:shield-check-linear" />
      <span>{{ helperText }}</span>
    </div>

    <n-input
      :value="modelValue"
      :disabled="loading || verifying || !challenge?.captchaSvg"
      clearable
      placeholder="请输入计算结果"
      maxlength="10"
      @update:value="handleInput"
      @keyup.enter="emit('submit')"
    >
      <template #prefix>
        <Icon icon="solar:calculator-linear" />
      </template>
    </n-input>
  </div>
</template>

<style scoped lang="less">
.captcha-panel {
  display: grid;
  gap: 14px;
}

.captcha-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.captcha-panel__label {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.captcha-panel__header strong {
  display: block;
  color: #0f172a;
  font-size: 16px;
  line-height: 1.5;
}

.captcha-panel__surface {
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(249, 115, 22, 0.08)),
    #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.22);
}

.captcha-panel__surface--disabled {
  opacity: 0.72;
}

.captcha-panel__svg {
  width: 100%;
  display: flex;
  justify-content: center;
}

.captcha-panel__svg :deep(svg) {
  max-width: 100%;
  height: auto;
}

.captcha-panel__empty {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  text-align: center;
}

.captcha-panel__helper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
  line-height: 1.6;
}

.captcha-panel__helper svg {
  flex-shrink: 0;
  font-size: 16px;
  color: #0f766e;
}

.captcha-panel :deep(.n-input-wrapper) {
  height: 54px !important;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
}

.captcha-panel :deep(.n-input__input-el) {
  height: 54px !important;
}

.captcha-panel :deep(.n-input__prefix) {
  color: #64748b;
  font-size: 18px;
}
</style>
