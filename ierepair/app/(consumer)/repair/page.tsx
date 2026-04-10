"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

interface Service {
  serviceId: string; serviceName: string; deviceModel: string | null;
  deviceBrand: string | null; price: string; depositAmount: string;
  estimatedMin: number | null; merchantServiceId: string;
}
interface Store {
  id: string; slug: string; shopName: string; city: string | null;
  logoUrl: string | null; rating: string | null; services: Service[];
}

function RepairPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const storeId      = searchParams.get("storeId");

  const [q, setQ]         = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/v1/public/search?type=merchant&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success) setStores(data.data.merchants ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [q]);

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-heading font-bold">Book a Repair</h1>
      </div>

      {/* Search stores */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search by shop name or area…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 bg-secondary border-border"
        />
      </div>

      {loading && <div className="text-center py-10 text-muted-foreground text-sm">Loading shops…</div>}

      {/* Stores with their services */}
      {!loading && stores.map((store) => (
        <div key={store.id} className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
              {store.logoUrl
                ? <img src={store.logoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : <span className="text-lg">🔧</span>}
            </div>
            <div>
              <div className="font-semibold text-sm">{store.shopName}</div>
              <div className="text-xs text-muted-foreground">{store.city ?? "Ireland"}</div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {/* We'll fetch store services by linking to store page */}
            <button
              onClick={() => router.push(`/repair/book?storeId=${store.id}&storeName=${encodeURIComponent(store.shopName)}`)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <span className="text-sm">View all repair services</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}

      {!loading && stores.length === 0 && (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No shops found. Try a different search or enter your Eircode on the home page.
        </div>
      )}
    </div>
  );
}

export default function RepairPage() {
  return (
    <Suspense>
      <RepairPageInner />
    </Suspense>
  );
}
