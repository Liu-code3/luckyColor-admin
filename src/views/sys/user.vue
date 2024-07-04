<script setup lang="ts">
import type { SelectRenderTag } from 'naive-ui';
import { NTag } from 'naive-ui';

import { Icon } from '@iconify/vue';

const genders = ref([
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]);
const option = ref([
  {
    label: '停用',
    value: 'false'
  }
]);
const sex = ref(1);
const values = ref('false');

const active = ref(true);

const page = ref(1);

// 是否分配角色弹框
const showModal = ref(false);

// 分配角色
const assign_roles_fn = () => {
  showModal.value = true;
};

const options = ref([
  {
    label: '今天在摸鱼',
    value: 'value1',
    type: 'success'
  },
  {
    label: '工作没做完',
    value: 'value2',
    type: 'warning'
  },
  {
    label: '晚上要加班',
    value: 'value3',
    type: 'error'
  }
]
);
const value = ref([ 'value3' ]);

const renderTag: SelectRenderTag = ({ option, handleClose }) => {
  return h(
    NTag,
    {
      type: option.type as 'success' | 'warning' | 'error',
      closable: true,
      onMousedown: (e: FocusEvent) => {
        e.preventDefault();
      },
      onClose: (e: MouseEvent) => {
        e.stopPropagation();
        handleClose();
      }
    },
    { default: () => option.label }
  );
};

// 关闭弹窗
const cancel_fn = () => {
  showModal.value = false;
};

// 添加用户
const user_pop_up = ref(true);
</script>

<template>
  <div class="user_box">
    <div class="user_sift mb-10px">
      <div class="user_sift_item">
        <div class="user_sift_title">
          用户名
        </div> <n-input type="text" placeholder="请输入用户名" />
      </div>
      <div class="user_sift_item">
        <div class="user_sift_title">
          用户性别
        </div> <n-space vertical>
          <n-select v-model:value="sex" :options="genders" />
        </n-space>
      </div>
      <div class="user_sift_item">
        <div class="user_sift_title">
          用户状态
        </div> <n-space vertical>
          <n-select v-model:value="values" :options="option" />
        </n-space>
      </div>
      <NButton type="primary" class="ml-20px mr-10px">
        <Icon icon="simple-line-icons:magnifier" class="mr-5px" /> 查询
      </NButton>
      <NButton type="primary" ghost>
        <Icon icon="system-uicons:reset" class="mr-5px" /> 重置
      </NButton>
    </div>
    <div class="user_content">
      <div class="mb-15px">
        <NButton type="primary" class="mr-10px">
          <Icon icon="material-symbols:add" class="mr-5px" />增加新用户
        </NButton>
      </div>
      <n-table>
        <thead>
          <tr>
            <th>头像</th>
            <th>账号</th>
            <th>用户名</th>
            <th>角色</th>
            <th>性别</th>
            <th>手机号</th>
            <th>
              创建时间
            </th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>admin</td>
            <td>
              超管
            </td>
            <td>
              <NTag type="primary">
                超级管理员
              </NTag>  <NTag type="success">
                质检员
              </NTag>
            </td>
            <td />
            <td />
            <td>2023-11-18 16:18:59</td>
            <td>
              <n-switch v-model:value="active" size="medium">
                <template #checked>
                  启用
                </template>
                <template #unchecked>
                  禁用
                </template>
              </n-switch>
            </td>
            <td>
              <n-button strong secondary type="primary" @click="assign_roles_fn">
                <Icon icon="carbon:user-role" class="mr-10px" /> 分配角色
              </n-button>
              <n-button type="primary" class="mx-10px">
                <Icon icon="radix-icons:reset" class="mr-10px" /> 重置密码
              </n-button>
              <n-button type="error">
                <Icon icon="material-symbols-light:delete-outline" class="mr-10px" />  删除
              </n-button>
            </td>
          </tr>
        </tbody>
      </n-table>
      <n-space vertical class="mt-10px" style="display: flex; align-items: end; ">
        <n-pagination v-model:page="page" :page-count="100" :page-slot="4" />
      </n-space>
    </div>
  </div>

  <!-- 分配角色弹框 -->
  <n-modal v-model:show="showModal">
    <n-card
      style="width: 550px"
      title="分配角色"
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
    >
      <template #header-extra>
        <Icon icon="fluent-mdl2:cancel" @click="cancel_fn" />
      </template>
      <div class="layout-abs-center mb-20px">
        <div class="w-60px">
          用户名
        </div> <n-input disabled type="text" placeholder="请输入用户名" />
      </div>
      <div class="layout-abs-center">
        <div class="w-60px">
          角色
        </div> <n-select
          v-model:value="value"
          multiple
          :render-tag="renderTag"
          :options="options"
        />
      </div>
      <template #footer>
        <div class="layout-end mt-40px">
          <NButton type="primary" class="mr-20px">
            确定
          </NButton>
          <n-button @click="cancel_fn">
            取消
          </n-button>
        </div>
      </template>
    </n-card>
  </n-modal>

  <!-- 添加用户 -->
  <n-drawer v-model:show="user_pop_up" :width="502" placement="right">
    <n-drawer-content title="添加用户">
      <div />
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
</style>
