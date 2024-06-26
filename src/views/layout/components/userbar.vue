<script lang="ts" setup>
import screenfull from 'screenfull';
import { Icon } from '@iconify/vue';
import { useMessage } from 'naive-ui';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '@/store/layoutStore';
import tool from '@/utils/tool';

const router = useRouter();
const message = useMessage();
const globalStore = useGlobalStore();

// 锁屏
function JumpLock() {
  globalStore.updateIsLock(true);
}

// 全屏
function screenfullFn() {
  // screenfull.request(); // 全屏
  // screenfull.exit(); // 退出全屏
  screenfull.toggle(); // 全屏切换
}

// 刷新
function refresh() {
  location.reload();
}

const options = ref([
  {
    label: '退出登录',
    key: 'signOut'
  }
]);

function xuanzhong(key: string | number) {
  if (key === 'signOut')
    signOut();
}

// 退出登录
function signOut() {
  tool.data.clear();
  // tool.data.remove('TOKEN');
  router.push('/login');
  message.success(
    '退出登录成功'
  );
}
</script>

<template>
  <div class="layout-content-snowyHeader">
    <div class="layout-content-right">
      <Icon
        class="text-5"
        icon="tabler:lock-filled"
        @click="JumpLock"
      />
      <Icon
        class="mx-3 cursor-pointer text-5" color="#595959" icon="lets-icons:full-alt-light"
        @click="screenfullFn"
      />
      <Icon
        class="cursor-pointer text-5" color="#595959" icon="mdi:circular-arrows"
        @click="refresh"
      />
      <n-dropdown :options="options" class="custom-dropdown" @select="xuanzhong">
        <n-button>
          <n-avatar round size="medium" src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg" />
          <span class="ml-4px text-14px text-#606297">用户资料</span>
        </n-button>
      </n-dropdown>
    </div>
  </div>
</template>

<style lang="less" scoped>
.layout-content-snowyHeader {
  height: 60px;
  background-color: #fff;
  border-bottom: solid #dcdfe6 1px;
  display: flex;
  align-items: center;
  justify-content: right;
  padding: 0 20px;
  .n-button__border {
    border: none;
  }
}

.layout-content-right {
  display: flex;
  align-items: center;
}
</style>
