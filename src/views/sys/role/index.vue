<script setup lang="ts">
import { Icon } from '@iconify/vue';

const option = ref([
  {
    label: '停用',
    value: 'false'
  }
]);
const values = ref('false');

const active = ref(true);

const page = ref(1);

// 添加角色
const role_pop_up = ref(false);
const formRef = ref(null);
const add_role = () => {
  role_pop_up.value = true;
};

const formValue = ref({
  adminName: '',
  password: '',
  switchValue: ''
});
</script>

<template>
  <div class="user_box">
    <div class="user_sift mb-10px">
      <div class="user_sift_item">
        <div class="user_sift_title">
          角色名
        </div> <n-input type="text" placeholder="请输入用户名" />
      </div>
      <div class="user_sift_item">
        <div class="user_sift_title">
          状态
        </div> <n-space vertical>
          <n-select v-model:value="values" :options="option" />
        </n-space>
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
          <Icon icon="material-symbols:add" class="mr-5px" />增加新角色
        </NButton>
        <NButton type="error" ghost>
          批量删除
        </NButton>
      </div>
      <n-table>
        <thead>
          <tr>
            <th>角色名</th>
            <th>角色编码</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>超级管理员</td>
            <td>SUPER_ADMIN</td>
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
              <n-button strong secondary type="primary">
                <Icon icon="lets-icons:user-add" /> 分配用户
              </n-button>
              <n-button type="primary" class="mx-10px">
                <Icon icon="lucide:edit" /> 编辑
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

  <!-- 添加角色 -->
  <n-drawer v-model:show="role_pop_up" :width="702" placement="right">
    <n-drawer-content title="添加角色">
      <n-form
        ref="formRef"
        require-mark-placement="right-hanging"
        :style="{
          maxWidth: '640px',
        }"
      >
        <n-form-item label="角色名：" path="uadminName">
          <n-input v-model:value="formValue.adminName" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="角色编码" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入姓名" />
        </n-form-item>

        <n-form-item label="状态" path="switchValue">
          <n-switch v-model:value="formValue.switchValue">
            <template #checked>
              启用
            </template>
            <template #unchecked>
              禁用
            </template>
          </n-switch>
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
    background-color: var(--primary-bgColor);
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
  background-color: var(--primary-bgColor);
  padding: 20px;
  box-sizing: border-box;
}
.n-space {
  flex: 1;
}
</style>
