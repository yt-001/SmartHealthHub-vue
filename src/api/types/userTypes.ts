/**
 * 登录请求类型（HttpOnly Cookie 会话，前端不再返回 accessToken）
 * - LoginPayload：后端要求 @RequestParam/@RequestBody 的字段
 */
export interface LoginPayload {
  /** 账号 (手机号或邮箱) */
  account: string
  /** 密码 */
  password: string
  /** 角色（可选）：管理员=0，医生=1，用户=2 */
  role?: number
}