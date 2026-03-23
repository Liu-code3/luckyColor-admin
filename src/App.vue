<script setup lang="ts">
import { useRoute } from 'vue-router'
import { darkTheme, dateZhCN, zhCN } from 'naive-ui'
import lockScreen from '@/components/lockScreen.vue'
import { useGlobalStore } from '@/store/modules/global.ts'
import {
  clearLoginSession,
  initializeAuthSession,
  onAccessTokenRemoved
} from '@/utils/auth'
import { isString } from '@/utils/is.ts'
import { message } from '@/utils/message.ts'

const route = useRoute()
const globalStore = useGlobalStore()
if (globalStore.layout === 'default') {
  globalStore.updateLayout('default')
}
const Layout = computed(() => {
  if (!route.matched.length) {
    return null
  }
  return getLayout(isString(route.meta.layout) || globalStore.layout)
})

const layouts = new Map()
function getLayout(name: string) {
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
})

onActivated(() => {})
onDeactivated(() => {})

let cleanupAccessTokenListener: null | (() => void) = null
let cleanupSessionClearedListener: null | (() => void) = null

function redirectToLoginWithWarning() {
  if (window.location.pathname === '/login') {
    return
  }

  message.warning('登录状态已失效，请重新登录')
  window.location.replace('/login')
}

onMounted(() => {
  initializeAuthSession()

  cleanupAccessTokenListener = onAccessTokenRemoved(() => {
    clearLoginSession()
    redirectToLoginWithWarning()
  })

  const handleSessionCleared = (event: Event) => {
    const { detail } = event as CustomEvent<{ reason?: string }>

    if (detail?.reason === 'manual') {
      return
    }

    redirectToLoginWithWarning()
  }

  window.addEventListener('auth:session-cleared', handleSessionCleared)
  cleanupSessionClearedListener = () => {
    window.removeEventListener('auth:session-cleared', handleSessionCleared)
  }
})

onBeforeUnmount(() => {
  cleanupAccessTokenListener?.()
  cleanupSessionClearedListener?.()
})
</script>

<template>
  <div>
    <n-config-provider
      class="h-full w-full"
      :locale="zhCN"
      :date-locale="dateZhCN"
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
        <router-view v-if="Layout" v-slot="{ Component }">
          <component :is="Layout">
            <keep-alive>
              <component :is="Component" />
            </keep-alive>
          </component>
        </router-view>
      </n-message-provider>
    </n-config-provider>
  </div>
</template>
