<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getDashboardOverviewApi } from '@/api'

interface DashboardViewState {
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

interface TrendChartPoint {
  date: string
  label: string
  pv: number
  uv: number
  x: number
  pvY: number
  uvY: number
  showLabel: boolean
  hitStart: number
  hitWidth: number
}

interface QuickEntryItem {
  title: string
  description: string
  path: string
  icon: string
  tag: string
  metric: string
}

interface TodoItem {
  title: string
  summary: string
  path: string
  icon: string
  tag: string
  actionLabel: string
}

const router = useRouter()
const { locale, t } = useI18n()

const loading = ref(false)
const currentTime = ref(new Date())
const trendRange = ref<7 | 30>(7)
const activeTrendIndex = ref<number | null>(null)
let clockTimer: number | null = null
const dashboardData = ref<DashboardViewState>({
  user: {
    id: '',
    username: 'admin',
    nickname: 'Platform Admin'
  },
  stats: {
    onlineUsers: 0,
    visitorUv: 0,
    pageViews: 0,
    onlineWindowSeconds: 300
  },
  trend: [],
  recentVisits: [],
  notices: []
})

const currentLocale = computed(() => locale.value === 'en-US' ? 'en-US' : 'zh-CN')
const displayName = computed(() => dashboardData.value.user.nickname || dashboardData.value.user.username)
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return t('dashboard.greeting.night')
  if (hour < 12) return t('dashboard.greeting.morning')
  if (hour < 14) return t('dashboard.greeting.noon')
  if (hour < 18) return t('dashboard.greeting.afternoon')
  return t('dashboard.greeting.evening')
})

const dateText = computed(() => new Intl.DateTimeFormat(currentLocale.value, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}).format(currentTime.value))

const timeText = computed(() => currentTime.value.toLocaleTimeString(currentLocale.value, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}))

const statCards = computed(() => [
  {
    title: t('dashboard.stats.onlineUsers.title'),
    value: dashboardData.value.stats.onlineUsers,
    unit: t('dashboard.stats.onlineUsers.unit'),
    icon: 'solar:users-group-rounded-linear',
    accent: '#0f766e',
    helper: t('dashboard.stats.onlineUsers.helper', {
      minutes: Math.floor(dashboardData.value.stats.onlineWindowSeconds / 60)
    }),
    footer: t('dashboard.stats.onlineUsers.footer', {
      count: dashboardData.value.stats.onlineUsers
    })
  },
  {
    title: t('dashboard.stats.visitorUv.title'),
    value: dashboardData.value.stats.visitorUv,
    unit: '',
    icon: 'solar:user-id-linear',
    accent: '#2563eb',
    helper: t('dashboard.stats.visitorUv.helper'),
    footer: t('dashboard.stats.visitorUv.footer', {
      count: dashboardData.value.stats.visitorUv
    })
  },
  {
    title: t('dashboard.stats.pageViews.title'),
    value: dashboardData.value.stats.pageViews,
    unit: '',
    icon: 'solar:eye-linear',
    accent: '#f97316',
    helper: t('dashboard.stats.pageViews.helper'),
    footer: t('dashboard.stats.pageViews.footer', {
      count: dashboardData.value.stats.pageViews
    })
  },
  {
    title: t('dashboard.stats.todos.title'),
    value: todoItems.value.length,
    unit: t('dashboard.stats.todos.unit'),
    icon: 'solar:checklist-minimalistic-linear',
    accent: '#7c3aed',
    helper: t('dashboard.stats.todos.helper'),
    footer: t('dashboard.stats.todos.footer', {
      count: todoItems.value.length
    })
  }
])

