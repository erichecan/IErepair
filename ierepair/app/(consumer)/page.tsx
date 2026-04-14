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
  { icon: <Star        size={15} className="text-yellow-400 fill-yellow-400" />, value: "99%",   label: "5-Star Reviews" },
  { icon: <Clock       size={15} className="text-blue-400"  />,                  value: "30 min", label: "Express Repair" },
  { icon: <Stethoscope size={15} className="text-green-400" />,                  value: "Free",   label: "Free Diagnosis" },
  { icon: <ShieldCheck size={15} className="text-purple-400"/>,                  value: "0 Risk", label: "No Fix No Fee" },
];

/* ── Types ────────────────────────────────────────────── */
type Device = { name: string; desc: string; price: string; img: string };

/* ── iPhone repair data ───────────────────────────────── */
const IPHONE_TABS = ["Screen Repair", "Battery Replacement", "Storage Upgrade", "Back Cover"];

const IPHONE_DEVICES: Record<string, Device[]> = {
  "Screen Repair": [
    { name: "iPhone 17 Pro Max", desc: "OLED screen replacement, OEM quality, express repair", price: "€195", img: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg" },
    { name: "iPhone 17 Pro",     desc: "OLED screen replacement, OEM quality, express repair", price: "€195", img: "/images/devices/20260212-b343f23593034e68a71eac0b6d406231.jpg" },
    { name: "iPhone 17",         desc: "Screen replacement, 180-day warranty",                 price: "€100", img: "/images/devices/20260212-102964fe4520426883ab93495ee129c0.jpg" },
    { name: "iPhone 16 Plus",    desc: "OLED screen replacement, trade-in available",           price: "€120", img: "/images/devices/20260107-2d8be6684e6e4372ae276f99fdea69be.jpg" },
    { name: "iPhone 16 Pro",     desc: "OLED screen replacement, OEM quality",                 price: "€120", img: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" },
    { name: "iPhone 16E",        desc: "Screen replacement, 180-day warranty",                 price: "€80",  img: "/images/devices/20260130-c6c58f9b2c7e406f8c68be95bb6b715f.jpg" },
  ],
  "Battery Replacement": [
    { name: "iPhone 16 Plus",    desc: "OEM equivalent battery, restore like-new battery life", price: "€80",  img: "/images/devices/20260107-2d8be6684e6e4372ae276f99fdea69be.jpg" },
    { name: "iPhone 16",         desc: "OEM equivalent battery, restore like-new battery life", price: "€80",  img: "/images/devices/20260129-30d60af62d76447c94dfe72633032498.png" },
    { name: "iPhone 16 Pro Max", desc: "Swollen / poor battery life, done in 30 minutes",      price: "€90",  img: "/images/devices/20260130-fd642547587e400fa3c4b23312f1b01f.jpg" },
    { name: "iPhone 16 Pro",     desc: "Swollen / poor battery life, done in 30 minutes",      price: "€90",  img: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" },
    { name: "iPhone 15 Pro",     desc: "Swollen / poor battery life, done in 30 minutes",      price: "€80",  img: "/images/devices/20260130-0f4e1c1ea819483188611bcfca5d321d.jpg" },
    { name: "iPhone 15 Pro Max", desc: "Swollen / poor battery life, done in 30 minutes",      price: "€80",  img: "/images/devices/20260130-3ef40111e5b945a59b345f5331e131ec.jpg" },
  ],
  "Storage Upgrade": [
    { name: "iPhone 17 Pro Max", desc: "Running out of storage? Upgrade to 512GB",             price: "€199", img: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg" },
    { name: "iPhone 17 Pro",     desc: "Running out of storage? Upgrade to 256GB",             price: "€159", img: "/images/devices/20260212-b343f23593034e68a71eac0b6d406231.jpg" },
    { name: "iPhone 16 Pro",     desc: "Running out of storage? Upgrade to 256GB",             price: "€149", img: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" },
    { name: "iPhone 15 Pro Max", desc: "Running out of storage? Upgrade to 512GB",             price: "€189", img: "/images/devices/20260130-3ef40111e5b945a59b345f5331e131ec.jpg" },
    { name: "iPhone 15 Pro",     desc: "Running out of storage? Upgrade to 256GB",             price: "€149", img: "/images/devices/20260130-0f4e1c1ea819483188611bcfca5d321d.jpg" },
    { name: "iPhone 14 Pro",     desc: "Running out of storage? Upgrade to 256GB",             price: "€139", img: "/images/devices/20260130-5a35258e1c884fcd964e60c9928672cd.jpg" },
  ],
  "Back Cover": [
    { name: "iPhone 17 Pro Max", desc: "Cracked back glass, OEM replacement",                  price: "€149", img: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg" },
    { name: "iPhone 16 Plus",    desc: "Cracked back glass, OEM replacement",                  price: "€129", img: "/images/devices/20260107-2d8be6684e6e4372ae276f99fdea69be.jpg" },
    { name: "iPhone 16 Pro",     desc: "Cracked back glass, OEM replacement",                  price: "€139", img: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" },
    { name: "iPhone 15 Pro Max", desc: "Cracked back glass, OEM replacement",                  price: "€149", img: "/images/devices/20260130-3ef40111e5b945a59b345f5331e131ec.jpg" },
    { name: "iPhone 15 Pro",     desc: "Cracked back glass, OEM replacement",                  price: "€129", img: "/images/devices/20260130-0f4e1c1ea819483188611bcfca5d321d.jpg" },
    { name: "iPhone 14 Pro Max", desc: "Cracked back glass, OEM replacement",                  price: "€139", img: "/images/devices/20260130-3af9e59175c441a0afc5d18a6911dea9.jpg" },
  ],
};

/* ── Android repair data ─────────────────────────────── */
const ANDROID_TABS = ["Samsung A Series", "Samsung S Series", "Google Pixel", "OnePlus"];

const ANDROID_DEVICES: Record<string, Device[]> = {
  "Samsung A Series": [
    { name: "Samsung A56",   desc: "Screen replacement, OEM quality, 30 min", price: "€140", img: "/images/devices/20260203-f35da7298c324432b4230d38ba11022a.jpg" },
    { name: "Samsung A55",   desc: "Screen replacement, OEM quality, 30 min", price: "€130", img: "/images/devices/20260203-4eba28135ca845fb894b2b5f47e37325.jpg" },
    { name: "Samsung A54",   desc: "Screen replacement, OEM quality, 30 min", price: "€130", img: "/images/devices/20260203-37796a5c0e454d7da6b1db4274f1cd07.jpg" },
    { name: "Samsung A53",   desc: "Screen replacement, 180-day warranty",    price: "€130", img: "/images/devices/20260203-a881de20a01e47f2b9cd951c3c102835.jpg" },
    { name: "Samsung A52",   desc: "Screen replacement, 180-day warranty",    price: "€120", img: "/images/devices/20260203-07563c602c8c49259a8988deed6d20dc.jpg" },
    { name: "Samsung A51",   desc: "Screen replacement, 180-day warranty",    price: "€95",  img: "/images/devices/20260203-5301bfa8314f4dce84493089ab0d14ae.jpg" },
  ],
  "Samsung S Series": [
    { name: "Samsung S25 Ultra",  desc: "OLED screen replacement, trade-in available",   price: "€280", img: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg" },
    { name: "Samsung S25 Plus",   desc: "OLED screen replacement, trade-in available",   price: "€250", img: "/images/devices/20260205-b71e22efe7784a439e035cd1f95d1747.jpg" },
    { name: "Samsung S24 Ultra",  desc: "OLED screen replacement, trade-in available",   price: "€260", img: "/images/devices/20260205-f08ce3481344431e85f43adaa7c55e6f.jpg" },
    { name: "Samsung S24 Plus",   desc: "OLED screen replacement, trade-in available",   price: "€230", img: "/images/devices/20260205-deca9cf81b904f7d84906d9b5f678666.jpg" },
    { name: "Samsung S23 Ultra",  desc: "OLED screen replacement, 180-day warranty",     price: "€250", img: "/images/devices/20260205-cfae4d4fbc384535b86a279094cc48a7.jpg" },
    { name: "Samsung S22 Ultra",  desc: "OLED screen replacement, 180-day warranty",     price: "€220", img: "/images/devices/20260205-259323e7910b4c658da5188cbeeef681.jpg" },
  ],
  "Google Pixel": [
    { name: "Google Pixel 9 Pro", desc: "Screen replacement, OEM quality, 30 min", price: "€180", img: "/images/devices/20260209-959958bcbf6e4b9886d80b6f1b1cebef.jpg" },
    { name: "Google Pixel 9",     desc: "Screen replacement, 180-day warranty",    price: "€160", img: "/images/devices/20260209-79421e4727fd450c8d991ed10f8e23e3.jpg" },
    { name: "Google Pixel 8 Pro", desc: "Screen replacement, 180-day warranty",    price: "€170", img: "/images/devices/20260209-2f4e257fd70c4ebda508a56845fc0d98.jpg" },
    { name: "Google Pixel 8",     desc: "Screen replacement, 180-day warranty",    price: "€150", img: "/images/devices/20260209-e7830b6df0d449d6990cbf354bf801cb.jpg" },
    { name: "Google Pixel 7 Pro", desc: "Screen replacement, 180-day warranty",    price: "€150", img: "/images/devices/20260209-8d327454a49a4460903d0aeed906a5ba.jpg" },
    { name: "Google Pixel 7",     desc: "Screen replacement, 180-day warranty",    price: "€160", img: "/images/devices/20260209-8292c1803a1b4a758e5628e4ff2130f2.jpg" },
  ],
  "OnePlus": [
    { name: "OnePlus 8",    desc: "Screen replacement, 180-day warranty",    price: "€130", img: "/images/devices/20260209-d75ec32500f14bfc9e7530872f892508.jpg" },
    { name: "OnePlus 7T",   desc: "Screen replacement, 180-day warranty",    price: "€110", img: "/images/devices/20260209-1ab961c552cd477c8fd8000826a43ada.jpg" },
    { name: "OnePlus 7 Pro",desc: "OLED screen replacement, trade-in available", price: "€160", img: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg" },
    { name: "OnePlus 7",    desc: "Screen replacement, 180-day warranty",    price: "€95",  img: "/images/devices/20260209-3d1f6b6c24bf408b804a52a72f20837a.png" },
    { name: "OnePlus 6T",   desc: "Screen replacement, 180-day warranty",    price: "€90",  img: "/images/devices/20260209-10c7c63bc98a476e919123abff1a203d.jpg" },
    { name: "OnePlus 6",    desc: "Screen replacement, 180-day warranty",    price: "€90",  img: "/images/devices/20260209-11a41679a95f49a1b2ef318d35fbd505.jpg" },
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

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* ── Device Card ─────────────────────────────────────── */
function DeviceCard({ name, desc, price, img }: Device) {
  return (
    <Link
      href={`/repair/device/${slugify(name)}`}
      className="shrink-0 w-36 md:w-44 bg-white rounded-xl overflow-hidden hover:scale-[1.02] transition-transform"
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
    </Link>
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
          More
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
        {/* "More models" card */}
        <Link
          href={moreHref}
          className="shrink-0 w-28 h-36 md:h-44 bg-[#f8f8f8] rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-[#f0f0f0] transition-colors"
          style={{ boxShadow: "rgba(34,42,53,0.08) 0px 0px 0px 1px" }}
        >
          <span className="w-10 h-10 rounded-full border-2 border-[rgba(34,42,53,0.2)] flex items-center justify-center text-[#898989]">
            <ChevronRight size={18} />
          </span>
          <span className="text-xs text-[#898989] font-medium">More Models</span>
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
    // If there's a device keyword, try to navigate to the device repair page
    if (q.trim()) {
      const deviceSlug = q.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      router.push(`/repair/device/${deviceSlug}`);
      return;
    }
    const params = new URLSearchParams();
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

        <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-12 md:pt-20 pb-0">
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
            Find a trusted repair<br />
            <span className="text-white/55">shop near you</span>
          </h1>
          <p className="text-white/45 text-sm md:text-base font-light max-w-md mb-7">
            Compare prices and ratings from repair shops across Ireland. Book online and pay just a 20% deposit to secure your slot.
          </p>

          {/* Search */}
          <div className="max-w-xl space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                placeholder="e.g. iPhone 15 screen repair…"
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
                Search
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
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 pt-10 md:pt-14 pb-2">
        <div className="grid grid-cols-3 gap-3 md:gap-5">
          {/* Battery — green */}
          <Link href="/repair/list/battery"
               className="relative rounded-2xl overflow-hidden p-5 md:p-7 flex flex-col justify-between min-h-[140px] md:min-h-[180px] hover:opacity-90 transition-opacity"
               style={{ background: "linear-gradient(135deg, #1a6b3c 0%, #22a85c 100%)" }}>
            <div>
              <div className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Battery</div>
              <div className="text-white text-base md:text-xl font-bold leading-tight"
                   style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>Battery<br />Replacement</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 opacity-80">
              <DeviceImage src="/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" alt="battery" sizes="80px" />
            </div>
            <div className="mt-3 text-[10px] md:text-xs text-white/60">Done in 30 min · OEM quality</div>
          </Link>

          {/* Screen — blue */}
          <Link href="/repair/list/screen"
               className="relative rounded-2xl overflow-hidden p-5 md:p-7 flex flex-col justify-between min-h-[140px] md:min-h-[180px] hover:opacity-90 transition-opacity"
               style={{ background: "linear-gradient(135deg, #1a3a6b 0%, #2258c8 100%)" }}>
            <div>
              <div className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Screen</div>
              <div className="text-white text-base md:text-xl font-bold leading-tight"
                   style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>Screen<br />Replacement</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 opacity-80">
              <DeviceImage src="/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg" alt="screen" sizes="80px" />
            </div>
            <div className="mt-3 text-[10px] md:text-xs text-white/60">Same-day repair · 180-day warranty</div>
          </Link>

          {/* Storage — amber */}
          <Link href="/repair/list/back-glass"
               className="relative rounded-2xl overflow-hidden p-5 md:p-7 flex flex-col justify-between min-h-[140px] md:min-h-[180px] hover:opacity-90 transition-opacity"
               style={{ background: "linear-gradient(135deg, #7a4a00 0%, #d97706 100%)" }}>
            <div>
              <div className="text-white/70 text-[10px] md:text-xs font-semibold uppercase tracking-widest mb-1">Storage</div>
              <div className="text-white text-base md:text-xl font-bold leading-tight"
                   style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>Storage<br />Upgrade</div>
            </div>
            <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 opacity-80">
              <DeviceImage src="/images/devices/20260130-3ef40111e5b945a59b345f5331e131ec.jpg" alt="storage" sizes="80px" />
            </div>
            <div className="mt-3 text-[10px] md:text-xs text-white/60">Up to 512GB · data safe</div>
          </Link>
        </div>
      </section>

      {/* ══ REPAIR SECTIONS ════════════════════════════════ */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 xl:px-16 py-10 md:py-14 space-y-6">

        <RepairSection
          title="iPhone Repair"
          tabs={IPHONE_TABS}
          devices={IPHONE_DEVICES}
          moreHref="/repair/list/screen?brand=apple"
        />

        <RepairSection
          title="Android Repair"
          tabs={ANDROID_TABS}
          devices={ANDROID_DEVICES}
          moreHref="/repair/list/screen?brand=android"
        />

        {/* ── Browse All CTA ─────────────────────────── */}
        <div className="text-center mt-8">
          <Link
            href="/repair/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#242424] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Browse All Devices
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>

      </section>

    </div>
  );
}
