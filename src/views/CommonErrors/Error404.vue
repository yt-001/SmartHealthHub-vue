<template>
  <!-- Element Plus 风格 404 页面占位（中文注释） -->
  <div class="error-container">
    <el-result icon="warning" title="404 未找到页面" sub-title="页面暂未开发，敬请期待">
      <template #extra>
        <el-button type="primary" @click="goBack">返回上一页</el-button>
        <el-button @click="goHome">回到入口</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
// 404 页面：提供返回与回到入口的操作（中文注释）
import { useRouter } from 'vue-router'
const router = useRouter()
const goBack = () => router.back()
const goHome = () => router.push('/portal')
</script>

<style scoped>
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}
</style>