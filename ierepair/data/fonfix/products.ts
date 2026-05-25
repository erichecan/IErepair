export type RepairProduct = {
  slug: string;
  name: string;
  brand: string;
  brandSlug: string;
  deviceModel: string;
  repairType: string;
  repairTypeSlug: string;
  price: number;
  depositAmount: number;
  estimatedMin: number;
  warranty: string;
  description: string;
  imageUrl: string;
  badge?: string;
};

export type Collection = {
  slug: string;
  name: string;
  description: string;
  imageUrl: string;
  count: number;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "apple",
    name: "Apple Repairs",
    description: "iPhone, iPad, MacBook — genuine and OEM-quality parts.",
    imageUrl: "/images/brands/apple.svg",
    count: 12,
  },
  {
    slug: "samsung",
    name: "Samsung Repairs",
    description: "Galaxy S and A-series screens, batteries, and more.",
    imageUrl: "/images/brands/samsung.svg",
    count: 10,
  },
  {
    slug: "google",
    name: "Google Pixel Repairs",
    description: "Pixel 6 through Pixel 9 — same-day screen replacements.",
    imageUrl: "/images/brands/google.svg",
    count: 6,
  },
  {
    slug: "oneplus",
    name: "OnePlus Repairs",
    description: "Screen, battery and charging port for all OnePlus models.",
    imageUrl: "/images/brands/oneplus.svg",
    count: 5,
  },
  {
    slug: "sony",
    name: "Sony Xperia Repairs",
    description: "Xperia display and battery replacements.",
    imageUrl: "/images/brands/sony.svg",
    count: 4,
  },
  {
    slug: "huawei",
    name: "Huawei Repairs",
    description: "P and Mate series screen and battery repairs.",
    imageUrl: "/images/brands/huawei.svg",
    count: 4,
  },
];

