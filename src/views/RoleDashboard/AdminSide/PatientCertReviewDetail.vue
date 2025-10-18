<template>
  <div class="page">
    <h2>患者认证详情</h2>
    <p class="desc">展示单条患者认证申请的详细信息，管理员可进行通过/驳回操作。</p>

    <div class="card" v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(0,0,0,0.2)">
      <template v-if="!loading">
        <table class="detail-table">
          <tbody>
            <tr><th>申请编号</th><td colspan="3">{{ id }}</td></tr>
            <tr>
              <th>患者姓名</th><td>{{ getVal('name') }}</td>
              <th>提交时间</th><td>{{ getVal('submitTime') }}</td>
            </tr>
            <tr>
              <th>身份证号</th><td>{{ detail.idCard }}</td>
              <th>血型</th><td>{{ detail.bloodType }}</td>
            </tr>
            <tr>
              <th>过敏史</th><td>{{ detail.allergyHistory }}</td>
              <th>慢性病史</th><td>{{ detail.chronicDisease }}</td>
            </tr>
            <tr>
              <th>当前症状</th><td colspan="3">{{ detail.currentSymptoms }}</td>
            </tr>
            <tr>
              <th>当前方案</th><td colspan="3">{{ detail.currentPlan }}</td>
            </tr>
            <tr>
              <th>下一步建议</th><td colspan="3">{{ detail.nextStep }}</td>
            </tr>
            <tr>
              <th>常住地址</th><td colspan="3">{{ detail.address }}</td>
            </tr>
            <tr>
              <th>紧急联系人</th><td>{{ detail.emergencyName }}</td>
              <th>紧急联系电话</th><td>{{ detail.emergencyPhone }}</td>
            </tr>
          </tbody>
        </table>
        <div class="actions">
          <el-button type="success" :loading="btnLoading" @click="onApprove">通过</el-button>
          <el-button type="danger" :loading="btnLoading" @click="onReject">驳回</el-button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
// 中文注释：患者认证审核详情页，接口驱动 + 审核操作（通过/驳回）
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchPatientAuthDetail } from '@/api/modules/patient'
import { approvePatientAuth } from '@/api/modules/authReview'
import type { PatientAuthenticationDTO } from '@/api/types/patientTypes'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')

/** 加载态与按钮态 */
const loading = ref(false)
const btnLoading = ref(false)

/** 详情数据 */
const detail = ref<PatientAuthenticationDTO | any>({})

// 中文注释：从路由携带的参数中取得可用的预填字段（作为接口字段的兜底，不在加载中渲染）
const prefill = ref<Record<string, any>>({
  // 患者姓名可能在列表里叫 name 或 realName
  name: (route.query.name as string) || (route.query.realName as string) || '',
  // 列表中的提交时间
  submitTime: (route.query.submitTime as string) || ''
})

// 中文注释：统一取值函数——优先读接口返回，若为空则读路由兜底；包含常见别名映射
const getVal = (key: string): any => {
  const d = detail.value as any
  // 别名映射
  const aliasMap: Record<string, string[]> = {
    name: ['name', 'realName'],
    submitTime: ['submitTime', 'createdAt', 'applyTime', 'submit_at']
  }
  const keys = [key, ...(aliasMap[key] || [])]
  // 1) 先尝试详情数据
  for (const k of keys) {
    const v = d?.[k]
    if (v !== undefined && v !== null && String(v) !== '') return v
  }
  // 2) 再尝试预填
  for (const k of keys) {
    const v = prefill.value?.[k]
    if (v !== undefined && v !== null && String(v) !== '') return v
  }
  return ''
}

/** 载入详情（最少 1 秒加载） */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const loadDetail = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const { data } = await fetchPatientAuthDetail(id)
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    detail.value = data || {}
  } catch (e) {
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    ElMessage.error('加载详情失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/** 通过 */
const onApprove = async () => {
  try {
    await ElMessageBox.confirm('确认通过该条患者认证申请？', '提示', { type: 'warning' })
  } catch { return }
  btnLoading.value = true
  try {
    await approvePatientAuth(id, 1)
    ElMessage.success('已通过')
    router.back()
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    btnLoading.value = false
  }
}

/** 驳回 */
const onReject = async () => {
  try {
    await ElMessageBox.confirm('确认驳回该患者认证申请？', '提示', { type: 'warning' })
  } catch { return }
  btnLoading.value = true
  try {
    await approvePatientAuth(id, 0)
    ElMessage.success('已驳回')
    router.back()
  } catch {
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    btnLoading.value = false
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.page { padding: 16px; }
.desc { color: #666; margin-bottom: 12px; }
.card { border: 1px solid #e5e5e5; border-radius: 6px; padding: 16px; min-height: 280px; position: relative; }
.row { margin-bottom: 10px; }
.label { width: 120px; display: inline-block; color: #333; }
.actions { margin-top: 16px; display: flex; gap: 10px; }
.detail-table { width: 100%; border-collapse: collapse; background: #fff; margin-top: 4px; }
.detail-table th, .detail-table td { border: 1px solid #e5e5e5; padding: 10px 12px; text-align: left; vertical-align: top; }
.detail-table th { width: 140px; background: #f8f8f8; color: #333; }
.btn { padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.primary { background: #67c23a; color: #fff; border: 1px solid #67c23a; }
.danger { background: #f56c6c; color: #fff; border: 1px solid #f56c6c; }
</style>