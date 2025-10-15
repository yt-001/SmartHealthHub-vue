<template>
  <!-- 登录/注册容器 -->
  <div class="container" ref="containerRef">
    <!-- 注册面板 -->
    <div class="form__container signup__container">
      <form @submit.prevent="onSignUp">
        <h1>创建账户</h1>

        <!-- 社交图标（示例） -->
        <div class="socials">
          <a href="javascript:void(0)"><i class="ri-facebook-fill"></i></a>
          <a href="javascript:void(0)"><i class="ri-google-fill"></i></a>
          <a href="javascript:void(0)"><i class="ri-linkedin-fill"></i></a>
        </div>

        <span>或使用邮箱完成注册</span>

        <div class="form__group">
          <!-- 注册姓名 -->
          <input
            type="text"
            placeholder="姓名"
            v-model="signupName"
          />
        </div>
        <div class="form__group">
          <!-- 注册邮箱 -->
          <input
            type="email"
            placeholder="邮箱"
            v-model="signupEmail"
          />
        </div>
        <div class="form__group">
          <!-- 注册密码 -->
          <input
            type="password"
            placeholder="密码"
            v-model="signupPassword"
          />
        </div>

        <button type="submit">注册</button>
      </form>
    </div>

    <!-- 登录面板 -->
    <div class="form__container signin__container">
      <form @submit.prevent="onSignIn">
        <h1>登录</h1>

        <!-- 社交图标（示例） -->
        <div class="socials">
          <a href="javascript:void(0)"><i class="ri-facebook-fill"></i></a>
          <a href="javascript:void(0)"><i class="ri-google-fill"></i></a>
          <a href="javascript:void(0)"><i class="ri-linkedin-fill"></i></a>
        </div>

        <span>或使用已有账号</span>

        <div class="form__group">
          <!-- 登录手机号 -->
          <input
            type="tel"
            placeholder="手机号"
            v-model="signinPhone"
          />
        </div>
        <div class="form__row">
          <!-- 登录密码 + 忘记密码同一输入框内部（原生 input，不改外观） -->
          <input
            type="password"
            placeholder="密码"
            v-model="signinPassword"
            class="pwd-input"
          />
          <a href="javascript:void(0)" class="forgot__inside" @click="onForgotPassword">忘记密码？</a>
        </div>

        <!-- 角色选择：单选按钮 + 基础 el-tag（颜色与按钮匹配） -->
        <div class="role-tags">
          <label class="tag-option success">
            <input type="radio" name="role" value="user" v-model="loginRole" />
            <el-tag type="success">用户</el-tag>
          </label>
          <label class="tag-option primary">
            <input type="radio" name="role" value="admin" v-model="loginRole" />
            <el-tag type="primary">管理员</el-tag>
          </label>
          <label class="tag-option info">
            <input type="radio" name="role" value="doctor" v-model="loginRole" />
            <el-tag type="info">医生</el-tag>
          </label>
        </div>

        <button type="submit">登录</button>
      </form>
    </div>

    <!-- 右侧覆盖面板与切换按钮 -->
    <div class="overlay__container">
      <div class="overlay__wrapper">
        <div class="overlay__panel overlay__panel__left">
          <h1>欢迎回来！</h1>
          <p>为保持联系，请使用您的个人信息登录</p>
          <!-- 点击切换至 Sign in 视图 -->
          <button type="button" @click="activateSignIn">登录</button>
        </div>
        <div class="overlay__panel overlay__panel__right">
          <h1>你好，朋友！</h1>
          <p>输入您的个人信息，开启与我们的旅程</p>
          <!-- 点击切换至 Sign up 视图 -->
          <button type="button" @click="activateSignUp">注册</button>
        </div>
      </div>
      <!-- 中间圆角按钮（带放大动画） -->
      <button ref="overlayBtnRef" id="overlayBtn" @click="toggleOverlay"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页（整合静态 HTML/CSS 至 Vue + TS）
 * - 使用响应式状态管理输入框
 * - 提供切换登录/注册视图的交互（通过容器类名 right__panel__active）
 * - 预留登录/注册/忘记密码的处理函数，便于对接后端 API 与路由
 */
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userApi } from '@/api';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import type { ApiResponse } from '@/api/types';

// 容器与按钮引用
const containerRef = ref<HTMLDivElement | null>(null);
const overlayBtnRef = ref<HTMLButtonElement | null>(null);
const router = useRouter();

// 登录表单数据
const signinPhone = ref('');
const signinPassword = ref('');
const loginRole = ref<'user' | 'admin' | 'doctor'>('user');

// 注册表单数据
const signupName = ref('');
const signupEmail = ref('');
const signupPassword = ref('');

