<script lang="tsx" setup>
import { NCheckbox, NInput, NSelect } from 'naive-ui';

const props = withDefaults(defineProps<{
  structure: StructureItem[];
  dataArr: RowData[];
  type?: PropType;
}>(), {
  type: 'selection'
});

const emits = defineEmits<{
  (e: 'updateDataArr', data: RowData[]): void;
  (e: 'checkedItem', data: RowData): void;
  (e: 'checkedList', data: RowData[]): void;
}>();

// 定义接口来约束 props 的类型
const Type = [
  'DEFAULT_TYPE',
  'INPUT_TEXT_TYPE',
  'SELECT_TYPE',
  'SLOT_TYPE'
] as const;

type LoaderType = typeof Type[number];

interface BaseItem {
  title: string;
  children?: StructureItem[];
}

interface StructureItemWithField extends BaseItem {
  field: string;
  loaderType: LoaderType;
  width: number;
  options?: Array<{ value: string | number; label: string }>;
}

export type StructureItem = StructureItemWithField | BaseItem;

export interface RowData {
  [key: string]: any;
  id: number;
  isCheck?: boolean;
  baocun?: string;
}

const TdType = [ 'selection', 'index' ] as const;
type PropType = typeof TdType[number];
// 监听 props.dataArr 的变化并更新 dataArr
const matchDataArr = computed({
  get: () => props.dataArr,
  set: (val: RowData[]) => {
    emits('updateDataArr', val);
  }
});

// 处理type为‘selection’ 全选状态的部分选中状态
const indeterminate = ref(false);
const handleChecked = () => {
  const len = matchDataArr.value.filter(item => item.isCheck).length;
  const totalLen = matchDataArr.value.length;
  indeterminate.value = len > 0 && len < totalLen;
};
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
const checkAlls = {
  get() {
    return matchDataArr.value.every(item => item.isCheck);
  },
  set(newVal: boolean) {
    matchDataArr.value.forEach(item => item.isCheck = newVal);
    const checkedList = matchDataArr.value.filter(item => item.isCheck);
    emits('checkedList', checkedList);
  }
};

function firstTh(rowIndex: number) {
  if (rowIndex !== 0) return;

  const firstThType = {
    [TdType[0]]: renderCheckbox,
    [TdType[1]]: renderIndex
  };

  function renderCheckbox() {
    return h(
      NCheckbox,
      {
        checked: checkAlls.get(),
        onUpdateChecked: (val: boolean) => checkAlls.set(val),
        indeterminate: indeterminate.value
      }
    );
  }

  function renderIndex() {
    return '序号';
  }

  return h(
    'th',
    {
      class: 'luck_th',
      rowspan: '2'
    },
    firstThType[props.type]()
  );
}

function firstTd(rowData: RowData, rowIndex: number) {
  const firstTdType = {
    [TdType[0]]: renderCheckbox,
    [TdType[1]]: renderIndex
  };

  function renderCheckbox() {
    return h(
      NCheckbox,
      {
        checked: rowData.isCheck,
        onUpdateChecked: (val: boolean) => {
          rowData.isCheck = val;
          handleChecked();
          emits('checkedItem', rowData);
          const checkedList = matchDataArr.value.filter(item => item.isCheck);
          emits('checkedList', checkedList);
        }
      }
    );
  }

  function renderIndex() {
    return (rowIndex + 1);
  }

  return h(
    'td',
    {
      class: 'luck_td leftFixed fixed'
    },
    firstTdType[props.type]()
  );
}

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

function getComponent(props: { col: StructureItemWithField; row: RowData }) {
  const { col, row } = props;
  const viewMap: Record<LoaderType, Function> = {
    'DEFAULT_TYPE': renderDefault,
    'INPUT_TEXT_TYPE': renderInput,
    'SELECT_TYPE': renderSelect,
    'SLOT_TYPE': renderSlot
  };

  function renderDefault(props: { col: StructureItemWithField; row: RowData }) {
    const { col, row } = props;
    return h('div', null, row[col.field]);
  }

  function renderInput(props: { col: StructureItemWithField; row: RowData }) {
    const { col, row } = props;
    return h(
      NInput,
      {
        'type': 'text',
        'value': row[col.field],
        'onUpdate:value': (val: string) => handleInputChange(val, col.field, row)
      }
    );
  }

  function renderSelect(props: { col: StructureItemWithField; row: RowData }) {
    const { col, row } = props;
    return h(
      NSelect,
      {
        'value': row[col.field],
        'onUpdate:value': (val: string) => handleSelectChange(val, col.field, row),
        'options': col.options
      }
    );
  }

  function renderSlot(props: { col: StructureItemWithField; row: RowData }) {
    const { col, row } = props;
    const slotName = col.field;
    const slotObj = useSlots();
    const slotFn = slotObj[slotName];
    return slotFn ? () => slotFn({ rowData: row }) : h('div', null, '已定义插槽未使用'); // 调用插槽函数并传递参数
  }

  return viewMap[col.loaderType]({ col, row });
}

/**
 * @remarks 计算行的rowSpan
 */
function calculateColSpan(column: BaseItem): number {
  // 判断当前列是否包含子列以及子列数组是否为空
  if (Array.isArray(column.children) && column.children.length > 0) {
    // 如果存在子列，则递归调用calculateChildColSpan函数计算每个子列的跨度，并累加得到总跨度
    return column.children.reduce((total: number, child: BaseItem) => total + calculateColSpan(child), 0);
  }
  else {
    // 如果不存在子列，则列的跨度为1
    return 1;
  }
}

/**
 * @remarks 生成表头行的递归函数
 */
