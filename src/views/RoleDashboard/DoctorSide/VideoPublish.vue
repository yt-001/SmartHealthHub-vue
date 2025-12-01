<template>
  <div class="publish-container">
    <el-card class="publish-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ pageTitle }}</span>
          <el-tag type="success">健康讲堂</el-tag>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" size="large" label-position="top">
        <!-- 标题 -->
        <el-form-item label="视频标题" prop="title">
          <el-input 
            v-model="form.title" 
            :disabled="isView"
            placeholder="请输入视频标题" 
            maxlength="100" 
            show-word-limit 
            clearable
          />
        </el-form-item>

        <!-- 视频分类 -->
        <el-form-item label="视频分类" prop="category">
          <el-select 
            v-model="categoryTags" 
            :disabled="isView"
            placeholder="选择或输入新分类" 
            allow-create 
            filterable 
            multiple
            default-first-option 
            style="width: 100%"
          >
             <el-option v-for="item in categories" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <!-- 媒体上传区域 (两栏布局) -->
        <div class="media-upload-grid">
          <!-- 左侧：封面上传 -->
          <div class="media-col">
            <div class="section-label">
              视频封面
            </div>
            <div class="upload-wrapper cover-wrapper">
              <el-upload
                v-if="!form.coverImageUrl"
                class="integrated-uploader"
                :show-file-list="false"
                :http-request="uploadCover"
                accept="image/*"
                drag
                :disabled="isView"
              >
                <el-icon class="el-icon--upload"><Picture /></el-icon>
                <div class="el-upload__text">
                  拖拽或 <em>点击上传封面</em>
                </div>
              </el-upload>
              
              <div v-else class="preview-container cover-preview">
                <el-image :src="form.coverImageUrl" fit="cover" class="preview-content" :preview-src-list="[form.coverImageUrl]" />
                <div class="preview-actions" v-if="!isView">
                   <el-upload :show-file-list="false" :http-request="uploadCover" accept="image/*">
                      <el-button type="primary" size="small">更换封面</el-button>
                   </el-upload>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：视频上传 -->
          <div class="media-col">
            <div class="section-label">
              <span class="required-star">*</span> 上传视频
              <span class="duration-info" v-if="form.duration">时长: {{ form.duration }}s</span>
            </div>
            <div class="upload-wrapper video-wrapper">
              <el-upload
                v-if="!form.videoUrl"
                class="integrated-uploader"
                :show-file-list="false"
                :http-request="uploadVideo"
                accept="video/*"
                drag
                :disabled="isView"
              >
                <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                <div class="el-upload__text">
                  拖拽或 <em>点击上传视频</em>
                </div>
                <template #tip>
                  <div class="el-upload__tip">支持 MP4, WebM 等常见视频格式</div>
                </template>
              </el-upload>

              <div v-else class="preview-container video-preview-box">
                <video :src="form.videoUrl" controls class="preview-content"></video>
                <div class="preview-actions-bar">
                  <div class="duration-edit">
                     <span>时长(秒):</span>
                     <el-input-number v-model="form.duration" size="small" :min="0" style="width: 100px;" :disabled="isView" />
                  </div>
                  <el-upload :show-file-list="false" :http-request="uploadVideo" accept="video/*" v-if="!isView">
                     <el-button type="primary" size="small" link>更换视频</el-button>
                  </el-upload>
                </div>
              </div>
            </div>
            <!-- 隐藏的校验字段绑定 -->
            <el-form-item prop="videoUrl" style="margin-bottom: 0; height: 0; overflow: hidden;">
               <el-input v-model="form.videoUrl" />
            </el-form-item>
          </div>
        </div>

        <!-- 简介 -->
        <el-form-item label="视频简介" prop="description" style="margin-top: 24px;">
          <el-input 
            v-model="form.description" 
            :disabled="isView"
            type="textarea" 
            :rows="5" 
            placeholder="请输入视频内容简介..." 
            maxlength="500" 
            show-word-limit 
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <div class="form-actions">
            <!-- 查看模式 -->
            <template v-if="mode === 'view'">
               <el-button @click="router.back()" size="large">
                 <el-icon class="el-icon--left"><Back /></el-icon>退出
               </el-button>
               <el-button type="primary" @click="mode = 'edit'" size="large">
                 <el-icon class="el-icon--left"><Edit /></el-icon>开始编辑
               </el-button>
            </template>

            <!-- 编辑模式 -->
            <template v-else-if="mode === 'edit'">
               <el-button type="primary" @click="submitForm(1)" :loading="loading" size="large">
                  <el-icon class="el-icon--left"><Promotion /></el-icon>立即发布
               </el-button>
               <el-button @click="submitForm(form.status ?? 0)" :loading="loading" size="large">
                  <el-icon class="el-icon--left"><Document /></el-icon>保存修改
               </el-button>
            </template>

            <!-- 创建模式 -->
            <template v-else>
               <el-button type="primary" @click="submitForm(1)" :loading="loading" size="large">
                  <el-icon class="el-icon--left"><Promotion /></el-icon>立即发布
               </el-button>
               <el-button @click="submitForm(0)" size="large">
                  <el-icon class="el-icon--left"><Document /></el-icon>存为草稿
               </el-button>
            </template>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Picture, Promotion, Document, VideoCamera, UploadFilled, Back, Edit } from '@element-plus/icons-vue'
