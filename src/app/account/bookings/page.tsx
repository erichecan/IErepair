"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
  orderNumber: string;
  status: string;
  statusLabel: string;
  merchantName: string;
  merchantAddress: string | null;
  merchantPhone: string | null;
  serviceName: string;
  deviceBrand: string;
  deviceModel: string;
  appointmentTime: string;
  quotedPrice: number;
  createdAt: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending_confirm: "#b45309",
  confirmed: "#146345",
  in_progress: "#1d4ed8",
  completed: "#555",
  cancelled: "#dc2626",
};

const STATUS_BG: Record<string, string> = {
  pending_confirm: "#fef3c7",
  confirmed: "#d1fae5",
  in_progress: "#dbeafe",
  completed: "#f5f5f5",
  cancelled: "#fee2e2",
};

function formatDt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-IE", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccountBookingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [phone, setPhone] = useState(searchParams.get("phone") ?? "");
  const [input, setInput] = useState(searchParams.get("phone") ?? "");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async (p: string) => {
    if (!p.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/public/bookings?phone=${encodeURIComponent(p.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "查询失败");
        setBookings([]);
      } else {
        setBookings(data);
      }
    } catch {
      setError("网络错误，请稍后重试");
      setBookings([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }, []);

  useEffect(() => {
    const p = searchParams.get("phone");
    if (p) {
      setPhone(p);
      setInput(p);
      fetchBookings(p);
    }
  }, [searchParams, fetchBookings]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const p = input.trim();
    setPhone(p);
    router.replace(`/account/bookings?phone=${encodeURIComponent(p)}`);
    fetchBookings(p);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div className="wrapper" style={styles.topBarInner}>
          <Link href="/" style={styles.logo}>IERepair</Link>
          <span style={styles.pageTitle}>My Bookings</span>
        </div>
      </div>

      <div className="wrapper" style={styles.page}>
        <h1 style={styles.h1}>Look Up Your Bookings</h1>
        <p style={styles.subtitle}>Enter your phone number to view all your repair appointments.</p>

        {/* Search form */}
        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="tel"
            placeholder="e.g. 0871234567"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.phoneInput}
            autoFocus
          />
          <button type="submit" style={styles.searchBtn} disabled={loading}>
            {loading ? "Searching…" : "Look Up"}
          </button>
        </form>

        {/* Results */}
        {error && <div style={styles.errorBox}>{error}</div>}

        {searched && !loading && !error && bookings.length === 0 && (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>📭</div>
            <div style={styles.emptyTitle}>No bookings found</div>
            <div style={styles.emptyText}>
              No repair appointments found for <strong>{phone}</strong>.
              Double-check the number you used when booking.
            </div>
            <Link href="/repair/book" style={styles.bookLink}>Book a Repair</Link>
          </div>
        )}

        {bookings.length > 0 && (
          <div style={styles.list}>
            <div style={styles.listMeta}>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found for {phone}
            </div>
            {bookings.map((b) => (
              <div key={b.orderNumber} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.orderNum}>{b.orderNumber}</div>
                    <div style={styles.service}>
                      {b.serviceName} — {b.deviceBrand} {b.deviceModel}
                    </div>
                  </div>
                  <span
                    style={{
                      ...styles.statusBadge,
                      color: STATUS_COLOR[b.status] ?? "#555",
                      background: STATUS_BG[b.status] ?? "#f5f5f5",
                    }}
                  >
                    {b.statusLabel}
                  </span>
                </div>

                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Store</span>
                    <span style={styles.detailValue}>{b.merchantName}</span>
                  </div>
                  {b.merchantAddress && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Address</span>
                      <span style={styles.detailValue}>{b.merchantAddress}</span>
                    </div>
                  )}
                  {b.merchantPhone && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Store Phone</span>
                      <a href={`tel:${b.merchantPhone}`} style={styles.detailLink}>
                        {b.merchantPhone}
                      </a>
                    </div>
                  )}
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Appointment</span>
                    <span style={styles.detailValue}>{formatDt(b.appointmentTime)}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Quoted Price</span>
                    <span style={{ ...styles.detailValue, fontWeight: 700 }}>
                      €{b.quotedPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  topBar: {
    background: "#1c3830",
    padding: "14px 0",
  },
  topBarInner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: "#17db66",
    fontWeight: 800,
    fontSize: 22,
    textDecoration: "none",
  },
  pageTitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.7,
  },
  page: {
    paddingTop: 48,
    paddingBottom: 80,
    maxWidth: 680,
  },
  h1: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1d1d1f",
    margin: 0,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 32,
    marginTop: 0,
  },
  form: {
    display: "flex",
    gap: 10,
    marginBottom: 32,
  },
  phoneInput: {
    flex: 1,
    padding: "13px 18px",
    borderRadius: 40,
    border: "1.5px solid #e0e0e0",
    fontSize: 15,
    fontFamily: "inherit",
    background: "#fff",
    outline: "none",
  },
  searchBtn: {
    padding: "13px 28px",
    borderRadius: 40,
    background: "#1d1d1f",
    color: "#17db66",
    border: "none",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap" as const,
  },
  errorBox: {
    padding: "14px 18px",
    background: "#fee2e2",
    color: "#dc2626",
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 24,
  },
  empty: {
    textAlign: "center" as const,
    padding: "60px 24px",
    color: "#555",
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1d1d1f",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 1.6,
  },
  bookLink: {
    display: "inline-block",
    padding: "12px 28px",
    borderRadius: 40,
    background: "#146345",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 15,
  },
  list: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 16,
  },
  listMeta: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  card: {
    background: "#fff",
    border: "1.5px solid #f0f0f0",
    borderRadius: 16,
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  orderNum: {
    fontSize: 12,
    color: "#888",
    fontWeight: 600,
    letterSpacing: "0.04em",
    marginBottom: 4,
    fontFamily: "monospace",
  },
  service: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1d1d1f",
  },
  statusBadge: {
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
  },
  detailGrid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
    borderTop: "1px solid #f5f5f5",
    paddingTop: 16,
  },
  detailItem: {
    display: "flex",
    gap: 12,
    fontSize: 14,
  },
  detailLabel: {
    color: "#888",
    minWidth: 100,
    flexShrink: 0,
  },
  detailValue: {
    color: "#1d1d1f",
  },
  detailLink: {
    color: "#146345",
    textDecoration: "none",
    fontWeight: 600,
  },
};
