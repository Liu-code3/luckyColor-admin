<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { FormInst, FormRules } from 'naive-ui';
import { useRouter } from 'vue-router';
import type { LoginCaptchaChallengePayload } from '@/api';
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
import { resolveSessionButtonCodeList } from '@/utils/permission';
import tool from '@/utils/tool';
import ArithmeticCaptchaPanel from './components/ArithmeticCaptchaPanel.vue';

const router = useRouter();
const menuStore = useMenuStore();
const formRef = ref<FormInst | null>(null);

const accentColor = ref('#0F766E');
const loginCaptchaEnabled = sysConfig.LOGIN_CAPTCHA_ENABLED;
const tenantEnabled = sysConfig.TENANT_ENABLED;
const defaultUsername = sysConfig.DEFAULT_LOGIN_USERNAME;
const defaultPassword = sysConfig.DEFAULT_LOGIN_PASSWORD;

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
      message: '请输入登录账号',
      trigger: 'blur'
    },
    password: {
      required: true,
      message: '请输入登录密码',
      trigger: ['input', 'blur']
    }
  };

  if (!loginCaptchaEnabled)
    return baseRules;

  return {
    ...baseRules,
    captchaAnswer: [
      {
        required: true,
        message: '请输入算术验证码结果',
        trigger: ['input', 'blur']
      },
      {
        validator: (_rule, value: string) => /^-?\d+$/.test(String(value ?? '').trim())
          ? true
          : new Error('验证码结果需为数字'),
        trigger: ['input', 'blur']
      }
    ]
  };
});

const capabilityCards = computed(() => {
  if (!loginCaptchaEnabled) {
    return [
      {
        title: '开发登录更轻量',
        description: '当前环境关闭了登录验证码，适合本地联调、联调回归和演示排查。'
      },
      {
        title: '默认账号来自环境变量',
        description: '登录页与租户初始化默认账号密码保持同源，切环境时不需要重复改页面。'
      },
      {
        title: tenantEnabled ? '租户请求头已开启' : '租户请求头已关闭',
        description: tenantEnabled
          ? '前端会按环境变量自动附带租户头，和多租户后端配置保持一致。'
          : '前端不会再附带租户头，适合单租户或本地最简运行场景。'
      }
    ];
  }

  return [
    {
      title: '后端实时出题',
      description: '算式题面由服务端生成并带有效期下发，前端只负责展示与提交答案。'
    },
    {
      title: '先校验后登录',
      description: '验证码校验通过后才会进入账号密码登录链路，减少直接撞库的成功率。'
    },
    {
      title: '一次性放行令牌',
      description: '后端验证成功后签发短时 captchaToken，登录接口继续校验，避免被跳过。'
    }
  ];
});

const authSteps = computed(() => loginCaptchaEnabled
  ? ['账号识别', '算术校验', '令牌登录']
  : ['账号识别', '口令校验', '直接登录']);

const securityPills = computed(() => {
  const pills = [
    tenantEnabled ? '租户请求头开启' : '租户请求头关闭',
    `默认账号 ${defaultUsername}`
  ];

  if (loginCaptchaEnabled)
    pills.unshift('NestJS 后端校验', 'SVG 算术题面');
  else
    pills.unshift('验证码已关闭', '本地联调更顺手');

  return pills;
});

const quickFacts = computed(() => [
  {
    label: '登录模式',
    value: loginCaptchaEnabled ? '口令 + 算术校验' : '账号密码'
  },
  {
    label: loginCaptchaEnabled ? '题面状态' : '验证码状态',
    value: loginCaptchaEnabled
      ? (captchaState.loading ? '加载中' : (captchaState.challenge ? '已就绪' : '待重试'))
      : '已关闭'
  },
  {
    label: '租户模式',
    value: tenantEnabled ? '开启' : '关闭'
  }
]);

const loginPageStyle = computed(() => ({
  '--accent-color': accentColor.value,
  '--accent-color-soft': hexToRgba(accentColor.value, 0.16),
  '--accent-color-strong': hexToRgba(accentColor.value, 0.24),
  '--accent-color-glow': hexToRgba(accentColor.value, 0.42)
}));

const submitButtonText = computed(() => {
  if (captchaState.verifying)
    return '校验中...';

  if (captchaState.submitting)
    return '登录中...';

  return '安全登录';
});

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

  if (!/^[0-9a-fA-F]{6}$/.test(full))
    return `rgba(15, 118, 110, ${alpha})`;

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

  if (captchaState.loading)
    return;

  captchaState.loading = true;
  formValue.captchaAnswer = '';

  try {
    const res = await getLoginCaptchaChallengeApi();
    captchaState.challenge = res.data;

    if (showToast)
      message.success('已刷新验证码题面');
  }
  catch {
    captchaState.challenge = null;
    if (showToast)
      message.error('验证码加载失败，请稍后重试');
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
  if (code !== 200)
    return;

  setAccessToken(data.accessToken);
  setCurrentTenantContext({
    tenantId: data.user.tenantId,
    tenantName: data.user.tenantName ?? null,
    source: 'login'
  });
  setCurrentUserInfo({
    id: data.user.id,
    username: data.user.username,
    tenantId: data.user.tenantId,
    tenantName: data.user.tenantName ?? null,
    displayName: data.user.nickname || data.user.username,
    buttonCodeList: resolveSessionButtonCodeList(data.user.username, data.user, data),
    roleCodes: data.user.roleCodes || undefined,
    dataScopeType: data.user.dataScopeType || data.dataScopeType || undefined,
    dataScopeDeptIds: data.user.dataScopeDeptIds || data.dataScopeDeptIds || undefined
  });

  const menuTreeRes = await getMenuTreeApi();
  const md5Password = Encrypt(formValue.password);
  tool.data.set(AUTH_STORAGE_KEYS.lockScreenPassword, md5Password);
  menuStore.initializeRoutesWithMenu(menuTreeRes.data);
  await router.push('/');
}