const quickEntryItems = computed<QuickEntryItem[]>(() => [
  {
    title: t('dashboard.quickEntries.userManagement.title'),
    description: t('dashboard.quickEntries.userManagement.description'),
    path: '/systemManagement/system/users',
    icon: 'solar:users-group-rounded-linear',
    tag: t('dashboard.quickEntries.userManagement.tag'),
    metric: t('dashboard.quickEntries.metrics.recentVisits', {
      count: dashboardData.value.recentVisits.length
    })
  },
  {
    title: t('dashboard.quickEntries.rolePermission.title'),
    description: t('dashboard.quickEntries.rolePermission.description'),
    path: '/systemManagement/system/role',
    icon: 'solar:shield-user-linear',
    tag: t('dashboard.quickEntries.rolePermission.tag'),
    metric: t('dashboard.quickEntries.metrics.notices', {
      count: dashboardData.value.notices.length
    })
  },
  {
    title: t('dashboard.quickEntries.menuManagement.title'),
    description: t('dashboard.quickEntries.menuManagement.description'),
    path: '/systemManagement/system/menu',
    icon: 'solar:widget-4-linear',
    tag: t('dashboard.quickEntries.menuManagement.tag'),
    metric: t('dashboard.quickEntries.metrics.trendDays', {
      count: trendRange.value
    })
  },
  {
    title: t('dashboard.quickEntries.dictManagement.title'),
    description: t('dashboard.quickEntries.dictManagement.description'),
    path: '/systemManagement/system/dict',
    icon: 'solar:book-bookmark-linear',
    tag: t('dashboard.quickEntries.dictManagement.tag'),
    metric: t('dashboard.quickEntries.metrics.pageViews', {
      count: dashboardData.value.stats.pageViews
    })
  },
  {
    title: t('dashboard.quickEntries.tenantManagement.title'),
    description: t('dashboard.quickEntries.tenantManagement.description'),
    path: '/tenantCenter/tenant',
    icon: 'solar:buildings-2-linear',
    tag: t('dashboard.quickEntries.tenantManagement.tag'),
    metric: t('dashboard.quickEntries.metrics.onlineUsers', {
      count: dashboardData.value.stats.onlineUsers
    })
  },
  {
    title: t('dashboard.quickEntries.tenantPackage.title'),
    description: t('dashboard.quickEntries.tenantPackage.description'),
    path: '/tenantCenter/tenantPackage',
    icon: 'solar:box-linear',
    tag: t('dashboard.quickEntries.tenantPackage.tag'),
    metric: t('dashboard.quickEntries.metrics.visitorUv', {
      count: dashboardData.value.stats.visitorUv
    })
  }
])

const todoItems = computed<TodoItem[]>(() => {
  const latestNotice = dashboardData.value.notices[0]
  const latestVisit = dashboardData.value.recentVisits[0]

  return [
    {
      title: latestNotice ? t('dashboard.todos.noticeReview') : t('dashboard.todos.noticeCreate'),
      summary: latestNotice
        ? t('dashboard.todos.noticeReviewSummary', { title: latestNotice.title })
        : t('dashboard.todos.noticeCreateSummary'),
      path: '/systemManagement/system/notice',
      icon: 'solar:bell-linear',
      tag: latestNotice ? t('dashboard.todos.noticeReviewTag') : t('dashboard.todos.noticeCreateTag'),
      actionLabel: latestNotice ? t('dashboard.todos.noticeReviewAction') : t('dashboard.todos.noticeCreateAction')
    },
    {
      title: t('dashboard.todos.roleAuditTitle'),
      summary: t('dashboard.todos.roleAuditSummary'),
      path: '/systemManagement/system/role',
      icon: 'solar:shield-keyhole-linear',
      tag: t('dashboard.todos.roleAuditTag'),
      actionLabel: t('dashboard.todos.roleAuditAction')
    },
    {
      title: t('dashboard.todos.visitFollowTitle'),
      summary: latestVisit
        ? t('dashboard.todos.visitFollowSummary', { title: latestVisit.routeTitle })
        : t('dashboard.todos.visitFollowEmptySummary'),
      path: latestVisit?.routePath || '/systemManagement/system/users',
      icon: 'solar:cursor-square-linear',
      tag: t('dashboard.todos.visitFollowTag'),
      actionLabel: t('dashboard.todos.visitFollowAction')
    },
    {
      title: t('dashboard.todos.tenantFocusTitle'),
      summary: t('dashboard.todos.tenantFocusSummary', {
        onlineUsers: dashboardData.value.stats.onlineUsers,
        visitorUv: dashboardData.value.stats.visitorUv
      }),
      path: '/tenantCenter/tenant',
      icon: 'solar:monitor-smartphone-linear',
      tag: t('dashboard.todos.tenantFocusTag'),
      actionLabel: t('dashboard.todos.tenantFocusAction')
    }
  ]
})

