<template>
  <div class="prescription-container">
    <el-row :gutter="20">
      <!-- 主内容区域 -->
      <el-col :span="24">
        <!-- 处方明细 -->
        <el-card class="box-card mb-4">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span><el-icon><Document /></el-icon> 处方明细</span>
                <!-- 移动到这里的患者选择 -->
                <el-select
                  v-model="selectedPatientId"
                  filterable
                  remote
                  placeholder="请选择或搜索就诊患者"
                  :remote-method="searchPatients"
                  :loading="patientLoading"
                  style="width: 300px; margin-left: 20px"
                  @change="handlePatientSelect"
                >
                  <el-option
                    v-for="item in patientOptions"
                    :key="item.id"
                    :label="getPatientLabel(item)"
                    :value="item.patientId"
                  >
                    <span style="float: left">{{ item.patientName }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px" v-if="item.appointmentTime">
                      {{ formatTime(item.appointmentTime) }}
                    </span>
                  </el-option>
                </el-select>
              </div>
              <el-button type="primary" link @click="openMedicineSelector">
                <el-icon><Plus /></el-icon> 添加药品
              </el-button>
            </div>
          </template>
          
          <div v-if="currentPatient" class="patient-info-bar mb-4">
             <el-descriptions :column="4" border size="small">
               <el-descriptions-item label="姓名">{{ currentPatient.patientName }}</el-descriptions-item>
               <el-descriptions-item label="性别">{{ currentPatient.gender || '未知' }}</el-descriptions-item>
               <el-descriptions-item label="年龄">{{ currentPatient.age || '未知' }}</el-descriptions-item>
               <el-descriptions-item label="电话">{{ currentPatient.phone || '无' }}</el-descriptions-item>
             </el-descriptions>
          </div>

          <el-table :data="prescriptionList" border stripe style="width: 100%">
            <el-table-column prop="name" label="药品名称" width="180" />
            <el-table-column prop="tags" label="类型" width="100">
              <template #default="scope">
                <el-tag v-for="tag in scope.row.tags" :key="tag" size="small" class="mr-1">{{ tag }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数量" width="150">
              <template #default="scope">
                <el-input-number v-model="scope.row.quantity" :min="1" :max="99" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="用法用量" min-width="200">
              <template #default="scope">
                <el-input v-model="scope.row.usage" size="small" placeholder="例：每日3次，每次1粒" />
              </template>
            </el-table-column>
            <el-table-column label="单价" width="100">
              <template #default="scope">
                ¥{{ scope.row.price }}
              </template>
            </el-table-column>
            <el-table-column label="小计" width="100">
              <template #default="scope">
                ¥{{ (scope.row.price * scope.row.quantity).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="80">
              <template #default="scope">
                <el-button link type="danger" size="small" @click="removeMedicine(scope.$index)">移除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="total-price mt-2">
            总计: <span class="price">¥{{ totalPrice }}</span>
          </div>
        </el-card>

        <!-- 诊断信息 -->
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span><el-icon><EditPen /></el-icon> 诊断与医嘱</span>
            </div>
          </template>
          
          <el-form :model="diagnosisForm" label-width="80px">
            <el-form-item label="主诉症状">
              <el-input v-model="diagnosisForm.symptoms" type="textarea" :rows="2" placeholder="患者主诉的不适症状" />
            </el-form-item>
            <el-form-item label="诊断结果">
              <el-input v-model="diagnosisForm.diagnosis" type="textarea" :rows="2" placeholder="医生的诊断结论" />
            </el-form-item>
            <el-form-item label="治疗方案">
              <el-input v-model="diagnosisForm.treatmentPlan" type="textarea" :rows="2" placeholder="具体的治疗措施" />
            </el-form-item>
            <el-form-item label="医嘱备注">
              <el-input v-model="diagnosisForm.notes" type="textarea" :rows="2" placeholder="给患者的特别叮嘱" />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="submitPrescription" :loading="submitting">提交处方</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 药品选择弹窗 -->
    <el-dialog v-model="medicineDialogVisible" title="选择药品" width="70%">
      <div class="medicine-selector">
        <!-- 分类树 -->
        <div class="category-tree">
          <el-scrollbar height="400px">
            <el-tree
              :data="categoryTree"
              :props="defaultProps"
              @node-click="handleNodeClick"
              highlight-current
            />
          </el-scrollbar>
        </div>
        <!-- 药品列表 -->
        <div class="medicine-list">
           <el-input
            v-model="medicineSearch"
            placeholder="搜索药品名称"
            class="mb-2"
            prefix-icon="Search"
            @input="filterMedicines"
          />
          <el-scrollbar height="360px">
            <el-row :gutter="10">
              <el-col :span="8" v-for="med in displayedMedicines" :key="med.id" class="mb-2">
                <el-card shadow="hover" class="medicine-card" :body-style="{ padding: '10px' }">
                  <div class="med-info">
                    <div class="med-name">{{ med.name }}</div>
                    <div class="med-price">¥{{ med.price }}</div>
                    <el-tag size="small" v-if="med.isPrescription === 1" type="danger">处方药</el-tag>
                  </div>
                  <div class="med-action">
                    <el-button type="primary" size="small" @click="addMedicine(med)">添加</el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <div v-if="displayedMedicines.length === 0" class="empty-text">暂无药品数据</div>
          </el-scrollbar>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { User, Document, EditPen, Plus, Clock, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import request from '@/api/http'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const doctorId = computed(() => userStore.userInfo?.id)

// 患者相关
const selectedPatientId = ref('')
const patientOptions = ref<any[]>([])
const patientLoading = ref(false)
const currentPatient = ref<any>(null)
const appointments = ref<any[]>([])

// 处方相关
const prescriptionList = ref<any[]>([])
const totalPrice = computed(() => {
  return prescriptionList.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
})

// 诊断表单
const diagnosisForm = reactive({
  symptoms: '',
  diagnosis: '',
  treatmentPlan: '',
  notes: ''
})
const submitting = ref(false)

// 药品选择相关
const medicineDialogVisible = ref(false)
const categoryTree = ref<any[]>([])
const allMedicines = ref<any[]>([]) // 扁平化的所有药品，用于搜索
const currentCategoryMedicines = ref<any[]>([]) // 当前分类下的药品
const medicineSearch = ref('')
const defaultProps = {
  children: 'children',
  label: 'name',
}

// 初始化
onMounted(() => {
  fetchAppointments()
  fetchMedicineTree()
})

// 获取预约列表（今日待诊）
async function fetchAppointments() {
  if (!doctorId.value) return
  try {
    // 调用 /appointments/doctor/{doctorId}/page
    const res: any = await request.post(`/appointments/doctor/${doctorId.value}/page`, {
      page: 1,
      pageSize: 50,
      query: {
        // status: 0 // 待就诊，暂时获取所有状态
      }
    })
    if (res.code === 200) {
      appointments.value = res.data.records || []
      updateOptionsFromAppointments()
    }
  } catch (error) {
    console.error('获取预约失败', error)
  }
}

// 搜索患者
async function searchPatients(query: string) {
  if (query) {
    patientLoading.value = true
    try {
      // 调用后端搜索接口 /admin/patients/page
      // 注意：这里复用了管理员的查询接口，实际权限控制需根据项目配置调整
      const res: any = await request.post('/admin/patients/page', {
        pageNum: 1,
        pageSize: 20,
        query: {
          realName: query // 支持按姓名搜索
        }
      })
      
      if (res.code === 200) {
        const records = res.data.list || res.data.records || []
        patientOptions.value = records.map((item: any) => ({
          id: item.id, // 这里 id 即为 userId
          patientId: item.id,
          patientName: item.realName || item.username,
          appointmentTime: null, // 搜索出来的患者可能没有预约
          phone: item.phone,
          gender: item.gender === 'M' ? '男' : (item.gender === 'F' ? '女' : '未知'),
          age: item.age || '未知' // 假设后端返回了 age，或者需要根据 birthDate 计算
        }))
      }
    } catch (error) {
      console.error('搜索患者失败', error)
    } finally {
      patientLoading.value = false
    }
  } else {
    // 恢复显示预约列表
    updateOptionsFromAppointments()
  }
}

function updateOptionsFromAppointments() {
  patientOptions.value = appointments.value.map(item => ({
    id: item.id,
    patientId: item.patientId,
    patientName: item.patientName,
    appointmentTime: item.appointmentTime,
    phone: item.patientPhone,
    gender: item.patientGender,
    age: item.patientAge
  }))
}

// 选择患者
function handlePatientSelect(val: any) {
  // 先从当前选项列表中查找
  let patient = patientOptions.value.find(item => item.patientId === val)
  
  // 如果没找到（可能是从预约列表切到搜索列表又切回来等情况），尝试从预约列表中找
  if (!patient) {
    patient = appointments.value.find(item => item.patientId === val)
  }
  
  if (patient) {
    currentPatient.value = patient
  }
}

function selectPatientFromList(item: any) {
  selectedPatientId.value = item.patientId
  handlePatientSelect(item.patientId)
}

function getPatientLabel(item: any) {
  if (item.appointmentTime) {
    return `${item.patientName} (预约: ${formatTime(item.appointmentTime)})`
  }
  return `${item.patientName} (无预约)`
}

// 格式化时间
function formatTime(timeStr: string | Date) {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 药品选择逻辑
async function fetchMedicineTree() {
  try {
    const res: any = await request.get('/medicines/recommendation-tree')
    if (res.code === 200) {
      // 转换数据结构适配 el-tree
      categoryTree.value = res.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        type: 'big', // 标记为大类
        children: cat.subCategories?.map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          type: 'sub', // 标记为小类
          // 不再直接使用这里的 medicines，因为可能数量受限
        }))
      }))
      // 默认加载全部药品（第一页）
      fetchMedicines({})
    }
  } catch (error) {
    console.error('获取药品分类失败', error)
  }
}

