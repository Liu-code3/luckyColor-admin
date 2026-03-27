# 代码生成器页面字段梳理

## 1. 数据表列表区

用于选择当前要生成的业务表。

字段建议：

- `tableName`
  数据表名，例如 `sys_user`
- `tableComment`
  表中文说明，例如 `用户管理`
- `moduleName`
  所属业务模块，例如 `system`
- `businessName`
  业务标识，例如 `user`
- `className`
  生成后的主实体名，例如 `User`
- `packageName`
  代码命名空间或前端落地目录，例如 `src/views/system/user`
- `scene`
  页面场景，例如 `管理后台`、`租户中心`
- `status`
  当前生成准备状态，例如 `ready`、`draft`
- `updatedAt`
  最近更新时间

## 2. 表级基础配置区

用于补齐生成模板的业务上下文。

字段建议：

- `author`
  代码作者
- `moduleName`
  所属模块
- `businessName`
  业务英文标识
- `className`
  实体或页面主名
- `apiPrefix`
  接口前缀，例如 `/users`
- `routePath`
  页面路由，例如 `/system/user`
- `componentPath`
  页面组件路径，例如 `system/user/index`
- `permissionPrefix`
  按钮权限前缀，例如 `system:user`
- `templateType`
  模板类型，例如 `crud`、`tree`、`master-detail`
- `remark`
  备注或生成说明

## 3. 字段配置列表区

用于控制字段在列表、表单、查询和详情中的表现。

字段建议：

- `columnName`
  数据库字段名
- `columnComment`
  字段说明
- `dbType`
  数据库字段类型，例如 `varchar(64)`
- `tsType`
  推导出的前端类型，例如 `string`
- `propertyName`
  前端属性名，例如 `username`
- `formLabel`
  表单标签
- `component`
  表单控件类型，例如 `input`、`select`、`switch`
- `dictType`
  关联字典标识，可为空
- `required`
  是否必填
- `listVisible`
  是否出现在列表页
- `queryVisible`
  是否出现在查询区
- `formVisible`
  是否出现在新增编辑表单
- `detailVisible`
  是否出现在详情区
- `sortable`
  是否支持排序
- `queryType`
  查询类型，例如 `eq`、`like`、`between`
- `placeholder`
  表单提示语
- `defaultValue`
  默认值
- `example`
  示例值

## 4. 模板类型区

用于决定页面和文件的生成方式。

建议类型：

- `crud`
  标准列表 + 新增编辑表单
- `tree`
  左树右表结构
- `master-detail`
  主子表结构
- `form`
  纯表单配置页

## 5. 代码预览区

用于展示本次生成的主要文件。

建议输出：

- `index.vue`
  列表页或表单页主文件
- `api.ts`
  接口封装
- `types.ts`
  类型声明
- `schema.ts`
  字段配置摘要
- `README.md`
  使用说明与风险备注

## 6. 下载与风险提示

建议页面保留以下提示信息：

- 代码生成结果仅作为业务骨架，不应直接覆盖生产文件
- 下载前应核对模块名、路由、权限前缀和字段显隐规则
- 字典字段、联表字段和复杂业务校验仍需人工补齐
