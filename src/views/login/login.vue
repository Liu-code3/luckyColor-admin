<script setup lang="ts">
import type { LoginCaptchaChallengePayload } from '@/api';
import type { FormInst, FormRules } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import {
  getLoginCaptchaChallengeApi,
  getMenuTreeApi,
  loginApi,
  verifyLoginCaptchaApi
} from '@/api';
import sysConfig from '@/config';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import { useMenuStore } from '@/store/modules/menu.ts';
import {
  setAccessToken,
  setCurrentTenantContext,
  setCurrentUserInfo
} from '@/utils/auth';
import { Encrypt } from '@/utils/crypto-md5';
import { message } from '@/utils/message.ts';
import { filterTreeRecordsByCurrentTenant } from '@/utils/tenant-scope';
import { resolveSessionButtonCodeList } from '@/utils/permission';
import tool from '@/utils/tool';
import ArithmeticCaptchaPanel from './components/ArithmeticCaptchaPanel.vue';

const router = useRouter();
const menuStore = useMenuStore();
const { t } = useI18n();
const formRef = ref<FormInst | null>(null);

const accentColor = ref(sysConfig.COLOR || '#0F766E');
const loginCaptchaEnabled = sysConfig.LOGIN_CAPTCHA_ENABLED;
const tenantEnabled = sysConfig.TENANT_ENABLED;
const defaultUsername = sysConfig.DEFAULT_LOGIN_USERNAME;
const defaultPassword = sysConfig.DEFAULT_LOGIN_PASSWORD;
const INTEGER_PATTERN = /^-?\d+$/;
const HEX_COLOR_PATTERN = /^[0-9a-f]{6}$/i;

const formValue = reactive({
  adminName: defaultUsername,
  password: defaultPassword,
  captchaAnswer: ''
});

const captchaState = reactive({
  challenge: null as LoginCaptchaChallengePayload | null,
  loading: false,
  verifying: false,
  submitting: false
});

const rules = computed<FormRules>(() => {
  const baseRules: FormRules = {
    adminName: {
      required: true,
      message: t('login.validation.usernameRequired'),
      trigger: 'blur'
    },
    password: {
      required: true,
      message: t('login.validation.passwordRequired'),
      trigger: ['input', 'blur']
    }
  };

  if (!loginCaptchaEnabled) {
    return baseRules;
  }

  return {
    ...baseRules,
    captchaAnswer: [
      {
        required: true,
        message: t('login.validation.captchaRequired'),
        trigger: ['input', 'blur']
      },
      {
        validator: (_rule, value: string) => INTEGER_PATTERN.test(String(value ?? '').trim())
          ? true
          : new Error(t('login.validation.captchaMustInteger')),
        trigger: ['input', 'blur']
      }
    ]
  };
});

const authBadges = computed(() => [
  loginCaptchaEnabled ? t('login.badges.captchaEnabled') : t('login.badges.captchaDisabled'),
  tenantEnabled ? t('login.badges.tenantEnabled') : t('login.badges.tenantDisabled')
]);

const asideNotes = computed(() => [
  {
    title: t('login.notes.focus.title'),
    description: t('login.notes.focus.description')
  },
  {
    title: t('login.notes.palette.title'),
    description: t('login.notes.palette.description')
  },
  {
    title: t('login.notes.tenant.title'),
    description: tenantEnabled ? t('login.notes.tenant.enabled') : t('login.notes.tenant.disabled')
  }
]);

const loginPageStyle = computed(() => ({
  '--accent-color': accentColor.value,
  '--accent-color-soft': hexToRgba(accentColor.value, 0.14),
  '--accent-color-strong': hexToRgba(accentColor.value, 0.22),
  '--accent-color-glow': hexToRgba(accentColor.value, 0.34)
}));

const submitButtonText = computed(() => {
  if (captchaState.verifying) {
    return t('login.actions.verifying');
  }

  if (captchaState.submitting) {
    return t('login.actions.signingIn');
  }

  return t('login.actions.enterWorkspace');
});