export const REPAIR_PRODUCTS: RepairProduct[] = [
  // ── Apple ──────────────────────────────────────────────────────────────────
  {
    slug: "iphone-15-pro-max-screen",
    name: "iPhone 15 Pro Max Screen Replacement",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 15 Pro Max",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 249,
    depositAmount: 50,
    estimatedMin: 45,
    warranty: "180 days",
    description:
      "OEM-quality Super Retina XDR OLED panel. Preserves ProMotion 120 Hz, True Tone, and Face ID. Same-day service.",
    imageUrl: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg",
    badge: "Most Popular",
  },
  {
    slug: "iphone-15-pro-screen",
    name: "iPhone 15 Pro Screen Replacement",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 15 Pro",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 219,
    depositAmount: 50,
    estimatedMin: 45,
    warranty: "180 days",
    description:
      "OEM-quality OLED panel with ProMotion and True Tone. Face ID preserved. Done in under 1 hour.",
    imageUrl: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg",
  },
  {
    slug: "iphone-15-screen",
    name: "iPhone 15 Screen Replacement",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 15",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 169,
    depositAmount: 40,
    estimatedMin: 40,
    warranty: "180 days",
    description: "Super Retina XDR OLED. Full touch response and colour accuracy restored.",
    imageUrl: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg",
  },
  {
    slug: "iphone-14-pro-max-screen",
    name: "iPhone 14 Pro Max Screen Replacement",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 14 Pro Max",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 219,
    depositAmount: 50,
    estimatedMin: 45,
    warranty: "180 days",
    description: "Premium OLED replacement. Always-On Display, ProMotion, and Face ID fully retained.",
    imageUrl: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg",
  },
  {
    slug: "iphone-15-pro-battery",
    name: "iPhone 15 Pro Battery Replacement",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 15 Pro",
    repairType: "Battery Replacement",
    repairTypeSlug: "battery",
    price: 89,
    depositAmount: 20,
    estimatedMin: 30,
    warranty: "180 days",
    description:
      "High-capacity OEM-equivalent cell. Restores all-day battery life and removes throttling.",
    imageUrl: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg",
  },
  {
    slug: "iphone-14-battery",
    name: "iPhone 14 Battery Replacement",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 14",
    repairType: "Battery Replacement",
    repairTypeSlug: "battery",
    price: 79,
    depositAmount: 20,
    estimatedMin: 30,
    warranty: "180 days",
    description: "Restores battery health to 100%. Includes calibration after fitting.",
    imageUrl: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg",
  },
  {
    slug: "iphone-15-charging-port",
    name: "iPhone 15 Charging Port Repair",
    brand: "Apple",
    brandSlug: "apple",
    deviceModel: "iPhone 15",
    repairType: "Charging Port",
    repairTypeSlug: "charging-port",
    price: 69,
    depositAmount: 15,
    estimatedMin: 30,
    warranty: "180 days",
    description: "USB-C port replacement. Fixes slow charging, no charging, or intermittent connection.",
    imageUrl: "/images/devices/20260209-959958bcbf6e4b9886d80b6f1b1cebef.jpg",
  },
  // ── Samsung ────────────────────────────────────────────────────────────────
  {
    slug: "samsung-s24-ultra-screen",
    name: "Samsung Galaxy S24 Ultra Screen Replacement",
    brand: "Samsung",
    brandSlug: "samsung",
    deviceModel: "Galaxy S24 Ultra",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 229,
    depositAmount: 50,
    estimatedMin: 60,
    warranty: "180 days",
    description:
      "Dynamic AMOLED 2X panel with 120 Hz and 2600 nits peak brightness. S Pen slot preserved.",
    imageUrl: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg",
    badge: "Best Value",
  },
  {
    slug: "samsung-s24-screen",
    name: "Samsung Galaxy S24 Screen Replacement",
    brand: "Samsung",
    brandSlug: "samsung",
    deviceModel: "Galaxy S24",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 179,
    depositAmount: 40,
    estimatedMin: 50,
    warranty: "180 days",
    description: "Dynamic AMOLED panel. Vivid colours and 120 Hz refresh fully restored.",
    imageUrl: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg",
  },
  {
    slug: "samsung-a55-screen",
    name: "Samsung Galaxy A55 Screen Replacement",
    brand: "Samsung",
    brandSlug: "samsung",
    deviceModel: "Galaxy A55",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 129,
    depositAmount: 30,
    estimatedMin: 45,
    warranty: "180 days",
    description: "Super AMOLED FHD+ replacement. Ideal mid-range repair at an affordable price.",
    imageUrl: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg",
  },
  {
    slug: "samsung-s24-battery",
    name: "Samsung Galaxy S24 Battery Replacement",
    brand: "Samsung",
    brandSlug: "samsung",
    deviceModel: "Galaxy S24",
    repairType: "Battery Replacement",
    repairTypeSlug: "battery",
    price: 79,
    depositAmount: 20,
    estimatedMin: 40,
    warranty: "180 days",
    description: "High-density cell. Restores a full day of charge and eliminates random shutdowns.",
    imageUrl: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg",
  },
  // ── Google ──────────────────────────────────────────────────────────────────
  {
    slug: "pixel-9-pro-screen",
    name: "Google Pixel 9 Pro Screen Replacement",
    brand: "Google",
    brandSlug: "google",
    deviceModel: "Pixel 9 Pro",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 199,
    depositAmount: 50,
    estimatedMin: 60,
    warranty: "180 days",
    description:
      "LTPO OLED panel. Full 120 Hz, HDR10+, and Face Unlock compatibility maintained.",
    imageUrl: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg",
  },
  {
    slug: "pixel-8-battery",
    name: "Google Pixel 8 Battery Replacement",
    brand: "Google",
    brandSlug: "google",
    deviceModel: "Pixel 8",
    repairType: "Battery Replacement",
    repairTypeSlug: "battery",
    price: 79,
    depositAmount: 20,
    estimatedMin: 40,
    warranty: "180 days",
    description: "Certified replacement cell. Removes adaptive charging warnings and restores capacity.",
    imageUrl: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg",
  },
  // ── OnePlus ────────────────────────────────────────────────────────────────
  {
    slug: "oneplus-12-screen",
    name: "OnePlus 12 Screen Replacement",
    brand: "OnePlus",
    brandSlug: "oneplus",
    deviceModel: "OnePlus 12",
    repairType: "Screen Replacement",
    repairTypeSlug: "screen",
    price: 169,
    depositAmount: 40,
    estimatedMin: 60,
    warranty: "180 days",
    description: "QHD+ LTPO AMOLED with 120 Hz. Fluid animations and ProXDR colours fully restored.",
    imageUrl: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg",
  },
  {
    slug: "oneplus-12-battery",
    name: "OnePlus 12 Battery Replacement",
    brand: "OnePlus",
    brandSlug: "oneplus",
    deviceModel: "OnePlus 12",
    repairType: "Battery Replacement",
    repairTypeSlug: "battery",
    price: 75,
    depositAmount: 20,
    estimatedMin: 45,
    warranty: "180 days",
    description: "5400 mAh replacement cell. Restores 100 W SUPERVOOC charging compatibility.",
    imageUrl: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg",
  },
];

export const REPAIR_TYPES = [
  { slug: "screen", label: "Screen Replacement" },
  { slug: "battery", label: "Battery Replacement" },
  { slug: "charging-port", label: "Charging Port" },
  { slug: "water-damage", label: "Water Damage" },
  { slug: "back-cover", label: "Back Cover" },
];

export function getProductsByBrand(brandSlug: string): RepairProduct[] {
  return REPAIR_PRODUCTS.filter((p) => p.brandSlug === brandSlug);
}

export function getProductBySlug(slug: string): RepairProduct | undefined {
  return REPAIR_PRODUCTS.find((p) => p.slug === slug);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug === slug);
}
