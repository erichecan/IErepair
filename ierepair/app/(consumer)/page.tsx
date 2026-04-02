"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Smartphone, Battery, Shield, Headphones, Cable } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  { label: "Screen Repair",    icon: <Smartphone size={28} />,  q: "screen repair" },
  { label: "Battery",          icon: <Battery size={28} />,     q: "battery" },
  { label: "Accessories",      icon: <Shield size={28} />,      q: "case" },
  { label: "Earphones",        icon: <Headphones size={28} />,  q: "earphone" },
  { label: "Cables",           icon: <Cable size={28} />,       q: "cable" },
];

export default function HomePage() {
  const router = useRouter();
  const [q, setQ]             = useState("");
  const [eircode, setEircode] = useState("");

  function handleSearch() {
    const params = new URLSearchParams();
    if (q)       params.set("q", q);
    if (eircode) params.set("eircode", eircode);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero */}
      <div className="px-5 pt-14 pb-8 space-y-1">
        <div className="text-2xl font-heading font-bold text-primary">IERepair</div>
        <h1 className="text-3xl font-heading font-bold leading-tight">
          Find repairs &<br />accessories near you
        </h1>
        <p className="text-muted-foreground text-sm">
          Compare prices from local repair shops across Ireland
        </p>
      </div>

      {/* Search box */}
      <div className="px-5 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="iPhone 15 screen repair…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Eircode (D01 A234)"
            value={eircode}
            onChange={(e) => setEircode(e.target.value.toUpperCase())}
            className="bg-secondary border-border flex-1"
          />
          <Button onClick={handleSearch} className="bg-primary text-primary-foreground px-5 shrink-0">
            Search
          </Button>
        </div>
      </div>

      {/* Category grid */}
      <div className="px-5 mt-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Browse by Category
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => router.push(`/search?q=${encodeURIComponent(cat.q)}`)}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-card/80 transition-all"
            >
              <span className="text-primary">{cat.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-5 mt-10 pb-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
          How it works
        </h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Search", desc: "Enter your Eircode to find nearby shops" },
            { step: "2", title: "Compare", desc: "Compare prices, ratings and availability" },
            { step: "3", title: "Book",   desc: "Pay a 20% deposit to secure your slot" },
            { step: "4", title: "Repair", desc: "Bring your device and pay the balance" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/15 text-primary text-sm font-bold flex items-center justify-center shrink-0">
                {item.step}
              </div>
              <div>
                <div className="font-semibold text-sm">{item.title}</div>
                <div className="text-muted-foreground text-xs">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