const authTipText = computed(() =>
  loginCaptchaEnabled ? t('login.tips.captchaEnabled') : t('login.tips.captchaDisabled')
);

const canSubmit = computed(() => {
  return !captchaState.loading
    && !captchaState.verifying
    && !captchaState.submitting
    && (!loginCaptchaEnabled || Boolean(captchaState.challenge?.captchaId));
});

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  if (!HEX_COLOR_PATTERN.test(full)) {
    return `rgba(15, 118, 110, ${alpha})`;
  }

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

async function refreshCaptcha(showToast = false) {
  if (!loginCaptchaEnabled) {
    captchaState.challenge = null;
    captchaState.loading = false;
    formValue.captchaAnswer = '';
    return;
  }

  if (captchaState.loading) {
    return;
  }

  captchaState.loading = true;
  formValue.captchaAnswer = '';

  try {
    const res = await getLoginCaptchaChallengeApi();
    captchaState.challenge = res.data;

    if (showToast) {
      message.success(t('login.messages.captchaRefreshed'));
    }
  }
  catch {
    captchaState.challenge = null;
    if (showToast) {
      message.error(t('login.messages.captchaLoadFailed'));
    }
  }
  finally {
    captchaState.loading = false;
  }
}

async function performLogin(captchaToken?: string) {
  const res = await loginApi({
    username: formValue.adminName.trim(),
    password: formValue.password,
    ...(captchaToken ? { captchaToken } : {})
  });

  const { code, data } = res;
  if (code !== 200) {
    return;
  }

  setAccessToken(data.accessToken);
  setCurrentTenantContext({
    tenantId: data.user.tenantId,
    tenantName: data.user.tenantName ?? null,
    source: 'login'
  });
  setCurrentUserInfo({
    id: data.user.id,
    tenantId: data.user.tenantId,
    tenantName: data.user.tenantName ?? null,
    username: data.user.username,
    displayName: data.user.nickname || data.user.username,
    roleCodes: data.user.roleCodes || undefined,
    buttonCodeList: resolveSessionButtonCodeList(data.user.username, data.user, data),
    dataScopeType: data.user.dataScopeType || data.dataScopeType || undefined,
    dataScopeDeptIds: data.user.dataScopeDeptIds || data.dataScopeDeptIds || undefined
  });

  const menuTreeRes = await getMenuTreeApi();
  const md5Password = Encrypt(formValue.password);
  tool.data.set(AUTH_STORAGE_KEYS.lockScreenPassword, md5Password);
  menuStore.initializeRoutesWithMenu(filterTreeRecordsByCurrentTenant(menuTreeRes.data, { allowShared: true }));
  await router.push('/');
}

async function handleValidateClick() {
  if (!formRef.value || captchaState.submitting || captchaState.verifying) {
    return;
  }

  try {
    await formRef.value.validate();
  }
  catch {
    return;
  }

  if (!loginCaptchaEnabled) {
    captchaState.submitting = true;

    try {
      await performLogin();
    }
    finally {
      captchaState.submitting = false;
    }

    return;
  }

  if (!captchaState.challenge?.captchaId) {
    message.warning(t('login.messages.captchaNotReady'));
    await refreshCaptcha();
    return;
  }

  captchaState.submitting = true;
  captchaState.verifying = true;

  try {
    const verifyRes = await verifyLoginCaptchaApi({
      captchaId: captchaState.challenge.captchaId,
      answer: formValue.captchaAnswer.trim()
    });

    const captchaToken = verifyRes.data?.captchaToken;
    captchaState.verifying = false;

    if (!captchaToken) {
      message.error(t('login.messages.captchaTokenMissing'));
      await refreshCaptcha();
      return;
    }

    await performLogin(captchaToken);
  }
  catch {
    await refreshCaptcha();
  }
  finally {
    captchaState.verifying = false;
    captchaState.submitting = false;
  }
}

onMounted(() => {
  if (loginCaptchaEnabled) {
    refreshCaptcha();
  }
});
</script>

