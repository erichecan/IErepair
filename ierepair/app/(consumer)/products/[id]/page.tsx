import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Star, ChevronRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Offer {
  merchantId: string; price: string; stock: number;
  shopName: string; slug: string; city: string | null;
  eircode: string | null; rating: string | null; logoUrl: string | null;
}

async function getProduct(id: string) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res  = await fetch(`${base}/api/v1/public/products/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.success ? data.data : null;
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params;
  const result  = await getProduct(id);
  if (!result)  notFound();

  const { product, offers } = result as { product: Record<string, unknown>; offers: Offer[] };

  return (
    <div className="pb-8">
      {/* Back */}
      <div className="px-4 pt-4">
        <Link href="/search" className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      {/* Product image */}
      <div className="mx-4 mt-3 rounded-2xl overflow-hidden bg-card aspect-square max-h-56 flex items-center justify-center">
        {(product.imageUrls as string[])?.[0]
          ? <img src={(product.imageUrls as string[])[0]} alt={product.name as string} className="w-full h-full object-contain p-4" />
          : <span className="text-6xl">📱</span>}
      </div>

      {/* Info */}
      <div className="px-4 mt-4 space-y-2">
        <Badge variant="secondary" className="text-xs capitalize">{product.type as string}</Badge>
        <h1 className="text-xl font-heading font-bold">{product.name as string}</h1>
        {product.compatibility && (
          <p className="text-xs text-muted-foreground">Compatible: {product.compatibility as string}</p>
        )}
        {product.description && (
          <p className="text-sm text-muted-foreground mt-2">{product.description as string}</p>
        )}
      </div>

      {/* Offers */}
      <div className="px-4 mt-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
          Available at {offers.length} shop{offers.length !== 1 ? "s" : ""}
        </h2>
        <div className="space-y-3">
          {offers.map((offer) => (
            <Link
              key={offer.merchantId}
              href={`/stores/${offer.slug || offer.merchantId}`}
              className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                {offer.logoUrl
                  ? <img src={offer.logoUrl} alt={offer.shopName} className="w-full h-full rounded-full object-cover" />
                  : <span className="text-lg">🔧</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{offer.shopName}</div>
                <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />{offer.city ?? offer.eircode ?? "Ireland"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-primary font-bold">€{parseFloat(offer.price).toFixed(2)}</div>
                {offer.rating && parseFloat(offer.rating) > 0 && (
                  <div className="flex items-center gap-0.5 text-xs justify-end">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    {parseFloat(offer.rating).toFixed(1)}
                  </div>
                )}
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </Link>
          ))}
        </div>

        {offers.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No shops currently stock this item near you.
          </div>
        )}
      </div>
    </div>
  );
}