const trendData = computed(() => {
  const records = dashboardData.value.trend
  if (trendRange.value === 30 && records.length < 30) {
    return expandTrend(records, 30)
  }
  if (trendRange.value === 7 && records.length < 7) {
    return expandTrend(records, 7)
  }
  return records.slice(-trendRange.value)
})

const chart = computed(() => buildChart(trendData.value))
const activeTrendPoint = computed(() => {
  if (activeTrendIndex.value === null)
    return null
  return chart.value.points[activeTrendIndex.value] || null
})
const activeTrendTooltip = computed(() => {
  const point = activeTrendPoint.value
  if (!point)
    return null

  const tooltipWidth = 136
  const tooltipHeight = 64
  const tooltipX = clamp(
    point.x - tooltipWidth / 2,
    chart.value.left + 6,
    chart.value.left + chart.value.chartWidth - tooltipWidth - 6
  )
  const tooltipY = Math.max(
    chart.value.top + 8,
    Math.min(point.pvY, point.uvY) - tooltipHeight - 16
  )

  return {
    point,
    width: tooltipWidth,
    height: tooltipHeight,
    x: tooltipX,
    y: tooltipY
  }
})

const overviewItems = computed(() => [
  { label: t('dashboard.overview.currentAccount'), value: dashboardData.value.user.username || '--' },
  { label: t('dashboard.overview.recentVisits'), value: t('dashboard.overview.pages', { count: dashboardData.value.recentVisits.length }) },
  { label: t('dashboard.overview.notices'), value: t('dashboard.overview.items', { count: dashboardData.value.notices.length }) },
  { label: t('dashboard.overview.trendRange'), value: t('dashboard.overview.days', { count: trendRange.value }) }
])

onMounted(async () => {
  currentTime.value = new Date()
  clockTimer = window.setInterval(() => {
    currentTime.value = new Date()
  }, 60 * 1000)

  await loadDashboard()
})

onBeforeUnmount(() => {
  if (clockTimer !== null)
    window.clearInterval(clockTimer)
})

async function loadDashboard() {
  loading.value = true
  try {
    const { data } = await getDashboardOverviewApi()
    dashboardData.value = data
  }
  finally {
    loading.value = false
  }
}

function openPage(path: string) {
  router.push(path)
}

function openNoticePage() {
  router.push('/systemManagement/system/notice')
}

function setActiveTrend(index: number) {
  activeTrendIndex.value = index
}

function clearActiveTrend() {
  activeTrendIndex.value = null
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function noticeDate(value?: string | null) {
  if (!value) return '--'
  return new Intl.DateTimeFormat(currentLocale.value, {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value))
}

function noticeType(type: string) {
  return ({
    NOTICE: t('dashboard.notices.types.notice'),
    ANNOUNCEMENT: t('dashboard.notices.types.announcement'),
    SYSTEM: t('dashboard.notices.types.system'),
    system: t('dashboard.notices.types.system')
  } as Record<string, string>)[type] || type
}

function expandTrend(
  items: DashboardViewState['trend'],
  count: number
) {
  const map = new Map(items.map(item => [item.date, item]))
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (count - index - 1))
    const key = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    const current = map.get(key)
    return current || {
      date: key,
      pv: 0,
      uv: 0
    }
  })
}

