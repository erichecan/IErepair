import type { Lang } from "./useLang";

const translations = {
  en: {
    // Header nav
    navRepair: "Repair Services",
    navAccessories: "Accessories",
    navFindStore: "Find a Store",
    navMembership: "Membership",
    navBookRepair: "Book Repair",
    langToggle: "中文",

    // Hero
    heroBadge: "Trusted by 10,000+ customers across Ireland",
    heroHeading1: "Fast, Reliable",
    heroHeading2: "Phone Repair",
    heroHeading3: "Near You in Ireland",
    heroSub: "Compare local repair shops, book instantly, get your phone fixed today.",
    heroKeywordPlaceholder: "e.g. Screen repair, iPhone battery…",
    heroEircodePlaceholder: "Eircode",
    heroSearchBtn: "Find Repair",
    heroPopular: "Popular:",
    heroTags: ["Screen Replacement", "Battery Replacement", "Charging Port"],

    // Footer
    footerDesc:
      "Ireland's leading platform for phone repair services and accessories. Find trusted local repair shops near you.",
    footerServices: "Services",
    footerAccessories: "Accessories",
    footerCompany: "Company",
    footerLegal: "© 2025 IERepair. All rights reserved.",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Service",
    footerCookies: "Cookie Policy",

    // QuickLinks
    qlScreenRepair: "Screen Repair",
    qlBatteryReplacement: "Battery Replacement",
    qlPhoneCases: "Phone Cases",
    qlChargersAndCables: "Chargers & Cables",
    qlMembership: "Membership",

    // NearbyStores
    nearbyTitle: "Stores Near You",
    nearbySubtitle: "Based on Dublin 1 · Change location",
    nearbyViewAll: "View all stores",
    nearbyOpen: "Open",
    nearbyClosesSoon: "Closes soon",
    nearbyUntil: "Until",

    // PromoCards
    promoEnterpriseTag: "Enterprise",
    promoEnterpriseTitle: "Business Repairs",
    promoEnterpriseDesc:
      "Bulk device repair solutions for businesses. Priority service and custom pricing.",
    promoEnterpriseBtn: "Learn More",
    promoMemberTag: "Members Only",
    promoMemberTitle: "Free Screen Repair",
    promoMemberDesc:
      "IERepair members get one free screen repair per year. Join today and save up to €150.",
    promoMemberBtn: "Join Membership",

    // PopularProducts
    popularTitle: "Popular Services & Products",
    popularSubtitle: "Most booked this week across Ireland",
    popularViewAll: "View all",
    popularFrom: "From",
    popularStores: " stores",

    // MembershipBanner
    membershipTag: "IERepair Membership",
    membershipTitle1: "Protect Your Phone.",
    membershipTitle2: "Save Every Year.",
    membershipCta: "Get Membership — From €9.99/mo",
    membershipCompare: "Compare Plans",
    perkFreeScreen: "Free Screen Cover",
    perkFreeScreenDesc: "One free screen repair per year",
    perkPriority: "Priority Repair",
    perkPriorityDesc: "Skip the queue, same-day service",
    perkDiscount: "20% Off All Repairs",
    perkDiscountDesc: "On all repair services, every time",
    perkAccessories: "Free Accessories",
    perkAccessoriesDesc: "Monthly accessory credits",

    // SearchBar
    searchKeywordPlaceholder: "Screen repair, battery...",
    searchEircodePlaceholder: "Eircode (e.g. D01 W2X2)",
    searchBtn: "Search",

    // ServiceCard
    viewStore: "View Store",
    bookNow: "Book Now",
    kmAway: "km away",
    minUnit: "min",

    // Search page
    searching: "Searching...",
    noRepairsTitle: "No repairs found nearby",
    noRepairsDesc: "Try a different search term or a nearby Eircode",
    backToHome: "Back to Home",
    servicesFound: (total: number) =>
      `${total} service${total !== 1 ? "s" : ""} found`,

    // Store detail page
    storeBackToSearch: "← Search Results",
    storeOpeningHours: "Opening Hours",
    storeLocation: "Location",
    storeServices: "Services",
    storeReviews: "Reviews",
    storeBookRepair: "Book a Repair",
    storeClosed: "Closed",
    storeToday: " (Today)",
    storeNoServices: "No services listed yet.",
    storeBook: "Book",

    // Account bookings page
    myBookings: "My Bookings",
    lookUpBookings: "Look Up Your Bookings",
    lookUpSubtitle: "Enter your phone number to view all your repair appointments.",
    phonePlaceholder: "e.g. 0871234567",
    lookUpBtn: "Look Up",
    noBookingsTitle: "No bookings found",
    noBookingsText: (phone: string) =>
      `No repair appointments found for ${phone}. Double-check the number you used when booking.`,
    bookingsFound: (n: number, phone: string) =>
      `${n} booking${n !== 1 ? "s" : ""} found for ${phone}`,
    labelStore: "Store",
    labelAddress: "Address",
    labelStorePhone: "Store Phone",
    labelAppointment: "Appointment",
    labelQuotedPrice: "Quoted Price",
    showCheckinQR: "Show Check-in QR",
    leaveReview: "Leave a Review",
    reviewSubmitted: "⭐ Review submitted",
    showQRSubtitle: "Show this to the store to check in",
    closeBtn: "Close",

    // Account bookings page - errors
    errorQueryFailed: "Query failed",
    errorNetworkRetry: "Network error, please try again",

    // Review page
    reviewPageTitle: "Rate Your Repair",
    reviewOrderLabel: "Order #",
    reviewOverallRating: "Overall Rating",
    reviewRatingLabel: (n: number) => {
      const labels: string[] = ["", "Very Poor", "Poor", "Average", "Good", "Excellent"];
      return labels[n] ?? "";
    },
    reviewCommentLabel: "Your Review",
    reviewOptional: "(Optional)",
    reviewCommentPlaceholder: "Tell us about your repair experience...",
    reviewSubmitBtn: "Submit Review",
    reviewSubmitting: "Submitting...",
    reviewSuccessTitle: "Thank You for Your Review!",
    reviewSuccessDesc: "Your feedback helps us improve our service quality.",
    reviewBackHome: "Back to Home",
    reviewErrSelectRating: "Please select a rating",
    reviewErrSubmitFailed: "Submission failed",
    reviewErrNetwork: "Network error, please try again",
  },
  zh: {
    // Header nav
    navRepair: "维修服务",
    navAccessories: "配件",
    navFindStore: "查找门店",
    navMembership: "会员",
    navBookRepair: "预约维修",
    langToggle: "EN",

    // Hero
    heroBadge: "爱尔兰全境超10,000名用户信任之选",
    heroHeading1: "快速、可靠的",
    heroHeading2: "手机维修",
    heroHeading3: "就在您附近",
    heroSub: "比较本地维修店，即时预约，今天就修好您的手机。",
    heroKeywordPlaceholder: "如：屏幕维修、iPhone换电池…",
    heroEircodePlaceholder: "Eircode邮编",
    heroSearchBtn: "立即搜索",
    heroPopular: "热门：",
    heroTags: ["换屏幕", "换电池", "充电口维修"],

    // Footer
    footerDesc: "爱尔兰领先的手机维修服务与配件平台，帮您找到附近值得信赖的本地维修店。",
    footerServices: "服务",
    footerAccessories: "配件",
    footerCompany: "公司",
    footerLegal: "© 2025 IERepair. 保留所有权利。",
    footerPrivacy: "隐私政策",
    footerTerms: "服务条款",
    footerCookies: "Cookie政策",

    // QuickLinks
    qlScreenRepair: "屏幕维修",
    qlBatteryReplacement: "换电池",
    qlPhoneCases: "手机壳",
    qlChargersAndCables: "充电器及数据线",
    qlMembership: "会员",

    // NearbyStores
    nearbyTitle: "附近门店",
    nearbySubtitle: "基于 Dublin 1 · 更改位置",
    nearbyViewAll: "查看全部门店",
    nearbyOpen: "营业中",
    nearbyClosesSoon: "即将打烊",
    nearbyUntil: "至",

    // PromoCards
    promoEnterpriseTag: "企业商务",
    promoEnterpriseTitle: "企业维修方案",
    promoEnterpriseDesc: "为企业提供批量设备维修解决方案，优先服务与定制报价。",
    promoEnterpriseBtn: "了解详情",
    promoMemberTag: "会员专属",
    promoMemberTitle: "免费换屏",
    promoMemberDesc: "IERepair会员每年享受一次免费换屏。立即加入，最高可省€150。",
    promoMemberBtn: "加入会员",

    // PopularProducts
    popularTitle: "热门服务与产品",
    popularSubtitle: "爱尔兰全境本周最受欢迎",
    popularViewAll: "查看全部",
    popularFrom: "起价",
    popularStores: " 家门店",

    // MembershipBanner
    membershipTag: "IERepair 会员",
    membershipTitle1: "守护您的手机。",
    membershipTitle2: "每年省更多。",
    membershipCta: "立即加入 — 低至€9.99/月",
    membershipCompare: "对比方案",
    perkFreeScreen: "免费换屏",
    perkFreeScreenDesc: "每年享一次免费屏幕维修",
    perkPriority: "优先维修",
    perkPriorityDesc: "免排队，当日完成",
    perkDiscount: "全单八折",
    perkDiscountDesc: "所有维修服务每次享受折扣",
    perkAccessories: "免费配件",
    perkAccessoriesDesc: "每月配件积分",

    // SearchBar
    searchKeywordPlaceholder: "屏幕维修、换电池...",
    searchEircodePlaceholder: "Eircode邮编（如 D01 W2X2）",
    searchBtn: "搜索",

    // ServiceCard
    viewStore: "查看门店",
    bookNow: "立即预约",
    kmAway: "公里",
    minUnit: "分钟",

    // Search page
    searching: "搜索中...",
    noRepairsTitle: "附近暂无相关维修服务",
    noRepairsDesc: "请尝试其他关键词或附近的Eircode",
    backToHome: "返回首页",
    servicesFound: (total: number) => `找到 ${total} 项服务`,

    // Store detail page
    storeBackToSearch: "← 返回搜索结果",
    storeOpeningHours: "营业时间",
    storeLocation: "门店位置",
    storeServices: "维修服务",
    storeReviews: "用户评价",
    storeBookRepair: "立即预约",
    storeClosed: "休息",
    storeToday: "（今天）",
    storeNoServices: "暂无服务项目。",
    storeBook: "预约",

    // Account bookings page
    myBookings: "我的预约",
    lookUpBookings: "查询我的预约",
    lookUpSubtitle: "请输入您的手机号码，查看全部维修预约记录。",
    phonePlaceholder: "如：0871234567",
    lookUpBtn: "查询",
    noBookingsTitle: "未找到预约记录",
    noBookingsText: (phone: string) =>
      `未找到 ${phone} 的维修预约。请确认您预约时使用的手机号码。`,
    bookingsFound: (n: number, phone: string) =>
      `共找到 ${n} 条预约（${phone}）`,
    labelStore: "门店",
    labelAddress: "地址",
    labelStorePhone: "门店电话",
    labelAppointment: "预约时间",
    labelQuotedPrice: "报价",
    showCheckinQR: "显示签到二维码",
    leaveReview: "撰写评价",
    reviewSubmitted: "⭐ 已提交评价",
    showQRSubtitle: "向门店出示此二维码签到",
    closeBtn: "关闭",

    // Account bookings page - errors
    errorQueryFailed: "查询失败",
    errorNetworkRetry: "网络错误，请稍后重试",

    // Review page
    reviewPageTitle: "评价您的维修体验",
    reviewOrderLabel: "订单号：",
    reviewOverallRating: "总体评分",
    reviewRatingLabel: (n: number) => {
      const labels: string[] = ["", "非常差", "较差", "一般", "满意", "非常满意"];
      return labels[n] ?? "";
    },
    reviewCommentLabel: "评价内容",
    reviewOptional: "（选填）",
    reviewCommentPlaceholder: "请分享您的维修体验...",
    reviewSubmitBtn: "提交评价",
    reviewSubmitting: "提交中...",
    reviewSuccessTitle: "感谢您的评价！",
    reviewSuccessDesc: "您的反馈帮助我们不断改进服务质量。",
    reviewBackHome: "返回首页",
    reviewErrSelectRating: "请选择评分",
    reviewErrSubmitFailed: "提交失败",
    reviewErrNetwork: "网络错误，请重试",
  },
} as const;

export function useConsumerT(lang: Lang) {
  return translations[lang];
}

export type ConsumerT = (typeof translations)[Lang];
