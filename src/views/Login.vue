<template>
  <div class="login-page">
    <h1>登录</h1>
    <p class="desc">请选择身份后点击登录（无后端模拟跳转）</p>

    <div class="role-group">
      <label class="role-item">
        <input type="radio" name="role" value="admin" v-model="role" />
        管理员
      </label>
      <label class="role-item">
        <input type="radio" name="role" value="doctor" v-model="role" />
        医生
      </label>
      <label class="role-item">
        <input type="radio" name="role" value="user" v-model="role" />
        用户
      </label>
    </div>

    <button class="login-btn" :disabled="!role" @click="onLogin">登录</button>
  </div>
</template>

<script setup lang="ts">
// 无后端逻辑的登录页面（中文注释）
// - 通过三个单选按钮选择角色：管理员 / 医生 / 用户
// - 点击登录后，前端根据选择跳转到不同的页面路由
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 当前选择的角色，默认为空（未选择）
const role = ref<'admin' | 'doctor' | 'user' | null>(null)

// 点击登录：根据选择跳转到不同的命名路由
const onLogin = () => {
  // 角色到路由名的映射（仅三种有效角色）
  const map: Record<'admin' | 'doctor' | 'user', string> = {
    admin: 'Admin',
    doctor: 'Doctor',
    user: 'User'
  }
  // 未选择角色则不跳转
  if (!role.value) return
  // 通过类型收窄后安全访问映射
  router.push({ name: map[role.value] })
}
</script>

<style scoped>
/* 简单样式，便于演示 */
.login-page {
  max-width: 420px;
  margin: 80px auto;
  padding: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0,0,0,.06);
}
h1 {
  margin: 0 0 8px;
  font-size: 22px;
}
.desc {
  color: #6b7280;
  margin: 0 0 16px;
}
.role-group {
  display: flex;
  gap: 16px;
  margin: 12px 0 20px;
}
.role-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  user-select: none;
}
.login-btn {
  width: 100%;
  height: 38px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}
.login-btn:disabled {
  background: #93c5fd;
  cursor: not-allowed;
}
</style>