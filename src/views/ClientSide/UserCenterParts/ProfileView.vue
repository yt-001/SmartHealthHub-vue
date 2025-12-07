<template>
  <div class="profile-view">
    <div class="section-header">
      <h3 class="title">基本信息</h3>
      <p class="subtitle">查看您的个人账户信息</p>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <span class="label">姓名</span>
        <span class="value">{{ store.userInfo?.realName || '未设置' }}</span>
      </div>
      <div class="info-item">
        <span class="label">手机号</span>
        <span class="value">{{ store.userInfo?.phone || '未绑定' }}</span>
      </div>
      <div class="info-item">
        <span class="label">邮箱</span>
        <span class="value">{{ store.userInfo?.email || '未绑定' }}</span>
      </div>
      <div class="info-item">
        <span class="label">账号角色</span>
        <span class="value">
          <el-tag :type="roleTagType" effect="plain" round>
            {{ roleText }}
          </el-tag>
        </span>
      </div>
      <div class="info-item full-width">
        <span class="label">账号ID</span>
        <span class="value mono">{{ store.userInfo?.id || '-' }}</span>
      </div>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" plain round @click="openEditDialog">编辑基本信息</el-button>
    </div>

    <!-- 编辑信息弹窗 -->
    <el-dialog
      v-model="editVisible"
      title="编辑基本信息"
      width="500px"
      append-to-body
      destroy-on-close
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="真实姓名">
          <el-input v-model="editForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="editForm.phone" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="editForm.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
            v-model="editForm.birthDate"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit">保存修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { updateProfile } from '@/api/modules/user'

const store = useUserStore()

// 编辑弹窗状态
const editVisible = ref(false)
const editForm = reactive({
  realName: '',
  phone: '',
  email: '',
  gender: '男',
  birthDate: ''
})

/** 获取角色文案 */
const roleText = computed(() => {
  const info = store.userInfo
  if (!info) return '未知角色'
  const r = info.role
  if (r === 0 || r === 'admin') return '管理员'
  if (r === 1 || r === 'doctor') return '医生'
  if (r === 2 || r === 'user') return '普通用户'
  return '未知角色'
})

/** 角色标签颜色 */
const roleTagType = computed(() => {
  const info = store.userInfo
  if (!info) return 'info'
  const r = info.role
  if (r === 0 || r === 'admin') return 'danger'
  if (r === 1 || r === 'doctor') return 'success'
  return 'primary'
})

/**
 * 打开编辑弹窗
 * 从 Store 回显用户信息，并将性别代码映射为中文
 */
function openEditDialog() {
  const info = store.userInfo
  if (!info) {
    ElMessage.warning('用户信息未加载，请稍后重试')
    return
  }
  
  editForm.realName = info.realName || ''
  editForm.phone = info.phone || ''
  editForm.email = info.email || ''
  /** 将性别代码映射为中文：M->男 F->女 O->其他 */
  if (info.gender === 'F' || info.gender === '女') {
    editForm.gender = '女'
  } else if (info.gender === 'M' || info.gender === '男') {
    editForm.gender = '男'
  } else {
    editForm.gender = '其他'
  }
  editForm.birthDate = info.birthDate || ''
  editVisible.value = true
}

/**
 * 提交编辑
 * 将中文性别映射为后端要求的代码 M/F/O 并提交
 */
async function submitEdit() {
  try {
    // 构造提交数据
    if (!store.userInfo?.id) {
      throw new Error('User ID is missing')
    }
    
    // 性别映射：中文 -> 代码
    const genderCode = editForm.gender === '男' ? 'M' : (editForm.gender === '女' ? 'F' : 'O')

    const payload = {
      id: store.userInfo.id,
      realName: editForm.realName,
      phone: editForm.phone,
      email: editForm.email,
      gender: genderCode,
      birthDate: editForm.birthDate
    }
    
    // 调用接口（这里假设 updateProfile 存在并可用）
    await updateProfile(payload)
    
    // 更新本地 Store（保持与后端一致：写入性别代码）
    store.updateUserInfo({
      realName: editForm.realName,
      phone: editForm.phone,
      email: editForm.email,
      gender: genderCode,
      birthDate: editForm.birthDate
    })
    
    ElMessage.success('基本信息更新成功')
    editVisible.value = false
  } catch (error) {
    console.error('Update profile failed:', error)
    ElMessage.error('更新失败，请稍后重试')
  }
}
</script>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-header .title {
  font-size: 22px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.section-header .subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: #f9fafc;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.info-item:hover {
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #dcdfe6;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.label {
  font-size: 13px;
  color: #909399;
}

.value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  min-height: 24px;
}

.value.mono {
  font-family: 'Roboto Mono', monospace;
  color: #606266;
}

.action-bar {
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}
</style>
