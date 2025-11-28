<template>
  <div class="hospital-overview">
    <!-- KPI 指标行 -->
    <div class="kpi-section">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(item, index) in kpiList" :key="index">
          <el-card shadow="hover" class="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon" :class="'kpi-icon--' + index">
                <el-icon><component :is="kpiIcons[index]" /></el-icon>
              </div>
              <div class="kpi-data">
                <div class="kpi-title">{{ item.title }}</div>
                <div class="kpi-value">{{ item.value }}</div>
                <div class="kpi-desc">{{ item.desc }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 中间区域：大图 + 右侧小卡片 -->
    <div class="main-section">
      <div class="main-chart-wrapper">
        <el-card shadow="hover" class="full-height-card">
          <template #header>
            <div class="card-header">
              <span>年度就诊概览</span>
              <el-tag size="small" effect="plain">2023年度</el-tag>
            </div>
          </template>
          <div ref="lineRef" class="chart-box"></div>
        </el-card>
      </div>

      <div class="side-cards-wrapper">
        <div class="side-grid">
          <el-card shadow="hover" class="side-card">
            <template #header><span class="sm-header">门诊/住院占比</span></template>
            <div ref="pieRef" class="chart-box"></div>
          </el-card>
          
          <el-card shadow="hover" class="side-card">
            <template #header><span class="sm-header">本周门诊趋势</span></template>
            <div ref="miniOutpatientRef" class="chart-box"></div>
          </el-card>

          <el-card shadow="hover" class="side-card">
            <template #header><span class="sm-header">床位使用趋势</span></template>
            <div ref="miniBedsRef" class="chart-box"></div>
          </el-card>

          <el-card shadow="hover" class="side-card stat-card">
             <template #header><span class="sm-header">平均等候时长</span></template>
            <div class="stat-box">
              <div class="stat-value">14.6 <span class="unit">分钟</span></div>
              <el-progress 
                :percentage="64" 
                :stroke-width="10" 
                status="success" 
                :show-text="false"
                class="mt-2"
              />
              <div class="stat-footer">
                <span>同比下降 12%</span>
                <el-icon color="#67C23A"><Bottom /></el-icon>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 底部区域 -->
    <div class="bottom-section">
      <el-row :gutter="20">
        <el-col :span="10">
          <el-card shadow="hover" class="full-height-card">
            <template #header><span>重点科室门诊量</span></template>
            <div ref="barRef" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="full-height-card">
            <template #header><span>床位占用率</span></template>
            <div ref="gaugeRef" class="chart-box"></div>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover" class="full-height-card">
            <template #header><span>忙碌科室排行</span></template>
            <div class="rank-list">
              <div class="rank-item" v-for="(dept, idx) in rankList" :key="idx">
                <div class="rank-info">
                  <span class="rank-name">{{ dept.name }}</span>
                  <span class="rank-val">{{ dept.value }}%</span>
                </div>
                <el-progress 
                  :percentage="dept.value" 
                  :stroke-width="8" 
                  :color="dept.color"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { DataLine, User, FirstAidKit, OfficeBuilding, Bottom } from '@element-plus/icons-vue'

// --- 数据定义 ---
const metrics = reactive({
  totalBeds: 500,
  occupiedBeds: 362,
  doctors: 128,
  nurses: 296,
  outpatientToday: 842,
  inpatientToday: 34,
  departments: 36,
  activeDepartments: 33
})

const kpiList = [
  { title: '总床位', value: metrics.totalBeds, desc: `在院占用：${metrics.occupiedBeds}` },
  { title: '医护人数', value: metrics.doctors + metrics.nurses, desc: `医生：${metrics.doctors} / 护士：${metrics.nurses}` },
  { title: '今日门诊', value: metrics.outpatientToday, desc: `住院新增：${metrics.inpatientToday}` },
  { title: '科室总数', value: metrics.departments, desc: `运行中：${metrics.activeDepartments}` }
]

const kpiIcons = [DataLine, User, FirstAidKit, OfficeBuilding]

const rankList = [
  { name: '心血管科', value: 85, color: '#F56C6C' },
  { name: '神经内科', value: 72, color: '#E6A23C' },
  { name: '儿科', value: 64, color: '#409EFF' },
  { name: '呼吸科', value: 55, color: '#67C23A' },
  { name: '骨科', value: 42, color: '#909399' }
]

// --- 图表引用 ---
const lineRef = ref<HTMLDivElement | null>(null)
const pieRef = ref<HTMLDivElement | null>(null)
const barRef = ref<HTMLDivElement | null>(null)
const gaugeRef = ref<HTMLDivElement | null>(null)
const miniOutpatientRef = ref<HTMLDivElement | null>(null)
const miniBedsRef = ref<HTMLDivElement | null>(null)

let charts: any[] = []
let lineInst: any = null
let pieInst: any = null
let barInst: any = null
let gaugeInst: any = null
let miniOutInst: any = null
let miniBedsInst: any = null
const isDark = ref(false)

// --- ECharts 加载与初始化 ---
const loadEChartsScript = (): Promise<void> => {
  const sources = [
    'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js',
    'https://unpkg.com/echarts@5/dist/echarts.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.5.0/echarts.min.js'
  ]
  return new Promise(async (resolve, reject) => {
    if ((window as any).echarts) return resolve()
    for (const src of sources) {
      try {
        await new Promise((res, rej) => {
          const script = document.createElement('script')
          script.src = src
          script.async = true
          script.onload = () => res(null)
          script.onerror = (e) => rej(e)
          document.head.appendChild(script)
        })
        if ((window as any).echarts) return resolve()
      } catch {}
    }
    ElMessage.error('ECharts 加载失败，请检查网络后重试')
    reject(new Error('ECharts load failed'))
  })
}

const initChart = (el: HTMLDivElement | null, option: any) => {
  if (!el || !(window as any).echarts) return null
  const echarts = (window as any).echarts
  const inst = echarts.init(el)
  inst.setOption(option)
  charts.push(inst)
  return inst
}

// --- 图表配置生成 ---
const makeLineOption = (dark = false) => ({
  tooltip: { trigger: 'axis' },
  legend: { right: 10, top: 0, textStyle: { color: dark ? '#cbd5e1' : '#606266' } },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'],
    axisLine: { lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } },
    axisLabel: { color: dark ? '#cbd5e1' : '#606266' }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } },
    axisLabel: { color: dark ? '#cbd5e1' : '#606266' },
    splitLine: { lineStyle: { type: 'dashed', color: dark ? '#2a2e37' : '#ebeef5' } }
  },
  series: [
    { name: '门诊', type: 'line', smooth: true, areaStyle: { opacity: 0.1 },
      data: [320, 340, 520, 510, 480, 300, 280, 310, 450, 620, 680, 720],
      itemStyle: { color: '#409EFF' }
    },
    { name: '住院', type: 'line', smooth: true,
      data: [42, 38, 56, 60, 50, 30, 28, 36, 45, 72, 80, 88],
      itemStyle: { color: '#67C23A' }
    }
  ]
})

