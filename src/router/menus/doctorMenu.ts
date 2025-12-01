// 医生端导航菜单配置（用于动态读取导航栏）
// 中文注释，类型与结构清晰，可直接在布局组件中使用
// 图标已切换为 Element Plus 组件名，便于直接渲染

// 菜单项类型定义
export interface MenuItem {
  // 菜单标题（展示给用户）
  title: string;
  // 路由路径（需与实际 router 配置的 path 对应）
  path?: string;
  // 图标组件名（Element Plus 图标，如 User、Calendar 等）
  icon?: string;
  // 子菜单（用于分组与层级导航）
  children?: MenuItem[];
  // 角色要求（可选：如果某项仅对特定角色显示）
  roles?: string[];
  // 其他自定义字段（例如：badge、权限点、是否外链等）
  [key: string]: any;
}

// 医生端菜单：按照“模块 -> 子功能”组织
const doctorMenu: MenuItem[] = [
  {
    title: "患者管理",
    icon: "User",
    children: [
      { title: "患者列表", path: "/portal/doctor/patient-list", icon: "List" },
      { title: "电子病历", path: "/portal/doctor/emr", icon: "Document" },
      { title: "就诊记录", path: "/portal/doctor/visit-records", icon: "Notebook" },
      { title: "历史诊疗查询", path: "/portal/doctor/history-search", icon: "Clock" },
    ],
  },
  {
    title: "诊疗功能",
    icon: "FirstAidKit",
    children: [
      { title: "电子处方", path: "/portal/doctor/e-prescription", icon: "Edit" },
      { title: "检查/检验申请", path: "/portal/doctor/exam-apply", icon: "DocumentAdd" },
      { title: "诊断记录", path: "/portal/doctor/diagnosis", icon: "Notebook" },
      {
        title: "医嘱管理",
        path: "/portal/doctor/medical-orders",
        icon: "List",
      },
    ],
  },
  {
    title: "预约与排班",
    icon: "Calendar",
    children: [
      { title: "患者挂号信息", path: "/portal/doctor/registration", icon: "Notebook" },
      { title: "预约审核", path: "/portal/doctor/appointment-review", icon: "CircleCheck" },
      { title: "医生排班查看", path: "/portal/schedule", icon: "Calendar" },
    ],
  },
  {
    title: "数据与统计",
    icon: "DataAnalysis",
    children: [
      { title: "患者数据统计", path: "/portal/doctor/statistics", icon: "DataAnalysis" },
    ],
  },
  {
    title: "我的发布",
    icon: "EditPen",
    children: [
      { title: "发布文章", path: "/portal/doctor/article-publish", icon: "DocumentAdd" },
      { title: "发布视频", path: "/portal/doctor/video-publish", icon: "VideoCamera" },
      { title: "我的文章", path: "/portal/doctor/my-articles", icon: "Document" },
      { title: "我的视频", path: "/portal/doctor/my-videos", icon: "VideoCamera" },
    ],
  },
  {
    title: "个人中心",
    icon: "UserFilled",
    children: [
      { title: "医生个人信息", path: "/portal/doctor/profile", icon: "User" },
      { title: "账户设置", path: "/portal/doctor/account", icon: "Setting" },
      { title: "密码修改", path: "/portal/doctor/change-password", icon: "Lock" },
    ],
  },
];

// 默认导出：医生端菜单
export default doctorMenu;

// 也导出类型，便于其他模块复用
export type { MenuItem as DoctorMenuItem };
