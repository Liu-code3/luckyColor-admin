<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getTenantPageApi, type TenantRecord } from '@/api/tenants';
import { useAppFullscreen } from '@/composables/useAppFullscreen';
import sysConfig from '@/config';
import { LayoutMode } from '@/constants/layout';
import { LOCALE_LABEL_KEYS, LOCALE_OPTIONS, type AppLocale } from '@/locales';
import Breadcrumb from './breadcrumb.vue';
import { useGlobalStore } from '@/store/modules/global.ts';
import {
  clearLoginSession,
  getCurrentTenantContext,
  getCurrentUserInfo,
  setCurrentTenantContext
} from '@/utils/auth';
import { isPlatformAdminUser } from '@/utils/permission';
import { useTabStore } from '@/store/modules/tab.ts';
import { useMenuStore } from '@/store/modules/menu.ts';
import SwitchTheme from '@/layouts/components/switchTheme.vue';
import setting from '@/layouts/components/setting.vue';

const props = withDefaults(defineProps<{
  showBreadcrumb?: boolean;
  showCollapse?: boolean;
}>(), {
  showBreadcrumb: true,
  showCollapse: true
});

const router = useRouter();
const message = useMessage();
const { t } = useI18n();
const { isFullscreen, toggle } = useAppFullscreen();
const globalStore = useGlobalStore();
const tabStore = useTabStore();
const menuStore = useMenuStore();
const currentUserInfo = computed(() => getCurrentUserInfo());
const currentTenant = computed(() => getCurrentTenantContext());
const tenantDrawer = ref(false);
const tenantKeyword = ref('');
const tenantLoading = ref(false);
const tenantRecords = ref<TenantRecord[]>([]);
const selectedTenantId = ref<string | null>(null);

const canSwitchTenant = computed(() => {
  const userInfo = currentUserInfo.value;

  if (!sysConfig.TENANT_ENABLED || !userInfo) {
    return false;
  }

  return isPlatformAdminUser(userInfo);
});

const currentTenantLabel = computed(() => {
  if (currentTenant.value?.tenantName) {
    return currentTenant.value.tenantName;
  }

  if (currentTenant.value?.tenantId) {
    return currentTenant.value.tenantId;
  }

  return '未识别租户';
});

const selectedTenantRecord = computed(() => {
  if (!selectedTenantId.value) {
    return null;
  }

  return tenantRecords.value.find(item => item.id === selectedTenantId.value) || null;
});

const canConfirmTenantSwitch = computed(() => {
  const selectedTenant = selectedTenantRecord.value;

  if (!selectedTenant) {
    return false;
  }

  return selectedTenant.status === 'ACTIVE'
    && selectedTenant.id !== currentTenant.value?.tenantId;
});

const filteredTenantRecords = computed(() => {
  const keyword = tenantKeyword.value.trim().toLowerCase();
  const records = tenantRecords.value
    .slice()
    .sort((left, right) => {
      if (left.id === currentTenant.value?.tenantId)
        return -1;

      if (right.id === currentTenant.value?.tenantId)
        return 1;

      if (left.status === 'ACTIVE' && right.status !== 'ACTIVE')
        return -1;

      if (left.status !== 'ACTIVE' && right.status === 'ACTIVE')
        return 1;

      return left.name.localeCompare(right.name, 'zh-CN');
    });

  if (!keyword) {
    return records;
  }

  return records.filter(item =>
    item.name.toLowerCase().includes(keyword)
    || item.code.toLowerCase().includes(keyword)
    || item.id.toLowerCase().includes(keyword)
  );
});

const showMenuToggle = computed(() => {
  if (!props.showCollapse) {
    return false;
  }

  if (globalStore.isMobile) {
    return globalStore.layout === LayoutMode.MODULAR || menuStore.menuOptions.length > 0;
  }

  return menuStore.menuOptions.length > 0;
});

const menuToggleIcon = computed(() => {
  if (globalStore.isMobile) {
    return menuStore.mobileDrawerVisible ? 'mdi:close' : 'mdi:menu';
  }

  return menuStore.collapsed ? 'line-md:menu-fold-right' : 'line-md:menu-fold-left';
});

watch(currentTenant, (tenant) => {
  selectedTenantId.value = tenant?.tenantId ?? null;
}, {
  immediate: true
});

// 锁屏
function JumpLock() {
  globalStore.updateIsLock(true);
}

// 刷新
function refresh() {
  location.reload();
}

