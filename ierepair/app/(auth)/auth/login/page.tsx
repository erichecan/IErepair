"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type Step = "phone" | "otp";

function LoginPageInner() {
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
    <div className="min-h-screen bg-[#F8FAFD] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[var(--fonfix-border)] shadow-sm overflow-hidden">
        {/* Blue top bar */}
        <div className="bg-[var(--fonfix-blue)] px-6 py-8 text-center">
          <span className="text-white text-2xl font-extrabold tracking-tight">
            IErepair<span className="opacity-60">.ie</span>
          </span>
          <p className="text-white/70 text-sm mt-1">
            {step === "phone"
              ? "Sign in with your Irish mobile number"
              : `Code sent to ${phone}`}
          </p>
        </div>

        <div className="px-6 py-8 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {step === "phone" ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="phone" className="text-[var(--fonfix-text)] font-semibold text-sm">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+353 87 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  className="mt-1 border-[var(--fonfix-border)] focus-visible:ring-[var(--fonfix-blue)]"
                />
              </div>
              <Button
                onClick={handleSendOTP}
                disabled={loading || !phone}
                className="w-full bg-[var(--fonfix-blue)] hover:bg-[var(--fonfix-blue-dark)] text-white font-bold rounded-xl h-11"
              >
                {loading ? "Sending…" : "Send Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="code" className="text-[var(--fonfix-text)] font-semibold text-sm">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                  className="mt-1 border-[var(--fonfix-border)] focus-visible:ring-[var(--fonfix-blue)] text-center text-2xl tracking-widest"
                />
              </div>
              <Button
                onClick={handleVerifyOTP}
                disabled={loading || code.length !== 6}
                className="w-full bg-[var(--fonfix-blue)] hover:bg-[var(--fonfix-blue-dark)] text-white font-bold rounded-xl h-11"
              >
                {loading ? "Verifying…" : "Verify & Sign In"}
              </Button>
              <button
                onClick={() => { setStep("phone"); setCode(""); setError(""); }}
                className="w-full text-sm text-[var(--fonfix-text-muted)] hover:text-[var(--fonfix-text)] transition-colors"
              >
                Use a different number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
