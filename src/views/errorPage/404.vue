<script lang="ts" setup>
const router = useRouter();
function backHome() {
  // TODO: 需要验证用户是否登录
  // 1.登录状态, 跳转到上一个页面
  // 2.未登录状态, 跳转到登录页面
  router.back();
}
</script>

<template>
  <div class="h-100vh flex">
    <n-result class="m-auto" status="404" title="404 资源不存在" description="生活总归带点荒谬">
      <template #footer>
        <n-button @click="backHome">
          找点乐子吧
        </n-button>
      </template>
    </n-result>
  </div>
</template>