function onSelected(key: string | number) {
  if (key === 'tenantSwitch') {
    openTenantDrawer();
    return;
  }

  if (key === 'signOut')
    signOut();
}

const fold_fn = () => {
  menuStore.toggleSidebar();
};

async function handleFullscreenToggle() {
  try {
    await toggle();
  }
  catch {
    message.warning('当前环境暂不支持全屏展示');
  }
}

// 退出登录
function signOut() {
  clearLoginSession();
  menuStore.clearMenuState();
  tabStore.$reset();
  router.push('/login');
  message.success(
    t('layout.userbar.signOutSuccess')
  );
}

function handleLinkClick(link: string) {
  window.open(link, '_blank');
}

function getTenantStatusLabel(status: TenantRecord['status']) {
  if (status === 'ACTIVE')
    return '运行中';

  if (status === 'FROZEN')
    return '已冻结';

  return '已停用';
}

function getTenantStatusType(status: TenantRecord['status']) {
  if (status === 'ACTIVE')
    return 'success';

  if (status === 'FROZEN')
    return 'warning';

  return 'error';
}

async function ensureTenantRecords(force = false) {
  if (!canSwitchTenant.value || tenantLoading.value) {
    return;
  }

  if (!force && tenantRecords.value.length) {
    return;
  }

  tenantLoading.value = true;

  try {
    const { data } = await getTenantPageApi({
      page: 1,
      size: 100
    });
    tenantRecords.value = data.records || [];
  }
  catch {
    message.error('租户列表加载失败，请稍后重试');
  }
  finally {
    tenantLoading.value = false;
  }
}

async function openTenantDrawer() {
  tenantDrawer.value = true;
  await ensureTenantRecords();
}

function selectTenant(record: TenantRecord) {
  selectedTenantId.value = record.id;
}

function resetTenantDrawerState() {
  tenantKeyword.value = '';
  selectedTenantId.value = currentTenant.value?.tenantId ?? null;
}

function closeTenantDrawer() {
  tenantDrawer.value = false;
  resetTenantDrawerState();
}

function buildTenantSwitchMessage(record: TenantRecord) {
  if (record.status !== 'ACTIVE') {
    return '仅支持切换到运行中的租户';
  }

  if (record.id === currentTenant.value?.tenantId) {
    return '当前已经处于该租户上下文';
  }

  return '';
}

function confirmTenantSwitch() {
  const selectedTenant = selectedTenantRecord.value;

  if (!selectedTenant) {
    message.warning('请先选择一个目标租户');
    return;
  }

  const guardMessage = buildTenantSwitchMessage(selectedTenant);
  if (guardMessage) {
    message.warning(guardMessage);
    return;
  }

  setCurrentTenantContext({
    tenantId: selectedTenant.id,
    tenantName: selectedTenant.name,
    tenantCode: selectedTenant.code,
    source: 'switch'
  });
  clearLoginSession();
  globalStore.updateIsLock(false);
  menuStore.clearMenuState();
  tabStore.$reset();
  tenantDrawer.value = false;
  window.location.replace('/login');
}

const settingDrawer = ref(false);
const onUpdateSettingDrawer = (val: boolean) => {
  settingDrawer.value = val;
};

const localeOptions = computed(() => LOCALE_OPTIONS.map(item => ({
  label: t(LOCALE_LABEL_KEYS[item.value]),
  key: item.value
})));

const currentLocaleLabel = computed(() => t(LOCALE_LABEL_KEYS[globalStore.locale]));

function handleLocaleSelect(key: string | number) {
  globalStore.updateLocale(key as AppLocale);
}

const options = computed(() => {
  const baseOptions = [];

  if (canSwitchTenant.value) {
    baseOptions.push({
      label: t('layout.tenant.switchAction'),
      key: 'tenantSwitch'
    });
  }

  baseOptions.push({
    label: t('layout.userbar.signOut'),
    key: 'signOut'
  });

  return baseOptions;
});
</script>

