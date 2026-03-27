import type { CodegenFieldSchema, CodegenTableSchema } from './model';

export interface GeneratedCodeFile {
  name: string;
  language: string;
  description: string;
  content: string;
}

export function buildGeneratedCodeFiles(table: CodegenTableSchema): GeneratedCodeFile[] {
  return [
    {
      name: 'index.vue',
      language: 'vue',
      description: '页面主文件，包含搜索区、表格区和表单弹窗骨架。',
      content: buildVuePage(table)
    },
    {
      name: 'api.ts',
      language: 'ts',
      description: '对应业务模块的接口封装。',
      content: buildApiModule(table)
    },
    {
      name: 'types.ts',
      language: 'ts',
      description: '列表记录、查询参数和表单模型类型声明。',
      content: buildTypesModule(table)
    },
    {
      name: 'schema.ts',
      language: 'ts',
      description: '字段配置摘要，便于二次生成和扩展。',
      content: buildSchemaModule(table)
    },
    {
      name: 'README.md',
      language: 'md',
      description: '生成说明、落地路径和人工补齐建议。',
      content: buildReadme(table)
    }
  ];
}

export function buildCodeBundle(table: CodegenTableSchema) {
  return buildGeneratedCodeFiles(table)
    .map(file => `// ===== ${file.name} =====\n${file.content}`)
    .join('\n\n');
}

function buildVuePage(table: CodegenTableSchema) {
  const queryFields = table.fields.filter(field => field.queryVisible);
  const listFields = table.fields.filter(field => field.listVisible);
  const formFields = table.fields.filter(field => field.formVisible);

  const queryTemplate = queryFields.length
    ? queryFields.map(field => `          <n-form-item label="${field.formLabel}">
            <n-input v-model:value="queryForm.${field.propertyName}" placeholder="${field.placeholder}" />
          </n-form-item>`).join('\n')
    : '          <n-empty description="当前模板未开启查询字段" />';

  const columnTemplate = listFields
    .map(field => `    { key: '${field.propertyName}', title: '${field.formLabel}' }`)
    .join(',\n');

  const formTemplate = formFields
    .map(field => `        <n-form-item label="${field.formLabel}" path="${field.propertyName}">
          <n-input v-model:value="formModel.${field.propertyName}" placeholder="${field.placeholder}" />
        </n-form-item>`)
    .join('\n');

  return `<script setup lang="ts">
import type { ${table.className}FormModel, ${table.className}QueryParams, ${table.className}Record } from './types';
import { create${table.className}Api, get${table.className}PageApi, update${table.className}Api } from './api';

const queryForm = reactive<${table.className}QueryParams>({
${queryFields.map(field => `  ${field.propertyName}: ''`).join(',\n')}
});

const formModel = reactive<${table.className}FormModel>({
${formFields.map(field => `  ${field.propertyName}: ${resolveDefaultValue(field)}`).join(',\n')}
});

const columns = [
${columnTemplate}
];

async function fetchData() {
  await get${table.className}PageApi(queryForm);
}

async function submitForm() {
  if (formModel.id) {
    await update${table.className}Api(formModel.id, formModel);
    return;
  }

  await create${table.className}Api(formModel);
}
</script>

<template>
  <div class="${table.businessName}-page">
    <n-card title="${table.tableComment}">
      <n-form inline :model="queryForm">
${queryTemplate}
      </n-form>

      <n-data-table :columns="columns" :data="[] as ${table.className}Record[]" />

      <n-drawer placement="right" :show="false" width="480">
        <n-drawer-content title="编辑${table.tableComment}">
          <n-form :model="formModel">
${formTemplate}
          </n-form>
        </n-drawer-content>
      </n-drawer>
    </n-card>
  </div>
</template>
`;
}

function buildApiModule(table: CodegenTableSchema) {
  return `import type { ${table.className}FormModel, ${table.className}QueryParams, ${table.className}Record } from './types';
import { request } from '@/utils/http';

export function get${table.className}PageApi(params: ${table.className}QueryParams) {
  return request<${table.className}QueryParams, { records: ${table.className}Record[]; total: number }>({
    url: '${table.apiPrefix}',
    method: 'get',
    params
  });
}

export function create${table.className}Api(data: ${table.className}FormModel) {
  return request<${table.className}FormModel, ${table.className}Record>({
    url: '${table.apiPrefix}',
    method: 'post',
    data
  });
}

export function update${table.className}Api(id: string, data: Partial<${table.className}FormModel>) {
  return request<Partial<${table.className}FormModel>, ${table.className}Record>({
    url: \`${table.apiPrefix}/\${id}\`,
    method: 'patch',
    data
  });
}
`;
}

function buildTypesModule(table: CodegenTableSchema) {
  const recordFields = table.fields
    .map(field => `  ${field.propertyName}${field.required ? '' : '?'}: ${resolveTsType(field)};`)
    .join('\n');

  const queryFields = table.fields
    .filter(field => field.queryVisible)
    .map(field => `  ${field.propertyName}?: ${resolveTsType(field)};`)
    .join('\n');

  const formFields = table.fields
    .filter(field => field.formVisible)
    .map(field => `  ${field.propertyName}${field.required ? '' : '?'}: ${resolveTsType(field)};`)
    .join('\n');

  return `export interface ${table.className}Record {
${recordFields}
}

export interface ${table.className}QueryParams {
${queryFields || '  keyword?: string;'}
}

export interface ${table.className}FormModel {
  id?: string;
${formFields}
}
`;
}

function buildSchemaModule(table: CodegenTableSchema) {
  const fieldSummaries = table.fields.map(field => `  {
    columnName: '${field.columnName}',
    propertyName: '${field.propertyName}',
    label: '${field.formLabel}',
    component: '${field.component}',
    queryVisible: ${field.queryVisible},
    listVisible: ${field.listVisible},
    formVisible: ${field.formVisible},
    required: ${field.required}
  }`).join(',\n');

  return `export const ${table.businessName}CodegenSchema = {
  tableName: '${table.tableName}',
  className: '${table.className}',
  routePath: '${table.routePath}',
  permissionPrefix: '${table.permissionPrefix}',
  templateType: '${table.templateType}',
  fields: [
${fieldSummaries}
  ]
};
`;
}

function buildReadme(table: CodegenTableSchema) {
  return `# ${table.tableComment} 代码生成说明

- 模块：\`${table.moduleName}\`
- 页面路由：\`${table.routePath}\`
- 组件路径：\`${table.componentPath}\`
- 接口前缀：\`${table.apiPrefix}\`
- 模板类型：\`${table.templateType}\`

## 字段摘要

${table.fields.map(field => `- \`${field.columnName}\` -> \`${field.propertyName}\` (${field.component})`).join('\n')}

## 人工补齐建议

${table.riskNotes.map(note => `- ${note}`).join('\n')}
`;
}

function resolveDefaultValue(field: CodegenFieldSchema) {
  if (field.defaultValue !== undefined) {
    return JSON.stringify(field.defaultValue);
  }

  if (field.tsType === 'boolean') {
    return 'false';
  }

  if (field.tsType === 'number') {
    return '0';
  }

  return '\'\'';
}

function resolveTsType(field: CodegenFieldSchema) {
  if (field.component === 'switch') {
    return 'boolean';
  }

  if (field.tsType === 'number') {
    return 'number';
  }

  return 'string';
}
