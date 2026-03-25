<script setup lang="ts">
import type { FormInst, FormRules } from 'naive-ui';
import { Icon } from '@iconify/vue';
import {
  assignUserRolesApi,
  createUserApi,
  deleteUserApi,
  getRolePageApi,
  getUserDetailApi,
  getUserPageApi,
  getUserRolesApi,
  updateUserApi,
  type RoleRecord,
  type UserRecord
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { confirmAction } from '@/utils/confirm';

interface UserFormState {
  username: string;
  password: string;
  nickname: string;
}

const userButtonCodes = BUTTON_PERMISSION_CODES.systemUser;
const { hasPermission } = usePermission();

const loading = ref(false);
const submitting = ref(false);
const assigning = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const userList = ref<UserRecord[]>([]);

const userFormRef = ref<FormInst | null>(null);
const showUserDrawer = ref(false);
const isEditMode = ref(false);
const editingUserId = ref('');
const userForm = reactive<UserFormState>({
  username: '',
  password: '',
  nickname: ''
});

const showAssignRoleModal = ref(false);
const selectedUser = ref<UserRecord | null>(null);
const roleOptions = ref<RoleRecord[]>([]);
const selectedRoleIds = ref<string[]>([]);
const canCreateUser = computed(() => hasPermission(userButtonCodes.create));
const canAssignUserRole = computed(() => hasPermission(userButtonCodes.assign));
const canUpdateUser = computed(() => hasPermission(userButtonCodes.update));
const canDeleteUser = computed(() => hasPermission(userButtonCodes.delete));
const hasUserActions = computed(() =>
  canAssignUserRole.value || canUpdateUser.value || canDeleteUser.value
);
const userTableColumnCount = computed(() => hasUserActions.value ? 5 : 4);

const userFormRules = computed<FormRules>(() => ({
  username: [
    {
      required: true,
      message: '请输入用户名',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-zA-Z0-9_]{3,20}$/.test(value),
      message: '用户名需为 3-20 位字母、数字或下划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  password: [
    {
      required: !isEditMode.value,
      message: '请输入密码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => !value || value.trim().length >= 6,
      message: '密码至少 6 位',
      trigger: [ 'blur', 'input' ]
    }
  ],
  nickname: [
    {
      validator: (_, value: string) => !value || value.trim().length <= 20,
      message: '昵称不能超过 20 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ]
}));

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function resetUserForm() {
  editingUserId.value = '';
  userForm.username = '';
  userForm.password = '';
  userForm.nickname = '';
}

async function fetchUsers(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getUserPageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    userList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

async function loadRoleOptions() {
  if (roleOptions.value.length)
    return;

  const { data } = await getRolePageApi({
    page: 1,
    size: 200
  });
  roleOptions.value = data.records;
}

function handleSearch() {
  page.value = 1;
  fetchUsers(1);
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  fetchUsers(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchUsers(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchUsers(1);
}

function openCreateDrawer() {
  isEditMode.value = false;
  resetUserForm();
  showUserDrawer.value = true;
}

async function openEditDrawer(user: UserRecord) {
  isEditMode.value = true;
  resetUserForm();
  editingUserId.value = user.id;
  showUserDrawer.value = true;

  const { data } = await getUserDetailApi(user.id);
  userForm.username = data.username;
  userForm.nickname = data.nickname || '';
}

function closeUserDrawer() {
  showUserDrawer.value = false;
  resetUserForm();
  userFormRef.value?.restoreValidation();
}

async function submitUserForm() {
  await userFormRef.value?.validate();

  const payload = {
    username: userForm.username.trim(),
    nickname: userForm.nickname.trim() || undefined,
    ...(userForm.password.trim() ? { password: userForm.password.trim() } : {})
  };

  submitting.value = true;
  try {
    if (isEditMode.value) {
      await updateUserApi(editingUserId.value, payload);
    }
    else {
      await createUserApi(payload as Required<Pick<UserFormState, 'username' | 'password'>> & Pick<UserFormState, 'nickname'>);
    }

    closeUserDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await fetchUsers(nextPage);
  }
  finally {
    submitting.value = false;
  }
}

async function handleDeleteUser(user: UserRecord) {
  const confirmed = await confirmAction({
    title: '删除用户',
    content: `确认删除用户“${user.username}”吗？`
  });

  if (!confirmed)
    return;

  await deleteUserApi(user.id);
  const nextPage = userList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await fetchUsers(nextPage);
}

async function openAssignRole(user: UserRecord) {
  selectedUser.value = user;
  showAssignRoleModal.value = true;
  await loadRoleOptions();
  const { data } = await getUserRolesApi(user.id);
  selectedRoleIds.value = data.roleIds;
}

function closeAssignRole() {
  showAssignRoleModal.value = false;
  selectedUser.value = null;
  selectedRoleIds.value = [];
}

async function submitAssignRole() {
  if (!selectedUser.value)
    return;

  assigning.value = true;
  try {
    await assignUserRolesApi(selectedUser.value.id, selectedRoleIds.value);
    closeAssignRole();
  }
  finally {
    assigning.value = false;
  }
}

onMounted(() => {
  fetchUsers();
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
          placeholder="输入用户名或昵称"
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
          v-if="canCreateUser"
          v-permission="userButtonCodes.create"
          type="primary"
          @click="openCreateDrawer"
        >
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增用户
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-table :bordered="false" :single-line="false">
          <thead>
            <tr>
              <th>用户名</th>
              <th>昵称</th>
              <th>创建时间</th>
              <th>更新时间</th>
              <th v-if="hasUserActions">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in userList" :key="item.id">
              <td>{{ item.username }}</td>
              <td>{{ item.nickname || '-' }}</td>
              <td>{{ formatDateTime(item.createdAt) }}</td>
              <td>{{ formatDateTime(item.updatedAt) }}</td>
              <td v-if="hasUserActions" class="operation-cell">
                <n-button
                  v-if="canAssignUserRole"
                  v-permission="userButtonCodes.assign"
                  quaternary
                  type="primary"
                  @click="openAssignRole(item)"
                >
                  分配角色
                </n-button>
                <n-button
                  v-if="canUpdateUser"
                  v-permission="userButtonCodes.update"
                  quaternary
                  type="primary"
                  @click="openEditDrawer(item)"
                >
                  编辑
                </n-button>
                <n-button
                  v-if="canDeleteUser"
                  v-permission="userButtonCodes.delete"
                  quaternary
                  type="error"
                  @click="handleDeleteUser(item)"
                >
                  删除
                </n-button>
              </td>
            </tr>
            <tr v-if="!userList.length">
              <td :colspan="userTableColumnCount">
                <n-empty description="暂无用户数据" />
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

  <n-modal v-model:show="showAssignRoleModal" preset="card" title="分配角色" style="width: 560px;">
    <div class="assign-summary">
      当前用户：{{ selectedUser?.nickname || selectedUser?.username || '-' }}
    </div>

    <n-spin :show="assigning">
      <n-checkbox-group v-model:value="selectedRoleIds">
        <n-space vertical>
          <n-checkbox
            v-for="role in roleOptions"
            :key="role.id"
            :value="role.id"
            :label="`${role.name}（${role.code}）`"
          />
        </n-space>
      </n-checkbox-group>
    </n-spin>

    <template #footer>
      <div class="modal-footer">
        <n-button @click="closeAssignRole">
          取消
        </n-button>
        <n-button type="primary" :loading="assigning" @click="submitAssignRole">
          保存
        </n-button>
      </div>
    </template>
  </n-modal>

  <n-drawer v-model:show="showUserDrawer" :width="520" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑用户' : '新增用户'">
      <n-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-placement="top">
        <n-form-item label="用户名" path="username">
          <n-input v-model:value="userForm.username" placeholder="请输入用户名" />
        </n-form-item>
        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="userForm.password"
            type="password"
            show-password-on="click"
            :placeholder="isEditMode ? '留空则不修改密码' : '请输入密码'"
          />
        </n-form-item>
        <n-form-item label="昵称" path="nickname">
          <n-input v-model:value="userForm.nickname" placeholder="请输入昵称" />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeUserDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitUserForm">
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
