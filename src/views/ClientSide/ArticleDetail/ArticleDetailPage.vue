<template>
  <div class="article-detail-page">
    <!-- 背景装饰已移至 Layout -->

    <div class="page-content" v-loading="loading" element-loading-text="加载中...">
      <el-row :gutter="40">
        <!-- Left Column: Article Content, Info -->
        <el-col :span="16" :xs="24">
          <div class="content-card glass-card">
            <!-- Article Header -->
            <div class="article-header">
              <h1 class="title">{{ article.title || '-' }}</h1>
              <div class="meta-row">
                <span class="author-name">{{ article.authorName || '-' }}</span>
                <span class="sep">·</span>
                <span class="date">{{ article.publishDate || '-' }}</span>
                <span class="sep">·</span>
                <span class="views">{{ article.views || '0' }} 阅读</span>
              </div>
            </div>

            <!-- Article Content -->
            <div class="article-content" v-html="article.content || ''"></div>
            
            <!-- Like/Share Section -->
            <div class="action-section">
                <LikeSection @share="showShare = true" />
            </div>
          </div>
        </el-col>
        
        <!-- Right Column: Author card & Comments -->
        <el-col :span="8" :xs="24" class="right-col">
          <div class="author-wrapper glass-card">
            <AuthorCard v-bind="author" class="transparent-bg" />
          </div>
          
          <!-- Comments Section -->
          <div class="comments-container glass-card">
            <CommentSection />
          </div>
        </el-col>
      </el-row>
    </div>

    <ShareModal v-model="showShare" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import CommentSection from '../VideoDetail/components/CommentSection.vue'
import LikeSection from '../VideoDetail/components/LikeSection.vue'
import ShareModal from '../VideoDetail/components/ShareModal.vue'
import AuthorCard from '../VideoDetail/components/AuthorCard.vue'
import { fetchArticleReviewDetail } from '@/api/modules/article'
import { getDoctorProfileId } from '@/api/modules/doctor'
import type { HealthArticleVO } from '@/api/types/articleTypes'
import type { DoctorProfilesVO } from '@/api/types/doctorTypes'

/**
 * 健康文章详情页
 * @description 展示文章内容、作者信息及评论区
 */

const route = useRoute()
const showShare = ref(false)
const loading = ref(false)
const detail = ref<HealthArticleVO | null>(null)
const doctorProfile = ref<DoctorProfilesVO | null>(null)

/** 从路由读取文章ID */
const articleId = computed(() => String(route.params.id || ''))

/**
 * 格式化日期
 * @param v 后端返回的日期字符串/时间值
 */