<template>
  <div class="login-page" :style="loginPageStyle">
    <div class="login-page__backdrop">
      <div class="orb orb--left" />
      <div class="orb orb--right" />
      <div class="grid-mask" />
    </div>

    <div class="theme-switcher">
      <span>{{ t('login.themeLabel') }}</span>
      <n-color-picker v-model:value="accentColor" :show-alpha="false" />
    </div>

    <div class="login-shell">
      <section class="auth-panel">
        <div class="auth-card">
          <div class="auth-card__glow auth-card__glow--top" />
          <div class="auth-card__glow auth-card__glow--bottom" />

          <div class="auth-card__topline">
            <div class="auth-card__eyebrow">{{ t('login.eyebrow') }}</div>
            <div class="auth-card__badges">
              <span v-for="item in authBadges" :key="item" class="auth-card__badge">
                {{ item }}
              </span>
            </div>
          </div>

          <div class="auth-card__hero">
            <img src="/logo-wordmark.svg" alt="LuckyColor Admin" class="brand-wordmark">

            <div class="auth-card__copy">
              <h1>{{ t('login.hero.title') }}</h1>
              <p>{{ t('login.hero.description') }}</p>
            </div>
          </div>

          <div class="demo-credentials">
            <div class="demo-credentials__label">{{ t('login.demo.label') }}</div>
            <div class="demo-credentials__value">
              <strong>{{ defaultUsername }}</strong>
              <span>{{ t('login.demo.defaultPassword', { password: defaultPassword }) }}</span>
            </div>
          </div>

          <section class="form-panel">
            <div class="form-panel__head">
              <div>
                <span>{{ t('login.secureAccess') }}</span>
                <strong>{{ t('login.form.headline') }}</strong>
              </div>

              <button
                v-if="loginCaptchaEnabled"
                type="button"
                class="form-panel__refresh"
                :disabled="captchaState.loading || captchaState.submitting"
                @click="refreshCaptcha(true)"
              >
                {{ t('login.form.refreshCaptcha') }}
              </button>
            </div>

            <n-form ref="formRef" :model="formValue" :rules="rules" class="auth-form">
              <div class="field-label">{{ t('login.form.username') }}</div>
              <n-form-item path="adminName">
                <n-input
                  v-model:value="formValue.adminName"
                  clearable
                  :placeholder="t('login.form.usernamePlaceholder')"
                  @keyup.enter="handleValidateClick"
                >
                  <template #prefix>
                    <Icon icon="solar:user-linear" />
                  </template>
                </n-input>
              </n-form-item>

              <div v-if="loginCaptchaEnabled" class="field-label">{{ t('login.form.captcha') }}</div>
              <n-form-item
                v-if="loginCaptchaEnabled"
                path="captchaAnswer"
                class="auth-form__captcha-item"
              >
                <ArithmeticCaptchaPanel
                  v-model="formValue.captchaAnswer"
                  :challenge="captchaState.challenge"
                  :loading="captchaState.loading"
                  :verifying="captchaState.verifying || captchaState.submitting"
                  @refresh="refreshCaptcha(true)"
                  @submit="handleValidateClick"
                />
              </n-form-item>

              <div class="field-label">{{ t('login.form.password') }}</div>
              <n-form-item path="password">
                <n-input
                  v-model:value="formValue.password"
                  type="password"
                  show-password-on="mousedown"
                  clearable
                  :placeholder="t('login.form.passwordPlaceholder')"
                  @keyup.enter="handleValidateClick"
                >
                  <template #prefix>
                    <Icon icon="solar:lock-password-linear" />
                  </template>
                </n-input>
              </n-form-item>

              <div class="auth-actions">
                <n-button
                  type="primary"
                  attr-type="button"
                  class="login-button"
                  :disabled="!canSubmit"
                  :loading="captchaState.submitting"
                  @click="handleValidateClick"
                >
                  {{ submitButtonText }}
                </n-button>

                <div class="auth-tip">
                  {{ authTipText }}
                </div>
              </div>
            </n-form>
          </section>
        </div>
      </section>

      <aside class="brand-panel">
        <div class="brand-panel__inner">
          <div class="brand-badge" v-once>
            <Icon icon="solar:notes-linear" />
            {{ t('login.brand.badge') }}
          </div>

          <div class="brand-panel__copy">
            <h2>{{ t('login.brand.title') }}</h2>
            <p>{{ t('login.brand.description') }}</p>
          </div>

          <div class="intro-list">
            <article v-for="item in asideNotes" :key="item.title" class="intro-card">
              <strong>{{ item.title }}</strong>
              <p>{{ item.description }}</p>
            </article>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.16), transparent 34%),
    linear-gradient(140deg, #06131d 0%, #0b2230 38%, #103f52 100%);
  font-family: 'Trebuchet MS', 'Avenir Next', 'Microsoft YaHei', sans-serif;
}

