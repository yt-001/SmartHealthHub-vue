<template>
  <div class="medicine-recommendation-page">
    <div class="page-container">
      <!-- 左侧大类导航 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>调理分类</h3>
        </div>
        <ul class="category-list">
          <li 
            v-for="category in categories" 
            :key="category.id"
            :class="['category-item', { active: currentCategoryId === category.id }]"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon">
              <el-icon v-if="category.icon === 'tcm'"><Bowl /></el-icon>
              <el-icon v-else-if="category.icon === 'western'"><FirstAidKit /></el-icon>
              <el-icon v-else-if="category.icon === 'supplement'"><Apple /></el-icon>
              <el-icon v-else><Grid /></el-icon>
            </div>
            <span class="category-name">{{ category.name }}</span>
            <el-icon class="arrow-icon"><ArrowRight /></el-icon>
          </li>
        </ul>
      </aside>

      <!-- 右侧内容区域 -->
      <main class="content-area">
        <!-- 顶部：面包屑与搜索 -->
        <header class="content-header">
          <div class="breadcrumb">
            <span class="crumb-item" @click="resetToSubCategories">{{ currentCategory?.name }}</span>
            <template v-if="currentSubCategory">
              <el-icon class="separator"><ArrowRight /></el-icon>
              <span class="crumb-item active">{{ currentSubCategory.name }}</span>
            </template>
          </div>
          <!-- 预留搜索框 -->
          <div class="search-box">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索药品或症状..." 
              prefix-icon="Search"
              clearable
              class="custom-input"
            />
          </div>
        </header>

        <!-- 内容视图切换 -->
        <div class="content-view">
          <!-- 视图1：小类列表 (Sub-categories) -->
          <transition name="fade-slide" mode="out-in">
            <div v-if="!currentSubCategory" class="subcategory-grid" key="subcategories">
              <div 
                v-for="sub in currentCategory?.subCategories" 
                :key="sub.id"
                class="subcategory-card"
                @click="selectSubCategory(sub)"
              >
                <div class="card-content">
                  <div class="sub-icon-wrapper" :style="{ background: sub.color }">
                    <span class="sub-icon-text">{{ sub.name[0] }}</span>
                  </div>
                  <h4>{{ sub.name }}</h4>
                  <p>{{ sub.desc }}</p>
                </div>
                <div class="card-footer">
                  <span>{{ sub.medicines.length }} 款推荐</span>
                  <el-icon><Right /></el-icon>
                </div>
              </div>
            </div>

            <!-- 视图2：药品列表 (Medicine Cards) -->
            <div v-else-if="!currentMedicine" class="medicine-list-view" key="medicines">
              <div class="view-header">
                <el-button link @click="resetToSubCategories">
                  <el-icon><Back /></el-icon> 返回分类
                </el-button>
                <h2>{{ currentSubCategory.name }}推荐方案</h2>
              </div>
              
              <div class="medicine-grid">
                <div 
                  v-for="med in currentSubCategory.medicines" 
                  :key="med.id"
                  class="medicine-card"
                  @click="goToDetail(med)"
                >
                  <div class="med-image">
                    <el-image :src="med.image" fit="cover">
                      <template #error>
                        <div class="image-slot">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                    <div class="med-tag" v-if="med.recommendationLevel">
                      {{ med.recommendationLevel }}
                    </div>
                  </div>
                  <div class="med-info">
                    <h3>{{ med.name }}</h3>
                    <div class="tags">
                      <el-tag 
                        v-for="tag in med.tags" 
                        :key="tag" 
                        size="small" 
                        effect="plain"
                        round
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                    <p class="description">{{ med.desc }}</p>
                    <div class="price-action">
                      <span class="price">¥{{ med.price }}</span>
                      <el-button type="primary" size="small" round>查看详情</el-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 视图3：药品详情 (Medicine Detail) -->
            <div v-else class="medicine-detail-view" key="detail">
              <div class="view-header">
                <el-button link @click="resetToSubCategories">
                  <el-icon><Back /></el-icon> 返回列表
                </el-button>
                <h2>{{ currentMedicine.name }}</h2>
              </div>

              <div class="detail-container">
                <el-row :gutter="20" class="detail-layout">
                  <!-- 左侧列：图片 + 简介 -->
                  <el-col :span="9" class="left-col">
                    <div class="detail-card image-card">
                      <div class="img-wrapper">
                        <el-image :src="currentMedicine.image" fit="contain" class="detail-img">
                          <template #error>
                            <div class="img-error">
                              <el-icon :size="48" color="#ddd"><Picture /></el-icon>
                            </div>
                          </template>
                        </el-image>
                      </div>
                    </div>
                    <div class="detail-card intro-card">
                      <h3 class="card-title">药品简介</h3>
                      <p class="intro-text">{{ currentMedicine.desc }}</p>
                      <div class="tags-row">
                        <el-tag 
                          v-for="tag in currentMedicine.tags" 
                          :key="tag" 
                          effect="plain" 
                          round 
                          size="small"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </div>
                  </el-col>

                  <!-- 右侧列：详情信息 + 底部操作 -->
                  <el-col :span="15" class="right-col">
                    <div class="detail-card info-card">
                      <el-tabs model-value="usage">
                        <el-tab-pane label="功能主治" name="usage">
                          <div class="info-content">
                            <div class="info-item">
                              <span class="label">【功能主治】</span>
                              <p>用于{{ currentMedicine.desc }}。具有良好的{{ currentMedicine.tags.join('、') }}功效。</p>
                            </div>
                            <div class="info-item">
                              <span class="label">【适用人群】</span>
                              <p>适合成人及12岁以上儿童。孕妇、哺乳期妇女请遵医嘱。</p>
                            </div>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="用法用量" name="dosage">
                          <div class="info-content">
                            <div class="info-item">
                              <span class="label">【用法】</span>
                              <p>口服。饭后服用效果更佳。</p>
                            </div>
                            <div class="info-item">
                              <span class="label">【用量】</span>
                              <p>一次1袋，一日2次。或遵医嘱。</p>
                            </div>
                            <div class="info-item">
                              <span class="label">【疗程】</span>
                              <p>建议连续服用3-5天，症状无缓解请及时就医。</p>
                            </div>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="注意事项" name="notice">
                          <div class="info-content">
                            <ul class="notice-list">
                              <li>1. 忌烟、酒及辛辣、生冷、油腻食物。</li>
                              <li>2. 不宜在服药期间同时服用滋补性中药。</li>
                              <li>3. 有高血压、心脏病、肝病、糖尿病、肾病等慢性病严重者应在医师指导下服用。</li>
                              <li>4. 服药3天症状无缓解，应去医院就诊。</li>
                            </ul>
                          </div>
                        </el-tab-pane>
                        <el-tab-pane label="说明书" name="manual">
                          <div class="info-content empty-state">
                            <el-icon><Document /></el-icon>
                            <span>暂无电子说明书</span>
                          </div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    
                    <!-- 底部操作栏（在右侧列底部） -->
                    <div class="action-card">
                      <div class="price-section">
                        <div class="price-wrap">
                          <span class="currency">¥</span>
                          <span class="amount">{{ currentMedicine.price }}</span>
                        </div>
                        <el-tag type="success" effect="dark" size="small" class="otc-tag">OTC</el-tag>
                        <span class="stock-text">库存充足</span>
                      </div>
                      <div class="action-btns">
                        <el-button round size="large" class="cart-btn" @click="addToCart(currentMedicine!)">
                          <el-icon><ShoppingCart /></el-icon> 加入清单
                        </el-button>
                        <el-button type="primary" round size="large" class="buy-btn">
                          <el-icon><Timer /></el-icon> 预约取货
                        </el-button>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </div>
          </transition>
        </div>
      </main>
    </div>

    <!-- 悬浮购物车按钮 -->
    <div 
      v-show="cartList.length > 0"
      class="floating-cart-btn"
      :style="floatBtnStyle"
      @mousedown="handleMouseDown"
      @click="toggleCart"
    >
      <el-badge :value="cartList.length" class="cart-badge">
        <div class="cart-icon-wrapper">
          <el-icon :size="24" color="#fff"><ShoppingCart /></el-icon>
        </div>
      </el-badge>
    </div>

    <!-- 简易购物车弹窗（跟随悬浮按钮或固定位置，这里为了简单固定在右下角） -->
    <transition name="fade-slide">
      <div v-if="showCartList && cartList.length > 0" class="cart-popover" :style="{ right: parseFloat(floatBtnStyle.right) + 60 + 'px', bottom: floatBtnStyle.bottom }">
        <div class="cart-header">
          <span>调理清单</span>
          <span class="close-cart" @click="showCartList = false">×</span>
        </div>
        <ul class="cart-items-list">
          <li v-for="item in cartList" :key="item.id" class="cart-item">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-price">¥{{ item.price }}</span>
            <el-icon class="delete-icon" @click="removeFromCart(item.id)"><Delete /></el-icon>
          </li>
        </ul>
        <div class="cart-footer">
          <el-button type="primary" size="small" style="width: 100%">去结算</el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { medicineApi } from '@/api'
