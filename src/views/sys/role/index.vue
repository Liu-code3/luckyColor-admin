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
const selectedRole = ref<RoleRecord | null>(null);
const checkedMenuIds = ref<Array<string | number>>([]);
const menuTreeOptions = ref<TreeOption[]>([]);
const canCreateRole = computed(() => hasPermission(roleButtonCodes.create));
const canGrantRoleMenu = computed(() => hasPermission(roleButtonCodes.grant));
const canUpdateRole = computed(() => hasPermission(roleButtonCodes.update));
const canDeleteRole = computed(() => hasPermission(roleButtonCodes.delete));
const hasRoleActions = computed(() =>
  canGrantRoleMenu.value || canUpdateRole.value || canDeleteRole.value
);
const roleTableColumnCount = computed(() => hasRoleActions.value ? 7 : 6);

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

async function ensureMenuTreeOptions() {
  if (menuTreeOptions.value.length)
    return;

  const { data } = await getMenuTreeApi();
  menuTreeOptions.value = data.map(menuToTreeOption);
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
  await ensureMenuTreeOptions();
  const { data } = await getRoleMenusApi(role.id);
  checkedMenuIds.value = data.menuIds;
}

function closeAssignMenu() {
  showAssignMenuModal.value = false;
  selectedRole.value = null;
  checkedMenuIds.value = [];
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

    <n-spin :show="assigning">
      <n-tree
        v-model:checked-keys="checkedMenuIds"
        block-line
        cascade
        checkable
        check-on-click
        expand-on-click
        default-expand-all
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

.modal-footer,
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
