<script setup lang="ts">
import type { FormInst, FormRules, TreeOption } from 'naive-ui';
import { Icon } from '@iconify/vue';
import {
  assignRoleMenusApi,
  createRoleApi,
  deleteRoleApi,
  getMenuTreeApi,
  getRoleDetailApi,
  getRoleMenusApi,
  getRolePageApi,
  updateRoleApi,
  type MenuRecord,
  type RoleRecord
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { confirmAction } from '@/utils/confirm';

interface RoleFormState {
  name: string;
  code: string;
  sort: number | null;
  status: boolean;
  remark: string;
}

const roleButtonCodes = BUTTON_PERMISSION_CODES.systemRole;
const { hasPermission } = usePermission();

const loading = ref(false);
const submitting = ref(false);
const assigning = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const roleList = ref<RoleRecord[]>([]);

const roleFormRef = ref<FormInst | null>(null);
const showRoleDrawer = ref(false);
const isEditMode = ref(false);
const editingRoleId = ref('');
const roleForm = reactive<RoleFormState>({
  name: '',
  code: '',
  sort: 0,
  status: true,
  remark: ''
});

const roleFormRules: FormRules = {
  name: [
    {
      required: true,
      message: '请输入角色名称',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 30,
      message: '角色名称不能超过 30 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  code: [
    {
      required: true,
      message: '请输入角色编码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-z0-9_]{2,30}$/.test(value),
      message: '角色编码需为 2-30 位小写字母、数字或下划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  remark: [
    {
      validator: (_, value: string) => !value || value.trim().length <= 100,
      message: '备注不能超过 100 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ]
};

const showAssignMenuModal = ref(false);
const showAssignButtonModal = ref(false);
const selectedRole = ref<RoleRecord | null>(null);
const checkedMenuIds = ref<Array<string | number>>([]);
const checkedButtonIds = ref<Array<string | number>>([]);
const assignMenuKeyword = ref('');
const assignButtonKeyword = ref('');
const expandedMenuKeys = ref<Array<string | number>>([]);
const expandedButtonKeys = ref<Array<string | number>>([]);
const rawRoleMenuTree = ref<MenuRecord[]>([]);
const rawRoleButtonTree = ref<MenuRecord[]>([]);
const buttonTreeLoading = ref(false);
const canCreateRole = computed(() => hasPermission(roleButtonCodes.create));
const canGrantRoleMenu = computed(() => hasPermission(roleButtonCodes.grant));
const canUpdateRole = computed(() => hasPermission(roleButtonCodes.update));
const canDeleteRole = computed(() => hasPermission(roleButtonCodes.delete));
const hasRoleActions = computed(() =>
  canGrantRoleMenu.value || canUpdateRole.value || canDeleteRole.value
);
const roleTableColumnCount = computed(() => hasRoleActions.value ? 7 : 6);
const menuTreeOptions = computed<TreeOption[]>(() =>
  filterRoleMenuTreeByKeyword(rawRoleMenuTree.value, assignMenuKeyword.value).map(menuToTreeOption)
);
const buttonTreeOptions = computed<TreeOption[]>(() =>
  filterRoleButtonTreeByKeyword(rawRoleButtonTree.value, assignButtonKeyword.value).map(buttonToTreeOption)
);
const roleMenuIdSet = computed(() => new Set(collectRoleMenuIds(rawRoleMenuTree.value)));
const roleButtonIdSet = computed(() => new Set(collectRoleButtonIds(rawRoleButtonTree.value)));
const roleButtonCodeMap = computed(() => collectRoleButtonCodeMap(rawRoleButtonTree.value));
const roleMenuTreeStats = computed(() => countRoleMenuStats(rawRoleMenuTree.value));
const roleButtonTreeStats = computed(() => countRoleButtonStats(rawRoleButtonTree.value));
const checkedRoleMenuCount = computed(() =>
  checkedMenuIds.value.filter(item => roleMenuIdSet.value.has(Number(item))).length
);
const checkedRoleButtonCount = computed(() =>
  checkedButtonIds.value.filter(item => roleButtonIdSet.value.has(Number(item))).length
);
const checkedRoleButtonCodeList = computed(() =>
  checkedButtonIds.value
    .map(item => roleButtonCodeMap.value.get(Number(item)))
    .filter((code): code is string => Boolean(code))
);

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function menuToTreeOption(menu: MenuRecord): TreeOption {
  return {
    key: menu.id,
    label: `${menu.title} (${menu.path})`,
    children: menu.children?.map(menuToTreeOption)
  };
}

function buttonToTreeOption(menu: MenuRecord): TreeOption {
  const permissionKey = menu.key || menu.menuKey || '';

  if (menu.type === 3) {
    return {
      key: menu.id,
      label: permissionKey ? `${menu.title} (${permissionKey})` : menu.title
    };
  }

  return {
    key: menu.id,
    label: `${menu.title} (${menu.path})`,
    checkboxDisabled: true,
    children: menu.children?.map(buttonToTreeOption)
  };
}

async function ensureMenuTreeOptions() {
  if (rawRoleMenuTree.value.length)
    return;

  const { data } = await getMenuTreeApi();
  rawRoleMenuTree.value = filterAssignableRoleMenus(data);
}

async function ensureButtonTreeOptions() {
  if (rawRoleButtonTree.value.length)
    return;

  const { data } = await getMenuTreeApi();
  rawRoleButtonTree.value = filterAssignableRoleButtons(data);
}

function filterAssignableRoleMenus(menus: MenuRecord[]) {
  return menus.reduce<MenuRecord[]>((result, menu) => {
    if (menu.type === 3)
      return result;

    result.push({
      ...menu,
      children: menu.children ? filterAssignableRoleMenus(menu.children) : []
    });
    return result;
  }, []);
}

function filterRoleMenuTreeByKeyword(menus: MenuRecord[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword)
    return menus;

  return menus.reduce<MenuRecord[]>((result, menu) => {
    const children = menu.children
      ? filterRoleMenuTreeByKeyword(menu.children, normalizedKeyword)
      : [];
    const matched = [
      menu.title,
      menu.name,
      menu.path,
      menu.key,
      menu.menuKey
    ].some(value => value?.toLowerCase().includes(normalizedKeyword));

    if (matched || children.length) {
      result.push({
        ...menu,
        children
      });
    }

    return result;
  }, []);
}

function filterAssignableRoleButtons(menus: MenuRecord[]) {
  return menus.reduce<MenuRecord[]>((result, menu) => {
    const children = menu.children ? filterAssignableRoleButtons(menu.children) : [];
    if (menu.type !== 3 && !children.length)
      return result;

    result.push({
      ...menu,
      children
    });
    return result;
  }, []);
}

function filterRoleButtonTreeByKeyword(menus: MenuRecord[], keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword)
    return menus;

  return menus.reduce<MenuRecord[]>((result, menu) => {
    const children = menu.children
      ? filterRoleButtonTreeByKeyword(menu.children, normalizedKeyword)
      : [];
    const matched = [
      menu.title,
      menu.name,
      menu.path,
      menu.key,
      menu.menuKey
    ].some(value => value?.toLowerCase().includes(normalizedKeyword));

    if (matched || children.length) {
      result.push({
        ...menu,
        children
      });
    }

    return result;
  }, []);
}

function collectRoleMenuIds(menus: MenuRecord[]) {
  return menus.flatMap(menu => [
    menu.id,
    ...(menu.children ? collectRoleMenuIds(menu.children) : [])
  ]);
}

function collectRoleButtonIds(menus: MenuRecord[]) {
  return menus.flatMap(menu => [
    ...(menu.type === 3 ? [ menu.id ] : []),
    ...(menu.children ? collectRoleButtonIds(menu.children) : [])
  ]);
}

function collectRoleButtonCodeMap(menus: MenuRecord[]) {
  return menus.reduce((map, menu) => {
    if (menu.type === 3) {
      const permissionKey = menu.key || menu.menuKey;
      if (permissionKey)
        map.set(menu.id, permissionKey);
    }

    if (menu.children?.length) {
      collectRoleButtonCodeMap(menu.children).forEach((value, key) => {
        map.set(key, value);
      });
    }

    return map;
  }, new Map<number, string>());
}

function countRoleMenuStats(menus: MenuRecord[]) {
  return menus.reduce(
    (stats, menu) => {
      if (menu.type === 1)
        stats.directoryCount += 1;
      else if (menu.type === 2)
        stats.menuCount += 1;

      if (menu.children?.length) {
        const childStats = countRoleMenuStats(menu.children);
        stats.directoryCount += childStats.directoryCount;
        stats.menuCount += childStats.menuCount;
      }

      return stats;
    },
    { directoryCount: 0, menuCount: 0 }
  );
}

function countRoleButtonStats(menus: MenuRecord[]) {
  return menus.reduce(
    (stats, menu) => {
      if (menu.type === 3)
        stats.buttonCount += 1;
      else
        stats.groupCount += 1;

      if (menu.children?.length) {
        const childStats = countRoleButtonStats(menu.children);
        stats.groupCount += childStats.groupCount;
        stats.buttonCount += childStats.buttonCount;
      }

      return stats;
    },
    { groupCount: 0, buttonCount: 0 }
  );
}

function collectExpandedTreeKeys(options: TreeOption[]) {
  return options.flatMap(option => [
    option.key!,
    ...(option.children?.length ? collectExpandedTreeKeys(option.children) : [])
  ]);
}

function expandAllMenus() {
  expandedMenuKeys.value = collectExpandedTreeKeys(menuTreeOptions.value);
}

function collapseAllMenus() {
  expandedMenuKeys.value = [];
}

function clearCheckedMenus() {
  checkedMenuIds.value = [];
}

function expandAllButtons() {
  expandedButtonKeys.value = collectExpandedTreeKeys(buttonTreeOptions.value);
}

function collapseAllButtons() {
  expandedButtonKeys.value = [];
}

function clearCheckedButtons() {
  checkedButtonIds.value = [];
}

function resetRoleForm() {
  editingRoleId.value = '';
  roleForm.name = '';
  roleForm.code = '';
  roleForm.sort = 0;
  roleForm.status = true;
  roleForm.remark = '';
}

async function fetchRoles(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getRolePageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    roleList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchRoles(1);
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  fetchRoles(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchRoles(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchRoles(1);
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetRoleForm();
  showRoleDrawer.value = true;
}

async function openEditDrawer(role: RoleRecord) {
  isEditMode.value = true;
  resetRoleForm();
  editingRoleId.value = role.id;
  showRoleDrawer.value = true;

  const { data } = await getRoleDetailApi(role.id);
  roleForm.name = data.name;
  roleForm.code = data.code;
  roleForm.sort = data.sort;
  roleForm.status = data.status;
  roleForm.remark = data.remark || '';
}

function closeRoleDrawer() {
  showRoleDrawer.value = false;
  resetRoleForm();
  roleFormRef.value?.restoreValidation();
}

async function submitRoleForm() {
  await roleFormRef.value?.validate();

  const payload = {
    name: roleForm.name.trim(),
    code: roleForm.code.trim(),
    sort: Number(roleForm.sort ?? 0),
    status: roleForm.status,
    remark: roleForm.remark.trim() || undefined
  };

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateRoleApi(editingRoleId.value, {
        ...payload,
        remark: payload.remark ?? null
      });
    }
    else {
      await createRoleApi(payload);
    }

    closeRoleDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await fetchRoles(nextPage);
  }
  finally {
    submitting.value = false;
  }
}

async function handleDeleteRole(role: RoleRecord) {
  const confirmed = await confirmAction({
    title: '删除角色',
    content: `确认删除角色“${role.name}”吗？`
  });

  if (!confirmed)
    return;

  await deleteRoleApi(role.id);
  const nextPage = roleList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await fetchRoles(nextPage);
}

async function openAssignMenu(role: RoleRecord) {
  selectedRole.value = role;
  showAssignMenuModal.value = true;
  assignMenuKeyword.value = '';
  await ensureMenuTreeOptions();
  const { data } = await getRoleMenusApi(role.id);
  checkedMenuIds.value = data.menuIds.filter(item => roleMenuIdSet.value.has(item));
  expandAllMenus();
}

async function openAssignButton(role: RoleRecord) {
  selectedRole.value = role;
  showAssignButtonModal.value = true;
  assignButtonKeyword.value = '';
  buttonTreeLoading.value = true;
  try {
    await ensureButtonTreeOptions();
    const { data } = await getRoleMenusApi(role.id);
    const checkedIds = new Set<number>([
      ...data.menuIds.filter(item => roleButtonIdSet.value.has(item)),
      ...data.menus.filter(item => item.type === 3).map(item => item.id)
    ]);
    checkedButtonIds.value = [ ...checkedIds ];
    expandAllButtons();
  }
  finally {
    buttonTreeLoading.value = false;
  }
}

function closeAssignMenu() {
  showAssignMenuModal.value = false;
  selectedRole.value = null;
  assignMenuKeyword.value = '';
  expandedMenuKeys.value = [];
  checkedMenuIds.value = [];
}

function closeAssignButton() {
  showAssignButtonModal.value = false;
  selectedRole.value = null;
  assignButtonKeyword.value = '';
  expandedButtonKeys.value = [];
  checkedButtonIds.value = [];
}

async function submitAssignMenu() {
  if (!selectedRole.value)
    return;

  assigning.value = true;
  try {
    await assignRoleMenusApi(
      selectedRole.value.id,
      checkedMenuIds.value.map(item => Number(item))
    );
    closeAssignMenu();
  }
  finally {
    assigning.value = false;
  }
}

onMounted(() => {
  fetchRoles();
});

watch(menuTreeOptions, (options) => {
  if (!showAssignMenuModal.value)
    return;

  expandedMenuKeys.value = collectExpandedTreeKeys(options);
});

watch(buttonTreeOptions, (options) => {
  if (!showAssignButtonModal.value)
    return;

  expandedButtonKeys.value = collectExpandedTreeKeys(options);
});
</script>

<template>
  <div class="crud-page">
    <div class="toolbar">
      <div class="toolbar-item">
        <div class="toolbar-label">
          关键字
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入角色名称或编码"
          @keyup.enter="handleSearch"
        />
      </div>

      <n-button type="primary" @click="handleSearch">
        <template #icon>
          <Icon icon="simple-line-icons:magnifier" />
        </template>
        查询
      </n-button>
      <n-button ghost type="primary" @click="handleReset">
        <template #icon>
          <Icon icon="system-uicons:reset" />
        </template>
        重置
      </n-button>
    </div>

    <div class="content-card">
      <div class="content-actions">
        <n-button
          v-if="canCreateRole"
          v-permission="roleButtonCodes.create"
          type="primary"
          @click="openCreateDrawer"
        >
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增角色
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>角色编码</th>
              <th>状态</th>
              <th>排序</th>
              <th>备注</th>
              <th>更新时间</th>
              <th v-if="hasRoleActions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in roleList" :key="item.id">
              <td>{{ item.name }}</td>
              <td>{{ item.code }}</td>
              <td>
                <n-tag :type="item.status ? 'success' : 'warning'">
                  {{ item.status ? '启用' : '停用' }}
                </n-tag>
              </td>
              <td>{{ item.sort }}</td>
              <td>{{ item.remark || '-' }}</td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td v-if="hasRoleActions" class="operation-cell">
                <n-button
                  v-if="canGrantRoleMenu"
                  v-permission="roleButtonCodes.grant"
                  quaternary
                  type="primary"
                  @click="openAssignMenu(item)"
                >
                  分配菜单
                </n-button>
                <n-button
                  v-if="canGrantRoleMenu"
                  v-permission="roleButtonCodes.grant"
                  quaternary
                  type="primary"
                  @click="openAssignButton(item)"
                >
                  按钮权限
                </n-button>
                <n-button
                  v-if="canUpdateRole"
                  v-permission="roleButtonCodes.update"
                  quaternary
                  type="primary"
                  @click="openEditDrawer(item)"
                >
                  编辑
                </n-button>
                <n-button
                  v-if="canDeleteRole"
                  v-permission="roleButtonCodes.delete"
                  quaternary
                  type="error"
                  @click="handleDeleteRole(item)"
                >
                  删除
                </n-button>
              </td>
            </tr>
            <tr v-if="!roleList.length">
              <td :colspan="roleTableColumnCount">
                <n-empty description="暂无角色数据" />
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-spin>

      <div class="pagination-wrap">
        <n-pagination
          v-model:page="page"
          v-model:page-size="pageSize"
          show-size-picker
          :item-count="total"
          :page-sizes="[10, 20, 50, 100]"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </div>
  </div>

  <n-modal v-model:show="showAssignMenuModal" preset="card" title="分配菜单" style="width: 720px;">
    <div class="assign-summary">
      当前角色：{{ selectedRole?.name || '-' }}
    </div>

    <div class="assign-panel">
      <div class="assign-panel__toolbar">
        <n-input
          v-model:value="assignMenuKeyword"
          clearable
          placeholder="搜索菜单名称、路由名称或访问路径"
        >
          <template #prefix>
            <Icon icon="simple-line-icons:magnifier" />
          </template>
        </n-input>
        <n-button quaternary type="primary" @click="expandAllMenus">
          展开全部
        </n-button>
        <n-button quaternary @click="collapseAllMenus">
          收起全部
        </n-button>
        <n-button quaternary type="warning" @click="clearCheckedMenus">
          清空勾选
        </n-button>
      </div>

      <div class="assign-panel__stats">
        <n-tag type="info">
          目录 {{ roleMenuTreeStats.directoryCount }}
        </n-tag>
        <n-tag type="success">
          菜单 {{ roleMenuTreeStats.menuCount }}
        </n-tag>
        <n-tag type="primary">
          已选 {{ checkedRoleMenuCount }}
        </n-tag>
      </div>
    </div>

    <n-spin :show="assigning">
      <n-tree
        v-model:checked-keys="checkedMenuIds"
        v-model:expanded-keys="expandedMenuKeys"
        block-line
        cascade
        checkable
        check-on-click
        expand-on-click
        :data="menuTreeOptions"
      />
    </n-spin>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="closeAssignMenu">
          取消
        </n-button>
        <n-button type="primary" :loading="assigning" @click="submitAssignMenu">
          保存
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-modal v-model:show="showAssignButtonModal" preset="card" title="按钮权限树" style="width: 760px;">
    <div class="assign-summary">
      当前角色：{{ selectedRole?.name || '-' }}
    </div>

    <div class="assign-panel">
      <div class="assign-panel__toolbar">
        <n-input
          v-model:value="assignButtonKeyword"
          clearable
          placeholder="搜索按钮名称、权限标识或所属路径"
        >
          <template #prefix>
            <Icon icon="simple-line-icons:magnifier" />
          </template>
        </n-input>
        <n-button quaternary type="primary" @click="expandAllButtons">
          展开全部
        </n-button>
        <n-button quaternary @click="collapseAllButtons">
          收起全部
        </n-button>
        <n-button quaternary type="warning" @click="clearCheckedButtons">
          清空勾选
        </n-button>
      </div>

      <div class="assign-panel__stats">
        <n-tag type="info">
          分组 {{ roleButtonTreeStats.groupCount }}
        </n-tag>
        <n-tag type="success">
          按钮 {{ roleButtonTreeStats.buttonCount }}
        </n-tag>
        <n-tag type="primary">
          已选 {{ checkedRoleButtonCount }}
        </n-tag>
      </div>
    </div>

    <div class="assign-hint">
      当前步骤先提供角色按钮权限树浏览与勾选，保存逻辑将在后续 `B4-07` 接入。
    </div>

    <n-spin :show="buttonTreeLoading">
      <template v-if="buttonTreeOptions.length">
        <n-tree
          v-model:checked-keys="checkedButtonIds"
          v-model:expanded-keys="expandedButtonKeys"
          block-line
          cascade
          checkable
          check-on-click
          expand-on-click
          :data="buttonTreeOptions"
        />
      </template>
      <n-empty v-else description="暂无可分配的按钮权限节点" />
    </n-spin>

    <div v-if="checkedRoleButtonCodeList.length" class="checked-code-panel">
      <div class="checked-code-panel__title">
        已选权限码预览
      </div>
      <n-space>
        <n-tag v-for="code in checkedRoleButtonCodeList.slice(0, 12)" :key="code" type="warning">
          {{ code }}
        </n-tag>
      </n-space>
      <div v-if="checkedRoleButtonCodeList.length > 12" class="checked-code-panel__more">
        仅预览前 12 项，当前共 {{ checkedRoleButtonCodeList.length }} 项。
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="closeAssignButton">
          关闭
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-drawer v-model:show="showRoleDrawer" :width="520" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑角色' : '新增角色'">
      <n-form ref="roleFormRef" :model="roleForm" :rules="roleFormRules" label-placement="top">
        <n-form-item label="角色名称" path="name">
          <n-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
        </n-form-item>
        <n-form-item label="角色编码" path="code">
          <n-input v-model:value="roleForm.code" placeholder="请输入角色编码" />
        </n-form-item>
        <n-form-item label="排序" path="sort">
          <n-input-number v-model:value="roleForm.sort" class="w-full" :min="0" />
        </n-form-item>
        <n-form-item label="状态" path="status">
          <n-switch v-model:value="roleForm.status">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              停用
            </template>
          </n-switch>
        </n-form-item>
        <n-form-item label="备注" path="remark">
          <n-input
            v-model:value="roleForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeRoleDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitRoleForm">
            保存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="less">
.crud-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
}

.toolbar-item {
  display: flex;
  align-items: center;
  width: 360px;
}

.toolbar-label {
  width: 72px;
  flex-shrink: 0;
}

.content-card {
  min-height: calc(100vh - 236px);
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
}

.content-actions {
  margin-bottom: 16px;
}

.operation-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.assign-summary {
  margin-bottom: 16px;
  color: var(--text-color-2);
}

.assign-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.assign-panel__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.assign-panel__toolbar :deep(.n-input) {
  flex: 1;
}

.assign-panel__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.assign-hint {
  margin-bottom: 16px;
  padding: 12px 14px;
  color: var(--text-color-2);
  background-color: var(--table-color-hover);
  border-radius: 8px;
}

.checked-code-panel {
  margin-top: 16px;
  padding: 14px 16px;
  background-color: var(--table-color-hover);
  border-radius: 8px;
}

.checked-code-panel__title {
  margin-bottom: 12px;
  font-weight: 600;
}

.checked-code-panel__more {
  margin-top: 12px;
  color: var(--text-color-2);
}

.modal-footer,
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .assign-panel__toolbar {
    flex-wrap: wrap;
  }
}
</style>
