<script lang="tsx" setup>
import { NInput, NSelect } from 'naive-ui';
import {FunctionalComponent} from "vue";

const props = defineProps<{
  structure: StructureItem[];
  dataArr: RowData[];
  reveal: boolean;
  checkStrictly: boolean;
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
 * 计算列的跨度
 * 此函数用于计算给定列（作为结构项）在表格或布局中的跨度该函数考虑了列的递归结构，如果列有子列，
 * 它将递归计算所有子列的跨度之和；如果没有子列，则列的跨度为1
 * @param column StructureItem类型的列对象列对象可以包含子列信息
 * @returns 返回计算得到的列跨度，作为数字
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
 * 计算行跨度的函数
 * 根据当前结构项和层级信息，计算在复杂结构的表格中，当前单元格应该跨越的行数
 * @param column StructureItem类型的参数column，表示当前正在处理的结构项
 *               该结构项包含有关表格中单元格的信息，可能包括子项，形成树状结构
 * @param level 数字类型的参数level，表示当前结构项在树状结构中的层级（从0开始）
 * @param maxLevel 数字类型的参数maxLevel，表示树状结构中的最大层级数
 *                 这用于确定表格的深度，以计算行跨度
 * @returns 返回一个数字，表示当前单元格应该跨越的行数
 * 注解：
 * 1. 如果当前结构项包含子项，则其行跨度固定为1，因为子项会单独占据行，不需要合并
 * 2. 如果当前结构项没有子项，则其行跨度为maxLevel - level + 1
 *    这是因为在没有子项的情况下，当前项将与其所有上级层级的项合并，直到最大层级
 *    这种情况下，行跨度等于从当前层级到最大层级的行数
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
 * 递归生成表头行数据
 * 该函数用于根据给定的列配置生成表头的行数据，以支持复杂表头的创建
 * @param {Array} columns 列配置数组，包含表头的列定义和嵌套关系
 * @param {number} level 当前处理的层级，默认为0，即顶级表头
 * @param {Array} rows 表头行数据数组，初始为空数组
 * @param {number} maxLevel 表头结构的最大层级，默认为0，用于计算行跨度
 * @returns {Array} 返回生成的表头行数据数组
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
 * 计算给定结构体中最大的嵌套层级
 * @param columns 结构体数组，每个元素包含基本信息和可能的子结构体
 * @param level 当前处理的层级，初始值为0，表示顶级结构体
 * @returns 返回结构体中的最大嵌套层级
 * @remarks
 * 此函数使用递归和数组的reduce方法来查找最大嵌套层级
 * 对于每个结构体，如果它有子结构体且子结构体非空，则递归计算子结构体的最大嵌套层级
 * 最终返回整个结构体中的最大嵌套层级
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
        <tr v-for="(row, rowIndex) in headerRows" :key="rowIndex" class="luck_tr">
          <th v-if="rowIndex === 0 && checkStrictly" class="luck_th" rowspan="2">
            <n-checkbox v-model:checked="checkAlls" />
          </th>
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
      </thead>
      <tbody class="luck_tbody">
        <tr v-for="(row, index) of matchDataArr" :key="index" class="luck_tr">
          <td class="luck_td leftFixed fixed">
            <n-checkbox v-model:checked="row.show" />
          </td>
          <td
            v-for="item of flatColumns"
            :key="item.field"
            :style="{ width: `${item.width}px`, flex: item.width > 120 ? 'none' : 1 }"
            :class="['luck_td', { q_operate: item.field === 'operation' }]"
          >
            <component :is="getComponent({ col: item, row })" />
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
