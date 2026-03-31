<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { darkTheme, dateEnUS, dateZhCN, enUS, zhCN } from 'naive-ui'
import AppWatermark from '@/components/AppWatermark.vue'
import { useI18n } from 'vue-i18n'
import LayoutRouteView from '@/components/LayoutRouteView.vue'
import lockScreen from '@/components/lockScreen.vue'
import { LAYOUT_MOBILE_BREAKPOINT, LayoutMode, normalizeLayoutMode } from '@/constants/layout'
import { useGlobalStore } from '@/store/modules/global.ts'
import { useMenuStore } from '@/store/modules/menu.ts'
import {
  initializeAuthSession,
  onAuthSessionCleared
} from '@/utils/auth'
import { isString } from '@/utils/is.ts'
import { message } from '@/utils/message.ts'

const route = useRoute()
const globalStore = useGlobalStore()
const menuStore = useMenuStore()
const { t } = useI18n()
const isMobileViewport = useMediaQuery(`(max-width: ${LAYOUT_MOBILE_BREAKPOINT}px)`)

const Layout = computed(() => {
  if (!route.matched.length) {
    return null
  }

  const routeLayout = normalizeLayoutMode(
    isString(route.meta.layout),
    globalStore.layout
  )
  return getLayout(routeLayout)
})
const shouldShowWatermark = computed(() =>
  globalStore.showWatermark && route.path !== '/login'
)
const naiveLocale = computed(() =>
  globalStore.locale === 'en-US' ? enUS : zhCN
)
const naiveDateLocale = computed(() =>
  globalStore.locale === 'en-US' ? dateEnUS : dateZhCN
)

const layouts = new Map()
function getLayout(name: LayoutMode) {
  if (layouts.get(name)) {
    return layouts.get(name)
  }
  const layout = markRaw(
    defineAsyncComponent(() => import(`@/layouts/${name}/index.vue`))
  )
  layouts.set(name, layout)
  return layout
}

watchEffect(() => {
  globalStore.setThemeColor(globalStore.primaryColor, globalStore.isDark)
  globalStore.applyAppearanceModes()
})

watch(isMobileViewport, (isMobile) => {
  globalStore.updateIsMobile(isMobile)
  menuStore.applyResponsiveState(isMobile)
}, {
  immediate: true
})

onActivated(() => {})
onDeactivated(() => {})

let cleanupSessionClearedListener: null | (() => void) = null

function redirectToLoginWithWarning() {
  if (window.location.pathname === '/login') {
    return
  }

  message.warning(t('app.sessionExpired'))
  window.location.replace('/login')
}

onMounted(() => {
  initializeAuthSession()

  cleanupSessionClearedListener = onAuthSessionCleared(({ reason, source }) => {
    if (source !== 'remote') {
      return
    }

    if (reason === 'manual') {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
      return
    }

    redirectToLoginWithWarning()
  })
})

onBeforeUnmount(() => {
  cleanupSessionClearedListener?.()
})
</script>

<template>
  <div>
    <n-config-provider
      class="h-full w-full"
      :locale="naiveLocale"
      :date-locale="naiveDateLocale"
      :theme="globalStore.isDark ? darkTheme : null"
      :theme-overrides="globalStore.naiveThemeOverrides"
    >
      <n-message-provider>
        <transition
          enter-active-class="animate__animated animate__bounceIn"
          leave-active-class="animate__animated animate__bounceOut"
        >
          <lockScreen
            v-if="globalStore.isLocked"
            @unlock="globalStore.updateIsLock(false);"
          />
        </transition>
        <component v-if="Layout" :is="Layout">
          <LayoutRouteView />
        </component>
        <AppWatermark :show="shouldShowWatermark" />
      </n-message-provider>
    </n-config-provider>
  </div>
</template>
