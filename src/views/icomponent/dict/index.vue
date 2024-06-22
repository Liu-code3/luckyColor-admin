<script setup lang="ts">
import type { TreeOption } from 'naive-ui';

const data: TreeOption[] = [
  {
    label: '道生一',
    key: 1,
    children: [
      {
        label: '一生二',
        key: 2,
        children: [
          {
            label: '二生三',
            key: 3
          }
        ]
      }
    ]
  },
  {
    label: '道生一',
    key: 11,
    children: [
      {
        label: '一生二',
        key: 22,
        children: [
          {
            label: '二生三',
            key: 33
          }
        ]
      }
    ]
  }
];

async function getData() {
  const res = await getDictTreeApi();
  data.value = [ ...res];
}

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
          :data="data"
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
