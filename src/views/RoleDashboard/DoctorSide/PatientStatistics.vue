<template>
  <div class="statistics-container">
    <!-- 顶部欢迎与核心指标区 -->
    <div class="header-section">
      <div class="welcome-banner">
        <h2 class="welcome-title">早安，{{ doctorName }}医生 👋</h2>
        <p class="welcome-sub">这是您负责的患者数据分析概览，祝您今天工作顺利。</p>
      </div>
      
      <el-row :gutter="20" class="metrics-row">
        <el-col :span="6" v-for="(metric, index) in metrics" :key="index">
          <el-card shadow="hover" class="metric-card" :class="'metric-card-' + index">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon :size="24"><component :is="metric.icon" /></el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-label">{{ metric.label }}</div>
                <div class="metric-value">
                  <count-to :start-val="0" :end-val="metric.value" :duration="2000" />
                  <span v-if="metric.unit" class="unit">{{ metric.unit }}</span>
                </div>
                <div class="metric-trend" :class="metric.trend >= 0 ? 'up' : 'down'">
                  <el-icon><component :is="metric.trend >= 0 ? CaretTop : CaretBottom" /></el-icon>
                  {{ Math.abs(metric.trend) }}% 较上周
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 图表分析区 -->
    <div class="charts-section">
      <el-row :gutter="20">
        <!-- 左侧：访问趋势 -->
        <el-col :span="16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="title">近30日就诊趋势分析</span>
                <el-radio-group v-model="trendPeriod" size="small">
                  <el-radio-button label="7">近7天</el-radio-button>
                  <el-radio-button label="30">近30天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="visitChartRef" class="chart-box main-chart"></div>
          </el-card>
        </el-col>
        
        <!-- 右侧：患者画像（年龄/性别） -->
        <el-col :span="8">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="title">患者人群画像</span>
              </div>
            </template>
            <div ref="ageChartRef" class="chart-box pie-chart"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" class="mt-20">
        <!-- 疾病分布 Top 5 -->
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="title">高频诊断疾病 Top 5</span>
              </div>
            </template>
            <div ref="diseaseChartRef" class="chart-box"></div>
          </el-card>
        </el-col>
        
        <!-- 预约状态漏斗/分布 -->
        <el-col :span="12">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <div class="card-header">
                <span class="title">预约履约分析</span>
              </div>
            </template>
            <div ref="statusChartRef" class="chart-box"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch, markRaw } from 'vue'
import * as echarts from 'echarts'
import { User, Timer, DataLine, Trophy, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

// 简单的数字滚动动画组件
const CountTo = {
  props: ['startVal', 'endVal', 'duration'],
  setup(props: { startVal: number; duration: number; endVal: number }) {
    const displayValue = ref(props.startVal)
    onMounted(() => {
      const startTime = Date.now()
      const animate = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / props.duration, 1)
        displayValue.value = Math.floor(progress * (props.endVal - props.startVal) + props.startVal)
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    })
    return () => displayValue.value
  }
}

const userStore = useUserStore()
const doctorName = (userStore.userInfo as any)?.realName || (userStore.userInfo as any)?.nickname || '医生'

// 核心指标数据
const metrics = ref([
  { label: '累计接诊患者', value: 1258, icon: markRaw(User), trend: 12.5, unit: '人' },
  { label: '本周预约', value: 42, icon: markRaw(Timer), trend: -5.2, unit: '单' },
  { label: '今日待办', value: 8, icon: markRaw(DataLine), trend: 0, unit: '项' },
  { label: '患者满意度', value: 98, icon: markRaw(Trophy), trend: 1.2, unit: '%' }
])

const trendPeriod = ref('7')

// Chart Refs
const visitChartRef = ref<HTMLElement>()
const ageChartRef = ref<HTMLElement>()
const diseaseChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()

let visitChart: echarts.ECharts | null = null
let ageChart: echarts.ECharts | null = null
let diseaseChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

// Mock Data Generators
const getDates = (days: number) => {
  const dates = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return dates
}

const initVisitChart = () => {
  if (!visitChartRef.value) return
  visitChart = echarts.init(visitChartRef.value)
  
  const days = trendPeriod.value === '7' ? 7 : 30
  const xData = getDates(days)
  const yData = Array.from({ length: days }, () => Math.floor(Math.random() * 20) + 5)

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: xData },
    yAxis: { type: 'value' },
    series: [
      {
        name: '就诊人数',
        type: 'line',
        smooth: true,
        itemStyle: { color: '#059669' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(5, 150, 105, 0.3)' },
            { offset: 1, color: 'rgba(5, 150, 105, 0.01)' }
          ])
        },
        data: yData
      }
    ]
  }
  visitChart.setOption(option)
}

