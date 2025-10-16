<template>
  <!-- 通用个人中心（管理员/医生共用，中文注释） -->
  <div class="profile-page">
    <!-- 顶部横幅：纯展示背景图 + 渐变遮罩 -->
    <el-card class="header-card" shadow="never">
      <div class="header-hero">
        <div class="hero-bg" :style="{ backgroundImage: `url(${bgUrl})` }"></div>
        <div class="hero-mask"></div>
      </div>

      <!-- 头像 + 基本信息行：位于横幅下方 -->
      <div class="header-main">
        <div class="header-left">
          <el-avatar :size="90" :src="user.avatarUrl || ''">
            {{ (user.realName || user.username || '?').slice(0,1) }}
          </el-avatar>
          <div class="header-meta">
            <div class="name-line">
              <span class="real-name">{{ user.realName || '-' }}</span>
              <el-tag type="primary" round class="role-tag">{{ roleText(user.role) }}</el-tag>
            </div>
            <div class="sub-line">
              <el-icon><User /></el-icon>
              <span class="sub-item">{{ user.username || '-' }}</span>
              <el-divider direction="vertical" />
              <el-icon><Iphone /></el-icon>
              <span class="sub-item">{{ user.phone || '-' }}</span>
              <el-divider direction="vertical" />
              <el-icon><Message /></el-icon>
              <span class="sub-item">{{ user.email || '-' }}</span>
            </div>
          </div>
        </div>
        <!-- 右侧上下按钮 -->
        <div class="header-actions-right">
          <el-button type="primary" plain @click="onEdit">
            <el-icon style="margin-right:6px;"><Edit /></el-icon>修改信息
          </el-button>
          <el-button type="danger" @click="onLogout">
            <el-icon style="margin-right:6px;"><SwitchButton /></el-icon>退出登录
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 基本信息 -->
    <el-card class="detail-card" shadow="never">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>基本信息</span>
      </div>
      <el-descriptions
        :column="isNarrow ? 1 : 2"
        border
        :label-style="{ width: '140px', fontSize: '14px' }"
        :content-style="{ fontSize: '14px' }"
      >
        <el-descriptions-item label="用户ID">{{ user.id ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录账号">{{ user.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ user.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderText(user.gender) }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ user.birthDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ roleText(user.role) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 医生档案信息（仅医生可见，本地请求） -->
    <el-card
      v-if="isDoctor"
      class="detail-card"
      shadow="never"
      v-loading="doctorLoading"
      element-loading-text="加载医生档案..."
    >
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>医生档案信息</span>
      </div>
      <el-descriptions
        :column="isNarrow ? 1 : 2"
        border
        :label-style="{ width: '140px', fontSize: '14px' }"
        :content-style="{ fontSize: '14px' }"
      >
        <el-descriptions-item label="科室ID">{{ doctorProfile?.deptId ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="职称">{{ doctorProfile?.title ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="擅长领域">{{ doctorProfile?.specialty ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="执业证书编号">{{ doctorProfile?.qualificationNo ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="工作班次">{{ doctorProfile?.workShift ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="诊室编号">{{ doctorProfile?.officeRoom ?? '-' }}</el-descriptions-item>
        <el-descriptions-item :span="isNarrow ? 1 : 2" label="个人简介">{{ doctorProfile?.bio ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="认证起始日期">{{ doctorProfile?.createTime ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ doctorProfile?.updateTime ?? '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 编辑信息弹窗 -->
    <el-dialog v-model="editVisible" title="修改个人信息" width="560px">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="100px">
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="生日" prop="birthDate">
          <el-date-picker
            v-model="editForm.birthDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择生日"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-select v-model="editForm.gender" placeholder="请选择性别">
            <el-option label="男" value="男" />
            <el-option label="女" value="女" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="onEditConfirm">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/* 通用个人中心：展示 UserInfo 的所有字段，中文注释 */
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import { User, Iphone, Message, Document, Edit, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/typings'
import { useRouter } from 'vue-router'
import { ElLoading, ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { logout as apiLogout, updateProfile as apiUpdateProfile } from '@/api/modules/user'
import { getDoctorProfile } from '@/api/modules/doctor'
import type { DoctorProfilesVO } from '@/api/types/doctorTypes'
/* 显式引入背景图（Vite 资源处理） */
import bgUrl from '@/assets/PersonalHome-Page.png'

/** 读取用户信息（从用户仓库） */
const store = useUserStore()
const user = computed<UserInfo>(() => (store.userInfo || ({} as any)) as UserInfo)
const router = useRouter()

/** 是否医生，仅医生展示医生档案卡片并触发请求 */
const isDoctor = computed(() => {
  const r = user.value?.role
  return r === 1 || r === 'doctor'
})

/** 响应式列数（窄屏 1 列，常规 2 列） */
const isNarrow = ref(false)
const updateNarrow = () => {
  isNarrow.value = window.innerWidth < 900
}

/** 医生档案本地状态（不使用 Pinia） */
const doctorLoading = ref(false)
const doctorProfile = ref<DoctorProfilesVO | null>(null)

onMounted(async () => {
  updateNarrow()
  window.addEventListener('resize', updateNarrow)

  // 医生进入页面自动获取医生档案
  if (isDoctor.value) {
    try {
      const rawId = (user.value as any)?.id
      const uidNum = typeof rawId === 'string' ? Number(rawId) : rawId
      if (!uidNum || Number.isNaN(uidNum)) {
        console.warn('当前用户ID无效，无法获取医生档案：', rawId)
      } else {
        doctorLoading.value = true
        const res = await getDoctorProfile(uidNum)
        // 假设返回结构 { code, data }
        doctorProfile.value = (res as any)?.data ?? null
      }
    } catch (e) {
      console.warn('获取医生档案失败：', e)
    } finally {
      doctorLoading.value = false
    }
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateNarrow)
})

/** 工具函数：性别与角色的可读文本 */
const genderText = (g: string | undefined) => {
  if (!g) return '-'
  const s = String(g).toUpperCase()
  if (s === 'M' || s === '男') return '男'
  if (s === 'F' || s === '女') return '女'
  return String(g)
}
const roleText = (r: number | string | undefined) => {
  if (r === 0 || r === 'admin') return '管理员'
  if (r === 1 || r === 'doctor') return '医生'
  if (r === 2 || r === 'user') return '用户'
  return String(r ?? '-')
}

/** 编辑弹窗：表单状态与校验 */
const editVisible = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = ref({
  realName: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: '' as string | undefined
})
const phoneReg = /^1[3-9]\d{9}$/
const editRules: FormRules = {
  realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { validator: (_r, v, cb) => (!v || phoneReg.test(v) ? cb() : cb(new Error('手机号格式不正确'))), trigger: 'blur' }
  ],
  email: [
    { validator: (_r, v, cb) => (!v || /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(v) ? cb() : cb(new Error('邮箱格式不正确'))), trigger: 'blur' }
  ],
  birthDate: [],
  gender: []
}

/** 打开编辑弹窗并回显 */
const onEdit = () => {
  const u = user.value || ({} as any)
  editForm.value = {
    realName: u.realName || '',
    phone: u.phone || '',
    email: u.email || '',
    birthDate: u.birthDate || '',
    gender: (u.gender === 'M' ? '男' : u.gender === 'F' ? '女' : (u.gender || '')) as any
  }
  editVisible.value = true
}

/** 保存：仅当有变更字段时才调用后端；无变更则提示不提交 */
const onEditConfirm = async () => {
  if (!editFormRef.value) return
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  // 将性别映射回存储格式（与后端保持一致，可根据实际调整）
  const mapGender = (g: string | undefined) => (g === '男' ? 'M' : g === '女' ? 'F' : g || '')

  // 生成仅包含变更字段的提交对象（始终包含 id）
  const oldInfo = user.value || ({} as any)
  const nextInfo = {
    realName: (editForm.value.realName || '').trim(),
    phone: (editForm.value.phone || '').trim(),
    email: (editForm.value.email || '').trim(),
    birthDate: editForm.value.birthDate || '',
    gender: mapGender(editForm.value.gender)
  }
  const payload: Record<string, any> = { id: oldInfo.id }
  ;(['realName', 'phone', 'email', 'birthDate', 'gender'] as const).forEach((key) => {
    const oldVal = String(oldInfo[key] ?? '')
    const newVal = String((nextInfo as any)[key] ?? '')
    if (newVal !== oldVal) payload[key] = (nextInfo as any)[key]
  })

  // 若没有任何变更（仅包含 id），则不发送请求
  if (Object.keys(payload).length <= 1) {
    ElMessage.info('未修改任何信息')
    return
  }

  // 调用后端更新接口（路径先占位），成功后合并更新本地用户信息
  try {
    await apiUpdateProfile(payload)
    ;(store as any).userInfo = { ...oldInfo, ...payload }
    editVisible.value = false
    ElMessage.success('保存成功')
  } catch (e) {
    console.warn('更新用户信息失败：', e)
    ElMessage.error('保存失败，请稍后重试')
  }
}

/** 退出登录：带确认 + 全屏加载 + 成功提示 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const onLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' })
  } catch {
    return
  }
  const loading = ElLoading.service({
    lock: true,
    text: '正在退出...',
    background: 'rgba(0, 0, 0, 0.3)'
  })
  try {
    try {
      await apiLogout()
    } catch (e) {
      console.warn('退出登录接口失败（忽略继续本地清理）：', e)
    }
    await sleep(1000)
    loading.close()
    ElMessage.success('退出登录成功')
    await sleep(800)
    store.clearUser()
    router.replace('/login')
  } catch {
    loading.close()
  }
}
</script>

<style scoped>
/* 页面容器：基础字号稍大、留白更足 */
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
  min-height: 100%;
  font-size: 14px;
}

/* 顶部卡片 */
.header-card {
  border: 1px solid var(--el-border-color-lighter);
  overflow: hidden; /* 保证圆角裁切背景图 */
}
.header-card :deep(.el-card__body) {
  padding: 0;
}

/* 顶部横幅（只展示背景图） */
.header-hero {
  position: relative;
  height: 160px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: saturate(110%);
}
.hero-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.06));
  pointer-events: none;
}

/* 头像 + 基本信息行（在横幅下方，不叠加） */
.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px 16px;
  background: var(--el-bg-color);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.name-line {
  display: flex;
  align-items: center;
  gap: 10px;
}
.real-name {
  font-size: 24px; /* 放大主标题字号 */
  font-weight: 800;
  color: var(--el-text-color-primary);
  text-shadow: 0 1px 2px rgb(0 0 0 / 6%);
}
.role-tag {
  transform: translateY(-1px);
}
.sub-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-regular);
  font-size: 13px;
}
.sub-item {
  line-height: 1;
}

/* 右侧按钮容器（上下结构） */
.header-actions-right {
  margin-left: auto;  /* 将按钮组推到右侧 */
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

/* 卡片统一样式 */
.detail-card {
  border: 1px solid var(--el-border-color-lighter);
}
.detail-card :deep(.el-card__body) {
  padding: 16px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 16px;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}

/* 响应式：窄屏优化 */
@media (max-width: 900px) {
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>