async function fetchMedicines(query: any) {
  try {
    const res: any = await request.post('/medicines/page', {
      page: 1,
      pageSize: 100, // 获取足够多的药品，或者实现分页
      query: query
    })
    if (res.code === 200) {
      const records = res.data.list || res.data.records || []
      currentCategoryMedicines.value = records.map((item: any) => ({
        ...item,
        tags: [
          item.isPrescription === 1 ? '处方药' : 'OTC',
          item.subCategoryName
        ].filter(Boolean)
      }))
    }
  } catch (error) {
    console.error('获取药品列表失败', error)
  }
}

function openMedicineSelector() {
  medicineDialogVisible.value = true
  medicineSearch.value = ''
  fetchMedicines({}) // 重置为显示所有
}

function handleNodeClick(data: any) {
  if (data.type === 'sub') {
    // 点击小类
    fetchMedicines({ categoryId: data.id })
  } else if (data.type === 'big') {
    // 点击大类
    fetchMedicines({ parentCategoryId: data.id })
  } else {
     // 其他情况
     fetchMedicines({})
  }
}

const displayedMedicines = computed(() => {
  // 这里的过滤仅针对当前已加载的列表，如果做了分页，应该在服务端搜索
  if (!medicineSearch.value) return currentCategoryMedicines.value
  return currentCategoryMedicines.value.filter(m => m.name.includes(medicineSearch.value))
})

