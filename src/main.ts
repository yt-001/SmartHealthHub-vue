/* 入口文件：注册 Element Plus、Pinia，挂载应用（中文注释） */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 引入 Element Plus 组件库及样式
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入 Pinia 状态管理
import { createPinia } from 'pinia'

// 引入全局样式
import './styles/index.scss'

const app = createApp(App)

// 注册 Pinia
const pinia = createPinia()
app.use(pinia)

// 注册 Element Plus
app.use(ElementPlus)

// 注册路由（中文注释）
app.use(router)

// 全量注册图标组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用
app.mount('#app')