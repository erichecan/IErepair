"use client";

import { useEffect, useState } from "react";
import { Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Category { id: string; name: string; slug: string; description: string | null; sortOrder: number; }

export default function AdminCategoriesPage() {
  const [cats, setCats]         = useState<Category[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", sortOrder: "0" });

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/v1/admin/categories");
    const data = await res.json();
    if (data.success) setCats(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    setCreating(true);
    const res = await fetch("/api/v1/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sortOrder: parseInt(form.sortOrder) }),
    });
    const data = await res.json();
    if (data.success) { setShowCreate(false); load(); setForm({ name:"", description:"", sortOrder:"0" }); }
    else alert(data.error);
    setCreating(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Categories</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground h-9">
          <Plus size={16} className="mr-1" />New Category
        </Button>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cats.map((c) => (
          <div key={c.id} className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Tag size={14} className="text-primary" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-sm truncate">{c.name}</div>
              {c.description && <div className="text-xs text-muted-foreground truncate">{c.description}</div>}
            </div>
          </div>
        ))}
      </div>

      {!loading && cats.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Tag size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No categories yet</p>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>New Category</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Screen Repairs" className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description" className="mt-1 bg-secondary border-border" />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="mt-1 bg-secondary border-border" />
            </div>
            <Button onClick={handleCreate} disabled={creating || !form.name}
              className="w-full bg-primary text-primary-foreground">
              {creating ? "Creating…" : "Create Category"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
