"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

const DEMO_EMAIL    = "admin@ierepair.ie";
const DEMO_PASSWORD = "IERepair2024!";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function doLogin(e: string, p: string) {
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, password: p }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Login failed"); return; }
      router.push("/admin/merchants");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto">
            <ShieldCheck size={24} className="text-primary" />
          </div>
          <CardTitle>Admin Portal</CardTitle>
          <CardDescription className="text-muted-foreground">IERepair HQ Management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">{error}</div>}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ierepair.ie" className="bg-secondary border-border" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && doLogin(email, password)}
              className="bg-secondary border-border" />
          </div>
          <Button onClick={() => doLogin(email, password)} disabled={loading || !email || !password}
            className="w-full bg-primary text-primary-foreground">
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          {/* Demo one-click login */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-center text-muted-foreground mb-3">Demo 账号一键登录</p>
            <button
              onClick={() => doLogin(DEMO_EMAIL, DEMO_PASSWORD)}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <div className="text-left">
                <p className="text-xs font-semibold text-foreground">Admin 账号</p>
                <p className="text-[11px] text-muted-foreground">{DEMO_EMAIL}</p>
              </div>
              <span className="text-xs font-semibold text-primary">一键登录 →</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
