<script setup lang="ts">
import type { DataTableColumns, FormInst, FormRules, TreeOption } from 'naive-ui';
import { NButton, NSpace, NTag, useMessage } from 'naive-ui';
import { Icon } from '@iconify/vue';
import { h } from 'vue';
import {
  createMenuApi,
  deleteMenuApi,
  getMenuTreeApi,
  updateMenuApi,
  type MenuRecord
} from '@/api';
import { usePermission } from '@/composables/use-permission';
import { BUTTON_PERMISSION_CODES } from '@/constants/permission';
import { confirmAction } from '@/utils/confirm';

defineOptions({
  name: 'menu'
});

interface MenuFormState {
  id: number | null;
  parentId: number | null;
  title: string;
  name: string;
  type: number;
  path: string;
  menuKey: string;
  icon: string;
  layout: string;
  isVisible: boolean;
  component: string;
  redirect: string;
  metaText: string;
  sort: number | null;
}

const message = useMessage();
const menuButtonCodes = BUTTON_PERMISSION_CODES.systemMenu;
const { hasPermission } = usePermission();

const loading = ref(false);
const submitting = ref(false);
const searchTitle = ref('');
const rawMenuTree = ref<MenuRecord[]>([]);

const showMenuDrawer = ref(false);
const isEditMode = ref(false);
const editingMenuId = ref<number | null>(null);
const menuFormRef = ref<FormInst | null>(null);
const menuForm = reactive<MenuFormState>({
  id: null,
  parentId: 0,
  title: '',
  name: '',
  type: 2,
  path: '',
  menuKey: '',
  icon: '',
  layout: '',
  isVisible: true,
  component: '',
  redirect: '',
  metaText: '',
  sort: 0
});

const typeOptions = [
  { label: '目录', value: 1 },
  { label: '菜单', value: 2 },
  { label: '按钮', value: 3 }
];

