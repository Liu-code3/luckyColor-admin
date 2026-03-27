<script setup lang="ts">
import type { LoginCaptchaChallengePayload } from '@/api';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';

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

const { locale, t } = useI18n();
const NON_CALC_CHARS = /[^\d-]/g;

const isDisabled = computed(() =>
  props.loading || props.verifying || !props.challenge?.captchaSvg
);

const promptText = computed(() => t('login.captcha.defaultPrompt'));

const helperText = computed(() => {
  if (!props.challenge?.expiresAt) {
    return t('login.captcha.refreshHint');
  }

  const expiresAt = new Date(props.challenge.expiresAt);
  if (Number.isNaN(expiresAt.getTime())) {
    return t('login.captcha.expiresSoon');
  }

  return t('login.captcha.expiresAt', {
    time: expiresAt.toLocaleTimeString(locale.value === 'en-US' ? 'en-US' : 'zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  });
});

function handleInput(value: string) {
  emit('update:modelValue', value.replace(NON_CALC_CHARS, ''));
}
</script>

<template>
  <div class="captcha-panel">
    <div class="captcha-panel__row">
      <div class="captcha-panel__field" :class="{ 'captcha-panel__field--disabled': isDisabled }">
        <div class="captcha-panel__field-icon">
          <Icon icon="solar:calculator-linear" />
        </div>

        <n-input
          :value="modelValue"
          :disabled="isDisabled"
          class="captcha-panel__input"
          clearable
          :placeholder="t('login.captcha.inputPlaceholder')"
          maxlength="10"
          @update:value="handleInput"
          @keyup.enter="emit('submit')"
        />
      </div>

      <button
        type="button"
        class="captcha-panel__visual"
        :class="{ 'captcha-panel__visual--disabled': !challenge?.captchaSvg }"
        :disabled="loading || verifying"
        @click="emit('refresh')"
      >
        <span class="captcha-panel__refresh">
          <Icon icon="solar:refresh-linear" />
        </span>

        <n-spin :show="loading">
          <div v-if="challenge?.captchaSvg" class="captcha-panel__svg" v-html="challenge.captchaSvg" />
          <div v-else class="captcha-panel__empty">
            {{ t('login.captcha.empty') }}
          </div>
        </n-spin>
      </button>
    </div>

    <div class="captcha-panel__helper">
      <span>{{ promptText }}</span>
      <span class="captcha-panel__helper-dot" />
      <span>{{ helperText }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
.captcha-panel {
  display: grid;
  gap: 8px;
}

.captcha-panel__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 156px;
  gap: 12px;
  align-items: center;
}

.captcha-panel__field {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 56px;
  padding: 0 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  border: 1px solid rgba(15, 118, 110, 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 10px 24px rgba(15, 23, 42, 0.05);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.captcha-panel__field:hover,
.captcha-panel__field:focus-within {
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 0 0 4px rgba(15, 118, 110, 0.08),
    0 16px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.captcha-panel__field--disabled {
  opacity: 0.72;
}

.captcha-panel__field-icon {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-right: 10px;
  color: #0f766e;
  font-size: 18px;
}

.captcha-panel__input {
  flex: 1;
}

.captcha-panel__input :deep(.n-input-wrapper) {
  height: auto !important;
  padding: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.captcha-panel__input :deep(.n-input__border),
.captcha-panel__input :deep(.n-input__state-border) {
  display: none !important;
}

.captcha-panel__input :deep(.n-input__input-el) {
  height: 54px !important;
  font-size: 15px;
  color: #2a2117;
}

.captcha-panel__visual {
  position: relative;
  min-height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  border: 1px solid rgba(15, 118, 110, 0.16);
  border-radius: 18px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.9)),
    linear-gradient(135deg, rgba(15, 118, 110, 0.08), rgba(249, 115, 22, 0.08));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 10px 24px rgba(15, 23, 42, 0.05);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.captcha-panel__visual:hover:not(:disabled) {
  border-color: rgba(15, 118, 110, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 0 0 4px rgba(15, 118, 110, 0.08),
    0 16px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.captcha-panel__visual--disabled {
  opacity: 0.72;
}

.captcha-panel__visual :deep(.n-spin-body) {
  width: 100%;
}

.captcha-panel__svg {
  width: 100%;
  display: flex;
  justify-content: center;
}

.captcha-panel__svg :deep(svg) {
  max-width: 100%;
  max-height: 30px;
  height: auto;
}

.captcha-panel__empty {
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.captcha-panel__refresh {
  position: absolute;
  top: 8px;
  right: 8px;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #0f766e;
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
  font-size: 13px;
}

.captcha-panel__helper {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 0 4px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.captcha-panel__helper-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.45);
}

@media (max-width: 560px) {
  .captcha-panel__row {
    grid-template-columns: minmax(0, 1fr) 132px;
    gap: 10px;
  }

  .captcha-panel__field,
  .captcha-panel__visual {
    min-height: 52px;
    border-radius: 16px;
  }

  .captcha-panel__field {
    padding: 0 14px;
  }

  .captcha-panel__input :deep(.n-input__input-el) {
    height: 50px !important;
  }

  .captcha-panel__svg :deep(svg) {
    max-height: 26px;
  }

  .captcha-panel__helper {
    font-size: 11px;
  }
}
</style>
