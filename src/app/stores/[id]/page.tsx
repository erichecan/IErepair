"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface MerchantHour {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

interface ServiceItem {
  id: number;
  repairServiceId: number;
  price: number;
  serviceName: string;
  deviceModel: string;
  deviceBrand: string;
  deviceCategory: string;
  durationMinutes: number;
}

interface MerchantDetail {
  id: number;
  name: string;
  address: string | null;
  eircode: string | null;
  phone: string | null;
  description: string | null;
  hours: MerchantHour[];
  services: ServiceItem[];
}

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/merchants/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setMerchant(data);
      })
      .catch(() => setError("Failed to load store"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div style={styles.centered}>
        <div style={{ fontSize: 18, color: "#555" }}>{error || "Store not found"}</div>
        <Link href="/" style={styles.backLink}>← Back to Home</Link>
      </div>
    );
  }

  const today = new Date().getDay();

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div className="wrapper" style={styles.topBarInner}>
          <Link href="/" style={styles.logo}>IERepair</Link>
          <Link href="/search" style={styles.backNav}>← Search Results</Link>
        </div>
      </div>

      <div className="wrapper" style={styles.page}>
        {/* Store header */}
        <div style={styles.storeHeader}>
          <div>
            <h1 style={styles.storeName}>{merchant.name}</h1>
            {merchant.address && <div style={styles.storeAddress}>{merchant.address}</div>}
            {merchant.eircode && <div style={styles.storeEircode}>{merchant.eircode}</div>}
            {merchant.phone && (
              <a href={`tel:${merchant.phone}`} style={styles.storePhone}>
                📞 {merchant.phone}
              </a>
            )}
            {merchant.description && (
              <div style={styles.storeDesc}>{merchant.description}</div>
            )}
          </div>
          <Link
            href={`/repair/book?merchantId=${merchant.id}`}
            style={styles.bookBtn}
          >
            Book a Repair
          </Link>
        </div>

        <div style={styles.twoCol}>
          {/* Opening hours */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>Opening Hours</h2>
            <div style={styles.hoursList}>
              {merchant.hours.map((h) => (
                <div
                  key={h.dayOfWeek}
                  style={{
                    ...styles.hourRow,
                    background: h.dayOfWeek === today ? "#f0faf5" : "transparent",
                  }}
                >
                  <span
                    style={{
                      ...styles.dayName,
                      fontWeight: h.dayOfWeek === today ? 700 : 400,
                      color: h.dayOfWeek === today ? "#146345" : "#555",
                    }}
                  >
                    {DAY_NAMES[h.dayOfWeek]}
                    {h.dayOfWeek === today ? " (Today)" : ""}
                  </span>
                  <span style={styles.hourTime}>
                    {h.isClosed
                      ? "Closed"
                      : `${h.openTime ?? "?"} – ${h.closeTime ?? "?"}`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Services */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              Services ({merchant.services.length})
            </h2>
            {merchant.services.length === 0 ? (
              <div style={{ color: "#888", fontSize: 14 }}>No services listed yet.</div>
            ) : (
              <div style={styles.serviceList}>
                {merchant.services.map((svc) => (
                  <div key={svc.id} style={styles.serviceRow}>
                    <div>
                      <div style={styles.svcName}>
                        {svc.serviceName} — {svc.deviceBrand} {svc.deviceModel}
                      </div>
                      <div style={styles.svcMeta}>
                        {svc.deviceCategory} · {svc.durationMinutes} min
                      </div>
                    </div>
                    <div style={styles.svcRight}>
                      <span style={styles.svcPrice}>€{svc.price.toFixed(2)}</span>
                      <Link
                        href={`/repair/book?merchantId=${merchant.id}&repairServiceId=${svc.repairServiceId}`}
                        style={styles.svcBookBtn}
                      >
                        Book
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  centered: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #e0e0e0",
    borderTopColor: "#146345",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  backLink: {
    color: "#146345",
    textDecoration: "none",
    fontWeight: 600,
  },
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
  backNav: {
    color: "#fff",
    textDecoration: "none",
    fontSize: 14,
    opacity: 0.8,
  },
  page: {
    paddingTop: 32,
    paddingBottom: 64,
  },
  storeHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 24,
    marginBottom: 32,
    flexWrap: "wrap" as const,
  },
  storeName: {
    fontSize: 28,
    fontWeight: 800,
    color: "#1d1d1f",
    margin: 0,
    marginBottom: 8,
  },
  storeAddress: {
    color: "#555",
    fontSize: 15,
    marginBottom: 2,
  },
  storeEircode: {
    color: "#888",
    fontSize: 14,
    marginBottom: 6,
  },
  storePhone: {
    color: "#146345",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 600,
    display: "block",
    marginBottom: 8,
  },
  storeDesc: {
    color: "#555",
    fontSize: 14,
    maxWidth: 500,
    lineHeight: 1.6,
    marginTop: 8,
  },
  bookBtn: {
    padding: "14px 32px",
    borderRadius: 40,
    background: "#146345",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 15,
    whiteSpace: "nowrap" as const,
    flexShrink: 0,
    display: "inline-block",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 24,
    alignItems: "start",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "24px",
    border: "1.5px solid #f0f0f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#1d1d1f",
    margin: 0,
    marginBottom: 16,
  },
  hoursList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
  },
  hourRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 8px",
    borderRadius: 8,
    fontSize: 14,
  },
  dayName: {
    color: "#555",
  },
  hourTime: {
    color: "#1d1d1f",
  },
  serviceList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 12,
  },
  serviceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: "1px solid #f5f5f5",
  },
  svcName: {
    fontSize: 15,
    fontWeight: 600,
    color: "#1d1d1f",
    marginBottom: 2,
  },
  svcMeta: {
    fontSize: 13,
    color: "#888",
  },
  svcRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  svcPrice: {
    fontSize: 18,
    fontWeight: 700,
    color: "#1d1d1f",
  },
  svcBookBtn: {
    padding: "7px 16px",
    borderRadius: 40,
    background: "#1d1d1f",
    color: "#17db66",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 600,
    display: "inline-block",
  },
};