const makePieOption = (dark = false) => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0, icon: 'circle', textStyle: { color: dark ? '#cbd5e1' : '#606266' } },
  series: [{
    type: 'pie',
    radius: ['40%', '65%'],
    center: ['50%', '45%'],
    itemStyle: { borderRadius: 5, borderColor: dark ? '#1f2937' : '#fff', borderWidth: 2 },
    label: { show: false },
    data: [
      { value: metrics.outpatientToday, name: '门诊' },
      { value: metrics.inpatientToday, name: '住院' }
    ]
  }]
})

const makeBarOption = (dark = false) => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category', data: ['内科','外科','儿科','骨科','心血管','神经'], axisTick: { alignWithLabel: true },
    axisLine: { lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } },
    axisLabel: { color: dark ? '#cbd5e1' : '#606266' }
  },
  yAxis: {
    type: 'value',
    axisLine: { lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } },
    axisLabel: { color: dark ? '#cbd5e1' : '#606266' },
    splitLine: { lineStyle: { type: 'dashed', color: dark ? '#2a2e37' : '#ebeef5' } }
  },
  series: [{ type: 'bar', barWidth: '40%', data: [240, 180, 160, 120, 200, 150], itemStyle: { color: '#409EFF', borderRadius: [4, 4, 0, 0] } }]
})

const makeGaugeOption = (dark = false) => ({
  series: [{
    type: 'gauge',
    startAngle: 210, endAngle: -30,
    min: 0, max: 100,
    splitNumber: 5,
    itemStyle: { color: '#F56C6C' },
    radius: '100%',
    center: ['50%', '62%'],
    progress: { show: true, width: 14 },
    axisLine: { lineStyle: { width: 14, color: [[1, dark ? '#374151' : '#e5e7eb']] } },
    axisTick: { length: 8, lineStyle: { color: 'auto', width: 2 } },
    splitLine: { length: 12, lineStyle: { color: 'auto', width: 3 } },
    axisLabel: { color: dark ? '#cbd5e1' : '#464646', fontSize: 12, distance: -30 },
    title: { offsetCenter: [0, '-18%'], fontSize: 14, color: dark ? '#cbd5e1' : '#303133' },
    detail: { fontSize: 26, offsetCenter: [0, '22%'], valueAnimation: true, formatter: '{value}%', color: dark ? '#cbd5e1' : 'inherit' },
    data: [{ value: Math.round((metrics.occupiedBeds / metrics.totalBeds) * 100), name: '占用率' }]
  }]
})

