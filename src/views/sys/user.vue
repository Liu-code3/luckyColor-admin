<script setup lang="ts">
import { useMessage } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { getUserPageApi, type UserRecord } from '@/api';

const message = useMessage();

const loading = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const userList = ref<UserRecord[]>([]);

const showAssignRoleModal = ref(false);
const showCreateDrawer = ref(false);
const selectedUser = ref<UserRecord | null>(null);

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

function openAssignRole(user: UserRecord) {
  selectedUser.value = user;
  showAssignRoleModal.value = true;
}

function closeAssignRole() {
  showAssignRoleModal.value = false;
  selectedUser.value = null;
}

function openCreateDrawer() {
  showCreateDrawer.value = true;
}

function closeCreateDrawer() {
  showCreateDrawer.value = false;
}

function showPendingMessage(action: string) {
  message.info(`${action}功能待下一任务块实现`);
}

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="user-page">
    <div class="toolbar">
      <div class="toolbar-item">
        <div class="toolbar-label">
          关键词
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入账号或昵称"
          @keyup.enter="handleSearch"
        />
      </div>

      <n-button type="primary" class="mr-10px" @click="handleSearch">
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
        <n-button type="primary" class="mr-10px" @click="openCreateDrawer">
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
              <th>账号</th>
              <th>昵称</th>
              <th>创建时间</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in userList" :key="item.id">
            <td>{{ item.username }}</td>
            <td>{{ item.nickname || '-' }}</td>
            <td>{{ item.createdAt || '-' }}</td>
            <td>{{ item.updatedAt || '-' }}</td>
            <td class="operation-cell">
              <n-button quaternary type="primary" @click="openAssignRole(item)">
                分配角色
              </n-button>
              <n-button quaternary type="primary" @click="showPendingMessage('重置密码')">
                重置密码
              </n-button>
              <n-button quaternary type="error" @click="showPendingMessage('删除用户')">
                删除
              </n-button>
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

  <n-modal v-model:show="showAssignRoleModal">
    <n-card
      style="width: 520px"
      title="分配角色"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <div class="modal-row">
        <span class="modal-label">当前用户</span>
        <span>{{ selectedUser?.nickname || selectedUser?.username || '-' }}</span>
      </div>
      <div class="modal-row">
        <span class="modal-label">任务状态</span>
        <span>该功能待下一任务块继续实现</span>
      </div>
      <template #footer>
        <div class="modal-footer">
          <n-button type="primary" @click="closeAssignRole">
            我知道了
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>

  <n-drawer v-model:show="showCreateDrawer" :width="520" placement="right">
    <n-drawer-content title="新增用户">
      <n-alert type="info" :show-icon="false">
        当前任务块只完成用户列表查询，对话框表单提交会在后续小任务里继续补齐。
      </n-alert>
      <template #footer>
        <n-button @click="closeCreateDrawer">
          关闭
        </n-button>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="less">
.user-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
}

.toolbar-item {
  display: flex;
  align-items: center;
  width: 360px;
  margin-right: 16px;
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
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.modal-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-label {
  width: 72px;
  color: #666;
  flex-shrink: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
