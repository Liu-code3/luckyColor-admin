<script setup lang="ts">
import type { FormInst, FormRules, TreeOption } from 'naive-ui';
import { Icon } from '@iconify/vue';
import {
  createDepartmentApi,
  deleteDepartmentApi,
  getDepartmentDetailApi,
  getDepartmentPageApi,
  getDepartmentTreeApi,
  updateDepartmentApi,
  type DepartmentRecord,
  type DepartmentTreeRecord
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { confirmAction } from '@/utils/confirm';
import { message } from '@/utils/message';

interface DepartmentFormState {
  id: number | null;
  parentId: number | null;
  name: string;
  code: string;
  leader: string;
  phone: string;
  email: string;
  sort: number | null;
  status: boolean;
  remark: string;
}

const departmentButtonCodes = BUTTON_PERMISSION_CODES.systemDepartment;
const { hasPermission } = usePermission();

const loading = ref(false);
const treeLoading = ref(false);
const submitting = ref(false);
const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const keyword = ref('');
const departmentList = ref<DepartmentRecord[]>([]);
const departmentTree = ref<DepartmentTreeRecord[]>([]);

const departmentFormRef = ref<FormInst | null>(null);
const showDepartmentDrawer = ref(false);
const isEditMode = ref(false);
const editingDepartmentId = ref<number | null>(null);
const departmentForm = reactive<DepartmentFormState>({
  id: null,
  parentId: 0,
  name: '',
  code: '',
  leader: '',
  phone: '',
  email: '',
  sort: 0,
  status: true,
  remark: ''
});

const departmentFormRules: FormRules = {
  name: [
    {
      required: true,
      message: '请输入部门名称',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 30,
      message: '部门名称不能超过 30 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  code: [
    {
      required: true,
      message: '请输入部门编码',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-z0-9_]{2,30}$/.test(value),
      message: '部门编码需为 2-30 位小写字母、数字或下划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  phone: [
    {
      validator: (_, value: string) => !value || /^1\d{10}$/.test(value),
      message: '请输入 11 位手机号',
      trigger: [ 'blur', 'input' ]
    }
  ],
  email: [
    {
      validator: (_, value: string) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: '请输入正确的邮箱地址',
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

const departmentTreeOptions = computed<TreeOption[]>(() => [
  {
    key: 0,
    label: '顶级部门'
  },
  ...departmentTree.value.map(item => departmentToTreeOption(item))
]);
const canCreateDepartment = computed(() => hasPermission(departmentButtonCodes.create));
const canUpdateDepartment = computed(() => hasPermission(departmentButtonCodes.update));
const canDeleteDepartment = computed(() => hasPermission(departmentButtonCodes.delete));
const hasDepartmentActions = computed(() =>
  canCreateDepartment.value || canUpdateDepartment.value || canDeleteDepartment.value
);
const departmentTableColumnCount = computed(() => hasDepartmentActions.value ? 8 : 7);

const parentNameMap = computed(() => {
  const map = new Map<number, string>();

  const walk = (nodes: DepartmentTreeRecord[]) => {
    nodes.forEach((node) => {
      map.set(node.id, node.name);
      if (node.children?.length)
        walk(node.children);
    });
  };

  walk(departmentTree.value);
  return map;
});

function departmentToTreeOption(item: DepartmentTreeRecord): TreeOption {
  return {
    key: item.id,
    label: item.name,
    children: item.children?.map(departmentToTreeOption)
  };
}

function formatDateTime(value?: string | null) {
  if (!value)
    return '-';

  return new Date(value).toLocaleString('zh-CN', {
    hour12: false
  });
}

function resetDepartmentForm() {
  editingDepartmentId.value = null;
  departmentForm.id = null;
  departmentForm.parentId = 0;
  departmentForm.name = '';
  departmentForm.code = '';
  departmentForm.leader = '';
  departmentForm.phone = '';
  departmentForm.email = '';
  departmentForm.sort = 0;
  departmentForm.status = true;
  departmentForm.remark = '';
}

async function fetchDepartmentTree() {
  treeLoading.value = true;
  try {
    const { data } = await getDepartmentTreeApi();
    departmentTree.value = data;
  }
  finally {
    treeLoading.value = false;
  }
}

async function fetchDepartments(currentPage = page.value) {
  loading.value = true;

  try {
    const { data } = await getDepartmentPageApi({
      page: currentPage,
      size: pageSize.value,
      keyword: keyword.value.trim() || undefined
    });

    page.value = data.current;
    pageSize.value = data.size;
    total.value = data.total;
    departmentList.value = data.records;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchDepartments(1);
}

function handleReset() {
  keyword.value = '';
  page.value = 1;
  fetchDepartments(1);
}

function handlePageChange(currentPage: number) {
  page.value = currentPage;
  fetchDepartments(currentPage);
}

function handlePageSizeChange(size: number) {
  pageSize.value = size;
  page.value = 1;
  fetchDepartments(1);
}

function openCreateDrawer(parentId = 0) {
  isEditMode.value = false;
  resetDepartmentForm();
  departmentForm.parentId = parentId;
  showDepartmentDrawer.value = true;
}

async function openEditDrawer(department: DepartmentRecord) {
  isEditMode.value = true;
  resetDepartmentForm();
  editingDepartmentId.value = department.id;
  showDepartmentDrawer.value = true;

  const { data } = await getDepartmentDetailApi(department.id);
  departmentForm.id = data.id;
  departmentForm.parentId = data.pid;
  departmentForm.name = data.name;
  departmentForm.code = data.code;
  departmentForm.leader = data.leader || '';
  departmentForm.phone = data.phone || '';
  departmentForm.email = data.email || '';
  departmentForm.sort = data.sort;
  departmentForm.status = data.status;
  departmentForm.remark = data.remark || '';
}

function closeDepartmentDrawer() {
  showDepartmentDrawer.value = false;
  resetDepartmentForm();
  departmentFormRef.value?.restoreValidation();
}

async function submitDepartmentForm() {
  await departmentFormRef.value?.validate();

  if (isEditMode.value && editingDepartmentId.value !== null && departmentForm.parentId === editingDepartmentId.value) {
    message.error('不能选择自身作为上级部门');
    return;
  }

  const payload = {
    ...(departmentForm.id ? { id: departmentForm.id } : {}),
    parentId: departmentForm.parentId ?? 0,
    name: departmentForm.name.trim(),
    code: departmentForm.code.trim(),
    leader: departmentForm.leader.trim() || undefined,
    phone: departmentForm.phone.trim() || undefined,
    email: departmentForm.email.trim() || undefined,
    sort: Number(departmentForm.sort ?? 0),
    status: departmentForm.status,
    remark: departmentForm.remark.trim() || undefined
  };

  submitting.value = true;
  try {
    if (isEditMode.value && editingDepartmentId.value !== null) {
      await updateDepartmentApi(editingDepartmentId.value, {
        ...payload,
        remark: payload.remark ?? null,
        leader: payload.leader ?? null,
        phone: payload.phone ?? null,
        email: payload.email ?? null
      });
    }
    else {
      await createDepartmentApi(payload);
    }

    closeDepartmentDrawer();
    const nextPage = isEditMode.value ? page.value : 1;
    page.value = nextPage;
    await Promise.all([
      fetchDepartments(nextPage),
      fetchDepartmentTree()
    ]);
  }
  finally {
    submitting.value = false;
  }
}

async function handleDeleteDepartment(department: DepartmentRecord) {
  const confirmed = await confirmAction({
    title: '删除部门',
    content: `确认删除部门“${department.name}”吗？`
  });

  if (!confirmed)
    return;

  await deleteDepartmentApi(department.id);
  const nextPage = departmentList.value.length === 1 && page.value > 1 ? page.value - 1 : page.value;
  page.value = nextPage;
  await Promise.all([
    fetchDepartments(nextPage),
    fetchDepartmentTree()
  ]);
}

onMounted(() => {
  fetchDepartments();
  fetchDepartmentTree();
});
</script>

<template>
  <div class="department-page">
    <div class="toolbar">
      <div class="toolbar-item">
        <div class="toolbar-label">
          关键字
        </div>
        <n-input
          v-model:value="keyword"
          clearable
          placeholder="输入部门名称或编码"
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

    <div class="content-grid">
      <div class="tree-card">
        <div class="panel-title">
          部门树
        </div>
        <n-spin :show="treeLoading">
          <n-tree
            block-line
            default-expand-all
            key-field="id"
            label-field="name"
            :data="departmentTree"
          />
        </n-spin>
      </div>

      <div class="table-card">
        <div v-if="canCreateDepartment" class="content-actions">
          <n-button
            v-permission="departmentButtonCodes.create"
            type="primary"
            @click="openCreateDrawer()"
          >
            <template #icon>
              <Icon icon="material-symbols:add" />
            </template>
            新增部门
          </n-button>
        </div>

        <n-spin :show="loading">
          <n-table :bordered="false" :single-line="false">
            <thead>
              <tr>
                <th>部门名称</th>
                <th>上级部门</th>
                <th>负责人</th>
                <th>联系电话</th>
                <th>状态</th>
                <th>排序</th>
                <th>更新时间</th>
                <th v-if="hasDepartmentActions">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in departmentList" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.pid === 0 ? '顶级部门' : parentNameMap.get(item.pid) || item.pid }}</td>
                <td>{{ item.leader || '-' }}</td>
                <td>{{ item.phone || '-' }}</td>
                <td>
                  <n-tag :type="item.status ? 'success' : 'warning'">
                    {{ item.status ? '启用' : '停用' }}
                  </n-tag>
                </td>
                <td>{{ item.sort }}</td>
                <td>{{ formatDateTime(item.updatedAt) }}</td>
                <td v-if="hasDepartmentActions" class="operation-cell">
                  <n-button
                    v-if="canCreateDepartment"
                    v-permission="departmentButtonCodes.create"
                    quaternary
                    type="primary"
                    @click="openCreateDrawer(item.id)"
                  >
                    新增子部门
                  </n-button>
                  <n-button
                    v-if="canUpdateDepartment"
                    v-permission="departmentButtonCodes.update"
                    quaternary
                    type="primary"
                    @click="openEditDrawer(item)"
                  >
                    编辑
                  </n-button>
                  <n-button
                    v-if="canDeleteDepartment"
                    v-permission="departmentButtonCodes.delete"
                    quaternary
                    type="error"
                    @click="handleDeleteDepartment(item)"
                  >
                    删除
                  </n-button>
                </td>
              </tr>
              <tr v-if="!departmentList.length">
                <td :colspan="departmentTableColumnCount">
                  <n-empty description="暂无部门数据" />
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
  </div>

  <n-drawer v-model:show="showDepartmentDrawer" :width="560" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑部门' : '新增部门'">
      <n-form ref="departmentFormRef" :model="departmentForm" :rules="departmentFormRules" label-placement="top">
        <n-form-item label="上级部门" path="parentId">
          <n-tree-select
            v-model:value="departmentForm.parentId"
            clearable
            default-expand-all
            :options="departmentTreeOptions"
            placeholder="请选择上级部门"
          />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="部门名称" path="name">
            <n-input v-model:value="departmentForm.name" placeholder="请输入部门名称" />
          </n-form-item-gi>
          <n-form-item-gi label="部门编码" path="code">
            <n-input v-model:value="departmentForm.code" placeholder="请输入部门编码" />
          </n-form-item-gi>
          <n-form-item-gi label="负责人" path="leader">
            <n-input v-model:value="departmentForm.leader" placeholder="请输入负责人" />
          </n-form-item-gi>
          <n-form-item-gi label="联系电话" path="phone">
            <n-input v-model:value="departmentForm.phone" placeholder="请输入联系电话" />
          </n-form-item-gi>
          <n-form-item-gi label="联系邮箱" path="email">
            <n-input v-model:value="departmentForm.email" placeholder="请输入联系邮箱" />
          </n-form-item-gi>
          <n-form-item-gi label="排序" path="sort">
            <n-input-number v-model:value="departmentForm.sort" class="w-full" :min="0" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="状态" path="status">
          <n-switch v-model:value="departmentForm.status">
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
            v-model:value="departmentForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeDepartmentDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitDepartmentForm">
            保存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="less">
.department-page {
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

.content-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 12px;
}

.tree-card,
.table-card {
  min-height: calc(100vh - 236px);
  padding: 20px 24px;
  background-color: var(--primary-bgColor);
  border-radius: 8px;
}

.panel-title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 600;
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

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
