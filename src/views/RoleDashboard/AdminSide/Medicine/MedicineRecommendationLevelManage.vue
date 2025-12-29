<template>
  <div class="medicine-recommendation-level-page">
    <el-card class="query-card" shadow="never">
      <el-form :inline="true" :model="query" class="query-form">
        <el-form-item label="级别名称">
          <el-input
            v-model="query.name"
            placeholder="请输入级别名称"
            clearable
            @keyup.enter="onSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="query.isEnabled"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSearch">查询</el-button>
          <el-button @click="onReset">重置</el-button>
          <el-button type="success" @click="onAdd">新增级别</el-button>
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
      <el-table-column prop="code" label="级别编码" min-width="120" />
      <el-table-column prop="name" label="级别名称" min-width="150" />
      <el-table-column
        prop="description"
        label="描述"
        min-width="200"
        show-overflow-tooltip
      />
      <el-table-column prop="sortOrder" label="排序" width="100" />
      <el-table-column prop="isEnabled" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.isEnabled === 1 ? 'success' : 'danger'">
            {{ row.isEnabled === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="onEdit(row)">编辑</el-button>
          <el-button link type="danger" @click="onDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager" style="margin-top: 20px; display: flex; justify-content: center">
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
      :title="isEdit ? '编辑推荐级别' : '新增推荐级别'"
      width="520px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
        <el-form-item label="级别编码" prop="code">
          <el-input v-model="formData.code" placeholder="请输入唯一编码，如 FIRST" />
        </el-form-item>
        <el-form-item label="级别名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入级别名称，如 首选推荐" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="formData.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" :step="1" />
        </el-form-item>
        <el-form-item label="状态" prop="isEnabled">
          <el-radio-group v-model="formData.isEnabled">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
import type {
  MedicineRecommendationLevelVO,
  MedicineRecommendationLevelCreateDTO,
  MedicineRecommendationLevelUpdateDTO
} from '@/api/types/medicineTypes'

const list = ref<MedicineRecommendationLevelVO[]>([])
const loading = ref(false)
const total = ref(0)

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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
  name: '',
  isEnabled: undefined as number | undefined
})

const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive<Partial<MedicineRecommendationLevelCreateDTO & { id?: number }>>({
  code: '',
  name: '',
  description: '',
  sortOrder: 0,
  isEnabled: 1
})

const rules = reactive<FormRules>({
  code: [{ required: true, message: '请输入级别编码', trigger: 'blur' }],
  name: [{ required: true, message: '请输入级别名称', trigger: 'blur' }]
})

const fetchData = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const res = await medicineApi.fetchMedicineRecommendationLevelsPage({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      query: {
        name: query.name || undefined,
        isEnabled: query.isEnabled
      }
    })

    const elapsed = Date.now() - start
    if (elapsed < 800) await sleep(800 - elapsed)

    if (res.code === 200 && res.data) {
      list.value = res.data.list
      total.value = Number(res.data.total ?? 0) || 0
    } else {
      list.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取推荐级别列表失败', error)
    ElMessage.error('获取数据失败')
    list.value = []
    total.value = 0
    const elapsed = Date.now() - start
    if (elapsed < 800) await sleep(800 - elapsed)
  } finally {
    loading.value = false
  }
}

const fetchDataDebounced = useDebounce(fetchData, 600)

const onSearch = () => {
  query.pageNum = 1
  fetchDataDebounced()
}

const onReset = () => {
  query.name = ''
  query.isEnabled = undefined
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
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const onEdit = (row: MedicineRecommendationLevelVO) => {
  isEdit.value = true
  resetForm()
  Object.assign(formData, {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    isEnabled: row.isEnabled
  })
  dialogVisible.value = true
}

const resetForm = () => {
  formData.id = undefined
  formData.code = ''
  formData.name = ''
  formData.description = ''
  formData.sortOrder = 0
  formData.isEnabled = 1
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const onSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value && formData.id != null) {
          await medicineApi.updateMedicineRecommendationLevel(
            formData as MedicineRecommendationLevelUpdateDTO
          )
          ElMessage.success('更新成功')
        } else {
          await medicineApi.createMedicineRecommendationLevel(
            formData as MedicineRecommendationLevelCreateDTO
          )
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

const onDelete = (row: MedicineRecommendationLevelVO) => {
  ElMessageBox.confirm('确定要删除该推荐级别吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await medicineApi.deleteMedicineRecommendationLevel(row.id)
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error('删除失败', error)
      ElMessage.error('删除失败')
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.medicine-recommendation-level-page {
  padding: 20px;
}
</style>
