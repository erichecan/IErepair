"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/v1/auth/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
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
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="bg-secondary border-border" />
          </div>
          <Button onClick={handleLogin} disabled={loading || !email || !password}
            className="w-full bg-primary text-primary-foreground">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
