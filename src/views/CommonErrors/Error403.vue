<template>
  <!-- Element Plus 风格 403 页面占位（中文注释） -->
  <div class="error-container">
    <el-result icon="warning" title="403 无访问权限" sub-title="您没有权限查看此页面">
      <template #extra>
        <el-button type="primary" @click="goHome">回到入口</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
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