<template>
  <!-- 视频审核详情页：左右 5/5 开布局；描述三行省略；点击弹窗查看全文 -->
  <div class="video-detail-page">
    <el-button link type="primary" class="back-btn" @click="router.back()">返回</el-button>
    <h2 class="page-title">视频审核详情</h2>

    <div class="grid">
      <!-- 左侧：视频播放器与基础信息（50%） -->
      <section class="left">
        <div class="player-card">
          <video v-if="detail.videoUrl" :src="detail.videoUrl" controls class="video-player"></video>
          <div v-else class="video-player placeholder">视频占位</div>
        </div>
        <div class="meta-row">
          <div class="meta-box">
            <div class="label">占位视频标题</div>
          </div>
          <div class="meta-box">
            <div class="label">播放量：</div>
            <div class="value">{{ formatNumber(detail.viewCount) }}</div>
          </div>
        </div>
        <!-- 描述卡片：三行省略，点击打开弹窗查看全文 -->
        <div class="desc-card" role="button" :title="detail.description || '暂无描述'" @click="openDescDialog">
          <div class="label">视频的描述详情</div>
          <p class="desc">{{ detail.description || '暂无描述' }}</p>
        </div>
      </section>

      <!-- 右侧：信息卡片与封面展示（50%） -->
      <section class="right">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-title">视频的一些其他信息展示区域</div>
          </template>
          <table class="info-table">
            <tbody>
              <tr><th>视频ID</th><td>{{ detail.id ?? '-' }}</td><th>用户ID</th><td>{{ detail.authorId ?? '-' }}</td></tr>
              <tr>
                <th>状态</th>
                <td>
                  <el-tag v-if="detail.status === 3" type="warning">待审核</el-tag>
                  <el-tag v-else-if="detail.status === 4" type="danger">未通过审核</el-tag>
                  <span v-else>-</span>
                </td>
                <th>分类ID</th><td>{{ detail.category ?? '-' }}</td>
              </tr>
              <tr><th>创建时间</th><td>{{ formatTime(detail.createdAt) }}</td><th>播放量</th><td>{{ formatNumber(detail.viewCount) }}</td></tr>
              <tr><th>封面</th><td><img v-if="detail.coverImageUrl" :src="detail.coverImageUrl" alt="cover" class="cover-mini" /><span v-else>-</span></td><th>更新时间</th><td>{{ formatTime(detail.updatedAt) }}</td></tr>
              <tr><th>视频地址</th><td colspan="3"><a v-if="detail.videoUrl" :href="detail.videoUrl" target="_blank">{{ detail.videoUrl }}</a><span v-else>-</span></td></tr>
            </tbody>
          </table>
        </el-card>

        <el-card class="cover-card" shadow="never">
          <template #header>
            <div class="card-title">封面与操作</div>
          </template>
          <div class="cover-action-row">
            <div class="cover-preview" role="button" :title="detail.coverImageUrl ? '点击查看原图' : '暂无封面'" @click="openCoverDialog">
              <img v-if="detail.coverImageUrl" :src="detail.coverImageUrl" alt="cover" class="cover-large" />
              <div v-else class="cover-placeholder">封面占位</div>
            </div>
            <div class="action-col">
              <el-button class="btn reject" type="warning" plain :loading="btnLoading" @click="onReject">驳回</el-button>
              <el-button class="btn approve" type="success" plain :loading="btnLoading" @click="onApprove">通过</el-button>
            </div>
          </div>
        </el-card>

        <!-- 操作按钮已移动到封面卡片右侧的纵向区域，这里移除 -->
      </section>
    </div>

    <!-- 弹窗：展示完整描述内容 -->
    <el-dialog v-model="descDialogVisible" title="视频描述" width="640px" :close-on-click-modal="true">
      <div class="desc-full" v-if="detail.description">{{ detail.description }}</div>
      <div class="desc-full empty" v-else>暂无描述</div>
      <template #footer>
        <el-button type="primary" @click="descDialogVisible = false">我已了解</el-button>
      </template>
    </el-dialog>

    <!-- 弹窗：封面大图预览 -->
    <el-dialog v-model="coverDialogVisible" title="封面预览" width="720px" :close-on-click-modal="true" class="cover-dialog">
      <div class="cover-full">
        <img v-if="detail.coverImageUrl" :src="detail.coverImageUrl" alt="cover-full" />
        <div v-else class="cover-placeholder">暂无封面</div>
      </div>
      <template #footer>
        <el-button type="primary" @click="coverDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 中文注释：视频审核详情页，对接后端视频详情与审核接口（占位路径）
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { HealthVideoVO } from '@/api/types/videoTypes'
import { fetchVideoReviewDetail, approveVideoReview } from '@/api/modules/video'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')

const detail = ref<HealthVideoVO | any>({})
const loading = ref(false)
const btnLoading = ref(false)

// 中文注释：描述弹窗的显隐状态
const descDialogVisible = ref(false)
// 中文注释：封面预览弹窗的显隐状态
const coverDialogVisible = ref(false)

