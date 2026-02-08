<template>
  <div class="publish-container">
    <el-card class="publish-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ pageTitle }}</span>
          <el-tag type="warning">管理员编辑</el-tag>
          <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
            <span style="font-size:12px;color:var(--el-text-color-secondary)">查看模式</span>
            <el-switch v-model="isEditable" active-text="开启修改" inactive-text="只读" />
          </div>
        </div>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" size="large" label-position="top">
        <el-form-item label="视频标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入视频标题" maxlength="100" show-word-limit clearable :disabled="!isEditable" />
        </el-form-item>

        <el-form-item label="视频分类" prop="category">
          <el-select v-model="categoryTags" placeholder="选择分类" filterable multiple default-first-option style="width: 100%" :disabled="!isEditable">
            <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <div class="media-upload-grid">
          <div class="media-col">
            <div class="section-label">视频封面</div>
            <div class="upload-wrapper cover-wrapper">
              <el-upload v-if="!form.coverImageUrl" class="integrated-uploader" :show-file-list="false" :http-request="uploadCover" accept="image/*" drag :disabled="!isEditable">
                <el-icon class="el-icon--upload"><Picture /></el-icon>
                <div class="el-upload__text">拖拽或 <em>点击上传封面</em></div>
              </el-upload>
              <div v-else class="preview-container cover-preview">
                <el-upload
                  v-if="isEditable"
                  class="cover-replace-uploader"
                  :show-file-list="false"
                  :http-request="uploadCover"
                  accept="image/*"
                >
                  <el-image :src="form.coverImageUrl" fit="cover" class="preview-content" :preview-src-list="[]" />
                  <div class="cover-replace-mask">
                    <el-icon><Picture /></el-icon>
                    <span>点击更换封面</span>
                  </div>
                </el-upload>
                <el-image v-else :src="form.coverImageUrl" fit="cover" class="preview-content" :preview-src-list="[form.coverImageUrl]" />
              </div>
            </div>
          </div>

          <div class="media-col">
            <div class="section-label">
              <span class="required-star">*</span> 上传视频
              <span class="duration-info" v-if="form.duration">时长: {{ form.duration }}s</span>
            </div>
            <div class="upload-wrapper video-wrapper">
              <el-upload v-if="!form.videoUrl" class="integrated-uploader" :show-file-list="false" :http-request="uploadVideo" accept="video/*" drag :disabled="!isEditable">
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">拖拽或 <em>点击上传视频</em></div>
              </el-upload>

              <div v-else class="preview-container video-preview-box">
                <video :src="form.videoUrl" controls class="preview-content"></video>
                <div class="preview-actions-bar">
                  <div class="duration-edit">
                    <span>时长(秒):</span>
                    <el-input-number v-model="form.duration" size="small" :min="0" style="width: 100px;" :disabled="!isEditable" />
                  </div>
                  <el-upload v-if="isEditable" :show-file-list="false" :http-request="uploadVideo" accept="video/*">
                    <el-button type="primary" size="small" link>更换视频</el-button>
                  </el-upload>
                </div>
              </div>
            </div>
            <el-form-item prop="videoUrl" style="margin-bottom: 0; height: 0; overflow: hidden;">
              <el-input v-model="form.videoUrl" />
            </el-form-item>
          </div>
        </div>

        <el-form-item label="视频简介" prop="description" style="margin-top: 24px;">
          <el-input v-model="form.description" type="textarea" :rows="5" placeholder="请输入视频内容简介..." maxlength="500" show-word-limit :disabled="!isEditable" />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button v-if="isEditable" type="primary" @click="submitForm(form.status ?? 0)" :loading="loading" size="large">
              <el-icon class="el-icon--left"><Document /></el-icon>保存修改
            </el-button>
            <el-button v-if="isEditable" @click="submitForm(1)" :loading="loading" size="large">
              <el-icon class="el-icon--left"><Promotion /></el-icon>保存并发布
            </el-button>
            <el-button @click="router.back()" size="large">
              <el-icon class="el-icon--left"><Back /></el-icon>返回
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Picture, Promotion, Document, UploadFilled, Back } from '@element-plus/icons-vue'
import request from '@/api/http'
import type { UploadRequestOptions } from 'element-plus'
import { updateVideo, fetchVideoReviewDetail, fetchVideoCategoriesSimpleList, fetchVideoRelatedCategories } from '@/api/modules/video'
import type { HealthVideoCreateDTO, CategorySimpleVO } from '@/api/types/videoTypes'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isEditable = ref(true)
const formRef = ref<FormInstance>()
const loading = ref(false)
const categoryTags = ref<(number | string)[]>([])
const pageTitle = ref('管理员编辑视频')
const videoId = ref<string | number>('')

const categories = ref<CategorySimpleVO[]>([])

const form = reactive<HealthVideoCreateDTO>({
  title: '',
  description: '',
  coverImageUrl: '',
  videoUrl: '',
  duration: 0,
  authorId: 0,
  category: '',
  isTop: 0,
  status: 0
})

const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入视频标题', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ],
  videoUrl: [
    { required: true, message: '请上传视频文件', trigger: 'change' }
  ]
})

onMounted(async () => {
  await loadCategories()
  const { id } = route.query
  if (id) {
    videoId.value = id as string
    await loadData(videoId.value as string)
  }
  // 只读查看模式：当由“查看”进入时不允许直接修改，需手动开启
  isEditable.value = String(route.query.mode || '').toLowerCase() !== 'view'
})

