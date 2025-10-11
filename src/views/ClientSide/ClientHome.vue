<template>
  <!-- 角色标识横幅：用户端 -->
  <div class="role-banner role-user">当前页面：用户端</div>

  <div class="page">这里是用户首页（占位内容）</div>
</template>

<script setup lang="ts">
// 用户页面占位（中文注释）
</script>

<style scoped>
/* 页面基础样式 */
.page { padding: 40px; font-size: 18px; }

/* 角色标识横幅（纯样式实现） */
.role-banner {
  padding: 10px 16px;
  margin: 12px 12px 0;
  border-radius: 6px;
  font-weight: 600;
  color: #fff;
}

/* 不同角色的主题色 */
.role-user { background-color: #27b397; } /* 绿色：用户端 */
</style>