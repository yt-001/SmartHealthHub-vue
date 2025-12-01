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
        <el-form-item label="文章标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" maxlength="100" show-word-limit clearable :disabled="!isEditable" />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="所属科室" prop="deptId">
              <el-select v-model="form.deptId" placeholder="请选择关联科室" style="width: 100%" :disabled="!isEditable">
                <el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="文章分类" prop="category">
              <el-select v-model="categoryTags" placeholder="选择分类" filterable multiple default-first-option style="width: 100%" :disabled="!isEditable">
                <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="封面图片" prop="coverImageUrl">
          <div class="upload-wrapper cover-wrapper">
            <el-upload v-if="!form.coverImageUrl" class="integrated-uploader" :show-file-list="false" :http-request="uploadCover" accept="image/*" drag :disabled="!isEditable">
              <el-icon class="el-icon--upload"><Picture /></el-icon>
              <div class="el-upload__text">拖拽或 <em>点击上传封面</em></div>
            </el-upload>
            <div v-else class="preview-container cover-preview">
              <el-image :src="form.coverImageUrl" fit="cover" class="preview-content" :preview-src-list="[form.coverImageUrl]" />
              <div class="preview-actions">
                <el-upload v-if="isEditable" :show-file-list="false" :http-request="uploadCover" accept="image/*">
                  <el-button type="primary" size="small">更换封面</el-button>
                </el-upload>
              </div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="文章摘要" prop="summary">
          <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="简要描述文章核心内容..." maxlength="500" show-word-limit :disabled="!isEditable" />
        </el-form-item>

        <el-form-item label="正文内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="15" placeholder="在此输入文章正文..." class="content-editor" :disabled="!isEditable" />
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
import { Picture, Promotion, Document, Back } from '@element-plus/icons-vue'
import request from '@/api/http'
import type { UploadRequestOptions } from 'element-plus'
import { updateArticle, fetchArticleReviewDetail, fetchArticleCategoriesSimpleList, fetchArticleRelatedCategories } from '@/api/modules/article'
import type { HealthArticleCreateDTO, CategorySimpleVO } from '@/api/types/articleTypes'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const isEditable = ref(true)
const formRef = ref<FormInstance>()
const loading = ref(false)
const categoryTags = ref<(number | string)[]>([])
const pageTitle = ref('管理员编辑文章')
const articleId = ref<string | number>('')

// 模拟科室数据（与医生端一致）
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

const categories = ref<CategorySimpleVO[]>([])

const form = reactive<HealthArticleCreateDTO>({
  title: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  authorId: 0,
  deptId: undefined,
  category: '',
  isTop: 0,
  status: 0,
  authorName: ''
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
  ]
})

onMounted(async () => {
  await loadCategories()
  const { id } = route.query
  if (id) {
    articleId.value = id as string
    await loadData(articleId.value as string)
  }
  // 只读查看模式：当由“查看”进入时不允许直接修改，需手动开启
  isEditable.value = String(route.query.mode || '').toLowerCase() !== 'view'
})

const loadCategories = async () => {
  try {
    const res = await fetchArticleCategoriesSimpleList()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

const loadData = async (id: string) => {
  try {
    const res = await fetchArticleReviewDetail(id)
    if (res.data) {
      const data = res.data as any
      Object.assign(form, {
        title: data.title,
        summary: data.summary,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        authorId: Number(data.authorId ?? 0),
        deptId: Number(data.deptId ?? 0),
        category: data.category ?? '',
        isTop: data.isTop ?? 0,
        status: data.status ?? 0,
        authorName: data.authorName ?? ''
      })
      // 关联分类优先
      try {
        const catRes = await fetchArticleRelatedCategories(id)
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
        console.warn('获取文章分类关联失败', e)
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取文章详情失败')
  }
}

const uploadFileToServer = async (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  const resp = await request.post('/files/upload-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
  return (resp as any)?.data?.url ?? (resp as any)?.data
}

const submitForm = async (status: number) => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // 分类转字符串
      form.status = status
      if (categoryTags.value && categoryTags.value.length > 0) {
        form.category = JSON.stringify(categoryTags.value)
      } else {
        form.category = ''
      }

      const updateData = { ...form, id: Number(articleId.value) }
      await updateArticle(updateData as any)
      ElMessage.success('文章修改成功！')
      router.push('/portal/admin/article-list')
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
const uploadCover = (opt: any) => {
  const file = opt.file as File
  const blobUrl = URL.createObjectURL(file)
  form.coverImageUrl = blobUrl
  uploadFileToServer(file).then(url => {
    form.coverImageUrl = url
    opt.onSuccess && opt.onSuccess({} as any)
  }).catch(() => opt.onError && opt.onError(new Error('上传失败')))
}
</script>

<style scoped>
.publish-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
.publish-card { border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.header-title { font-size: 18px; font-weight: 600; color: var(--el-text-color-primary); }
.upload-wrapper { width: 100%; border-radius: 8px; overflow: hidden; background: var(--el-fill-color-lighter); min-height: 220px; display: flex; flex-direction: column; }
.integrated-uploader { width: 100%; height: 100%; display: flex; flex-direction: column; flex: 1; }
.integrated-uploader :deep(.el-upload) { width: 100%; height: 100%; min-height: 220px; }
.integrated-uploader :deep(.el-upload-dragger) { width: 100%; height: 100%; min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed var(--el-border-color); background-color: transparent; }
.preview-container { position: relative; width: 100%; height: 100%; min-height: 220px; background: #000; display: flex; flex-direction: column; }
.preview-content { width: 100%; flex: 1; object-fit: cover; height: 220px; }
.preview-actions { position: absolute; bottom: 12px; right: 12px; }
.form-actions { display: flex; gap: 16px; margin-top: 20px; }
</style>
