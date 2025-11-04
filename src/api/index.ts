// API 接口统一管理（中文注释）
import * as user from './modules/user'
import * as health from './modules/health'
import * as doctor from './modules/doctor'
import * as medicalRecord from './modules/medicalRecord'
import * as video from './modules/video'

export const userApi = {
  ...user
}

export const healthApi = {
  ...health
}

export const doctorApi = {
  ...doctor
}

export const medicalRecordApi = {
  ...medicalRecord
}

export const videoApi = {
  ...video
}