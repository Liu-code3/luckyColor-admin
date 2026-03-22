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

const router = useRouter()

const loading = ref(false)
const currentTime = ref(new Date())
const trendRange = ref<7 | 30>(7)
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
  }
])

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

function pad(value: number) {
  return value.toString().padStart(2, '0')
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

  const mapPoint = (value: number, index: number) => ({
    x: items.length > 1 ? left + gap * index : left + chartWidth / 2,
    y: bottomY - (value / max) * chartHeight
  })

  const pvPoints = items.map((item, index) => ({
    ...item,
    label: item.date.slice(5),
    ...mapPoint(item.pv, index)
  }))
  const uvPoints = items.map((item, index) => ({
    ...item,
    label: item.date.slice(5),
    ...mapPoint(item.uv, index)
  }))

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

        <div class="chart-wrap">
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

            <circle v-for="point in chart.pvPoints" :key="`pv-${point.date}`" :cx="point.x" :cy="point.y" r="4" class="chart-dot chart-dot--pv" />
            <circle v-for="point in chart.uvPoints" :key="`uv-${point.date}`" :cx="point.x" :cy="point.y" r="4" class="chart-dot chart-dot--uv" />

            <text
              v-for="point in chart.pvPoints"
              :key="`label-${point.date}`"
              :x="point.x"
              :y="chart.bottomY + 24"
              class="chart-axis"
              text-anchor="middle"
            >
              {{ point.label }}
            </text>
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

    <section class="bottom-grid">
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
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

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  gap: 16px;
}

.side-stack {
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

.chart-axis {
  fill: #64748b;
  font-size: 12px;
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
}

.chart-dot--pv {
  fill: #2563eb;
}

.chart-dot--uv {
  fill: #10b981;
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
.overview-list {
  display: grid;
  gap: 12px;
}

.visit-card,
.notice-card {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.visit-card:hover,
.notice-card:hover {
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
  .content-grid,
  .bottom-grid {
    grid-template-columns: 1fr;
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
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-page {
    gap: 14px;
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
