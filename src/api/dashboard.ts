import { request } from '@/utils/http'

export interface DashboardOverviewResponse {
  user: {
    id: string
    username: string
    nickname?: string | null
  }
  stats: {
    onlineUsers: number
    visitorUv: number
    pageViews: number
    onlineWindowSeconds: number
  }
  trend: Array<{
    date: string
    pv: number
    uv: number
  }>
  recentVisits: Array<{
    routePath: string
    routeTitle: string
    routeIcon?: string | null
    lastVisitedAt: string
  }>
  notices: Array<{
    id: string
    title: string
    content: string
    type: string
    status: boolean
    publisher?: string | null
    publishedAt?: string | null
    createdAt: string
  }>
}

export interface TrackDashboardVisitPayload {
  visitorId: string
  sessionId: string
  routePath: string
  routeTitle: string
  routeIcon?: string | null
}

export function getDashboardOverviewApi() {
  return request<never, DashboardOverviewResponse>({
    url: '/dashboard/overview',
    method: 'get'
  })
}

export function trackDashboardVisitApi(data: TrackDashboardVisitPayload) {
  return request<TrackDashboardVisitPayload, { id: string, visitedAt: string }>({
    url: '/dashboard/track-visit',
    method: 'post',
    data,
    headers: {
      'x-silent-request': 'true'
    }
  })
}
