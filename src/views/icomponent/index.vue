<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div>
    <router-view :key="route.fullPath" />
  </div>
</template>
