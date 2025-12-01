<template>
  <div class="publish-container">
    <el-card class="publish-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="header-title">{{ pageTitle }}</span>
          <el-tag type="info">医生专栏</el-tag>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px" size="large" label-position="top">
        <!-- 标题 -->
        <el-form-item label="文章标题" prop="title">
          <el-input 
            v-model="form.title" 
            :disabled="isView"
            placeholder="请输入文章标题（吸引人的标题能获得更多阅读）" 
            maxlength="100" 
            show-word-limit 
            clearable
          />
        </el-form-item>

        <!-- 科室与分类 -->
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="所属科室" prop="deptId">
              <el-select v-model="form.deptId" placeholder="请选择关联科室" style="width: 100%" :disabled="isView">
                <el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文章分类" prop="category">
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
          </el-col>
        </el-row>

        <!-- 封面图片 -->
        <el-form-item label="封面图片" prop="coverImageUrl">
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
        </el-form-item>

        <!-- 摘要 -->
        <el-form-item label="文章摘要" prop="summary">
          <el-input 
            v-model="form.summary" 
            :disabled="isView"
            type="textarea" 
            :rows="3" 
            placeholder="简要描述文章核心内容，将显示在列表页..." 
            maxlength="500" 
            show-word-limit 
          />
        </el-form-item>

        <!-- 正文内容 -->
        <el-form-item label="正文内容" prop="content">
          <el-input 
            v-model="form.content" 
            :disabled="isView"
            type="textarea" 
            :rows="15" 
            placeholder="在此输入文章正文..." 
            class="content-editor"
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
import { Picture, Promotion, Document, Back, Edit } from '@element-plus/icons-vue'
import request from '@/api/http'
import type { UploadRequestOptions } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { createArticle, fetchArticleReviewDetail, updateArticle } from '@/api/modules/article'
import type { HealthArticleCreateDTO } from '@/api/types/articleTypes'
import { useRouter, useRoute, onBeforeRouteLeave } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const categoryTags = ref<string[]>([])

// 页面模式：create=发布, edit=编辑, view=查看
const mode = ref('create')
const articleId = ref<string | number>('')
const isView = computed(() => mode.value === 'view')
const pageTitle = computed(() => {
  if (mode.value === 'view') return '文章详情'
  if (mode.value === 'edit') return '编辑文章'
  return '发布文章'
})

// 本地文件引用，用于最后提交时上传
const coverFile = ref<File | null>(null)
const isSubmitting = ref(false)

// 模拟数据
const departments = [
  { id: 1, name: '内科' },
  { id: 2, name: '外科' },
  { id: 3, name: '妇产科' },
  { id: 4, name: '儿科' },
  { id: 5, name: '中医科' },
  { id: 6, name: '眼科' },
  { id: 7, name: '口腔科' },
  { id: 8, name: '皮肤科' },
]

const categories = ['健康科普', '疾病预防', '康复指导', '用药指南', '医院动态', '名医讲堂']

const form = reactive<HealthArticleCreateDTO>({
  title: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  authorId: userStore.userInfo?.id || 0,
  deptId: undefined,
  category: '',
  isTop: 0,
  status: 0
})

const rules = reactive<FormRules>({
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { max: 100, message: '长度不能超过100个字符', trigger: 'blur' }
  ],
  summary: [
    { max: 500, message: '摘要长度不能超过500个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  coverImageUrl: [
    { max: 255, message: '封面URL长度不能超过255个字符', trigger: 'blur' }
  ],
  authorId: [
    { required: true, message: '作者信息缺失，请重新登录', trigger: 'change' }
  ]
})

onMounted(() => {
  const { id, mode: m } = route.query
  if (id) {
    articleId.value = id as string
    mode.value = (m as string) || 'edit'
    loadData(id as string)
  }
})

const loadData = async (id: string) => {
  try {
    const res = await fetchArticleReviewDetail(id)
    if (res.data) {
      Object.assign(form, res.data)
      if (form.category) {
        categoryTags.value = form.category.split(',')
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取文章详情失败')
  }
}

// 实际上传文件到服务器的函数
const uploadFileToServer = async (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  const resp = await request.post('/files/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
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
           const realCoverUrl = await uploadFileToServer(coverFile.value)
           form.coverImageUrl = realCoverUrl
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
        if (mode.value === 'edit' && articleId.value) {
           const updateData = { ...form, id: articleId.value }
           await updateArticle(updateData)
           ElMessage.success('文章修改成功！')
        } else {
           await createArticle(form)
           ElMessage.success(status === 1 ? '文章发布成功！需等待管理员审核' : '文章已保存为草稿')
        }
        
        // 4. 标记为正在提交
        isSubmitting.value = true
        router.push('/portal/doctor/my-articles')
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
  opt.onSuccess && opt.onSuccess({} as any)
}

// 路由守卫：未保存离开时提示
onBeforeRouteLeave((to, from, next) => {
  if (isSubmitting.value) {
    next()
    return
  }

  const hasContent = form.title || form.summary || form.content || form.coverImageUrl || (categoryTags.value.length > 0)
  
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
        next()
      })
      .catch(() => {
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

.form-actions {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
}
</style>