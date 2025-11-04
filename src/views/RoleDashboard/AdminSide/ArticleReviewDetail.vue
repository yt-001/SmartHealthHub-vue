<template>
  <!-- 文章审核详情页：左右 5/5 开布局；描述三行省略；点击弹窗查看全文 -->
  <div class="article-detail-page" v-loading="loading" element-loading-text="加载中...">
    <el-button link type="primary" class="back-btn" @click="router.back()">返回</el-button>
    <h2 class="page-title">文章审核详情</h2>

    <div class="grid">
      <!-- 左侧：文章标题与描述（50%） -->
      <section class="left">
        <el-card class="title-card" shadow="never">
          <template #header>
            <div class="card-title">文章标题</div>
          </template>
          <div class="title-text">{{ (detail.title ? detail.title : '-') + (detail.summary ? ' -- ' + detail.summary : '') }}</div>
        </el-card>

        <!-- 正文卡片：支持约十行省略，点击打开弹窗查看全文 -->
        <div class="desc-card" role="button" :title="detail.content || '暂无内容'" @click="openDescDialog">
          <div class="label">文章内容</div>
          <p class="desc">{{ detail.content || '暂无内容' }}</p>
        </div>
      </section>

      <!-- 右侧：信息卡片与封面展示（50%） -->
      <section class="right">
        <el-card class="info-card" shadow="never">
          <template #header>
            <div class="card-title">文章的其他信息</div>
          </template>
          <table class="info-table">
            <tbody>
              <tr><th>文章ID</th><td>{{ detail.id ?? '-' }}</td><th>作者ID</th><td>{{ detail.authorId ?? '-' }}</td></tr>
              <tr>
                <th>状态</th>
                <td>
                  <el-tag v-if="detail.status === 3" type="warning">待审核</el-tag>
                  <el-tag v-else-if="detail.status === 4" type="danger">未通过审核</el-tag>
                  <span v-else>-</span>
                </td>
                <th>分类</th><td>{{ detail.category ?? '-' }}</td>
              </tr>
              <tr><th>科室</th><td>{{ detail.deptName ?? '-' }}（ID：{{ detail.deptId ?? '-' }}）</td><th>阅读数</th><td>{{ formatNumber(detail.viewCount) }}</td></tr>
              <tr><th>创建时间</th><td>{{ formatTime(detail.createdAt) }}</td><th>更新时间</th><td>{{ formatTime(detail.updatedAt) }}</td></tr>
              <tr><th>封面</th><td colspan="3"><img v-if="detail.coverImageUrl" :src="detail.coverImageUrl" alt="cover" class="cover-mini" /><span v-else>-</span></td></tr>
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
      </section>
    </div>

    <!-- 弹窗：展示完整描述内容 -->
    <el-dialog v-model="descDialogVisible" title="文章内容" width="640px" :close-on-click-modal="true">
      <div class="desc-full" v-if="detail.content">{{ detail.content }}</div>
      <div class="desc-full empty" v-else>暂无内容</div>
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
// 中文注释：文章审核详情页，对接后端文章详情与审核接口（占位路径）
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { HealthArticleVO } from '@/api/types/articleTypes'
import { fetchArticleReviewDetail, approveArticleReview } from '@/api/modules/article'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')

const detail = ref<HealthArticleVO | any>({})
const loading = ref(false)
const btnLoading = ref(false)

// 描述与封面弹窗
const descDialogVisible = ref(false)
const coverDialogVisible = ref(false)

