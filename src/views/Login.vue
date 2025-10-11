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
          <!-- 登录邮箱 -->
          <input
            type="email"
            placeholder="邮箱"
            v-model="signinEmail"
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

// 容器与按钮引用
const containerRef = ref<HTMLDivElement | null>(null);
const overlayBtnRef = ref<HTMLButtonElement | null>(null);
const router = useRouter();

// 登录表单数据
const signinEmail = ref('');
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

// 登录提交（在此对接你的 API 与路由）
const onSignIn = async () => {
  if (!signinEmail.value || !signinPassword.value) {
    ElMessage.error('请输入邮箱和密码');
    return;
  }
  try {
    // API 的 login 函数需要 username，我们用 email 代替
    // 改用 HttpOnly Cookie 后，浏览器会自动处理，前端无需接收和存储 token
    await userApi.login({
      username: signinEmail.value,
      password: signinPassword.value,
    });

    // localStorage.setItem('token', token); // 已废弃，Cookie 由浏览器自动管理
    ElMessage.success('登录成功');

    const role = loginRole.value;
    const pathMap: Record<'user' | 'admin' | 'doctor', string> = {
      user: '/user',
      admin: '/admin',
      doctor: '/doctor',
    };
    await router.push(pathMap[role]);
  } catch (error) {
    console.error('Login failed:', error);
    ElMessage.error('登录失败，请检查您的凭据');
  }
};

// 注册提交（在此对接你的 API）
const onSignUp = async () => {
  if (!signupName.value || !signupEmail.value || !signupPassword.value) {
    ElMessage.error('请填写完整的注册信息');
    return;
  }
  try {
    // API 的 register 函数需要 username，我们用 name 代替
    await userApi.register({
      username: signupName.value,
      email: signupEmail.value,
      password: signupPassword.value,
    });
    ElMessage.success('注册成功！请登录。');
    // 注册成功后，自动切换到登录面板
    activateSignIn();
  } catch (error) {
    console.error('Signup failed:', error);
    ElMessage.error('注册失败，该用户名或邮箱可能已被使用');
  }
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

/* 主题色与基础变量（与原样式一致） */
/* 变量迁移到 .container，避免 scoped 下 :root 失效 */

/* 基础重置（作用域内仅影响本组件） */
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.container {
  /* 将主题变量作用在组件根容器，保证本组件内任何元素都能读取 */
  --primary-color: #27b397;
  --text-dark: #0f172a;
  --text-light: #94a3b8;
  --extra-light: #ececec;
  --white: #ffffff;

  font-family: "Poppins", sans-serif; /* 组件内字体 */
}

/* 容器与布局 */
.container {
  height: 100vh;
  position: relative;
  background-color: var(--white);
  overflow: hidden;
}

/* 表单容器公用 */
.form__container {
  position: absolute;
  width: 60%;
  height: 100%;
  padding: 2rem;
  transition: 0.6s ease-in-out;
}

/* 初始：注册侧隐藏，登录侧显示（与原始逻辑一致） */
.signup__container {
  opacity: 0;
  z-index: 1;
}

.signin__container {
  z-index: 2;
}

/* 表单布局 */
form {
  height: 100%;
  max-width: 400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

form h1 {
  font-size: 2.5rem;
  color: var(--primary-color);
}

/* 社交按钮行 */
.socials {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
}

.socials a {
  padding: 5px 12px;
  text-decoration: none;
  font-size: 1.5rem;
  color: var(--text-dark);
  border: 1px solid var(--text-light);
  border-radius: 100%;
}

form span {
  color: var(--text-light);
  font-size: 0.9rem;
}

.form__group {
  position: relative;
  margin: 0.5rem 0;
  width: 100%;
}

/* 限定输入框样式，避免影响 radio/checkbox 等 */
.form__group input,
.form__row input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background-color: var(--extra-light);
  border-bottom: 1px solid var(--primary-color);
}

.forgot__password {
  /* 放在密码输入右侧，保持单行 */
  margin-left: 12px;
  text-decoration: none;
  font-size: 0.9rem;
  color: var(--text-light);
  border-bottom: 1px solid var(--text-light);
  white-space: nowrap;
}

.form__container button {
  padding: 0.75rem 4rem;
  border: none;
  outline: none;
  font-size: 1rem;
  color: var(--white);
  border-radius: 2rem;
  background-color: var(--primary-color);
  cursor: pointer;
}

/* 登录角色单选组 */
.role-group {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  margin: 8px 0 4px;
  color: var(--text-dark);
  user-select: none;
}
.role-group label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}
.role-group input[type="radio"] {
  cursor: pointer;
}

