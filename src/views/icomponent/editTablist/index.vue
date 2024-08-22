<script lang="ts" setup>
import EditTable from '@/components/EditTable.vue';
import type { RowData, StructureItem } from '@/components/EditTable.vue';

const colList: StructureItem[] = [
  { title: '名称', field: 'name', width: 100, loaderType: 'INPUT_TEXT_TYPE' },
  { title: '年龄', field: 'age', width: 100, loaderType: 'DEFAULT_TYPE' },
  { title: '性别', field: 'sex', width: 100, loaderType: 'SELECT_TYPE', children: [ { value: 1, label: '男' }, { value: 0, label: '女' } ] },
  { title: '籍贯', field: 'address', width: 100, loaderType: 'DEFAULT_TYPE' },
  { title: '创建时间', field: 'createTime', width: 100, loaderType: 'SLOT_TYPE' }
];

const tableData: Ref<RowData[]> = ref([
  { id: 1, name: '张三', age: 18, sex: 1, address: '北京', createTime: '2023-02-19' },
  { id: 2, name: '李四', age: 20, sex: 0, address: '江苏', createTime: '2024-08-22' }
]);

const updateDataArr = (val: RowData[]) => {
  tableData.value = [ ...val ];
};
</script>

<template>
  <div>
    <EditTable
      :reveal="false"
      :structure="colList"
      :data-arr="tableData"
      @updateDataArr="updateDataArr"
    >
      <template #createTime="rowData">
        <div>2023-02-19</div>
        <span>{{ rowData }}</span>
      </template>
    </EditTable>
  </div>
</template>
