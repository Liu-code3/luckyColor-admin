import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { trackDashboardVisitApi } from '@/api'
import { getAccessToken } from '@/utils/auth'
import tool from '@/utils/tool'

const VISITOR_KEY = 'DASHBOARD_VISITOR_ID'
const SESSION_KEY = 'DASHBOARD_SESSION_ID'
const HEARTBEAT_MS = 60 * 1000

let heartbeatTimer: number | null = null
let latestPayload: Parameters<typeof trackDashboardVisitApi>[0] | null = null

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
  if (!latestPayload || !getAccessToken())
    return

  void trackDashboardVisitApi(latestPayload).catch(() => {})
}

function startHeartbeat() {
  if (heartbeatTimer !== null)
    window.clearInterval(heartbeatTimer)

  heartbeatTimer = window.setInterval(() => {
    if (document.visibilityState === 'hidden')
      return

    sendVisit()
  }, HEARTBEAT_MS)
}

export function syncDashboardVisit(route: RouteLocationNormalizedLoaded) {
  if (!getAccessToken() || route.path === '/login')
    return

  latestPayload = buildTrackPayload(route)
  sendVisit()
  startHeartbeat()
}