// 切换：添加/移除右侧面板激活态
const toggleOverlay = () => {
  // 切换容器类名以触发布局/动画
  containerRef.value?.classList.toggle('right__panel__active');

  // 触发按钮放大动画：先移除类，再强制回流，再添加类
  const btn = overlayBtnRef.value;
  if (btn) {
    btn.classList.remove('scale__btn-animation');
    // 通过浏览器下一帧重新添加类，触发动画
    requestAnimationFrame(() => {
      btn.classList.add('scale__btn-animation');
    });
  }
};

// 显式切到 Sign in 视图
const activateSignIn = () => {
  containerRef.value?.classList.remove('right__panel__active');
  // 同步播放按钮动画
  const btn = overlayBtnRef.value;
  if (btn) {
    btn.classList.remove('scale__btn-animation');
    requestAnimationFrame(() => btn.classList.add('scale__btn-animation'));
  }
};

// 显式切到 Sign up 视图
const activateSignUp = () => {
  containerRef.value?.classList.add('right__panel__active');
  // 同步播放按钮动画
  const btn = overlayBtnRef.value;
  if (btn) {
    btn.classList.remove('scale__btn-animation');
    requestAnimationFrame(() => btn.classList.add('scale__btn-animation'));
  }
};

/* 登录提交：改为按响应体状态码进行分支处理，并使用 ElMessage 展示提示 */
const onSignIn = async () => {
  // 基础校验：手机号与密码必填
  if (!signinPhone.value || !signinPassword.value) {
    ElMessage.error('请输入手机号和密码');
    return;
  }
  // 中国大陆手机号格式校验：以 1 开头，第2位为 3-9，后续 9 位数字
  const phoneReg = /^1[3-9]\d{9}$/;
  if (!phoneReg.test(signinPhone.value)) {
    ElMessage.error('请输入有效的手机号');
    return;
  }

  try {
    // 角色映射：管理员=0，医生=1，用户=2（提交给后端）
    const roleMap: Record<'user' | 'admin' | 'doctor', number> = { admin: 0, doctor: 1, user: 2 };

    const store = useUserStore();

    // 1) 调用登录接口，拿到响应体（假设返回结构：{ code, msg, data }）
    const loginResp = await userApi.login({
      phone: signinPhone.value,
      password: signinPassword.value,
      role: roleMap[loginRole.value]
    }) as ApiResponse;

    // 使用统一返回体类型，直接解构状态码与消息
    const { code, msg } = loginResp;

    // 2) 根据状态码分支处理，并统一弹出消息
    if (code === 200) {
      ElMessage.success(msg || '登录成功');

      // 先写入最小用户态，确保路由守卫放行（基于用户选择的角色）
      store.setUserInfo({ role: loginRole.value } as any);

      // 登录成功立即执行一次令牌检查，若有效则写入用户信息到 Store
      try {
        const checkResp = await userApi.check() as ApiResponse;
        if (checkResp.code === 200 && checkResp.data) {
          // 将后端返回的完整用户信息写入 Store
          store.setUserInfo(checkResp.data as any);
        }
      } catch {
        // 检查失败不影响后续跳转（可能是后端暂时不可达）
      }

      // 直接根据用户选择的角色进行跳转（不依赖用户信息返回）
      // 统一后台入口：管理员/医生进入同一路径 /portal，由 RoleDashboard 根据角色动态呈现内容
      const pathMap: Record<'user' | 'admin' | 'doctor', string> = {
        user: '/client',
        admin: '/portal',
        doctor: '/portal'
      };
      // 延迟 1 秒后跳转
      await new Promise(resolve => setTimeout(resolve, 1000));
      await router.push(pathMap[loginRole.value]);
    } else if (code === 401) {
      // 未授权 / 认证失败（可能是用户不存在、角色不匹配、用户名或密码错误）
      ElMessage.error(msg || '未授权或认证失败');
    } else if (code === 403) {
      // 禁止访问（用户账户状态异常）
      ElMessage.error(msg || '用户账户状态异常');
    } else if (code === 404) {
      // 资源不存在（登录场景一般不会返回）
      ElMessage.error(msg || '资源不存在');
    } else if (code === 500) {
      // 服务器内部错误
      ElMessage.error(msg || '服务器内部错误');
    } else {
      // 其他未覆盖状态码
      ElMessage.error(msg || '登录失败');
    }
  } catch (error: any) {
    // 网络或非业务异常：展示后端返回的 msg 或通用文案
    const backendMsg =
      error?.response?.data?.msg ||
      error?.data?.msg ||
      error?.message;
    ElMessage.error(backendMsg || '请求失败，请检查网络后重试');
  }
};

// 注册提交（在此对接你的 API）
const onSignUp = async () => {

};

// 忘记密码（可跳转到找回密码页）
const onForgotPassword = () => {
  // TODO: router.push('/forgot-password')
  console.log('Go to forgot password');
};
</script>

<style scoped>
/* 引入字体与图标（组件内使用，避免改动全局 index.html） */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap");
@import url("https://cdn.jsdelivr.net/npm/remixicon@3.4.0/fonts/remixicon.css");

@import '../styles/login.scss'
</style>