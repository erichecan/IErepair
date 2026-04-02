"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, MapPin, Star, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductResult {
  id: string; name: string; slug: string; type: string;
  imageUrls: string[] | null; minPrice: string; merchantCount: number;
}
interface MerchantResult {
  id: string; slug: string; shopName: string; city: string | null;
  eircode: string | null; rating: string | null; reviewCount: number;
  logoUrl: string | null; distance_km?: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [q, setQ]             = useState(searchParams.get("q") ?? "");
  const [eircode, setEircode] = useState(searchParams.get("eircode") ?? "");
  const [tab, setTab]         = useState<"all" | "product" | "merchant">("all");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [merchants, setMerchants] = useState<MerchantResult[]>([]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: tab });
      if (q)       params.set("q", q);
      if (eircode) params.set("eircode", eircode);
      const res  = await fetch(`/api/v1/public/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products ?? []);
        setMerchants(data.data.merchants ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [q, eircode, tab]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  function handleSearch() {
    const params = new URLSearchParams();
    if (q)       params.set("q", q);
    if (eircode) params.set("eircode", eircode);
    router.replace(`/search?${params.toString()}`);
    fetchResults();
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      {/* Search inputs */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search products or shops…"
            className="pl-9 bg-secondary border-border"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
            <Input
              value={eircode}
              onChange={(e) => setEircode(e.target.value.toUpperCase())}
              placeholder="Eircode"
              className="pl-8 bg-secondary border-border"
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary text-primary-foreground">Go</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-secondary w-full">
          <TabsTrigger value="all"      className="flex-1">All</TabsTrigger>
          <TabsTrigger value="product"  className="flex-1">Products</TabsTrigger>
          <TabsTrigger value="merchant" className="flex-1">Shops</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading && (
        <div className="text-center py-12 text-muted-foreground text-sm">Searching…</div>
      )}

      {/* Products */}
      {!loading && (tab === "all" || tab === "product") && products.length > 0 && (
        <section>
          {tab === "all" && <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Products</h2>}
          <div className="space-y-3">
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors">
                <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {p.imageUrls?.[0]
                    ? <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover" />
                    : <span className="text-2xl">📱</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.name}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{p.merchantCount} shop{p.merchantCount !== 1 ? "s" : ""}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-primary font-semibold text-sm">from €{p.minPrice}</div>
                  <Badge variant="secondary" className="text-[10px] mt-0.5">{p.type}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Merchants */}
      {!loading && (tab === "all" || tab === "merchant") && merchants.length > 0 && (
        <section>
          {tab === "all" && <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 mt-5">Shops</h2>}
          <div className="space-y-3">
            {merchants.map((m) => (
              <Link key={m.id} href={`/stores/${m.slug || m.id}`}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {m.logoUrl
                    ? <img src={m.logoUrl} alt={m.shopName} className="w-full h-full object-cover" />
                    : <span className="text-xl">🔧</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{m.shopName}</div>
                  <div className="text-muted-foreground text-xs mt-0.5 flex items-center gap-1">
                    <MapPin size={10} />{m.city ?? m.eircode ?? "Ireland"}
                    {m.distance_km !== undefined && ` · ${m.distance_km} km`}
                  </div>
                </div>
                {m.rating && parseFloat(m.rating) > 0 && (
                  <div className="flex items-center gap-1 text-sm shrink-0">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{parseFloat(m.rating).toFixed(1)}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {!loading && products.length === 0 && merchants.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search size={40} className="mx-auto mb-3 opacity-30" />
          <p>No results found</p>
          <p className="text-xs mt-1">Try a different search or Eircode</p>
        </div>
      )}
    </div>
  );
}
