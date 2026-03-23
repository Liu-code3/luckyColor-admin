<script setup lang="ts">
import type { FormInst } from 'naive-ui';
import { useRouter } from 'vue-router';
import { getMenuTreeApi, loginApi } from '@/api';
import { AUTH_STORAGE_KEYS } from '@/constants/auth';
import RotateVerify from '@/components/verify/rotate/index.vue';
import { useMenuStore } from '@/store/modules/menu.ts';
import { setAccessToken, setCurrentUserInfo } from '@/utils/auth';
import { Encrypt } from '@/utils/crypto-md5';
import { message } from '@/utils/message.ts';
import { resolveSessionButtonCodeList } from '@/utils/permission';
import tool from '@/utils/tool';

const router = useRouter();
const menuStore = useMenuStore();
const formRef = ref<FormInst | null>(null);
const rotateVerifyRef = ref<InstanceType<typeof RotateVerify>>();

const accentColor = ref('#1e5eff');

const formValue = reactive({
  adminName: 'admin',
  password: '123456'
});

const rules = {
  adminName: {
    required: true,
    message: '请输入账号',
    trigger: 'blur'
  },
  password: {
    required: true,
    message: '请输入密码',
    trigger: ['input', 'blur']
  }
};

const slideImages = ref([
  'http://codegen.caihongy.cn/20231007/1bd4fe88e21a4641a3208a7d783cbf6d.jpg',
  'http://codegen.caihongy.cn/20231007/605d68174b8a49959b82f364194a9ba0.jpg',
  'http://codegen.caihongy.cn/20231007/6e13a48b74c940118f00f2d28de337c3.jpg'
]);

const capabilityCards = [
  {
    title: '多租户后台',
    description: '菜单、权限、配置、公告与租户中心统一收口。'
  },
  {
    title: '实时联调',
    description: '前后端通过统一接口和租户头协同，缩短排查路径。'
  },
  {
    title: '稳定交付',
    description: '提交规范、菜单同步与冒烟测试一起落地。'
  }
];

const quickFacts = [
  { label: '默认账号', value: 'admin' },
  { label: '验证方式', value: '旋转滑块' },
  { label: '接入模式', value: '动态菜单' }
];

const loginPageStyle = computed(() => ({
  '--accent-color': accentColor.value,
  '--accent-color-soft': hexToRgba(accentColor.value, 0.18),
  '--accent-color-strong': hexToRgba(accentColor.value, 0.32),
  '--accent-color-glow': hexToRgba(accentColor.value, 0.48)
}));

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '').trim();
  const full = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(full))
    return `rgba(30, 94, 255, ${alpha})`;

  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function openVerify() {
  rotateVerifyRef.value?.show();
}

async function handleVerifySuccess(state: boolean) {
  if (!state) {
    message.error('验证失败，请重试');
    return;
  }

  formRef.value?.validate(async (errors) => {
    if (errors)
      return;

    const res = await loginApi({
      username: formValue.adminName,
      password: formValue.password
    });

    const { code, data } = res;
    if (code !== 200)
      return;

    setAccessToken(data.accessToken);
    setCurrentUserInfo({
      username: data.user.username,
      displayName: data.user.nickname || data.user.username,
      buttonCodeList: resolveSessionButtonCodeList(data.user.username, data.user, data)
    });

    const menuTreeRes = await getMenuTreeApi();
    const md5Password = Encrypt(formValue.password);
    tool.data.set(AUTH_STORAGE_KEYS.lockScreenPassword, md5Password);
    menuStore.initializeRoutesWithMenu(menuTreeRes.data);
    await router.push('/');
  });

  setTimeout(() => {
    rotateVerifyRef.value?.hide();
  }, 2500);
}

function handleValidateClick() {
  openVerify();
}
</script>

