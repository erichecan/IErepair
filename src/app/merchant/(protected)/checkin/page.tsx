"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

interface CheckinResult {
  orderNumber: string;
  userName: string;
  device: string;
  repairType: string;
}

type ScanState = "idle" | "scanning" | "loading" | "success" | "error";

export default function MerchantCheckinPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const [lang] = useLang("en");
  const t = useMerchantT(lang);

  const [state, setState] = useState<ScanState>("idle");
  const [result, setResult] = useState<CheckinResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
    };
  }, []);

  async function startScan() {
    if (!videoRef.current) return;
    setState("scanning");
    setResult(null);
    setErrorMsg("");

    const reader = new BrowserQRCodeReader();
    readerRef.current = reader;

    try {
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (res, err) => {
          if (res) {
            controls.stop();
            doCheckin(res.getText());
          }
          if (err && !(err.name === "NotFoundException")) {
            console.error("[QR Scan]", err);
          }
        }
      );
      controlsRef.current = controls;
    } catch (e) {
      console.error("[Camera Error]", e);
      setState("error");
      setErrorMsg(t.checkinErrCamera);
    }
  }

  function stopScan() {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setState("idle");
  }

  async function doCheckin(orderNumber: string) {
    setState("loading");
    try {
      const res = await fetch("/api/merchant/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        setState("success");
      } else {
        setErrorMsg(data.error || t.checkinErrFailed);
        setState("error");
      }
    } catch {
      setErrorMsg(t.checkinErrNetwork);
      setState("error");
    }
  }

  function handleManual(e: React.FormEvent) {
    e.preventDefault();
    if (!manualInput.trim()) return;
    doCheckin(manualInput.trim());
    setManualInput("");
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1d1d1f", margin: "0 0 4px" }}>{t.checkinTitle}</h1>
        <p style={{ fontSize: 14, color: "#6e6e73" }}>{t.checkinDesc}</p>
      </div>

      {/* Scanner area */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ position: "relative", width: 320, height: 320, borderRadius: 16, overflow: "hidden", background: "#1d1d1f", border: "2px solid #e5e5ea" }}>
          <video
            ref={videoRef}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: state === "scanning" ? "block" : "none" }}
          />
          {state !== "scanning" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff", gap: 12 }}>
              <div style={{ fontSize: 56 }}>📷</div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>{t.checkinPrompt}</div>
            </div>
          )}
          {state === "scanning" && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 180, height: 180, border: "2px solid #17db66", borderRadius: 12 }} />
            </div>
          )}
        </div>

        {/* Buttons */}
        {state === "idle" || state === "error" || state === "success" ? (
          <button
            onClick={startScan}
            style={{ padding: "12px 36px", background: "#146345", color: "#fff", border: "none", borderRadius: 40, fontSize: 16, fontWeight: 600, cursor: "pointer" }}
          >
            {state === "idle" ? t.checkinStartBtn : t.checkinRescanBtn}
          </button>
        ) : state === "scanning" ? (
          <button
            onClick={stopScan}
            style={{ padding: "12px 36px", background: "#fff", color: "#6e6e73", border: "1px solid #d1d1d6", borderRadius: 40, fontSize: 15, cursor: "pointer" }}
          >
            {t.checkinStopBtn}
          </button>
        ) : (
          <div style={{ padding: "12px 36px", background: "#f5f5f7", color: "#888", borderRadius: 40, fontSize: 15 }}>
            {t.checkinProcessing}
          </div>
        )}

        {/* Success result */}
        {state === "success" && result && (
          <div style={{ background: "#e8f7f0", border: "1px solid #146345", borderRadius: 14, padding: "20px 28px", width: "100%", maxWidth: 480 }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{t.checkinSuccess}</div>
            <div style={{ display: "grid", gap: 6, fontSize: 14 }}>
              <div><span style={{ color: "#888", minWidth: 80, display: "inline-block" }}>{t.checkinLabelOrderNo}</span><strong style={{ fontFamily: "monospace" }}>{result.orderNumber}</strong></div>
              <div><span style={{ color: "#888", minWidth: 80, display: "inline-block" }}>{t.checkinLabelCustomer}</span><strong>{result.userName}</strong></div>
              <div><span style={{ color: "#888", minWidth: 80, display: "inline-block" }}>{t.checkinLabelDevice}</span><span>{result.device}</span></div>
              <div><span style={{ color: "#888", minWidth: 80, display: "inline-block" }}>{t.checkinLabelRepairType}</span><span>{result.repairType}</span></div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#146345", fontWeight: 600 }}>{t.checkinStatusUpdated}</div>
          </div>
        )}

        {/* Error */}
        {state === "error" && errorMsg && (
          <div style={{ background: "#fee2e2", border: "1px solid #dc2626", borderRadius: 12, padding: "16px 20px", width: "100%", maxWidth: 480, color: "#c0392b", fontSize: 14 }}>
            {errorMsg}
          </div>
        )}

        {/* Manual entry */}
        <div style={{ width: "100%", maxWidth: 480, marginTop: 8 }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 8, textAlign: "center" }}>{t.checkinManualLabel}</div>
          <form onSubmit={handleManual} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="IER-XXXXXX-XXXX"
              style={{ flex: 1, padding: "10px 14px", border: "1px solid #d1d1d6", borderRadius: 8, fontSize: 14, fontFamily: "monospace", outline: "none" }}
            />
            <button
              type="submit"
              style={{ padding: "10px 20px", background: "#1d1d1f", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, cursor: "pointer", whiteSpace: "nowrap" as const }}
            >
              Check-in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
