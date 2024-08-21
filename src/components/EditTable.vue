<script lang="tsx" setup>
const props = defineProps<{
  structure: StructureItem[];
  dataArr: RowData[];
  reveal: boolean;
}>();

const emits = defineEmits<{
  (e: 'reveal', val: boolean): void;
  (e: 'soloDel', item: RowData): void;
  (e: 'arrDel', items: RowData[]): void;
  (e: 'transformData', data: RowData[]): void;
  (e: 'change', item: RowData): void;
  (e: 'soloAdd', item: RowData): void;
  (e: 'updateDataArr', data: RowData[]): void;
}>();
// 定义接口来约束 props 的类型

const Type = [
  'DEFAULT_TYPE',
  'INPUT_TEXT_TYPE',
  'SELECT_TYPE',
  'TIME_PICKER_TYPE',
  'DATE_PICKER_TYPE',
  'DATE_TIME_PICKER_TYPE',
  'SWITCH_TYPE'
] as const;

type LoaderType = typeof Type[number];

export interface StructureItem {
  title: string;
  field: string;
  loaderType: LoaderType;
  width: number;
  children?: Array<{ value: string | number; label: string }>;
}

export interface RowData {
  [key: string]: any;
  id: number;
  show?: boolean;
  baocun?: string;
}

// const packup = ref<boolean>(true);
// const changedItems = ref<RowData[]>([]);

// 监听 props.dataArr 的变化并更新 dataArr
const matchDataArr = computed({
  get: () => props.dataArr,
  set: (val: RowData[]) => {
    emits('updateDataArr', val);
  }
});

// 根据 loaderType 返回对应的组件类型
// const getComponentType = (loaderType: string) => {
//   const componentsMap: Record<string, any> = {
//     FLOW_INPUT_TYPR: 'input',
//     FLOW_SELECTOR_TYPEDISABLED: 'span',
//     FLOW_SELECTOR_TYPE: 'n-select',
//     FLOW_DISABLES_TYPE: 'span',
//     FLOW_DATE_TYPR: 'n-date-picker',
//     FLOW_TIMEELEMENT_TYPE: 'n-time-picker',
//     FLOW_SWITCH_TYPE: 'n-switch',
//     DISPLAY_DIV: 'div',
//     DISPLAY_SPAN: 'span'
//   };
//
//   return componentsMap[loaderType] || componentsMap.DISPLAY_DIV;
// };

// 处理输入事件
// const handleInput = (event: Event, index: number, field: string) => {
//   const target = event.target as HTMLElement;
//   matchDataArr.value[index][field] = target.textContent;
//   if (!changedItems.value.includes(matchDataArr.value[index])) {
//     changedItems.value.push(matchDataArr.value[index]);
//   }
// };

// 处理组件值变更事件
// const handleChange = (item: RowData) => {
//   emits('change', item);
// };

// 添加新行
// const addfn = (idd: number) => {
//   const newItem: RowData = {
//     id: +new Date(),
//     show: false,
//     baocun: 'baocun'
//   };
//   props.structure.forEach((item) => {
//     newItem[item.field] = '';
//   });
//   matchDataArr.value.push(newItem);
//   emits('soloAdd', newItem);
// };

// const effectRef = ref<any[] | null>(null);
// const selectFn = (e: Event) => {
//   (e.target as HTMLInputElement).classList.add('effect');
//   if (effectRef.value && Array.isArray(effectRef.value) && effectRef.value.length) {
//     effectRef.value.forEach((item, v) => {
//       if (v !== effectRef.value?.indexOf(e.target)) {
//         item.classList.remove('effect');
//       }
//     });
//   }
// };

// 删除行
// const delfn = (item: RowData) => {
//   const index = matchDataArr.value.indexOf(item);
//   if (index > -1) {
//     matchDataArr.value.splice(index, 1);
//     emits('soloDel', item);
//   }
// };

// 计算全选状态
const checkAlls = computed({
  get() {
    return matchDataArr.value.every(item => item.show);
  },
  set(newVal: boolean) {
    matchDataArr.value.forEach(item => (item.show = newVal));
  }
});

