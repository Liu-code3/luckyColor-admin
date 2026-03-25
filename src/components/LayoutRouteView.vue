<script setup lang="ts">
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { RouterView, useRoute } from 'vue-router'

const route = useRoute()
const keepAliveRouteNames = ref<string[]>([])

function shouldKeepAliveRoute(currentRoute: RouteLocationNormalizedLoaded) {
  return Boolean(currentRoute.meta?.keepAlive && currentRoute.name)
}

function resolveRouteRenderKey(currentRoute: RouteLocationNormalizedLoaded) {
  if (shouldKeepAliveRoute(currentRoute) && currentRoute.name) {
    return String(currentRoute.name)
  }

  return currentRoute.fullPath
}

watch(
  () => [route.name, route.fullPath, route.meta?.keepAlive],
  () => {
    if (!shouldKeepAliveRoute(route) || !route.name) {
      return
    }

    const routeName = String(route.name)
    if (!keepAliveRouteNames.value.includes(routeName)) {
      keepAliveRouteNames.value = [ ...keepAliveRouteNames.value, routeName ]
    }
  },
  { immediate: true }
)
</script>

<template>
  <RouterView v-slot="{ Component, route: currentRoute }">
    <transition name="layout-route-fade" mode="out-in">
      <KeepAlive :include="keepAliveRouteNames">
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
