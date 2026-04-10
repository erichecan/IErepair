"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, UserCheck, XCircle, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Booking {
  id: string; bookingRef: string; status: string;
  scheduledAt: string; servicePrice: string; depositPaid: boolean;
  customerNotes: string | null; userId: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-400",
  confirmed:  "bg-blue-500/15 text-blue-400",
  checked_in: "bg-primary/15 text-primary",
  completed:  "bg-emerald-500/15 text-emerald-400",
  cancelled:  "bg-muted text-muted-foreground",
  no_show:    "bg-destructive/15 text-destructive",
};

function MerchantBookingsPageInner() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState(searchParams.get("status") ?? "all");
  const [acting, setActing]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter !== "all") params.set("status", filter);
    const res  = await fetch(`/api/v1/merchant/bookings?${params}`);
    const data = await res.json();
    if (data.success) setBookings(data.data);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function action(bookingId: string, endpoint: string) {
    setActing(bookingId + endpoint);
    const res = await fetch(`/api/v1/merchant/bookings/${bookingId}/${endpoint}`, { method: "POST" });
    if (res.ok) load();
    setActing(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold">Bookings</h1>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40 bg-secondary border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="checked_in">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Clock size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No bookings found</p>
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <div key={b.id} className="bg-card rounded-2xl border border-border p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-sm font-bold text-primary">{b.bookingRef}</span>
                <span className={`ml-3 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[b.status] ?? STATUS_COLOR.pending}`}>
                  {b.status.replace("_", " ")}
                </span>
              </div>
              <div className="text-sm font-bold">€{parseFloat(b.servicePrice).toFixed(2)}</div>
            </div>

            {/* Details */}
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {new Date(b.scheduledAt).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" })}
              </div>
              <div className={`text-xs ${b.depositPaid ? "text-primary" : "text-yellow-400"}`}>
                {b.depositPaid ? "Deposit paid ✓" : "Deposit pending"}
              </div>
            </div>

            {b.customerNotes && (
              <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">{b.customerNotes}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              {b.status === "pending" && (
                <Button size="sm" onClick={() => action(b.id, "accept")}
                  disabled={acting === b.id + "accept"}
                  className="bg-primary text-primary-foreground h-8 text-xs">
                  <CheckCircle2 size={13} className="mr-1" />Accept
                </Button>
              )}
              {b.status === "confirmed" && (
                <>
                  <Button size="sm" onClick={() => action(b.id, "check-in")}
                    disabled={acting === b.id + "check-in"}
                    className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                    <UserCheck size={13} className="mr-1" />Check In
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => action(b.id, "no-show")}
                    disabled={acting === b.id + "no-show"}
                    className="h-8 text-xs border-border text-muted-foreground hover:text-foreground">
                    <AlertTriangle size={13} className="mr-1" />No Show
                  </Button>
                </>
              )}
              {b.status === "checked_in" && (
                <Button size="sm" onClick={() => action(b.id, "complete")}
                  disabled={acting === b.id + "complete"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs">
                  <CheckCircle2 size={13} className="mr-1" />Mark Complete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MerchantBookingsPage() {
  return (
    <Suspense>
      <MerchantBookingsPageInner />
    </Suspense>
  );
}
