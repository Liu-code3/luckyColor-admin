<script setup lang="ts">
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
      <n-button type="primary" class="ml-20px mr-10px">
        查询
      </n-button>
      <n-button type="primary" ghost>
        重置
      </n-button>
    </div>
    <div class="user_content">
      <div>
        <n-button type="primary" class="mr-10px">
          增加新用户
        </n-button>
        <n-button type="error" ghost>
          批量删除
        </n-button>
      </div>
    </div>
  </div>
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
}
.n-space {
  flex: 1;
}
</style>
