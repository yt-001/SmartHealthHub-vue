<template>
  <div class="medicine-detail-page">
    <!-- 顶部导航栏 -->
    <header class="detail-header">
      <div class="header-left" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </div>
      <div class="header-title">药品详情</div>
      <div class="header-right">
        <el-icon><Share /></el-icon>
      </div>
    </header>

    <div class="scroll-container">
      <!-- 药品图片轮播 -->
      <div class="medicine-banner">
        <el-carousel trigger="click" height="300px" arrow="always">
          <el-carousel-item v-for="(img, index) in medicine.images" :key="index">
            <el-image :src="img" fit="contain" class="banner-image" />
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 核心信息卡片 -->
      <div class="info-card basic-info">
        <div class="price-row">
          <span class="currency">¥</span>
          <span class="price">{{ medicine.price }}</span>
          <span class="original-price" v-if="medicine.originalPrice">¥{{ medicine.originalPrice }}</span>
          <el-tag type="danger" effect="dark" size="small" v-if="medicine.isPrescription">处方药</el-tag>
          <el-tag type="success" effect="dark" size="small" v-else>OTC</el-tag>
        </div>
        <h1 class="medicine-name">{{ medicine.name }}</h1>
        <p class="medicine-common-name">通用名称：{{ medicine.commonName }}</p>
        <div class="tags-row">
          <span class="info-tag" v-for="tag in medicine.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="sales-info">
          <span>月售 {{ medicine.sales }}+</span>
          <span>好评率 {{ medicine.rating }}%</span>
        </div>
      </div>

      <!-- 规格选择 -->
      <div class="info-card specs-card">
        <div class="card-title">选择规格</div>
        <div class="specs-list">
          <div 
            v-for="(spec, index) in medicine.specs" 
            :key="index"
            :class="['spec-item', { active: currentSpec === index }]"
            @click="currentSpec = index"
          >
            {{ spec }}
          </div>
        </div>
      </div>

      <!-- 详情内容 Tabs -->
      <div class="info-card details-tabs">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="功能主治" name="functions">
            <div class="tab-content">
              <div class="detail-section">
                <h3><el-icon><FirstAidKit /></el-icon> 适应症</h3>
                <p>{{ medicine.indications }}</p>
              </div>
              <div class="detail-section">
                <h3><el-icon><Aim /></el-icon> 功能主治</h3>
                <p>{{ medicine.functions }}</p>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="用法用量" name="usage">
            <div class="tab-content">
              <div class="detail-section">
                <h3><el-icon><Timer /></el-icon> 用法用量</h3>
                <p>{{ medicine.dosage }}</p>
              </div>
              <div class="detail-section">
                <h3><el-icon><Warning /></el-icon> 不良反应</h3>
                <p>{{ medicine.adverseReactions }}</p>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="禁忌/注意事项" name="precautions">
            <div class="tab-content">
              <div class="detail-section warning">
                <h3><el-icon><CircleCloseFilled /></el-icon> 禁忌</h3>
                <p>{{ medicine.contraindications }}</p>
              </div>
              <div class="detail-section">
                <h3><el-icon><InfoFilled /></el-icon> 注意事项</h3>
                <p>{{ medicine.precautions }}</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 底部垫高 -->
      <div class="bottom-pad"></div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-action-bar">
      <div class="action-icons">
        <div class="icon-btn">
          <el-icon><Service /></el-icon>
          <span>咨询</span>
        </div>
        <div class="icon-btn">
          <el-icon><Star /></el-icon>
          <span>收藏</span>
        </div>
        <div class="icon-btn">
          <el-icon><Shop /></el-icon>
          <span>店铺</span>
        </div>
      </div>
      <div class="action-buttons">
        <el-button class="add-cart-btn" round>加入清单</el-button>
        <el-button type="primary" class="buy-now-btn" round>立即预约</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft, Share, FirstAidKit, Aim, Timer, Warning, 
  CircleCloseFilled, InfoFilled, Service, Star, Shop 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref('functions')
const currentSpec = ref(0)