import { 
  Bowl, FirstAidKit, Apple, Grid, ArrowRight, Search, Right, Back, Picture,
  ShoppingCart, Timer, Warning, Document, Delete
} from '@element-plus/icons-vue'

const router = useRouter()

// --- 类型定义 ---
interface Medicine {
  id: number
  name: string
  image: string
  desc: string
  price: number
  tags: string[]
  recommendationLevel?: string // e.g., "首选推荐", "搭配建议"
}

interface SubCategory {
  id: number
  name: string
  desc: string
  color: string
  medicines: Medicine[]
}

interface BigCategory {
  id: number
  name: string
  icon: string
  subCategories: SubCategory[]
}

// --- 状态管理 ---
const categories = ref<BigCategory[]>([])
const currentCategoryId = ref<number | null>(null)
const currentSubCategory = ref<SubCategory | null>(null)
const currentMedicine = ref<Medicine | null>(null)
const searchQuery = ref('')
const cartList = ref<Medicine[]>([])
const showCartList = ref(false)

// 悬浮按钮位置状态
const floatBtnStyle = ref({
  right: '40px',
  bottom: '100px'
})
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })
const btnStart = ref({ right: 0, bottom: 0 })

// 计算当前选中的大类
const currentCategory = computed(() => 
  categories.value.find(c => c.id === currentCategoryId.value)
)