function buildChart(items: Array<{ date: string, pv: number, uv: number }>) {
  const width = 860
  const height = 330
  const left = 56
  const top = 18
  const right = 18
  const bottom = 44
  const chartWidth = width - left - right
  const chartHeight = height - top - bottom
  const max = Math.max(...items.flatMap(item => [item.pv, item.uv]), 1)
  const gap = items.length > 1 ? chartWidth / (items.length - 1) : chartWidth / 2
  const bottomY = top + chartHeight
  const rows = [1, 0.75, 0.5, 0.25, 0]
  const labelStep = items.length > 12 ? Math.ceil(items.length / 7) : 1

  const points: TrendChartPoint[] = items.map((item, index) => {
    const x = items.length > 1 ? left + gap * index : left + chartWidth / 2
    const start = items.length > 1
      ? (index === 0 ? left : x - gap / 2)
      : left
    const end = items.length > 1
      ? (index === items.length - 1 ? left + chartWidth : x + gap / 2)
      : left + chartWidth

    return {
      ...item,
      label: item.date.slice(5),
      x,
      pvY: bottomY - (item.pv / max) * chartHeight,
      uvY: bottomY - (item.uv / max) * chartHeight,
      showLabel: items.length <= 12 || index === 0 || index === items.length - 1 || index % labelStep === 0,
      hitStart: start,
      hitWidth: Math.max(end - start, 24)
    }
  })
  const pvPoints = points.map(point => ({ x: point.x, y: point.pvY }))
  const uvPoints = points.map(point => ({ x: point.x, y: point.uvY }))

  return {
    width,
    height,
    left,
    top,
    chartWidth,
    chartHeight,
    bottomY,
    rows: rows.map(rate => ({
      y: top + chartHeight * (1 - rate),
      value: Number((max * rate).toFixed(0))
    })),
    points,
    labelPoints: points.filter(point => point.showLabel),
    pvPoints,
    uvPoints,
    pvPath: linePath(pvPoints),
    uvPath: linePath(uvPoints),
    pvArea: areaPath(pvPoints, bottomY),
    uvArea: areaPath(uvPoints, bottomY)
  }
}

function linePath(points: Array<{ x: number, y: number }>) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
}

function areaPath(points: Array<{ x: number, y: number }>, bottomY: number) {
  if (!points.length) return ''
  const first = points[0]
  const last = points[points.length - 1]
  return [`M ${first.x} ${bottomY}`, ...points.map(point => `L ${point.x} ${point.y}`), `L ${last.x} ${bottomY}`, 'Z'].join(' ')
}
</script>

