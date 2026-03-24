<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { useRoute } from 'vue-router'

const route = useRoute()
const cachedViews = shallowReactive<Record<string, Component>>({})
const currentView = computed<Component | null>(() => {
  const matchedRoute = route.matched[route.matched.length - 1]
  const matchedComponent = matchedRoute?.components?.default

  if (!matchedComponent) {
    return null
  }

  return markRaw(matchedComponent as Component)
})

function resolveRouteRenderKey(currentRoute: RouteLocationNormalizedLoaded) {
  if (currentRoute.meta?.keepAlive && currentRoute.name) {
    return String(currentRoute.name)
  }

  return currentRoute.fullPath
}

function shouldKeepAliveRoute(currentRoute: RouteLocationNormalizedLoaded) {
  return Boolean(currentRoute.meta?.keepAlive && currentRoute.name)
}

function ensureCachedRoute(
  currentRoute: RouteLocationNormalizedLoaded,
  component: Component
) {
  const routeName = resolveRouteRenderKey(currentRoute)

  if (!cachedViews[routeName]) {
    cachedViews[routeName] = markRaw(component)
  }

  return routeName
}

const cachedViewEntries = computed(() =>
  Object.entries(cachedViews).map(([ name, component ]) => ({
    name,
    component
  }))
)

function resolveCachedViewEntries(
  currentRoute: RouteLocationNormalizedLoaded,
  component: Component
) {
  ensureCachedRoute(currentRoute, component)
  return cachedViewEntries.value
}

function resolveActiveCachedRouteName(
  currentRoute: RouteLocationNormalizedLoaded,
  component: Component
) {
  if (!shouldKeepAliveRoute(currentRoute)) {
    return ''
  }

  return ensureCachedRoute(currentRoute, component)
}
</script>

<template>
  <component
    v-for="item in (shouldKeepAliveRoute(route) && currentView
      ? resolveCachedViewEntries(route, currentView)
      : cachedViewEntries)"
    :key="item.name"
    :is="item.component"
    v-show="item.name === (currentView ? resolveActiveCachedRouteName(route, currentView) : '')"
  />
  <component
    v-if="currentView && !shouldKeepAliveRoute(route)"
    :is="currentView"
    :key="resolveRouteRenderKey(route)"
  />
</template>