const loading = ref(false)

const loadRecommendationTree = async () => {
  loading.value = true
  try {
    const res = await medicineApi.fetchMedicineRecommendationTree()
    const raw: any = res as any
    const items: any[] = typeof raw?.code !== 'undefined' && raw?.data ? raw.data : raw
    categories.value = (items || []) as BigCategory[]
    if (categories.value.length > 0) {
      currentCategoryId.value = categories.value[0].id
    } else {
      currentCategoryId.value = null
    }
  } catch (error) {
    console.error('加载调理推荐数据失败', error)
    ElMessage.error('加载调理推荐数据失败')
  } finally {
    loading.value = false
  }
}

// --- 方法 ---
const selectCategory = (id: number) => {
  currentCategoryId.value = id
  currentSubCategory.value = null // 切换大类时重置小类视图
  currentMedicine.value = null
}

const selectSubCategory = (sub: SubCategory) => {
  currentSubCategory.value = sub
  currentMedicine.value = null
}

const resetToSubCategories = () => {
  if (currentMedicine.value) {
    currentMedicine.value = null
  } else {
    currentSubCategory.value = null
  }
}

const goToDetail = (med: Medicine) => {
  currentMedicine.value = med
}

const addToCart = (med: Medicine) => {
  if (cartList.value.some(item => item.id === med.id)) {
    ElMessage.warning('该药品已在清单中')
    return
  }
  cartList.value.push(med)
  ElMessage.success('已加入清单')
}

const removeFromCart = (id: number) => {
  cartList.value = cartList.value.filter(item => item.id !== id)
  if (cartList.value.length === 0) {
    showCartList.value = false
  }
}