/* 单行展示密码输入与忘记密码 */
.form__row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative; /* 作为绝对定位参照 */
}
/* 原生输入框仍保持你的默认外观，仅增加右侧内边距避免文字覆盖 */
.form__row .pwd-input {
  flex: 1;
  padding-right: 88px; /* 为空出“忘记密码？”点击区域 */
}
/* 将“忘记密码？”放到输入框内部右侧 */
.forgot__inside {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--text-light);
  text-decoration: none;
  cursor: pointer;
  line-height: 1;
  background: transparent; /* 不影响输入框背景 */
  padding: 2px 0;
}
.forgot__inside:hover {
  color: var(--primary-color);
}

/* 角色标签：均匀分布，保持与输入框同宽 */
.role-tags {
  width: 100%;
  display: flex;
  justify-content: space-around; /* 均匀分布，两端留有间距 */
  align-items: center;
  margin: 16px 0;
}
/* 标签保持自适应宽度 */
.role-tags :deep(.el-tag) {
  cursor: pointer;
}
/* 单个选项：让单选按钮和标签靠在一起，并垂直居中 */
.tag-option {
  display: inline-flex;
  align-items: center;   /* 垂直居中对齐单选与标签 */
  gap: 4px;              /* 减小单选按钮和标签之间的间距 */
  user-select: none;
  cursor: pointer;
}

/* 使用 accent-color 设置单选按钮颜色，恢复浏览器默认外观 */
.tag-option input[type="radio"] {
  cursor: pointer;
}
.tag-option.success input[type="radio"] { accent-color: var(--el-color-success); }
.tag-option.primary input[type="radio"] { accent-color: var(--el-color-primary); }
.tag-option.info input[type="radio"]    { accent-color: var(--el-color-info); }

/* 右侧覆盖容器（背景图、动效与切换） */
.overlay__container {
  position: absolute;
  top: 0;
  left: 60%;
  height: 100%;
  width: 40%;
  overflow: hidden;
  transition: transform 0.6s ease-in-out;
  z-index: 10;
}

.overlay__wrapper {
  /* 将相对路径改为别名路径，适配 Vite 构建 */
  background: url("@/assets/57-bg.png");
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  color: var(--white);
  left: -150%;
  height: 100%;
  width: 250%;
  transition: transform 0.6s ease-in-out;
}

.overlay__panel {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 4rem;
  text-align: center;
  height: 100%;
  width: 40%;
  transition: transform 0.6s ease-in-out;
}

.overlay__panel__left {
  right: 60%;
  transform: translateX(-12%);
}

.overlay__panel__right {
  right: 0;
  transform: translateX(0);
}

.overlay__panel h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.overlay__panel p {
  max-width: 350px;
  margin: 0 auto;
  line-height: 2rem;
}

.overlay__panel button {
  /* 右侧覆盖区按钮：需要白色描边以在深色背景上清晰可见 */
  padding: 0.75rem 4rem;
  margin-top: 2rem;
  border: 1px solid var(--white);
  outline: none;
  font-size: 1rem;
  color: var(--white);
  border-radius: 2rem;
  background-color: transparent;
}

/* 中间切换按钮 */
/* 隐藏中间装饰按钮，避免与右侧面板按钮重叠产生“双边框” */
#overlayBtn {
  display: none;
}

/* 切换至注册视图时的整体位移动画（类名与原始保持一致） */
.right__panel__active .overlay__container {
  transform: translateX(-150%);
}

.right__panel__active .overlay__wrapper {
  transform: translateX(50%);
}

.right__panel__active .overlay__panel__left {
  transform: translateX(25%);
}

.right__panel__active .overlay__panel__right {
  transform: translateX(35%);
}

.right__panel__active .signin__container {
  transform: translateX(20%);
  opacity: 0;
}

.right__panel__active .signup__container {
  transform: translateX(65%);
  opacity: 1;
  z-index: 5;
  animation: show 0.6s;
}

/* 渐显动画（与原文件一致） */
@keyframes show {
  0%,
  50% {
    opacity: 0;
    z-index: 1;
  }
  51%,
  100% {
    opacity: 1;
    z-index: 5;
  }
}

/* 按钮放大动画 */
.scale__btn-animation {
  animation: scale-animation 0.6s;
}

@keyframes scale-animation {
  0% {
    width: 10rem;
  }
  50% {
    width: 20rem;
  }
  100% {
    width: 10rem;
  }
}
</style>