const initAgeChart = () => {
  if (!ageChartRef.value) return
  ageChart = echarts.init(ageChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { bottom: '0%', left: 'center' },
    series: [
      {
        name: '年龄分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false, position: 'center' },
        emphasis: {
          label: { show: true, fontSize: 20, fontWeight: 'bold' }
        },
        data: [
          { value: 148, name: '老年 (60+)', itemStyle: { color: '#3b82f6' } },
          { value: 335, name: '中青年 (18-59)', itemStyle: { color: '#059669' } },
          { value: 85, name: '青少年 (12-18)', itemStyle: { color: '#f59e0b' } },
          { value: 45, name: '儿童 (<12)', itemStyle: { color: '#ef4444' } }
        ]
      }
    ]
  }
  ageChart.setOption(option)
}

const initDiseaseChart = () => {
  if (!diseaseChartRef.value) return
  diseaseChart = echarts.init(diseaseChartRef.value)
  
  const option = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'value' },
    yAxis: {
      type: 'category',
      data: ['高血压', '上呼吸道感染', '2型糖尿病', '慢性胃炎', '过敏性鼻炎'].reverse()
    },
    series: [
      {
        name: '确诊病例',
        type: 'bar',
        data: [120, 98, 85, 45, 32].reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#c4b5fd' }
          ]),
          borderRadius: [0, 4, 4, 0]
        },
        barWidth: 20
      }
    ]
  }
  diseaseChart.setOption(option)
}

const initStatusChart = () => {
  if (!statusChartRef.value) return
  statusChart = echarts.init(statusChartRef.value)
  
  const option = {
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left' },
    series: [
      {
        name: '预约状态',
        type: 'pie',
        radius: '65%',
        center: ['60%', '50%'],
        data: [
          { value: 850, name: '已完成', itemStyle: { color: '#10b981' } },
          { value: 45, name: '待就诊', itemStyle: { color: '#3b82f6' } },
          { value: 25, name: '已取消', itemStyle: { color: '#9ca3af' } },
          { value: 10, name: '爽约', itemStyle: { color: '#ef4444' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  statusChart.setOption(option)
}

watch(trendPeriod, () => {
  initVisitChart()
})

const handleResize = () => {
  visitChart?.resize()
  ageChart?.resize()
  diseaseChart?.resize()
  statusChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    initVisitChart()
    initAgeChart()
    initDiseaseChart()
    initStatusChart()
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  visitChart?.dispose()
  ageChart?.dispose()
  diseaseChart?.dispose()
  statusChart?.dispose()
})
</script>

<style scoped>
.statistics-container {
  padding: 24px;
  background-color: #f8fafc;
  min-height: 100%;
}

.header-section {
  margin-bottom: 32px;
}

.welcome-banner {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 24px;
  color: #1e293b;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.welcome-sub {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.metrics-row {
  margin-bottom: 24px;
}

.metric-card {
  border: none;
  border-radius: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  position: relative;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.metric-card-0 { background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%); border-left: 4px solid #3b82f6; }
.metric-card-1 { background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%); border-left: 4px solid #10b981; }
.metric-card-2 { background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%); border-left: 4px solid #f59e0b; }
.metric-card-3 { background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%); border-left: 4px solid #ef4444; }

.metric-content {
  display: flex;
  align-items: center;
  padding: 8px;
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.metric-card-0 .metric-icon { color: #3b82f6; }
.metric-card-1 .metric-icon { color: #10b981; }
.metric-card-2 .metric-icon { color: #f59e0b; }
.metric-card-3 .metric-icon { color: #ef4444; }

.metric-info {
  flex: 1;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.unit {
  font-size: 14px;
  font-weight: 500;
  margin-left: 2px;
  color: #94a3b8;
}

.metric-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 2px;
}

.metric-trend.up { color: #10b981; }
.metric-trend.down { color: #ef4444; }

/* Chart Cards */
.chart-card {
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  border-left: 4px solid #059669;
  padding-left: 12px;
}

.chart-box {
  height: 300px;
  width: 100%;
}

.pie-chart {
  height: 300px;
}

.mt-20 {
  margin-top: 20px;
}
</style>
