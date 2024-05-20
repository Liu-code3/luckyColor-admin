<script lang="ts">
import { defineComponent, ref } from 'vue';

const menuOptions = [
  {
    label: '且听风吟',
    key: 'index'
  }

];

export default defineComponent({
  setup() {
    return {
      inverted: ref(false),
      menuOptions
    };
  }
});
</script>

<template>
  <n-space vertical>
    <n-layout>
      <n-layout-header :inverted="inverted" bordered>
        <div class="h-8vh">
          1
        </div>
      </n-layout-header>
      <n-layout has-sider>
        <n-layout-sider
          bordered
          show-trigger
          collapse-mode="width"
          :collapsed-width="64"
          :width="220"
          :native-scrollbar="false"
          :inverted="inverted"
        >
          <n-menu
            :inverted="inverted"
            :collapsed-width="64"
            :collapsed-icon-size="22"
            :options="menuOptions"
            class="h-91vh"
          />
        </n-layout-sider>
        <n-layout-content content-style="padding: 24px;">
          平山道
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-space>
</template>
