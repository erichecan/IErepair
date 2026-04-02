"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Step = "phone" | "otp";

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/";

  const [step, setStep]       = useState<Step>("phone");
  const [phone, setPhone]     = useState("");
  const [code, setCode]       = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSendOTP() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOTP() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      router.push(callbackUrl);
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
          <CardTitle className="text-xl">Sign In</CardTitle>
          <CardDescription className="text-muted-foreground">
            {step === "phone"
              ? "Enter your Irish mobile number to get a verification code"
              : `We sent a 6-digit code to ${phone}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/15 border border-destructive/30 text-destructive text-sm rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+353 87 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  className="mt-1 bg-secondary border-border"
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={loading || !phone}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Sending…" : "Send Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                  className="mt-1 bg-secondary border-border text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || code.length !== 6}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Verifying…" : "Verify & Sign In"}
              </Button>
              <button
                onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different number
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