function calculateRowSpan(column: BaseItem, level: number, maxLevel: number) {
  if (column.children && column.children.length > 0) {
    return 1;
  }
  else {
    return maxLevel - level + 1;
  }
}

/**
 * @remarks 生成表头行的递归函数
 */
function createHeaderRows(columns: BaseItem[], level = 0, rows: any[] = [], maxLevel = 0) {
  // 如果当前层级的行数据不存在，则初始化为空数组
  if (!rows[level]) {
    rows[level] = [];
  }

  // 遍历每一列，生成表头单元格数据
  columns.forEach((column) => {
    // 计算列跨度
    const colSpan = calculateColSpan(column);
    // 计算行跨度，考虑当前层级和最大层级
    const rowSpan = calculateRowSpan(column, level, maxLevel);

    // 将计算后的列跨度和行跨度添加到表头单元格数据中
    rows[level].push({
      ...column,
      colSpan,
      rowSpan
    });

    // 如果当前列有子列且子列数量大于0，则递归处理子列
    if (column.children && column.children.length > 0) {
      createHeaderRows(column.children, level + 1, rows, maxLevel);
    }
  });

  // 返回生成的表头行数据
  return rows;
}

/**
 * @remarks 计算最大嵌套层级
 */
function getMaxLevel(columns: BaseItem[], level = 0): number {
  return columns.reduce((max: number, column: BaseItem) => {
    // 如果当前结构体有子结构体且子结构体非空，递归计算子结构体的最大嵌套层级
    if (column.children && column.children.length > 0) {
      return Math.max(max, getMaxLevel(column.children, level + 1));
    }
    // 如果当前结构体没有子结构体，返回当前层级
    return max;
  }, level);
}

// 计算表头行
const maxLevel = getMaxLevel(props.structure);
const headerRows = computed(() => createHeaderRows(props.structure, 0, [], maxLevel));

/// 计算属性，用于将嵌套的列结构展平为一维数组
const flatColumns = computed(() => {
  // 初始化一个空数组，用于存储展平后的列结构
  const flat: any[] = [];
  /**
   * 递归函数，用于展平嵌套的列结构
   * @param {Array} columns - 需要展平的列结构数组
   */
  function flatten(columns: BaseItem[]) {
    columns.forEach((column: BaseItem) => {
      // 如果当前列没有子列或子列为空，则将该列添加到展平数组中
      if (!column.children || column.children.length === 0) {
        flat.push(column);
      }
      else {
        // 如果当前列有子列，则递归展平子列
        flatten(column.children);
      }
    });
  }

  // 调用flatten函数，开始展平结构
  flatten(props.structure);
  // 返回展平后的数组
  return flat;
});
</script>

<template>
  <div class="dynamic_tables_box">
    <table class="luck_table">
      <thead class="luck_thead">
        <template v-for="(row, rowIndex) in headerRows" :key="rowIndex">
          <tr class="luck_tr">
            <!--            <th v-if="rowIndex === 0" class="luck_th" rowspan="2"> -->
            <!--              <n-checkbox v-model:checked="checkAlls" :indeterminate="indeterminate" /> -->
            <!--            </th> -->
            <component :is="firstTh(rowIndex)" />
            <template v-for="column in row" :key="column.key">
              <th
                class="luck_th"
                :colspan="column.colSpan"
                :rowspan="column.rowSpan"
                :style="{ width: `${column.width}px` }"
                :class="{ luck_operate: column.field === 'operation' }"
              >
                {{ column.title }}
              </th>
            </template>
          </tr>
        </template>
      </thead>
      <tbody class="luck_tbody">
        <tr v-for="(row, index) of matchDataArr" :key="index" class="luck_tr">
          <component :is="firstTd(row, index)" />
          <td
            v-for="item of flatColumns"
            :key="item.field"
            :style="{ width: `${item.width}px`, flex: item.width > 120 ? 'none' : 1 }"
            :class="['luck_td', { q_operate: item.field === 'operation' }]"
          >
            <component :is="getComponent({ col: item, row })" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.dynamicTables_box {
  overflow: hidden;
  overflow-x: auto;
  width: 100%;
}

.luck_table {
  min-width: 100%;
  border-collapse: collapse;
}

.luck_thead {
  .luck_th {
    height: 40px;
    background-color: #e8effa;
    font-weight: 500;
    font-size: 13px;
    color: #161e30;
  }

  .luck_th {
    width: 30px;
  }
}

.luck_tbody {
  .luck_td {
    background-color: #fff;
    font-weight: 400;
    font-size: 12px;
    color: #2e3545;
    height: 38px;
    text-align: center;

    input {
      width: 100%;
      height: 100%;
      border: none;
      padding: 0 8px;
      text-align: center;
      outline: none !important;
      box-shadow: none;
    }

    select {
      width: 100%;
      height: 100%;
      border: none;
      text-align: center;
    }
  }
}

.luck_th,
.luck_td {
  border: 1px solid #d7d9dc;
}

.luck_operate {
  width: 120px;
  position: sticky;
  right: 0;
  background-color: #fff;
  z-index: 1; /* 确保操作列在其他列之上 */
}

.luck_operate::after {
  position: absolute;
  top: 0;
  bottom: -1px;
  left: 10px;
  width: 10px;
  transform: translateX(-100%);
  box-shadow:
    -2px 0 2px rgba(193, 193, 193, 0.2),
    -4px 0 4px rgba(193, 193, 193, 0.1),
    -6px 0 6px rgba(239, 239, 239, 0.6);
  content: '';
  pointer-events: none;
  box-sizing: border-box;
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

.pipe_symbol {
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
