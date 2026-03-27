export type CodegenTemplateType = 'crud' | 'tree' | 'master-detail' | 'form';
export type CodegenStatus = 'ready' | 'draft';
export type CodegenFieldComponent = 'input' | 'textarea' | 'select' | 'switch' | 'date' | 'number';
export type CodegenQueryType = 'eq' | 'like' | 'between';

export interface CodegenFieldSchema {
  id: string;
  columnName: string;
  columnComment: string;
  dbType: string;
  tsType: string;
  propertyName: string;
  formLabel: string;
  component: CodegenFieldComponent;
  dictType?: string;
  required: boolean;
  listVisible: boolean;
  queryVisible: boolean;
  formVisible: boolean;
  detailVisible: boolean;
  sortable: boolean;
  queryType: CodegenQueryType;
  placeholder: string;
  defaultValue?: string;
  example?: string;
}

export interface CodegenTableSchema {
  id: string;
  tableName: string;
  tableComment: string;
  moduleName: string;
  businessName: string;
  className: string;
  packageName: string;
  scene: string;
  status: CodegenStatus;
  updatedAt: string;
  author: string;
  apiPrefix: string;
  routePath: string;
  componentPath: string;
  permissionPrefix: string;
  templateType: CodegenTemplateType;
  remark: string;
  riskNotes: string[];
  fields: CodegenFieldSchema[];
}

export const CODEGEN_TEMPLATE_OPTIONS: Array<{
  value: CodegenTemplateType;
  label: string;
  description: string;
}> = [
  {
    value: 'crud',
    label: '标准 CRUD',
    description: '适合后台高频列表页，自动生成搜索区、表格、表单和基础接口。'
  },
  {
    value: 'tree',
    label: '树表联动',
    description: '适合字典、部门、菜单等左树右表结构，保留节点切换和层级关系。'
  },
  {
    value: 'master-detail',
    label: '主子表',
    description: '适合订单、套餐、配置项等一对多模型，主表与明细表同时生成。'
  },
  {
    value: 'form',
    label: '纯表单',
    description: '适合配置中心或单页录入场景，弱化列表，突出表单区。'
  }
];

