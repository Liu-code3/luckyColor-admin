<script setup lang="ts">
import { dateZhCN, zhCN } from 'naive-ui';
import type { Ref } from 'vue';

import type { VxeGridProps } from 'vxe-table';
import { VxeGrid } from 'vxe-table';
import { Icon } from '@iconify/vue';
import { getDictTreeApi, getTableDataApi, getTableDataByIdApi } from '@/api/dictTree.ts';

interface RowVO {
  id: string;
  parentId: string;
  weight: number;
  name: string;
  tenantId: string;
  dictLabel: string;
  dictValue: string;
  category: string;
  sortCode: number;
  deleteFlag: string;
  children?: RowVO[];
}

interface IDto {
  current: number;
  total: number;
  size: number;
  records: RowVO[];
}

// 获取侧边树结构
const TreeData: Ref<RowVO[]> = ref([]);
const getTreeData = async () => {
  const res = await getDictTreeApi();
  TreeData.value = [ ...(res.data) ];
};

const pagerConfig = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

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
  data: []
});

const flag = ref(false);
const onClickNodeProsId = ref('');

/**
 * @description 获取表格数据 - 根据id
 * @param id
 * @param page
 * @param size
 */
const getTableDataById = async (id: string, page = 1, size = 10) => {
  const params = { page, size };
  try {
    const res = await getTableDataByIdApi(id, params);
    const { current, size, total, records } = res.data as IDto;
    pagerConfig.currentPage = current;
    pagerConfig.pageSize = size;
    pagerConfig.total = total;
    gridOptions.data = [ ...records ];
  }
  catch (e) {
    gridOptions.data = [];
  }
};

/**
 * @description 点击树节点
 * @params option
 */
const nodeProps = ({ option }: { option: RowVO }) => {
  return {
    onClick() {
      gridOptions.data = [];
      const Index = gridOptions.columns?.findIndex(item => item.field === 'parentId');
      if (Index === -1) {
        gridOptions.columns?.splice(2, 0, { field: 'parentId', title: '层级', slots: { default: 'parentId_filter' } });
      }

      flag.value = true;
      onClickNodeProsId.value = option.id;
      getTableDataById(option.id, pagerConfig.currentPage, pagerConfig.pageSize);
    }
  };
};

const onToolbarBtnsClick = () => {};

// 表格
const searchFormState = reactive({
  searchKey: ''
});

const onSearchTable = () => {
  const val = searchFormState.searchKey.trim();
  if (!val) return;
};

/**
 * @description 获取表格数据
 * @param page 当前页码
 * @param size 每页条数
 */
const getTableData = async (page = 1, size = 10) => {
  const params = {
    size,
    page
  };

  try {
    const res = await getTableDataApi(params);
    const { current, size, total, records } = res.data as IDto;
    pagerConfig.currentPage = current;
    pagerConfig.pageSize = size;
    pagerConfig.total = total;
    gridOptions.data = [ ...records ];
  }
  catch (e) {
    gridOptions.data = [];
  }
};

const onUpdatePage = (page: number) => {
  pagerConfig.currentPage = page;
  flag.value ? getTableDataById(onClickNodeProsId.value, page, pagerConfig.pageSize) : getTableData(page, pagerConfig.pageSize);
};

const onUpdatePageSize = (pageSize: number) => {
  pagerConfig.pageSize = pageSize;
  flag.value ? getTableDataById(onClickNodeProsId.value, pagerConfig.currentPage, pageSize) : getTableData(pagerConfig.currentPage, pageSize);
};

function apiInit() {
  getTreeData();
  getTableData();
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
            :data="TreeData"
            :node-props="nodeProps"
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
              <n-gi :span="8">
                <n-button
                  type="primary"
                  @click="onSearchTable"
                >
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
              <!-- toolbar_buttons 左边按钮自定义插槽, 需要在toolbarConfig中配置插槽名 -->
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
              <template #parentId_filter="{ row }">
                <template v-if="row.parentId === '0'">
                  <n-button ghost color="#0958d9">
                    上级
                  </n-button>
                </template>
                <template v-else>
                  <n-button ghost color="#389e0d">
                    子级
                  </n-button>
                </template>
              </template>
              <!-- 自定义表格编辑列插槽, 需要在columns字段配置插槽名 -->
              <template #edit>
                <n-button quaternary type="primary" class="p-0">
                  编辑
                </n-button>
              </template>
              <!-- 自定义分页器 -->
              <template #pager>
                <n-pagination
                  v-model:page="pagerConfig.currentPage"
                  v-model:page-size="pagerConfig.pageSize"
                  class="mt-4 justify-end"
                  show-size-picker
                  :item-count="pagerConfig.total"
                  :page-sizes="[10, 20, 30, 50]"
                  :on-update:page="onUpdatePage"
                  :on-update:page-size="onUpdatePageSize"
                >
                  <template #prefix="{ itemCount, startIndex }">
                    <div class="flex gap-2">
                      <span>{{ startIndex + 1 }} - {{ startIndex + pagerConfig.pageSize }}</span>
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