const menuFormRules: FormRules = {
  title: [
    {
      required: true,
      message: '请输入菜单标题',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.trim().length <= 30,
      message: '菜单标题不能超过 30 个字符',
      trigger: [ 'blur', 'input' ]
    }
  ],
  name: [
    {
      required: true,
      message: '请输入路由名称',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[A-Za-z][A-Za-z0-9_]{1,29}$/.test(value),
      message: '路由名称需以字母开头，且只包含字母、数字、下划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  path: [
    {
      required: true,
      message: '请输入访问路径',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => value.startsWith('/'),
      message: '访问路径必须以 / 开头',
      trigger: [ 'blur', 'input' ]
    }
  ],
  menuKey: [
    {
      required: true,
      message: '请输入权限标识',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => /^[a-zA-Z0-9:_-]{2,50}$/.test(value),
      message: '权限标识只能包含字母、数字、冒号、下划线和中划线',
      trigger: [ 'blur', 'input' ]
    }
  ],
  component: [
    {
      required: true,
      message: '请输入组件路径',
      trigger: [ 'blur', 'input' ]
    },
    {
      validator: (_, value: string) => !/\s/.test(value),
      message: '组件路径不能包含空格',
      trigger: [ 'blur', 'input' ]
    }
  ]
};

const menuTreeOptions = computed<TreeOption[]>(() => [
  {
    key: 0,
    label: '顶级菜单'
  },
  ...rawMenuTree.value.map(item => menuToTreeOption(item))
]);

const filteredMenuTree = computed<MenuRecord[]>(() => {
  const keyword = searchTitle.value.trim().toLowerCase();
  if (!keyword)
    return rawMenuTree.value;

  const walk = (items: MenuRecord[]): MenuRecord[] => {
    return items.reduce<MenuRecord[]>((result, item) => {
      const children = item.children ? walk(item.children) : [];
      const matched = item.title.toLowerCase().includes(keyword)
        || item.path.toLowerCase().includes(keyword)
        || item.name.toLowerCase().includes(keyword);

      if (matched || children.length) {
        result.push({
          ...item,
          children
        });
      }

      return result;
    }, []);
  };

  return walk(rawMenuTree.value);
});

const canCreateMenu = computed(() => hasPermission(menuButtonCodes.create));
const canUpdateMenu = computed(() => hasPermission(menuButtonCodes.update));
const canDeleteMenu = computed(() => hasPermission(menuButtonCodes.delete));
const hasMenuActions = computed(() =>
  canCreateMenu.value || canUpdateMenu.value || canDeleteMenu.value
);

const tableColumns = computed<DataTableColumns<MenuRecord>>(() => {
  const columns: DataTableColumns<MenuRecord> = [
    {
      key: 'title',
      title: '名称',
      render: row => row.title
    },
    {
      key: 'type',
      title: '类型',
      width: 90,
      render: row => {
        const typeTextMap = {
          1: '目录',
          2: '菜单',
          3: '按钮'
        };

        return h(
          NTag,
          { type: row.type === 3 ? 'warning' : 'primary' },
          { default: () => typeTextMap[row.type as 1 | 2 | 3] || row.type }
        );
      }
    },
    {
      key: 'path',
      title: '访问路径',
      minWidth: 180
    },
    {
      key: 'component',
      title: '组件路径',
      minWidth: 180
    },
    {
      key: 'key',
      title: '权限标识',
      minWidth: 180
    },
    {
      key: 'sort',
      title: '排序',
      width: 80
    },
    {
      key: 'isVisible',
      title: '显示状态',
      width: 100,
      render: row => h(
        NTag,
        { type: row.isVisible ? 'success' : 'warning' },
        { default: () => row.isVisible ? '显示' : '隐藏' }
      )
    }
  ];

  if (hasMenuActions.value) {
    columns.push({
      key: 'actions',
      title: '操作',
      width: 260,
      render: (row) => {
        const actions = [];

        if (canCreateMenu.value) {
          actions.push(
            h(
              NButton,
              {
                quaternary: true,
                type: 'primary',
                onClick: () => openCreateDrawer(row.id)
              },
              { default: () => '新增子菜单' }
            )
          );
        }

        if (canUpdateMenu.value) {
          actions.push(
            h(
              NButton,
              {
                quaternary: true,
                type: 'primary',
                onClick: () => openEditDrawer(row)
              },
              { default: () => '编辑' }
            )
          );
        }

        if (canDeleteMenu.value) {
          actions.push(
            h(
              NButton,
              {
                quaternary: true,
                type: 'error',
                onClick: () => handleDeleteMenu(row)
              },
              { default: () => '删除' }
            )
          );
        }

        return h(
          NSpace,
          { size: 4 },
          { default: () => actions }
        );
      }
    });
  }

  return columns;
});

function menuToTreeOption(item: MenuRecord): TreeOption {
  return {
    key: item.id,
    label: `${item.title} (${item.path})`,
    children: item.children?.map(menuToTreeOption)
  };
}

function formatJsonMeta(meta?: Record<string, unknown> | null) {
  if (!meta)
    return '';

  return JSON.stringify(meta, null, 2);
}

function resetMenuForm() {
  editingMenuId.value = null;
  menuForm.id = null;
  menuForm.parentId = 0;
  menuForm.title = '';
  menuForm.name = '';
  menuForm.type = 2;
  menuForm.path = '';
  menuForm.menuKey = '';
  menuForm.icon = '';
  menuForm.layout = '';
  menuForm.isVisible = true;
  menuForm.component = '';
  menuForm.redirect = '';
  menuForm.metaText = '';
  menuForm.sort = 0;
}

async function fetchMenuTree() {
  loading.value = true;
  try {
    const { data } = await getMenuTreeApi();
    rawMenuTree.value = data;
  }
  finally {
    loading.value = false;
  }
}

function handleSearch() {
  if (!filteredMenuTree.value.length)
    message.info('当前关键字未匹配到菜单');
}

function handleReset() {
  searchTitle.value = '';
}

function openCreateDrawer(parentId = 0) {
  isEditMode.value = false;
  resetMenuForm();
  menuForm.parentId = parentId;
  showMenuDrawer.value = true;
}

async function openEditDrawer(menu: MenuRecord) {
  isEditMode.value = true;
  resetMenuForm();
  editingMenuId.value = menu.id;
  showMenuDrawer.value = true;

  menuForm.id = menu.id;
  menuForm.parentId = menu.pid;
  menuForm.title = menu.title;
  menuForm.name = menu.name;
  menuForm.type = menu.type;
  menuForm.path = menu.path;
  menuForm.menuKey = menu.key || '';
  menuForm.icon = menu.icon || '';
  menuForm.layout = menu.layout || '';
  menuForm.isVisible = menu.isVisible ?? true;
  menuForm.component = menu.component;
  menuForm.redirect = menu.redirect || '';
  menuForm.metaText = formatJsonMeta(menu.meta);
  menuForm.sort = menu.sort ?? 0;
}

function closeMenuDrawer() {
  showMenuDrawer.value = false;
  resetMenuForm();
  menuFormRef.value?.restoreValidation();
}

async function submitMenuForm() {
  await menuFormRef.value?.validate();

  if (isEditMode.value && editingMenuId.value !== null && menuForm.parentId === editingMenuId.value) {
    message.error('不能选择自身作为上级菜单');
    return;
  }

  let meta: Record<string, unknown> | undefined;
  if (menuForm.metaText.trim()) {
    try {
      meta = JSON.parse(menuForm.metaText);
    }
    catch {
      message.error('路由元信息不是合法的 JSON');
      return;
    }
  }

  const payload = {
    ...(menuForm.id ? { id: menuForm.id } : {}),
    parentId: menuForm.parentId ?? 0,
    title: menuForm.title.trim(),
    name: menuForm.name.trim(),
    type: menuForm.type,
    path: menuForm.path.trim(),
    menuKey: menuForm.menuKey.trim(),
    icon: menuForm.icon.trim() || undefined,
    layout: menuForm.layout.trim() || undefined,
    isVisible: menuForm.isVisible,
    component: menuForm.component.trim(),
    redirect: menuForm.redirect.trim() || undefined,
    meta,
    sort: Number(menuForm.sort ?? 0)
  };

  submitting.value = true;
  try {
    if (isEditMode.value && editingMenuId.value !== null) {
      await updateMenuApi(editingMenuId.value, {
        ...payload,
        redirect: payload.redirect ?? null,
        meta: payload.meta ?? null
      });
    }
    else {
      await createMenuApi(payload);
    }

    closeMenuDrawer();
    await fetchMenuTree();
  }
  finally {
    submitting.value = false;
  }
}

async function handleDeleteMenu(menu: MenuRecord) {
  const confirmed = await confirmAction({
    title: '删除菜单',
    content: `确认删除菜单“${menu.title}”吗？`
  });

  if (!confirmed)
    return;

  await deleteMenuApi(menu.id);
  await fetchMenuTree();
}

onMounted(() => {
  fetchMenuTree();
});
</script>

<template>
  <div class="menu-page">
    <div class="toolbar">
      <div class="toolbar-item">
        <div class="toolbar-label">
          菜单搜索
        </div>
        <n-input
          v-model:value="searchTitle"
          clearable
          placeholder="输入菜单名称、路径或路由名"
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
      <div v-if="canCreateMenu" class="content-actions">
        <n-button
          v-permission="menuButtonCodes.create"
          type="primary"
          @click="openCreateDrawer()"
        >
          <template #icon>
            <Icon icon="material-symbols:add" />
          </template>
          新增菜单
        </n-button>
      </div>

      <n-spin :show="loading">
        <n-data-table
          :bordered="false"
          :children-key="'children'"
          :columns="tableColumns"
          :data="filteredMenuTree"
          :pagination="false"
          :row-key="(row: MenuRecord) => row.id"
          default-expand-all
          flex-height
        />
      </n-spin>
    </div>
  </div>

  <n-drawer v-model:show="showMenuDrawer" :width="640" placement="right">
    <n-drawer-content :title="isEditMode ? '编辑菜单' : '新增菜单'">
      <n-form ref="menuFormRef" :model="menuForm" :rules="menuFormRules" label-placement="top">
        <n-form-item label="上级菜单" path="parentId">
          <n-tree-select
            v-model:value="menuForm.parentId"
            clearable
            default-expand-all
            :options="menuTreeOptions"
            placeholder="请选择上级菜单"
          />
        </n-form-item>
        <n-grid :cols="2" :x-gap="12">
          <n-form-item-gi label="菜单标题" path="title">
            <n-input v-model:value="menuForm.title" placeholder="请输入菜单标题" />
          </n-form-item-gi>
          <n-form-item-gi label="路由名称" path="name">
            <n-input v-model:value="menuForm.name" placeholder="请输入路由名称" />
          </n-form-item-gi>
          <n-form-item-gi label="菜单类型" path="type">
            <n-select v-model:value="menuForm.type" :options="typeOptions" />
          </n-form-item-gi>
          <n-form-item-gi label="排序" path="sort">
            <n-input-number v-model:value="menuForm.sort" class="w-full" :min="0" />
          </n-form-item-gi>
          <n-form-item-gi label="访问路径" path="path">
            <n-input v-model:value="menuForm.path" placeholder="例如 /system/users" />
          </n-form-item-gi>
          <n-form-item-gi label="权限标识" path="menuKey">
            <n-input v-model:value="menuForm.menuKey" placeholder="例如 system:user:list" />
          </n-form-item-gi>
          <n-form-item-gi label="组件路径" path="component">
            <n-input v-model:value="menuForm.component" placeholder="例如 sys/user" />
          </n-form-item-gi>
          <n-form-item-gi label="重定向" path="redirect">
            <n-input v-model:value="menuForm.redirect" placeholder="选填" />
          </n-form-item-gi>
          <n-form-item-gi label="图标" path="icon">
            <n-input v-model:value="menuForm.icon" placeholder="例如 mdi:user" />
          </n-form-item-gi>
          <n-form-item-gi label="布局标识" path="layout">
            <n-input v-model:value="menuForm.layout" placeholder="例如 default" />
          </n-form-item-gi>
        </n-grid>
        <n-form-item label="显示状态" path="isVisible">
          <n-switch v-model:value="menuForm.isVisible">
            <template #checked>
              显示
            </template>
            <template #unchecked>
              隐藏
            </template>
          </n-switch>
        </n-form-item>
        <n-form-item label="路由元信息（JSON）" path="metaText">
          <n-input
            v-model:value="menuForm.metaText"
            type="textarea"
            placeholder="{&quot;title&quot;:&quot;用户管理&quot;,&quot;keepAlive&quot;:true}"
            :autosize="{ minRows: 4, maxRows: 8 }"
          />
        </n-form-item>
      </n-form>

      <template #footer>
        <div class="drawer-footer">
          <n-button @click="closeMenuDrawer">
            取消
          </n-button>
          <n-button type="primary" :loading="submitting" @click="submitMenuForm">
            保存
          </n-button>
        </div>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="less">
.menu-page {
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
  width: 420px;
}

.toolbar-label {
  width: 88px;
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

.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
