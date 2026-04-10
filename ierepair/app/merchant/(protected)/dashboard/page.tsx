import { auth } from "@/lib/auth";
import Link from "next/link";
import { CalendarClock, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getDashboard(merchantId: string) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const res  = await fetch(`${base}/api/v1/merchant/dashboard`, {
    cache: "no-store",
    headers: { Cookie: "" }, // server-side: session handled by auth()
  });
  if (!res.ok) return null;
  const d = await res.json();
  return d.success ? d.data : null;
}

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-500/15 text-yellow-400",
  confirmed:  "bg-blue-500/15 text-blue-400",
  checked_in: "bg-primary/15 text-primary",
  completed:  "bg-primary/15 text-primary",
  cancelled:  "bg-muted text-muted-foreground",
};

export default async function MerchantDashboardPage() {
  const session = await auth();
  const data    = await getDashboard(session!.user.merchantId!);

  const todayBookings: Record<string, unknown>[] = data?.todayBookings ?? [];
  const pendingCount  = data?.pendingCount ?? 0;
  const monthRevenue  = data?.monthRevenue ?? "0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {new Date().toLocaleDateString("en-IE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground">Today's Bookings</div>
            <div className="text-3xl font-bold mt-1">{todayBookings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground">Pending Approval</div>
            <div className="text-3xl font-bold text-yellow-400 mt-1">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-5">
            <div className="text-xs text-muted-foreground">This Month Revenue</div>
            <div className="text-3xl font-bold text-primary mt-1">€{parseFloat(monthRevenue).toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's schedule */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarClock size={18} className="text-primary" /> Today's Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayBookings.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-6">No bookings today</p>
          )}
          <div className="space-y-2">
            {todayBookings.map((b) => (
              <Link key={b.id as string} href={`/merchant/bookings`}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {new Date(b.scheduledAt as string).toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">{b.bookingRef as string}</div>
                </div>
                <Badge className={`text-xs ${STATUS_COLOR[b.status as string] ?? STATUS_COLOR.pending}`}>
                  {(b.status as string).replace("_", " ")}
                </Badge>
              </Link>
            ))}
          </div>
          {todayBookings.length > 0 && (
            <Link href="/merchant/bookings" className="block text-center text-primary text-xs mt-3 hover:underline">
              View all bookings →
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/merchant/bookings?status=pending"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-yellow-500/30 hover:border-yellow-500/60 transition-colors">
          <Clock size={20} className="text-yellow-400" />
          <div>
            <div className="font-medium text-sm">Pending Bookings</div>
            <div className="text-xs text-muted-foreground">Accept or decline</div>
          </div>
        </Link>
        <Link href="/merchant/products/catalog"
          className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/40 transition-colors">
          <CheckCircle2 size={20} className="text-primary" />
          <div>
            <div className="font-medium text-sm">Add Products</div>
            <div className="text-xs text-muted-foreground">Browse catalog</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