async function handleValidateClick() {
  if (!formRef.value || captchaState.submitting || captchaState.verifying)
    return;

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
    message.warning('验证码尚未准备好，请刷新后再试');
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
      message.error('验证码校验未返回放行令牌，请检查后端接口');
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
  if (loginCaptchaEnabled)
    refreshCaptcha();
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
      <span>强调色</span>
      <n-color-picker v-model:value="accentColor" :show-alpha="false" />
    </div>

    <div class="login-shell">
      <section class="brand-panel">
        <div class="brand-panel__inner">
          <div class="brand-badge">
            <Icon icon="solar:shield-keyhole-linear" />
            LuckyColor Admin
          </div>

          <h1>让登录入口更稳，也让环境切换更省心。</h1>
          <p class="brand-copy">
            登录页现在同时支持环境级别的默认账号、验证码开关和租户开关配置。
            需要安全拦截时启用算术验证码，需要快速联调时也能一键切回轻量登录。
          </p>

          <div class="fact-grid">
            <article v-for="fact in quickFacts" :key="fact.label" class="fact-card">
              <span>{{ fact.label }}</span>
              <strong>{{ fact.value }}</strong>
            </article>
          </div>

          <div class="capability-list">
            <article v-for="item in capabilityCards" :key="item.title" class="capability-card">
              <div class="capability-index" />
              <div>
                <strong>{{ item.title }}</strong>
                <p>{{ item.description }}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section class="auth-panel">
        <div class="auth-card">
          <div class="auth-card__topline">
            <div class="auth-card__eyebrow">
              Secure Access
            </div>
            <div class="auth-card__signal">
              <Icon :icon="loginCaptchaEnabled ? 'solar:shield-check-linear' : 'solar:login-3-linear'" />
              {{ loginCaptchaEnabled ? '后端算术验证' : '验证码已关闭' }}
            </div>
          </div>

          <div class="auth-card__header">
            <div>
              <h2>欢迎回来</h2>
              <p>
                {{ loginCaptchaEnabled
                  ? '输入账号密码，并通过一次后端算术校验后进入工作台。'
                  : '当前环境已关闭登录验证码，输入账号密码即可进入工作台。' }}
              </p>
            </div>
            <img src="@/assets/images/luckColor.png" alt="LuckyColor 标志" class="brand-logo">
          </div>

          <div class="auth-steps">
            <div v-for="step in authSteps" :key="step" class="auth-step">
              {{ step }}
            </div>
          </div>

          <div class="security-strip">
            <span v-for="item in securityPills" :key="item" class="security-pill">
              {{ item }}
            </span>
          </div>

          <div class="demo-notice">
            <span>默认账号</span>
            <strong>账号 `{{ defaultUsername }}`，密码 `{{ defaultPassword }}`</strong>
          </div>

          <n-form ref="formRef" :model="formValue" :rules="rules" class="auth-form">
            <div class="field-label">
              登录账号
            </div>
            <n-form-item path="adminName">
              <n-input
                v-model:value="formValue.adminName"
                clearable
                placeholder="请输入登录账号"
                @keyup.enter="handleValidateClick"
              >
                <template #prefix>
                  <Icon icon="solar:user-linear" />
                </template>
              </n-input>
            </n-form-item>

            <div class="field-label">
              登录密码
            </div>
            <n-form-item path="password">
              <n-input
                v-model:value="formValue.password"
                type="password"
                show-password-on="mousedown"
                clearable
                placeholder="请输入登录密码"
                @keyup.enter="handleValidateClick"
              >
                <template #prefix>
                  <Icon icon="solar:lock-password-linear" />
                </template>
              </n-input>
            </n-form-item>

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
                {{ loginCaptchaEnabled
                  ? '验证码通过后会向后端换取一次性 captchaToken，随后再发起登录请求。'
                  : '当前环境已跳过验证码步骤，适合本地开发和联调验证。' }}
              </div>
            </div>
          </n-form>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-page {
  --panel-shadow: 0 34px 80px rgba(15, 23, 42, 0.24);
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.16), transparent 34%),
    linear-gradient(140deg, #06131d 0%, #0b2230 38%, #103f52 100%);
  font-family: "Trebuchet MS", "Avenir Next", "Microsoft YaHei", sans-serif;
}

.login-page__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(14px);
}