function handleInputChange(val: string, field: string, rowData: RowData) {
  matchDataArr.value = matchDataArr.value.map((item) => {
    if (item.id === rowData.id) {
      return {
        ...item,
        [field]: val
      };
    }
    return item;
  });
}
function handleSelectChange(val: string, field: string, rowData: RowData) {
  matchDataArr.value = matchDataArr.value.map((item) => {
    if (item.id === rowData.id) {
      return {
        ...item,
        [field]: val
      };
    }
    return item;
  });
}

function DynamicComponent(props: { rowData: RowData; colData: StructureItem }) {
  const { rowData, colData } = props;
  // const componentsMap: Record<typeof Type[number], string> = {
  //   DEFAULT_TYPE: 'div',
  //   INPUT_TYPE: 'n-input',
  //   SELECT_TYPE: 'n-select',
  //   TIME_PICKER_TYPE: 'n-time-picker',
  //   DATE_PICKER_TYPE: 'n-date-picker',
  //   DATE_TIME_PICKER_TYPE: 'n-date-picker',
  //   SWITCH_TYPE: 'n-switch'
  // };
  const viewMap: Record<LoaderType, Function> = {
    'DEFAULT_TYPE': renderDefault,
    'INPUT_TEXT_TYPE': renderInput,
    'SELECT_TYPE': renderSelect,
    'TIME_PICKER_TYPE': renderDefault,
    'DATE_PICKER_TYPE': renderDefault,
    'DATE_TIME_PICKER_TYPE': renderDefault,
    'SWITCH_TYPE': renderDefault
  };

  function renderDefault() {
    return (
      <div>
        { rowData[colData.field] }
      </div>
    );
  }

  function renderInput(rowData: RowData) {
    return (
      <n-input
        type="text"
        defaultValue={rowData[colData.field]}
        onInput={(val: string) => handleInputChange(val, colData.field, rowData)}
      />
    );
  }

  function renderSelect(rowData: RowData) {
    return (
      <n-select
        options={colData.children}
        defaultValue={rowData[colData.field]}
        onUpdateValue={(val: string) => handleSelectChange(val, colData.field, rowData)}
      />
    );
  }

  return (
    <>
      {
        viewMap[colData.loaderType](rowData)
      }
    </>
  );
}
</script>

<template>
  <div class="tableContainer">
    <table class="table">
      <thead>
        <tr>
          <th class="leftFixed fixed">
            <n-checkbox v-model:checked="checkAlls" />
          </th>
          <th
            v-for="item in structure"
            :key="item.title"
            :style="{ width: `${item.width}px`, flex: item.width > 120 ? 'none' : 1 }"
            class="scrollable"
          >
            {{ item.title }}
          </th>
          <th v-if="reveal" class="rightFixed fixed">
            操作
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) of matchDataArr" :key="index">
          <td class="leftFixed fixed">
            <n-checkbox v-model:checked="row.show" />
          </td>
          <td
            v-for="item of structure"
            :key="item.field"
            :style="{ width: `${item.width}px`, flex: item.width > 120 ? 'none' : 1 }"
            class="scrollable"
          >
            <DynamicComponent :rowData="row" :colData="item" />
          </td>
          <td v-if="reveal" class="rightFixed fixed">
            <!-- <PlusSquareOutlined v-if="!row.baocun" @click="addfn(row.id)" /> -->
            <span v-if="!row.baocun" class="pipeSymbol" />
            <!-- <MinusSquareOutlined v-if="!row.baocun" @click="delfn(row)" /> -->
            <slot name="controls" :content="row" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.tableContainer {
  overflow-x: auto;
  overflow-y: auto;
  width: 100%;
  max-height: 404.4px;
  padding: 1px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  background-color: #e8effa;
  font-weight: 500;
  font-size: 13px;
  color: #161e30;
}

tbody td {
  background-color: #fff;
  font-weight: 400;
  font-size: 13px;
  color: #2e3545;
  padding: 0 8px;
}

.fixed {
  position: sticky;
}

.leftFixed {
  left: 0;
  width: 95px;
  flex: none;
}

.rightFixed {
  right: 0;
  width: 95px;
  flex: none;
}

.pipeSymbol {
  display: inline-block;
  width: 1px;
  height: 23px;
  background-color: #f0f1f4;
  margin: 2px 10px;
}

.scrollable {
  word-wrap: break-word;
  word-break: break-all;
  box-sizing: border-box;
}
</style>
