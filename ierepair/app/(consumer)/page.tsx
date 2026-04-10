"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Search, ChevronRight, Star, Clock, Stethoscope, ShieldCheck,
} from "lucide-react";
import Link from "next/link";

/* ── Slogans ──────────────────────────────────────────── */
const SLOGANS = [
  { icon: <Star        size={15} className="text-yellow-400 fill-yellow-400" />, value: "99%",   label: "全网好评率" },
  { icon: <Clock       size={15} className="text-blue-400"  />,                  value: "30 min", label: "极速维修" },
  { icon: <Stethoscope size={15} className="text-green-400" />,                  value: "Free",   label: "免费诊断" },
  { icon: <ShieldCheck size={15} className="text-purple-400"/>,                  value: "0 Risk", label: "No Fix No Fee" },
];

/* ── Types ────────────────────────────────────────────── */
type Device = { name: string; desc: string; price: string; img: string };

/* ── iPhone repair data ───────────────────────────────── */
const IPHONE_TABS = ["更换屏幕", "换原厂电池", "内存升级", "更换后壳"];

const IPHONE_DEVICES: Record<string, Device[]> = {
  "更换屏幕": [
    { name: "iPhone 17 Pro Max", desc: "OLED 屏幕更换，原厂品质，极速维修", price: "€195", img: "/images/devices/iphone-17-pro-max.jpg" },
    { name: "iPhone 17 Pro",     desc: "OLED 屏幕更换，原厂品质，极速维修", price: "€195", img: "/images/devices/iphone-17-pro.jpg" },
    { name: "iPhone 17",         desc: "屏幕更换，保修 180 天",             price: "€100", img: "/images/devices/iphone-17.jpg" },
    { name: "iPhone 16 Plus",    desc: "OLED 屏幕更换，回收旧屏",           price: "€120", img: "/images/devices/iphone-16-plus.jpg" },
    { name: "iPhone 16 Pro",     desc: "OLED 屏幕更换，原厂品质",           price: "€120", img: "/images/devices/iphone-16-pro.jpg" },
    { name: "iPhone 16E",        desc: "屏幕更换，保修 180 天",             price: "€80",  img: "/images/devices/iphone-16e.jpg" },
  ],
  "换原厂电池": [
    { name: "iPhone 16 Plus",    desc: "原厂同等品质电池，续航恢复如新",     price: "€80",  img: "/images/devices/iphone-16-plus.jpg" },
    { name: "Iphone 16",         desc: "原厂同等品质电池，续航恢复如新",     price: "€80",  img: "/images/devices/iphone-16.png" },
    { name: "Iphone 16 Pro Max", desc: "电池膨胀 / 续航不足，30 分钟完成",   price: "€90",  img: "/images/devices/iphone-16-pro-max.jpg" },
    { name: "iPhone 16 Pro",     desc: "电池膨胀 / 续航不足，30 分钟完成",   price: "€90",  img: "/images/devices/iphone-16-pro.jpg" },
    { name: "iPhone 15 Pro",     desc: "电池膨胀 / 续航不足，30 分钟完成",   price: "€80",  img: "/images/devices/iphone-15-pro.jpg" },
    { name: "iPhone 15 Pro Max", desc: "电池膨胀 / 续航不足，30 分钟完成",   price: "€80",  img: "/images/devices/iphone-15-pro-max.jpg" },
  ],
  "内存升级": [
    { name: "iPhone 17 Pro Max", desc: "存储空间不足，升级至 512GB",         price: "€199", img: "/images/devices/iphone-17-pro-max.jpg" },
    { name: "iPhone 17 Pro",     desc: "存储空间不足，升级至 256GB",         price: "€159", img: "/images/devices/iphone-17-pro.jpg" },
    { name: "iPhone 16 Pro",     desc: "存储空间不足，升级至 256GB",         price: "€149", img: "/images/devices/iphone-16-pro.jpg" },
    { name: "iPhone 15 Pro Max", desc: "存储空间不足，升级至 512GB",         price: "€189", img: "/images/devices/iphone-15-pro-max.jpg" },
    { name: "iPhone 15 Pro",     desc: "存储空间不足，升级至 256GB",         price: "€149", img: "/images/devices/iphone-15-pro.jpg" },
    { name: "iPhone 14 Pro",     desc: "存储空间不足，升级至 256GB",         price: "€139", img: "/images/devices/iphone-14-pro.jpg" },
  ],
  "更换后壳": [
    { name: "iPhone 17 Pro Max", desc: "后盖碎裂，更换原装后盖",             price: "€149", img: "/images/devices/iphone-17-pro-max.jpg" },
    { name: "iPhone 16 Plus",    desc: "后盖碎裂，更换原装后盖",             price: "€129", img: "/images/devices/iphone-16-plus.jpg" },
    { name: "iPhone 16 Pro",     desc: "后盖碎裂，更换原装后盖",             price: "€139", img: "/images/devices/iphone-16-pro.jpg" },
    { name: "iPhone 15 Pro Max", desc: "后盖碎裂，更换原装后盖",             price: "€149", img: "/images/devices/iphone-15-pro-max.jpg" },
    { name: "iPhone 15 Pro",     desc: "后盖碎裂，更换原装后盖",             price: "€129", img: "/images/devices/iphone-15-pro.jpg" },
    { name: "iPhone 14 Pro Max", desc: "后盖碎裂，更换原装后盖",             price: "€139", img: "/images/devices/iphone-14-pro-max.jpg" },
  ],
};

