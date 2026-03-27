<script setup lang="ts">
import { useRouter } from 'vue-router';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';
import { buildCodeBundle } from './generator';
import {
  CODEGEN_TEMPLATE_OPTIONS,
  getCodegenSeedTables,
  type CodegenFieldComponent,
  type CodegenQueryType,
  type CodegenTableSchema
} from './model';
import { setCodegenPreviewDraft } from './shared';

defineOptions({
  name: 'toolCodegen'
});

const router = useRouter();
const keyword = ref('');
const codegenTables = ref<CodegenTableSchema[]>(getCodegenSeedTables());
const selectedTableId = ref(codegenTables.value[0]?.id || '');

const fieldComponentOptions = [
  { label: '输入框', value: 'input' },
  { label: '多行文本', value: 'textarea' },
  { label: '下拉选择', value: 'select' },
  { label: '开关', value: 'switch' },
  { label: '日期', value: 'date' },
  { label: '数字', value: 'number' }
] satisfies Array<{ label: string; value: CodegenFieldComponent }>;

const queryTypeOptions = [
  { label: '精确匹配', value: 'eq' },
  { label: '模糊匹配', value: 'like' },
  { label: '区间查询', value: 'between' }
] satisfies Array<{ label: string; value: CodegenQueryType }>;

const filteredTables = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) {
    return codegenTables.value;
  }

  return codegenTables.value.filter(item =>
    item.tableName.toLowerCase().includes(query)
    || item.tableComment.toLowerCase().includes(query)
    || item.moduleName.toLowerCase().includes(query)
    || item.businessName.toLowerCase().includes(query)
  );
});

const selectedTable = computed(() =>
  codegenTables.value.find(item => item.id === selectedTableId.value) || filteredTables.value[0] || null
);

watch(filteredTables, (tables) => {
  if (!tables.length) {
    selectedTableId.value = '';
    return;
  }

  if (!tables.some(item => item.id === selectedTableId.value)) {
    selectedTableId.value = tables[0].id;
  }
}, {
  immediate: true
});

const generatorSummary = computed(() => {
  if (!selectedTable.value) {
    return [];
  }

  return [
    { label: '字段总数', value: String(selectedTable.value.fields.length) },
    { label: '列表字段', value: String(selectedTable.value.fields.filter(field => field.listVisible).length) },
    { label: '查询字段', value: String(selectedTable.value.fields.filter(field => field.queryVisible).length) },
    { label: '表单字段', value: String(selectedTable.value.fields.filter(field => field.formVisible).length) }
  ];
});

function selectTable(tableId: string) {
  selectedTableId.value = tableId;
}

async function openPreview() {
  if (!selectedTable.value) {
    message.warning('请先选择一张数据表');
    return;
  }

  setCodegenPreviewDraft(selectedTable.value);
  await router.push({
    path: '/tool/codegen/preview',
    query: {
      table: selectedTable.value.tableName
    }
  });
}

