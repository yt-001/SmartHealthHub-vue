<template>
  <div class="health-page">
    <transition name="fade-slide" mode="out-in">
      <!-- 首页视图 -->
      <div v-if="!isConsulting" key="home" class="view-container">
        <!-- 头部横幅 -->
        <div class="header-banner animate-fade-in-down">
          <div class="banner-content">
            <h1>健康咨询服务</h1>
            <p class="subtitle">专业医生在线坐诊 · AI 智能辅助导诊 · 全方位守护您的健康</p>
          </div>
        </div>

        <div class="main-content">
          <!-- 智能导诊系统 -->
          <section class="ai-section animate-scale-in">
            <div class="ai-card">
              <div class="ai-header">
                <div class="ai-icon-box">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="ai-title">
                  <h2>智能导诊系统</h2>
                  <span class="ai-badge">AI Powered</span>
                </div>
              </div>
              <p class="ai-desc">不确定挂哪个科？输入您的症状（如：头痛、发烧、持续咳嗽），AI 助手将为您推荐对应的科室和专家。</p>
              
              <div class="ai-input-box">
                <el-input
                  v-model="symptomText"
                  placeholder="请详细描述您的症状..."
                  class="symptom-input"
                  size="large"
                  clearable
                  @keyup.enter="handleAiDiagnose"
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                  <template #append>
                    <el-button type="primary" class="ai-btn" @click="handleAiDiagnose">
                      智能分析
                    </el-button>
                  </template>
                </el-input>
              </div>
              
              <!-- 热门搜索标签 -->
              <div class="hot-tags">
                <span>常见症状：</span>
                <el-tag 
                  v-for="tag in commonSymptoms" 
                  :key="tag" 
                  class="symptom-tag" 
                  effect="plain" 
                  round
                  @click="symptomText = tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
          </section>

          <!-- 快速咨询通道 -->
          <section class="quick-access-section animate-slide-up delay-1">
            <div class="section-header">
              <h3>快速咨询通道</h3>
              <p>多种咨询方式，满足您的不同需求</p>
            </div>
            
            <div class="access-grid">
              <!-- 图文咨询 -->
              <div class="access-card text-consult" @click="startConsult('text')">
                <div class="card-icon blue">
                  <el-icon><ChatDotRound /></el-icon>
                </div>
                <div class="card-info">
                  <h4>图文咨询</h4>
                  <p>发送文字、图片描述病情</p>
                  <div class="card-tags">
                    <span class="tag">响应快</span>
                    <span class="tag">性价比高</span>
                  </div>
                </div>
                <div class="card-action">
                  <el-button link type="primary">立即咨询 <el-icon><ArrowRight /></el-icon></el-button>
                </div>
              </div>

              <!-- 语音咨询 -->
              <div class="access-card audio-consult" @click="startConsult('audio')">
                <div class="card-icon green">
                  <el-icon><Microphone /></el-icon>
                </div>
                <div class="card-info">
                  <h4>语音咨询</h4>
                  <p>与医生实时语音沟通</p>
                  <div class="card-tags">
                    <span class="tag">沟通高效</span>
                    <span class="tag">隐私保护</span>
                  </div>
                </div>
                <div class="card-action">
                  <el-button link type="success">立即咨询 <el-icon><ArrowRight /></el-icon></el-button>
                </div>
              </div>

              <!-- 视频咨询 -->
              <div class="access-card video-consult" @click="startConsult('video')">
                <div class="card-icon orange">
                  <el-icon><VideoCamera /></el-icon>
                </div>
                <div class="card-info">
                  <h4>视频咨询</h4>
                  <p>面对面查看患处更直观</p>
                  <div class="card-tags">
                    <span class="tag">专家亲诊</span>
                    <span class="tag">模拟线下</span>
                  </div>
                </div>
                <div class="card-action">
                  <el-button link type="warning">立即咨询 <el-icon><ArrowRight /></el-icon></el-button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- 咨询对话视图 -->
      <div v-else key="consultation" class="view-container consultation-layout">
        <!-- 左侧边栏：专家信息与历史记录 -->
        <div class="consult-sidebar animate-slide-right">
          <!-- 推荐专家卡片 -->
          <div class="expert-card">
            <div class="expert-header">
              <el-avatar :size="60" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <div class="expert-info">
                <h4>李华 主任医师</h4>
                <p>呼吸内科 · 北京协和医院</p>
              </div>
            </div>
            <div class="expert-tags">
              <el-tag size="small" type="success">从业20年</el-tag>
              <el-tag size="small" type="warning">评分 4.9</el-tag>
            </div>
            <p class="expert-intro">擅长：呼吸道感染、哮喘、慢性阻塞性肺疾病等呼吸系统常见病。</p>
            <el-button type="primary" plain size="small" class="w-100" @click="showExpertDetails">查看详情</el-button>
          </div>

          <!-- 历史咨询记录 -->
          <div class="history-section">
            <div class="history-title">
              <el-icon><Clock /></el-icon> 历史咨询
            </div>
            <div class="history-list">
              <div class="history-item" v-for="i in 10" :key="i" @click="showHistoryDetail(i)">
                <div class="history-date">2023-12-{{ 30 - i }}</div>
                <div class="history-desc">咨询内容：{{ i % 2 === 0 ? '感冒发烧，持续低烧不退...' : '皮肤红肿，伴有瘙痒感...' }}</div>
                <div class="history-status status-done">已完成</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 专家详情弹窗 -->
        <el-dialog v-model="expertDialogVisible" title="专家详细信息" width="500px" append-to-body>
          <div class="expert-detail-content">
            <div class="detail-header">
              <el-avatar :size="80" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <div>
                <h3>李华 <el-tag size="small">主任医师</el-tag></h3>
                <p>北京协和医院 · 呼吸内科</p>
              </div>
            </div>
            <div class="detail-body">
              <p><strong>擅长领域：</strong> 呼吸道感染、哮喘、慢性阻塞性肺疾病、肺心病等呼吸系统常见病及疑难杂症的诊治。</p>
              <p><strong>个人简介：</strong> 李华医生从事呼吸内科临床工作20余年，具有丰富的临床经验。曾多次参与国家级科研项目，发表学术论文30余篇。</p>
              <p><strong>出诊时间：</strong> 周一上午、周三下午</p>
            </div>
          </div>
        </el-dialog>

        <!-- 右侧主区域：聊天窗口 -->
        <div class="consult-main animate-slide-left">
          <div class="chat-header">
            <div class="header-left">
              <el-button link @click="isConsulting = false">
                <el-icon><ArrowLeft /></el-icon> 返回
              </el-button>
              <h3>在线咨询</h3>
            </div>
            <div class="header-right">
              <el-tag type="success" effect="dark">进行中</el-tag>
            </div>
          </div>

          <div class="chat-messages" ref="messagesRef">
            <div v-for="(msg, index) in messages" :key="index" :class="['message-row', msg.role === 'user' ? 'message-right' : 'message-left']">
              <el-avatar v-if="msg.role === 'ai'" :size="40" class="msg-avatar" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <div class="message-bubble">
                <div class="message-content" v-html="msg.content"></div>
                <div class="message-time">{{ msg.time }}</div>
              </div>
              <!-- 用户消息不显示头像 -->
            </div>
          </div>

          <div class="chat-input-area">
            <!-- 附件预览区 -->
            <div v-if="attachments.length > 0" class="attachment-preview-area">
              <div v-for="(file, index) in attachments" :key="index" class="attachment-item">
                <el-icon v-if="file.type === 'file'"><Document /></el-icon>
                <el-image 
                  v-else 
                  class="preview-img" 
                  :src="file.url" 
                  :preview-src-list="[file.url]"
                  fit="cover"
                />
                <span class="file-name">{{ file.name }}</span>
                <el-icon class="close-btn" @click="removeAttachment(index)"><Close /></el-icon>
              </div>
            </div>

            <el-input
              v-model="inputMessage"
              type="textarea"
              :rows="3"
              placeholder="请输入您的问题..."
              resize="none"
              @keyup.enter.ctrl="sendMessage"
            />
            <div class="input-actions">
              <div class="action-icons">
                <el-tooltip content="发送图片">
                  <el-icon @click="triggerFileUpload('image')"><Picture /></el-icon>
                </el-tooltip>
                <el-tooltip content="发送语音">
                  <el-icon @click="startVoiceInput"><Microphone /></el-icon>
                </el-tooltip>
                <el-tooltip content="上传文件">
                  <el-icon @click="triggerFileUpload('file')"><Folder /></el-icon>
                </el-tooltip>
              </div>
              <el-button type="primary" @click="sendMessage">发送 (Ctrl+Enter)</el-button>
            </div>
            
            <!-- 隐藏的文件输入 -->
            <input 
              type="file" 
              ref="fileInputRef" 
              style="display: none" 
              @change="handleFileChange" 
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, reactive } from 'vue'
import { 
  Cpu, 
  Search, 
  ChatDotRound, 
  Microphone, 
  VideoCamera, 
  ArrowRight,
  FirstAidKit,
  PhoneFilled,
  WarningFilled,
  Clock,
  ArrowLeft,
  Picture,
  Document,
  Close,
  Folder
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

/**
 * 页面状态控制
 */
const isConsulting = ref(false)
const expertDialogVisible = ref(false)

/**
 * 症状输入文本
 */
const symptomText = ref('')

/**
 * 常见症状标签
 */
const commonSymptoms = ['感冒', '失眠', '皮肤过敏', '胃痛', '关节疼痛']

/**
 * 聊天相关状态
 */
const inputMessage = ref('')
const messagesRef = ref<HTMLElement | null>(null)
interface Message {
  role: 'user' | 'ai';
  content: string;
  time: string;
}
const messages = reactive<Message[]>([])

// 附件相关
interface Attachment {
  type: 'image' | 'file';
  name: string;
  url: string;
}
const attachments = ref<Attachment[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)
const currentUploadType = ref<'image' | 'file'>('image')

/**
 * 获取当前时间字符串
 */
const getCurrentTime = () => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 处理智能导诊分析
 * 模拟 AI 分析过程并切换到咨询页
 */
const handleAiDiagnose = () => {
  if (!symptomText.value.trim()) {
    ElMessage.warning('请输入症状描述')
    return
  }
  
  // 模拟加载
  const loading = ElMessage.success({
    message: '正在分析您的症状，为您匹配专家...',
    duration: 1000
  })

  // 1秒后切换页面
  setTimeout(() => {
    isConsulting.value = true
    // 初始化消息
    messages.length = 0 // 清空旧消息
    // 添加用户输入的消息
    messages.push({
      role: 'user',
      content: symptomText.value,
      time: getCurrentTime()
    })
    
    // 模拟AI/医生回复
    setTimeout(() => {
      messages.push({
        role: 'ai',
        content: `您好，我是呼吸内科李医生。收到您的描述：“${symptomText.value}”。请问症状持续多久了？有没有伴随发热？`,
        time: getCurrentTime()
      })
      scrollToBottom()
    }, 800)
    
  }, 1000)
}

/**
 * 触发文件上传
 */
const triggerFileUpload = (type: 'image' | 'file') => {
  currentUploadType.value = type
  if (fileInputRef.value) {
    fileInputRef.value.accept = type === 'image' ? 'image/*' : '.doc,.docx,.pdf,.txt'
    fileInputRef.value.click()
  }
}

/**
 * 处理文件选择
 */
const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files.length > 0) {
    const file = input.files[0]
    // 模拟上传，直接生成 Object URL
    const url = URL.createObjectURL(file)
    attachments.value.push({
      type: currentUploadType.value,
      name: file.name,
      url: url
    })
    // 清空 input 允许重复选择同一文件
    input.value = ''
  }
}

