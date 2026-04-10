"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

function DeviceImage({ src, alt }: { src: string; alt: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <Image
        src="/images/devices/placeholder.svg"
        alt={alt}
        fill
        className="object-contain p-3"
        sizes="(max-width: 768px) 33vw, 16vw"
        unoptimized
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain p-2"
      sizes="(max-width: 768px) 33vw, 16vw"
      onError={() => setErr(true)}
    />
  );
}

/* ── Steps ──────────────────────────────────────────────── */
const STEPS = [
  { num: "01", label: "选择设备型号" },
  { num: "02", label: "填写故障信息" },
  { num: "03", label: "填写服务信息" },
  { num: "04", label: "预约成功" },
];

/* ── Filter data ─────────────────────────────────────────── */
const CATEGORIES = ["手机", "平板", "笔记本", "台式机", "打印机", "网络维护", "智能手表", "耳机", "学习机", "空调"];

const BRANDS: Record<string, string[]> = {
  手机: ["全部", "苹果", "华为", "小米", "vivo", "OPPO", "荣耀", "三星", "Google", "OnePlus"],
  平板: ["全部", "苹果", "华为", "小米", "三星", "联想"],
  笔记本: ["全部", "苹果", "联想", "惠普", "戴尔", "华硕", "微软"],
  台式机: ["全部", "联想", "惠普", "戴尔", "华硕"],
  打印机: ["全部", "惠普", "爱普生", "佳能", "兄弟"],
  网络维护: ["全部", "路由器", "交换机", "NAS"],
  智能手表: ["全部", "苹果", "华为", "小米", "三星"],
  耳机: ["全部", "苹果", "索尼", "华为", "小米"],
  学习机: ["全部", "科大讯飞", "步步高", "小度"],
  空调: ["全部", "格力", "美的", "海尔", "志高"],
};

const SERIES: Record<string, string[]> = {
  苹果: ["全部", "iPhone 17 系列", "iPhone 16 系列", "iPhone 15 系列", "iPhone 14 系列", "iPhone 13 系列", "iPhone 12 系列", "iPhone SE"],
  三星: ["全部", "Samsung A 系列", "Samsung S 系列", "Samsung Note 系列"],
  Google: ["全部", "Pixel 9 系列", "Pixel 8 系列", "Pixel 7 系列", "Pixel 6 系列"],
  OnePlus: ["全部", "OnePlus Nord", "OnePlus 11", "OnePlus 9", "OnePlus 8", "OnePlus 7", "OnePlus 6"],
  华为: ["全部", "Mate 系列", "Pura 系列", "P 系列", "Nova 系列"],
  小米: ["全部", "小米 14 系列", "小米 13 系列", "Redmi Note 系列"],
  vivo: ["全部", "X 系列", "S 系列", "Y 系列"],
  OPPO: ["全部", "Find X 系列", "Reno 系列", "A 系列"],
  荣耀: ["全部", "Magic 系列", "90 系列", "X 系列"],
  全部: ["全部"],
};

/* ── Devices ─────────────────────────────────────────────── */
type Device = { name: string; img: string };

