<script lang="ts" setup>
import EditTable from '@/components/EditTable.vue';
import type { RowData, StructureItem } from '@/components/EditTable.vue';

const colList: StructureItem[] = [
  { title: '名称', field: 'name', width: 100, loaderType: 'INPUT_TEXT_TYPE' },
  { title: '年龄', field: 'age', width: 100, loaderType: 'DEFAULT_TYPE' },
  { title: '性别', field: 'sex', width: 100, loaderType: 'SELECT_TYPE', children: [ { value: 1, label: '男' }, { value: 0, label: '女' } ] },
  { title: '籍贯', field: 'address', width: 100, loaderType: 'DEFAULT_TYPE' }
];

const tableData: Ref<RowData[]> = ref([
  { id: 1, name: '张三', age: 18, sex: 1, address: '北京' },
  { id: 2, name: '李四', age: 20, sex: 0, address: '江苏' }
]);

const updateDataArr = (val: RowData[]) => {
  console.log('=>(index.vue:26) val', val);
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
    />
  </div>
</template>
