"use client";

import { useEffect, ReactNode } from "react";

export default function Modal({
  title,
  onClose,
  children,
  width = 480,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, width, maxWidth: "calc(100vw - 32px)",
          padding: "28px 32px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1d1d1f", margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#6e6e73", lineHeight: 1, padding: "0 4px" }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
