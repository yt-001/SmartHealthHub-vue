<template>
  <div class="page">
    <h2>医生认证详情</h2>
    <p class="desc">展示单条医生认证申请的详细信息，管理员可进行通过/驳回操作。</p>

    <div class="card" v-loading="loading" element-loading-text="加载中..." element-loading-background="rgba(0,0,0,0.2)">
      <template v-if="!loading">
        <table class="detail-table">
          <tbody>
            <tr><th>申请编号</th><td colspan="3">{{ id }}</td></tr>
            <tr>
              <th>医生姓名</th><td>{{ detail.realName }}</td>
              <th>提交时间</th><td>{{ detail.createdAt }}</td>
            </tr>
            <tr>
              <th>职称</th><td>{{ detail.title }}</td>
              <th>执业证书编号</th><td>{{ detail.qualificationNo }}</td>
            </tr>
            <tr>
              <th>科室ID</th><td>{{ detail.deptId }}</td>
              <th>诊室编号</th><td>{{ detail.officeRoom }}</td>
            </tr>
            <tr>
              <th>擅长领域</th><td colspan="3">{{ detail.specialty }}</td>
            </tr>
            <tr>
              <th>个人简介</th><td colspan="3">{{ detail.bio }}</td>
            </tr>
            <tr>
              <th>工作班次</th><td colspan="3">{{ detail.workShift }}</td>
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
// 中文注释：医生认证审核详情页，接口驱动 + 审核操作（通过/驳回）
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { approveDoctorAuth } from '@/api/modules/authReview'
import { getDoctorProfile } from '@/api/modules/doctor'
import type { DoctorProfilesVO } from '@/api/types/doctorTypes'

const route = useRoute()
const router = useRouter()
const id = String(route.params.id || '')

/** 加载态与按钮态 */
const loading = ref(false)
const btnLoading = ref(false)

/** 详情数据 */
const detail = ref<DoctorProfilesVO | any>({})

/** 载入详情（最少 1 秒加载） */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
const loadDetail = async () => {
  loading.value = true
  const start = Date.now()
  try {
    const { data } = await getDoctorProfile(Number(id))
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    detail.value = data || {}
    // 中文注释：如接口未返回姓名/提交时间，用列表页 query 兜底
    if (!detail.value.realName && route.query.realName) detail.value.realName = String(route.query.realName)
    if (!detail.value.createdAt && route.query.createdAt) detail.value.createdAt = String(route.query.createdAt)
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
    await ElMessageBox.confirm('确认通过该条医生认证申请？', '提示', { type: 'warning' })
  } catch { return }
  btnLoading.value = true
  try {
    await approveDoctorAuth(id, 1)
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
    await ElMessageBox.confirm('确认驳回该医生认证申请？', '提示', { type: 'warning' })
  } catch { return }
  btnLoading.value = true
  try {
    await approveDoctorAuth(id, 0)
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
.detail-table { width: 100%; border-collapse: collapse; background: #fff; margin-top: 8px; }
.detail-table th, .detail-table td { border: 1px solid #e5e5e5; padding: 10px 12px; text-align: left; vertical-align: top; }
.detail-table th { width: 140px; background: #f8f8f8; color: #333; white-space: nowrap; }
.btn { padding: 6px 12px; border-radius: 4px; cursor: pointer; }
.primary { background: #67c23a; color: #fff; border: 1px solid #67c23a; }
.danger { background: #f56c6c; color: #fff; border: 1px solid #f56c6c; }
</style>