async function downloadBundle() {
  if (!selectedTable.value) {
    message.warning('请先选择一张数据表');
    return;
  }

  const confirmed = await confirmAction({
    title: '确认下载生成结果',
    content: `当前将导出 ${selectedTable.value.tableComment} 的代码骨架，请在落库前再次核对路由、权限和字段配置。`
  });

  if (!confirmed) {
    return;
  }

  const content = buildCodeBundle(selectedTable.value);
  const blob = new Blob([ content ], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${selectedTable.value.tableName}-codegen-bundle.txt`;
  link.click();
  URL.revokeObjectURL(url);
  message.success('代码骨架已下载');
}
</script>

<template>
  <div class="codegen-page">
    <section class="codegen-hero">
      <div class="codegen-hero__content">
        <span class="codegen-hero__eyebrow">代码生成器</span>
        <h1>低代码骨架生成工作台</h1>
        <p>
          先选择业务表，再调整字段在列表、查询、表单和详情中的表现，
          最后生成页面骨架、接口封装与类型声明，减少重复搭页面的时间。
        </p>
      </div>

      <div class="codegen-hero__actions">
        <n-button secondary @click="downloadBundle">
          下载代码包
        </n-button>
        <n-button type="primary" @click="openPreview">
          进入代码预览
        </n-button>
      </div>
    </section>

    <section class="codegen-warning">
      <n-alert type="warning" title="生成前请先确认这三件事" :show-icon="false">
        生成器只负责产出业务骨架，复杂联表、字典远程搜索、上传能力和审计逻辑仍需人工补齐。
      </n-alert>
    </section>

    <div class="codegen-layout">
      <section class="codegen-card codegen-card--tables">
        <div class="section-header">
          <div>
            <strong>数据表列表</strong>
            <span>选择要生成页面骨架的业务表</span>
          </div>
          <n-input v-model:value="keyword" clearable placeholder="搜索表名 / 模块 / 业务标识" class="table-search" />
        </div>

        <div class="table-list">
          <button
            v-for="table in filteredTables"
            :key="table.id"
            type="button"
            class="table-option"
            :class="{ 'table-option--active': table.id === selectedTableId }"
            @click="selectTable(table.id)"
          >
            <div class="table-option__top">
              <strong>{{ table.tableComment }}</strong>
              <n-tag :type="table.status === 'ready' ? 'success' : 'warning'" size="small">
                {{ table.status === 'ready' ? '可生成' : '草稿中' }}
              </n-tag>
            </div>
            <code>{{ table.tableName }}</code>
            <p>{{ table.moduleName }} / {{ table.businessName }} / {{ table.className }}</p>
            <span>{{ table.updatedAt }}</span>
          </button>
        </div>
      </section>

      <section v-if="selectedTable" class="codegen-main">
        <section class="codegen-card">
          <div class="section-header">
            <div>
              <strong>表级配置</strong>
              <span>控制生成目录、路由、权限和模板类型</span>
            </div>
            <n-space>
              <n-tag type="info" size="small">{{ selectedTable.tableName }}</n-tag>
              <n-tag type="default" size="small">{{ selectedTable.packageName }}</n-tag>
            </n-space>
          </div>

          <div class="summary-grid">
            <article v-for="item in generatorSummary" :key="item.label" class="summary-card">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>

          <n-grid :cols="24" :x-gap="14" :y-gap="12">
            <n-form-item-gi :span="8" label="作者">
              <n-input v-model:value="selectedTable.author" placeholder="请输入作者" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="模块名">
              <n-input v-model:value="selectedTable.moduleName" placeholder="请输入模块名" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="业务标识">
              <n-input v-model:value="selectedTable.businessName" placeholder="请输入业务标识" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="类名">
              <n-input v-model:value="selectedTable.className" placeholder="请输入类名" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="接口前缀">
              <n-input v-model:value="selectedTable.apiPrefix" placeholder="请输入接口前缀" />
            </n-form-item-gi>
            <n-form-item-gi :span="8" label="路由地址">
              <n-input v-model:value="selectedTable.routePath" placeholder="请输入路由地址" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="组件路径">
              <n-input v-model:value="selectedTable.componentPath" placeholder="请输入组件路径" />
            </n-form-item-gi>
            <n-form-item-gi :span="12" label="权限前缀">
              <n-input v-model:value="selectedTable.permissionPrefix" placeholder="请输入权限前缀" />
            </n-form-item-gi>
            <n-form-item-gi :span="24" label="备注">
              <n-input v-model:value="selectedTable.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入生成说明" />
            </n-form-item-gi>
          </n-grid>
        </section>

        <section class="codegen-card">
          <div class="section-header">
            <div>
              <strong>模板类型</strong>
              <span>根据业务结构选择页面生成方式</span>
            </div>
          </div>

          <div class="template-grid">
            <button
              v-for="item in CODEGEN_TEMPLATE_OPTIONS"
              :key="item.value"
              type="button"
              class="template-card"
              :class="{ 'template-card--active': selectedTable.templateType === item.value }"
              @click="selectedTable.templateType = item.value"
            >
              <strong>{{ item.label }}</strong>
              <p>{{ item.description }}</p>
            </button>
          </div>
        </section>

        <section class="codegen-card">
          <div class="section-header">
            <div>
              <strong>字段配置列表</strong>
              <span>控制字段出现在列表、查询、表单和详情中的方式</span>
            </div>
          </div>

          <div class="field-table">
            <div class="field-table__head">
              <span>字段</span>
              <span>属性名</span>
              <span>组件</span>
              <span>查询</span>
              <span>显隐</span>
              <span>表单配置</span>
            </div>

            <div v-for="field in selectedTable.fields" :key="field.id" class="field-row">
              <div class="field-cell field-cell--title">
                <strong>{{ field.columnComment }}</strong>
                <code>{{ field.columnName }}</code>
                <span>{{ field.dbType }} / {{ field.tsType }}</span>
              </div>

              <div class="field-cell">
                <n-input v-model:value="field.propertyName" size="small" />
                <n-input v-model:value="field.formLabel" size="small" placeholder="显示标签" />
              </div>

              <div class="field-cell">
                <n-select v-model:value="field.component" size="small" :options="fieldComponentOptions" />
                <n-input v-model:value="field.dictType" size="small" placeholder="字典类型（可选）" />
              </div>

              <div class="field-cell">
                <n-switch v-model:value="field.queryVisible" size="small" />
                <n-select v-model:value="field.queryType" size="small" :options="queryTypeOptions" />
              </div>

              <div class="field-cell">
                <label><n-checkbox v-model:checked="field.listVisible" /> 列表</label>
                <label><n-checkbox v-model:checked="field.detailVisible" /> 详情</label>
                <label><n-checkbox v-model:checked="field.sortable" /> 排序</label>
              </div>

              <div class="field-cell">
                <label><n-checkbox v-model:checked="field.formVisible" /> 表单显示</label>
                <label><n-checkbox v-model:checked="field.required" /> 必填</label>
                <n-input v-model:value="field.placeholder" size="small" placeholder="表单占位文案" />
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>

<style scoped lang="less">
.codegen-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.codegen-hero,
.codegen-card,
.codegen-warning {
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: var(--primary-bgColor);
}

.codegen-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 28px;
  background:
    radial-gradient(circle at top right, rgba(20, 184, 166, 0.16), transparent 28%),
    linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(16, 185, 129, 0.08));
}

.codegen-hero__content {
  max-width: 820px;
}

.codegen-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(15, 118, 110, 0.12);
  color: var(--lc-accent);
  font-size: 12px;
  font-weight: 700;
}

.codegen-hero h1 {
  margin: 14px 0 10px;
  font-size: 34px;
  line-height: 1.1;
}

.codegen-hero p {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.75;
}

.codegen-hero__actions {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.codegen-warning {
  padding: 14px 16px;
}

.codegen-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 14px;
}

.codegen-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.codegen-card {
  padding: 16px;
}

.codegen-card--tables {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}

.section-header strong,
.section-header span {
  display: block;
}

.section-header span {
  margin-top: 6px;
  color: var(--text-color-2);
  font-size: 13px;
}

.table-search {
  width: min(100%, 240px);
}

.table-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.table-option,
.template-card {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.68);
  border-radius: 12px;
  text-align: left;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.table-option {
  padding: 14px;
}

.table-option:hover,
.template-card:hover {
  transform: translateY(-1px);
  border-color: rgba(15, 118, 110, 0.22);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.table-option--active,
.template-card--active {
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 16px 32px rgba(15, 118, 110, 0.12);
}

.table-option__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.table-option code,
.field-cell code {
  font-family: Consolas, Monaco, monospace;
}

.table-option p,
.table-option span {
  display: block;
  margin: 8px 0 0;
  color: var(--text-color-2);
  font-size: 13px;
  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.summary-card {
  padding: 14px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.88);
  border: 1px solid rgba(148, 163, 184, 0.14);
}

.summary-card span,
.summary-card strong {
  display: block;
}

.summary-card span {
  color: var(--text-color-2);
  font-size: 13px;
}

.summary-card strong {
  margin-top: 8px;
  font-size: 22px;
}

.template-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.template-card {
  padding: 16px;
}

.template-card strong {
  display: block;
  margin-bottom: 8px;
}

.template-card p {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.7;
}

.field-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-table__head,
.field-row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.8fr 0.8fr 1.1fr;
  gap: 12px;
}

.field-table__head {
  padding: 0 4px 6px;
  color: var(--text-color-2);
  font-size: 12px;
  font-weight: 700;
}

.field-row {
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(255, 255, 255, 0.7);
}

.field-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.field-cell label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-color-2);
  font-size: 13px;
}

.field-cell--title strong,
.field-cell--title code,
.field-cell--title span {
  display: block;
}

.field-cell--title code,
.field-cell--title span {
  color: var(--text-color-2);
  font-size: 13px;
}

@media (max-width: 1280px) {
  .codegen-layout {
    grid-template-columns: 1fr;
  }

  .summary-grid,
  .template-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-table__head,
  .field-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .codegen-hero {
    flex-direction: column;
  }

  .codegen-hero__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .summary-grid,
  .template-grid,
  .field-table__head,
  .field-row {
    grid-template-columns: 1fr;
  }
}
</style>
