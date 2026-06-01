"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          role="button"
          tabIndex={0}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(n)}
          onKeyDown={(e) => e.key === "Enter" && onChange(n)}
          style={{
            fontSize: 40,
            cursor: "pointer",
            color: n <= (hover || value) ? "#f5a623" : "#ddd",
            transition: "color 0.1s",
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams<{ orderNumber: string }>();
  const orderNumber = params?.orderNumber ?? "";
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      setError("请选择评分");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/public/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, rating, comment: comment.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "提交失败");
      } else {
        setDone(true);
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1d1f", marginBottom: 8 }}>感谢您的评价！</h1>
          <p style={{ color: "#555", fontSize: 15, marginBottom: 28 }}>您的反馈帮助我们不断改进服务质量。</p>
          <Link href="/" style={styles.btn}>返回首页</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <Link href="/" style={styles.logo}>IERepair</Link>
      </div>

      <div style={styles.card}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1d1d1f", marginBottom: 6 }}>评价您的维修体验</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 28 }}>订单号：{orderNumber}</p>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", marginBottom: 12 }}>总体评分</div>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <div style={{ marginTop: 8, fontSize: 14, color: "#888" }}>
              {["", "非常差", "较差", "一般", "满意", "非常满意"][rating]}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f", marginBottom: 10 }}>
            评价内容 <span style={{ fontWeight: 400, color: "#aaa" }}>（选填）</span>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="分享您的维修体验，帮助其他用户做出选择..."
            maxLength={500}
            rows={4}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1.5px solid #e0e0e0",
              borderRadius: 10,
              fontSize: 15,
              fontFamily: "inherit",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ textAlign: "right", fontSize: 12, color: "#bbb", marginTop: 4 }}>{comment.length}/500</div>
        </div>

        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffd0d0", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#c00", marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          style={{
            ...styles.btn,
            opacity: submitting || rating === 0 ? 0.5 : 1,
            cursor: submitting || rating === 0 ? "not-allowed" : "pointer",
            border: "none",
            width: "100%",
          }}
        >
          {submitting ? "提交中..." : "提交评价"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f5f7",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 60,
    paddingLeft: 16,
    paddingRight: 16,
  },
  topBar: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    background: "#1c3830",
    padding: "14px 24px",
    zIndex: 100,
  },
  logo: {
    color: "#17db66",
    fontWeight: 800,
    fontSize: 20,
    textDecoration: "none",
  },
  card: {
    background: "#fff",
    borderRadius: 20,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 480,
    textAlign: "center" as const,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    marginTop: 28,
  },
  btn: {
    display: "inline-block",
    padding: "14px 32px",
    borderRadius: 40,
    background: "#146345",
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    textDecoration: "none",
    cursor: "pointer",
  },
};
