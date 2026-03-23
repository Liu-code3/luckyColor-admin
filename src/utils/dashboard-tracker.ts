import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { trackDashboardVisitApi } from '@/api'
import { AUTH_STORAGE_KEYS } from '@/constants/auth'
import { getUsableAccessToken } from '@/utils/auth'
import tool from '@/utils/tool'

const VISITOR_KEY = 'DASHBOARD_VISITOR_ID'
const SESSION_KEY = 'DASHBOARD_SESSION_ID'
const HEARTBEAT_MS = 60 * 1000

let heartbeatTimer: number | null = null
let latestPayload: Parameters<typeof trackDashboardVisitApi>[0] | null = null
let authListenersBound = false

function ensureVisitorId() {
  const cached = tool.data.get<string>(VISITOR_KEY)
  if (cached)
    return cached

  const visitorId = tool.luckUuid()
  tool.data.set(VISITOR_KEY, visitorId)
  return visitorId
}

function ensureSessionId() {
  const cached = tool.session.get<string>(SESSION_KEY)
  if (cached)
    return cached

  const sessionId = tool.luckUuid()
  tool.session.set(SESSION_KEY, sessionId)
  return sessionId
}

function buildTrackPayload(route: RouteLocationNormalizedLoaded) {
  const rawTitle = route.meta.title || route.name || route.path
  const routeTitle = typeof rawTitle === 'string' ? rawTitle : route.path
  const routeIcon = typeof route.meta.icon === 'string' ? route.meta.icon : null

  return {
    visitorId: ensureVisitorId(),
    sessionId: ensureSessionId(),
    routePath: route.path,
    routeTitle,
    routeIcon
  }
}

function sendVisit() {
  if (!latestPayload)
    return

  if (!getUsableAccessToken()) {
    stopDashboardVisitTracking()
    return
  }

  void trackDashboardVisitApi(latestPayload).catch(() => {})
}

export function stopDashboardVisitTracking() {
  if (heartbeatTimer !== null) {
    window.clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }

  latestPayload = null
}

function bindAuthSessionListeners() {
  if (authListenersBound)
    return

  window.addEventListener('auth:session-cleared', () => {
    stopDashboardVisitTracking()
  })

  window.addEventListener('storage', (event) => {
    if (event.storageArea !== localStorage)
      return

    if (event.key === AUTH_STORAGE_KEYS.accessToken && event.newValue === null)
      stopDashboardVisitTracking()
  })

  authListenersBound = true
}

function startHeartbeat() {
  stopDashboardVisitTracking()

  heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState === 'hidden')
      return

    if (!getUsableAccessToken() || window.location.pathname === '/login') {
      stopDashboardVisitTracking()
      return
    }

    sendVisit()
  }, HEARTBEAT_MS)
}

export function syncDashboardVisit(route: RouteLocationNormalizedLoaded) {
  bindAuthSessionListeners()

  if (!getUsableAccessToken() || route.path === '/login') {
    stopDashboardVisitTracking()
    return
  }

  latestPayload = buildTrackPayload(route)
  sendVisit()
  startHeartbeat()
}