const makeMiniLineOption = (data: number[], color: string, dark = false) => ({
  grid: { left: 26, right: 16, top: 16, bottom: 26 },
  xAxis: {
    type: 'category', show: true, boundaryGap: false, data: data.map((_, i) => i + 1),
    axisLine: { lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } },
    axisLabel: { color: dark ? '#cbd5e1' : '#606266', fontSize: 11 },
    axisTick: { show: true, lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } }
  },
  yAxis: {
    type: 'value', show: true,
    axisLine: { lineStyle: { color: dark ? '#4b5563' : '#e5e7eb' } },
    axisLabel: { color: dark ? '#cbd5e1' : '#606266', fontSize: 11 },
    splitLine: { lineStyle: { type: 'dashed', color: dark ? '#2a2e37' : '#ebeef5' } }
  },
  series: [{ type: 'line', smooth: true, data, areaStyle: { opacity: 0.15 }, lineStyle: { width: 2 }, itemStyle: { color }, symbol: 'none' }]
})

// --- 生命周期 ---
const handleResize = () => charts.forEach(c => c && c.resize())
const applyTheme = () => {
  const dark = document.documentElement.classList.contains('dark')
  isDark.value = dark
  lineInst?.setOption(makeLineOption(dark), true)
  pieInst?.setOption(makePieOption(dark), true)
  barInst?.setOption(makeBarOption(dark), true)
  gaugeInst?.setOption(makeGaugeOption(dark), true)
  miniOutInst?.setOption(makeMiniLineOption([98,132,121,154,140,130,168], '#409EFF', dark), true)
  miniBedsInst?.setOption(makeMiniLineOption([60,58,62,64,63,65,66], '#67C23A', dark), true)
}

onMounted(async () => {
  try {
    await loadEChartsScript()
    lineInst = initChart(lineRef.value, makeLineOption(isDark.value))
    pieInst = initChart(pieRef.value, makePieOption(isDark.value))
    barInst = initChart(barRef.value, makeBarOption(isDark.value))
    gaugeInst = initChart(gaugeRef.value, makeGaugeOption(isDark.value))
    miniOutInst = initChart(miniOutpatientRef.value, makeMiniLineOption([98,132,121,154,140,130,168], '#409EFF', isDark.value))
    miniBedsInst = initChart(miniBedsRef.value, makeMiniLineOption([60,58,62,64,63,65,66], '#67C23A', isDark.value))
    window.addEventListener('resize', handleResize)
    applyTheme()
    const mo = new MutationObserver(applyTheme)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    ;(window as any).__themeObserver = mo
  } catch {}
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  charts.forEach(c => c?.dispose())
  charts = []
  const mo = (window as any).__themeObserver
  mo && mo.disconnect && mo.disconnect()
})
</script>

<style scoped>
.hospital-overview {
  padding: 20px;
  background-color: var(--el-bg-color-page);
  min-height: 100vh;
  box-sizing: border-box;
}

/* KPI Cards */
.kpi-section {
  margin-bottom: 20px;
}
.kpi-card {
  border: none;
  transition: all 0.3s;
}
.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.kpi-content {
  display: flex;
  align-items: center;
}
.kpi-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 24px;
}
.kpi-icon--0 { background: #e6f7ff; color: #1890ff; }
.kpi-icon--1 { background: #f6ffed; color: #52c41a; }
.kpi-icon--2 { background: #fff7e6; color: #fa8c16; }
.kpi-icon--3 { background: #f9f0ff; color: #722ed1; }
.kpi-data {
  flex: 1;
}
.kpi-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}
.kpi-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', sans-serif;
}
.kpi-desc {
  font-size: 12px;
  color: var(--el-text-color-disabled);
}

/* Main Layout */
.main-section {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  height: 420px; /* 固定高度确保对齐 */
}
.main-chart-wrapper {
  flex: 2; /* 左侧占 2/3 */
  min-width: 0;
}
.side-cards-wrapper {
  flex: 1; /* 右侧占 1/3 */
  min-width: 0;
}

/* Grid for Side Cards (2x2) */
.side-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  height: 100%;
}

.full-height-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: none;
}
.full-height-card :deep(.el-card__body) {
  flex: 1;
  padding: 16px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.side-card {
  height: 100%;
  border: none;
  display: flex;
  flex-direction: column;
}
.side-card :deep(.el-card__header) {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.side-card :deep(.el-card__body) {
  flex: 1;
  padding: 8px;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.chart-box {
  flex: 1;
  width: 100%;
  min-height: 0; /* 允许 flex item 压缩 */
}

/* Stats Styling */
.sm-header {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}
.stat-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
}
.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.stat-value .unit {
  font-size: 12px;
  font-weight: normal;
  color: #909399;
  margin-left: 4px;
}
.stat-footer {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mt-2 {
  margin-top: 12px;
}

/* Rank List */
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
  overflow-y: auto;
}
.rank-item {
  width: 100%;
}
.rank-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 13px;
  color: #606266;
}

/* Bottom Section */
.bottom-section {
  height: 320px;
}
</style>