/* ── Android repair data ─────────────────────────────── */
const ANDROID_TABS = ["Samsung A 系列", "Samsung S 系列", "Google Pixel", "OnePlus"];

const ANDROID_DEVICES: Record<string, Device[]> = {
  "Samsung A 系列": [
    { name: "Samsung A56",   desc: "屏幕更换，原厂品质，30 分钟完成", price: "€140", img: "/images/devices/samsung-a56.jpg" },
    { name: "Samsung A55",   desc: "屏幕更换，原厂品质，30 分钟完成", price: "€130", img: "/images/devices/samsung-a55.jpg" },
    { name: "Samsung A54",   desc: "屏幕更换，原厂品质，30 分钟完成", price: "€130", img: "/images/devices/samsung-a54.jpg" },
    { name: "Samsung A53",   desc: "屏幕更换，保修 180 天",           price: "€130", img: "/images/devices/samsung-a53.jpg" },
    { name: "Samsung A52",   desc: "屏幕更换，保修 180 天",           price: "€120", img: "/images/devices/samsung-a52.jpg" },
    { name: "Samsung A51",   desc: "屏幕更换，保修 180 天",           price: "€95",  img: "/images/devices/samsung-a51.jpg" },
  ],
  "Samsung S 系列": [
    { name: "Samsung S25 Ultra",  desc: "OLED 屏幕更换，回收旧屏",     price: "€280", img: "/images/devices/samsung-s25-ultra.jpg" },
    { name: "Samsung S25 Plus",   desc: "OLED 屏幕更换，回收旧屏",     price: "€250", img: "/images/devices/samsung-s25-plus.jpg" },
    { name: "Samsung S24 Ultra",  desc: "OLED 屏幕更换，回收旧屏",     price: "€260", img: "/images/devices/samsung-s24-ultra.jpg" },
    { name: "Samsung S24 Plus",   desc: "OLED 屏幕更换，回收旧屏",     price: "€230", img: "/images/devices/samsung-s24-plus.jpg" },
    { name: "Samsung S23 Ultra",  desc: "OLED 屏幕更换，保修 180 天",  price: "€250", img: "/images/devices/samsung-s23-ultra.jpg" },
    { name: "Samsung S22 Ultra",  desc: "OLED 屏幕更换，保修 180 天",  price: "€220", img: "/images/devices/samsung-s22-ultra.jpg" },
  ],
  "Google Pixel": [
    { name: "Google Pixel 9 Pro", desc: "屏幕更换，原厂品质，30 分钟完成", price: "€180", img: "/images/devices/google-pixel-9-pro.jpg" },
    { name: "Google Pixel 9",     desc: "屏幕更换，保修 180 天",           price: "€160", img: "/images/devices/google-pixel-9.jpg" },
    { name: "Google Pixel 8 Pro", desc: "屏幕更换，保修 180 天",           price: "€170", img: "/images/devices/google-pixel-8-pro.jpg" },
    { name: "Google Pixel 8",     desc: "屏幕更换，保修 180 天",           price: "€150", img: "/images/devices/google-pixel-8.jpg" },
    { name: "Google Pixel 7 Pro", desc: "屏幕更换，保修 180 天",           price: "€150", img: "/images/devices/google-pixel-7-pro.jpg" },
    { name: "Google Pixel 7",     desc: "屏幕更换，保修 180 天",           price: "€160", img: "/images/devices/google-pixel-7.jpg" },
  ],
  "OnePlus": [
    { name: "OnePlus 8",    desc: "屏幕更换，保修 180 天",           price: "€130", img: "/images/devices/oneplus-8.jpg" },
    { name: "OnePlus 7T",   desc: "屏幕更换，保修 180 天",           price: "€110", img: "/images/devices/oneplus-7t.jpg" },
    { name: "Oneplus 7 Pro",desc: "OLED 屏幕更换，回收旧屏",         price: "€160", img: "/images/devices/oneplus-7-pro.jpg" },
    { name: "OnePlus 7",    desc: "屏幕更换，保修 180 天",           price: "€95",  img: "/images/devices/oneplus-7.png" },
    { name: "OnePlus 6T",   desc: "屏幕更换，保修 180 天",           price: "€90",  img: "/images/devices/oneplus-6t.jpg" },
    { name: "OnePlus 6",    desc: "屏幕更换，保修 180 天",           price: "€90",  img: "/images/devices/oneplus-6.jpg" },
  ],
};

