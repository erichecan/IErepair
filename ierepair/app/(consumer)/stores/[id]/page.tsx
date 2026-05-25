import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, Clock, Phone, ArrowLeft, Wrench, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function getStore(id: string) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res  = await fetch(`${base}/api/v1/public/stores/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

const DAY_LABELS: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
  fri: "Fri", sat: "Sat", sun: "Sun",
};

export default async function StorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const result  = await getStore(id);
  if (!result)  notFound();

  const { merchant, products, services } = result;
  const hours = merchant.businessHours as Record<string, { open: boolean; from: string; to: string }> | null;

  return (
    <div className="pb-8">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link href="/search?type=merchant" className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {/* Cover / header */}
      <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden bg-card h-32">
        {merchant.coverUrl
          ? <img src={merchant.coverUrl} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary" />}
      </div>

      {/* Shop info */}
      <div className="px-4 -mt-6 relative">
        <div className="w-16 h-16 rounded-2xl bg-secondary border-2 border-background flex items-center justify-center overflow-hidden">
          {merchant.logoUrl
            ? <img src={merchant.logoUrl} alt={merchant.shopName} className="w-full h-full object-cover" />
            : <span className="text-3xl">🔧</span>}
        </div>
        <h1 className="text-xl font-heading font-bold mt-2">{merchant.shopName}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-muted-foreground">
          {merchant.city && <span className="flex items-center gap-1"><MapPin size={12} />{merchant.city}</span>}
          {merchant.phone && <span className="flex items-center gap-1"><Phone size={12} />{merchant.phone}</span>}
          {merchant.rating && parseFloat(merchant.rating) > 0 && (
            <span className="flex items-center gap-1">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              {parseFloat(merchant.rating).toFixed(1)} ({merchant.reviewCount})
            </span>
          )}
        </div>
        {merchant.description && (
          <p className="text-sm text-muted-foreground mt-2">{merchant.description}</p>
        )}
        {merchant.address && (
          <p className="text-xs text-muted-foreground mt-1">{merchant.address}, {merchant.eircode}</p>
        )}
      </div>

      {/* Book repair CTA */}
      {services.length > 0 && (
        <div className="px-4 mt-4">
          <Link href={`/repair?storeId=${merchant.id}`}>
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Wrench size={16} className="mr-2" /> Book a Repair
            </Button>
          </Link>
        </div>
      )}

      {/* Tabs: Services / Products / Hours */}
      <div className="px-4 mt-5">
        <Tabs defaultValue="services">
          <TabsList className="bg-secondary w-full">
            <TabsTrigger value="services" className="flex-1">Repairs ({services.length})</TabsTrigger>
            <TabsTrigger value="products" className="flex-1">Parts ({products.length})</TabsTrigger>
            <TabsTrigger value="hours"    className="flex-1">Hours</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="mt-4 space-y-3">
            {services.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No repair services listed yet.</p>}
            {services.map((s: Record<string, unknown>) => (
              <div key={s.merchantServiceId as string} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{s.serviceName as string}</div>
                  {(s.deviceModel || s.deviceBrand) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {[s.deviceBrand, s.deviceModel].filter(Boolean).join(" ")}
                    </div>
                  )}
                  {s.estimatedMin && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                      <Clock size={10} />~{s.estimatedMin as number} min
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0 ml-3">
                  <div className="font-bold text-sm">€{parseFloat(s.price as string).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">€{parseFloat(s.depositAmount as string).toFixed(2)} deposit</div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="products" className="mt-4 space-y-3">
            {products.length === 0 && <p className="text-muted-foreground text-sm text-center py-6">No products listed yet.</p>}
            {products.map((p: Record<string, unknown>) => (
              <Link key={p.merchantProductId as string} href={`/products/${p.productId}`}
                className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {(p.imageUrls as string[])?.[0]
                    ? <img src={(p.imageUrls as string[])[0]} alt={p.productName as string} className="w-full h-full object-contain p-1" />
                    : <Package size={20} className="text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{p.productName as string}</div>
                  <Badge variant="secondary" className="text-[10px] mt-0.5 capitalize">{p.type as string}</Badge>
                </div>
                <div className="text-primary font-bold text-sm shrink-0">
                  €{parseFloat(p.price as string).toFixed(2)}
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="hours" className="mt-4">
            {!hours
              ? <p className="text-muted-foreground text-sm text-center py-6">Opening hours not set.</p>
              : (
                <div className="bg-card rounded-xl border border-border divide-y divide-border">
                  {Object.entries(DAY_LABELS).map(([key, label]) => {
                    const day = hours[key];
                    return (
                      <div key={key} className="flex justify-between items-center px-4 py-2.5 text-sm">
                        <span className="font-medium w-10">{label}</span>
                        {day?.open
                          ? <span className="text-foreground">{day.from} – {day.to}</span>
                          : <span className="text-muted-foreground">Closed</span>}
                      </div>
                    );
                  })}
                </div>
              )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
