/* 入口文件：注册 Element Plus、Pinia，挂载应用（中文注释） */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入 Element Plus 组件库及样式
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css' // 引入暗色主题变量（跟随 html.dark 自动切换）
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入 Pinia 状态管理
import { createPinia } from 'pinia'

// 引入全局样式
import './styles/index.scss'
import './assets/styles/theme.css' // 引入自定义主题色

const app = createApp(App)

// 注册 Pinia
const pinia = createPinia()
app.use(pinia)

// 注册 Element Plus（全局中文）
app.use(ElementPlus, { locale: zhCn })

// 注册路由（中文注释）
app.use(router)

// 全量注册图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用
/* 刷新后会话校验：在应用挂载前调用 /auth/check，将用户信息写入 Store
 * 采用 HttpOnly Cookie，axios 已设置 withCredentials: true
 * 成功：页面按当前路由正常渲染；失败：不强制跳转，交由各页面逻辑处理
 */
(async () => {
  // 动态导入，避免循环依赖
  const { useUserStore } = await import('@/stores/user')
  const store = useUserStore()
  // 启动期只执行一次会话检查（组件与路由守卫仅等待该 Promise）
  await store.bootstrap()
  app.mount('#app')
})()