.orb--left {
  width: 480px;
  height: 480px;
  left: -120px;
  top: -140px;
  background: radial-gradient(circle, var(--accent-color-glow) 0%, transparent 68%);
}

.orb--right {
  width: 560px;
  height: 560px;
  right: -180px;
  bottom: -180px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%);
}

.grid-mask {
  position: absolute;
  inset: 0;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.86), transparent 88%);
}

.theme-switcher {
  position: fixed;
  top: 22px;
  right: 22px;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(6, 19, 29, 0.44);
  color: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(16px);
}

.theme-switcher span {
  font-size: 13px;
}

.theme-switcher :deep(.n-color-picker) {
  width: 28px;
  height: 28px;
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
  grid-template-columns: minmax(0, 1.06fr) minmax(430px, 520px);
  gap: 34px;
  align-items: center;
  padding: 48px clamp(24px, 5vw, 72px);
}

.brand-panel {
  display: flex;
  justify-content: center;
}

.brand-panel__inner {
  max-width: 680px;
  color: #f8fafc;
}

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  letter-spacing: 0.08em;
  font-size: 12px;
  text-transform: uppercase;
}

.brand-badge svg {
  font-size: 16px;
}

.brand-panel h1 {
  margin: 22px 0 18px;
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.05;
  letter-spacing: 0.02em;
}

.brand-copy {
  max-width: 580px;
  margin: 0;
  color: rgba(241, 245, 249, 0.8);
  font-size: 17px;
  line-height: 1.85;
}

.fact-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 28px;
}

.fact-card {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(14px);
}

.fact-card span {
  display: block;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.72);
}

.fact-card strong {
  display: block;
  margin-top: 10px;
  font-size: 21px;
  line-height: 1.35;
}

.capability-list {
  display: grid;
  gap: 14px;
  margin-top: 24px;
}

.capability-card {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
  padding: 18px 20px;
  border-radius: 20px;
  background: rgba(6, 19, 29, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.capability-index {
  width: 14px;
  height: 14px;
  margin-top: 4px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent-color), #f97316);
  box-shadow: 0 0 18px var(--accent-color-glow);
}

.capability-card strong {
  display: block;
  font-size: 18px;
}

.capability-card p {
  margin: 6px 0 0;
  color: rgba(226, 232, 240, 0.76);
  line-height: 1.7;
}

.auth-panel {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: min(100%, 500px);
  padding: 30px 30px 28px;
  border-radius: 30px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.52);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(20px);
}

.auth-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.auth-card__eyebrow,
.auth-card__signal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.auth-card__eyebrow {
  background: var(--accent-color-soft);
  color: #0f172a;
}

.auth-card__signal {
  color: #0f766e;
  background: rgba(15, 118, 110, 0.08);
}

.auth-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-top: 18px;
}

.auth-card__header h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1.1;
  color: #0f172a;
}

.auth-card__header p {
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.7;
}

.brand-logo {
  width: 58px;
  height: 58px;
  object-fit: contain;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--accent-color-soft), rgba(249, 115, 22, 0.12));
  padding: 10px;
}

.auth-steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 24px;
}

.auth-step {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: #334155;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.security-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.security-pill {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.08);
  color: #0f766e;
  font-size: 12px;
  font-weight: 700;
}

.demo-notice {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
  padding: 16px 18px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.04), var(--accent-color-soft));
  color: #334155;
}

.demo-notice span {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #64748b;
}

.demo-notice strong {
  font-size: 15px;
}

.auth-form {
  margin-top: 22px;
}

.field-label {
  margin-bottom: 8px;
  color: #334155;
  font-size: 13px;
  font-weight: 700;
}

.auth-form :deep(.n-form-item) {
  margin-bottom: 18px;
}

.auth-form :deep(.n-input-wrapper) {
  height: 54px !important;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
}

.auth-form :deep(.n-input__input-el) {
  height: 54px !important;
}

.auth-form :deep(.n-input__prefix) {
  color: #64748b;
  font-size: 18px;
}

.auth-form :deep(.n-form-item-feedback-wrapper) {
  min-height: 18px;
}

.auth-form__captcha-item {
  margin-top: 6px;
}

.auth-actions {
  margin-top: 10px;
}

.login-button {
  width: 100%;
  height: 56px;
  border-radius: 18px;
  border: none;
  background: linear-gradient(135deg, var(--accent-color), #0f8f84 50%, #f97316 145%);
  box-shadow: 0 20px 32px var(--accent-color-soft);
  font-size: 16px;
  font-weight: 700;
}

.auth-tip {
  margin-top: 12px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.75;
}

@media (max-width: 1200px) {
  .login-shell {
    grid-template-columns: 1fr;
    padding-top: 96px;
    padding-bottom: 40px;
  }

  .brand-panel__inner {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .login-shell {
    gap: 18px;
    padding: 92px 16px 24px;
  }

  .auth-card {
    padding: 24px 18px 20px;
    border-radius: 24px;
  }

  .auth-card__topline,
  .auth-card__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .fact-grid,
  .auth-steps {
    grid-template-columns: 1fr;
  }

  .brand-panel h1 {
    font-size: 36px;
  }
}
</style>