// 中文注释：打开描述全文弹窗（无描述则不弹）
const openDescDialog = () => {
  if (!detail.value || !detail.value.description) return
  descDialogVisible.value = true
}
// 中文注释：打开封面预览弹窗（无封面则不弹）
const openCoverDialog = () => {
  if (!detail.value || !detail.value.coverImageUrl) return
  coverDialogVisible.value = true
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const formatNumber = (n?: number | null) => {
  if (n == null) return '-'
  return new Intl.NumberFormat('zh-CN').format(n)
}
const toDate = (v?: string | number | Date | null): string => {
  if (!v) return '-'
  const d = new Date(v)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
const formatTime = (v?: string | number | Date | null) => toDate(v)

const loadDetail = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const { data } = await fetchVideoReviewDetail(id)
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    detail.value = data || {}
  } catch (e) {
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    ElMessage.error('加载详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const onApprove = async () => {
  try { await ElMessageBox.confirm('确认通过该视频审核？', '提示', { type: 'warning' }) } catch { return }
  btnLoading.value = true
  try {
    const { data } = await approveVideoReview(id, 1) // 中文注释：审核通过 -> 状态 1（已发布）
    ElMessage.success(data || '已通过')
    await sleep(1000) // 中文注释：停顿一秒后返回列表
    router.push({ path: '/portal/admin/video-review' })
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally { btnLoading.value = false }
}

const onReject = async () => {
  try { await ElMessageBox.confirm('确认驳回该视频审核？', '提示', { type: 'warning' }) } catch { return }
  btnLoading.value = true
  try {
    const { data } = await approveVideoReview(id, 4) // 中文注释：审核不通过 -> 状态 4（未通过审核）
    ElMessage.success(data || '已驳回')
    await sleep(1000) // 中文注释：停顿一秒后返回列表
    router.push({ path: '/portal/admin/video-review' })
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally { btnLoading.value = false }
}

onMounted(loadDetail)
</script>

<style scoped>
.video-detail-page { padding: 16px; }
.back-btn { margin-bottom: 8px; }
.page-title { font-size: 18px; margin: 0 0 10px; }

/* 重要：左右 5/5 开布局，保持比例稳定；窄屏时改为单列 */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.left { display: flex; flex-direction: column; gap: 12px; }
.right { display: flex; flex-direction: column; gap: 12px; }
@media (max-width: 1024px) {
  .grid { grid-template-columns: 1fr; }
  .actions { align-items: flex-end; }
}

.player-card { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 8px; }
.video-player { width: 100%; height: 300px; background: #000; border-radius: 6px; }
.video-player.placeholder { display:flex; align-items:center; justify-content:center; color:#909399; }

.meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.meta-box { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; display:flex; align-items:center; gap:8px; }
.label { color: #606266; }
.value { color: #303133; font-weight: 600; }

/* 描述卡片：三行固定高度 + 省略号，点击弹窗查看全文 */
.desc-card { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; cursor: pointer; }
.desc-card:hover { border-color: #dcdfe6; }
.desc { color: #606266; line-height: 1.7; /* 三行省略：webkit 方案 */
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;
  /* 视觉固定高度以保持布局稳定：三行的高度 */
  min-height: calc(1.7em * 3); max-height: calc(1.7em * 3);
}

/* 弹窗中的全文样式 */
.desc-full { white-space: pre-wrap; line-height: 1.8; color: #303133; }
.desc-full.empty { color: #909399; }

.info-card .card-title, .cover-card .card-title { font-weight: 600; }
.info-table { width: 100%; border-collapse: collapse; }
.info-table th, .info-table td { border: 1px solid #ebeef5; padding: 8px 10px; text-align: left; }
.info-table th { width: 100px; background: #f8f8f8; white-space: nowrap; color: #333; }
.cover-mini { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #ebeef5; }

.cover-card { }
.cover-preview { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; min-height: 110px; display:flex; align-items:center; justify-content:center; }
/* 缩小封面预览高度，整体更紧凑 */
.cover-large { max-width: 100%; max-height: 140px; object-fit: contain; }
.cover-placeholder { color: #909399; }

/* 封面 + 按钮 横向容器：左封面，右按钮纵向排列 */
.cover-action-row { display: grid; grid-template-columns: 350px 1fr; gap: 16px; align-items: center; }
@media (max-width: 480px) { .cover-action-row { grid-template-columns: 1fr; } }
.action-col { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; justify-content: center; }
.btn { width: 120px; }
.btn.reject { border-color: #e6a23c; color: #e6a23c; }
.btn.approve { border-color: #67c23a; color: #67c23a; }

/* 封面大图弹窗样式 */
.cover-dialog :deep(.el-dialog__body) { padding-top: 8px; }
.cover-full { display:flex; align-items:center; justify-content:center; }
.cover-full img { max-width: 100%; height: auto; }

/* 移除操作按钮的 hover/focus/active 悬浮效果，保持朴素边框与文字颜色 */
.btn.reject,
.btn.approve { transition: none; }
.btn.reject:hover,
.btn.reject:focus,
.btn.reject:active { background-color: transparent !important; color: #e6a23c !important; border-color: #e6a23c !important; box-shadow: none !important; }
.btn.approve:hover,
.btn.approve:focus,
.btn.approve:active { background-color: transparent !important; color: #67c23a !important; border-color: #67c23a !important; box-shadow: none !important; }
</style>
