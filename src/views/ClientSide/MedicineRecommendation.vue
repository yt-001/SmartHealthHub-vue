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
                        <el-button type="primary" round size="large" class="buy-btn" @click="handleBuyNow(currentMedicine!)">
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
          <el-button type="primary" size="small" style="width: 100%" @click="handleCheckout">去结算</el-button>
        </div>
      </div>
    </transition>

    <!-- 订单确认弹窗 -->
    <el-dialog v-model="checkoutVisible" title="确认订单" width="600px" append-to-body>
      <div class="checkout-container">
        <el-table :data="checkoutList" style="width: 100%" max-height="300">
          <el-table-column prop="name" label="药品名称" />
          <el-table-column prop="price" label="单价" width="100">
            <template #default="{ row }">¥{{ row.price }}</template>
          </el-table-column>
          <el-table-column label="数量" width="160">
            <template #default="{ row }">
              <el-input-number v-model="row.quantity" :min="1" :max="99" size="small" style="width: 120px;" />
            </template>
          </el-table-column>
        </el-table>
        
        <div class="mt-4" style="margin-top: 20px;">
          <h4 class="mb-2" style="margin-bottom: 10px;">选择取药地点</h4>
          <el-select v-model="selectedPharmacyId" placeholder="请选择取药地点" style="width: 100%">
            <el-option
              v-for="item in pharmacyList"
              :key="item.id"
              :label="item.name + ' (' + item.address + ')'"
              :value="item.id"
            />
          </el-select>
        </div>

        <div class="total-bar mt-6 text-right" style="margin-top: 24px; text-align: right;">
          <span class="text-gray-500">共 {{ checkoutList.length }} 件商品，总计：</span>
          <span class="text-xl text-red-500 font-bold" style="font-size: 20px; color: #f56c6c; font-weight: bold;">¥{{ totalAmount }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="checkoutVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingOrder" @click="submitOrder">立即支付</el-button>
      </template>
    </el-dialog>

    <!-- 模拟支付弹窗 -->
    <el-dialog v-model="paymentVisible" title="收银台" width="400px" center append-to-body :close-on-click-modal="false">
      <div class="payment-container flex flex-col items-center" style="display: flex; flex-direction: column; align-items: center;">
        <p class="mb-4 text-gray-600" style="margin-bottom: 16px; color: #666;">请扫描下方二维码完成支付</p>
        <div class="qr-code-box p-4 border rounded bg-white" style="padding: 16px; border: 1px solid #eee; border-radius: 8px;">
          <img :src="qrCodeUrl" alt="Payment QR Code" style="width: 200px; height: 200px;" />
        </div>
        <div class="amount-display mt-4" style="margin-top: 16px;">
          <span class="text-2xl font-bold text-red-600" style="font-size: 24px; font-weight: bold; color: #f56c6c;">¥{{ totalAmount }}</span>
        </div>
        <div class="payment-methods mt-4 flex gap-4" style="margin-top: 16px; display: flex; gap: 16px;">
          <el-tag type="success"><el-icon><Check /></el-icon> 微信支付</el-tag>
          <el-tag type="primary"><el-icon><Check /></el-icon> 支付宝</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="paymentVisible = false">取消支付</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPayment">我已完成支付</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getPharmacyLocations } from '@/api/modules/pharmacy'
import { createOrder, payOrder } from '@/api/modules/order'
import { fetchRecommendationTree } from '@/api/modules/medicine'
import type { PharmacyLocation } from '@/api/types/pharmacyTypes'
import type { 
  MedicineRecommendationCategoryVO, 
  MedicineRecommendationSubCategoryVO, 
  MedicineRecommendationMedicineVO 
} from '@/api/types/medicineTypes'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Bowl, FirstAidKit, Apple, Grid, ArrowRight, Search, Right, Back, Picture,
  ShoppingCart, Timer, Warning, Document, Delete, Money, Location, Check
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

interface CartItem extends MedicineRecommendationMedicineVO {
  quantity: number
}

// --- 支付相关状态 ---
const checkoutVisible = ref(false)
const paymentVisible = ref(false)
const pharmacyList = ref<PharmacyLocation[]>([])
const selectedPharmacyId = ref<string>('')
const createdOrderIds = ref<string[]>([])
const qrCodeUrl = ref('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MockPayment') // 模拟二维码
const paying = ref(false)
const submittingOrder = ref(false)

const isDirectBuy = ref(false)
const directBuyItem = ref<CartItem | null>(null)

// 购物车列表
const cartList = ref<CartItem[]>([])
const showCartList = ref(false)

// 计算用于结算的列表（购物车或直接购买单品）
const checkoutList = computed(() => {
    // 如果是直接购买模式，且 directBuyItem 有值，则返回包含该商品的数组
    if (isDirectBuy.value && directBuyItem.value) {
      return [directBuyItem.value]
    }
    // 否则返回购物车列表
    return cartList.value
  })

// 计算总金额（基于 checkoutList）
const totalAmount = computed(() => {
  return checkoutList.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

// --- 状态管理 ---
const categories = ref<MedicineRecommendationCategoryVO[]>([])
const currentCategoryId = ref<string>('')
const currentSubCategory = ref<MedicineRecommendationSubCategoryVO | null>(null)
const currentMedicine = ref<MedicineRecommendationMedicineVO | null>(null)
const searchQuery = ref('')

onMounted(async () => {
  try {
    const res = await fetchRecommendationTree()
    if (res.code === 200 && res.data) {
      categories.value = res.data
      if (categories.value.length > 0) {
        currentCategoryId.value = categories.value[0].id
      }
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('获取推荐分类失败')
  }
})

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

// --- 方法 ---
const selectCategory = (id: string) => {
  currentCategoryId.value = id
  currentSubCategory.value = null // 切换大类时重置小类视图
  currentMedicine.value = null
}

const selectSubCategory = (sub: MedicineRecommendationSubCategoryVO) => {
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

const goToDetail = (med: MedicineRecommendationMedicineVO) => {
  currentMedicine.value = med
}

const addToCart = (med: MedicineRecommendationMedicineVO) => {
  const existing = cartList.value.find(item => item.id === med.id)
  if (existing) {
    existing.quantity++
    ElMessage.success('已增加数量')
    return
  }
  cartList.value.push({ ...med, quantity: 1 })
  ElMessage.success('已加入清单')
}

const removeFromCart = (id: string) => {
  cartList.value = cartList.value.filter(item => item.id !== id)
  if (cartList.value.length === 0) {
    showCartList.value = false
  }
}

const handleCheckout = async () => {
  if (cartList.value.length === 0) return
  isDirectBuy.value = false
  directBuyItem.value = null
  await openCheckoutDialog()
}

const handleBuyNow = async (medicine: MedicineRecommendationMedicineVO) => {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  isDirectBuy.value = true
  directBuyItem.value = { ...medicine, quantity: 1 }
  await openCheckoutDialog()
}

const openCheckoutDialog = async () => {
  try {
    const res = await getPharmacyLocations()
    if (res.code === 200) {
      pharmacyList.value = res.data || []
    }
    selectedPharmacyId.value = ''
    checkoutVisible.value = true
    showCartList.value = false
  } catch (e) {
    console.error(e)
    ElMessage.error('获取取药地点失败')
  }
}

const submitOrder = async () => {
  if (!selectedPharmacyId.value) {
    ElMessage.warning('请选择取药地点')
    return
  }
  
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }

  submittingOrder.value = true
  createdOrderIds.value = []
  
  try {
    // 使用 checkoutList 进行下单
    const listToOrder = checkoutList.value
    const promises = listToOrder.map(item => {
      return createOrder({
        userId: Number(userStore.userInfo!.id),
        medicineId: Number(item.id),
        quantity: item.quantity,
        pharmacyLocationId: Number(selectedPharmacyId.value)
      })
    })

    const results = await Promise.all(promises)
    let successCount = 0
    for (const res of results) {
      if (res.code === 200 && res.data) {
        createdOrderIds.value.push(res.data.id)
        successCount++
      }
    }

    if (successCount === listToOrder.length) {
      checkoutVisible.value = false
      paymentVisible.value = true
    } else {
      ElMessage.error('部分订单创建失败，请重试')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('创建订单失败')
  } finally {
    submittingOrder.value = false
  }
}

const confirmPayment = async () => {
  paying.value = true
  try {
    // 批量支付
    const promises = createdOrderIds.value.map(orderId => {
      return payOrder({
        orderId: orderId,
        paymentMethod: 'WeChat' // 默认微信
      })
    })

    const results = await Promise.all(promises)
    const allSuccess = results.every(res => res.code === 200 && res.data === true)

    if (allSuccess) {
      ElMessage.success('支付成功！')
      paymentVisible.value = false
      
      // 仅当非直接购买（即购物车结算）时清空购物车
      if (!isDirectBuy.value) {
        cartList.value = []
      }
      
      // 重置状态
      isDirectBuy.value = false
      directBuyItem.value = null
      createdOrderIds.value = []
    } else {
      ElMessage.error('支付失败，请重试')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('支付系统异常')
  } finally {
    paying.value = false
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
