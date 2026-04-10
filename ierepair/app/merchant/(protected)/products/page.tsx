"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface MerchantProduct {
  mpId: string; price: string; stock: number; isAvailable: boolean;
  productId: string; name: string; sku: string; imageUrls: string[] | null; type: string;
}

export default function MerchantProductsPage() {
  const [products, setProducts]   = useState<MerchantProduct[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editItem, setEditItem]   = useState<MerchantProduct | null>(null);
  const [newPrice, setNewPrice]   = useState("");
  const [newStock, setNewStock]   = useState("");
  const [saving, setSaving]       = useState(false);

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/v1/merchant/products");
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openEdit(p: MerchantProduct) {
    setEditItem(p);
    setNewPrice(p.price);
    setNewStock(String(p.stock));
  }

  async function saveEdit() {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/v1/merchant/products/${editItem.mpId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price: parseFloat(newPrice), stock: parseInt(newStock) }),
    });
    await load();
    setEditItem(null);
    setSaving(false);
  }

  async function handleRemove(mpId: string) {
    if (!confirm("Remove this product from your shop?")) return;
    await fetch(`/api/v1/merchant/products/${mpId}`, { method: "DELETE" });
    setProducts((p) => p.filter((x) => x.mpId !== mpId));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">My Products</h1>
        <Link href="/merchant/products/catalog">
          <Button className="bg-primary text-primary-foreground h-9 text-sm">
            <Plus size={16} className="mr-1" />Add from Catalog
          </Button>
        </Link>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>}

      {!loading && products.length === 0 && (
        <div className="text-center py-16 text-muted-foreground space-y-3">
          <Package size={40} className="mx-auto opacity-30" />
          <p className="text-sm">No products yet</p>
          <Link href="/merchant/products/catalog">
            <Button className="bg-primary text-primary-foreground">Browse Catalog</Button>
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <div key={p.mpId} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
            <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              {p.imageUrls?.[0]
                ? <img src={p.imageUrls[0]} alt="" className="w-full h-full object-contain rounded-lg p-1" />
                : <Package size={20} className="text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.sku}</div>
              <Badge variant="secondary" className="text-[10px] mt-0.5 capitalize">{p.type}</Badge>
            </div>
            <div className="text-right shrink-0">
              <div className="font-bold text-sm text-primary">€{parseFloat(p.price).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Stock: {p.stock}</div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}
                className="h-8 w-8 p-0 border-border">
                <Pencil size={13} />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleRemove(p.mpId)}
                className="h-8 w-8 p-0 border-destructive/50 text-destructive hover:bg-destructive/10">
                <Trash2 size={13} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Price (€)</Label>
                <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                  type="number" step="0.01" className="mt-1 bg-secondary border-border" />
              </div>
              <div>
                <Label>Stock</Label>
                <Input value={newStock} onChange={(e) => setNewStock(e.target.value)}
                  type="number" className="mt-1 bg-secondary border-border" />
              </div>
              <Button onClick={saveEdit} disabled={saving} className="w-full bg-primary text-primary-foreground">
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
