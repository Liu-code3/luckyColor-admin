<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

const loading = ref(false)
const currentTime = ref(new Date())
const trendRange = ref<7 | 30>(7)
const activeTrendIndex = ref<number | null>(null)
let clockTimer: number | null = null
const dashboardData = ref<DashboardViewState>({
  user: {
    id: '',
    username: 'admin',
    nickname: '平台管理员'
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

const displayName = computed(() => dashboardData.value.user.nickname || dashboardData.value.user.username)
const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

const greeting = computed(() => {
  const hour = currentTime.value.getHours()
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const dateText = computed(() => {
  const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${currentTime.value.getFullYear()}年${currentTime.value.getMonth() + 1}月${currentTime.value.getDate()}日 ${weekNames[currentTime.value.getDay()]}`
})

const timeText = computed(() => `${pad(currentTime.value.getHours())}:${pad(currentTime.value.getMinutes())}`)

const statCards = computed(() => [
  {
    title: '在线用户',
    value: dashboardData.value.stats.onlineUsers,
    unit: '人',
    icon: 'solar:users-group-rounded-linear',
    accent: '#0f766e',
    helper: `最近 ${Math.floor(dashboardData.value.stats.onlineWindowSeconds / 60)} 分钟活跃会话`,
    footer: `${dashboardData.value.stats.onlineUsers} 人在线`
  },
  {
    title: '访客数 UV',
    value: dashboardData.value.stats.visitorUv,
    unit: '',
    icon: 'solar:user-id-linear',
    accent: '#2563eb',
    helper: '今日独立访客数',
    footer: `${dashboardData.value.stats.visitorUv} 位访客`
  },
  {
    title: '浏览量 PV',
    value: dashboardData.value.stats.pageViews,
    unit: '',
    icon: 'solar:eye-linear',
    accent: '#f97316',
    helper: '今日页面访问量',
    footer: `${dashboardData.value.stats.pageViews} 次浏览`
  },
  {
    title: '待办事项',
    value: todoItems.value.length,
    unit: '项',
    icon: 'solar:checklist-minimalistic-linear',
    accent: '#7c3aed',
    helper: '当前工作台建议优先处理的运营动作',
    footer: `${todoItems.value.length} 项待跟进`
  }
])

const quickEntryItems = computed<QuickEntryItem[]>(() => [
  {
    title: '用户管理',
    description: '处理账号新增、角色分配与成员维护。',
    path: '/systemManagement/system/users',
    icon: 'solar:users-group-rounded-linear',
    tag: '账号',
    metric: `${dashboardData.value.recentVisits.length} 条访问`
  },
  {
    title: '角色权限',
    description: '统一管理菜单、按钮与数据权限策略。',
    path: '/systemManagement/system/role',
    icon: 'solar:shield-user-linear',
    tag: '权限',
    metric: `${dashboardData.value.notices.length} 条公告关联`
  },
  {
    title: '菜单管理',
    description: '维护动态菜单结构与可见性配置。',
    path: '/systemManagement/system/menu',
    icon: 'solar:widget-4-linear',
    tag: '导航',
    metric: `${trendRange.value} 天趋势`
  },
  {
    title: '字典管理',
    description: '统一维护业务字典与基础选项集。',
    path: '/systemManagement/system/dict',
    icon: 'solar:book-bookmark-linear',
    tag: '基础数据',
    metric: `${dashboardData.value.stats.pageViews} 次浏览`
  },
  {
    title: '租户管理',
    description: '查看租户状态、到期信息与初始化结果。',
    path: '/tenantCenter/tenant',
    icon: 'solar:buildings-2-linear',
    tag: 'SaaS',
    metric: `${dashboardData.value.stats.onlineUsers} 人在线`
  },
  {
    title: '租户套餐',
    description: '收敛套餐能力、开关与可用范围。',
    path: '/tenantCenter/tenantPackage',
    icon: 'solar:box-linear',
    tag: '套餐',
    metric: `${dashboardData.value.stats.visitorUv} UV`
  }
])

const todoItems = computed<TodoItem[]>(() => {
  const latestNotice = dashboardData.value.notices[0]
  const latestVisit = dashboardData.value.recentVisits[0]

  return [
    {
      title: latestNotice ? '复核平台公告内容' : '补充平台公告',
      summary: latestNotice
        ? `最近一条公告为“${latestNotice.title}”，建议检查发布时间与内容是否仍然有效。`
        : '当前暂无可展示公告，建议补充系统通知或平台公告。',
      path: '/systemManagement/system/notice',
      icon: 'solar:bell-linear',
      tag: latestNotice ? '公告巡检' : '待发布',
      actionLabel: latestNotice ? '查看公告' : '前往发布'
    },
    {
      title: '巡检角色授权策略',
      summary: '重点核对核心角色的菜单权限、按钮权限与数据权限是否匹配当前业务边界。',
      path: '/systemManagement/system/role',
      icon: 'solar:shield-keyhole-linear',
      tag: '权限治理',
      actionLabel: '检查权限'
    },
    {
      title: '跟进高频访问入口',
      summary: latestVisit
        ? `最近访问最高频入口可从“${latestVisit.routeTitle}”开始复查，确认页面数据与操作链路是否正常。`
        : '当前暂无最近访问记录，可从用户管理或租户管理开始巡检。',
      path: latestVisit?.routePath || '/systemManagement/system/users',
      icon: 'solar:cursor-square-linear',
      tag: '活跃入口',
      actionLabel: '打开页面'
    },
    {
      title: '关注租户活跃与容量',
      summary: `当前 ${dashboardData.value.stats.onlineUsers} 位在线用户、${dashboardData.value.stats.visitorUv} 位访客，建议同步检查租户使用情况与套餐容量。`,
      path: '/tenantCenter/tenant',
      icon: 'solar:monitor-smartphone-linear',
      tag: '租户运营',
      actionLabel: '查看租户'
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
  { label: '当前账号', value: dashboardData.value.user.username || '--' },
  { label: '最近访问', value: `${dashboardData.value.recentVisits.length} 项` },
  { label: '公告条数', value: `${dashboardData.value.notices.length} 条` },
  { label: '趋势周期', value: `最近 ${trendRange.value} 天` }
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
  const date = new Date(value)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

function noticeType(type: string) {
  return ({
    NOTICE: '通知',
    ANNOUNCEMENT: '公告',
    SYSTEM: '系统',
    system: '系统'
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
          <h1>{{ greeting }}，{{ displayName }}</h1>
          <p>当前账号 {{ dashboardData.user.username }}，这里汇总了今天的访问概况、最近访问和通知公告，所有核心数字均来自后端实时统计接口。</p>
        </div>
      </div>
      <div class="hero-side">
        <div class="hero-time">{{ timeText }}</div>
        <div class="hero-tags">
          <span>租户后台</span>
          <span>真实数据</span>
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
            <p>Quick Actions</p>
            <h2>快捷入口</h2>
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
            <p>Todo Board</p>
            <h2>待办事项</h2>
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
            <p>System Snapshot</p>
            <h2>系统概览</h2>
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
            <p>Platform Notice</p>
            <h2>平台公告</h2>
          </div>
          <n-button text type="primary" @click="openNoticePage">查看全部</n-button>
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
              <span>{{ item.publisher || '系统发布' }}</span>
              <span>{{ noticeDate(item.publishedAt || item.createdAt) }}</span>
            </div>
          </button>
        </div>
        <n-empty v-else description="暂无公告内容" />
      </article>
    </section>

    <section class="content-grid">
      <article class="panel">
        <header class="panel-header">
          <div>
            <p>Access Trend</p>
            <h2>访问趋势</h2>
          </div>
          <div class="panel-actions">
            <n-button size="small" :type="trendRange === 7 ? 'primary' : 'default'" @click="trendRange = 7">最近 7 天</n-button>
            <n-button size="small" :type="trendRange === 30 ? 'primary' : 'default'" @click="trendRange = 30">最近 30 天</n-button>
          </div>
        </header>

        <div class="chart-wrap" @mouseleave="clearActiveTrend">
          <n-skeleton v-if="loading" text :repeat="8" />
          <svg v-else :viewBox="`0 0 ${chart.width} ${chart.height}`" role="img" aria-label="访问趋势图">
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
          <div><span class="legend-dot legend-dot--pv" /> 浏览量 PV</div>
          <div><span class="legend-dot legend-dot--uv" /> 访客数 UV</div>
        </div>
      </article>

      <article class="panel">
        <header class="panel-header">
          <div>
            <p>Recent Visit</p>
            <h2>最近访问</h2>
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
              <span>{{ noticeDate(item.lastVisitedAt) }} 最近访问</span>
            </div>
            <Icon icon="solar:arrow-right-up-linear" class="visit-arrow" />
          </button>
          <n-empty v-if="!dashboardData.recentVisits.length" description="暂无最近访问记录" />
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
          <n-button text type="primary" @click="openNoticePage">查看全部</n-button>
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
              <span>{{ item.publisher || '系统发布' }}</span>
              <span>{{ noticeDate(item.publishedAt || item.createdAt) }}</span>
            </div>
          </button>
        </div>
        <n-empty v-else description="暂无公告内容" />
      </article>

      <div class="side-stack">
        <article class="panel">
          <header class="panel-header">
            <div>
              <p>System Snapshot</p>
              <h2>系统概览</h2>
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
