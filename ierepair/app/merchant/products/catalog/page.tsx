"use client";

import { useEffect, useState } from "react";
import { Search, Plus, CheckCircle2, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface CatalogProduct {
  id: string; name: string; sku: string; type: string;
  imageUrls: string[] | null; basePrice: string | null; compatibility: string | null;
}

export default function CatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [q, setQ]               = useState("");
  const [loading, setLoading]   = useState(false);
  const [adding, setAdding]     = useState<CatalogProduct | null>(null);
  const [price, setPrice]       = useState("");
  const [saving, setSaving]     = useState(false);
  const [added, setAdded]       = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true);
    const res  = await fetch(`/api/v1/merchant/products/catalog?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd(p: CatalogProduct) {
    setAdding(p);
    setPrice(p.basePrice ? parseFloat(p.basePrice).toFixed(2) : "");
  }

  async function handleAdd() {
    if (!adding) return;
    setSaving(true);
    const res = await fetch("/api/v1/merchant/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: adding.id, price: parseFloat(price), stock: 0 }),
    });
    if (res.ok) {
      setAdded((s) => new Set(s).add(adding.id));
      setAdding(null);
    } else {
      const d = await res.json();
      alert(d.error);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-heading font-bold">Browse Catalog</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="pl-9 bg-secondary border-border" />
        </div>
        <Button onClick={load} className="bg-primary text-primary-foreground">Search</Button>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              {p.imageUrls?.[0]
                ? <img src={p.imageUrls[0]} alt="" className="w-full h-full object-contain rounded-lg p-1" />
                : <Package size={20} className="text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.sku}</div>
              {p.compatibility && <div className="text-xs text-muted-foreground truncate">{p.compatibility}</div>}
              <Badge variant="secondary" className="text-[10px] mt-0.5 capitalize">{p.type}</Badge>
            </div>
            {p.basePrice && (
              <div className="text-sm text-muted-foreground shrink-0">RRP €{parseFloat(p.basePrice).toFixed(2)}</div>
            )}
            {added.has(p.id)
              ? <div className="flex items-center gap-1 text-xs text-primary shrink-0"><CheckCircle2 size={14} />Added</div>
              : <Button size="sm" onClick={() => openAdd(p)} className="bg-primary text-primary-foreground h-8 text-xs shrink-0">
                  <Plus size={13} className="mr-1" />Add
                </Button>}
          </div>
        ))}
      </div>

      <Dialog open={!!adding} onOpenChange={(o) => !o && setAdding(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Set Your Price</DialogTitle>
          </DialogHeader>
          {adding && (
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">{adding.name}</p>
              <div>
                <Label>Your selling price (€)</Label>
                <Input value={price} onChange={(e) => setPrice(e.target.value)}
                  type="number" step="0.01" className="mt-1 bg-secondary border-border" />
              </div>
              <Button onClick={handleAdd} disabled={saving || !price}
                className="w-full bg-primary text-primary-foreground">
                {saving ? "Adding…" : "Add to My Shop"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
