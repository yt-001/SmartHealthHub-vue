<template>
  <div class="team-page">
    <!-- 页面头部：英雄榜风格 -->
    <div class="hero-header">
      <h1 class="title">名医殿堂</h1>
      <p class="subtitle">每一位医生，都是守护生命的冠军</p>
      <div class="decoration-line"></div>
    </div>

    <!-- 医生展示列表：冠军卡片风格 -->
    <div class="champion-grid">
      <div 
        v-for="(doctor, index) in doctors" 
        :key="doctor.id" 
        class="champion-card"
        :style="{ '--delay': `${index * 0.1}s` }"
      >
        <!-- 卡片背景光效 -->
        <div class="card-glow"></div>
        
        <!-- 医生形象区 -->
        <div class="doctor-visual">
          <div class="image-wrapper">
            <img :src="doctor.avatar" :alt="doctor.name" class="doctor-img" />
          </div>
          <div class="badge-container" v-if="doctor.isExpert">
            <div class="gold-medal">
              <el-icon><Trophy /></el-icon>
              <span>首席专家</span>
            </div>
          </div>
        </div>

        <!-- 信息展示区 -->
        <div class="doctor-info">
          <div class="name-row">
            <h2 class="name">{{ doctor.name }}</h2>
            <span class="title-tag">{{ doctor.title }}</span>
          </div>
          <p class="department">{{ doctor.department }}</p>
          
          <div class="divider"></div>
          
          <!-- 荣耀数据（RPG属性风格） -->
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-val">{{ doctor.experience }}年</span>
              <span class="stat-label">从业经验</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{{ doctor.patients }}+</span>
              <span class="stat-label">治愈患者</span>
            </div>
            <div class="stat-item">
              <span class="stat-val">{{ doctor.satisfaction }}%</span>
              <span class="stat-label">好评率</span>
            </div>
          </div>

          <p class="intro">{{ doctor.intro }}</p>
          
          <!-- 交互按钮 -->
          <div class="action-row">
            <button class="book-btn">
              <span>预约挂号</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button class="like-btn" @click="toggleLike(index)">
              <el-icon :class="{ 'is-liked': doctor.isLiked }"><StarFilled /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Trophy, ArrowRight, StarFilled } from '@element-plus/icons-vue'

/**
 * 医生团队展示页
 * @description 采用“冠军卡片”风格展示医生风采
 */

interface Doctor {
  id: number
  name: string
  title: string
  department: string
  avatar: string
  experience: number
  patients: string
  satisfaction: number
  intro: string
  isExpert: boolean
  isLiked: boolean
}

// 模拟医生数据
const doctors = ref<Doctor[]>([
  {
    id: 1,
    name: '张文宏',
    title: '主任医师',
    department: '感染科',
    avatar: 'https://picsum.photos/400/500?random=101',
    experience: 25,
    patients: '5w',
    satisfaction: 99.8,
    intro: '长期从事感染性疾病的临床与研究工作，擅长各类疑难感染病的诊断与治疗。',
    isExpert: true,
    isLiked: false
  },
  {
    id: 2,
    name: '李兰娟',
    title: '教授 / 院士',
    department: '肝病中心',
    avatar: 'https://picsum.photos/400/500?random=102',
    experience: 40,
    patients: '8w',
    satisfaction: 99.9,
    intro: '我国人工肝开拓者，在重型肝炎肝衰竭诊治领域取得了重大突破。',
    isExpert: true,
    isLiked: false
  },
  {
    id: 3,
    name: '钟南山',
    title: '终身教授',
    department: '呼吸内科',
    avatar: 'https://picsum.photos/400/500?random=103',
    experience: 50,
    patients: '10w',
    satisfaction: 100,
    intro: '中国呼吸病学领军人物，为抗击非典和新冠肺炎疫情做出了巨大贡献。',
    isExpert: true,
    isLiked: false
  },
  {
    id: 4,
    name: '王晓明',
    title: '副主任医师',
    department: '心血管内科',
    avatar: 'https://picsum.photos/400/500?random=104',
    experience: 15,
    patients: '1.2w',
    satisfaction: 98.5,
    intro: '擅长冠心病、高血压等心血管常见病的诊治及介入治疗。',
    isExpert: false,
    isLiked: false
  },
   {
    id: 5,
    name: '陈静',
    title: '主治医师',
    department: '儿科',
    avatar: 'https://picsum.photos/400/500?random=105',
    experience: 10,
    patients: '8k',
    satisfaction: 99.2,
    intro: '对小儿呼吸系统、消化系统疾病有丰富的临床经验，深受患儿家长信赖。',
    isExpert: false,
    isLiked: false
  }
])

const toggleLike = (index: number) => {
  doctors.value[index].isLiked = !doctors.value[index].isLiked
}
</script>

<style scoped>
.team-page {
  padding: 40px 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

/* 头部样式 */
.hero-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.title {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color) 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.decoration-line {
  width: 60px;
  height: 4px;
  background: var(--primary-color);
  margin: 24px auto 0;
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(5, 150, 105, 0.3);
}

/* 冠军卡片网格 */
.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  padding: 20px;
}

/* 卡片主体 */
.champion-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(10px);
  
  /* 入场动画 */
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.champion-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 
    0 20px 40px -12px rgba(5, 150, 105, 0.2),
    0 0 0 2px var(--primary-color) inset; /* 聚焦边框 */
}

/* 背景光效 */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  z-index: 0;
}
.champion-card:hover .card-glow {
  opacity: 1;
}

/* 医生形象区 */
.doctor-visual {
  position: relative;
  height: 320px;
  overflow: hidden;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.doctor-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.champion-card:hover .doctor-img {
  transform: scale(1.1);
}

/* 勋章 */
.badge-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.gold-medal {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  transform: translateY(-10px);
  opacity: 0;
  animation: dropIn 0.5s 0.2s forwards;
}

@keyframes dropIn {
  to { transform: translateY(0); opacity: 1; }
}

/* 信息展示区 */
.doctor-info {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 4px;
}

.name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
}

.title-tag {
  font-size: 13px;
  color: var(--primary-color);
  background: var(--primary-light-9);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.department {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.divider {
  height: 1px;
  background: rgba(0,0,0,0.05);
  margin: 16px 0;
}

/* 荣耀数据 */
.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-val {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  font-family: 'Arial', sans-serif;
}

.stat-label {
  font-size: 12px;
  color: var(--text-placeholder);
}

.intro {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 66px; /* 3行高度估算 */
}

/* 交互按钮 */
.action-row {
  display: flex;
  gap: 12px;
}

.book-btn {
  flex: 1;
  border: none;
  background: var(--text-main);
  color: #fff;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.book-btn:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3);
}

.like-btn {
  width: 48px;
  height: 48px;
  border: 1px solid var(--el-border-color-lighter);
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: var(--text-placeholder);
  transition: all 0.3s;
}

.like-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: #fffbeb;
}

.is-liked {
  color: #f59e0b;
}
</style>
