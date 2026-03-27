<script setup lang="ts">
const props = defineProps<{
  show: boolean;
}>();

const watermarkContent = 'LuckyColor Admin';
</script>

<template>
  <n-watermark
    v-if="props.show"
    class="app-watermark-layer"
    :content="watermarkContent"
    cross
    fullscreen
    :font-size="14"
    :line-height="14"
    :width="180"
    :height="120"
    :x-offset="12"
    :y-offset="12"
    :rotate="-18"
    :font-color="'rgba(15, 23, 42, 0.12)'"
    :z-index="12"
  />
</template>

<style scoped>
:deep(.app-watermark-layer.n-watermark) {
  background-color: transparent !important;
}
</style>