/**
 * 移除附件
 */
const removeAttachment = (index: number) => {
  attachments.value.splice(index, 1)
}

/**
 * 开始语音输入
 */
const startVoiceInput = () => {
  ElMessage.info('正在聆听... (模拟语音转文字)')
  setTimeout(() => {
    const mockTexts = ['我感觉最近胸口有点闷', '这两天一直咳嗽不好', '嗓子疼，吞咽困难']
    const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)]
    inputMessage.value += (inputMessage.value ? ' ' : '') + randomText
    ElMessage.success('语音识别成功')
  }, 1500)
}

/**
 * 发送消息
 */
const sendMessage = () => {
  if (!inputMessage.value.trim() && attachments.value.length === 0) return
  
  let content = inputMessage.value
  
  // 处理附件
  if (attachments.value.length > 0) {
    const attachmentHtml = attachments.value.map(att => {
      if (att.type === 'image') {
        return `<br><img src="${att.url}" style="max-width: 200px; border-radius: 8px; margin-top: 8px; cursor: pointer;" onclick="window.open('${att.url}', '_blank')">`
      } else {
        return `<br><a href="${att.url}" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; color: var(--primary-color); text-decoration: none; background: #f0f9eb; padding: 4px 8px; border-radius: 4px;"><span style="font-size: 16px;">📄</span> ${att.name}</a>`
      }
    }).join('')
    content += attachmentHtml
  }

  messages.push({
    role: 'user',
    content: content,
    time: getCurrentTime()
  })
  
  const userText = inputMessage.value
  inputMessage.value = ''
  attachments.value = [] // 清空附件
  scrollToBottom()

  // 模拟自动回复
  setTimeout(() => {
    messages.push({
      role: 'ai',
      content: `收到，针对"${userText || '您发送的内容'}"，建议您先多喝水，注意休息。如果症状加重，建议来院面诊。`,
      time: getCurrentTime()
    })
    scrollToBottom()
  }, 1500)
}

