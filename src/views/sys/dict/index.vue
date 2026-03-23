<script setup lang="ts">
import type { FormInst, FormRules, TreeOption } from 'naive-ui'
import { Icon } from '@iconify/vue'
import {
  createDictApi,
  deleteDictApi,
  getDictDetailApi,
  updateDictApi
} from '@/api'
import { getDictTreeApi, getTableDataApi } from '@/api/dictTree.ts'
import { confirmAction } from '@/utils/confirm'
import { message, notification } from '@/utils/message.ts'

interface DictRow {
  id: string
  parentId: string
  weight: number
  name: string
  tenantId: string
  dictLabel: string
  dictValue: string
  category: string
  sortCode: number
  deleteFlag: string
  children?: DictRow[]
}

interface DictPageResult {
  current: number
  total: number
  size: number
  records: DictRow[]
}

interface DictFormState {
  parentId: string
  name: string
  dictLabel: string
  dictValue: string
  category: string
  sortCode: number | null
  weight: number | null
}

interface ImportDictRow {
  lineNo: number
  parentId: string
  name: string
  dictLabel: string
  dictValue: string
  category: string
  sortCode: number
  weight: number
}

const treeLoading = ref(false)
const tableLoading = ref(false)
const submitting = ref(false)
const importing = ref(false)
const treeData = ref<DictRow[]>([])
const tableData = ref<DictRow[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedNodeId = ref('')
const selectedRowIds = ref<string[]>([])
const showDrawer = ref(false)
const showPreviewModal = ref(false)
const showImportModal = ref(false)
const isEditMode = ref(false)
const editingDictId = ref('')
const previewDict = ref<DictRow | null>(null)
const importRows = ref<ImportDictRow[]>([])
const dictFormRef = ref<FormInst | null>(null)
const importInputRef = ref<HTMLInputElement | null>(null)
const searchForm = reactive({
  keyword: '',
  treeKeyword: ''
})
const dictForm = reactive<DictFormState>({
  parentId: '0',
  name: '',
  dictLabel: '',
  dictValue: '',
  category: 'BIZ',
  sortCode: 10,
  weight: 10
})

const dictFormRules: FormRules = {
  parentId: [
    {
      required: true,
      message: '请选择上级字典',
      trigger: [ 'change', 'blur' ]
    }
  ],
  name: [
    {
      required: true,
      message: '请输入内部名称',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 50,
      message: '内部名称不能超过 50 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  dictLabel: [
    {
      required: true,
      message: '请输入字典名称',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 50,
      message: '字典名称不能超过 50 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  dictValue: [
    {
      required: true,
      message: '请输入字典值',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 100 && !/\s/.test(value.trim()),
      message: '字典值不能包含空格，且长度不能超过 100 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  category: [
    {
      required: true,
      message: '请输入分类编码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 30,
      message: '分类编码不能超过 30 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  sortCode: [
    {
      required: true,
      type: 'number',
      message: '请输入排序值',
      trigger: [ 'change', 'blur' ]
    }
  ],
  weight: [
    {
      required: true,
      type: 'number',
      message: '请输入权重值',
      trigger: [ 'change', 'blur' ]
    }
  ]
}

const selectedTreeKeys = computed(() => selectedNodeId.value ? [ selectedNodeId.value ] : [])
const flatTreeData = computed(() => flattenTree(treeData.value))
const selectedNode = computed(() => flatTreeData.value.find(item => item.id === selectedNodeId.value) || null)
const filteredTreeData = computed(() => filterTree(treeData.value, searchForm.treeKeyword.trim()))
const parentOptions = computed<TreeOption[]>(() => [
  {
    key: '0',
    label: '顶级字典'
  },
  ...treeData.value.map(toTreeOption)
])
const categoryOptions = computed(() => {
  const preset = [ 'BIZ', 'FRM', 'SYS' ]
  const dynamic = Array.from(new Set(flatTreeData.value.map(item => item.category).filter(Boolean)))
  return Array.from(new Set([ ...preset, ...dynamic ])).map(item => ({
    label: item,
    value: item
  }))
})
const allRowsSelected = computed(() => !!tableData.value.length && tableData.value.every(row => selectedRowIds.value.includes(row.id)))
const partiallySelected = computed(() => selectedRowIds.value.length > 0 && !allRowsSelected.value)
const summaryCards = computed(() => [
  {
    title: '字典分类',
    value: treeData.value.length,
    helper: '系统级主分类数量',
    icon: 'solar:widget-5-bold-duotone'
  },
  {
    title: '字典节点',
    value: flatTreeData.value.length,
    helper: '包含分类与字典项',
    icon: 'solar:tree-bold-duotone'
  },
  {
    title: '当前筛选',
    value: selectedNode.value?.dictLabel || '全部',
    helper: selectedNode.value ? `当前查看 ${selectedNode.value.dictValue}` : '未限定字典分类',
    icon: 'solar:tuning-square-bold-duotone'
  },
  {
    title: '检索结果',
    value: total.value,
    helper: `第 ${page.value} 页 / 每页 ${pageSize.value} 条`,
    icon: 'solar:document-text-bold-duotone'
  },
  {
    title: '已选记录',
    value: selectedRowIds.value.length,
    helper: selectedRowIds.value.length ? '可执行批量删除' : '当前未选择任何记录',
    icon: 'solar:checklist-minimalistic-bold-duotone'
  }
])

function flattenTree(nodes: DictRow[]) {
  return nodes.flatMap(node => [ node, ...flattenTree(node.children || []) ])
}

function filterTree(nodes: DictRow[], keyword: string): DictRow[] {
  if (!keyword)
    return nodes

  return nodes.reduce<DictRow[]>((result, node) => {
    const sourceChildren = node.children || []
    const matched = node.dictLabel.includes(keyword) || node.dictValue.includes(keyword)
    const children = matched ? sourceChildren : filterTree(sourceChildren, keyword)

    if (matched || children.length) {
      result.push({
        ...node,
        children
      })
    }

    return result
  }, [])
}

function toTreeOption(item: DictRow): TreeOption {
  return {
    key: item.id,
    label: `${item.dictLabel} (${item.dictValue})`,
    children: item.children?.map(toTreeOption)
  }
}

function buildQueryParams(currentPage = page.value): IDict.ITbParams {
  const params: IDict.ITbParams = {
    page: currentPage,
    size: pageSize.value
  }

  const keyword = searchForm.keyword.trim()
  if (keyword)
    params.searchKey = keyword

  if (selectedNodeId.value)
    params.id = selectedNodeId.value

  return params
}

function getSiblingValues(parentId: string) {
  if (parentId === '0')
    return treeData.value

  const parent = flatTreeData.value.find(item => item.id === parentId)
  return parent?.children || []
}

function getNextNumericValue(parentId: string, field: 'sortCode' | 'weight') {
  const values = getSiblingValues(parentId)
    .map(item => Number(item[field]) || 0)

  return (values.length ? Math.max(...values) : 0) + 10
}

function resetDictForm() {
  editingDictId.value = ''
  dictForm.parentId = '0'
  dictForm.name = ''
  dictForm.dictLabel = ''
  dictForm.dictValue = ''
  dictForm.category = 'BIZ'
  dictForm.sortCode = 10
  dictForm.weight = 10
}

function clearSelectedRows() {
  selectedRowIds.value = []
}

function escapeCsvCell(value: string | number) {
  const text = String(value ?? '')
  if (text.includes('"') || text.includes(',') || text.includes('\n'))
    return `"${text.replace(/"/g, '""')}"`
  return text
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([ content ], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function exportCurrentResults() {
  if (!tableData.value.length) {
    message.error('当前没有可导出的字典记录')
    return
  }

  const header = [ 'parentId', 'name', 'dictLabel', 'dictValue', 'category', 'sortCode', 'weight' ]
  const rows = tableData.value.map(item => [
    item.parentId || '0',
    item.name || '',
    item.dictLabel,
    item.dictValue,
    item.category || '',
    item.sortCode,
    item.weight
  ])
  const csv = [ header, ...rows ]
    .map(row => row.map(cell => escapeCsvCell(cell)).join(','))
    .join('\n')

  downloadTextFile(`dict-export-page-${page.value}.csv`, `\uFEFF${csv}`)
}

function downloadImportTemplate() {
  const header = [ 'parentId', 'name', 'dictLabel', 'dictValue', 'category', 'sortCode', 'weight' ]
  const example = [ '0', '示例字典', '示例字典', 'DEMO_DICT', 'BIZ', '10', '10' ]
  const child = [ 'DEMO_PARENT_ID', '示例子项', '启用', 'ENABLE', 'BIZ', '20', '20' ]
  const csv = [ header, example, child ]
    .map(row => row.map(cell => escapeCsvCell(cell)).join(','))
    .join('\n')

  downloadTextFile('dict-import-template.csv', `\uFEFF${csv}`)
}

function openImportFilePicker() {
  importInputRef.value?.click()
}

function splitCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      }
      else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells.map(cell => cell.trim())
}

function parseImportRows(content: string) {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').trim()
  if (!normalized)
    return []

  const lines = normalized.split('\n').filter(Boolean)
  if (lines.length <= 1)
    return []

  const header = splitCsvLine(lines[0])
  const expected = [ 'parentId', 'name', 'dictLabel', 'dictValue', 'category', 'sortCode', 'weight' ]
  const headerValid = expected.every((key, index) => header[index] === key)
  if (!headerValid)
    throw new Error('CSV 表头不正确，请先下载模板后填写')

  return lines.slice(1).map((line, index) => {
    const [ parentId, name, dictLabel, dictValue, category, sortCode, weight ] = splitCsvLine(line)
    return {
      lineNo: index + 2,
      parentId: parentId || '0',
      name: name || '',
      dictLabel: dictLabel || '',
      dictValue: dictValue || '',
      category: category || 'BIZ',
      sortCode: Number(sortCode || 0),
      weight: Number(weight || 0)
    }
  }).filter(row => row.name || row.dictLabel || row.dictValue)
}

function validateImportRows(rows: ImportDictRow[]) {
  const invalid = rows.find(row => {
    return !row.name.trim()
      || !row.dictLabel.trim()
      || !row.dictValue.trim()
      || !row.category.trim()
      || Number.isNaN(row.sortCode)
      || Number.isNaN(row.weight)
  })

  if (invalid)
    throw new Error(`第 ${invalid.lineNo} 行存在空字段或数值格式错误`)
}

async function handleImportFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''

  if (!file)
    return

  try {
    const content = await file.text()
    const rows = parseImportRows(content)
    if (!rows.length) {
      message.error('导入文件中没有可用的字典记录')
      return
    }

    validateImportRows(rows)
    importRows.value = rows
    showImportModal.value = true
  }
  catch (error) {
    message.error(error instanceof Error ? error.message : '导入文件解析失败')
  }
}

function syncSelectedNode() {
  if (!selectedNodeId.value)
    return

  const exists = flattenTree(treeData.value).some(item => item.id === selectedNodeId.value)
  if (!exists)
    selectedNodeId.value = ''
}

async function fetchTreeData() {
  treeLoading.value = true
  try {
    const res = await getDictTreeApi()
    treeData.value = [ ...res.data ]
    syncSelectedNode()
  }
  catch {
    treeData.value = []
    notification.error({
      title: '字典树加载失败',
      description: '请稍后重试或检查字典接口状态',
      duration: 3
    })
  }
  finally {
    treeLoading.value = false
  }
}

async function fetchTableData(currentPage = page.value) {
  tableLoading.value = true
  try {
    const res = await getTableDataApi(buildQueryParams(currentPage))
    const { current, size, total: nextTotal, records } = res.data as DictPageResult
    page.value = current
    pageSize.value = size
    total.value = nextTotal
    tableData.value = [ ...records ]
    selectedRowIds.value = selectedRowIds.value.filter(id => records.some(row => row.id === id))
  }
  catch {
    tableData.value = []
    total.value = 0
    clearSelectedRows()
    notification.error({
      title: '字典数据加载失败',
      description: '请稍后重试或检查字典接口状态',
      duration: 3
    })
  }
  finally {
    tableLoading.value = false
  }
}

async function reloadDictionaryData(currentPage = page.value) {
  await fetchTreeData()
  await fetchTableData(currentPage)
}

function handleSearch() {
  page.value = 1
  fetchTableData(1)
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.treeKeyword = ''
  selectedNodeId.value = ''
  clearSelectedRows()
  page.value = 1
  fetchTableData(1)
}

function handleRefresh() {
  reloadDictionaryData(page.value)
}

function handleSelectNode(node: DictRow) {
  selectedNodeId.value = node.id
  page.value = 1
  fetchTableData(1)
}

function clearSelectedNode() {
  selectedNodeId.value = ''
  page.value = 1
  fetchTableData(1)
}

function toggleRowSelection(id: string, checked: boolean) {
  if (checked) {
    if (!selectedRowIds.value.includes(id))
      selectedRowIds.value = [ ...selectedRowIds.value, id ]
    return
  }

  selectedRowIds.value = selectedRowIds.value.filter(item => item !== id)
}

function toggleSelectAll(checked: boolean) {
  selectedRowIds.value = checked ? tableData.value.map(row => row.id) : []
}

function handlePageChange(currentPage: number) {
  page.value = currentPage
  fetchTableData(currentPage)
}

function handlePageSizeChange(size: number) {
  pageSize.value = size
  page.value = 1
  fetchTableData(1)
}

function nodeProps({ option }: { option: DictRow }) {
  return {
    onClick() {
      handleSelectNode(option)
    }
  }
}

function getLevelLabel(row: DictRow) {
  return row.parentId === '0' ? '一级字典' : '字典项'
}

function getLevelType(row: DictRow) {
  return row.parentId === '0' ? 'info' : 'success'
}

function getCategoryLabel(row: DictRow) {
  return row.category || row.name || '--'
}

function openPreviewModal(row: DictRow) {
  previewDict.value = row
  showPreviewModal.value = true
}

function closePreviewModal() {
  showPreviewModal.value = false
  previewDict.value = null
}

function closeImportModal() {
  showImportModal.value = false
  importRows.value = []
}

function handleEditPreview() {
  if (!previewDict.value)
    return

  const current = previewDict.value
  closePreviewModal()
  openEditDrawer(current)
}

function openCreateDrawer() {
  isEditMode.value = false
  resetDictForm()
  showDrawer.value = true
}

function openCreateChildDrawer(parent?: DictRow | null) {
  const targetParent = parent || selectedNode.value
  if (!targetParent) {
    message.error('请先选择一个父级字典')
    return
  }

  isEditMode.value = false
  resetDictForm()
  dictForm.parentId = targetParent.id
  dictForm.category = targetParent.category || 'BIZ'
  dictForm.sortCode = getNextNumericValue(targetParent.id, 'sortCode')
  dictForm.weight = getNextNumericValue(targetParent.id, 'weight')
  showDrawer.value = true
}

async function openEditDrawer(row: DictRow) {
  isEditMode.value = true
  resetDictForm()
  editingDictId.value = row.id
  showDrawer.value = true

  const { data } = await getDictDetailApi(row.id)
  dictForm.parentId = data.parentId || '0'
  dictForm.name = data.name || ''
  dictForm.dictLabel = data.dictLabel || ''
  dictForm.dictValue = data.dictValue || ''
  dictForm.category = data.category || 'BIZ'
  dictForm.sortCode = data.sortCode ?? 10
  dictForm.weight = data.weight ?? 10
}

function closeDrawer() {
  showDrawer.value = false
  resetDictForm()
  dictFormRef.value?.restoreValidation()
}

async function submitDictForm() {
  await dictFormRef.value?.validate()

  if (isEditMode.value && dictForm.parentId === editingDictId.value) {
    message.error('不能将当前字典设置为自己的上级')
    return
  }

  const payload = {
    parentId: dictForm.parentId || '0',
    name: dictForm.name.trim(),
    dictLabel: dictForm.dictLabel.trim(),
    dictValue: dictForm.dictValue.trim(),
    category: dictForm.category.trim(),
    sortCode: Number(dictForm.sortCode ?? 0),
    weight: Number(dictForm.weight ?? 0),
    deleteFlag: 'NOT_DELETE'
  }

  submitting.value = true
  try {
    if (isEditMode.value) {
      await updateDictApi(editingDictId.value, payload)
      message.success('字典更新成功')
    }
    else {
      await createDictApi(payload)
      if (payload.parentId === '0')
        selectedNodeId.value = ''
      else
        selectedNodeId.value = payload.parentId
      message.success('字典创建成功')
    }

    closeDrawer()
    const nextPage = isEditMode.value ? page.value : 1
    page.value = nextPage
    await reloadDictionaryData(nextPage)
  }
  finally {
    submitting.value = false
  }
}

async function handleDeleteDict(row: DictRow) {
  const confirmed = await confirmAction({
    title: '删除字典',
    content: row.parentId === '0'
      ? `确认删除一级字典“${row.dictLabel}”吗？删除后可能影响其下字典项。`
      : `确认删除字典项“${row.dictLabel}”吗？`
  })

  if (!confirmed)
    return

  await deleteDictApi(row.id)
  message.success('字典删除成功')

  if (selectedNodeId.value === row.id)
    selectedNodeId.value = ''

  const nextPage = tableData.value.length === 1 && page.value > 1 ? page.value - 1 : page.value
  page.value = nextPage
  await reloadDictionaryData(nextPage)
}

async function handleBatchDelete() {
  if (!selectedRowIds.value.length) {
    message.error('请先勾选需要删除的字典记录')
    return
  }

  const confirmed = await confirmAction({
    title: '批量删除字典',
    content: `确认删除当前选中的 ${selectedRowIds.value.length} 条字典记录吗？`
  })

  if (!confirmed)
    return

  const deleteCount = selectedRowIds.value.length
  await Promise.all(selectedRowIds.value.map(id => deleteDictApi(id)))
  message.success(`已删除 ${deleteCount} 条字典记录`)
  clearSelectedRows()
  const nextPage = tableData.value.length === deleteCount && page.value > 1 ? page.value - 1 : page.value
  page.value = nextPage
  await reloadDictionaryData(nextPage)
}

async function submitImportRows() {
  if (!importRows.value.length) {
    message.error('当前没有可导入的数据')
    return
  }

  importing.value = true
  try {
    for (const row of importRows.value) {
      await createDictApi({
        parentId: row.parentId || '0',
        name: row.name.trim(),
        dictLabel: row.dictLabel.trim(),
        dictValue: row.dictValue.trim(),
        category: row.category.trim(),
        sortCode: Number(row.sortCode || 0),
        weight: Number(row.weight || 0),
        deleteFlag: 'NOT_DELETE'
      })
    }

    message.success(`成功导入 ${importRows.value.length} 条字典记录`)
    closeImportModal()
    page.value = 1
    await reloadDictionaryData(1)
  }
  finally {
    importing.value = false
  }
}

onMounted(async () => {
  await reloadDictionaryData()
})
</script>

<template>
  <div class="dict-page">
    <section class="dict-hero">
      <div>
        <p class="dict-eyebrow">System Dictionary</p>
        <h1>字典管理</h1>
        <p class="dict-description">
          这里集中维护系统运行所依赖的字典分类与字典项，支持按分类树定位、按关键字检索，并直接完成新增、编辑和删除操作。
        </p>
      </div>
      <div class="dict-hero-actions">
        <n-button type="primary" @click="openCreateDrawer">
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增一级字典
        </n-button>
        <n-button secondary :disabled="!selectedNode" @click="openCreateChildDrawer()">
          <template #icon>
            <Icon icon="solar:hierarchy-bold" />
          </template>
          新增子项
        </n-button>
        <n-button secondary type="error" :disabled="!selectedRowIds.length" @click="handleBatchDelete">
          <template #icon>
            <Icon icon="solar:trash-bin-minimalistic-bold" />
          </template>
          批量删除
        </n-button>
        <n-button secondary @click="exportCurrentResults">
          <template #icon>
            <Icon icon="solar:download-bold" />
          </template>
          导出当前结果
        </n-button>
        <n-button secondary @click="downloadImportTemplate">
          <template #icon>
            <Icon icon="solar:file-download-bold" />
          </template>
          下载导入模板
        </n-button>
        <n-button secondary @click="openImportFilePicker">
          <template #icon>
            <Icon icon="solar:upload-bold" />
          </template>
          导入 CSV
        </n-button>
        <n-button secondary @click="handleReset">
          <template #icon>
            <Icon icon="system-uicons:reset-forward" />
          </template>
          重置筛选
        </n-button>
        <n-button :loading="treeLoading || tableLoading" @click="handleRefresh">
          <template #icon>
            <Icon icon="solar:restart-bold" />
          </template>
          刷新数据
        </n-button>
      </div>
    </section>

    <section class="summary-grid">
      <article v-for="card in summaryCards" :key="card.title" class="summary-card">
        <div class="summary-icon">
          <Icon :icon="card.icon" />
        </div>
        <div class="summary-copy">
          <span>{{ card.title }}</span>
          <strong>{{ card.value }}</strong>
          <small>{{ card.helper }}</small>
        </div>
      </article>
    </section>

    <section class="dict-layout">
      <article class="panel tree-panel">
        <header class="panel-header">
          <div>
            <p>Dictionary Tree</p>
            <h2>分类导航</h2>
          </div>
          <n-tag size="small" round type="info">共 {{ filteredTreeData.length }} 个主分类</n-tag>
        </header>

        <n-input
          v-model:value="searchForm.treeKeyword"
          clearable
          placeholder="按字典名称或字典值筛选分类树"
        >
          <template #prefix>
            <Icon icon="simple-line-icons:magnifier" />
          </template>
        </n-input>

        <div class="panel-tip">
          点击左侧分类树可快速过滤右侧列表，适合定位系统级常量、状态枚举和业务字典。
        </div>

        <div class="tree-wrap">
          <n-spin :show="treeLoading">
            <n-tree
              block-line
              default-expand-all
              selectable
              key-field="id"
              label-field="dictLabel"
              :data="filteredTreeData"
              :node-props="nodeProps"
              :selected-keys="selectedTreeKeys"
            />
            <n-empty v-if="!treeLoading && !filteredTreeData.length" description="没有匹配的字典分类" />
          </n-spin>
        </div>
      </article>

      <article class="panel table-panel dict-table-card">
        <header class="panel-header">
          <div>
            <p>Dictionary Records</p>
            <h2>字典明细</h2>
          </div>
          <n-tag size="small" round :type="selectedNode ? 'success' : 'default'">
            {{ selectedNode ? `当前分类：${selectedNode.dictLabel}` : '当前分类：全部' }}
          </n-tag>
        </header>

        <div class="filter-bar">
          <n-input
            v-model:value="searchForm.keyword"
            clearable
            placeholder="输入字典名称进行检索"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <Icon icon="simple-line-icons:magnifier" />
            </template>
          </n-input>

          <div class="filter-actions">
            <n-button type="primary" @click="handleSearch">查询</n-button>
            <n-button @click="handleReset">重置</n-button>
          </div>
        </div>

        <div class="selected-bar">
          <div>
            <strong>筛选说明</strong>
            <span>
              {{ selectedNode ? `已按“${selectedNode.dictLabel}”过滤` : '当前展示全部字典数据' }}
            </span>
          </div>
          <div class="selected-actions">
            <n-tag size="small" round type="info">已选 {{ selectedRowIds.length }} 条</n-tag>
            <n-button v-if="selectedNode" text type="primary" @click="clearSelectedNode">清除分类筛选</n-button>
          </div>
        </div>

        <div class="table-wrap">
          <n-spin :show="tableLoading">
            <n-table :bordered="false" :single-line="false">
              <thead>
                <tr>
                  <th class="select-col">
                    <n-checkbox
                      :checked="allRowsSelected"
                      :indeterminate="partiallySelected"
                      @update:checked="toggleSelectAll"
                    />
                  </th>
                  <th>字典名称</th>
                  <th>字典值</th>
                  <th>分类</th>
                  <th>层级</th>
                  <th>排序</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.id">
                  <td class="select-col">
                    <n-checkbox
                      :checked="selectedRowIds.includes(row.id)"
                      @update:checked="value => toggleRowSelection(row.id, value)"
                    />
                  </td>
                  <td>
                    <div class="dict-name-cell">
                      <strong>{{ row.dictLabel }}</strong>
                      <span>{{ row.name || '系统字典项' }}</span>
                    </div>
                  </td>
                  <td>
                    <code>{{ row.dictValue }}</code>
                  </td>
                  <td>
                    <n-tag size="small" round type="warning">
                      {{ getCategoryLabel(row) }}
                    </n-tag>
                  </td>
                  <td>
                    <n-tag size="small" round :type="getLevelType(row)">
                      {{ getLevelLabel(row) }}
                    </n-tag>
                  </td>
                  <td>{{ row.sortCode }}</td>
                  <td>
                    <n-space :size="4">
                      <n-button
                        v-if="row.parentId === '0'"
                        quaternary
                        type="primary"
                        @click="openCreateChildDrawer(row)"
                      >
                        新增子项
                      </n-button>
                      <n-button quaternary type="primary" @click="openEditDrawer(row)">
                        编辑
                      </n-button>
                      <n-button quaternary @click="openPreviewModal(row)">
                        预览
                      </n-button>
                      <n-button quaternary type="error" @click="handleDeleteDict(row)">
                        删除
                      </n-button>
                    </n-space>
                  </td>
                </tr>
                <tr v-if="!tableLoading && !tableData.length">
                  <td colspan="7">
                    <n-empty description="当前条件下没有匹配的字典记录" />
                  </td>
                </tr>
              </tbody>
            </n-table>
          </n-spin>
        </div>

        <div class="pagination-bar">
        <div class="pagination-meta">
            已加载 {{ tableData.length }} 条，本次检索共 {{ total }} 条记录
          </div>
          <n-pagination
            :page="page"
            :page-size="pageSize"
            :item-count="total"
            :page-sizes="[10, 20, 30, 50]"
            show-size-picker
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </article>
    </section>

    <input
      ref="importInputRef"
      type="file"
      accept=".csv,text/csv"
      class="hidden-file-input"
      @change="handleImportFileChange"
    >

    <n-drawer v-model:show="showDrawer" :width="560" placement="right">
      <n-drawer-content :title="isEditMode ? '编辑字典' : '新增字典'">
        <n-form ref="dictFormRef" :model="dictForm" :rules="dictFormRules" label-placement="top">
          <n-grid :cols="2" :x-gap="16">
            <n-form-item-gi :span="2" label="上级字典" path="parentId">
              <n-tree-select
                v-model:value="dictForm.parentId"
                :options="parentOptions"
                clearable
                default-expand-all
                placeholder="选择上级字典，顶级字典表示一级分类"
              />
            </n-form-item-gi>
            <n-form-item-gi label="内部名称" path="name">
              <n-input v-model:value="dictForm.name" placeholder="请输入内部名称" />
            </n-form-item-gi>
            <n-form-item-gi label="字典名称" path="dictLabel">
              <n-input v-model:value="dictForm.dictLabel" placeholder="请输入字典名称" />
            </n-form-item-gi>
            <n-form-item-gi label="字典值" path="dictValue">
              <n-input v-model:value="dictForm.dictValue" placeholder="请输入字典值" />
            </n-form-item-gi>
            <n-form-item-gi label="分类编码" path="category">
              <n-select
                v-model:value="dictForm.category"
                filterable
                tag
                :options="categoryOptions"
                placeholder="例如 FRM / BIZ / SYS"
              />
            </n-form-item-gi>
            <n-form-item-gi label="排序值" path="sortCode">
              <n-input-number v-model:value="dictForm.sortCode" class="w-full" :min="0" />
            </n-form-item-gi>
            <n-form-item-gi label="权重值" path="weight">
              <n-input-number v-model:value="dictForm.weight" class="w-full" :min="0" />
            </n-form-item-gi>
          </n-grid>

          <div class="drawer-tip">
            一级字典建议使用稳定的分类编码和字典值，子项通常继承父级分类编码，便于系统统一引用。
          </div>

          <div class="drawer-actions">
            <n-button @click="closeDrawer">取消</n-button>
            <n-button type="primary" :loading="submitting" @click="submitDictForm">
              {{ isEditMode ? '保存修改' : '确认新增' }}
            </n-button>
          </div>
        </n-form>
      </n-drawer-content>
    </n-drawer>

    <n-modal v-model:show="showPreviewModal" preset="card" title="字典详情预览" style="width: min(680px, 92vw)">
      <div v-if="previewDict" class="preview-grid">
        <div class="preview-item">
          <span>字典名称</span>
          <strong>{{ previewDict.dictLabel }}</strong>
        </div>
        <div class="preview-item">
          <span>内部名称</span>
          <strong>{{ previewDict.name || '--' }}</strong>
        </div>
        <div class="preview-item">
          <span>字典值</span>
          <code>{{ previewDict.dictValue }}</code>
        </div>
        <div class="preview-item">
          <span>分类编码</span>
          <strong>{{ previewDict.category || '--' }}</strong>
        </div>
        <div class="preview-item">
          <span>层级</span>
          <strong>{{ getLevelLabel(previewDict) }}</strong>
        </div>
        <div class="preview-item">
          <span>上级 ID</span>
          <strong>{{ previewDict.parentId || '0' }}</strong>
        </div>
        <div class="preview-item">
          <span>排序值</span>
          <strong>{{ previewDict.sortCode }}</strong>
        </div>
        <div class="preview-item">
          <span>权重值</span>
          <strong>{{ previewDict.weight }}</strong>
        </div>
      </div>
      <template #footer>
        <div class="drawer-actions">
          <n-button @click="closePreviewModal">关闭</n-button>
          <n-button v-if="previewDict" type="primary" @click="handleEditPreview">
            编辑当前字典
          </n-button>
        </div>
      </template>
    </n-modal>

    <n-modal v-model:show="showImportModal" preset="card" title="CSV 导入预览" style="width: min(900px, 94vw)">
      <div class="panel-tip">
        导入前请确认 `parentId / name / dictLabel / dictValue / category / sortCode / weight` 七列完整无误，提交后将逐条创建字典记录。
      </div>
      <div class="table-wrap import-table-wrap">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>行号</th>
              <th>上级 ID</th>
              <th>内部名称</th>
              <th>字典名称</th>
              <th>字典值</th>
              <th>分类</th>
              <th>排序</th>
              <th>权重</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in importRows" :key="`${row.lineNo}-${row.dictValue}`">
              <td>{{ row.lineNo }}</td>
              <td><code>{{ row.parentId }}</code></td>
              <td>{{ row.name }}</td>
              <td>{{ row.dictLabel }}</td>
              <td><code>{{ row.dictValue }}</code></td>
              <td>{{ row.category }}</td>
              <td>{{ row.sortCode }}</td>
              <td>{{ row.weight }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>
      <template #footer>
        <div class="drawer-actions">
          <n-button @click="closeImportModal">取消</n-button>
          <n-button type="primary" :loading="importing" @click="submitImportRows">
            确认导入 {{ importRows.length }} 条
          </n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<style scoped lang="scss">
.dict-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dict-hero,
.panel,
.summary-card {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96)),
    radial-gradient(circle at top right, rgba(59, 130, 246, 0.08), transparent 36%);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.05);
}

.dict-hero {
  padding: 28px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.dict-eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
}

.dict-hero h1 {
  margin: 0;
  font-size: 30px;
  line-height: 1.15;
  color: #0f172a;
}

.dict-description {
  max-width: 780px;
  margin: 10px 0 0;
  color: #475569;
  line-height: 1.7;
}

.dict-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.hidden-file-input {
  display: none;
}

.summary-card {
  padding: 18px 20px;
  display: flex;
  gap: 14px;
  align-items: center;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 24px;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.1);
}

.summary-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-copy span {
  font-size: 13px;
  color: #64748b;
}

.summary-copy strong {
  font-size: 24px;
  line-height: 1.2;
  color: #0f172a;
  word-break: break-word;
}

.summary-copy small {
  color: #475569;
}

.dict-layout {
  display: grid;
  grid-template-columns: minmax(280px, 320px) minmax(0, 1fr);
  gap: 16px;
}

.panel {
  padding: 22px;
}

.panel-header {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-header p {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #0f766e;
}

.panel-header h2 {
  margin: 2px 0 0;
  font-size: 22px;
  color: #0f172a;
}

.panel-tip {
  margin: 14px 0 16px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #475569;
  line-height: 1.6;
  background: rgba(241, 245, 249, 0.9);
}

.tree-wrap {
  min-height: 420px;
}

.filter-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
}

.filter-actions {
  display: flex;
  gap: 10px;
}

.selected-bar {
  margin: 16px 0;
  padding: 14px 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: linear-gradient(135deg, rgba(239, 246, 255, 0.95), rgba(240, 253, 250, 0.95));
}

.selected-bar strong {
  display: block;
  margin-bottom: 4px;
  color: #0f172a;
}

.selected-bar span {
  color: #475569;
}

.selected-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.table-wrap {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.9);
}

.dict-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dict-name-cell strong {
  color: #0f172a;
}

.dict-name-cell span {
  font-size: 12px;
  color: #64748b;
}

code {
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 12px;
  color: #1d4ed8;
  background: rgba(219, 234, 254, 0.7);
}

.select-col {
  width: 48px;
  text-align: center;
}

.pagination-bar {
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.pagination-meta {
  color: #64748b;
  font-size: 13px;
}

.drawer-tip {
  margin-top: 8px;
  padding: 12px 14px;
  border-radius: 14px;
  color: #475569;
  line-height: 1.6;
  background: rgba(241, 245, 249, 0.9);
}

.drawer-actions {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.import-table-wrap {
  max-height: 420px;
  overflow: auto;
}

.preview-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.96);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.preview-item span {
  font-size: 12px;
  color: #64748b;
}

.preview-item strong {
  color: #0f172a;
  word-break: break-word;
}

@media (max-width: 1280px) {
  .dict-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dict-hero {
    padding: 22px;
    flex-direction: column;
    align-items: flex-start;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .panel {
    padding: 18px;
  }

  .panel-header,
  .selected-bar,
  .pagination-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-bar {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .dict-hero-actions,
  .drawer-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }
}
</style>