const openDescDialog = () => { if (!detail.value?.content) return; descDialogVisible.value = true }
const openCoverDialog = () => { if (!detail.value?.coverImageUrl) return; coverDialogVisible.value = true }

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const formatNumber = (n?: number | null) => { if (n == null) return '-'; return new Intl.NumberFormat('zh-CN').format(n) }
const toDate = (v?: string | number | Date | null): string => {
  if (!v) return '-'
  const d = new Date(v)
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
const formatTime = (v?: string | number | Date | null) => toDate(v)

const loadDetail = async () => {
  loading.value = true
  detail.value = {} // 中文注释：进入加载前清空旧数据，避免闪现
  const start = Date.now()
  try {
    const { data } = await fetchArticleReviewDetail(id)
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    detail.value = data || {}
  } catch (e) {
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    ElMessage.error('加载详情失败，请稍后重试')
    detail.value = {} // 中文注释：失败时保持为空对象
  } finally {
    loading.value = false
  }
}

const onApprove = async () => {
  try { await ElMessageBox.confirm('确认通过该文章审核？', '提示', { type: 'warning' }) } catch { return }
  btnLoading.value = true
  try {
    const { data } = await approveArticleReview(id, 1)
    ElMessage.success(data || '已通过')
    await sleep(1000) // 停顿一秒后返回列表
    router.push({ path: '/portal/admin/article-review' })
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally { btnLoading.value = false }
}

const onReject = async () => {
  try { await ElMessageBox.confirm('确认驳回该文章审核？', '提示', { type: 'warning' }) } catch { return }
  btnLoading.value = true
  try {
    const { data } = await approveArticleReview(id, 4)
    ElMessage.success(data || '已驳回')
    await sleep(1000) // 停顿一秒后返回列表
    router.push({ path: '/portal/admin/article-review' })
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally { btnLoading.value = false }
}

onMounted(loadDetail)
</script>

<style scoped>
.article-detail-page { padding: 16px; }
.back-btn { margin-bottom: 8px; }
.page-title { font-size: 18px; margin: 0 0 10px; }

/* 左右 5/5 开布局；窄屏单列 */
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: start; }
.left { display: flex; flex-direction: column; gap: 12px; }
.right { display: flex; flex-direction: column; gap: 12px; }
@media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } }

.title-text { font-size: 16px; font-weight: 600; color: #333; }

/* 摘要卡片：支持约 10 行可见，超出省略，点击弹窗展开 */
.desc-card { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; cursor: pointer; min-height: calc(1.6em * 10 + 28px); }
.desc-card .label { font-weight: 600; margin-bottom: 6px; color: #333; }
.desc-card .desc {
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: calc(1.6em * 10);
  line-height: 1.6em;
  color: #555;
}
.desc-card:hover { border-color: #dcdfe6; }

/* 信息表 */
.info-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.info-table th { text-align: left; width: 100px; color: #666; padding: 6px 8px; background: #fafafa; border: 1px solid #f0f0f0; }
.info-table td { color: #333; padding: 6px 8px; border: 1px solid #f0f0f0; }
.cover-mini { width: 70px; height: 50px; object-fit: cover; border: 1px solid #e5e7eb; border-radius: 4px; }

/* 封面 + 按钮 横向容器：左封面，右按钮纵向排列 */
.cover-action-row { display: grid; grid-template-columns: 200px 1fr; gap: 16px; align-items: center; }
@media (max-width: 480px) { .cover-action-row { grid-template-columns: 1fr; } }
.cover-preview { background: #fff; border: 1px solid #ebeef5; border-radius: 6px; padding: 12px; min-height: 90px; display:flex; align-items:center; justify-content:center; }
.cover-large { max-width: 100%; max-height: 140px; object-fit: contain; }
.cover-placeholder { color: #909399; }
.action-col { display: flex; flex-direction: column; gap: 10px; align-items: flex-end; justify-content: center; }
.btn { width: 120px; }
.btn.reject { border-color: #e6a23c; color: #e6a23c; }
.btn.approve { border-color: #67c23a; color: #67c23a; }

/* 移除按钮的悬浮高亮，与视频审核一致 */
.btn.reject, .btn.approve { transition: none; }
.btn.reject:hover, .btn.reject:focus, .btn.reject:active { background-color: transparent !important; color: #e6a23c !important; border-color: #e6a23c !important; box-shadow: none !important; }
.btn.approve:hover, .btn.approve:focus, .btn.approve:active { background-color: transparent !important; color: #67c23a !important; border-color: #67c23a !important; box-shadow: none !important; }

/* 弹窗样式 */
.cover-dialog :deep(.el-dialog__body) { padding-top: 8px; }
.cover-full { display:flex; align-items:center; justify-content:center; }
.cover-full img { max-width: 100%; height: auto; }
.desc-full { white-space: pre-wrap; line-height: 1.6; color: #333; }
.desc-full.empty { color: #909399; }
</style>