const DEVICES: Record<string, Device[]> = {
  "iPhone 17 系列": [
    { name: "iPhone 17 Pro Max", img: "/images/devices/iphone-17-pro-max.jpg" },
    { name: "iPhone 17 Pro",     img: "/images/devices/iphone-17-pro.jpg" },
    { name: "iPhone 17 Air",     img: "/images/devices/iphone-17-air.jpg" },
    { name: "iPhone 17",         img: "/images/devices/iphone-17.jpg" },
  ],
  "iPhone 16 系列": [
    { name: "iPhone 16 Pro Max", img: "/images/devices/iphone-16-pro-max.jpg" },
    { name: "iPhone 16 Pro",     img: "/images/devices/iphone-16-pro.jpg" },
    { name: "iPhone 16 Plus",    img: "/images/devices/iphone-16-plus.jpg" },
    { name: "iPhone 16",         img: "/images/devices/iphone-16.png" },
    { name: "iPhone 16E",        img: "/images/devices/iphone-16e.jpg" },
  ],
  "iPhone 15 系列": [
    { name: "iPhone 15 Pro Max", img: "/images/devices/iphone-15-pro-max.jpg" },
    { name: "iPhone 15 Pro",     img: "/images/devices/iphone-15-pro.jpg" },
    { name: "iPhone 15 Plus",    img: "/images/devices/iphone-15-plus.jpg" },
    { name: "iPhone 15",         img: "/images/devices/iphone-15.jpg" },
  ],
  "iPhone 14 系列": [
    { name: "iPhone 14 Pro Max", img: "/images/devices/iphone-14-pro-max.jpg" },
    { name: "iPhone 14 Pro",     img: "/images/devices/iphone-14-pro.jpg" },
    { name: "iPhone 14 Plus",    img: "/images/devices/iphone-14-plus.jpg" },
    { name: "iPhone 14",         img: "/images/devices/iphone-14.jpg" },
  ],
  "iPhone 13 系列": [
    { name: "iPhone 13 Pro Max", img: "/images/devices/iphone-13-pro-max.jpg" },
    { name: "iPhone 13 Pro",     img: "/images/devices/iphone-13-pro.jpg" },
    { name: "iPhone 13 mini",    img: "/images/devices/iphone-13-mini.jpg" },
    { name: "iPhone 13",         img: "/images/devices/iphone-13.jpg" },
  ],
  "iPhone 12 系列": [
    { name: "iPhone 12 Pro Max", img: "/images/devices/iphone-12-pro-max.jpg" },
    { name: "iPhone 12 Pro",     img: "/images/devices/iphone-12-pro.jpg" },
    { name: "iPhone 12 mini",    img: "/images/devices/iphone-12-mini.jpg" },
    { name: "iPhone 12",         img: "/images/devices/iphone-12.jpg" },
  ],
  "iPhone SE": [
    { name: "iPhone SE (3rd)",   img: "/images/devices/iphonese-3.jpg" },
    { name: "iPhone SE (2nd)",   img: "/images/devices/iphone-se-2020.jpg" },
  ],
  "Samsung A 系列": [
    { name: "Samsung A56",  img: "/images/devices/samsung-a56.jpg" },
    { name: "Samsung A55",  img: "/images/devices/samsung-a55.jpg" },
    { name: "Samsung A54",  img: "/images/devices/samsung-a54.jpg" },
    { name: "Samsung A53",  img: "/images/devices/samsung-a53.jpg" },
    { name: "Samsung A52",  img: "/images/devices/samsung-a52.jpg" },
    { name: "Samsung A51",  img: "/images/devices/samsung-a51.jpg" },
    { name: "Samsung A36",  img: "/images/devices/samsung-a36.jpg" },
    { name: "Samsung A35",  img: "/images/devices/samsung-a35.jpg" },
    { name: "Samsung A34",  img: "/images/devices/samsung-a34.jpg" },
    { name: "Samsung A33",  img: "/images/devices/samsung-a33.jpg" },
    { name: "Samsung A32",  img: "/images/devices/samsung-a32.jpg" },
    { name: "Samsung A26",  img: "/images/devices/samsung-a26.jpg" },
    { name: "Samsung A25",  img: "/images/devices/samsung-a25.jpg" },
    { name: "Samsung A24",  img: "/images/devices/samsung-a24.png" },
    { name: "Samsung A23",  img: "/images/devices/samsung-a23.jpg" },
    { name: "Samsung A22",  img: "/images/devices/samsung-a22.jpg" },
    { name: "Samsung A16",  img: "/images/devices/samsung-a16.jpg" },
    { name: "Samsung A15",  img: "/images/devices/samsung-a15.jpg" },
    { name: "Samsung A14",  img: "/images/devices/samsung-a14.jpg" },
    { name: "Samsung A13",  img: "/images/devices/samsung-a13.jpg" },
  ],
  "Samsung S 系列": [
    { name: "Samsung S25 Ultra", img: "/images/devices/samsung-s25-ultra.jpg" },
    { name: "Samsung S25 Plus",  img: "/images/devices/samsung-s25-plus.jpg" },
    { name: "Samsung S25 Edge",  img: "/images/devices/samsung-s25-edge.jpg" },
    { name: "Samsung S25",       img: "/images/devices/samsung-s25.jpg" },
    { name: "Samsung S24 Ultra", img: "/images/devices/samsung-s24-ultra.jpg" },
    { name: "Samsung S24 Plus",  img: "/images/devices/samsung-s24-plus.jpg" },
    { name: "Samsung S24 FE",    img: "/images/devices/samsung-s24-fe.jpg" },
    { name: "Samsung S24",       img: "/images/devices/samsung-s24.jpg" },
    { name: "Samsung S23 Ultra", img: "/images/devices/samsung-s23-ultra.jpg" },
    { name: "Samsung S23 Plus",  img: "/images/devices/samsung-s23-plus.jpg" },
    { name: "Samsung S23 FE",    img: "/images/devices/samsung-s23-fe.jpg" },
    { name: "Samsung S23",       img: "/images/devices/samsung-s23.jpg" },
    { name: "Samsung S22 Ultra", img: "/images/devices/samsung-s22-ultra.jpg" },
    { name: "Samsung S22 Plus",  img: "/images/devices/samsung-s22-plus.jpg" },
    { name: "Samsung S22",       img: "/images/devices/samsung-s22.jpg" },
    { name: "Samsung S21 Ultra", img: "/images/devices/samsung-s21-ultra.jpg" },
    { name: "Samsung S21 FE",    img: "/images/devices/samsung-s21-fe.jpg" },
    { name: "Samsung S21",       img: "/images/devices/samsung-s21.jpg" },
    { name: "Samsung S20 Ultra", img: "/images/devices/samsung-s20-ultra.jpg" },
    { name: "Samsung S20",       img: "/images/devices/samsung-s20.jpg" },
  ],
  "Samsung Note 系列": [
    { name: "Samsung Note 20 Ultra", img: "/images/devices/samsung-note-20-ultra.jpg" },
    { name: "Samsung Note 20",       img: "/images/devices/samsung-note-20.jpg" },
    { name: "Samsung Note 10 Plus",  img: "/images/devices/samsung-note-10-plus.jpg" },
    { name: "Samsung Note 10",       img: "/images/devices/samsung-note-10.jpg" },
    { name: "Samsung Note 9",        img: "/images/devices/samsung-note-9.jpg" },
  ],
  "Pixel 9 系列": [
    { name: "Google Pixel 9 Pro XL", img: "/images/devices/google-pixel-9-pro-xl.jpg" },
    { name: "Google Pixel 9 Pro",    img: "/images/devices/google-pixel-9-pro.jpg" },
    { name: "Google Pixel 9A",       img: "/images/devices/google-pixel-9a.jpg" },
    { name: "Google Pixel 9",        img: "/images/devices/google-pixel-9.jpg" },
  ],
  "Pixel 8 系列": [
    { name: "Google Pixel 8 Pro", img: "/images/devices/google-pixel-8-pro.jpg" },
    { name: "Google Pixel 8A",    img: "/images/devices/google-pixel-8a.jpg" },
    { name: "Google Pixel 8",     img: "/images/devices/google-pixel-8.jpg" },
  ],
  "Pixel 7 系列": [
    { name: "Google Pixel 7 Pro", img: "/images/devices/google-pixel-7-pro.jpg" },
    { name: "Google Pixel 7A",    img: "/images/devices/google-pixel-7a.png" },
    { name: "Google Pixel 7",     img: "/images/devices/google-pixel-7.jpg" },
  ],
  "Pixel 6 系列": [
    { name: "Google Pixel 6 Pro", img: "/images/devices/google-pixel-6-pro.jpg" },
    { name: "Google Pixel 6A",    img: "/images/devices/google-pixel-6a.jpg" },
    { name: "Google Pixel 6",     img: "/images/devices/google-pixel-6.jpg" },
  ],
  "OnePlus Nord": [
    { name: "OnePlus Nord 2T",  img: "/images/devices/oneplus-nord-2t.png" },
    { name: "OnePlus Nord 2",   img: "/images/devices/oneplus-nord-2.jpg" },
    { name: "OnePlus Nord",     img: "/images/devices/oneplus-nord.jpg" },
    { name: "OnePlus CE 5G",    img: "/images/devices/oneplus-ce-5g.jpg" },
    { name: "OnePlus CE2 5G",   img: "/images/devices/oneplus-ce2-5g.png" },
    { name: "OnePlus CE2 Lite", img: "/images/devices/oneplus-ce2-lite.jpg" },
  ],
  "OnePlus 11": [
    { name: "OnePlus 11 5G",   img: "/images/devices/oneplus-11-5g.png" },
    { name: "OnePlus 10T Pro", img: "/images/devices/oneplus-10t-pro.jpg" },
    { name: "OnePlus 10T",     img: "/images/devices/oneplus-10t.png" },
  ],
  "OnePlus 9": [
    { name: "OnePlus 9 Pro", img: "/images/devices/oneplus-9-pro.jpg" },
    { name: "OnePlus 9",     img: "/images/devices/oneplus-9.jpg" },
  ],
  "OnePlus 8": [
    { name: "OnePlus 8 Pro", img: "/images/devices/oneplus-8-pro.jpg" },
    { name: "OnePlus 8T",    img: "/images/devices/oneplus-8t.jpg" },
    { name: "OnePlus 8",     img: "/images/devices/oneplus-8.jpg" },
  ],
  "OnePlus 7": [
    { name: "OnePlus 7 Pro", img: "/images/devices/oneplus-7-pro.jpg" },
    { name: "OnePlus 7T",    img: "/images/devices/oneplus-7t.jpg" },
    { name: "OnePlus 7",     img: "/images/devices/oneplus-7.png" },
  ],
  "OnePlus 6": [
    { name: "OnePlus 6T", img: "/images/devices/oneplus-6t.jpg" },
    { name: "OnePlus 6",  img: "/images/devices/oneplus-6.jpg" },
  ],
};

