<script setup lang="ts">
import { Icon } from '@iconify/vue';
import type { VxeGridProps } from 'vxe-table';
import { VxeGrid } from 'vxe-table';
import { handlMenuList } from '@/utils/handlerMenu';
import { menuListApi } from '@/api';

const page = ref(1);
const formRef = ref(null);

const formValue = ref({
  user: {
    name: '',
    age: ''
  },
  phone: '',
  adminName: '',
  password: '',
  radioGroupValue: '',
  switchValue: '',
  multipleSelectValue: '',
  selectValue: ''
});

interface RowVO {
  pid: number;
  id: number;
  title: string;
  type: number;
  path: string;
  icon?: () => import('vue').VNodeChild;
  children?: RowVO[];
}

const gridOptions = ref<VxeGridProps<RowVO>>({
  border: true,
  treeConfig: {
    rowField: 'id',
    childrenField: 'children'
  },
  columns: [
    { field: 'title', title: '名称', treeNode: true },
    { field: 'icon', title: '图标', slots: { default: 'icon' }, width: 50 },
    { field: 'key', title: '类型' },
    { field: 'path', title: '路由地址' },
    { field: 'component', title: '组件' },
    { field: 'isVisible', title: '是否可见', slots: { default: 'isVisible' } },
    { field: '', title: '排序' },
    { field: 'edit', title: '操作', slots: { default: 'edit' }, width: 310 }
  ],
  data: []
});

// const tableData: Ref<App.GlobalMenuOption[]> = ref([]);
onMounted(async () => {
  const res = await menuListApi({ token: '111111111111111' });
  gridOptions.value.data = [ ...handlMenuList(res.data) ];
});

const generalOptions = [ '管理员', '质检员' ].map(
  v => ({
    label: v,
    value: v
  })
);

// 添加菜单
const role_pop_up = ref(false);
const add_role = () => {
  role_pop_up.value = true;
};
</script>

<template>
  <div class="user_box">
    <div class="user_sift mb-10px">
      <div class="user_sift_item">
        <div class="user_sift_title">
          菜单名
        </div> <n-input type="text" placeholder="请输入 菜单名" />
      </div>

      <NButton type="primary" class="ml-20px mr-10px">
        <Icon icon="simple-line-icons:magnifier" class="mr-5px" /> 查询
      </NButton>
      <NButton type="primary" ghost>
        重置
      </NButton>
    </div>
    <div class="user_content">
      <div class="mb-15px">
        <NButton type="primary" class="mr-10px" @click="add_role">
          <Icon icon="material-symbols:add" class="mr-5px" />增加新菜单
        </NButton>
        <NButton type="error" ghost>
          批量删除
        </NButton>
      </div>
      <VxeGrid v-bind="gridOptions">
        <template #icon="{ row }">
          <div>
            <Icon class="h-4 w-4" :icon="row.icon" />
          </div>
        </template>
        <template #isVisible="{ row }">
          <div>
            <NTag type="primary">
              {{ row.isVisible ? '显示' : '隐藏' }}
            </NTag>
          </div>
        </template>
        <template #edit>
          <n-button quaternary type="primary" class="mx-10px p-0">
            编辑
          </n-button>
          <n-button quaternary type="error">
            删除
          </n-button>
          <n-button quaternary type="primary" class="mx-10px p-0">
            按钮权限
          </n-button>
        </template>
      </VxeGrid>
      <n-space vertical class="mt-10px" style="display: flex; align-items: end; ">
        <n-pagination v-model:page="page" :page-count="100" :page-slot="4" />
      </n-space>
    </div>
  </div>

  <!-- 增加菜单 -->
  <n-drawer v-model:show="role_pop_up" :width="702" placement="right">
    <n-drawer-content title="增加菜单">
      <n-form
        ref="formRef"
        require-mark-placement="right-hanging"
        :style="{
          maxWidth: '640px',
        }"
      >
        <n-form-item label="显示名称：" path="uadminName">
          <n-input v-model:value="formValue.adminName" placeholder="输入显示名称" />
        </n-form-item>
        <n-form-item label="密码：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="上级菜单：" path="multipleSelectValue">
          <n-select
            v-model:value="formValue.multipleSelectValue"
            placeholder="请选择上级菜单"
            :options="generalOptions"
            multiple
          />
        </n-form-item>
        <n-form-item label="路由地址：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入路由地址" />
        </n-form-item>
        <n-form-item label="组件地址：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入组件地址" />
        </n-form-item>
        <n-form-item label=" 别名：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入组件地址" />
        </n-form-item>
        <n-form-item label="是否可见:" path="radioGroupValue">
          <n-radio-group v-model:value="formValue.radioGroupValue" name="radiogroup2">
            <n-radio value="男">
              显示
            </n-radio>
            <n-radio value="女">
              隐藏
            </n-radio>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="图标" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入组件地址" />
        </n-form-item>
        <n-form-item label="排序：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入组件地址" />
        </n-form-item>

        <n-form-item>
          <n-button attr-type="button">
            验证
          </n-button>
        </n-form-item>
      </n-form>
    </n-drawer-content>
  </n-drawer>
</template>

<style lang="less" scoped>
.user_box {
  .user_sift {
    height: 80px;
    background-color: #fff;
    display: flex;
    align-items: center;
    padding: 0 30px;

    .user_sift_item {
      display: flex;
      align-items: center;
      width: 300px;
      flex: none;
      margin-right: 20px;

      .user_sift_title {
        max-width: 100px;
        margin-right: 10px;
        flex: none;
      }
    }
  }
}
.user_content {
  height: calc(100vh - 224px);
  background-color: #fff;
  padding: 20px;
  box-sizing: border-box;
}
.n-space {
  flex: 1;
}
.n-form {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .n-form-item {
    width: 48%;
  }
}
</style>
