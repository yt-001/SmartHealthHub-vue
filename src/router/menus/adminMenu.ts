// 管理员端导航菜单配置（用于动态读取导航栏）
// 中文注释：图标统一为 Element Plus 组件名，便于直接渲染

export interface MenuItem {
  title: string;
  path?: string;
  icon?: string; // Element Plus 图标组件名
  children?: MenuItem[];
  roles?: string[];
  [key: string]: any;
}

const adminMenu: MenuItem[] = [
  {
    title: "数据管理",
    icon: "DataBoard",
    children: [
      { title: "仪表盘", path: "/portal/admin/dashboard", icon: "DataBoard" },
      { title: "医院情况", path: "/portal/admin/hospital-overview", icon: "OfficeBuilding" },
    ],
  },
  {
    title: "系统管理",
    icon: "Setting",
    children: [
      { title: "医生管理", path: "/portal/admin/doctor-manage", icon: "User" },
      { title: "患者管理", path: "/portal/admin/patient-manage", icon: "UserFilled" },
      { title: "用户管理", path: "/portal/admin/user-manage", icon: "User" },
      { title: "病例档案管理", path: "/portal/admin/case-archive-manage", icon: "Document" },
      { title: "首页图片管理", path: "/portal/admin/carousel-items", icon: "Picture" },
    ],
  },
  {
    title: "审核",
    icon: "CircleCheck",
    children: [
      { title: "医生认证审核", path: "/portal/admin/doctor-cert-review", icon: "CircleCheck" },
      { title: "患者认证审核", path: "/portal/admin/patient-cert-review", icon: "CircleCheck" },
      { title: "审核视频", path: "/portal/admin/video-review", icon: "CircleCheck" },
      { title: "审核文章", path: "/portal/admin/article-review", icon: "DocumentChecked" }
    ],
  },
  {
    title: "系统字典",
    icon: "Collection",
    children: [
      { title: "药品目录", path: "/portal/admin/drug-catalog", icon: "CollectionTag" },
      { title: "收费项", path: "/portal/admin/charge-items", icon: "PriceTag" },
      { title: "诊断编码", path: "/portal/admin/diagnosis-codes", icon: "Document" },
      { title: "检查项目", path: "/portal/admin/exam-items", icon: "List" },
      { title: "价格变动审批", path: "/portal/admin/price-change-approval", icon: "CircleCheck" },
    ],
  },
  {
    title: "科室/排班",
    icon: "Calendar",
    children: [
      { title: "科室维护", path: "/portal/admin/department-maintain", icon: "OfficeBuilding" },
      { title: "医生排班", path: "/portal/schedule", icon: "Calendar" },
      { title: "节假日排班", path: "/portal/admin/holiday-schedule", icon: "Calendar" },
      { title: "门诊号源预览", path: "/portal/admin/outpatient-slots-preview", icon: "View" },
    ],
  },
];

export default adminMenu;
export type { MenuItem as AdminMenuItem };