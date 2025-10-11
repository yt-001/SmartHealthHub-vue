<template>
  <!-- 角色标识横幅：管理员端 -->
  <div class="role-banner role-admin">当前页面：管理员端</div>

  <div class="page">这里是管理员首页（占位内容）</div>
</template>

<script setup lang="ts">
// 管理员页面占位（中文注释）
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
.role-admin { background-color: #409eff; } /* 蓝色：管理员端 */
</style>