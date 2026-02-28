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
    title: "药品管理",
    icon: "Collection",
    children: [
      { title: "药品信息管理", path: "/portal/admin/medicine-manage", icon: "CollectionTag" },
      { title: "处方管理", path: "/portal/admin/prescription-manage", icon: "Document" },
      { title: "药品订单管理", path: "/portal/admin/order-manage", icon: "ShoppingCart" },
      { title: "药品分类管理", path: "/portal/admin/medicine-category-manage", icon: "Collection" },
      { title: "分类关联管理", path: "/portal/admin/medicine-category-relation-manage", icon: "Link" },
      { title: "药品标签管理", path: "/portal/admin/medicine-tag-manage", icon: "PriceTag" },
      { title: "推荐级别管理", path: "/portal/admin/medicine-recommendation-level-manage", icon: "Star" },
    ],
  },
  {
    title: "文章管理",
    icon: "Document",
    children: [
      { title: "文章列表", path: "/portal/admin/article-list", icon: "Document" },
      { title: "文章分类管理", path: "/portal/admin/article-category-manage", icon: "CollectionTag" },
    ],
  },
  {
    title: "视频管理",
    icon: "VideoCamera",
    children: [
      { title: "视频列表", path: "/portal/admin/video-list", icon: "VideoCamera" },
      { title: "视频分类管理", path: "/portal/admin/video-category-manage", icon: "CollectionTag" },
    ],
  },
  {
    title: "科室/排班",
    icon: "Calendar",
    children: [
      { title: "医生排班", path: "/portal/schedule", icon: "Calendar" },
    ],
  },
];

export default adminMenu;
export type { MenuItem as AdminMenuItem };