/* ── Fallback devices ─────────────────────────────────────── */
const DEFAULT_DEVICES: Device[] = [
  { name: "iPhone 17 Pro Max", img: "/images/devices/iphone-17-pro-max.jpg" },
  { name: "iPhone 17 Pro",     img: "/images/devices/iphone-17-pro.jpg" },
  { name: "iPhone 16 Pro Max", img: "/images/devices/iphone-16-pro-max.jpg" },
  { name: "iPhone 16 Pro",     img: "/images/devices/iphone-16-pro.jpg" },
  { name: "iPhone 15 Pro Max", img: "/images/devices/iphone-15-pro-max.jpg" },
  { name: "iPhone 15 Pro",     img: "/images/devices/iphone-15-pro.jpg" },
  { name: "Samsung S25 Ultra", img: "/images/devices/samsung-s25-ultra.jpg" },
  { name: "Samsung A56",       img: "/images/devices/samsung-a56.jpg" },
  { name: "Google Pixel 9 Pro",img: "/images/devices/google-pixel-9-pro.jpg" },
  { name: "OnePlus 11 5G",     img: "/images/devices/oneplus-11-5g.png" },
];

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function SelectDeviceContent() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("brand") === "android" ? "三星" : "苹果";

  const [category, setCategory] = useState("手机");
  const [brand,    setBrand]    = useState(initialBrand);
  const [series,   setSeries]   = useState("全部");

  const brandList  = BRANDS[category]  ?? ["全部"];
  const seriesList = SERIES[brand]     ?? ["全部"];

  const activeSeries = series === "全部" ? null : series;
  const visibleDevices = activeSeries
    ? (DEVICES[activeSeries] ?? DEFAULT_DEVICES)
    : Object.values(DEVICES).flat().slice(0, 24);

  function handleBrandChange(b: string) {
    setBrand(b);
    setSeries("全部");
  }

  function handleCategoryChange(c: string) {
    setCategory(c);
    setBrand("全部");
    setSeries("全部");
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* ── Top bar ──────────────────────────────────────── */}
      <div className="bg-white border-b border-[rgba(34,42,53,0.08)] px-5 md:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-[#898989]">
          <Link href="/" className="hover:text-[#242424] transition-colors">首页</Link>
          <ChevronRight size={12} />
          <span className="text-[#242424] font-medium">选择设备型号</span>
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────── */}
      <div className="bg-white border-b border-[rgba(34,42,53,0.08)]">
        <div className="max-w-5xl mx-auto px-5 md:px-8">
          <div className="flex items-center py-5 overflow-x-auto">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i === 0
                      ? "bg-[#242424] text-white"
                      : "bg-[#f0f0f0] text-[#898989]"
                  }`}>
                    {step.num}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${
                    i === 0 ? "text-[#242424]" : "text-[#898989]"
                  }`}>
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-8 md:w-16 h-px bg-[rgba(34,42,53,0.12)] mx-3 md:mx-5 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="bg-white border-b border-[rgba(34,42,53,0.08)] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 md:px-8 divide-y divide-[rgba(34,42,53,0.06)]">

          {/* 品类 */}
          <div className="flex items-start gap-4 py-3">
            <span className="text-xs text-[#898989] font-medium shrink-0 pt-1 w-10">品类</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    category === c
                      ? "bg-[#242424] text-white"
                      : "bg-[#f5f5f5] text-[#555555] hover:bg-[#ebebeb]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 品牌 */}
          <div className="flex items-start gap-4 py-3">
            <span className="text-xs text-[#898989] font-medium shrink-0 pt-1 w-10">品牌</span>
            <div className="flex flex-wrap gap-2">
              {brandList.map((b) => (
                <button
                  key={b}
                  onClick={() => handleBrandChange(b)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    brand === b
                      ? "bg-[#242424] text-white"
                      : "bg-[#f5f5f5] text-[#555555] hover:bg-[#ebebeb]"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* 系列 */}
          <div className="flex items-start gap-4 py-3">
            <span className="text-xs text-[#898989] font-medium shrink-0 pt-1 w-10">系列</span>
            <div className="flex flex-wrap gap-2">
              {seriesList.map((s) => (
                <button
                  key={s}
                  onClick={() => setSeries(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    series === s
                      ? "bg-[#e05c2a] text-white"
                      : "bg-[#f5f5f5] text-[#555555] hover:bg-[#ebebeb]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Device grid ──────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-6">
        <div className="text-xs text-[#898989] mb-4">
          共 <span className="text-[#242424] font-semibold">{visibleDevices.length}</span> 款设备
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {visibleDevices.map((device) => (
            <Link
              key={device.name}
              href={`/repair/book?device=${encodeURIComponent(device.name)}`}
              className="bg-white rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
              style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.04) 0px 4px 8px" }}
            >
              <div className="h-24 md:h-28 bg-[#f8f8f8] flex items-center justify-center relative overflow-hidden">
                <DeviceImage src={device.img} alt={device.name} />
              </div>
              <div className="p-2 text-center">
                <div className="text-[10px] font-semibold text-[#242424] leading-tight line-clamp-2">
                  {device.name}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}

export default function SelectDevicePage() {
  return (
    <Suspense>
      <SelectDeviceContent />
    </Suspense>
  );
}