// --- 拖拽逻辑 ---
const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault() // 防止选择文本
  isDragging.value = false
  dragStart.value = { x: e.clientX, y: e.clientY }
  
  // 获取当前的 right 和 bottom 值
  const btn = e.currentTarget as HTMLElement
  const rect = btn.getBoundingClientRect()
  const winW = window.innerWidth
  const winH = window.innerHeight
  
  // 计算初始的 right 和 bottom
  btnStart.value = {
    right: winW - rect.right,
    bottom: winH - rect.bottom
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  // 移动距离超过 3px 才算拖拽，防止点击误触
  const dx = e.clientX - dragStart.value.x
  const dy = e.clientY - dragStart.value.y
  
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
    isDragging.value = true
    
    // 更新位置 (注意：鼠标向右移，right 变小；鼠标向下移，bottom 变小)
    floatBtnStyle.value = {
      right: `${Math.max(20, btnStart.value.right - dx)}px`,
      bottom: `${Math.max(20, btnStart.value.bottom - dy)}px`
    }
  }
}

const handleMouseUp = () => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const toggleCart = () => {
  if (!isDragging.value) {
    showCartList.value = !showCartList.value
  }
}

onMounted(() => {
  loadRecommendationTree()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.medicine-recommendation-page {
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  display: flex;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;
}

.page-container {
  width: 100%;
  max-width: 1200px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  overflow: hidden;
  height: 100%; /* 填满父容器 */
}

/* 左侧侧边栏 */
.sidebar {
  width: 240px;
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.category-item {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
  color: #666;
  position: relative;
}

.category-item:hover {
  background-color: #f5f7fa;
  color: #00bfa5;
}

.category-item.active {
  background-color: #e6fffa;
  color: #00bfa5;
  font-weight: 500;
}

.category-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: #00bfa5;
}

.category-icon {
  margin-right: 12px;
  display: flex;
  align-items: center;
  font-size: 18px;
}

.category-name {
  flex: 1;
  font-size: 15px;
}

.arrow-icon {
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.3s;
}

.category-item.active .arrow-icon {
  opacity: 1;
}

/* 右侧内容区 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  min-width: 0; /* 防止 flex 子项溢出 */
}

.content-header {
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.breadcrumb {
  display: flex;
  align-items: center;
  font-size: 16px;
  color: #666;
}

.crumb-item {
  cursor: pointer;
  transition: color 0.2s;
}

.crumb-item:hover {
  color: #00bfa5;
}

.crumb-item.active {
  color: #333;
  font-weight: 500;
  cursor: default;
}

.separator {
  margin: 0 8px;
  font-size: 12px;
  color: #999;
}

.search-box {
  width: 260px;
}

.content-view {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  position: relative;
}

/* 小类网格视图 */
.subcategory-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.subcategory-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
  position: relative;
  overflow: hidden;
}

.subcategory-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #00bfa5;
}

.card-content h4 {
  margin: 16px 0 8px;
  font-size: 18px;
  color: #333;
}

.card-content p {
  margin: 0;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.sub-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #555;
}

.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #00bfa5;
  opacity: 0.8;
}

/* 药品列表视图 */
.medicine-list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.view-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.view-header h2 {
  margin: 0 0 0 16px;
  font-size: 20px;
  color: #333;
}

.medicine-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.medicine-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  overflow: hidden;
  transition: all 0.3s;
}

.medicine-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.med-image {
  height: 160px;
  background: #f9f9f9;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-slot {
  font-size: 32px;
  color: #ddd;
}

.med-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ff7875, #ff4d4f);
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(255, 77, 79, 0.3);
}

.med-info {
  padding: 16px;
}

.med-info h3 {
  margin: 0 0 8px;
  font-size: 16px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  height: 40px;
  overflow: hidden;
  margin-bottom: 16px;
}

.price-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
}

/* 动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* 药品详情视图 */
.medicine-detail-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* 防止溢出 */
}