// 模拟药品数据
const medicine = reactive({
  id: 1,
  name: '复方感冒灵颗粒',
  commonName: '复方感冒灵颗粒',
  price: '28.50',
  originalPrice: '35.00',
  isPrescription: false, // 是否处方药
  images: [
    'https://img1.baidu.com/it/u=3822283938,269871032&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
    'https://img2.baidu.com/it/u=2226871328,1553805345&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500'
  ],
  tags: ['感冒发热', '头痛脑热', '家庭常备'],
  sales: 1000,
  rating: 99,
  specs: ['10g*9袋/盒', '10g*12袋/盒', '10g*15袋/盒'],
  indications: '用于风热感冒之发热，微恶风寒，头身痛，口干而渴，鼻塞涕浊，咽喉红肿疼痛，咳嗽，痰黄粘稠。',
  functions: '辛凉解表，清热解毒。',
  dosage: '口服。一次10克(1袋)，一日3次。',
  adverseReactions: '偶见皮疹、荨麻疹、药热及粒细胞减少；可见困倦、嗜睡、口渴、虚弱感；长期大量用药会导致肝肾功能异常。',
  contraindications: '严重肝肾功能不全者禁用。',
  precautions: '1. 忌烟、酒及辛辣、生冷、油腻食物。\n2. 不宜在服药期间同时服用滋补性中药。\n3. 风寒感冒者不适用。\n4. 糖尿病患者及有高血压、心脏病、肝病、肾病等慢性病严重者应在医师指导下服用。'
})

const goBack = () => {
  router.back()
}

onMounted(() => {
  // 实际项目中这里应该根据 route.params.id 获取药品详情
  console.log('Medicine ID:', route.params.id)
})
</script>

<style scoped>
.medicine-detail-page {
  height: 100%;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  position: relative;
}

.detail-header {
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.header-left, .header-right {
  width: 60px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 16px;
  color: #333;
}

.header-left .el-icon {
  margin-right: 4px;
  font-size: 20px;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  color: #333;
}

.header-right {
  justify-content: flex-end;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 20px;
}

.medicine-banner {
  background: #fff;
  margin-bottom: 12px;
}

.banner-image {
  width: 100%;
  height: 100%;
}

.info-card {
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.basic-info .price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.currency {
  font-size: 16px;
  color: #ff4d4f;
  font-weight: 600;
}

.price {
  font-size: 28px;
  color: #ff4d4f;
  font-weight: 700;
  margin-right: 8px;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-right: 8px;
}

.medicine-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px;
  line-height: 1.4;
}

.medicine-common-name {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.info-tag {
  background: #e6f7ff;
  color: #1890ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.sales-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.specs-card .card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
}

.specs-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.spec-item {
  padding: 6px 16px;
  background: #f5f5f5;
  border-radius: 16px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.3s;
}

.spec-item.active {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #1890ff;
}

.details-tabs {
  padding: 0 16px 16px;
  min-height: 300px;
}

.tab-content {
  padding-top: 12px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-section h3 .el-icon {
  color: #1890ff;
}

.detail-section.warning h3 .el-icon {
  color: #ff4d4f;
}

.detail-section p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.bottom-pad {
  height: 60px;
}

.bottom-action-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 -1px 8px rgba(0,0,0,0.05);
  z-index: 100;
}

.action-icons {
  display: flex;
  gap: 20px;
  margin-right: 20px;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #666;
  cursor: pointer;
}

.icon-btn .el-icon {
  font-size: 20px;
  margin-bottom: 2px;
  color: #333;
}

.action-buttons {
  flex: 1;
  display: flex;
  gap: 12px;
}

.add-cart-btn, .buy-now-btn {
  flex: 1;
  margin: 0 !important;
  font-weight: 600;
}

.add-cart-btn {
  background: #ffaa00;
  border-color: #ffaa00;
  color: #fff;
}

.add-cart-btn:hover {
  background: #ffb82e;
  border-color: #ffb82e;
}

.buy-now-btn {
  background: #ff4d4f;
  border-color: #ff4d4f;
}

.buy-now-btn:hover {
  background: #ff7875;
  border-color: #ff7875;
}

/* 隐藏滚动条但保留滚动功能 */
.scroll-container::-webkit-scrollbar {
  display: none;
}
</style>
