<script setup lang="ts">
import { Icon } from '@iconify/vue';

const page = ref(1);

// 添加用户
const user_pop_up = ref(false);
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
        <NButton type="primary" class="mr-10px">
          <Icon icon="material-symbols:add" class="mr-5px" @click="add_role" />增加新菜单
        </NButton>
        <NButton type="error" ghost>
          批量删除
        </NButton>
      </div>
      <n-table>
        <thead>
          <tr>
            <th>名称</th>
            <th>图标</th>
            <th>类型</th>
            <th>路由地址</th>
            <th>组件</th>
            <th>是否可见</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td />
            <td>
              <n-button type="primary" class="mx-10px">
                <Icon icon="lucide:edit" /> 编辑
              </n-button>
              <n-button type="error">
                <Icon icon="material-symbols-light:delete-outline" class="mr-10px" />  删除
              </n-button>
              <n-button type="primary" class="mx-10px">
                <Icon icon="lucide:edit" /> 按钮权限
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

  <!-- 添加用户 -->
  <n-drawer v-model:show="user_pop_up" :width="702" placement="right">
    <n-drawer-content title="添加用户">
      <n-form
        ref="formRef"
        require-mark-placement="right-hanging"
        :style="{
          maxWidth: '640px',
        }"
      >
        <n-form-item label="账号：" path="uadminName">
          <n-input v-model:value="formValue.adminName" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="密码：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="昵称：" path="user.name">
          <n-input v-model:value="formValue.user.name" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="邮箱：" path="password">
          <n-input v-model:value="formValue.password" placeholder="输入姓名" />
        </n-form-item>
        <n-form-item label="性别" path="radioGroupValue">
          <n-radio-group v-model:value="formValue.radioGroupValue" name="radiogroup2">
            <n-radio value="男">
              男
            </n-radio>
            <n-radio value="女">
              女
            </n-radio>
          </n-radio-group>
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
        <n-form-item label="手机号：" path="phone">
          <n-input v-model:value="formValue.phone" placeholder="电话号码" />
        </n-form-item>
        <n-form-item label="角色" path="multipleSelectValue">
          <n-select
            v-model:value="formValue.multipleSelectValue"
            placeholder="请选择角色"
            :options="generalOptions"
            multiple
          />
        </n-form-item>
        <n-form-item label="部门" path="selectValue">
          <n-select
            v-model:value="formValue.selectValue"
            placeholder="请选择部门"
            :options="generalOptions"
          />
        </n-form-item>
        <n-form-item label="职位" path="selectValue">
          <n-select
            v-model:value="formValue.selectValue"
            placeholder="请选择职位"
            :options="generalOptions"
          />
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
.n-form {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  .n-form-item {
    width: 48%;
  }
}
</style>
