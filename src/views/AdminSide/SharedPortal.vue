<template>
  <div class="portal-layout">
    <header class="portal-header">
      <h2>工作台（管理员/医生共用布局）</h2>
      <p class="hint">根据后端返回的角色字段（如 userRole）控制可见的子路由与菜单。</p>
    </header>
    <main class="portal-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
// 共用父布局（中文注释）
// - 作为管理员/医生共享的容器页面
// - 后续可在此处放置顶部导航 / 侧边栏，并基于角色过滤菜单项
</script>

<style scoped>
.portal-layout {
  padding: 20px;
}
.portal-header {
  margin-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}
.hint {
  color: #6b7280;
  font-size: 13px;
}
.portal-main {
  padding-top: 12px;
}
</style>