<template>
  <div class="login-page" :style="loginPageStyle">
    <div class="login-page__backdrop">
      <div class="orb orb--left" />
      <div class="orb orb--right" />
      <div class="grid-mask" />
    </div>

    <div class="theme-switcher">
      <span>主题色</span>
      <n-color-picker v-model:value="accentColor" :show-alpha="false" />
    </div>

    <div class="login-shell">
      <section class="brand-panel">
        <div class="brand-panel__inner">
          <div class="brand-badge">
            LuckyColor Admin
          </div>
          <h1>把管理台做得清晰、稳定、又有一点锋芒。</h1>
          <p class="brand-copy">
            这是一套面向后台业务的多租户管理工作台，围绕权限、系统管理、租户中心和日常配置建立统一入口。
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
          <div class="auth-card__eyebrow">
            后台登录
          </div>
          <div class="auth-card__header">
            <div>
              <h2>欢迎回来</h2>
              <p>输入账号密码后完成旋转验证，即可进入工作台。</p>
            </div>
            <img src="@/assets/images/luckColor.png" alt="LuckyColor 标志" class="brand-logo">
          </div>

          <div class="demo-notice">
            <span>演示环境</span>
            <strong>账号 `admin`，密码 `123456`</strong>
          </div>

          <n-form ref="formRef" :model="formValue" :rules="rules" class="auth-form">
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

            <div class="auth-actions">
              <n-button type="primary" attr-type="button" class="login-button" @click="handleValidateClick">
                登录
              </n-button>
              <div class="auth-tip">
                首次登录后会根据账号权限动态加载菜单，并同步锁屏密码缓存。
              </div>
            </div>
          </n-form>
        </div>
      </section>
    </div>

    <RotateVerify
      ref="rotateVerifyRef"
      :slide-image="slideImages"
      @success="handleVerifySuccess"
    />
  </div>
</template>

<style lang="less" scoped>
.login-page {
  --panel-shadow: 0 32px 80px rgba(15, 23, 42, 0.24);
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.18), transparent 34%),
    linear-gradient(135deg, #07111f 0%, #0f2038 40%, #102d5e 100%);
  font-family: "YouYuan", "Trebuchet MS", "Microsoft YaHei", sans-serif;
}

.login-page__backdrop {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orb {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
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
  background: radial-gradient(circle, rgba(255, 138, 76, 0.24) 0%, transparent 68%);
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
  background: rgba(7, 17, 31, 0.42);
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
  grid-template-columns: minmax(0, 1.1fr) minmax(420px, 520px);
  gap: 28px;
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
  height: 34px;
  padding: 0 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.14);
  letter-spacing: 0.08em;
  font-size: 12px;
  text-transform: uppercase;
}

.brand-panel h1 {
  margin: 22px 0 18px;
  font-size: clamp(40px, 5vw, 64px);
  line-height: 1.05;
  letter-spacing: 0.02em;
}

.brand-copy {
  max-width: 560px;
  margin: 0;
  color: rgba(241, 245, 249, 0.78);
  font-size: 17px;
  line-height: 1.8;
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
  font-size: 22px;
  line-height: 1.2;
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
  background: rgba(7, 17, 31, 0.24);
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
  color: rgba(226, 232, 240, 0.74);
  line-height: 1.7;
}

.auth-panel {
  display: flex;
  justify-content: center;
}

.auth-card {
  width: min(100%, 480px);
  padding: 30px 30px 28px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.46);
  box-shadow: var(--panel-shadow);
  backdrop-filter: blur(20px);
}

.auth-card__eyebrow {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--accent-color-soft);
  color: #1e293b;
  font-size: 12px;
  font-weight: 700;
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
  width: 56px;
  height: 56px;
  object-fit: contain;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--accent-color-soft), rgba(249, 115, 22, 0.12));
  padding: 10px;
}

.demo-notice {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 24px;
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

.auth-actions {
  margin-top: 10px;
}

.login-button {
  width: 100%;
  height: 54px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(135deg, var(--accent-color), #155eef 50%, #f97316 140%);
  box-shadow: 0 20px 30px var(--accent-color-soft);
  font-size: 16px;
  font-weight: 700;
}

.auth-tip {
  margin-top: 12px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
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
    border-radius: 22px;
  }

  .fact-grid {
    grid-template-columns: 1fr;
  }

  .auth-card__header {
    flex-direction: column;
  }

  .brand-panel h1 {
    font-size: 36px;
  }
}
</style>