import request from '@/api/http'
import type { UploadRequestOptions } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createVideo, fetchVideoReviewDetail, updateVideo } from '@/api/modules/video'
import type { HealthVideoCreateDTO } from '@/api/types/videoTypes'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const videoFileName = ref<string>('')
const categoryTags = ref<string[]>([])

// 页面模式：create=发布, edit=编辑, view=查看
const mode = ref('create')
const videoId = ref<string | number>('')
const isView = computed(() => mode.value === 'view')
const pageTitle = computed(() => {
  if (mode.value === 'view') return '视频详情'
  if (mode.value === 'edit') return '编辑视频'
  return '发布视频'
})

// 本地文件引用，用于最后提交时上传
const coverFile = ref<File | null>(null)
const videoFile = ref<File | null>(null)
const isSubmitting = ref(false)

// 模拟数据
const categories = ['科普讲座', '急救演示', '手术记录', '健康访谈']

const form = reactive<HealthVideoCreateDTO>({
  title: '',
  description: '',
  coverImageUrl: '',
  videoUrl: '',
  duration: 0,
  authorId: userStore.userInfo?.id || 0,
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
  ],
  authorId: [
    { required: true, message: '作者信息缺失，请重新登录', trigger: 'change' }
  ]
})

onMounted(() => {
  const { id, mode: m } = route.query
  if (id) {
    videoId.value = id as string
    mode.value = (m as string) || 'edit'
    loadData(id as string)
  }
})

const loadData = async (id: string) => {
  try {
    const res = await fetchVideoReviewDetail(id)
    if (res.data) {
      Object.assign(form, res.data)
      if (form.category) {
        categoryTags.value = form.category.split(',')
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取视频详情失败')
  }
}

// 实际上传文件到服务器的函数
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
    if (valid) {
      loading.value = true
      try {
        // 1. 如果有本地选择的文件，先执行上传
        if (coverFile.value) {
           const realCoverUrl = await uploadFileToServer(coverFile.value, 'image')
           form.coverImageUrl = realCoverUrl
        }
        if (videoFile.value) {
           const realVideoUrl = await uploadFileToServer(videoFile.value, 'video')
           form.videoUrl = realVideoUrl
        }

        // 2. 完善表单数据
        if (!form.authorId) {
            form.authorId = userStore.userInfo?.id || 0
        }

        // 转换分类标签为字符串
        if (categoryTags.value && categoryTags.value.length > 0) {
           form.category = categoryTags.value.join(',')
        }

        form.status = status
        
        // 3. 提交业务数据
        if (mode.value === 'edit' && videoId.value) {
           const updateData = { ...form, id: videoId.value }
           await updateVideo(updateData)
           ElMessage.success('视频修改成功！')
        } else {
           await createVideo(form)
           ElMessage.success(status === 1 ? '视频发布成功！需等待管理员审核' : '视频已保存为草稿')
        }
        
        // 4. 标记为正在提交，允许路由跳转
        isSubmitting.value = true
        router.push('/portal/doctor/my-videos') 
      } catch (error) {
        console.error(error)
        ElMessage.error('操作失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}

// 仅做本地预览，不立即上传
const uploadCover = (opt: UploadRequestOptions) => {
  const file = opt.file as File
  coverFile.value = file
  // 创建本地预览地址
  const blobUrl = URL.createObjectURL(file)
  form.coverImageUrl = blobUrl
  // 模拟上传成功，让 el-upload 显示成功状态
  opt.onSuccess && opt.onSuccess({} as any)
}

// 仅做本地预览，不立即上传
const uploadVideo = (opt: UploadRequestOptions) => {
  const file = opt.file as File
  videoFile.value = file
  videoFileName.value = file.name
  // 创建本地预览地址
  const blobUrl = URL.createObjectURL(file)
  form.videoUrl = blobUrl
  opt.onSuccess && opt.onSuccess({} as any)
}

// 路由守卫：未保存离开时提示
onBeforeRouteLeave((to, from, next) => {
  if (isSubmitting.value) {
    next()
    return
  }

  // 检查是否有内容填写
  const hasContent = form.title || form.description || form.videoUrl || form.coverImageUrl || (categoryTags.value.length > 0)
  
  if (hasContent) {
    ElMessageBox.confirm(
      '当前页面有未保存的内容，是否确认离开？离开后内容将丢失。',
      '温馨提示',
      {
        confirmButtonText: '确定离开',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true
      }
    )
      .then(() => {
        // 确认离开
        next()
      })
      .catch(() => {
        // 取消离开（停留在当前页）
        next(false)
      })
  } else {
    next()
  }
})
</script>

<style scoped>
.publish-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.publish-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.media-upload-grid {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
  margin-bottom: 20px;
}

.media-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.required-star {
  color: var(--el-color-danger);
}

.duration-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: normal;
}

.upload-wrapper {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.integrated-uploader {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.integrated-uploader :deep(.el-upload) {
  width: 100%;
  height: 100%;
  min-height: 220px;
}

.integrated-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--el-border-color);
  background-color: transparent;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 220px;
  background: #000;
  display: flex;
  flex-direction: column;
}

.preview-content {
  width: 100%;
  flex: 1;
  object-fit: contain;
  max-height: 360px;
}

.cover-preview .preview-content {
  object-fit: cover;
  height: 220px;
}

.preview-actions {
  position: absolute;
  bottom: 12px;
  right: 12px;
}

.preview-actions-bar {
  background: #fff;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--el-border-color-light);
}

.duration-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .media-upload-grid {
    grid-template-columns: 1fr;
  }
}
</style>