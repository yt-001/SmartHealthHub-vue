<template>
  <div class="medicine-page">
    <!-- 查询卡片 -->
    <el-card class="query-card" shadow="never" ref="queryCardRef">
      <el-form :inline="true" :model="query" class="query-form">
        <el-form-item label="药品名称">
          <el-input v-model="query.name" placeholder="请输入药品名称" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="大类">
          <el-select
            v-model="query.bigCategoryId"
            placeholder="请选择大类"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in bigCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="小类">
          <el-select
            v-model="query.smallCategoryId"
            placeholder="请选择小类"
            clearable
            :disabled="!query.bigCategoryId"
            style="width: 140px"
          >
            <el-option
              v-for="item in smallCategoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="处方药">
          <el-select v-model="query.isPrescription" placeholder="全部" clearable style="width: 120px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="显示" :value="1" />
            <el-option label="隐藏" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="success" @click="onAdd">新增药品</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      :height="tableHeight"
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />
      <el-table-column label="封面图" width="100">
        <template #default="{ row }">
          <el-image
            v-if="row.coverImageUrl"
            style="width: 50px; height: 50px"
            :src="row.coverImageUrl"
            :preview-src-list="[row.coverImageUrl]"
            fit="cover"
            preview-teleported
          />
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="药品名称" min-width="150" show-overflow-tooltip />
      <el-table-column prop="subCategoryName" label="所属小类" width="140" show-overflow-tooltip />
      <el-table-column prop="price" label="价格" width="100">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="100" />
      <el-table-column prop="isPrescription" label="处方药" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isPrescription === 1 ? 'warning' : 'success'">
            {{ row.isPrescription === 1 ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '显示' : '隐藏' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="onEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pager" ref="pagerRef" style="margin-top: 20px; display: flex; justify-content: center;">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑药品' : '新增药品'"
      width="600px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item label="药品名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入药品名称" />
        </el-form-item>
        <el-form-item label="通用名称" prop="commonName">
          <el-input v-model="formData.commonName" placeholder="请输入通用名称" />
        </el-form-item>
        <el-form-item label="现价" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="原价" prop="originalPrice">
          <el-input-number v-model="formData.originalPrice" :min="0" :precision="2" :step="0.1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="封面图URL" prop="coverImageUrl">
          <el-input v-model="formData.coverImageUrl" placeholder="请输入图片URL" />
        </el-form-item>
        <el-form-item label="是否处方药" prop="isPrescription">
          <el-radio-group v-model="formData.isPrescription">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入简介" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="onSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { medicineApi } from '@/api'
import type { MedicineVO, MedicineCreateDTO, MedicineUpdateDTO } from '@/api/types/medicineTypes'

// 列表数据
const list = ref<MedicineVO[]>([])
const loading = ref(false)
const total = ref(0)

// 分类下拉选项
const bigCategoryOptions = ref<{ label: string; value: number }[]>([])
const smallCategoryOptions = ref<{ label: string; value: number }[]>([])

const queryCardRef = ref<HTMLElement | null>(null)
const pagerRef = ref<HTMLElement | null>(null)
const tableHeight = ref<number>(0)

const recalcTableHeight = () => {
  const qc = queryCardRef.value?.offsetHeight || 0
  const pg = pagerRef.value?.offsetHeight || 0
  const base = 160
  const h = window.innerHeight - (qc + pg + base)
  tableHeight.value = h > 300 ? h : 300
}

// 延时工具
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 防抖工具
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

// 查询参数
const query = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  bigCategoryId: undefined as number | undefined,
  smallCategoryId: undefined as number | undefined,
  isPrescription: undefined as number | undefined,
  status: undefined as number | undefined
})

// 弹窗相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<Partial<MedicineCreateDTO & { id?: string }>>({
  name: '',
  commonName: '',
  price: 0,
  originalPrice: 0,
  coverImageUrl: '',
  isPrescription: 0,
  status: 1,
  description: ''
})

// 表单校验规则
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
})

