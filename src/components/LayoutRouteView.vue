<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()

function shouldKeepAliveRoute(currentRoute: RouteLocationNormalizedLoaded) {
  return Boolean(currentRoute.meta?.keepAlive && currentRoute.name)
}

function resolveRouteRenderKey(currentRoute: RouteLocationNormalizedLoaded) {
  if (shouldKeepAliveRoute(currentRoute) && currentRoute.name) {
    return String(currentRoute.name)
  }

  return currentRoute.fullPath
}
</script>

<template>
  <RouterView v-slot="{ Component, route: currentRoute }">
    <transition name="layout-route-fade" mode="out-in">
      <KeepAlive>
        <component
          v-if="Component && shouldKeepAliveRoute(currentRoute)"
          :is="Component"
          :key="resolveRouteRenderKey(currentRoute)"
        />
      </KeepAlive>
    </transition>

    <transition name="layout-route-fade" mode="out-in">
      <component
        v-if="Component && !shouldKeepAliveRoute(currentRoute)"
        :is="Component"
        :key="resolveRouteRenderKey(currentRoute)"
      />
    </transition>
  </RouterView>
</template>

<style scoped lang="scss">
.layout-route-fade-enter-active,
.layout-route-fade-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.layout-route-fade-enter-from,
.layout-route-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
