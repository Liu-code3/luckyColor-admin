<script setup lang="ts">
import { useRoute } from 'vue-router';
import { getCurrentTenantContext, getCurrentUserInfo } from '@/utils/auth';

const props = defineProps<{
  show: boolean;
}>();

const route = useRoute();
const watermarkRenderKey = ref(0);
const currentUserInfo = computed(() => getCurrentUserInfo());
const currentTenant = computed(() => getCurrentTenantContext());

const watermarkContent = computed(() => {
  const displayName = currentUserInfo.value?.displayName || currentUserInfo.value?.username || 'LuckyColor Admin';
  const username = currentUserInfo.value?.username;
  const tenantLabel = currentTenant.value?.tenantName || currentTenant.value?.tenantId;

  return [
    'LuckyColor Admin',
    displayName,
    username ? `账号 ${username}` : null,
    tenantLabel ? `租户 ${tenantLabel}` : null
  ].filter((item): item is string => Boolean(item));
});

watch(() => route.fullPath, async () => {
  if (!props.show) {
    return;
  }

  await nextTick();
  watermarkRenderKey.value += 1;
}, {
  flush: 'post'
});

watch(() => props.show, async (show) => {
  if (!show) {
    return;
  }

  await nextTick();
  watermarkRenderKey.value += 1;
}, {
  flush: 'post'
});
</script>

<template>
  <n-watermark
    v-if="props.show"
    :key="watermarkRenderKey"
    class="app-watermark-layer"
    :content="watermarkContent"
    cross
    fullscreen
    :font-size="14"
    :line-height="14"
    :width="180"
    :height="120"
    :x-offset="12"
    :y-offset="12"
    :rotate="-18"
    :font-color="'rgba(15, 23, 42, 0.12)'"
    :z-index="12"
  />
</template>

<style scoped>
:deep(.app-watermark-layer.n-watermark) {
  background-color: transparent !important;
}
</style>
