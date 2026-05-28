"use client";

import { useState } from "react";

export default function ServiceToggle({
  serviceId,
  isActive: initialActive,
}: {
  serviceId: number;
  isActive: boolean;
}) {
  const [isActive, setIsActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/repair-services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        setIsActive((prev) => !prev);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        padding: "4px 14px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 500,
        border: "none",
        cursor: loading ? "wait" : "pointer",
        background: isActive ? "#e6f7ee" : "#f5f5f7",
        color: isActive ? "#146345" : "#6e6e73",
        transition: "all 0.15s",
      }}
    >
      {isActive ? "已启用" : "已禁用"}
    </button>
  );
}