function formatDate(v?: string | number | Date | null): string {
  if (!v) return ''
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * 格式化阅读数
 * @param n 阅读次数
 */
function formatViews(n?: number | string | null): string {
  if (n == null) return '0'
  const num = typeof n === 'string' ? Number(n) : n
  if (!Number.isFinite(num)) return '0'
  return new Intl.NumberFormat('zh-CN').format(num)
}

/**
 * 归一化图片URL，避免中文/空格/反斜杠/相对路径导致资源加载失败
 * @param url 原始图片地址
 */
function normalizeImageUrl(url?: string | null): string {
  if (!url) return ''
  const raw = String(url).trim()
  if (!raw) return ''
  const fixedSlash = raw.replace(/\\/g, '/')
  if (fixedSlash.startsWith('data:') || fixedSlash.startsWith('blob:')) return fixedSlash
  const normalizedPath =
    fixedSlash.startsWith('/') || fixedSlash.startsWith('http://') || fixedSlash.startsWith('https://')
      ? fixedSlash
      : `/${fixedSlash}`
  try {
    return encodeURI(normalizedPath)
  } catch {
    return normalizedPath
  }
}


/** 页面展示所需字段（由后端详情映射） */
const article = computed(() => {
  const d = detail.value
  return {
    title: d?.title ?? '',
    authorName: d?.authorName ?? '',
    publishDate: formatDate(d?.createdAt),
    views: formatViews(d?.viewCount),
    coverImageUrl: d?.coverImageUrl ?? '',
    content: d?.content ?? ''
  }
})

/**
 * 组装作者卡片数据（复用视频详情页的 AuthorCard 结构）
 * @param article 文章详情
 * @param profile 医生档案信息（可选）
 */
function buildAuthor(article: HealthArticleVO | null, profile: DoctorProfilesVO | null) {
  const deptName = article?.deptName ? String(article.deptName) : ''
  const specialtyText = profile?.specialty ? String(profile.specialty) : ''
  const avatarRaw =
    (profile as any)?.avatarUrl ||
    (profile as any)?.avatar ||
    (profile as any)?.headUrl ||
    (profile as any)?.photoUrl ||
    (article as any)?.authorAvatarUrl ||
    (article as any)?.avatarUrl ||
    ''
  const tags = specialtyText
    ? specialtyText
        .split(/[,，]/g)
        .map(t => t.trim())
        .filter(Boolean)
    : []
  return {
    name: profile?.realName || article?.authorName || '作者',
    avatar: normalizeImageUrl(avatarRaw),
    title: profile?.title || '医生',
    organization: deptName ? `${deptName} · 社区卫生服务中心` : '社区卫生服务中心',
    followers: '-',
    videos: '-',
    articles: '-',
    showStats: false,
    signature: profile?.bio || '',
    tags: tags.length ? tags : deptName ? [deptName] : []
  }
}

const author = ref(buildAuthor(null, null))

/**
 * 加载文章详情（用户端/公开详情）
 * @param id 文章ID
 */
async function loadArticleDetail(id: string) {
  if (!id) return
  loading.value = true
  try {
    const { data } = await fetchArticleReviewDetail(id)
    detail.value = (data || null) as any
    doctorProfile.value = null
    if (detail.value?.authorId) {
      try {
        const uid = Number(detail.value.authorId)
        if (Number.isFinite(uid) && uid > 0) {
          const { data: profile } = await getDoctorProfileId(uid)
          doctorProfile.value = (profile || null) as any
        }
      } catch {
        doctorProfile.value = null
      }
    }
    author.value = buildAuthor(detail.value, doctorProfile.value)
  } catch (e: any) {
    detail.value = null
    doctorProfile.value = null
    author.value = buildAuthor(null, null)
    ElMessage.error(e?.message || '加载文章详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => loadArticleDetail(articleId.value))
watch(articleId, (id) => loadArticleDetail(id))
</script>

<style scoped>
.article-detail-page {
  position: relative;
  min-height: 100vh;
  background-color: transparent;
  overflow: hidden;
}

.page-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 通用毛玻璃卡片效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
}

.content-card {
  padding: 40px;
}

.author-wrapper {
  overflow: hidden; /* 确保内部圆角不溢出 */
}

/* 强制覆盖 AuthorCard 内部样式使其透明 */
:deep(.author-card) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.comments-container {
  margin-top: 24px;
  padding: 24px;
}

.article-header {
  margin-bottom: 32px;
}

.cover-wrap {
  margin-bottom: 28px;
}

.cover-img {
  width: 100%;
  height: 240px;
  border-radius: 12px;
}

.cover-error {
  height: 240px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  line-height: 1.4;
}

.meta-row {
  display: flex;
  align-items: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.sep {
  margin: 0 8px;
  opacity: 0.4;
}

.article-content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  margin-bottom: 40px;
}

/* Style for HTML content */
:deep(.article-content h3) {
  font-size: 24px;
  font-weight: 600;
  margin: 32px 0 16px;
  color: var(--el-text-color-primary);
}

:deep(.article-content p) {
  margin-bottom: 24px;
}

.action-section {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .right-col {
    margin-top: 24px;
  }
  
  .content-card {
    padding: 24px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .article-content {
    font-size: 16px;
  }
}
</style>
