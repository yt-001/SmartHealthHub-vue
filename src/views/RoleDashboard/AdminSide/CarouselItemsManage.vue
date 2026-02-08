<template>
  <!-- 管理端：首页图片（轮播图）管理 -->
  <div class="page-wrap">
    <div class="page-header">
      <h2>首页图片管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openCreateDialog">新增轮播图</el-button>
        <el-button @click="loadPage">刷新</el-button>
      </div>
    </div>

    <!-- 查询条件（置于表格上方，与其他管理页一致样式） -->
    <el-card class="query-card" shadow="never">
      <el-form @submit.prevent class="query-form">
        <el-form-item label="跳转类型">
          <el-select v-model="filters.targetType" placeholder="全部类型" clearable class="form-select w160">
            <el-option :value="0" label="无跳转" />
            <el-option :value="1" label="健康文章" />
            <el-option :value="2" label="健康视频" />
            <el-option :value="3" label="外部链接" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable class="form-select w140">
            <el-option :value="1" label="显示" />
            <el-option :value="0" label="隐藏" />
          </el-select>
        </el-form-item>
        <el-form-item class="form-actions">
          <el-button @click="onReset">重置</el-button>
          <el-button type="primary" @click="onSearch">确定</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-table :data="list" stripe border style="width: 100%" v-loading="loading">
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column prop="title" label="标题" min-width="160" />
      <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
      <el-table-column prop="imageUrl" label="图片" min-width="240">
        <template #default="{ row }">
          <el-image :src="row.imageUrl" fit="cover" style="width: 180px; height: 90px; border-radius: 6px;" />
        </template>
      </el-table-column>
      <el-table-column prop="targetType" label="跳转类型" width="120">
        <template #default="{ row }">
          {{ targetTypeText(row.targetType) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">{{ row.status === 1 ? '显示' : '隐藏' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（居中） -->
    <div class="pager">
      <el-pagination
        background
        layout="prev, pager, next, jumper, sizes, total"
        :total="page.total"
        :page-size="page.size"
        :current-page="page.current"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>

    <!-- 创建/编辑弹窗（优化为上下结构：上图上传回显，下信息填写） -->
    <el-dialog v-model="dialog.visible" :title="dialog.mode === 'create' ? '新增轮播图' : '编辑轮播图'" width="780px">
      <div class="dialog-body">
        <!-- 上：图片上传与回显 -->
        <div class="upload-area">
          <el-upload
            class="uploader"
            :show-file-list="false"
            :http-request="uploadBannerImage"
            :disabled="uploading"
            accept="image/*"
          >
            <div v-if="!form.imageUrl" class="upload-placeholder">
              <el-icon class="upload-plus"><Plus /></el-icon>
              <span>点击上传轮播图（推荐 16:9）</span>
            </div>
            <el-image v-else :src="form.imageUrl" fit="cover" class="image-preview" />
          </el-upload>
          <div class="upload-tips">支持 jpg/png/webp，大小 ≤ 2MB；上传后自动回显</div>
        </div>

        <!-- 下：信息填写表单（两列网格，按草图排版） -->
        <el-form :model="form" label-width="96px" :rules="rules" ref="formRef" class="info-form">
          <!-- 第一行：标题 / 跳转类型 -->
          <el-form-item class="col-left" label="标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入轮播图标题" />
          </el-form-item>
          <el-form-item class="col-right" label="跳转类型" prop="targetType">
            <el-select v-model="form.targetType" placeholder="选择跳转类型">
              <el-option :value="0" label="无跳转" />
              <el-option :value="1" label="健康文章" />
              <el-option :value="2" label="健康视频" />
              <el-option :value="3" label="外部链接" />
            </el-select>
          </el-form-item>

          <!-- 第二行：描述（全宽） -->
          <el-form-item class="col-full" label="描述" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
          </el-form-item>

          <!-- 第三行：排序 / 状态 -->
          <el-form-item class="col-left" label="排序" prop="sortOrder">
            <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
          </el-form-item>
          <el-form-item class="col-right" label="状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio :label="1">显示</el-radio>
              <el-radio :label="0">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- 第四行：目标ID / 目标URL（可选） -->
          <el-form-item class="col-left" label="目标ID" prop="targetId">
            <el-input v-model="form.targetId" placeholder="请输入文章或视频ID" />
          </el-form-item>
          <el-form-item class="col-right" label="目标URL" prop="targetUrl">
            <el-input v-model="form.targetUrl" placeholder="https://example.com" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="dialog.visible=false">取 消</el-button>
        <el-button type="primary" @click="onSubmit">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadRequestOptions } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { pageCarouselItems, createCarouselItem, updateCarouselItem, deleteCarouselItem } from '@/api/modules/carouselItems'
import request from '@/api/http'

// 数据
const list = ref<CarouselItemsVO[]>([])
const loading = ref(false)
const page = reactive({ current: 1, size: 10, total: 0 })
const filters = reactive<{ targetType?: number; status?: number }>({})

// 表单
interface CarouselItemsVO {
  id?: string
  title: string
  description: string
  imageUrl: string
  targetType: number
  targetId?: string
  targetUrl?: string
  sortOrder: number
  status: number
}

const form = reactive<CarouselItemsVO>({
  title: '', description: '', imageUrl: '', targetType: 0, targetId: undefined, targetUrl: '', sortOrder: 0, status: 1,
})
const dialog = reactive({ visible: false, mode: 'create' as 'create' | 'edit' })
const formRef = ref<FormInstance>()
const uploading = ref(false)
const localPreviewUrl = ref('')

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  imageUrl: [{ required: true, message: '请上传图片', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

function targetTypeText(t: number) { return ['无跳转', '健康文章', '健康视频', '外部链接'][t] || '未知' }

// 加载分页
async function loadPage() {
  loading.value = true
  const minMs = 1000
  const req = pageCarouselItems({ pageNum: page.current, pageSize: page.size, ...filters })
  try {
    const [res] = await Promise.all([
      req,
      new Promise<void>(resolve => setTimeout(resolve, minMs))
    ])
    // 按后端统一响应：{ code, msg, data: { total, list, pageNum, pageSize, pages } }
    const payload: any = res as any
    const data = payload?.data || {}
    list.value = (data.list || []) as CarouselItemsVO[]
    page.total = Number(data.total || 0)
    page.current = Number(data.pageNum || page.current)
    page.size = Number(data.pageSize || page.size)
  } finally {
    loading.value = false
  }
}

function onPageChange(p: number) { page.current = p; loadPage() }
function onSizeChange(s: number) { page.size = s; loadPage() }
function onSearch() { page.current = 1; loadPage() }
function onReset() { Object.assign(filters, { targetType: undefined, status: undefined }); page.current = 1; loadPage() }

// 打开弹窗
function openCreateDialog() {
  dialog.mode = 'create'
  Object.assign(form, { title: '', description: '', imageUrl: '', targetType: 0, targetId: undefined, targetUrl: '', sortOrder: 0, status: 1 })
  dialog.visible = true
}
function openEditDialog(row: CarouselItemsVO) {
  dialog.mode = 'edit'
  Object.assign(form, row)
  dialog.visible = true
}

/**
 * 上传轮播图图片到后端并回写 imageUrl
 * @param opt el-upload 自定义上传回调参数
 */
const uploadBannerImage = async (opt: UploadRequestOptions) => {
  const file = opt.file as File
  if (!file) return

  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 <= 2
  if (!isImage) {
    ElMessage.error('仅支持图片文件')
    opt.onError?.(new Error('仅支持图片文件') as any)
    return
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    opt.onError?.(new Error('图片大小不能超过 2MB') as any)
    return
  }

  const prevUrl = form.imageUrl
  if (localPreviewUrl.value) {
    URL.revokeObjectURL(localPreviewUrl.value)
    localPreviewUrl.value = ''
  }
  localPreviewUrl.value = URL.createObjectURL(file)
  form.imageUrl = localPreviewUrl.value

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const resp = await request.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    const raw: any = resp as any

    if (typeof raw?.code !== 'undefined' && raw?.code !== 200) {
      throw new Error(raw?.msg || '上传失败')
    }

    const url = raw?.data?.url ?? raw?.data
    if (!url || typeof url !== 'string') {
      throw new Error('上传失败')
    }

    form.imageUrl = url
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = ''
    }
    opt.onSuccess?.({} as any)
    ElMessage.success('图片上传成功')
  } catch (e: any) {
    form.imageUrl = prevUrl || ''
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = ''
    }
    ElMessage.error(e?.message || '图片上传失败')
    opt.onError?.((e instanceof Error ? e : new Error('上传失败')) as any)
  } finally {
    uploading.value = false
  }
}

