"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarClock, ChevronRight, LogIn, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string; bookingRef: string; status: string;
  scheduledAt: string; servicePrice: string; depositAmount: string;
  depositPaid: boolean; merchantId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: "Pending",    color: "bg-yellow-500/15 text-yellow-400",  icon: <Clock size={12} /> },
  confirmed:  { label: "Confirmed",  color: "bg-primary/15 text-primary",        icon: <CheckCircle2 size={12} /> },
  checked_in: { label: "In Progress",color: "bg-blue-500/15 text-blue-400",      icon: <Clock size={12} /> },
  completed:  { label: "Completed",  color: "bg-primary/15 text-primary",        icon: <CheckCircle2 size={12} /> },
  cancelled:  { label: "Cancelled",  color: "bg-muted text-muted-foreground",    icon: <XCircle size={12} /> },
  no_show:    { label: "No Show",    color: "bg-destructive/15 text-destructive", icon: <XCircle size={12} /> },
};

export default function AccountPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);
  const [authed, setAuthed]     = useState(true);

  useEffect(() => {
    fetch("/api/v1/user/repair-bookings")
      .then((r) => {
        if (r.status === 401) { setAuthed(false); setLoading(false); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) setBookings(d.data);
        setLoading(false);
      });
  }, []);

  if (!authed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
        <LogIn size={48} className="text-muted-foreground opacity-40" />
        <h2 className="text-xl font-heading font-bold">Sign in to view your account</h2>
        <p className="text-muted-foreground text-sm">See your bookings and manage your repairs</p>
        <Button onClick={() => router.push("/auth/login?callbackUrl=/account")}
          className="bg-primary text-primary-foreground px-8">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-2xl font-heading font-bold mb-5">My Account</h1>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <CalendarClock size={16} className="text-primary" />
          <h2 className="text-sm font-semibold">My Bookings</h2>
        </div>

        {loading && <div className="text-muted-foreground text-sm text-center py-10">Loading…</div>}

        {!loading && bookings.length === 0 && (
          <div className="text-center py-12 text-muted-foreground space-y-3">
            <CalendarClock size={40} className="mx-auto opacity-30" />
            <p className="text-sm">No bookings yet</p>
            <Link href="/repair">
              <Button className="bg-primary text-primary-foreground">Book a Repair</Button>
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {bookings.map((b) => {
            const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.pending;
            return (
              <Link key={b.id} href={`/account/bookings/${b.id}`}
                className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors">
                <div className="space-y-1">
                  <div className="font-mono text-xs text-muted-foreground">{b.bookingRef}</div>
                  <div className="text-sm font-medium">
                    {new Date(b.scheduledAt).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" })}
                  </div>
                  <div className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>
                    {cfg.icon}{cfg.label}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-bold text-sm">€{parseFloat(b.servicePrice).toFixed(2)}</div>
                  {!b.depositPaid && b.status === "pending" && (
                    <div className="text-xs text-yellow-400">Deposit pending</div>
                  )}
                  <ChevronRight size={16} className="text-muted-foreground ml-auto" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
