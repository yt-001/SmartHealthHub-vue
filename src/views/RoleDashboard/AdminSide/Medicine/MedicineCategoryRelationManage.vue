<template>
  <div class="medicine-relation-page">
    <el-card class="query-card" shadow="never">
      <el-form :inline="true" :model="query" class="query-form">
        <el-form-item label="药品ID">
          <el-input v-model.number="query.medicineId" placeholder="请输入药品ID" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="query.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="success" @click="onAdd">新增关联</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-table
      v-loading="loading"
      :data="list"
      border
      stripe
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="medicineId" label="药品ID" width="100" />
      <el-table-column prop="medicineName" label="药品名称" min-width="180" />
      <el-table-column prop="categoryId" label="分类ID" width="100" />
      <el-table-column prop="categoryName" label="分类名称" min-width="180" />
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager" style="margin-top: 20px; display: flex; justify-content: center;">
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

    <el-dialog
      v-model="dialogVisible"
      title="新增关联"
      width="400px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
        <el-form-item label="药品" prop="medicineId">
          <el-select
            v-model="formData.medicineId"
            placeholder="请选择药品"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in medicineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="formData.categoryId"
            placeholder="请选择分类"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { medicineApi } from '@/api'
import type { MedicineCategoryRelationVO, MedicineCategoryRelationCreateDTO } from '@/api/types/medicineTypes'

const list = ref<MedicineCategoryRelationVO[]>([])
const loading = ref(false)
const total = ref(0)

const categoryOptions = ref<{ label: string; value: number }[]>([])
const medicineOptions = ref<{ label: string; value: number }[]>([])

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

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  medicineId: undefined as number | undefined,
  categoryId: undefined as number | undefined
})

const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<MedicineCategoryRelationCreateDTO>({
  medicineId: undefined as any,
  categoryId: undefined as any
})

const rules = reactive<FormRules>({
  medicineId: [{ required: true, message: '请选择药品', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
})

const fetchData = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const res = await medicineApi.fetchMedicineCategoryRelationsPage({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      query: {
        medicineId: query.medicineId,
        categoryId: query.categoryId
      }
    })
    
    // 强制至少 0.8s 加载时间
    const elapsed = Date.now() - start
    if (elapsed < 800) await sleep(800 - elapsed)

    const raw: any = res as any
    const data: any = typeof raw?.code !== 'undefined' && raw?.data ? raw.data : raw
    list.value = data?.list ?? []
    total.value = Number(data?.total ?? 0) || 0
  } catch (error) {
    console.error('获取关联列表失败', error)
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

const loadMedicineOptions = async () => {
  try {
    const res = await medicineApi.fetchMedicinesPage({
      pageNum: 1,
      pageSize: 100,
      query: {}
    })
    const data: any = (res as any)?.data ?? res
    const items: any[] = data?.list ?? []
    medicineOptions.value = items.map((item) => ({
      label: `${item.name}（ID: ${item.id}）`,
      value: Number(item.id)
    }))
  } catch (error) {
    console.error('加载药品列表失败', error)
  }
}

const loadCategoryOptions = async () => {
  try {
    const res = await medicineApi.fetchMedicineCategoriesPage({
      pageNum: 1,
      pageSize: 100,
      query: {
        isEnabled: 1
      }
    })
    const data: any = (res as any)?.data ?? res
    const items: any[] = data?.list ?? []
    categoryOptions.value = items.map((item) => ({
      label: item.name,
      value: Number(item.id)
    }))
  } catch (error) {
    console.error('加载分类列表失败', error)
  }
}

const onSearch = () => {
  query.pageNum = 1
  fetchDataDebounced()
}

const onReset = () => {
  query.medicineId = undefined
  query.categoryId = undefined
  onSearch()
}

const onPageChange = (page: number) => {
  query.pageNum = page
  fetchDataDebounced()
}

const onPageSizeChange = (size: number) => {
  query.pageSize = size
  query.pageNum = 1
  fetchDataDebounced()
}

const onAdd = () => {
  formData.medicineId = undefined as any
  formData.categoryId = undefined as any
  dialogVisible.value = true
}

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await medicineApi.createMedicineCategoryRelation(formData)
        ElMessage.success('创建成功')
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

const onDelete = (row: MedicineCategoryRelationVO) => {
  ElMessageBox.confirm('确定要删除该关联吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await medicineApi.deleteMedicineCategoryRelation(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  loadCategoryOptions()
  loadMedicineOptions()
  fetchData()
})
</script>

<style scoped>
.medicine-relation-page {
  padding: 20px;
}
</style>