watch(
  () => dialog.visible,
  (visible) => {
    if (visible) return
    if (localPreviewUrl.value) {
      URL.revokeObjectURL(localPreviewUrl.value)
      localPreviewUrl.value = ''
    }
    if ((form.imageUrl || '').startsWith('blob:')) {
      form.imageUrl = ''
    }
  }
)

// 保存
async function onSubmit() {
  await formRef.value?.validate()
  try {
    if (dialog.mode === 'create') {
      await createCarouselItem(form)
      ElMessage.success('创建成功')
    } else {
      await updateCarouselItem(form)
      ElMessage.success('更新成功')
    }
    dialog.visible = false
    loadPage()
  } catch (e) { ElMessage.error('操作失败') }
}

// 删除
async function onDelete(row: CarouselItemsVO) {
  await ElMessageBox.confirm('确认删除该轮播图吗？', '提示', { type: 'warning' })
  await deleteCarouselItem(row.id!)
  ElMessage.success('删除成功')
  loadPage()
}

// 首次加载
loadPage()
</script>

<style scoped>
.page-wrap { padding: 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.query-form { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.form-select { width: 160px; }
.w160 { width: 160px; }
.w140 { width: 140px; }
.form-actions { margin-left: auto; }
.pager { margin-top: 12px; display: flex; justify-content: center; }
.el-form-item { margin-bottom: 0; }
/* 弹窗体布局：上下结构 */
.dialog-body { display: flex; flex-direction: column; gap: 16px; }
.upload-area { display: flex; flex-direction: column; align-items: center; gap: 8px; }
/* 居中显示：设定固定宽度并水平居中 */
.uploader { width: 560px; margin: 0 auto; }
/* 占位内容居中（按你的要求保持不变） */
.upload-placeholder { width: 560px; height: 150px; border: 1px dashed var(--el-border-color); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; color: var(--el-text-color-secondary); gap: 8px; cursor: pointer; }
.upload-plus { font-size: 20px; }
.image-preview { width: 560px; height: 220px; border-radius: 8px; object-fit: cover; margin: 0 auto; }
.upload-tips { font-size: 12px; color: var(--el-text-color-secondary); }
.info-form { margin-top: 4px; display: grid; grid-template-columns: 1fr 1fr; column-gap: 16px; row-gap: 12px; }
.col-left { grid-column: 1 / 2; }
.col-right { grid-column: 2 / 3; }
.col-full { grid-column: 1 / 3; }
/* 文本域在右列也保持高度合适 */
:deep(.el-textarea__inner) { min-height: 80px; }
</style>