<template>
  <div class="layout-content-luckHeader" border="1px solid light_border dark:dark_border">
    <div class="layout-content-left">
      <slot name="left" />
      <Icon
        v-if="showMenuToggle"
        :icon="menuToggleIcon"
        class="mr-10px h-20px w-20px cursor-pointer"
        @click="fold_fn"
      />
      <Breadcrumb v-if="props.showBreadcrumb" />
    </div>
    <div class="layout-content-right">
      <n-dropdown :options="localeOptions" @select="handleLocaleSelect">
        <button class="locale-entry" type="button">
          <Icon icon="solar:global-linear" />
          <span>{{ currentLocaleLabel }}</span>
        </button>
      </n-dropdown>

      <SwitchTheme />
      <Icon
        class="mx-3 cursor-pointer text-5"
        icon="hugeicons:github"
        @click="handleLinkClick('https://github.com/Liu-code3/luckyColor-admin')"
      />
      <Icon
        v-if="globalStore.showLockEntry"
        class="cursor-pointer text-5"
        icon="tabler:lock-filled"
        @click="JumpLock"
      />
      <Icon
        class="mx-3 cursor-pointer text-5"
        :icon="isFullscreen ? 'fluent:full-screen-minimize-16-regular' : 'fluent:full-screen-maximize-16-regular'"
        @click="handleFullscreenToggle"
      />
      <Icon
        class="cursor-pointer text-5"
        icon="mdi:circular-arrows"
        @click="refresh"
      />

      <button
        v-if="canSwitchTenant"
        class="tenant-entry"
        type="button"
        @click="openTenantDrawer"
      >
        <span class="tenant-entry__icon">
          <Icon icon="solar:buildings-3-linear" />
        </span>
        <span class="tenant-entry__content">
          <span class="tenant-entry__label">当前租户</span>
          <strong>{{ currentTenantLabel }}</strong>
        </span>
      </button>

      <n-dropdown :options="options" @select="onSelected">
        <div class="mx-2.5 flex cursor-pointer items-center">
          <n-avatar round size="medium" :src="currentUserInfo?.avatar || 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'" />
          <div class="ml-1px flex-shrink-0 flex-col items-center">
            <span class="ml-4px text-14px">{{ currentUserInfo?.displayName || t('layout.userbar.userProfile') }}</span>
          </div>
        </div>
      </n-dropdown>

      <Icon
        class="cursor-pointer text-5"
        icon="iwwa:settings"
        @click="onUpdateSettingDrawer(true)"
      />

      <!-- 整体风格设置抽屉 -->
      <setting :setting-drawer="settingDrawer" @updateSettingDrawer="onUpdateSettingDrawer" />

      <n-drawer v-model:show="tenantDrawer" :width="420" placement="right">
        <n-drawer-content title="租户切换" closable>
          <template #header-extra>
            <n-button quaternary size="small" :loading="tenantLoading" @click="ensureTenantRecords(true)">
              刷新列表
            </n-button>
          </template>

          <div class="tenant-switcher">
            <div class="tenant-switcher__hero">
              <span>Tenant Context</span>
              <strong>{{ currentTenantLabel }}</strong>
              <p>切换租户后会清空当前登录态并返回登录页，使用目标租户上下文重新进入系统。</p>
            </div>

            <n-input
              v-model:value="tenantKeyword"
              clearable
              placeholder="搜索租户名称、编码或 ID"
            >
              <template #prefix>
                <Icon icon="solar:magnifer-linear" />
              </template>
            </n-input>

            <div v-if="tenantLoading" class="tenant-switcher__loading">
              <n-spin size="small" />
              <span>租户列表加载中...</span>
            </div>

            <div v-else-if="filteredTenantRecords.length" class="tenant-switcher__list">
              <button
                v-for="item in filteredTenantRecords"
                :key="item.id"
                type="button"
                class="tenant-card"
                :class="{
                  'tenant-card--active': item.id === currentTenant?.tenantId,
                  'tenant-card--selected': item.id === selectedTenantId
                }"
                @click="selectTenant(item)"
              >
                <div class="tenant-card__head">
                  <div>
                    <strong>{{ item.name }}</strong>
                    <p>{{ item.code }}</p>
                  </div>
                  <n-tag size="small" round :type="getTenantStatusType(item.status)">
                    {{ getTenantStatusLabel(item.status) }}
                  </n-tag>
                </div>

                <div class="tenant-card__meta">
                  <span>{{ item.id }}</span>
                  <span v-if="item.expiresAt">到期 {{ item.expiresAt }}</span>
                </div>
              </button>
            </div>

            <n-empty v-else description="暂无可切换租户" />
          </div>

          <template #footer>
            <div class="tenant-switcher__footer">
              <div class="tenant-switcher__summary">
                <span>目标租户</span>
                <strong>{{ selectedTenantRecord?.name || currentTenantLabel }}</strong>
                <p v-if="selectedTenantRecord">
                  {{ selectedTenantRecord.code }} · {{ buildTenantSwitchMessage(selectedTenantRecord) || '切换后将返回登录页重新认证' }}
                </p>
              </div>

              <div class="tenant-switcher__actions">
                <n-button @click="closeTenantDrawer">
                  取消
                </n-button>
                <n-button type="primary" :disabled="!canConfirmTenantSwitch" @click="confirmTenantSwitch">
                  切换并重新登录
                </n-button>
              </div>
            </div>
          </template>
        </n-drawer-content>
      </n-drawer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout-content-luckHeader {
  padding: 0 18px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 10px 10px 0;
  border-radius: 22px;
  border: 1px solid var(--lc-border);
  background: var(--lc-surface-strong);
  box-shadow: var(--lc-shadow-md);
  backdrop-filter: var(--lc-backdrop);

  .n-button__border {
    border: none;
  }
}