<template>
  <div class="dashboard-page">
    <section class="hero-card">
      <div class="hero-main">
        <div class="hero-avatar">{{ avatarText }}</div>
        <div class="hero-copy">
          <div class="hero-date">{{ dateText }}</div>
          <h1>{{ greeting }}, {{ displayName }}</h1>
          <p>{{ t('dashboard.hero.description', { username: dashboardData.user.username }) }}</p>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-time">{{ timeText }}</div>
        <div class="hero-tags">
          <span>{{ t('dashboard.hero.tags.tenant') }}</span>
          <span>{{ t('dashboard.hero.tags.data') }}</span>
        </div>
      </div>
    </section>

    <section class="stats-grid">
      <article v-for="card in statCards" :key="card.title" class="stat-card" :style="{ '--accent': card.accent }">
        <div class="stat-header">
          <div>
            <div class="stat-title">{{ card.title }}</div>
            <div class="stat-helper">{{ card.helper }}</div>
          </div>
          <div class="stat-icon">
            <Icon :icon="card.icon" />
          </div>
        </div>
        <div class="stat-value">
          {{ card.value }}<span v-if="card.unit">{{ card.unit }}</span>
        </div>
        <div class="stat-footer">{{ card.footer }}</div>
      </article>
    </section>

    <section class="workspace-grid">
      <article class="panel">
        <header class="panel-header">
          <div>
            <p>{{ t('dashboard.sections.quickActions') }}</p>
            <h2>{{ t('dashboard.sections.quickActionsTitle') }}</h2>
          </div>
        </header>

        <div class="quick-entry-grid">
          <button
            v-for="item in quickEntryItems"
            :key="item.path"
            type="button"
            class="quick-entry-card"
            @click="openPage(item.path)"
          >
            <div class="quick-entry-card__head">
              <div class="quick-entry-card__icon">
                <Icon :icon="item.icon" />
              </div>
              <n-tag size="small" round>{{ item.tag }}</n-tag>
            </div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.description }}</p>
            <div class="quick-entry-card__meta">
              <span>{{ item.metric }}</span>
              <Icon icon="solar:arrow-right-up-linear" />
            </div>
          </button>
        </div>
      </article>

      <article class="panel">
        <header class="panel-header">
          <div>
            <p>{{ t('dashboard.sections.todoBoard') }}</p>
            <h2>{{ t('dashboard.sections.todoBoardTitle') }}</h2>
          </div>
        </header>

        <div class="todo-list">
          <button
            v-for="item in todoItems"
            :key="`${item.title}-${item.path}`"
            type="button"
            class="todo-card"
            @click="openPage(item.path)"
          >
            <div class="todo-card__head">
              <div class="todo-card__icon">
                <Icon :icon="item.icon" />
              </div>
              <n-tag size="small" type="warning" round>{{ item.tag }}</n-tag>
            </div>
            <strong>{{ item.title }}</strong>
            <p>{{ item.summary }}</p>
            <div class="todo-card__footer">
              <span>{{ item.actionLabel }}</span>
              <Icon icon="solar:arrow-right-linear" />
            </div>
          </button>
        </div>
      </article>
    </section>

    <section class="info-stack">
      <article class="panel">
        <header class="panel-header">
          <div>
            <p>{{ t('dashboard.sections.systemSnapshot') }}</p>
            <h2>{{ t('dashboard.sections.systemSnapshotTitle') }}</h2>
          </div>
        </header>
        <div class="overview-list">
          <div v-for="item in overviewItems" :key="item.label" class="overview-item">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </article>

      <article class="panel">
        <header class="panel-header">
          <div>
            <p>{{ t('dashboard.sections.platformNotice') }}</p>
            <h2>{{ t('dashboard.sections.platformNoticeTitle') }}</h2>
          </div>
          <n-button text type="primary" @click="openNoticePage">{{ t('dashboard.notices.viewAll') }}</n-button>
        </header>

        <div v-if="loading" class="notice-loading">
          <n-skeleton v-for="index in 3" :key="index" text :repeat="2" />
        </div>
        <div v-else-if="dashboardData.notices.length" class="notice-list">
          <button v-for="item in dashboardData.notices" :key="item.id" type="button" class="notice-card" @click="openNoticePage">
            <div class="notice-head">
              <strong>{{ item.title }}</strong>
              <n-tag size="small" type="info" round>{{ noticeType(item.type) }}</n-tag>
            </div>
            <p>{{ item.content }}</p>
            <div class="notice-meta">
              <span>{{ item.publisher || t('dashboard.notices.systemPublisher') }}</span>
              <span>{{ noticeDate(item.publishedAt || item.createdAt) }}</span>
            </div>
          </button>
        </div>
        <n-empty v-else :description="t('dashboard.notices.empty')" />
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <header class="panel-header">
          <div>
            <p>{{ t('dashboard.sections.accessTrend') }}</p>
            <h2>{{ t('dashboard.sections.accessTrendTitle') }}</h2>
          </div>
          <div class="panel-actions">
            <n-button size="small" :type="trendRange === 7 ? 'primary' : 'default'" @click="trendRange = 7">{{ t('dashboard.trend.last7Days') }}</n-button>
            <n-button size="small" :type="trendRange === 30 ? 'primary' : 'default'" @click="trendRange = 30">{{ t('dashboard.trend.last30Days') }}</n-button>
          </div>
        </header>

        <div class="chart-wrap" @mouseleave="clearActiveTrend">
          <n-skeleton v-if="loading" text :repeat="8" />
          <svg v-else :viewBox="`0 0 ${chart.width} ${chart.height}`" role="img" :aria-label="t('dashboard.trend.ariaLabel')">
            <line
              v-for="row in chart.rows"
              :key="`row-${row.y}`"
              :x1="chart.left"
              :x2="chart.left + chart.chartWidth"
              :y1="row.y"
              :y2="row.y"
              class="chart-grid"
            />
            <text
              v-for="row in chart.rows"
              :key="`row-text-${row.y}`"
              :x="chart.left - 12"
              :y="row.y + 4"
              class="chart-axis"
              text-anchor="end"
            >
              {{ row.value }}
            </text>

            <path :d="chart.uvArea" class="chart-area chart-area--uv" />
            <path :d="chart.pvArea" class="chart-area chart-area--pv" />
            <path :d="chart.pvPath" class="chart-line chart-line--pv" />
            <path :d="chart.uvPath" class="chart-line chart-line--uv" />

            <line
              v-if="activeTrendPoint"
              :x1="activeTrendPoint.x"
              :x2="activeTrendPoint.x"
              :y1="chart.top"
              :y2="chart.bottomY"
              class="chart-focus-line"
            />

            <circle
              v-for="point in chart.points"
              :key="`pv-${point.date}`"
              :cx="point.x"
              :cy="point.pvY"
              :r="activeTrendPoint?.date === point.date ? 6 : 4"
              class="chart-dot chart-dot--pv"
              :class="{ 'chart-dot--active': activeTrendPoint?.date === point.date }"
            />
            <circle
              v-for="point in chart.points"
              :key="`uv-${point.date}`"
              :cx="point.x"
              :cy="point.uvY"
              :r="activeTrendPoint?.date === point.date ? 6 : 4"
              class="chart-dot chart-dot--uv"
              :class="{ 'chart-dot--active': activeTrendPoint?.date === point.date }"
            />

            <g v-if="activeTrendTooltip" class="chart-tooltip">
              <rect
                :x="activeTrendTooltip.x"
                :y="activeTrendTooltip.y"
                :width="activeTrendTooltip.width"
                :height="activeTrendTooltip.height"
                rx="14"
                class="chart-tooltip-box"
              />
              <text
                :x="activeTrendTooltip.x + 14"
                :y="activeTrendTooltip.y + 20"
                class="chart-tooltip-date"
              >
                {{ activeTrendTooltip.point.date }}
              </text>
              <circle :cx="activeTrendTooltip.x + 16" :cy="activeTrendTooltip.y + 37" r="4" class="chart-dot chart-dot--pv" />
              <text :x="activeTrendTooltip.x + 28" :y="activeTrendTooltip.y + 41" class="chart-tooltip-text">
                PV {{ activeTrendTooltip.point.pv }}
              </text>
              <circle :cx="activeTrendTooltip.x + 16" :cy="activeTrendTooltip.y + 54" r="4" class="chart-dot chart-dot--uv" />
              <text :x="activeTrendTooltip.x + 28" :y="activeTrendTooltip.y + 58" class="chart-tooltip-text">
                UV {{ activeTrendTooltip.point.uv }}
              </text>
            </g>

            <text
              v-for="point in chart.labelPoints"
              :key="`label-${point.date}`"
              :x="point.x"
              :y="chart.bottomY + 24"
              class="chart-axis"
              text-anchor="middle"
            >
              {{ point.label }}
            </text>

            <rect
              v-for="(point, index) in chart.points"
              :key="`hit-${point.date}`"
              :x="point.hitStart"
              :y="chart.top"
              :width="point.hitWidth"
              :height="chart.chartHeight + 36"
              class="chart-hit-area"
              @mouseenter="setActiveTrend(index)"
            />
          </svg>
        </div>

        <div class="legend">
          <div><span class="legend-dot legend-dot--pv" /> {{ t('dashboard.trend.pv') }}</div>
          <div><span class="legend-dot legend-dot--uv" /> {{ t('dashboard.trend.uv') }}</div>
        </div>
      </article>

      <article class="panel">
        <header class="panel-header">
          <div>
            <p>{{ t('dashboard.sections.recentVisit') }}</p>
            <h2>{{ t('dashboard.sections.recentVisitTitle') }}</h2>
          </div>
        </header>

        <div v-if="loading" class="notice-loading">
          <n-skeleton v-for="index in 4" :key="index" text :repeat="2" />
        </div>
        <div v-else class="visit-list">
          <button v-for="item in dashboardData.recentVisits" :key="item.routePath" type="button" class="visit-card" @click="openPage(item.routePath)">
            <div class="visit-icon"><Icon :icon="item.routeIcon || 'solar:history-linear'" /></div>
            <div class="visit-copy">
              <strong>{{ item.routeTitle }}</strong>
              <span>{{ noticeDate(item.lastVisitedAt) }} {{ t('dashboard.recentVisit.label') }}</span>
            </div>
            <Icon icon="solar:arrow-right-up-linear" class="visit-arrow" />
          </button>
          <n-empty v-if="!dashboardData.recentVisits.length" :description="t('dashboard.recentVisit.empty')" />
        </div>
      </article>
    </section>

    <section v-if="false" class="bottom-grid">
      <article class="panel">
        <header class="panel-header">
          <div>
            <p>Notices</p>
            <h2>通知公告</h2>
          </div>
          <n-button text type="primary" @click="openNoticePage">{{ t('dashboard.notices.viewAll') }}</n-button>
        </header>

        <div v-if="loading" class="notice-loading">
          <n-skeleton v-for="index in 3" :key="index" text :repeat="2" />
        </div>
        <div v-else-if="dashboardData.notices.length" class="notice-list">
          <button v-for="item in dashboardData.notices" :key="item.id" type="button" class="notice-card" @click="openNoticePage">
            <div class="notice-head">
              <strong>{{ item.title }}</strong>
              <n-tag size="small" type="info" round>{{ noticeType(item.type) }}</n-tag>
            </div>
            <p>{{ item.content }}</p>
            <div class="notice-meta">
              <span>{{ item.publisher || t('dashboard.notices.systemPublisher') }}</span>
              <span>{{ noticeDate(item.publishedAt || item.createdAt) }}</span>
            </div>
          </button>
        </div>
        <n-empty v-else :description="t('dashboard.notices.empty')" />
      </article>

      <div class="side-stack">
        <article class="panel">
          <header class="panel-header">
            <div>
              <p>{{ t('dashboard.sections.systemSnapshot') }}</p>
              <h2>{{ t('dashboard.sections.systemSnapshotTitle') }}</h2>
            </div>
          </header>
          <div class="overview-list">
            <div v-for="item in overviewItems" :key="item.label" class="overview-item">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-card,