.detail-container {
  flex: 1;
  padding-top: 10px;
  overflow: hidden; /* 禁用整体滚动 */
}

.detail-layout {
  height: 100%;
}

.left-col, .right-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #eee;
  padding: 20px; /* 稍微减小内边距 */
  margin-bottom: 12px; /* 减小卡片间距 */
  transition: all 0.3s;
}

.detail-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.image-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 240px; /* 减小高度 */
  background: #fff;
  flex-shrink: 0; /* 防止压缩 */
}

.intro-card {
  flex: 1; /* 占据剩余高度 */
  overflow-y: auto; /* 内容过多时内部滚动 */
  margin-bottom: 0; /* 最后一个卡片无下边距 */
}

.img-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-img {
  max-width: 100%;
  max-height: 100%;
  transition: transform 0.3s;
}

.detail-img:hover {
  transform: scale(1.05);
}

.card-title {
  margin: 0 0 12px;
  font-size: 16px; /* 稍微减小字号 */
  color: #333;
  border-left: 4px solid #00bfa5;
  padding-left: 10px;
  line-height: 1;
}

.intro-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 12px;
  text-align: justify;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-card {
  flex: 1; /* 占据剩余空间 */
  display: flex;
  flex-direction: column;
  min-height: 0; /* 允许 flex 子项缩小 */
  margin-bottom: 12px;
  padding-bottom: 10px; /* 调整底部内边距 */
}

/* 让 Tabs 撑满高度并内部滚动 */
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__header) {
  margin-bottom: 15px;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px; /* 防止滚动条遮挡内容 */
}

.info-content {
  padding: 0;
}

.info-item {
  margin-bottom: 12px;
}

.info-item .label {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: block;
  font-size: 14px;
}

.info-item p {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.notice-list {
  padding-left: 20px;
  margin: 0;
  color: #666;
  line-height: 1.6;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 40px 0;
  gap: 10px;
}

.action-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f0fcf9; /* 浅绿色背景 */
  border-color: #d5f5f0;
  margin-bottom: 0; /* 最后一张卡片不需要下边距 */
  flex-shrink: 0; /* 防止压缩 */
  padding: 16px 24px;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.price-wrap {
  color: #ff4d4f;
  font-weight: bold;
}

.currency {
  font-size: 18px;
}

.amount {
  font-size: 32px;
  line-height: 1;
}

.otc-tag {
  font-weight: 700;
}

.stock-text {
  font-size: 12px;
  color: #999;
}

.action-btns {
  display: flex;
  gap: 16px;
}

.cart-btn, .buy-btn {
  padding: 12px 28px;
  font-weight: 500;
  height: 44px;
  font-size: 16px;
}
/* 悬浮按钮样式 */
.floating-cart-btn {
  position: fixed;
  z-index: 9999;
  cursor: move;
  user-select: none;
  touch-action: none;
}

.cart-icon-wrapper {
  width: 56px;
  height: 56px;
  background: var(--primary-color, #00bfa5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 191, 165, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}

.cart-icon-wrapper:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 191, 165, 0.5);
}

.cart-icon-wrapper:active {
  transform: scale(0.95);
}

/* 购物车弹窗样式 */
.cart-popover {
  position: fixed;
  width: 280px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  z-index: 9998;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #eee;
}

.cart-header {
  padding: 12px 16px;
  background: #f5f7fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #333;
}

.close-cart {
  cursor: pointer;
  font-size: 20px;
  color: #999;
  line-height: 1;
}

.cart-items-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 300px;
  overflow-y: auto;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid #f5f5f5;
  transition: background 0.2s;
}

.cart-item:hover {
  background: #f9f9f9;
}

.item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #333;
  margin-right: 10px;
}

.item-price {
  font-size: 14px;
  color: #ff4d4f;
  margin-right: 10px;
  font-weight: 600;
}

.delete-icon {
  cursor: pointer;
  color: #999;
  font-size: 16px;
}

.delete-icon:hover {
  color: #ff4d4f;
}

.cart-footer {
  padding: 12px 16px;
  border-top: 1px solid #eee;
}
</style>