.login-page__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(16px);
}

.orb--left {
  width: 460px;
  height: 460px;
  top: -140px;
  left: -120px;
  background: radial-gradient(circle, var(--accent-color-glow) 0%, transparent 70%);
}

.orb--right {
  width: 420px;
  height: 420px;
  right: -160px;
  bottom: -120px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.16) 0%, transparent 72%);
}

.grid-mask {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.86), transparent 88%);
}

.theme-switcher {
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(6, 19, 29, 0.42);
  color: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(14px);
}

.theme-switcher span {
  font-size: 12px;
}

.theme-switcher :deep(.n-color-picker) {
  width: 26px;
  height: 26px;
}

.theme-switcher :deep(.n-color-picker-trigger) {
  border: none !important;
  box-shadow: none !important;
}

.theme-switcher :deep(.n-color-picker-trigger__value) {
  display: none;
}

.login-shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(280px, 340px);
  gap: clamp(18px, 3vw, 32px);
  align-items: center;
  padding: 32px clamp(18px, 4vw, 56px);
}

.auth-panel {
  display: flex;
  justify-content: center;
}

.auth-card {
  position: relative;
  overflow: hidden;
  width: min(100%, 680px);
  padding: 26px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(247, 250, 252, 0.95) 58%, rgba(239, 245, 247, 0.93)),
    linear-gradient(135deg, rgba(255, 255, 255, 0.64), rgba(255, 255, 255, 0));
  border: 1px solid rgba(255, 255, 255, 0.72);
  box-shadow:
    0 30px 78px rgba(2, 12, 27, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.86),
    inset 0 -1px 0 rgba(148, 163, 184, 0.1);
  backdrop-filter: blur(22px);
}

.auth-card > * {
  position: relative;
  z-index: 1;
}

.auth-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.84), rgba(15, 118, 110, 0.18), rgba(249, 115, 22, 0.12));
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.auth-card__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  pointer-events: none;
}

.auth-card__glow--top {
  top: -56px;
  right: 44px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(15, 118, 110, 0.22) 0%, rgba(15, 118, 110, 0.04) 60%, transparent 76%);
}

.auth-card__glow--bottom {
  right: -36px;
  bottom: -70px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.14) 0%, rgba(249, 115, 22, 0.03) 60%, transparent 76%);
}

.auth-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.auth-card__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 13px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.14), rgba(15, 118, 110, 0.06));
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-card__badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.auth-card__badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(15, 118, 110, 0.12);
  color: #0f766e;
  font-size: 11px;
  font-weight: 700;
}

.auth-card__hero {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.brand-wordmark {
  width: min(100%, 248px);
  height: auto;
  display: block;
}

.auth-card__copy h1 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(30px, 4vw, 40px);
  line-height: 1.04;
  letter-spacing: -0.04em;
}

.auth-card__copy p {
  max-width: 520px;
  margin: 10px 0 0;
  color: #526173;
  font-size: 15px;
  line-height: 1.72;
}

.demo-credentials {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.12) 82%),
    rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 10px 24px rgba(15, 23, 42, 0.05);
}

