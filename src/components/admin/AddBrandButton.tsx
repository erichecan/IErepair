"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddBrandButton({ categoryId }: { categoryId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toSlug(n: string) {
    return n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("品牌名称为必填项"); return; }
    const slug = toSlug(name);
    if (!slug) { setError("名称中需包含英文字符以生成标识符"); return; }
    setLoading(true); setError("");
    const res = await fetch(`/api/admin/device-categories/${categoryId}/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), slug }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setOpen(false); setName("");
      router.refresh();
    } else {
      setError(data.error || "创建失败");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: "8px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
          border: "1.5px solid #146345", background: "transparent", color: "#146345",
          cursor: "pointer",
        }}
      >
        + 新增品牌
      </button>
    );
  }

  const slug = toSlug(name);

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
        background: "#f4faf7", borderRadius: 12, border: "1px solid #c3e8d5",
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={e => { setName(e.target.value); setError(""); }}
        placeholder="品牌名称（如 Apple）"
        style={{
          padding: "7px 12px", borderRadius: 8, border: "1px solid #d1d1d6",
          fontSize: 13, outline: "none", width: 200,
        }}
      />
      <span style={{ fontSize: 11, color: "#6e6e73", flexShrink: 0 }}>
        标识符：{slug || "—"}
      </span>
      {error && <span style={{ fontSize: 11, color: "#ff3b30", flexShrink: 0 }}>{error}</span>}
      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
          border: "none", background: "#146345", color: "#fff", cursor: "pointer",
          opacity: loading ? 0.6 : 1, flexShrink: 0,
        }}
      >
        {loading ? "…" : "创建"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setName(""); setError(""); }}
        style={{
          padding: "7px 12px", borderRadius: 8, fontSize: 13,
          border: "1px solid #d1d1d6", background: "#fff", color: "#6e6e73",
          cursor: "pointer", flexShrink: 0,
        }}
      >
        取消
      </button>
    </form>
  );
}