.layout-content-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.layout-content-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: none;
}

.locale-entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.locale-entry:hover {
  border-color: rgba(15, 118, 110, 0.24);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.tenant-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 0 14px 0 10px;
  border: 1px solid rgba(15, 118, 110, 0.14);
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 253, 250, 0.92));
  color: #0f172a;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 12px 24px rgba(15, 23, 42, 0.08);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.tenant-entry:hover {
  border-color: rgba(15, 118, 110, 0.32);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 16px 28px rgba(15, 23, 42, 0.12);
  transform: translateY(-1px);
}

.tenant-entry__icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.16), rgba(15, 118, 110, 0.08));
  color: #0f766e;
  font-size: 16px;
}

.tenant-entry__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.tenant-entry__label {
  color: #64748b;
  font-size: 11px;
  line-height: 1.1;
}

.tenant-entry__content strong {
  max-width: 132px;
  overflow: hidden;
  color: #0f172a;
  font-size: 13px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tenant-switcher {
  display: grid;
  gap: 16px;
}

.tenant-switcher__hero {
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(15, 118, 110, 0.12), rgba(249, 115, 22, 0.1));
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.tenant-switcher__hero span {
  color: #64748b;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tenant-switcher__hero strong {
  display: block;
  margin-top: 10px;
  color: #0f172a;
  font-size: 24px;
  line-height: 1.2;
}

.tenant-switcher__hero p {
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.7;
}

.tenant-switcher__loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(248, 250, 252, 0.92);
  color: #64748b;
}

.tenant-switcher__list {
  display: grid;
  gap: 12px;
}

.tenant-switcher__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tenant-switcher__summary {
  min-width: 0;
}

.tenant-switcher__summary span {
  color: #64748b;
  font-size: 12px;
}

.tenant-switcher__summary strong {
  display: block;
  margin-top: 6px;
  color: #0f172a;
  font-size: 15px;
  line-height: 1.4;
}

.tenant-switcher__summary p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.tenant-switcher__actions {
  display: flex;
  gap: 10px;
}

.tenant-card {
  display: grid;
  gap: 12px;
  width: 100%;
  padding: 16px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94));
  text-align: left;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.94),
    0 12px 24px rgba(15, 23, 42, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.tenant-card:hover {
  border-color: rgba(15, 118, 110, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.96),
    0 16px 28px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.tenant-card--selected {
  border-color: rgba(15, 118, 110, 0.34);
  box-shadow:
    inset 0 0 0 1px rgba(15, 118, 110, 0.12),
    0 18px 32px rgba(15, 118, 110, 0.12);
}

.tenant-card--active {
  background: linear-gradient(180deg, rgba(240, 253, 250, 0.98), rgba(248, 250, 252, 0.96));
}

.tenant-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.tenant-card__head strong {
  color: #0f172a;
  font-size: 15px;
  line-height: 1.4;
}

.tenant-card__head p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 12px;
}

.tenant-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: #475569;
  font-size: 12px;
}

.layout-content-right :deep(.n-avatar) {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
}

.layout-content-right :deep(.n-dropdown-trigger) {
  border-radius: 999px;
}

@media (max-width: 768px) {
  .layout-content-luckHeader {
    margin: 8px 8px 0;
    padding: 0 14px;
  }

  .tenant-entry {
    display: none;
  }

  .tenant-switcher__footer {
    flex-direction: column;
    align-items: stretch;
  }

  .tenant-switcher__actions {
    width: 100%;
  }

  .tenant-switcher__actions :deep(.n-button) {
    flex: 1;
  }
}
</style>
