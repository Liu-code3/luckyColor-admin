<script lang="ts" setup>
import { useRouter } from 'vue-router';
import tool from '@/utils/tool.ts';

const props = defineProps({
  menuOptions: {
    type: Array,
    default: () => []
  },
  tabsList: {
    type: Array,
    default: () => []
  },
  defaultLabels: {
    type: String,
    default: ''
  }
});
const emits = defineEmits([ 'defaultLabelsFn', 'tabsListFn' ]);

const router = useRouter();

// 反转
const inverted = ref(false);

// 菜单
const menuOptions = ref<LayoutT.TransformedMenuItem[]>([]);

const defaultLabels = ref('');

watch(
  () => props.menuOptions,
  (val) => {
    menuOptions.value = val as LayoutT.TransformedMenuItem[];
  },
  {
    immediate: true
  }
);

watch(
  () => props.defaultLabels,
  (val) => {
    defaultLabels.value = val;
  },
  {
    immediate: true
  }
);

const tabsList = ref<LayoutT.TransformedMenuItem[]>([]);
watch(
  () => props.tabsList,
  (val) => {
    tabsList.value = val as LayoutT.TransformedMenuItem[];
  },
  {
    immediate: true
  }
);

// 切换菜单
function handleUpdateValue(key: string, item: any) {
  router.push(key);
  tool.data.set('LAST_VIEWS_PATH', { key });
  defaultLabels.value = key;
  const exists = tabsList.value.some(item => item.key === key);
  if (!exists) {
    tabsList.value.push(item);
    tool.data.set('LAST_MUN', tabsList.value);
  }
  emits('defaultLabelsFn', defaultLabels.value);
  emits('tabsListFn', tabsList.value);
}
</script>

<template>
  <n-menu
    v-model:value="defaultLabels" :inverted="inverted" :collapsed-width="64" :collapsed-icon-size="22"
    :options="menuOptions" class="h-91vh" @update:value="handleUpdateValue"
  />
</template>

<style lang="less" scoped>

</style>