/* ── Device Image with fallback ──────────────────────── */
function DeviceImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [err, setErr] = useState(false);
  if (err) {
    return (
      <Image
        src="/images/devices/placeholder.svg"
        alt={alt}
        fill
        className="object-contain p-4"
        sizes={sizes}
        unoptimized
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-contain p-3"
      sizes={sizes}
      onError={() => setErr(true)}
    />
  );
}

/* ── Device Card ─────────────────────────────────────── */
function DeviceCard({ name, desc, price, img }: Device) {
  return (
    <div
      className="shrink-0 w-36 md:w-44 bg-white rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform"
      style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 12px" }}
    >
      <div className="h-32 md:h-40 bg-[#f8f8f8] flex items-center justify-center relative overflow-hidden">
        <DeviceImage
          src={img}
          alt={name}
          sizes="(max-width: 768px) 144px, 176px"
        />
      </div>
      <div className="p-3">
        <div className="text-xs font-semibold text-[#242424] leading-tight">{name}</div>
        <div className="text-[10px] text-[#898989] mt-1 leading-tight line-clamp-2">{desc}</div>
        <div className="mt-2 text-sm font-bold text-[#e05c2a]">{price}</div>
      </div>
    </div>
  );
}

/* ── Repair Section (tabbed + scroll) ──────────────────── */
function RepairSection({
  title, tabs, devices, moreHref,
}: {
  title: string;
  tabs: string[];
  devices: Record<string, Device[]>;
  moreHref: string;
}) {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="bg-white rounded-2xl overflow-hidden"
         style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 12px" }}>
      {/* Section header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h3 className="font-semibold text-[#242424] text-base"
            style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>
          {title}
        </h3>
        <Link href={moreHref} className="flex items-center gap-0.5 text-xs text-[#898989] hover:text-[#242424] transition-colors">
          更多
          <span className="w-5 h-5 rounded-full border border-[rgba(34,42,53,0.15)] flex items-center justify-center ml-0.5">
            <ChevronRight size={11} />
          </span>
        </Link>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[rgba(34,42,53,0.08)] px-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-4 py-3 text-xs font-semibold transition-colors whitespace-nowrap border-b-2 -mb-px ${
              active === tab
                ? "text-[#e05c2a] border-[#e05c2a]"
                : "text-[#898989] border-transparent hover:text-[#242424]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 px-5 py-5 overflow-x-auto scrollbar-hide">
        {(devices[active] ?? []).map((d) => (
          <DeviceCard key={d.name} {...d} />
        ))}
        {/* "更多机型" card */}
        <Link
          href={moreHref}
          className="shrink-0 w-28 h-36 md:h-44 bg-[#f8f8f8] rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#f0f0f0] transition-colors"
          style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}
        >
          <span className="w-10 h-10 rounded-full border-2 border-[rgba(34,42,53,0.2)] flex items-center justify-center text-[#898989]">
            <ChevronRight size={18} />
          </span>
          <span className="text-xs text-[#898989] font-medium">更多机型</span>
        </Link>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function HomePage() {
  const router  = useRouter();
  const [q, setQ]             = useState("");
  const [eircode, setEircode] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (q)       params.set("q", q);
    if (eircode) params.set("eircode", eircode);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="bg-white">

      {/* ══ HERO BANNER ════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 45%, #0f3460 100%)" }}
      >
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]"
             style={{
               backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
               backgroundSize: "40px 40px",
             }} />

        <div className="relative max-w-5xl mx-auto px-5 md:px-8 pt-12 md:pt-20 pb-0">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white/70 border border-white/20 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Ireland&apos;s #1 Repair Marketplace
          </div>

          {/* Headline */}
          <h1
            className="text-[36px] md:text-[58px] font-semibold text-white leading-[1.08] tracking-tight mb-3"
            style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}
          >
            快速找到附近<br />
            <span className="text-white/55">专业维修店</span>
          </h1>
          <p className="text-white/45 text-sm md:text-base font-light max-w-md mb-7">
            对比全爱尔兰维修店价格与评分。在线下单，支付20%订金锁定维修时段。
          </p>

          {/* Search */}
          <div className="max-w-xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="iPhone 15 屏幕维修…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 h-12 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/35 text-sm outline-none focus:border-white/40 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Eircode (D01 A234)"
                value={eircode}
                onChange={(e) => setEircode(e.target.value.toUpperCase())}
                className="flex-1 px-4 h-12 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/35 text-sm outline-none focus:border-white/40 transition-all"
              />
              <button
                onClick={handleSearch}
                className="px-6 h-12 bg-white text-[#242424] text-sm font-semibold rounded-xl hover:bg-white/90 transition-colors shrink-0"
              >
                搜索
              </button>
            </div>
          </div>

          {/* Slogans bar — attached to bottom of banner */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/[0.07] rounded-t-2xl overflow-hidden">
            {SLOGANS.map((s) => (
              <div key={s.label} className="flex items-center gap-3 px-5 py-4 bg-white/[0.05]">
                {s.icon}
                <div>
                  <div className="text-white font-semibold text-sm leading-none">{s.value}</div>
                  <div className="text-white/45 text-[11px] mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ SELLING POINTS ════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-2">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {/* 更换电池 — green */}
          <div className="relative rounded-2xl overflow-hidden p-5 md:p-7 flex flex-col justify-between min-h-[140px] md:min-h-[180px]"
               style={{ background: "linear-gradient(135deg, #1a6b3c 0%, #22a85c 100%)" }}>
            <div>
              <div className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Battery</div>
              <div className="text-white text-base md:text-xl font-bold leading-tight"
                   style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>更换<br />电池</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 opacity-80">
              <DeviceImage src="/images/devices/iphone-16-pro.jpg" alt="battery" sizes="80px" />
            </div>
            <div className="mt-3 text-[10px] md:text-xs text-white/60">30 分钟完成 · 原厂品质</div>
          </div>

          {/* 更换屏幕 — blue */}
          <div className="relative rounded-2xl overflow-hidden p-5 md:p-7 flex flex-col justify-between min-h-[140px] md:min-h-[180px]"
               style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #2258c8 100%)" }}>
            <div>
              <div className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Screen</div>
              <div className="text-white text-base md:text-xl font-bold leading-tight"
                   style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>更换<br />屏幕</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 opacity-80">
              <DeviceImage src="/images/devices/iphone-17-pro-max.jpg" alt="screen" sizes="80px" />
            </div>
            <div className="mt-3 text-[10px] md:text-xs text-white/60">碎屏当天修 · 保修 180 天</div>
          </div>

          {/* 升级内存 — amber */}
          <div className="relative rounded-2xl overflow-hidden p-5 md:p-7 flex flex-col justify-between min-h-[140px] md:min-h-[180px]"
               style={{ background: "linear-gradient(135deg, #7a4a00 0%, #d97706 100%)" }}>
            <div>
              <div className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Storage</div>
              <div className="text-white text-base md:text-xl font-bold leading-tight"
                   style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>升级<br />内存</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 opacity-80">
              <DeviceImage src="/images/devices/iphone-15-pro-max.jpg" alt="storage" sizes="80px" />
            </div>
            <div className="mt-3 text-[10px] md:text-xs text-white/60">扩容至 512GB · 数据无损</div>
          </div>
        </div>
      </section>

      {/* ══ REPAIR SECTIONS ════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-5 md:px-8 py-10 md:py-14 space-y-6">

        <RepairSection
          title="iPhone 手机维修"
          tabs={IPHONE_TABS}
          devices={IPHONE_DEVICES}
          moreHref="/repair/select?brand=apple"
        />

        <RepairSection
          title="安卓手机维修"
          tabs={ANDROID_TABS}
          devices={ANDROID_DEVICES}
          moreHref="/repair/select?brand=android"
        />

      </section>

    </div>
  );
}
