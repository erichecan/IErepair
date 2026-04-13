"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Wallet, Clock } from "lucide-react";

interface FinanceEntry {
  id: string;
  bookingRef: string | null;
  grossAmount: string;
  commissionAmount: string;
  netAmount: string;
  settledAt: string | null;
  createdAt: string;
}

interface FinanceSummary {
  month: string;
  repairRevenue: string;
  commissionAmount: string;
  netAmount: string;
  completedBookings: number;
  pendingSettlement: string;
  depositCollected: string;
  entries: FinanceEntry[];
}

function fmt(n: string) {
  return `€${parseFloat(n).toFixed(2)}`;
}

export default function MerchantFinancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth]     = useState(currentMonth);
  const [data, setData]       = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/merchant/finance?month=${month}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        setLoading(false);
      });
  }, [month]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Finance</h1>
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

      {!loading && data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingUp size={14} /> Repair Revenue
                </div>
                <div className="text-2xl font-bold">{fmt(data.repairRevenue)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{data.completedBookings} repairs</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <TrendingDown size={14} /> Platform Commission
                </div>
                <div className="text-2xl font-bold text-destructive">{fmt(data.commissionAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Wallet size={14} /> Net Payout
                </div>
                <div className="text-2xl font-bold text-primary">{fmt(data.netAmount)}</div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock size={14} /> Pending Settlement
                </div>
                <div className="text-2xl font-bold text-yellow-400">{fmt(data.pendingSettlement)}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Commission owed to platform</div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit collected note */}
          {parseFloat(data.depositCollected) > 0 && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm text-muted-foreground">
              Online deposits collected this month: <span className="text-primary font-semibold">{fmt(data.depositCollected)}</span>
              <span className="ml-2 text-xs">(held by platform, deducted from commission due)</span>
            </div>
          )}

          {/* Ledger entries */}
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Transaction Ledger
            </h2>

            {data.entries.length === 0 && (
              <div className="bg-card rounded-2xl border border-border text-center py-10 text-muted-foreground text-sm">
                No completed repairs this month
              </div>
            )}

            {data.entries.length > 0 && (
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground text-xs uppercase tracking-wide">
                      <th className="text-left px-4 py-3">Booking</th>
                      <th className="text-right px-4 py-3">Revenue</th>
                      <th className="text-right px-4 py-3">Commission</th>
                      <th className="text-right px-4 py-3">Net</th>
                      <th className="text-left px-4 py-3">Settled</th>
                      <th className="text-left px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.entries.map((e) => (
                      <tr key={e.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{e.bookingRef ?? "—"}</td>
                        <td className="px-4 py-3 text-right">{fmt(e.grossAmount)}</td>
                        <td className="px-4 py-3 text-right text-destructive">{fmt(e.commissionAmount)}</td>
                        <td className="px-4 py-3 text-right text-primary font-medium">{fmt(e.netAmount)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                            e.settledAt
                              ? "bg-primary/15 text-primary"
                              : "bg-yellow-500/15 text-yellow-400"
                          }`}>
                            {e.settledAt ? "Settled" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(e.createdAt).toLocaleDateString("en-IE")}
                        </td>
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
