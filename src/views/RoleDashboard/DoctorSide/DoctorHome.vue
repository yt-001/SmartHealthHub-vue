<template>
  <!-- 角色标识横幅：医生端 -->
  <div class="role-banner role-doctor">当前页面：医生端</div>

  <div class="page">这里是医生首页（占位内容）</div>
</template>

<script setup lang="ts">
// 医生页面占位（中文注释）
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
.role-doctor { background-color: #36cfc9; } /* 青色：医生端 */
</style>