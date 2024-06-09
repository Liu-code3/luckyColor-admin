<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { Encrypt } from '@/utils/crypto-md5';
import tool from '@/utils/tool';
import { message } from '@/utils/message';

const emits = defineEmits(['unlock']);
const lockPwd = ref('');
const isLocked = ref(true);
const onEnLock: () => void = () => {
  const pwd = Encrypt(lockPwd.value);
  const oldPwd = tool.data.get<string>('lockPassword') ?? '';
  if (pwd === oldPwd) {
    emits('unlock');
    isLocked.value = false;
    return;
  }
  message.warning('密码错误');
};

// 禁用浏览器的后退按钮
function preventBack(event: PopStateEvent) {
  if (isLocked.value) {
    event.preventDefault();
    history.pushState(null, '', location.href);
  }
}

onMounted(() => {
  window.addEventListener('popstate', preventBack);
});

onBeforeUnmount(() => {
  window.removeEventListener('popstate', preventBack);
});
</script>

<template>
  <div class="lock_main">
    <div class="cover">
      <div class="content">
        <div class="layout-abs-center h-40 w-40 rd-50%" style="background-color: rgba(78, 136, 243, .2);">
          <img class="h-28 w-28 rd-3" src="@/assets/images/luckColor.png" alt="">
        </div>
        <Icon icon="gravity-ui:lock" class="text-10" />
        <h3 class="my-0">
          luckColor 屏幕已锁定
        </h3>
        <n-input-group class="justify-center">
          <n-input
            v-model:value="lockPwd"
            type="password"
            style="width: 60%;--n-border-hover: 1px solid #4E88F3; --n-border-focus: 1px solid #4E88F3; --n-box-shadow-focus: 0 0 0 2px rgba(78,136,243, 0.2)"
            placeholder="请输入登录密码解锁"
            @keyup.enter="onEnLock"
          />
          <n-button color="#4E88F3" @click="onEnLock">
            <template #icon>
              <Icon icon="gravity-ui:lock" class="text-4" />
            </template>
            解锁
          </n-button>
        </n-input-group>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lock_main {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  z-index: 999;
  background: url('@/assets/images/lock_bg.jpg') no-repeat center;
}

.cover {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.25rem;
  height: 28rem;
  width: 25rem;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}
</style>