function filterMedicines() {
  // 如果需要服务端搜索
  fetchMedicines({ name: medicineSearch.value })
}

function addMedicine(med: any) {
  const existing = prescriptionList.value.find(item => item.id === med.id)
  if (existing) {
    existing.quantity++
  } else {
    prescriptionList.value.push({
      id: med.id,
      name: med.name,
      price: med.price,
      quantity: 1,
      usage: '',
      tags: med.tags
    })
  }
  ElMessage.success(`已添加 ${med.name}`)
}

function removeMedicine(index: number) {
  prescriptionList.value.splice(index, 1)
}

// 提交处方
async function submitPrescription() {
  // if (!currentPatient.value) {
  //   ElMessage.warning('请先选择患者')
  //   return
  // }
  if (prescriptionList.value.length === 0 && !diagnosisForm.diagnosis) {
    ElMessage.warning('请至少填写诊断结果或添加药品')
    return
  }
  
  submitting.value = true
  try {
    const data = {
      userId: currentPatient.value?.patientId || -1, // 如果未选择患者，传递默认值或空值（视后端要求而定）
      doctorId: doctorId.value,
      userName: currentPatient.value?.patientName || '未知/测试患者',
      doctorName: userStore.userInfo?.realName || userStore.userInfo?.username,
      symptoms: diagnosisForm.symptoms,
      diagnosis: diagnosisForm.diagnosis,
      treatmentPlan: diagnosisForm.treatmentPlan,
      notes: diagnosisForm.notes,
      prescription: JSON.stringify(prescriptionList.value),
      status: 0 // 治疗中
    }
    
    const res: any = await request.post('/medicalRecords/save', data)
    if (res.code === 200) {
      ElMessage.success('处方保存成功')
      resetForm()
      // 可以选择是否跳转或刷新
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('系统错误，请重试')
  } finally {
    submitting.value = false
  }
}

function resetForm() {
  selectedPatientId.value = ''
  currentPatient.value = null
  prescriptionList.value = []
  diagnosisForm.symptoms = ''
  diagnosisForm.diagnosis = ''
  diagnosisForm.treatmentPlan = ''
  diagnosisForm.notes = ''
}
</script>

<style scoped>
.prescription-container {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
}
.mb-4 {
  margin-bottom: 20px;
}
.mt-2 {
  margin-top: 10px;
}
.mr-1 {
  margin-right: 5px;
}
.mb-2 {
  margin-bottom: 10px;
}
.total-price {
  text-align: right;
  font-size: 16px;
  font-weight: bold;
}
.price {
  color: #f56c6c;
  font-size: 20px;
}
.medicine-selector {
  display: flex;
  height: 400px;
}
.category-tree {
  width: 200px;
  border-right: 1px solid #eee;
  margin-right: 10px;
}
.medicine-list {
  flex: 1;
}
.medicine-card {
  cursor: pointer;
  transition: all 0.3s;
}
.medicine-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}
.med-info {
  margin-bottom: 10px;
}
.med-name {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.med-price {
  color: #f56c6c;
  font-weight: bold;
}
.med-action {
  text-align: right;
}
.appointment-item {
  cursor: pointer;
}
.appointment-item:hover h4 {
  color: #409eff;
}
.empty-text {
  text-align: center;
  color: #909399;
  padding: 20px;
}
.empty-tip {
  text-align: center;
  color: #909399;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>