/**
 * 滚动到底部
 */
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesRef.value) {
      messagesRef.value.scrollTop = messagesRef.value.scrollHeight
    }
  })
}

/**
 * 开始咨询（快捷入口）
 * @param type 咨询类型 'text' | 'audio' | 'video'
 */
const startConsult = (type: string) => {
  const typeMap: Record<string, string> = {
    text: '图文咨询',
    audio: '语音咨询',
    video: '视频咨询'
  }
  // 直接跳转到咨询页，模拟一个初始状态
  symptomText.value = `我想进行${typeMap[type]}`
  handleAiDiagnose()
}

/**
 * 显示专家详情
 */
const showExpertDetails = () => {
  expertDialogVisible.value = true
}

/**
 * 显示历史记录详情 (模拟)
 */
const showHistoryDetail = (index: number) => {
  ElMessage.info(`查看第 ${index} 条历史记录详情`)
}
</script>

<style scoped>
.health-page {
  /* 适配新的 Flex 布局，不再需要 fixed 定位 */
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  overflow: hidden; /* 禁止自身出现滚动条，交由内部容器管理 */
  display: flex;
  flex-direction: column;
}

.view-container {
  width: 100%;
  flex: 1; /* 自动填充剩余空间 */
  overflow-y: auto; /* 内容区域允许滚动 */
  overflow-x: hidden;
}

