<script setup lang="ts">
import type { TreeOption } from 'naive-ui';
import type { Ref } from 'vue';
import { getDictTreeApi } from '@/api/dictTree.ts';

const data: Ref<TreeOption[]> = ref([]);

async function getData() {
  const res = await getDictTreeApi();
  data.value = [ ...(res.data) ];
}

const checkCamera = ({ option }: { option: TreeOption }) => {
  return {
    onClick() {
      console.log(option, 'op');
    }
  };
};

function apiInit() {
  getData();
}

onMounted(() => {
  apiInit();
});
</script>

<template>
  <div class="px-4">
    <n-grid
      x-gap="12"
      :cols="12"
    >
      <n-gi :span="4">
        <n-tree
          block-line
          selectable
          key-field="id"
          label-field="dictLabel"
          :data="data"
          :node-props="checkCamera"
        />
      </n-gi>
      <n-gi :span="8">
        <div class="green" />
      </n-gi>
    </n-grid>
  </div>
</template>

<style scoped>
.light-green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.12);
}
.green {
  height: 108px;
  background-color: rgba(0, 128, 0, 0.24);
}
</style>
