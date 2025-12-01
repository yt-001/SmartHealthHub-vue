<template>
  <!-- 可复用的媒体卡片组件：封面在顶部，标题和描述在下方 -->
  <div class="shh-card">
    <!-- 封面展示区域：若无封面则显示占位 -->
    <div class="shh-cover" :class="{ clickable: enableCoverPreview && coverUrl }" @click="handleCoverClick">
      <img v-if="coverUrl" :src="coverUrl" :alt="title" />
      <div v-else class="shh-cover-placeholder">暂无封面</div>
    </div>

    <div class="shh-content">
      <span class="shh-title" :title="title">{{ title }}</span>

      <p v-if="description" class="shh-desc">
        <slot name="description">
          {{ description }}
        </slot>
      </p>

      <!-- 操作区：左次要/右主要；可通过插槽自定义 -->
      <div class="shh-actions">
        <slot name="actions-left">
          <!-- 中文注释：由布尔变量控制左下角显示：true 显示“编辑”按钮；false 显示播放量/点赞量 -->
          <button v-if="showEditLeft && secondaryText" class="shh-pref" @click="$emit('secondary')">{{ secondaryText }}</button>
          <div v-else class="shh-metrics">
            <span class="metric"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>{{ formatNumber(viewCount) }}</span>
            <span class="metric"><svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>{{ authorName || '-' }}</span>
          </div>
        </slot>
        <slot name="actions-right">
          <button v-if="primaryText" class="shh-accept" @click="$emit('primary')">{{ primaryText }}</button>
        </slot>
      </div>
    </div>

    <!-- 大图预览弹窗（可选） -->
    <el-dialog v-if="enableCoverPreview" v-model="coverDialogVisible" title="封面预览" width="720px" :close-on-click-modal="true">
      <div class="shh-cover-full">
        <img v-if="coverUrl" :src="coverUrl" :alt="title + ' full'" />
        <div v-else class="shh-cover-placeholder">暂无封面</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="coverDialogVisible=false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 中文注释：文章/视频统一卡片，支持封面、标题、描述和双按钮操作
import { ref } from 'vue'

// 工具方法：格式化数字为本地化样式（如 1,234）
const formatNumber = (n?: number | null) => {
  if (n == null) return '0'
  try { return new Intl.NumberFormat('zh-CN').format(n) } catch { return String(n) }
}

// 组件入参（全部可选，保持灵活）
const props = defineProps<{
  title?: string
  description?: string
  coverUrl?: string
  primaryText?: string
  secondaryText?: string
  enableCoverPreview?: boolean
  // 控制左下角：true 显示编辑按钮；false 显示播放/作者名
  showEditLeft?: boolean
  // 展示用的播放量与作者名
  viewCount?: number | null
  authorName?: string | null
}>()

// 事件：primary 点击与 secondary 点击
// 使用 emit 让上层决定行为
defineEmits<{ (e: 'primary'): void; (e: 'secondary'): void }>()

// 封面预览弹窗控制
const coverDialogVisible = ref(false)

// 点击封面：若允许预览且存在封面，则打开弹窗
const handleCoverClick = () => {
  if (!props.enableCoverPreview || !props.coverUrl) return
  coverDialogVisible.value = true
}
</script>

<style scoped>
/* 外层卡片样式（基于提供的 cookie card 样式改造，统一前缀防冲突） */
.shh-card {
  width: 100%; /* 让卡片充满栅格列宽 */
  padding: 0; /* 移除内边距，让封面图撑满顶部 */
  background-color: var(--el-bg-color-overlay);
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: var(--el-box-shadow-light);
  overflow: hidden; /* 确保圆角 */
  display: flex;
  flex-direction: column;
}

.shh-content {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.shh-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0.5rem;
}

/* 新增：封面区域（在标题下方） */
.shh-cover {
  margin-top: 0;
  width: 100%;
  /* 将封面高度调整为标准 16:9 */
  aspect-ratio: 16 / 9;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.shh-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.shh-cover.clickable { cursor: pointer; }
.shh-cover-placeholder { color: var(--el-text-color-placeholder); font-size: 12px; }

/* 描述文本：固定两行高度，超出省略，确保卡片布局稳定 */
.shh-desc {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: var(--el-text-color-secondary);
  height: 3rem;      /* 两行固定高度：2 * 1.5rem */
  overflow: hidden;  /* 超出隐藏 */
  display: -webkit-box;
  -webkit-line-clamp: 2;        /* 限制为两行 */
  -webkit-box-orient: vertical; /* 垂直排布以支持 clamp */
  word-break: break-word;
  flex: 1;
}

/* 操作区（左右两侧） */
.shh-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1rem;
  column-gap: 1rem;
  flex-shrink: 0;
}

/* 次要按钮（左侧） */
.shh-pref {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--secondary-color);
  text-decoration: underline;
  transition: all .3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background-color: transparent;
}
.shh-pref:hover { color: var(--primary-color); }
.shh-pref:focus { outline: 2px solid transparent; outline-offset: 2px; }

/* 左下角指标样式 */
.shh-metrics { display: flex; align-items: center; gap: 12px; color: var(--el-text-color-secondary); font-size: 12px; }
.shh-metrics .metric { display: inline-flex; align-items: center; gap: 6px; }

/* 主要按钮（右侧） */
.shh-accept {
  font-size: 0.75rem;
  line-height: 1rem;
  background-color: var(--primary-color);
  font-weight: 500;
  border-radius: 0.5rem;
  color: #fff;
  padding: 0.625rem 1rem;
  border: none;
  transition: all .15s cubic-bezier(0.4, 0, 0.2, 1);
}
.shh-accept:hover { background-color: var(--el-color-primary-light-5); }
.shh-accept:focus { outline: 2px solid transparent; outline-offset: 2px; }

/* 大图弹窗容器 */
.shh-cover-full { display: flex; align-items: center; justify-content: center; }
.shh-cover-full img { max-width: 100%; height: auto; }
</style>
