import type { Lang } from "./useLang";

const translations = {
  zh: {
    langToggle: "English",

    // Sidebar
    sidebarTitle: "商家管理中心",
    navDashboard: "工作台",
    navBookings: "预约管理",
    navCheckin: "扫码 Check-in",
    navServices: "维修服务",
    navProducts: "商品管理",
    navReviews: "用户评价",
    navSettings: "门店设置",
    logout: "退出登录",

    // Login
    loginTitle: "商家管理中心",
    loginQuick: "一键登录（测试用）",
    loginEmail: "邮箱",
    loginPassword: "密码",
    loginBtn: "登录",
    loginLoading: "登录中...",
    loginError: "登录失败，请检查账号密码",

    // Bookings - Status labels
    statusPending: "待确认",
    statusConfirmed: "已确认",
    statusInProgress: "进行中",
    statusCompleted: "已完成",
    statusCancelled: "已取消",

    // Bookings - Date filters
    filterToday: "今天",
    filterWeek: "本周",
    filterCustom: "自定义",
    filterAll: "全部",

    // Bookings - Actions
    actionAccept: "接受",
    actionReject: "拒绝",
    actionComplete: "完成维修",
    actionCancel: "取消",

    // Bookings - Table headers
    colApptTime: "预约时间",
    colQuoted: "报价",
    colStatus: "状态",

    // Bookings - Detail labels
    detailOrderNo: "订单号",
    detailCategory: "品类",
    detailCustomer: "用户姓名",
    detailDevice: "设备型号",
    detailPhone: "联系电话",
    detailRepairType: "维修项目",
    detailApptTime: "预约时间",
    detailQuoted: "报价金额",
    detailActual: "实收金额",
    detailEmail: "邮箱",
    detailNotes: "备注",
    detailCancelReason: "取消原因",
    detailCreated: "创建时间",

    // Bookings - Pagination
    prevPage: "上一页",
    nextPage: "下一页",

    // Bookings - Page level
    bookingsPageTitle: "预约管理",
    bookingsDesc: "管理用户预约和维修订单",
    loadingText: "加载中...",
    noBookingsInTab: (statusLabel: string) => `暂无${statusLabel}预约`,
    noBookingsDesc: "此时间段内没有符合条件的预约记录",
    totalCount: (n: number) => `共 ${n} 条`,
    processingText: "处理中...",
    errorRejectRequired: "请填写拒绝原因",
    errorInvalidAmount: "请输入有效金额",
    errorActionFailed: "操作失败",

    // Bookings - Reject modal
    rejectTitle: "拒绝预约",
    rejectDesc: "请填写拒绝原因，将通知给用户。",
    rejectPlaceholder: "例如：该时间段已满档，建议改约...",
    rejectReason: "拒绝原因（可选）",
    rejectConfirm: "确认拒绝",
    rejectCancel: "取消",

    // Bookings - Complete modal
    completeTitle: "完成维修",
    completeDesc: "请输入实际收取的维修费用（€）。",
    completeActualPrice: "实际收费（€）",
    completeConfirm: "确认完成",
    completeCancel: "取消",

    // Bookings - Date format
    fmtDate: (date: Date) => {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${month}月${day}日 ${hh}:${mm}`;
    },

    // Dashboard
    welcomeBack: (name: string) => `欢迎回来，${name}`,
    dashboardTitle: "工作台总览",
    onboardingTitle: "入驻引导",
    onboardingProgress: (done: number, total: number) => `${done} / ${total} 已完成`,
    onboardingStep1: "配置门店信息",
    onboardingStep2: "设置营业时间",
    onboardingStep3: "添加维修服务",
    onboardingStep4: "选择销售商品",
    statToday: "今日预约",
    statPending: "待确认",
    statProducts: "上架商品",
    statServices: "开放服务",
    statUnitBooking: "单",
    statUnitProduct: "件",
    statUnitService: "项",
    recentBookings: "最近预约",
    viewAll: "查看全部",
    noBookings: "暂无预约记录",
    quickLinks: "快速入口",
    quickLinkManageServices: "管理维修服务",
    quickLinkProductCatalog: "选择销售商品",

    // Services
    serviceTableDevice: "设备 / 型号",
    serviceTableRepairType: "维修类型",
    serviceTableRefPrice: "参考价",
    serviceTableMyPrice: "我的价格",
    serviceTableStatus: "状态",
    serviceTableActions: "操作",
    serviceStatusActive: "开放",
    serviceStatusPaused: "暂停",
    serviceBtnPause: "暂停",
    serviceBtnResume: "恢复",
    serviceBtnRemove: "移除",
    serviceBtnAdd: "添加",
    serviceBtnAdded: "已添加",
    serviceBtnAdding: "添加中...",
    serviceAllTab: "全部",
    serviceDeleteConfirm: "确认移除该维修服务？",

    // Services - Modal table
    modalTableModel: "型号",
    modalTableRepairType: "维修类型",
    modalTableRefPrice: "参考价",
    modalTableMyPrice: "我的价格",

    // Settings
    settingsDays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    settingsTabInfo: "门店信息",
    settingsTabHours: "营业时间",
    settingsTabSecurity: "账号安全",
    settingsStoreName: "门店名称",
    settingsPhone: "联系电话",
    settingsAddress: "门店地址",
    settingsEircode: "Eircode",
    settingsDesc: "门店简介",
    settingsSave: "保存",
    settingsSaving: "保存中...",
    settingsSaved: "保存成功",
    settingsFailed: "保存失败",
    settingsNetworkError: "网络错误",
    settingsClosed: "休息",
    settingsCopyHours: "将周一时间复制到所有工作日",
    settingsSaveHours: "保存营业时间",
    settingsChangePassword: "修改密码",
    settingsNewPassword: "新密码",
    settingsConfirmPassword: "确认新密码",
    settingsChangePasswordBtn: "修改密码",

    // Change password page
    changePasswordTitle: "设置新密码",
    changePasswordNew: "新密码",
    changePasswordConfirm: "确认新密码",
    changePasswordSubmit: "保存并进入工作台",
    changePasswordSaving: "保存中...",
    changePasswordErrShort: "密码至少 8 位",
    changePasswordErrMismatch: "两次密码不一致",
    changePasswordErrFailed: "修改失败",
    changePasswordErrNetwork: "网络错误，请重试",
    changePasswordDesc: "首次登录需要修改初始密码。请设置一个至少 8 位的安全密码。",
    changePasswordNewPlaceholder: "至少 8 位",
    changePasswordConfirmPlaceholder: "再次输入新密码",

    // Settings - additional
    settingsDescPlaceholder: "介绍您的门店特色、技术优势、服务承诺等...",
    settingsDescNote: "（展示在消费者端，最多 500 字）",
    settingsCoordParsed: (lat: string, lng: string) => `坐标：${lat}, ${lng} — 已解析`,
    settingsPwdErrShort: "新密码至少 8 位",
    settingsPwdErrMismatch: "两次密码不一致",
    settingsPwdChanged: "密码已修改",
    settingsPwdErrFailed: "修改失败",
    settingsTabImages: "门店图片",
    settingsImgDesc: "上传门店图片，展示在消费者搜索结果和门店详情页（最多 6 张）",
    settingsImgUploaded: "图片上传成功",
    settingsImgDeleteConfirm: "确认删除该图片？",
    settingsImgDeleted: "图片已删除",
    settingsImgUploading: "上传中...",
    settingsImgAddBtn: "添加图片",
    settingsImgHint: "支持 JPG / PNG / WebP，单张不超过 5MB",
    settingsTabStripe: "支付设置",
    settingsStripeDesc: "配置您的 Stripe 账户密钥，用于接收在线支付。需要先注册 Stripe 账户。",
    settingsStripePublishable: "Publishable Key（公开密钥）",
    settingsStripeSecret: "Secret Key（私密密钥）",
    settingsStripeSecretNote: "仅输入，不显示已保存的值",
    settingsSaveStripe: "保存支付设置",
    settingsStripeSaved: "支付设置已保存",
    settingsStripeEnabled: "Stripe 已配置",
    settingsStripeNotEnabled: "尚未配置 Stripe",
    settingsStripeHint: "密钥可在 Stripe 控制台的 Developers → API Keys 中找到",

    // Services page
    servicesPageTitle: "维修服务",
    servicesPageDesc: "管理门店提供的维修服务和定价",
    servicesAddBtn: "+ 添加服务",
    servicesEmptyTitle: "还没有添加维修服务",
    servicesEmptyDesc: "点击右上角“添加服务”，选择您能提供的维修项目",
    servicesEmptyTabMsg: "该品类暂无维修服务，点击右上角“添加服务”来添加",
    modalAddTitle: "添加维修服务",
    modalSelectCat: "选择品类",
    modalSelectBrand: "选择品牌",
    modalSelectAllModels: "全部型号",
    modalClose: "关闭",
    modalSelectCatFirst: "请先选择设备品类",
    modalNoServices: "该条件下暂无维修服务",
    modalPricePlaceholder: "价格",
    errorInvalidPrice: "请输入有效价格",
  },
  en: {
    langToggle: "中文",

    // Sidebar
    sidebarTitle: "Merchant Center",
    navDashboard: "Dashboard",
    navBookings: "Bookings",
    navCheckin: "Scan Check-in",
    navServices: "Services",
    navProducts: "Products",
    navReviews: "Reviews",
    navSettings: "Settings",
    logout: "Log Out",

    // Login
    loginTitle: "Merchant Center",
    loginQuick: "Quick Login (Test)",
    loginEmail: "Email",
    loginPassword: "Password",
    loginBtn: "Log In",
    loginLoading: "Logging in...",
    loginError: "Login failed, please check your credentials",

    // Bookings - Status labels
    statusPending: "Pending",
    statusConfirmed: "Confirmed",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",

    // Bookings - Date filters
    filterToday: "Today",
    filterWeek: "This Week",
    filterCustom: "Custom",
    filterAll: "All",

    // Bookings - Actions
    actionAccept: "Accept",
    actionReject: "Reject",
    actionComplete: "Complete",
    actionCancel: "Cancel",

    // Bookings - Table headers
    colApptTime: "Appt. Time",
    colQuoted: "Quoted",
    colStatus: "Status",

    // Bookings - Detail labels
    detailOrderNo: "Order #",
    detailCategory: "Category",
    detailCustomer: "Customer",
    detailDevice: "Device",
    detailPhone: "Phone",
    detailRepairType: "Repair Type",
    detailApptTime: "Appt. Time",
    detailQuoted: "Quoted",
    detailActual: "Actual",
    detailEmail: "Email",
    detailNotes: "Notes",
    detailCancelReason: "Cancel Reason",
    detailCreated: "Created",

    // Bookings - Pagination
    prevPage: "Previous",
    nextPage: "Next",

    // Bookings - Page level
    bookingsPageTitle: "Bookings",
    bookingsDesc: "Manage bookings and repair orders",
    loadingText: "Loading...",
    noBookingsInTab: (statusLabel: string) => `No ${statusLabel} bookings`,
    noBookingsDesc: "No bookings found in this period",
    totalCount: (n: number) => `${n} total`,
    processingText: "Processing...",
    errorRejectRequired: "Please enter a reason",
    errorInvalidAmount: "Please enter a valid amount",
    errorActionFailed: "Action failed",

    // Bookings - Reject modal
    rejectTitle: "Reject Booking",
    rejectDesc: "Please provide a reason. The customer will be notified.",
    rejectPlaceholder: "e.g. Fully booked at this time, please rebook...",
    rejectReason: "Reason (optional)",
    rejectConfirm: "Confirm Reject",
    rejectCancel: "Cancel",

    // Bookings - Complete modal
    completeTitle: "Complete Repair",
    completeDesc: "Enter the actual repair charge (€).",
    completeActualPrice: "Actual charge (€)",
    completeConfirm: "Confirm Complete",
    completeCancel: "Cancel",

    // Bookings - Date format
    fmtDate: (date: Date) => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${months[date.getMonth()]} ${date.getDate()} ${hh}:${mm}`;
    },

    // Dashboard
    welcomeBack: (name: string) => `Welcome back, ${name}`,
    dashboardTitle: "Dashboard Overview",
    onboardingTitle: "Onboarding Guide",
    onboardingProgress: (done: number, total: number) => `${done} / ${total} completed`,
    onboardingStep1: "Set Up Store Info",
    onboardingStep2: "Set Opening Hours",
    onboardingStep3: "Add Repair Services",
    onboardingStep4: "Select Products",
    statToday: "Today's Bookings",
    statPending: "Pending",
    statProducts: "Products",
    statServices: "Services",
    statUnitBooking: "",
    statUnitProduct: "",
    statUnitService: "",
    recentBookings: "Recent Bookings",
    viewAll: "View All",
    noBookings: "No bookings yet",
    quickLinks: "Quick Links",
    quickLinkManageServices: "Manage Services",
    quickLinkProductCatalog: "Product Catalog",

    // Services
    serviceTableDevice: "Device / Model",
    serviceTableRepairType: "Repair Type",
    serviceTableRefPrice: "Reference Price",
    serviceTableMyPrice: "My Price",
    serviceTableStatus: "Status",
    serviceTableActions: "Actions",
    serviceStatusActive: "Active",
    serviceStatusPaused: "Paused",
    serviceBtnPause: "Pause",
    serviceBtnResume: "Resume",
    serviceBtnRemove: "Remove",
    serviceBtnAdd: "Add",
    serviceBtnAdded: "Added",
    serviceBtnAdding: "Adding...",
    serviceAllTab: "All",
    serviceDeleteConfirm: "Remove this repair service?",

    // Services - Modal table
    modalTableModel: "Model",
    modalTableRepairType: "Repair Type",
    modalTableRefPrice: "Ref. Price",
    modalTableMyPrice: "My Price",

    // Settings
    settingsDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    settingsTabInfo: "Store Info",
    settingsTabHours: "Hours",
    settingsTabSecurity: "Security",
    settingsStoreName: "Store Name",
    settingsPhone: "Phone",
    settingsAddress: "Address",
    settingsEircode: "Eircode",
    settingsDesc: "Description",
    settingsSave: "Save",
    settingsSaving: "Saving...",
    settingsSaved: "Saved",
    settingsFailed: "Failed",
    settingsNetworkError: "Network error",
    settingsClosed: "Closed",
    settingsCopyHours: "Copy Monday hours to all weekdays",
    settingsSaveHours: "Save Hours",
    settingsChangePassword: "Change Password",
    settingsNewPassword: "New Password",
    settingsConfirmPassword: "Confirm Password",
    settingsChangePasswordBtn: "Change Password",

    // Change password page
    changePasswordTitle: "Set New Password",
    changePasswordNew: "New Password",
    changePasswordConfirm: "Confirm Password",
    changePasswordSubmit: "Save & Enter Dashboard",
    changePasswordSaving: "Saving...",
    changePasswordErrShort: "Password must be at least 8 characters",
    changePasswordErrMismatch: "Passwords do not match",
    changePasswordErrFailed: "Failed",
    changePasswordErrNetwork: "Network error, please retry",
    changePasswordDesc: "First login requires changing your initial password. Please set a secure password of at least 8 characters.",
    changePasswordNewPlaceholder: "At least 8 characters",
    changePasswordConfirmPlaceholder: "Re-enter new password",

    // Settings - additional
    settingsDescPlaceholder: "Describe your shop features, expertise, service commitment...",
    settingsDescNote: "(Shown to customers, max 500 characters)",
    settingsCoordParsed: (lat: string, lng: string) => `Coords: ${lat}, ${lng} — parsed`,
    settingsPwdErrShort: "New password must be at least 8 characters",
    settingsPwdErrMismatch: "Passwords do not match",
    settingsPwdChanged: "Password changed",
    settingsPwdErrFailed: "Failed",
    settingsTabImages: "Store Photos",
    settingsImgDesc: "Upload store photos shown in search results and store detail pages (max 6)",
    settingsImgUploaded: "Photo uploaded",
    settingsImgDeleteConfirm: "Delete this photo?",
    settingsImgDeleted: "Photo deleted",
    settingsImgUploading: "Uploading...",
    settingsImgAddBtn: "Add Photo",
    settingsImgHint: "JPG / PNG / WebP, max 5MB each",
    settingsTabStripe: "Payments",
    settingsStripeDesc: "Configure your Stripe account keys to accept online payments. You need a Stripe account first.",
    settingsStripePublishable: "Publishable Key",
    settingsStripeSecret: "Secret Key",
    settingsStripeSecretNote: "Input only — saved value is not shown",
    settingsSaveStripe: "Save Payment Settings",
    settingsStripeSaved: "Payment settings saved",
    settingsStripeEnabled: "Stripe configured",
    settingsStripeNotEnabled: "Stripe not configured",
    settingsStripeHint: "Find your keys in the Stripe Dashboard under Developers → API Keys",

    // Services page
    servicesPageTitle: "Repair Services",
    servicesPageDesc: "Manage your shop's repair services and pricing",
    servicesAddBtn: "+ Add Service",
    servicesEmptyTitle: "No repair services yet",
    servicesEmptyDesc: "Click \"Add Service\" in the top right to add repair types you offer",
    servicesEmptyTabMsg: "No services in this category. Click \"Add Service\" to add some.",
    modalAddTitle: "Add Repair Service",
    modalSelectCat: "Select Category",
    modalSelectBrand: "Select Brand",
    modalSelectAllModels: "All Models",
    modalClose: "Close",
    modalSelectCatFirst: "Please select a device category first",
    modalNoServices: "No repair services found",
    modalPricePlaceholder: "Price",
    errorInvalidPrice: "Please enter a valid price",
  },
} as const;

export function useMerchantT(lang: Lang) {
  return translations[lang];
}

export type MerchantT = (typeof translations)["zh"];