/* 咨询详情页布局 */
.consultation-layout {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 20px;
  height: 100%; /* 占满父容器 */
  width: 100%;
  box-sizing: border-box;
}

/* 左侧边栏 */
.consult-sidebar {
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.expert-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.expert-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.expert-info h4 {
  margin: 0 0 4px;
  font-size: 1rem;
  color: #303133;
}

.expert-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #909399;
}

.expert-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.expert-intro {
  font-size: 0.85rem;
  color: #606266;
  margin-bottom: 16px;
  line-height: 1.4;
}

.w-100 { width: 100%; }

.history-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  flex: 1;
  overflow-y: auto;
}

.history-title {
  font-weight: bold;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
}

.history-item {
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover {
  background-color: #f5f7fa;
}

.history-item:last-child { border-bottom: none; }

.history-date {
  font-size: 0.75rem;
  color: #909399;
  margin-bottom: 4px;
}

.history-desc {
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-status {
  font-size: 0.75rem;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
}

.status-done {
  background-color: #f0f9eb;
  color: #67c23a;
}

/* 右侧聊天区 */
.consult-main {
  flex: 1;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  margin: 0;
  font-size: 1.1rem;
}

.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f9fafb;
}

.message-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: flex-start;
}

.message-left {
  flex-direction: row;
}

.message-right {
  flex-direction: row-reverse;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  position: relative;
}

.message-left .message-bubble {
  background-color: white;
  border-top-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.message-right .message-bubble {
  background-color: var(--primary-color);
  color: white;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);
}

.message-content {
  line-height: 1.5;
  font-size: 0.95rem;
}

.message-time {
  font-size: 0.7rem;
  margin-top: 4px;
  opacity: 0.7;
  text-align: right;
}

