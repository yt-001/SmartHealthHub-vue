<template>
  <div class="settings-container">
    <h3 class="page-title">账号设置</h3>
    
    <div class="settings-card">
      <div class="setting-item">
        <div class="meta">
          <div class="title">账号安全</div>
          <div class="desc">修改密码、绑定手机号与邮箱</div>
        </div>
        <el-button type="primary" link>管理</el-button>
      </div>
      
      <el-divider />
      
      <div class="setting-item">
        <div class="meta">
          <div class="title">消息通知</div>
          <div class="desc">设置系统消息与就诊提醒</div>
        </div>
        <el-switch v-model="notifications" />
      </div>

      <el-divider />

      <div class="setting-item">
        <div class="meta">
          <div class="title">主题设置</div>
          <div class="desc">切换深色模式与主题色</div>
        </div>
        <el-tag type="info" size="small">敬请期待</el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref(true)
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.settings-card {
  padding: 8px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
}

.setting-item .title {
  font-size: 15px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.setting-item .desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
