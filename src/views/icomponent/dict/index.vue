<script setup lang="ts">
import type { TreeOption } from 'naive-ui';
import type { Ref } from 'vue';

import type { VxeGridProps } from 'vxe-table';
import { VxeGrid } from 'vxe-table';
import { Icon } from '@iconify/vue';
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

// 表格
const searchFormState = reactive({
  searchKey: ''
});

interface RowVO {
  id: number;
  name: string;
  role: string;
  sex: string;
  age: number;
  address: string;
}

const gridOptions = reactive<VxeGridProps<RowVO>>({
  border: true,
  columnConfig: {
    resizable: true
  },
  customConfig: {
    placement: 'top-right'
  },
  toolbarConfig: {
    custom: true,
    slots: {
      buttons: 'toolbar_buttons'
    }
  },
  columns: [
    { field: 'name', title: 'Name' },
    { field: 'sex', title: 'Sex' },
    { field: 'age', title: 'Age' }
  ],
  data: [
    // { id: 10001, name: 'Test1', role: 'Develop', sex: 'Man', age: 28, address: 'test abc' },
    // { id: 10002, name: 'Test2', role: 'Test', sex: 'Women', age: 22, address: 'Guangzhou' },
    // { id: 10003, name: 'Test3', role: 'PM', sex: 'Man', age: 32, address: 'Shanghai' },
    // { id: 10004, name: 'Test4', role: 'Designer', sex: 'Women', age: 24, address: 'Shanghai' }
  ]
});

const onToolbarBtnsClick = () => {};

function apiInit() {
  getData();
}

onMounted(() => {
  apiInit();
});
</script>

<template>
  <div class="p-6">
    <n-grid
      x-gap="12"
      :cols="12"
    >
      <n-gi :span="2">
        <n-tree
          block-line
          selectable
          key-field="id"
          label-field="dictLabel"
          :data="data"
          :node-props="checkCamera"
        />
      </n-gi>
      <n-gi :span="10">
        <n-form
          :model="searchFormState"
          label-placement="left"
          label-width="auto"
          require-mark-placement="right-hanging"
          size="medium"
        >
          <n-grid x-gap="12" :cols="24">
            <n-form-item-gi :span="8" label="字典名称: " path="searchKey">
              <n-input v-model:value="searchFormState.searchKey" placeholder="请输入字典名称" />
            </n-form-item-gi>
            <n-gi :span="4">
              <n-button type="primary">
                <template #icon>
                  <Icon class="h-4 w-4" icon="simple-line-icons:magnifier" />
                </template>
                查询
              </n-button>
              <n-button class="ml-4">
                <template #icon>
                  <Icon class="h-4 w-4" icon="system-uicons:reset-forward" />
                </template>
                重置
              </n-button>
            </n-gi>
          </n-grid>
        </n-form>
        <n-divider style="margin: 12px 0" />
        <div>
          <VxeGrid
            v-bind="gridOptions"
          >
            <template #toolbar_buttons>
              <n-button
                type="primary"
                @click="onToolbarBtnsClick"
              >
                <template #icon>
                  <Icon icon="material-symbols:add" />
                </template>
                新增
              </n-button>
            </template>
            <template #empty>
              <div class="py-20">
                <n-empty description="你什么也找不到" size="huge" />
              </div>
            </template>
          </VxeGrid>
        </div>
      </n-gi>
    </n-grid>
  </div>
</template>