const codegenSeedTables: CodegenTableSchema[] = [
  {
    id: 'sys_user',
    tableName: 'sys_user',
    tableComment: '用户管理',
    moduleName: 'system',
    businessName: 'user',
    className: 'User',
    packageName: 'src/views/system/user',
    scene: '系统管理',
    status: 'ready',
    updatedAt: '2026-03-27 15:30',
    author: 'LuckyColor Team',
    apiPrefix: '/users',
    routePath: '/system/user',
    componentPath: 'system/user/index',
    permissionPrefix: 'system:user',
    templateType: 'crud',
    remark: '默认生成列表、详情、导入导出和重置密码入口。',
    riskNotes: [
      '手机号与邮箱校验规则仍需结合后端 DTO 约束补齐。',
      '角色树和部门树通常需要联表接口，不建议完全依赖生成代码。'
    ],
    fields: [
      createField('id', '主键', 'bigint', 'string', 'id', '主键', 'input', { listVisible: false, queryVisible: false, formVisible: false, detailVisible: false }),
      createField('username', '用户名', 'varchar(64)', 'string', 'username', '用户名', 'input', { required: true, queryVisible: true, sortable: true, placeholder: '请输入用户名', example: 'admin' }),
      createField('nickname', '昵称', 'varchar(64)', 'string', 'nickname', '昵称', 'input', { queryVisible: true, placeholder: '请输入昵称', example: 'LuckyColor 管理员' }),
      createField('phone', '手机号', 'varchar(20)', 'string', 'phone', '手机号', 'input', { queryVisible: true, placeholder: '请输入手机号', example: '13800000001' }),
      createField('status', '状态', 'tinyint', 'boolean', 'status', '状态', 'switch', { queryVisible: true, queryType: 'eq', dictType: 'COMMON_STATUS', example: 'true' }),
      createField('createdAt', '创建时间', 'datetime', 'string', 'createdAt', '创建时间', 'date', { formVisible: false, queryVisible: true, queryType: 'between', sortable: true, placeholder: '请选择时间范围' })
    ]
  },
  {
    id: 'sys_notice',
    tableName: 'sys_notice',
    tableComment: '公告管理',
    moduleName: 'system',
    businessName: 'notice',
    className: 'Notice',
    packageName: 'src/views/system/notice',
    scene: '系统管理',
    status: 'ready',
    updatedAt: '2026-03-26 20:10',
    author: 'LuckyColor Team',
    apiPrefix: '/notices',
    routePath: '/system/notice',
    componentPath: 'system/notice/index',
    permissionPrefix: 'system:notice',
    templateType: 'crud',
    remark: '列表区保留状态筛选，表单区支持富文本内容扩展。',
    riskNotes: [
      '富文本字段只生成占位输入，实际编辑器与上传能力需要后续补接。',
      '公告推送策略、定时发布和已读状态不应由基础生成器直接产出。'
    ],
    fields: [
      createField('id', '主键', 'bigint', 'string', 'id', '主键', 'input', { listVisible: false, queryVisible: false, formVisible: false, detailVisible: false }),
      createField('title', '公告标题', 'varchar(128)', 'string', 'title', '公告标题', 'input', { required: true, queryVisible: true, sortable: true, placeholder: '请输入公告标题' }),
      createField('type', '公告类型', 'varchar(32)', 'string', 'type', '公告类型', 'select', { required: true, queryVisible: true, dictType: 'NOTICE_TYPE', placeholder: '请选择公告类型' }),
      createField('status', '发布状态', 'varchar(16)', 'string', 'status', '发布状态', 'select', { queryVisible: true, dictType: 'COMMON_STATUS', placeholder: '请选择发布状态' }),
      createField('content', '公告内容', 'text', 'string', 'content', '公告内容', 'textarea', { required: true, listVisible: false, queryVisible: false, placeholder: '请输入公告内容' }),
      createField('publishedAt', '发布时间', 'datetime', 'string', 'publishedAt', '发布时间', 'date', { formVisible: false, queryVisible: true, queryType: 'between', sortable: true, placeholder: '请选择发布时间' })
    ]
  },
  {
    id: 'sys_department',
    tableName: 'sys_department',
    tableComment: '部门管理',
    moduleName: 'system',
    businessName: 'department',
    className: 'Department',
    packageName: 'src/views/system/department',
    scene: '组织架构',
    status: 'draft',
    updatedAt: '2026-03-25 11:00',
    author: 'LuckyColor Team',
    apiPrefix: '/departments',
    routePath: '/system/department',
    componentPath: 'system/department/index',
    permissionPrefix: 'system:department',
    templateType: 'tree',
    remark: '适合左树右表结构，支持负责人和排序字段预置。',
    riskNotes: [
      '树节点拖拽、上下级联动校验和禁用逻辑仍需人工补齐。',
      '部门负责人通常依赖用户远程搜索，生成结果仅保留字段接口占位。'
    ],
    fields: [
      createField('id', '主键', 'bigint', 'string', 'id', '主键', 'input', { listVisible: false, queryVisible: false, formVisible: false, detailVisible: false }),
      createField('parentId', '上级部门', 'bigint', 'string', 'parentId', '上级部门', 'select', { required: true, listVisible: false, queryVisible: false, placeholder: '请选择上级部门' }),
      createField('name', '部门名称', 'varchar(64)', 'string', 'name', '部门名称', 'input', { required: true, queryVisible: true, sortable: true, placeholder: '请输入部门名称' }),
      createField('leader', '负责人', 'varchar(64)', 'string', 'leader', '负责人', 'input', { queryVisible: true, placeholder: '请输入负责人' }),
      createField('phone', '联系电话', 'varchar(20)', 'string', 'phone', '联系电话', 'input', { placeholder: '请输入联系电话' }),
      createField('sort', '排序', 'int', 'number', 'sort', '排序', 'number', { queryVisible: false, sortable: true, placeholder: '请输入排序值', defaultValue: '0' }),
      createField('status', '状态', 'tinyint', 'boolean', 'status', '状态', 'switch', { queryVisible: true, dictType: 'COMMON_STATUS' })
    ]
  }
];

export function getCodegenSeedTables() {
  return codegenSeedTables.map(table => cloneCodegenTable(table));
}

export function cloneCodegenTable(table: CodegenTableSchema): CodegenTableSchema {
  return {
    ...table,
    riskNotes: [ ...table.riskNotes ],
    fields: table.fields.map(field => ({ ...field }))
  };
}

function createField(
  columnName: string,
  columnComment: string,
  dbType: string,
  tsType: string,
  propertyName: string,
  formLabel: string,
  component: CodegenFieldComponent,
  overrides: Partial<CodegenFieldSchema> = {}
): CodegenFieldSchema {
  return {
    id: columnName,
    columnName,
    columnComment,
    dbType,
    tsType,
    propertyName,
    formLabel,
    component,
    required: false,
    listVisible: true,
    queryVisible: false,
    formVisible: true,
    detailVisible: true,
    sortable: false,
    queryType: 'like',
    placeholder: `请输入${formLabel}`,
    ...overrides
  };
}
