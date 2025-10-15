/* 全局类型定义（中文注释）
 * 后端返回的用户信息字段（严格使用当前字段，不做兼容）：
 * id, username, phone, email, realName, gender, role, birthDate, avatarUrl
 */
export interface UserInfo {
  id: number                  // 用户ID
  username: string            // 用户名
  phone: string               // 手机号
  email: string               // 邮箱
  realName: string            // 真实姓名
  gender: string              // 性别（'M'/'F' 或 '男'/'女'）
  role: number | string       // 角色（0/'admin'、1/'doctor' 等）
  birthDate: string           // 生日（字符串日期）
  avatarUrl: string | null    // 头像地址
}