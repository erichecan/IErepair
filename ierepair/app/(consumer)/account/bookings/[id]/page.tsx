"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string; bookingRef: string; status: string; scheduledAt: string;
  servicePrice: string; depositAmount: string; depositPaid: boolean;
  qrCode: string | null; customerNotes: string | null; merchantId: string;
  createdAt: string;
}

export default function BookingDetailPage() {
  const { id }       = useParams<{ id: string }>();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const justPaid     = searchParams.get("paid") === "1";

  const [booking, setBooking]   = useState<Booking | null>(null);
  const [loading, setLoading]   = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/user/repair-bookings/${id}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setBooking(d.data); setLoading(false); });
  }, [id]);

  async function handleCancel() {
    if (!confirm("Cancel this booking? Deposits may not be refunded if within 24h.")) return;
    setCancelling(true);
    const res  = await fetch(`/api/v1/user/repair-bookings/${id}/cancel`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      setBooking((b) => b ? { ...b, status: "cancelled" } : b);
    } else {
      alert(data.error);
    }
    setCancelling(false);
  }

  if (loading) return <div className="text-center py-20 text-muted-foreground text-sm">Loading…</div>;
  if (!booking) return <div className="text-center py-20 text-muted-foreground text-sm">Booking not found.</div>;

  const canCancel = ["pending", "confirmed"].includes(booking.status);

  return (
    <div className="px-4 pt-6 pb-8 space-y-5">
      <Link href="/account" className="flex items-center gap-1 text-muted-foreground text-sm hover:text-foreground">
        <ArrowLeft size={16} /> My Bookings
      </Link>

      {justPaid && (
        <div className="flex items-center gap-3 bg-primary/15 border border-primary/30 rounded-xl p-4">
          <CheckCircle2 size={24} className="text-primary shrink-0" />
          <div>
            <div className="font-semibold text-sm">Deposit paid!</div>
            <div className="text-xs text-muted-foreground">Your booking is confirmed. Show the QR code at the shop.</div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-mono text-xs text-muted-foreground">Booking Reference</div>
            <div className="text-2xl font-heading font-bold tracking-widest text-primary mt-0.5">{booking.bookingRef}</div>
          </div>
          <Badge className={`text-xs capitalize ${
            booking.status === "completed" ? "bg-primary/15 text-primary" :
            booking.status === "confirmed" ? "bg-blue-500/15 text-blue-400" :
            booking.status === "cancelled" ? "bg-muted text-muted-foreground" :
            "bg-yellow-500/15 text-yellow-400"
          }`}>{booking.status.replace("_", " ")}</Badge>
        </div>

        <div className="divide-y divide-border text-sm">
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Scheduled</span>
            <span className="font-medium">{new Date(booking.scheduledAt).toLocaleString("en-IE", { dateStyle: "full", timeStyle: "short" })}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Service price</span>
            <span className="font-bold">€{parseFloat(booking.servicePrice).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Deposit paid</span>
            <span className={booking.depositPaid ? "text-primary font-medium" : "text-yellow-400"}>
              {booking.depositPaid ? `€${parseFloat(booking.depositAmount).toFixed(2)} ✓` : "Pending"}
            </span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-muted-foreground">Balance at shop</span>
            <span className="font-medium">
              €{(parseFloat(booking.servicePrice) - parseFloat(booking.depositAmount)).toFixed(2)}
            </span>
          </div>
          {booking.customerNotes && (
            <div className="py-2.5">
              <span className="text-muted-foreground block mb-1">Your notes</span>
              <span className="text-sm">{booking.customerNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Code */}
      {booking.qrCode && booking.depositPaid && (
        <div className="bg-card rounded-2xl border border-border p-5 text-center space-y-2">
          <div className="flex items-center gap-2 justify-center text-sm font-semibold">
            <QrCode size={16} className="text-primary" />Show this at the shop
          </div>
          <img src={booking.qrCode} alt="Booking QR" className="mx-auto w-40 h-40 rounded-xl" />
          <p className="text-xs text-muted-foreground">Staff will scan this to check you in</p>
        </div>
      )}

      {canCancel && (
        <Button
          onClick={handleCancel}
          disabled={cancelling}
          variant="outline"
          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
        >
          {cancelling ? "Cancelling…" : "Cancel Booking"}
        </Button>
      )}
    </div>
  );
}
