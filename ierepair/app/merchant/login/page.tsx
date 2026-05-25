"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const DEMO_ACCOUNTS = [
  { label: "Merchant 1", email: "merchant1@ierepair.ie" },
  { label: "Merchant 2", email: "merchant2@ierepair.ie" },
  { label: "Merchant 3", email: "merchant3@ierepair.ie" },
];
const DEMO_PASSWORD = "Merchant2024!";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function doLogin(e: string, p: string) {
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/auth/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, password: p }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Login failed"); return; }
      router.push("/merchant/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm bg-card border-border">
        <CardHeader className="text-center space-y-2">
          <div className="text-3xl font-bold font-heading text-primary">IERepair</div>
          <CardTitle>Merchant Portal</CardTitle>
          <CardDescription className="text-muted-foreground">Sign in to manage your shop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">{error}</div>
          )}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="shop@example.ie" className="bg-secondary border-border" />
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
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => doLogin(acc.email, DEMO_PASSWORD)}
                  disabled={loading}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 transition-colors disabled:opacity-50 text-center"
                >
                  <span className="text-xs font-semibold text-foreground">{acc.label}</span>
                  <span className="text-[10px] text-muted-foreground truncate w-full text-center">{acc.email.split("@")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
