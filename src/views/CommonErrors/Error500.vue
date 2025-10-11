<template>
  <!-- Element Plus 风格 500 页面占位（中文注释） -->
  <div class="error-container">
    <el-result icon="error" title="500 服务器错误" sub-title="服务器开小差了，请稍后再试">
      <template #extra>
        <el-button type="primary" @click="reload">刷新页面</el-button>
        <el-button @click="goHome">回到入口</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
const reload = () => location.reload()
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