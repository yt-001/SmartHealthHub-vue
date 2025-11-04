<template>
  <!-- 视频审核详情页：参考示例布局（中文注释） -->
  <div class="video-detail-page">
    <el-button link type="primary" class="back-btn" @click="router.back()">返回</el-button>
    <h2 class="page-title">视频审核详情</h2>

    <div class="grid">
      <!-- 左侧：视频播放器与基础信息 -->
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
        <div class="desc-card">
          <div class="label">视频的描述详情</div>
          <p class="desc">{{ detail.description || '暂无描述' }}</p>
        </div>
      </section>

      <!-- 右侧：信息卡片与封面展示 -->
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
            <div class="card-title">封面展示</div>
          </template>
          <div class="cover-preview">
            <img v-if="detail.coverImageUrl" :src="detail.coverImageUrl" alt="cover" class="cover-large" />
            <div v-else class="cover-placeholder">封面占位</div>
          </div>
        </el-card>

        <div class="actions">
          <el-button class="btn reject" type="warning" plain :loading="btnLoading" @click="onReject">驳回</el-button>
          <el-button class="btn approve" type="success" plain :loading="btnLoading" @click="onApprove">通过</el-button>
        </div>
      </section>
    </div>
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
    await approveVideoReview(id, 1) // 中文注释：占位，后端实现按需调整参数
    ElMessage.success('已通过')
    router.back()
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally { btnLoading.value = false }
}

const onReject = async () => {
  try { await ElMessageBox.confirm('确认驳回该视频审核？', '提示', { type: 'warning' }) } catch { return }
  btnLoading.value = true
  try {
    await approveVideoReview(id, 0) // 中文注释：占位，后端实现按需调整参数
    ElMessage.success('已驳回')
    router.back()
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
.grid { display: grid; grid-template-columns: 1fr 380px; gap: 16px; }
.left { display: flex; flex-direction: column; gap: 12px; }
.right { display: flex; flex-direction: column; gap: 12px; }

.player-card { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 8px; }
.video-player { width: 100%; height: 300px; background: #000; border-radius: 6px; }
.video-player.placeholder { display:flex; align-items:center; justify-content:center; color:#909399; }

.meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.meta-box { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; display:flex; align-items:center; gap:8px; }
.label { color: #606266; }
.value { color: #303133; font-weight: 600; }

.desc-card { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; }
.desc { color: #606266; line-height: 1.7; }

.info-card .card-title, .cover-card .card-title { font-weight: 600; }
.info-table { width: 100%; border-collapse: collapse; }
.info-table th, .info-table td { border: 1px solid #ebeef5; padding: 8px 10px; text-align: left; }
.info-table th { width: 100px; background: #f8f8f8; white-space: nowrap; color: #333; }
.cover-mini { width: 80px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #ebeef5; }

.cover-card { }
.cover-preview { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; min-height: 120px; display:flex; align-items:center; justify-content:center; }
.cover-large { max-width: 100%; max-height: 220px; object-fit: contain; }
.cover-placeholder { color: #909399; }

.actions { display: flex; flex-direction: column; gap: 8px; }
.btn { width: 160px; align-self: flex-end; }
.btn.reject { border-color: #e6a23c; color: #e6a23c; }
.btn.approve { border-color: #67c23a; color: #67c23a; }
</style>
