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
  { num: "01", label: "Select Device" },
  { num: "02", label: "Describe Issue" },
  { num: "03", label: "Service Details" },
  { num: "04", label: "Booking Confirmed" },
];

/* ── Filter data ─────────────────────────────────────────── */
const CATEGORIES = ["Phone", "Tablet", "Laptop"];

const BRANDS: Record<string, string[]> = {
  Phone:  ["All", "Apple", "Samsung", "Google", "OnePlus"],
  Tablet: ["All", "Apple", "Samsung"],
  Laptop: ["All", "Apple"],
};

const SERIES: Record<string, string[]> = {
  Apple: [
    "All",
    "iPhone 17 Series",
    "iPhone 16 Series",
    "iPhone 15 Series",
    "iPhone 14 Series",
    "iPhone 13 Series",
    "iPhone 12 Series",
    "iPhone SE",
  ],
  Samsung: [
    "All",
    "Samsung A Series",
    "Samsung S Series",
    "Samsung Note Series",
  ],
  Google: [
    "All",
    "Pixel 9 Series",
    "Pixel 8 Series",
    "Pixel 7 Series",
    "Pixel 6 Series",
  ],
  OnePlus: [
    "All",
    "OnePlus Nord",
    "OnePlus 11",
    "OnePlus 9",
    "OnePlus 8",
    "OnePlus 7",
    "OnePlus 6",
  ],
  All: ["All"],
};

/* ── Devices ─────────────────────────────────────────────── */
type Device = { name: string; img: string };