const loadCategories = async () => {
  try {
    const res = await fetchVideoCategoriesSimpleList()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

const loadData = async (id: string) => {
  try {
    const res = await fetchVideoReviewDetail(id)
    if (res.data) {
      const data = res.data as any
      Object.assign(form, {
        title: data.title,
        description: data.description,
        coverImageUrl: data.coverImageUrl,
        videoUrl: data.videoUrl,
        duration: data.duration,
        authorId: Number(data.authorId ?? 0),
        isTop: data.isTop ?? 0,
        status: data.status ?? 0,
        category: data.category ?? ''
      })
      try {
        const catRes = await fetchVideoRelatedCategories(id)
        if (catRes.code === 200 && Array.isArray(catRes.data) && catRes.data.length > 0) {
          const list = catRes.data as any[]
          categoryTags.value = list.map(item => typeof item === 'object' ? item.id : item)
        } else if (form.category) {
          try {
            const parsed = JSON.parse(form.category)
            categoryTags.value = Array.isArray(parsed) ? parsed : []
          } catch {
            categoryTags.value = []
          }
        }
      } catch (e) {
        console.warn('获取视频分类关联失败', e)
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取视频详情失败')
  }
}

const uploadFileToServer = async (file: File, type: 'image' | 'video') => {
  const fd = new FormData()
  fd.append('file', file)
  const url = type === 'image' ? '/files/upload-image' : '/files/upload-video'
  const resp = await request.post(url, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return (resp as any)?.data?.url ?? (resp as any)?.data
}

const submitForm = async (status: number) => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      if (categoryTags.value && categoryTags.value.length > 0) {
        form.category = JSON.stringify(categoryTags.value)
      } else {
        form.category = ''
      }
      form.status = status
      const updateData = { ...form, id: String(videoId.value) }
      await updateVideo(updateData as any)
      ElMessage.success('视频修改成功！')
      router.push('/portal/admin/video-list')
    } catch (error) {
      console.error(error)
      ElMessage.error('操作失败，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

/**
 * 封面上传回调
 * @param opt 上传请求参数
 */
const uploadCover = (opt: UploadRequestOptions) => {
  const file = opt.file as File
  const blobUrl = URL.createObjectURL(file)
  form.coverImageUrl = blobUrl
  uploadFileToServer(file, 'image').then(url => {
    form.coverImageUrl = url
    opt.onSuccess && opt.onSuccess({} as any)
  }).catch(() => {
    const err = Object.assign(new Error('上传失败'), {
      status: 0,
      method: 'POST',
      url: '/files/upload-image'
    }) as any
    opt.onError && opt.onError(err)
  })
}

/**
 * 视频上传回调
 * @param opt 上传请求参数
 */
const uploadVideo = (opt: UploadRequestOptions) => {
  const file = opt.file as File
  const blobUrl = URL.createObjectURL(file)
  form.videoUrl = blobUrl
  uploadFileToServer(file, 'video').then(url => {
    form.videoUrl = url
    opt.onSuccess && opt.onSuccess({} as any)
  }).catch(() => {
    const err = Object.assign(new Error('上传失败'), {
      status: 0,
      method: 'POST',
      url: '/files/upload-video'
    }) as any
    opt.onError && opt.onError(err)
  })
}
</script>

<style scoped>
.publish-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.publish-card { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.header-title { font-size: 18px; font-weight: 600; color: var(--el-text-color-primary); }
.media-upload-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 24px; margin-bottom: 20px; }
.media-col { display: flex; flex-direction: column; gap: 12px; }
.section-label { font-size: 14px; font-weight: 500; color: var(--el-text-color-primary); display: flex; align-items: center; gap: 8px; }
.required-star { color: var(--el-color-danger); }
.duration-info { font-size: 12px; color: var(--el-text-color-secondary); font-weight: normal; }
.upload-wrapper { width: 100%; border-radius: 8px; overflow: hidden; background: var(--el-fill-color-lighter); min-height: 220px; display: flex; flex-direction: column; }
.integrated-uploader { width: 100%; height: 100%; display: flex; flex-direction: column; flex: 1; }
.integrated-uploader :deep(.el-upload) { width: 100%; height: 100%; min-height: 220px; }
.integrated-uploader :deep(.el-upload-dragger) { width: 100%; height: 100%; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed var(--el-border-color); background-color: transparent; }
.preview-container { position: relative; width: 100%; height: 100%; min-height: 220px; background: #000; display: flex; flex-direction: column; }
.preview-content { width: 100%; flex: 1; object-fit: contain; max-height: 360px; }
.cover-preview .preview-content { object-fit: cover; height: 220px; }
.cover-replace-uploader { width: 100%; height: 100%; }
.cover-replace-uploader :deep(.el-upload) { width: 100%; height: 100%; }
.cover-replace-mask { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: 8px; color: #fff; font-size: 14px; background: rgba(0,0,0,0.28); opacity: 0; transition: opacity 0.18s ease; cursor: pointer; }
.cover-replace-uploader:hover .cover-replace-mask { opacity: 1; }
.preview-actions { position: absolute; bottom: 12px; right: 12px; }
.preview-actions-bar { background: #fff; padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--el-border-color-light); }
.duration-edit { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--el-text-color-regular); }
.form-actions { display: flex; gap: 16px; margin-top: 20px; }
@media (max-width: 768px) { .media-upload-grid { grid-template-columns: 1fr; } }
</style>
