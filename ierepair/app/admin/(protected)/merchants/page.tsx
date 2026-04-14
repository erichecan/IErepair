"use client";

import { useEffect, useState } from "react";
import { Plus, CheckCircle2, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Merchant {
  id: string; slug: string; shopName: string; email: string;
  phone: string | null; city: string | null; eircode: string | null;
  status: string; createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  active:    "bg-primary/15 text-primary",
  pending:   "bg-yellow-500/15 text-yellow-400",
  suspended: "bg-destructive/15 text-destructive",
};

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading]     = useState(true);
  const [q, setQ]                 = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [form, setForm] = useState({ shopName:"", email:"", password:"", phone:"", city:"", eircode:"" });

  async function load() {
    setLoading(true);
    const res  = await fetch(`/api/v1/admin/merchants?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (data.success) setMerchants(data.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleActivate(id: string) {
    await fetch(`/api/v1/admin/merchants/${id}/activate`, { method: "POST" });
    load();
  }

  async function handleCreate() {
    setCreating(true);
    const res = await fetch("/api/v1/admin/merchants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (data.success) { setShowCreate(false); load(); setForm({ shopName:"", email:"", password:"", phone:"", city:"", eircode:"" }); }
    else alert(data.error);
    setCreating(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Merchants</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground h-9">
          <Plus size={16} className="mr-1" />New Merchant
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            className="pl-9 bg-secondary border-border" />
        </div>
        <Button onClick={load} variant="outline" className="border-border">Search</Button>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>}

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr className="text-muted-foreground text-xs uppercase tracking-wide">
              <th className="text-left px-4 py-3">Shop</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Location</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 font-medium">{m.shopName}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{[m.city, m.eircode].filter(Boolean).join(", ") || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[m.status] ?? STATUS_COLOR.pending}`}>
                    {m.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {new Date(m.createdAt).toLocaleDateString("en-IE")}
                </td>
                <td className="px-4 py-3">
                  {m.status === "pending" && (
                    <Button size="sm" onClick={() => handleActivate(m.id)}
                      className="bg-primary text-primary-foreground h-7 text-xs">
                      <CheckCircle2 size={12} className="mr-1" />Activate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && merchants.length === 0 && (
          <div className="text-center py-10 text-muted-foreground text-sm">No merchants found</div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>Create Merchant Account</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            {[
              { key: "shopName", label: "Shop Name", placeholder: "Dublin Phone Repair" },
              { key: "email",    label: "Email",     placeholder: "shop@example.ie", type: "email" },
              { key: "password", label: "Password",  placeholder: "Temp password",  type: "password" },
              { key: "phone",    label: "Phone",     placeholder: "+353 1 234 5678" },
              { key: "city",     label: "City",      placeholder: "Dublin" },
              { key: "eircode",  label: "Eircode",   placeholder: "D01 A234" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input type={type ?? "text"} placeholder={placeholder}
                  value={(form as Record<string, string>)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-0.5 bg-secondary border-border h-8 text-sm" />
              </div>
            ))}
            <Button onClick={handleCreate} disabled={creating || !form.shopName || !form.email || !form.password}
              className="w-full bg-primary text-primary-foreground mt-2">
              {creating ? "Creating…" : "Create Merchant"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