const DEVICES: Record<string, Device[]> = {
  "iPhone 17 Series": [
    { name: "iPhone 17 Pro Max", img: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg" },
    { name: "iPhone 17 Pro",     img: "/images/devices/20260212-b343f23593034e68a71eac0b6d406231.jpg" },
    { name: "iPhone 17 Air",     img: "/images/devices/20260212-359f240e170b42eaa3c3fec88c3ba6ea.jpg" },
    { name: "iPhone 17",         img: "/images/devices/20260212-102964fe4520426883ab93495ee129c0.jpg" },
  ],
  "iPhone 16 Series": [
    { name: "iPhone 16 Pro Max", img: "/images/devices/20260130-fd642547587e400fa3c4b23312f1b01f.jpg" },
    { name: "iPhone 16 Pro",     img: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" },
    { name: "iPhone 16 Plus",    img: "/images/devices/20260107-2d8be6684e6e4372ae276f99fdea69be.jpg" },
    { name: "iPhone 16",         img: "/images/devices/20260129-30d60af62d76447c94dfe72633032498.png" },
    { name: "iPhone 16E",        img: "/images/devices/20260130-c6c58f9b2c7e406f8c68be95bb6b715f.jpg" },
  ],
  "iPhone 15 Series": [
    { name: "iPhone 15 Pro Max", img: "/images/devices/20260130-3ef40111e5b945a59b345f5331e131ec.jpg" },
    { name: "iPhone 15 Pro",     img: "/images/devices/20260130-0f4e1c1ea819483188611bcfca5d321d.jpg" },
    { name: "iPhone 15 Plus",    img: "/images/devices/20260130-5b4586e8a4db4c479c247b7787eb65c8.jpg" },
    { name: "iPhone 15",         img: "/images/devices/20260130-59cfd46bee8246c2adcfc891c845ecd0.jpg" },
  ],
  "iPhone 14 Series": [
    { name: "iPhone 14 Pro Max", img: "/images/devices/20260130-3af9e59175c441a0afc5d18a6911dea9.jpg" },
    { name: "iPhone 14 Pro",     img: "/images/devices/20260130-5a35258e1c884fcd964e60c9928672cd.jpg" },
    { name: "iPhone 14 Plus",    img: "/images/devices/20260130-844813bdbfac4879b3a675b13285a909.jpg" },
    { name: "iPhone 14",         img: "/images/devices/20260130-85895e00fe9049e3b911f95173564d1e.jpg" },
  ],
  "iPhone 13 Series": [
    { name: "iPhone 13 Pro Max", img: "/images/devices/20260130-ed78eeff557d45058384b891a7dc55f8.jpg" },
    { name: "iPhone 13 Pro",     img: "/images/devices/20260130-9170c12e89fd4a3c9567587c628ad790.jpg" },
    { name: "iPhone 13 mini",    img: "/images/devices/20260130-6d39cb3e46714217b4d1e40547a2c73c.jpg" },
    { name: "iPhone 13",         img: "/images/devices/20260130-4e7d0db00ebe4839bac54b05009e904d.jpg" },
  ],
  "iPhone 12 Series": [
    { name: "iPhone 12 Pro Max", img: "/images/devices/20260130-e6586b8ea498402398827fe5c6e47c12.jpg" },
    { name: "iPhone 12 Pro",     img: "/images/devices/20260130-d53e65bb0d4948e5b4666c99824f1395.jpg" },
    { name: "iPhone 12 mini",    img: "/images/devices/20260130-2ad95b146e074f46bc405190552ac0ec.jpg" },
    { name: "iPhone 12",         img: "/images/devices/20260130-bf417b745a0a4c70b89edabda0c3c0cd.jpg" },
  ],
  "iPhone SE": [
    { name: "iPhone SE (3rd gen)", img: "/images/devices/20260203-896091a9cd7943b2bfda4bd91f49ded2.jpg" },
    { name: "iPhone SE (2020)",    img: "/images/devices/20260203-0bf6e894ebc649e9be563f20b254a4e4.jpg" },
  ],
  "Samsung A Series": [
    { name: "Samsung A56", img: "/images/devices/20260203-f35da7298c324432b4230d38ba11022a.jpg" },
    { name: "Samsung A55", img: "/images/devices/20260203-4eba28135ca845fb894b2b5f47e37325.jpg" },
    { name: "Samsung A54", img: "/images/devices/20260203-37796a5c0e454d7da6b1db4274f1cd07.jpg" },
    { name: "Samsung A53", img: "/images/devices/20260203-a881de20a01e47f2b9cd951c3c102835.jpg" },
    { name: "Samsung A52", img: "/images/devices/20260203-07563c602c8c49259a8988deed6d20dc.jpg" },
    { name: "Samsung A51", img: "/images/devices/20260203-5301bfa8314f4dce84493089ab0d14ae.jpg" },
    { name: "Samsung A36", img: "/images/devices/20260205-7bd2c3038e804c9796705ca5d1199950.jpg" },
    { name: "Samsung A35", img: "/images/devices/20260205-bc8b1ad76eea4230b91231373d93d268.jpg" },
    { name: "Samsung A34", img: "/images/devices/20260205-fec80290ba42413c896cbbd4acac53cc.jpg" },
    { name: "Samsung A33", img: "/images/devices/20260205-a952e78512cc473d8f8bdeebecf810b7.jpg" },
    { name: "Samsung A32", img: "/images/devices/20260205-b7ff9eae7b90428fb77f205cd5fa454d.jpg" },
    { name: "Samsung A26", img: "/images/devices/20260205-c248672f67294e9fb41032a1e33d2577.jpg" },
    { name: "Samsung A25", img: "/images/devices/20260205-4dcfd97797664a7ca45892b3cf211819.jpg" },
    { name: "Samsung A24", img: "/images/devices/20260205-e76dd04ae3a54655b5e0b7c6bb8adc44.png" },
    { name: "Samsung A23", img: "/images/devices/20260205-3f125868d37c41be8149be6862faedf1.jpg" },
    { name: "Samsung A22", img: "/images/devices/20260205-b670e5a2467a499c86eb1cf8852800e6.jpg" },
    { name: "Samsung A16", img: "/images/devices/20260205-54932b57db034201ba8898e60ffbdab1.jpg" },
    { name: "Samsung A15", img: "/images/devices/20260205-30273798a0d4428b8432093350626f0f.jpg" },
    { name: "Samsung A14", img: "/images/devices/20260205-e4f14007e9c8449cb6322628aba173cd.jpg" },
    { name: "Samsung A13", img: "/images/devices/20260205-2e76d9f3a96b456f87e6f0ffa73603b4.jpg" },
  ],
  "Samsung S Series": [
    { name: "Samsung S25 Ultra", img: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg" },
    { name: "Samsung S25 Plus",  img: "/images/devices/20260205-b71e22efe7784a439e035cd1f95d1747.jpg" },
    { name: "Samsung S25 Edge",  img: "/images/devices/20260205-5a377571f20742c2a1edcf808bda2a53.jpg" },
    { name: "Samsung S25",       img: "/images/devices/20260205-15002c23bfae4dadad3aacdfdaf2bf80.jpg" },
    { name: "Samsung S24 Ultra", img: "/images/devices/20260205-f08ce3481344431e85f43adaa7c55e6f.jpg" },
    { name: "Samsung S24 Plus",  img: "/images/devices/20260205-deca9cf81b904f7d84906d9b5f678666.jpg" },
    { name: "Samsung S24 FE",    img: "/images/devices/20260205-1ac90487f751428ea9e1e01651c2357a.jpg" },
    { name: "Samsung S24",       img: "/images/devices/20260205-09549cb3b4df4eefb24545a541463ab7.jpg" },
    { name: "Samsung S23 Ultra", img: "/images/devices/20260205-cfae4d4fbc384535b86a279094cc48a7.jpg" },
    { name: "Samsung S23 Plus",  img: "/images/devices/20260205-fed3f85892e244d8a55b63d32be31e0a.jpg" },
    { name: "Samsung S23 FE",    img: "/images/devices/20260205-65a546d6b596455b806b5ec3db49c995.jpg" },
    { name: "Samsung S23",       img: "/images/devices/20260205-f9a524276f314a1fa62ef632d2243546.jpg" },
    { name: "Samsung S22 Ultra", img: "/images/devices/20260205-259323e7910b4c658da5188cbeeef681.jpg" },
    { name: "Samsung S22 Plus",  img: "/images/devices/20260205-850b36f248c84cadac1e2dbbaf777062.jpg" },
    { name: "Samsung S22",       img: "/images/devices/20260205-10d2227730fa48d8b435a0ba147614a5.jpg" },
    { name: "Samsung S21 Ultra", img: "/images/devices/20260205-2b3db549a676478d8cb74271aa61f50e.jpg" },
    { name: "Samsung S21 FE",    img: "/images/devices/20260205-76a3893ae35644bea49d0c936d6605dd.jpg" },
    { name: "Samsung S21",       img: "/images/devices/20260205-d801c203ef484c7ca26b90874bab8db7.jpg" },
    { name: "Samsung S20 Ultra", img: "/images/devices/20260209-15b79e06e7f64dbdafe6a8d74b7c3a42.jpg" },
    { name: "Samsung S20",       img: "/images/devices/20260209-22ef49fd9ea54c308ce381bc982235e6.jpg" },
  ],
  "Samsung Note Series": [
    { name: "Samsung Note 20 Ultra", img: "/images/devices/20260209-96f88a004dcb48488620c70805cc358c.jpg" },
    { name: "Samsung Note 20",       img: "/images/devices/20260209-4609af5b3708477f928d2edef067f7a3.jpg" },
    { name: "Samsung Note 10 Plus",  img: "/images/devices/20260209-eb1a955a91d74d6b8df197bfae6975b0.jpg" },
    { name: "Samsung Note 10",       img: "/images/devices/20260209-788d04df0ca940119db3c1c19fbafc86.jpg" },
    { name: "Samsung Note 9",        img: "/images/devices/20260209-f39b3633cde140589f7f9c400bdd3f02.jpg" },
  ],
  "Pixel 9 Series": [
    { name: "Google Pixel 9 Pro XL", img: "/images/devices/20260209-e288b28578c34ea1ba493f5f6f052f1a.jpg" },
    { name: "Google Pixel 9 Pro",    img: "/images/devices/20260209-959958bcbf6e4b9886d80b6f1b1cebef.jpg" },
    { name: "Google Pixel 9A",       img: "/images/devices/20260209-5c5103beedd241918b27284a26bacf8a.jpg" },
    { name: "Google Pixel 9",        img: "/images/devices/20260209-79421e4727fd450c8d991ed10f8e23e3.jpg" },
  ],
  "Pixel 8 Series": [
    { name: "Google Pixel 8 Pro", img: "/images/devices/20260209-2f4e257fd70c4ebda508a56845fc0d98.jpg" },
    { name: "Google Pixel 8A",    img: "/images/devices/20260209-f4491437cc3b42929553da359d9d1489.jpg" },
    { name: "Google Pixel 8",     img: "/images/devices/20260209-e7830b6df0d449d6990cbf354bf801cb.jpg" },
  ],
  "Pixel 7 Series": [
    { name: "Google Pixel 7 Pro", img: "/images/devices/20260209-8d327454a49a4460903d0aeed906a5ba.jpg" },
    { name: "Google Pixel 7A",    img: "/images/devices/20260209-fa9c9bc0f57e4f4080d4bea11c3e9470.png" },
    { name: "Google Pixel 7",     img: "/images/devices/20260209-8292c1803a1b4a758e5628e4ff2130f2.jpg" },
  ],
  "Pixel 6 Series": [
    { name: "Google Pixel 6 Pro", img: "/images/devices/20260209-a85524b3e3814d1e9e37b535ece98b04.jpg" },
    { name: "Google Pixel 6A",    img: "/images/devices/20260209-d6d5fd82893442548668274f2949fc26.jpg" },
    { name: "Google Pixel 6",     img: "/images/devices/20260209-bd98d715048f4643bb2ca1cfffc24b4e.jpg" },
  ],
  "OnePlus Nord": [
    { name: "OnePlus Nord 2T",  img: "/images/devices/20260209-d464294e6d1344dfb1dd68d48b5897df.png" },
    { name: "OnePlus Nord 2",   img: "/images/devices/20260209-7a03eae94b604b59b497500f3d013e41.jpg" },
    { name: "OnePlus Nord",     img: "/images/devices/20260209-85bb246bfb454e839c7dd91bff656506.jpg" },
    { name: "OnePlus CE 5G",    img: "/images/devices/20260209-8bf25f15815846be81b44976f6788e81.jpg" },
    { name: "OnePlus CE2 5G",   img: "/images/devices/20260209-ccd94c3eba514d58b15806a8328a1b01.png" },
    { name: "OnePlus CE2 Lite", img: "/images/devices/20260209-4ae7a0297101497282714e9bacdc7209.jpg" },
  ],
  "OnePlus 11": [
    { name: "OnePlus 11 5G",   img: "/images/devices/20260209-6697bde84f954c4e845de9b7015871a7.png" },
    { name: "OnePlus 10T Pro", img: "/images/devices/20260209-5fb542a6145d4d12a5095754ce39f3c3.jpg" },
    { name: "OnePlus 10T",     img: "/images/devices/20260209-a970d63324d843b09d917b60785cf574.png" },
  ],
  "OnePlus 9": [
    { name: "OnePlus 9 Pro", img: "/images/devices/20260209-29418b331afd4647802763aad4b45025.jpg" },
    { name: "OnePlus 9",     img: "/images/devices/20260209-dafc98593c5a4918be1839c33b7533df.jpg" },
  ],
  "OnePlus 8": [
    { name: "OnePlus 8 Pro", img: "/images/devices/20260209-f33d5b0d26254f0eaf0fa454abf3974f.jpg" },
    { name: "OnePlus 8T",    img: "/images/devices/20260209-0ba3fc55bab94ce1bae504231d22f10d.jpg" },
    { name: "OnePlus 8",     img: "/images/devices/20260209-d75ec32500f14bfc9e7530872f892508.jpg" },
  ],
  "OnePlus 7": [
    { name: "OnePlus 7 Pro", img: "/images/devices/20260209-e8823b5010274226a2ef2674c436833a.jpg" },
    { name: "OnePlus 7T",    img: "/images/devices/20260209-1ab961c552cd477c8fd8000826a43ada.jpg" },
    { name: "OnePlus 7",     img: "/images/devices/20260209-3d1f6b6c24bf408b804a52a72f20837a.png" },
  ],
  "OnePlus 6": [
    { name: "OnePlus 6T", img: "/images/devices/20260209-10c7c63bc98a476e919123abff1a203d.jpg" },
    { name: "OnePlus 6",  img: "/images/devices/20260209-11a41679a95f49a1b2ef318d35fbd505.jpg" },
  ],
};

/* ── Fallback devices ─────────────────────────────────────── */
const DEFAULT_DEVICES: Device[] = [
  { name: "iPhone 17 Pro Max", img: "/images/devices/20260212-9a5cef9e3bc4480d910af7d07380e001.jpg" },
  { name: "iPhone 17 Pro",     img: "/images/devices/20260212-b343f23593034e68a71eac0b6d406231.jpg" },
  { name: "iPhone 16 Pro Max", img: "/images/devices/20260130-fd642547587e400fa3c4b23312f1b01f.jpg" },
  { name: "iPhone 16 Pro",     img: "/images/devices/20260130-499c3126bbb54779933327e617e7c7a7.jpg" },
  { name: "iPhone 15 Pro Max", img: "/images/devices/20260130-3ef40111e5b945a59b345f5331e131ec.jpg" },
  { name: "iPhone 15 Pro",     img: "/images/devices/20260130-0f4e1c1ea819483188611bcfca5d321d.jpg" },
  { name: "Samsung S25 Ultra", img: "/images/devices/20260205-d668a073f19b43a0babc3ebf878b56af.jpg" },
  { name: "Samsung A56",       img: "/images/devices/20260203-f35da7298c324432b4230d38ba11022a.jpg" },
  { name: "Google Pixel 9 Pro",img: "/images/devices/20260209-959958bcbf6e4b9886d80b6f1b1cebef.jpg" },
  { name: "OnePlus 11 5G",     img: "/images/devices/20260209-6697bde84f954c4e845de9b7015871a7.png" },
];

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function SelectDeviceContent() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams.get("brand") === "android" ? "Samsung" : "Apple";

  const [category, setCategory] = useState("Phone");
  const [brand,    setBrand]    = useState(initialBrand);
  const [series,   setSeries]   = useState("All");

  const brandList  = BRANDS[category]  ?? ["All"];
  const seriesList = SERIES[brand]     ?? ["All"];

  const activeSeries = series === "All" ? null : series;
  const visibleDevices = activeSeries
    ? (DEVICES[activeSeries] ?? DEFAULT_DEVICES)
    : Object.values(DEVICES).flat().slice(0, 24);

  function handleBrandChange(b: string) {
    setBrand(b);
    setSeries("All");
  }

  function handleCategoryChange(c: string) {
    setCategory(c);
    setBrand("All");
    setSeries("All");
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">

      {/* ── Top bar ──────────────────────────────────────── */}
      <div className="bg-white border-b border-[rgba(34,42,53,0.08)] px-5 md:px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs text-[#898989]">
          <Link href="/" className="hover:text-[#242424] transition-colors">Home</Link>
          <ChevronRight size={12} />
          <span className="text-[#242424] font-medium">Select Device</span>
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

          {/* Category */}
          <div className="flex items-start gap-4 py-3">
            <span className="text-xs text-[#898989] font-medium shrink-0 pt-1 w-14">Category</span>
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

          {/* Brand */}
          <div className="flex items-start gap-4 py-3">
            <span className="text-xs text-[#898989] font-medium shrink-0 pt-1 w-14">Brand</span>
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

          {/* Series */}
          <div className="flex items-start gap-4 py-3">
            <span className="text-xs text-[#898989] font-medium shrink-0 pt-1 w-14">Series</span>
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
          <span className="text-[#242424] font-semibold">{visibleDevices.length}</span> devices found
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {visibleDevices.map((device) => (
            <Link
              key={device.name}
              href={`/repair/browse?brand=${encodeURIComponent(brand)}`}
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
