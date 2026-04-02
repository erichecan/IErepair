"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Package, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  id: string; name: string; sku: string; type: string; status: string;
  imageUrls: string[] | null; basePrice: string | null; categoryId: string | null;
}

interface Category { id: string; name: string; }

const STATUS_COLOR: Record<string, string> = {
  active:         "bg-primary/15 text-primary",
  inactive:       "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-500/15 text-yellow-400",
};

export default function AdminProductsPage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [form, setForm] = useState({
    name:"", sku:"", type:"accessory", categoryId:"", description:"", basePrice:"", compatibility:""
  });

  async function load() {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      fetch(`/api/v1/admin/products?q=${encodeURIComponent(q)}`),
      fetch("/api/v1/admin/categories"),
    ]);
    const [pData, cData] = await Promise.all([pRes.json(), cRes.json()]);
    if (pData.success) setProducts(pData.data);
    if (cData.success) setCategories(cData.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setCreating(true);
    const res = await fetch("/api/v1/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, basePrice: form.basePrice ? parseFloat(form.basePrice) : undefined }),
    });
    const data = await res.json();
    if (data.success) { setShowCreate(false); load(); }
    else alert(data.error);
    setCreating(false);
  }

  async function handleToggle(id: string, status: string) {
    await fetch(`/api/v1/admin/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status === "active" ? "inactive" : "active" }),
    });
    load();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Product Library</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground h-9">
          <Plus size={16} className="mr-1" />Add Product
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="pl-9 bg-secondary border-border" />
        </div>
        <Button onClick={load} variant="outline" className="border-border">Search</Button>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Base Price</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                      {p.imageUrls?.[0]
                        ? <img src={p.imageUrls[0]} alt="" className="w-full h-full object-contain rounded-lg p-0.5" />
                        : <Package size={14} className="text-muted-foreground" />}
                    </div>
                    <span className="font-medium truncate max-w-[200px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3"><Badge variant="secondary" className="text-xs capitalize">{p.type}</Badge></td>
                <td className="px-4 py-3">{p.basePrice ? `€${parseFloat(p.basePrice).toFixed(2)}` : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? STATUS_COLOR.inactive}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" onClick={() => handleToggle(p.id, p.status)}
                    className="h-7 text-xs border-border">
                    {p.status === "active" ? "Disable" : "Enable"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && products.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No products yet</div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>Add Product to Library</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label className="text-xs">Product Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-0.5 bg-secondary border-border h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">SKU</Label>
                <Input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                  className="mt-0.5 bg-secondary border-border h-8 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-0.5 bg-secondary border-border h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="part">Part</SelectItem>
                    <SelectItem value="accessory">Accessory</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="mt-0.5 bg-secondary border-border h-8 text-sm">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Base Price (€)</Label>
                <Input type="number" step="0.01" value={form.basePrice}
                  onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                  className="mt-0.5 bg-secondary border-border h-8 text-sm" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Compatibility</Label>
                <Input value={form.compatibility}
                  onChange={(e) => setForm((f) => ({ ...f, compatibility: e.target.value }))}
                  placeholder="iPhone 14/15, Samsung S23…"
                  className="mt-0.5 bg-secondary border-border h-8 text-sm" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Description</Label>
                <Textarea value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={2} className="mt-0.5 bg-secondary border-border text-sm resize-none" />
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating || !form.name || !form.sku}
              className="w-full bg-primary text-primary-foreground">
              {creating ? "Creating…" : "Add Product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
