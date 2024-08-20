<script lang="ts" setup>
import EditTable from '@/components/EditTable.vue';

const colList = [
  { title: '名称', field: 'name', width: 100, loaderType: 'FLOW_DISABLES_TYPE' },
  { title: '年龄', field: 'age', width: 100, loaderType: 'FLOW_DISABLES_TYPE' },
  { title: '性别', field: 'sex', width: 100, loaderType: 'FLOW_SELECTOR_TYPE', children: [ { value: '男', label: '1' }, { value: '女', label: '0' } ] },
  { title: '籍贯', field: 'address', width: 100, loaderType: 'FLOW_DISABLES_TYPE' }
];

const tableData = [
  { id: 1, name: '张三', age: 18, sex: '男', address: '北京' },
  { id: 2, name: '李四', age: 20, sex: '女', address: '江苏' }
];
</script>

<template>
  <div>
    <EditTable
      :reveal="false"
      :structure="colList"
      :data-arr="tableData"
    />
  </div>
</template>
