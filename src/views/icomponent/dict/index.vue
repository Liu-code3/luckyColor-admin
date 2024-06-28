<script setup lang="ts">
import type { TreeOption } from 'naive-ui';
import { dateZhCN, zhCN } from 'naive-ui';
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
  dictLabel: string;
  dictValue: string;
  sortCode: number;
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
    { field: 'dictLabel', title: '字典名称' },
    { field: 'dictValue', title: '字典值' },
    { field: 'sortCode', title: '排序' },
    { field: 'edit', title: '编辑', slots: { default: 'edit' }, width: 200 }
  ],
  data: [
    { id: 10001, dictLabel: '汉族', dictValue: '汉族', sortCode: 10 }
  ]
});

const onToolbarBtnsClick = () => {};

const currentPage = ref(1);
const pageSize = ref(10);

function apiInit() {
  getData();
}

onMounted(() => {
  apiInit();
});
</script>

<template>
  <div class="p-6">
    <n-config-provider
      :locale="zhCN"
      :date-locale="dateZhCN"
    >
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
              <!-- toolbar_buttons 左边按钮自定义插槽, 需要在 -->
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
              <!--  表格数据为空时的插槽 需要在toolbarConfig中配置插槽名 -->
              <template #empty>
                <div class="py-20">
                  <n-empty description="你什么也找不到" size="huge" />
                </div>
              </template>
              <!-- 自定义表格编辑列插槽, 需要在columns字段配置插槽名 -->
              <template #edit>
                <n-button quaternary type="primary" class="p-0">
                  编辑
                </n-button>
              </template>
              <template #pager>
                <n-pagination
                  v-model:page="currentPage"
                  v-model:page-size="pageSize"
                  class="mt-4 justify-end"
                  show-size-picker
                  :item-count="101"
                  :page-sizes="[10, 20, 30, 40]"
                >
                  <template #prefix="{ itemCount, startIndex }">
                    <div class="flex gap-2">
                      <span>{{ startIndex + 1 }} - {{ startIndex + pageSize }}</span>
                      <span>共{{ itemCount }}项</span>
                    </div>
                  </template>
                </n-pagination>
              </template>
            </VxeGrid>
          </div>
        </n-gi>
      </n-grid>
    </n-config-provider>
  </div>
</template>
