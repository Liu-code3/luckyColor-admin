<script lang="ts" setup>
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import tool from '@/utils/tool.ts';

const props = defineProps({
  tabsList: {
    type: Array,
    default: () => []
  },
  defaultLabels: {
    type: String,
    default: ''
  }
});
const emits = defineEmits([ 'defaultLabelsFn' ]);
const router = useRouter();
// 标签
const tabsList = ref<LayoutT.TransformedMenuItem[]>([]);

const defaultLabels = ref('');

watch(
  () => props.tabsList,
  (val) => {
    tabsList.value = val as LayoutT.TransformedMenuItem[];
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

// 标签页切换
function tabSwitching(value: any) {
  router.push(value);
  defaultLabels.value = value;
  tool.data.set('LAST_VIEWS_PATH', { key: value });
  emits('defaultLabelsFn', defaultLabels.value);
};

// 关闭标签
function handleClose(name: string | number) {
  tabsList.value = tabsList.value.filter((item) => {
    return item.key !== name;
  });
  defaultLabels.value = tabsList.value[tabsList.value.length - 1].key;
}
</script>

<template>
  <n-tabs
    v-model:value="defaultLabels" default-value="oasis" type="card" closable @update:value="tabSwitching"
    @close="handleClose"
  >
    <template #prefix>
      <Icon class="text-12px" color="#595959" icon="ep:arrow-left" />
    </template>
    <n-tab-pane v-for="item in tabsList" :key="item.key" :name="item.key" :tab="item.label" />
    <template #suffix>
      <Icon class="text-12px" color="#595959" icon="ep:arrow-right" />
    </template>
  </n-tabs>
</template>

<style lang="less" scoped>

</style>
