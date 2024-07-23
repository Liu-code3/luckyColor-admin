<script setup lang="ts">
import Editor from '@/components/wangEditor/index.vue';

const value = ref('初始内容');
</script>

<template>
  <div class="p-5">
    <Editor v-model="value" style="height: calc(100vh - 180px)" />
  </div>
</template>
