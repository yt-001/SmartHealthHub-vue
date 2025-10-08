<script setup lang="ts">
// 根组件：渲染路由出口（中文注释）
</script>

<template>
  <div id="app">
    <!-- 简单导航示例 -->
    <nav class="nav" style="padding:12px 16px;">
      <router-link to="/">首页</router-link>
      <span style="margin: 0 8px; color:#999;">|</span>
      <router-link to="/news">新闻</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style lang="scss">
@import './styles/index.scss';
</style>