.panel,
.stat-card {
  border: 1px solid rgba(14, 116, 144, 0.08);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(247, 250, 252, 0.98)),
    radial-gradient(circle at top right, rgba(45, 212, 191, 0.12), transparent 36%);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.hero-card {
  padding: 28px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background:
    radial-gradient(circle at top left, rgba(14, 165, 233, 0.16), transparent 28%),
    radial-gradient(circle at bottom right, rgba(16, 185, 129, 0.18), transparent 30%),
    linear-gradient(135deg, #fff 0%, #f6fbff 55%, #effaf7 100%);
}

.hero-main {
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
}

.hero-avatar,
.stat-icon,
.visit-icon {
  display: grid;
  place-items: center;
}

.hero-avatar {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
  box-shadow: 0 14px 30px rgba(15, 118, 110, 0.22);
}

.hero-copy {
  min-width: 0;

  h1 {
    margin: 0;
    font-size: 30px;
    line-height: 1.2;
    color: #0f172a;
  }

  p {
    margin: 10px 0 0;
    color: #475569;
    line-height: 1.7;
  }
}

.hero-date {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #0f766e;
}

.hero-side {
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.hero-time {
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
}

.hero-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  span {
    border-radius: 999px;
    padding: 6px 12px;
    font-size: 12px;
    color: #0f766e;
    background: rgba(15, 118, 110, 0.1);
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.95fr);
  gap: 16px;
}

.stat-card {
  padding: 20px 22px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: var(--accent);
  }
}