.chat-input-area {
  padding: 20px;
  border-top: 1px solid #ebeef5;
  background-color: white;
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.action-icons {
  display: flex;
  gap: 16px;
  color: #606266;
  font-size: 20px;
}

.action-icons .el-icon {
  cursor: pointer;
  transition: color 0.2s;
}

.action-icons .el-icon:hover {
  color: var(--primary-color);
}

/* 头部横幅 - 复用 */
.header-banner {
  background: linear-gradient(135deg, var(--primary-color) 0%, #4facfe 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
  margin-bottom: -40px; /* 为了让下面的卡片浮在上面 */
  position: relative;
  z-index: 0;
}

.banner-content h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  font-weight: 700;
  letter-spacing: 1px;
}

.subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main-content {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

/* 智能导诊 */
.ai-section {
  margin-bottom: 40px;
}

.ai-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  gap: 12px;
}

.ai-icon-box {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.ai-title h2 {
  font-size: 1.8rem;
  color: #303133;
  margin: 0;
  display: inline-block;
  vertical-align: middle;
}

.ai-badge {
  background: linear-gradient(90deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 8px;
  vertical-align: middle;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.ai-desc {
  color: #606266;
  margin-bottom: 30px;
  font-size: 1rem;
}

.ai-input-box {
  max-width: 700px;
  margin: 0 auto 20px;
}

.symptom-input :deep(.el-input__wrapper) {
  border-radius: 30px 0 0 30px;
  padding-left: 20px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.symptom-input :deep(.el-input-group__append) {
  border-radius: 0 30px 30px 0;
  background-color: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
  overflow: hidden;
}

.symptom-input :deep(.el-input__inner) {
  height: 50px;
  font-size: 1.1rem;
}

.ai-btn {
  font-size: 1rem;
  font-weight: 600;
  padding: 0 30px;
  height: 52px;
  margin: -1px -20px; /* Hack to fill the append slot */
  border-radius: 0;
}

.hot-tags {
  color: #909399;
  font-size: 0.9rem;
}

.symptom-tag {
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.symptom-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* 快速咨询通道 */
.quick-access-section {
  margin-bottom: 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-header h3 {
  font-size: 1.5rem;
  color: #303133;
  margin-bottom: 8px;
}

.section-header p {
  color: #909399;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.access-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid #ebeef5;
  position: relative;
  overflow: hidden;
}

.access-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.1);
  border-color: transparent;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 20px;
  transition: all 0.3s;
}

.access-card:hover .card-icon {
  transform: scale(1.1);
}

.card-icon.blue { background-color: #ecf5ff; color: #409eff; }
.card-icon.green { background-color: #f0f9eb; color: #67c23a; }
.card-icon.orange { background-color: #fdf6ec; color: #e6a23c; }

.card-info h4 {
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #303133;
}

.card-info p {
  color: #909399;
  font-size: 0.9rem;
  margin-bottom: 16px;
  height: 20px;
}

.card-tags {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.tag {
  font-size: 0.75rem;
  padding: 2px 8px;
  background-color: #f4f4f5;
  color: #909399;
  border-radius: 4px;
}

.card-action {
  margin-top: auto;
}

/* 动画类 */
.animate-fade-in-down {
  animation: fadeInDown 0.8s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out backwards;
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .banner-content h1 {
    font-size: 1.8rem;
  }
  
  .consultation-layout {
    flex-direction: column;
    height: auto;
  }
  
  .consult-sidebar {
    width: 100%;
    height: auto;
  }
  
  .consult-main {
    height: 600px;
  }
}

/* 附件预览样式 */
.attachment-preview-area {
  padding: 0 0 12px;
  display: flex;
  gap: 12px;
  overflow-x: auto;
}

.attachment-item {
  position: relative;
  background: #f4f4f5;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.preview-img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.file-name {
  font-size: 0.85rem;
  color: #606266;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  background: #f56c6c;
  color: white;
  border-radius: 50%;
  padding: 2px;
  cursor: pointer;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s;
}

.attachment-item:hover .close-btn {
  opacity: 1;
}

/* 专家详情弹窗样式 */
.expert-detail-content {
  padding: 0 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.detail-header h3 {
  margin: 0 0 8px;
  font-size: 1.5rem;
  color: #303133;
}

.detail-header p {
  margin: 0;
  color: #909399;
}

.detail-body p {
  margin-bottom: 16px;
  line-height: 1.6;
  color: #606266;
}

.detail-body strong {
  color: #303133;
}
</style>

