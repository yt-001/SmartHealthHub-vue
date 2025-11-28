<template>
  <div class="comment-section">
    <h3 class="section-title">评论 ({{ comments.length }})</h3>
    
    <div class="input-area">
      <div class="avatar-wrapper">
        <el-avatar :size="40" icon="UserFilled" />
      </div>
      <div class="input-wrapper">
        <el-input
          v-model="newComment"
          type="textarea"
          :rows="3"
          placeholder="发一条友善的评论..."
          resize="none"
        />
        <div class="actions">
          <el-button type="primary" :disabled="!newComment.trim()" @click="submitComment">发布评论</el-button>
        </div>
      </div>
    </div>
    
    <div class="comment-list">
      <div v-for="item in comments" :key="item.id" class="comment-item">
        <el-avatar :size="40" :src="item.avatar" class="user-avatar">
            {{ item.username.charAt(0) }}
        </el-avatar>
        <div class="content">
          <div class="user-info">
            <span class="name">{{ item.username }}</span>
            <span class="time">{{ item.time }}</span>
          </div>
          <p class="text">{{ item.content }}</p>
          <div class="interactions">
            <span class="reply-btn"><el-icon><ChatLineSquare /></el-icon> 回复</span>
            <span class="like-btn"><el-icon><Pointer /></el-icon> {{ Math.floor(Math.random() * 50) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatLineSquare, Pointer, UserFilled } from '@element-plus/icons-vue'

/**
 * 评论区域组件
 * @description 包含评论列表和发表评论功能
 */
interface Comment {
  id: number
  username: string
  avatar: string
  content: string
  time: string
}

const newComment = ref('')
const comments = ref<Comment[]>([
  { id: 1, username: '健康达人', avatar: '', content: '这个视频讲得很透彻，特别是关于饮食的部分，学到了！', time: '10分钟前' },
  { id: 2, username: '李医生', avatar: '', content: '作为同行，我觉得讲得非常专业，值得推荐给患者看。', time: '1小时前' },
  { id: 3, username: '快乐生活', avatar: '', content: '希望能多出一些关于老年人护理的视频。', time: '2小时前' }
])

const submitComment = () => {
  if (!newComment.value.trim()) return
  comments.value.unshift({
    id: Date.now(),
    username: '我',
    avatar: '',
    content: newComment.value,
    time: '刚刚'
  })
  newComment.value = ''
  ElMessage.success('评论发布成功')
}
</script>

<style scoped>
.comment-section {
  margin-top: 32px;
}
.section-title {
  font-size: 20px;
  margin-bottom: 24px;
  font-weight: 600;
}
.input-area {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
}
.input-wrapper {
  flex: 1;
}
.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.comment-item {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding-bottom: 24px;
}
.comment-item:last-child {
  border-bottom: none;
}
.user-avatar {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-weight: bold;
}
.content {
  flex: 1;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
}
.time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.text {
  margin: 0 0 12px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  font-size: 15px;
}
.interactions {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.interactions span {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.interactions span:hover {
  color: var(--el-color-primary);
}
</style>
