<template>
  <el-dialog
    v-model="visible"
    title="分享视频"
    width="400px"
    align-center
    class="share-modal"
  >
    <div class="share-options">
      <div class="share-btn wechat" @click="handleShare('微信')">
        <div class="icon-wrapper bg-green">
          <el-icon :size="28" color="#fff"><ChatDotRound /></el-icon>
        </div>
        <span>微信</span>
      </div>
      <div class="share-btn weibo" @click="handleShare('微博')">
        <div class="icon-wrapper bg-red">
          <el-icon :size="28" color="#fff"><Position /></el-icon>
        </div>
        <span>微博</span>
      </div>
      <div class="share-btn link" @click="copyLink">
        <div class="icon-wrapper bg-blue">
          <el-icon :size="28" color="#fff"><Link /></el-icon>
        </div>
        <span>复制链接</span>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ChatDotRound, Position, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

/**
 * 分享弹窗组件
 * @description 展示社交分享选项
 * @param modelValue 控制弹窗显示
 */
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const handleShare = (platform: string) => {
  ElMessage.success(`已分享到${platform}`)
  visible.value = false
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('链接已复制到剪贴板')
  visible.value = false
}
</script>

<style scoped>
.share-options {
  display: flex;
  justify-content: space-around;
  padding: 10px 0 20px;
}
.share-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s;
}
.share-btn:hover {
  transform: translateY(-5px);
}
.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.bg-green { background: #07c160; }
.bg-red { background: #e6162d; }
.bg-blue { background: #409eff; }

span {
  font-size: 14px;
  color: var(--el-text-color-primary);
}
</style>