// 获取列表
const fetchData = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const hasSmall = !!query.smallCategoryId
    const hasBig = !!query.bigCategoryId
    const payload = {
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      query: {
        name: query.name || undefined,
        isPrescription: query.isPrescription,
        status: query.status,
        ...(hasSmall ? { categoryId: query.smallCategoryId as number } : {}),
        ...(!hasSmall && hasBig ? { parentCategoryId: query.bigCategoryId as number } : {})
      }
    }
    const res = await medicineApi.fetchMedicinesPage(payload)
    
    // 强制至少 0.8s 加载时间
    const elapsed = Date.now() - start
    if (elapsed < 800) await sleep(800 - elapsed)

    const raw: any = res as any
    const page: any = typeof raw?.code !== 'undefined' && raw?.data ? raw.data : raw
    list.value = Array.isArray(page?.list) ? page.list : []
    total.value = Number(page?.total ?? 0) || 0
  } catch (error) {
    console.error('获取药品列表失败', error)
    ElMessage.error('获取数据失败')
    list.value = []
    total.value = 0
    // 出错也保持加载动画至少 0.8s
    const elapsed = Date.now() - start
    if (elapsed < 800) await sleep(800 - elapsed)
  } finally {
    loading.value = false
  }
}

// 防抖查询 (0.6s)
const fetchDataDebounced = useDebounce(fetchData, 600)

// 加载大类选项
const loadBigCategories = async () => {
  try {
    // parentId: null 表示获取一级分类（大类）
    const res = await medicineApi.fetchMedicineCategoriesPage({
      pageNum: 1,
      pageSize: 1000,
      query: { parentId: null, isEnabled: 1 }
    })
    const raw: any = res as any
    const data: any = typeof raw?.code !== 'undefined' && raw?.data ? raw.data : raw
    const items: any[] = Array.isArray(data?.list) ? data.list : []
    
    bigCategoryOptions.value = items.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载大类列表失败', error)
  }
}

// 加载小类选项
const loadSmallCategories = async (parentId: number) => {
  try {
    const res = await medicineApi.fetchMedicineCategoriesPage({
      pageNum: 1,
      pageSize: 1000,
      query: { parentId, isEnabled: 1 }
    })
    const raw: any = res as any
    const data: any = typeof raw?.code !== 'undefined' && raw?.data ? raw.data : raw
    const items: any[] = Array.isArray(data?.list) ? data.list : []
    
    smallCategoryOptions.value = items.map(item => ({
      label: item.name,
      value: item.id
    }))
  } catch (error) {
    console.error('加载小类列表失败', error)
    smallCategoryOptions.value = []
  }
}

// 监听大类变化
watch(() => query.bigCategoryId, (newVal) => {
  // 清空小类选择
  query.smallCategoryId = undefined
  smallCategoryOptions.value = []
  
  if (newVal) {
    loadSmallCategories(newVal)
  }
})

// 搜索
const onSearch = () => {
  query.pageNum = 1
  fetchData()
}

const onReset = () => {
  query.name = ''
  query.bigCategoryId = undefined
  query.smallCategoryId = undefined
  query.isPrescription = undefined
  query.status = undefined
  onSearch()
}

const onPageSizeChange = (val: number) => {
  query.pageSize = val
  onSearch()
}

const onPageChange = (val: number) => {
  query.pageNum = val
  fetchData()
}

// 打开新增弹窗
const onAdd = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 打开编辑弹窗
const onEdit = (row: MedicineVO) => {
  isEdit.value = true
  resetForm()
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    commonName: row.commonName,
    price: row.price,
    originalPrice: row.originalPrice,
    coverImageUrl: row.coverImageUrl,
    isPrescription: row.isPrescription,
    status: row.status,
    description: row.description
  })
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.id = undefined
  formData.name = ''
  formData.commonName = ''
  formData.price = 0
  formData.originalPrice = 0
  formData.coverImageUrl = ''
  formData.isPrescription = 0
  formData.status = 1
  formData.description = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 提交表单
const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value && formData.id) {
          await medicineApi.updateMedicine(formData as MedicineUpdateDTO)
          ElMessage.success('更新成功')
        } else {
          await medicineApi.createMedicine(formData as MedicineCreateDTO)
          ElMessage.success('创建成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error('提交失败', error)
        ElMessage.error('操作失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 删除
const onDelete = (row: MedicineVO) => {
  ElMessageBox.confirm('确定要删除该药品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await medicineApi.deleteMedicine(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadBigCategories()
  fetchData()
  nextTick(() => {
    recalcTableHeight()
    window.addEventListener('resize', recalcTableHeight)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', recalcTableHeight as any)
})
</script>

<style scoped>
.medicine-page {
  padding: 20px;
}
:deep(.el-table__body-wrapper) {
  overscroll-behavior: contain;
}
</style>