.demo-credentials__label {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.demo-credentials__value {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8px 12px;
}

.demo-credentials__value strong {
  color: #0f172a;
  font-size: 18px;
  line-height: 1.2;
}

.demo-credentials__value span {
  color: #526173;
  font-size: 13px;
}

.form-panel {
  margin-top: 16px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(226, 232, 240, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 14px 28px rgba(15, 23, 42, 0.04);
}

.form-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.form-panel__head span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.form-panel__head strong {
  display: block;
  margin-top: 6px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.form-panel__refresh {
  height: 34px;
  padding: 0 14px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.86);
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.form-panel__refresh:hover:not(:disabled) {
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.form-panel__refresh:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.auth-form {
  margin-top: 16px;
}

.field-label {
  margin-bottom: 6px;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-form :deep(.n-form-item) {
  margin-bottom: 12px;
}

.auth-form :deep(.n-input-wrapper) {
  height: 56px !important;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94)) !important;
  box-shadow:
    inset 0 0 0 1px rgba(148, 163, 184, 0.16),
    0 10px 22px rgba(15, 23, 42, 0.05);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.auth-form :deep(.n-input:hover .n-input-wrapper),
.auth-form :deep(.n-input.n-input--focus .n-input-wrapper) {
  box-shadow:
    inset 0 0 0 1px rgba(15, 118, 110, 0.26),
    0 0 0 4px rgba(15, 118, 110, 0.08),
    0 16px 30px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.auth-form :deep(.n-input__input-el) {
  height: 56px !important;
  font-size: 15px;
}

.auth-form :deep(.n-input__prefix) {
  color: #0f766e;
  font-size: 18px;
}

.auth-form :deep(.n-form-item-feedback-wrapper) {
  min-height: 16px;
}

.auth-form__captcha-item {
  margin-top: 0;
}

.auth-form__captcha-item :deep(.n-form-item-blank) {
  display: block;
}

.auth-actions {
  margin-top: 8px;
}

.login-button {
  width: 100%;
  height: 58px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, var(--accent-color), #0f8f84 52%, #f97316 150%);
  box-shadow:
    0 20px 34px rgba(15, 118, 110, 0.24),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.auth-tip {
  margin-top: 12px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.brand-panel {
  display: flex;
  justify-content: center;
}

.brand-panel__inner {
  width: min(100%, 340px);
  padding: 20px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(14px);
  color: #f8fafc;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.brand-panel__copy {
  margin-top: 18px;
}

.brand-panel__copy h2 {
  margin: 0;
  font-size: 24px;
  line-height: 1.24;
}

.brand-panel__copy p {
  margin: 10px 0 0;
  color: rgba(241, 245, 249, 0.76);
  font-size: 13px;
  line-height: 1.8;
}

.intro-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.intro-card {
  padding: 14px 15px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.intro-card strong {
  display: block;
  font-size: 14px;
}

.intro-card p {
  margin: 6px 0 0;
  color: rgba(241, 245, 249, 0.72);
  font-size: 12px;
  line-height: 1.7;
}

@media (max-width: 1100px) {
  .login-shell {
    grid-template-columns: 1fr;
    padding-top: 82px;
    padding-bottom: 28px;
  }

  .brand-panel {
    order: 2;
  }

  .brand-panel__inner {
    width: 100%;
    max-width: 680px;
  }
}

@media (max-width: 768px) {
  .login-shell {
    gap: 16px;
    padding: 78px 14px 18px;
  }

  .theme-switcher {
    top: 12px;
    right: 12px;
  }

  .auth-card {
    width: 100%;
    padding: 20px 16px;
    border-radius: 24px;
  }

  .auth-card__topline,
  .form-panel__head,
  .demo-credentials {
    flex-direction: column;
    align-items: flex-start;
  }

  .auth-card__badges,
  .demo-credentials__value {
    justify-content: flex-start;
  }

  .form-panel {
    padding: 16px 14px;
    border-radius: 20px;
  }

  .brand-panel__copy h2 {
    font-size: 21px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-form :deep(.n-input-wrapper),
  .login-button,
  .form-panel__refresh {
    transition: none;
  }
}
</style>