.stat-header,
.panel-header,
.notice-head,
.notice-meta,
.overview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.stat-title {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.stat-helper {
  margin-top: 6px;
  font-size: 12px;
  color: #64748b;
}

.stat-icon,
.visit-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-size: 22px;
  color: var(--accent, #2563eb);
  background: color-mix(in srgb, var(--accent, #2563eb) 14%, white);
}

.stat-value {
  margin-top: 22px;
  font-size: 34px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.04em;

  span {
    margin-left: 6px;
    font-size: 16px;
    font-weight: 500;
    color: #64748b;
  }
}

.stat-footer {
  margin-top: 18px;
  font-size: 13px;
  color: #475569;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(320px, 0.95fr);
  gap: 16px;
}

.info-stack {
  display: grid;
  gap: 16px;
}

.panel {
  padding: 22px 22px 20px;
}

.panel-header {
  margin-bottom: 18px;

  p {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #0f766e;
  }

  h2 {
    margin: 2px 0 0;
    font-size: 22px;
    line-height: 1.2;
    color: #0f172a;
  }
}

.panel-actions {
  display: flex;
  gap: 8px;
}

.chart-wrap {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  padding: 14px 8px 6px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(241, 245, 249, 0.88));

  svg {
    width: 100%;
    height: auto;
    display: block;
  }
}

.chart-grid {
  stroke: rgba(148, 163, 184, 0.24);
  stroke-dasharray: 4 6;
}

.chart-hit-area {
  fill: transparent;
  cursor: pointer;
}

.chart-axis {
  fill: #64748b;
  font-size: 12px;
}

.chart-focus-line {
  stroke: rgba(37, 99, 235, 0.18);
  stroke-width: 1.5;
  stroke-dasharray: 4 6;
}

.chart-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-line--pv {
  stroke: #2563eb;
}

.chart-line--uv {
  stroke: #10b981;
}

.chart-area {
  opacity: 0.16;
}

.chart-area--pv {
  fill: #60a5fa;
}

.chart-area--uv {
  fill: #34d399;
}

.chart-dot {
  stroke: #fff;
  stroke-width: 2;
  transition: r 0.18s ease, stroke-width 0.18s ease, filter 0.18s ease;
}

.chart-dot--pv {
  fill: #2563eb;
}

.chart-dot--uv {
  fill: #10b981;
}

.chart-dot--active {
  stroke-width: 4;
  filter: drop-shadow(0 4px 10px rgba(15, 23, 42, 0.2));
}

.chart-tooltip-box {
  fill: rgba(255, 255, 255, 0.98);
  stroke: rgba(148, 163, 184, 0.26);
  stroke-width: 1;
}

.chart-tooltip-date {
  fill: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.chart-tooltip-text {
  fill: #475569;
  font-size: 12px;
}

.legend {
  margin-top: 10px;
  display: flex;
  gap: 18px;
  flex-wrap: wrap;
  color: #475569;
  font-size: 13px;

  div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.legend-dot--pv {
  background: #2563eb;
}

.legend-dot--uv {
  background: #10b981;
}

.visit-list,
.notice-list,
.notice-loading,
.overview-list,
.todo-list,
.quick-entry-grid {
  display: grid;
  gap: 12px;
}

.quick-entry-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.notice-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.overview-list {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.visit-card,
.notice-card,
.quick-entry-card,
.todo-card {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.visit-card:hover,
.notice-card:hover,
.quick-entry-card:hover,
.todo-card:hover {
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.22);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
}

.visit-card {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.visit-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;

  strong {
    color: #0f172a;
    font-size: 15px;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.visit-arrow {
  color: #94a3b8;
  font-size: 18px;
}

.quick-entry-card,
.todo-card {
  width: 100%;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;
}

.quick-entry-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-entry-card__head,
.todo-card__head,
.quick-entry-card__meta,
.todo-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.quick-entry-card__icon,
.todo-card__icon {
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  font-size: 20px;
  color: #0f766e;
  background: rgba(15, 118, 110, 0.1);
}

.quick-entry-card strong,
.todo-card strong {
  color: #0f172a;
  font-size: 16px;
}

.quick-entry-card p,
.todo-card p {
  margin: 0;
  color: #475569;
  line-height: 1.7;
}

.quick-entry-card__meta,
.todo-card__footer {
  color: #64748b;
  font-size: 13px;
}

.todo-list {
  grid-template-columns: 1fr;
}

.todo-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.notice-card {
  width: 100%;
  padding: 16px 18px;
  text-align: left;
  cursor: pointer;

  p {
    margin: 10px 0 14px;
    color: #475569;
    line-height: 1.7;
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.notice-head strong,
.overview-item strong {
  color: #0f172a;
}

.notice-meta {
  font-size: 12px;
  color: #64748b;
}

.overview-item {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(248, 250, 252, 0.88);
  color: #64748b;
}

@media (max-width: 1280px) {
  .workspace-grid,
  .content-grid,
  .overview-list,
  .notice-list {
    grid-template-columns: 1fr;
  }

  .quick-entry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .hero-card {
    padding: 22px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-side {
    width: 100%;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .dashboard-page {
    gap: 14px;
  }

  .overview-list {
    grid-template-columns: 1fr;
  }

  .quick-entry-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .hero-main {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-copy h1 {
    font-size: 24px;
  }

  .panel,
  .stat-card {
    padding: 18px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .panel-actions {
    width: 100%;
  }
}
</style>
