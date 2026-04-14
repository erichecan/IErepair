"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, CheckCircle2 } from "lucide-react";

interface MerchantRow {
  merchantId: string;
  shopName: string | null;
  repairRevenue: string;
  commissionAmount: string;
  netAmount: string;
  completedBookings: number;
}

interface AdminFinanceSummary {
  month: string;
  totalRepairRevenue: string;
  totalCommission: string;
  totalNetToMerchants: string;
  completedBookings: number;
  merchants: MerchantRow[];
}

function fmt(n: string | null | undefined) {
  const v = parseFloat(n ?? "0");
  return `€${(isNaN(v) ? 0 : v).toFixed(2)}`;
}

export default function AdminFinancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth]     = useState(currentMonth);
  const [data, setData]       = useState<AdminFinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/v1/admin/finance?month=${month}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d.success) setData(d.data);
        else setError(d.error ?? "Failed to load finance data");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Platform Finance</h1>
        <input
          type="month"
          value={month}
          max={currentMonth}
          onChange={(e) => setMonth(e.target.value)}
          className="border border-border rounded-lg px-3 py-1.5 text-sm bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {loading && (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      )}

      {!loading && error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!loading && data && (
        <>
          {/* Platform totals */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp size={14} /> Total Revenue
                </div>
                <div className="text-2xl font-bold">{fmt(data.totalRepairRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{data.completedBookings} repairs</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet size={14} /> Platform Commission
                </div>
                <div className="text-2xl font-bold text-primary">{fmt(data.totalCommission)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingDown size={14} /> Paid to Merchants
                </div>
                <div className="text-2xl font-bold text-muted-foreground">{fmt(data.totalNetToMerchants)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <CheckCircle2 size={14} /> Active Merchants
                </div>
                <div className="text-2xl font-bold">{data.merchants.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Per-merchant breakdown */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Merchant Breakdown
            </h2>

            {data.merchants.length === 0 && (
              <div className="bg-card rounded-2xl border border-border text-center py-10 text-muted-foreground text-sm">
                No completed repairs this month
              </div>
            )}

            {data.merchants.length > 0 && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Shop</th>
                      <th className="text-right px-4 py-3">Repairs</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3">Commission</th>
                      <th className="text-right px-4 py-3">Net to Merchant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.merchants.map((m) => (
                      <tr key={m.merchantId} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{m.shopName ?? "—"}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{m.completedBookings}</td>
                        <td className="px-4 py-3 text-right">{fmt(m.repairRevenue)}</td>
                        <td className="px-4 py-3 text-right text-primary font-medium">{fmt(m.commissionAmount)}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{fmt(m.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
