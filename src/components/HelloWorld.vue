<template>
  <div class="hello-world">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header flex-between">
          <span>欢迎使用 SmartHealthHub</span>
          <el-button type="primary" :icon="Setting" @click="handleSettings">设置</el-button>
        </div>
      </template>

      <div class="content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="今日步数" :value="steps" suffix="步">
              <template #prefix><el-icon><Walking /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="心率" :value="heartRate" suffix="bpm">
              <template #prefix><el-icon><Monitor /></el-icon></template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic title="睡眠时长" :value="sleepHours" suffix="小时">
              <template #prefix><el-icon><Moon /></el-icon></template>
            </el-statistic>
          </el-col>
        </el-row>

        <div class="actions" style="margin-top:20px;">
          <el-button type="success" @click="handleRefresh"><el-icon><Refresh /></el-icon>刷新数据</el-button>
          <el-button type="info" @click="handleViewMore"><el-icon><View /></el-icon>查看详情</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
// 示例组件：演示 Element Plus 的使用（中文注释）
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Setting, Monitor, Moon, Refresh, View } from '@element-plus/icons-vue'

// 响应式数据
const steps = ref(8520)
const heartRate = ref(72)
const sleepHours = ref(7.5)

// 点击“设置”
const handleSettings = () => { ElMessage.info('设置功能开发中...') }
// 刷新数据
const handleRefresh = () => {
  steps.value = Math.floor(Math.random() * 10000) + 5000
  heartRate.value = Math.floor(Math.random() * 30) + 60
  sleepHours.value = Math.round((Math.random() * 4 + 6) * 10) / 10
  ElMessage.success('数据已刷新')
}
// 查看更多
const handleViewMore = () => { ElMessage.info('详情页面开发中...') }
</script>

<style scoped lang="scss">
.hello-world { padding: 20px; }
.welcome-card { max-width: 800px; margin: 0 auto; }
.card-header { font-weight: bold; font-size: 18px; }
.content { text-align: center; }
.actions { display: flex; justify-content: center; gap: 10px; }
</style>