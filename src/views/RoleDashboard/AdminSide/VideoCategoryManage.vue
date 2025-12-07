<template>
  <div class="page-wrap">
    <div class="page-header">
      <div>
        <h3 class="page-title">视频分类管理</h3>
        <p class="page-desc">维护视频分类字典，用于医生发布与筛选</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">新增分类</el-button>
        <el-button @click="refresh">刷新</el-button>
      </div>
    </div>

    <el-form :inline="true" :model="queryForm" class="query-form">
      <el-form-item label="分类名称">
        <el-input v-model="queryForm.name" placeholder="输入名称模糊搜索" class="w240" @input="onQueryFieldInput" />
      </el-form-item>
      <el-form-item label="是否启用">
        <el-select v-model="queryForm.isEnabled" placeholder="全部" class="w160" @change="onQueryFieldInput" clearable>
          <el-option :value="1" label="启用" />
          <el-option :value="0" label="停用" />
        </el-select>
      </el-form-item>
      <el-form-item class="form-actions">
        <el-button type="primary" @click="fetchPage">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" class="table" :empty-text="emptyText">
      <el-table-column prop="name" label="分类名称" min-width="160" />
      <el-table-column prop="description" label="描述" min-width="220" />
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column label="启用" width="120">
        <template #default="{ row }">
          <el-switch :model-value="row.isEnabled === 1" @change="(val:boolean)=>toggleEnabled(row,val)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="openEditDialog(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="prev, pager, next, jumper, sizes, total"
        :total="total"
        :current-page="pageNum"
        :page-size="pageSize"
        @current-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>

    <el-dialog v-model="dialog.visible" :title="dialog.mode==='create'?'新增分类':'编辑分类'" width="520px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px" class="dialog-form">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序值" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="是否启用" prop="isEnabled">
          <el-switch v-model="enabledSwitch" @change="(val:boolean)=>form.isEnabled=val?1:0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible=false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { VideoCategoriesVO, VideoCategoriesQuery, VideoCategoriesCreateDTO, VideoCategoriesUpdateDTO } from '@/api/types/videoTypes'
import { fetchVideoCategoriesPage, createVideoCategory, updateVideoCategory, deleteVideoCategory } from '@/api/modules/video'

// 分页与列表状态
const loading = ref(false)
const list = ref<VideoCategoriesVO[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const emptyText = computed(() => loading.value ? '加载中...' : '暂无数据')

// 查询表单
const queryForm = reactive<VideoCategoriesQuery>({ name: '', isEnabled: undefined })

// 弹窗与表单
const dialog = reactive<{ visible: boolean; mode: 'create' | 'edit'; currentId?: number }>({ visible: false, mode: 'create' })
const formRef = ref<FormInstance | null>(null)
const form = reactive<VideoCategoriesCreateDTO & Partial<VideoCategoriesUpdateDTO>>({ name: '', description: '', sortOrder: 0, isEnabled: 1 })
const enabledSwitch = ref(true)
const saving = ref(false)

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

/**
 * 加载分类分页列表
 */
async function fetchPage() {
  if (loading.value) return
  loading.value = true
  try {
    const resp = await fetchVideoCategoriesPage({ pageNum: pageNum.value, pageSize: pageSize.value, sortField: 'sortOrder', sortDirection: 'ASC', query: { name: queryForm.name || undefined, isEnabled: queryForm.isEnabled } })
    const data: any = resp?.data || {}
    const records = data?.records ?? data?.list ?? []
    const totalNum = data?.total ?? data?.totalCount ?? 0
    list.value = records as VideoCategoriesVO[]
    total.value = totalNum
  } catch (e) {
    ElMessage.error('获取分类列表失败')
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/**
 * 查询字段变更（重置到第一页并触发防抖/立即查询）
 */
function onQueryFieldInput() {
  pageNum.value = 1
}

/**
 * 重置查询条件
 */
function resetQuery() {
  queryForm.name = ''
  queryForm.isEnabled = undefined
  pageNum.value = 1
  fetchPage()
}

/**
 * 分页变化处理
 * @param p 当前页码
 */
function onPageChange(p: number) { pageNum.value = p; fetchPage() }

/**
 * 分页尺寸变化处理
 * @param size 每页大小
 */
function onPageSizeChange(size: number) { pageSize.value = size; pageNum.value = 1; fetchPage() }

/**
 * 打开新增弹窗
 */
function openCreateDialog() {
  dialog.visible = true
  dialog.mode = 'create'
  dialog.currentId = undefined
  form.name = ''
  form.description = ''
  form.sortOrder = 0
  form.isEnabled = 1
  enabledSwitch.value = true
}

/**
 * 打开编辑弹窗
 * @param row 当前行
 */
function openEditDialog(row: VideoCategoriesVO) {
  dialog.visible = true
  dialog.mode = 'edit'
  dialog.currentId = row.id
  form.name = row.name
  form.description = row.description || ''
  form.sortOrder = row.sortOrder ?? 0
  form.isEnabled = row.isEnabled ?? 1
  enabledSwitch.value = form.isEnabled === 1
}

/**
 * 保存（创建或更新）
 */
async function onSubmit() {
  await formRef.value?.validate()
  saving.value = true
  try {
    if (dialog.mode === 'create') {
      await createVideoCategory({ name: form.name!, description: form.description || '', sortOrder: form.sortOrder ?? 0, isEnabled: form.isEnabled ?? 1 })
      ElMessage.success('创建成功')
    } else {
      await updateVideoCategory({ id: dialog.currentId!, name: form.name, description: form.description, sortOrder: form.sortOrder, isEnabled: form.isEnabled })
      ElMessage.success('更新成功')
    }
    dialog.visible = false
    fetchPage()
  } catch (e) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

/**
 * 删除分类
 * @param row 当前行
 */
async function onDelete(row: VideoCategoriesVO) {
  await ElMessageBox.confirm(`确认删除分类「${row.name}」吗？`, '提示', { type: 'warning' })
  await deleteVideoCategory(row.id)
  ElMessage.success('删除成功')
  fetchPage()
}

/**
 * 启停切换
 * @param row 行对象
 * @param val 启用状态
 */
/**
 * 启停切换（传完整更新DTO，避免后端校验不通过）
 * @param row 当前分类行
 * @param val 切换后的启用布尔值
 */
async function toggleEnabled(row: VideoCategoriesVO, val: boolean) {
  try {
    const payload = {
      id: row.id,
      name: row.name,
      description: row.description ?? '',
      sortOrder: row.sortOrder ?? 0,
      isEnabled: val ? 1 : 0
    }
    await updateVideoCategory(payload)
    row.isEnabled = payload.isEnabled
    ElMessage.success('状态已更新')
  } catch (e) {
    ElMessage.error('更新失败')
  }
}

/**
 * 刷新列表
 */
function refresh() { fetchPage() }

onMounted(fetchPage)
</script>

<style scoped>
.page-wrap { padding: 16px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.page-title { font-size: 18px; margin: 0; }
.page-desc { color: #666; margin-top: 6px; }
.header-actions { display: flex; gap: 10px; }
.query-form { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.w240 { width: 240px; }
.w160 { width: 160px; }
.form-actions { margin-left: auto; }
.pager { margin-top: 12px; display: flex; justify-content: center; }
.dialog-form :deep(.el-input__wrapper) { height: 40px; }
</style>
