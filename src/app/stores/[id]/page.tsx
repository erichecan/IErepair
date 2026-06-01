"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

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

interface ReviewItem {
  id: number;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface MerchantDetail {
  id: number;
  name: string;
  address: string | null;
  eircode: string | null;
  phone: string | null;
  description: string | null;
  images: string[];
  lat: number | null;
  lng: number | null;
  avgRating: number | null;
  reviewCount: number;
  reviews: ReviewItem[];
  hours: MerchantHour[];
  services: ServiceItem[];
}

function Stars({ rating, size = 15 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= Math.round(rating) ? "#f5a623" : "#ddd" }}>★</span>
      ))}
    </span>
  );
}

export default function StorePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

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
        <Link href="/" style={styles.backLink}>← {t.backToHome}</Link>
      </div>
    );
  }

  const today = new Date().getDay();

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 1000,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <img
            src={lightbox}
            alt=""
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }}
          />
        </div>
      )}

      {/* Top bar */}
      <div style={styles.topBar}>
        <div className="wrapper" style={styles.topBarInner}>
          <Link href="/" style={styles.logo}>IERepair</Link>
          <Link href="/search" style={styles.backNav}>{t.storeBackToSearch}</Link>
        </div>
      </div>

      <div className="wrapper" style={styles.page}>
        {/* Photo gallery */}
        {merchant.images.length > 0 && (
          <div style={styles.galleryGrid}>
            {merchant.images.slice(0, 5).map((url, i) => (
              <div
                key={url}
                onClick={() => setLightbox(url)}
                style={{
                  ...styles.galleryCell,
                  gridColumn: i === 0 ? "span 2" : undefined,
                  gridRow: i === 0 ? "span 2" : undefined,
                }}
              >
                <img src={url} alt={`${merchant.name} photo ${i + 1}`} style={styles.galleryImg} />
                {i === 4 && merchant.images.length > 5 && (
                  <div style={styles.moreOverlay}>+{merchant.images.length - 5}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Store header */}
        <div style={styles.storeHeader}>
          <div>
            <h1 style={styles.storeName}>{merchant.name}</h1>
            {merchant.avgRating !== null && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Stars rating={merchant.avgRating} size={18} />
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>{merchant.avgRating}</span>
                <span style={{ fontSize: 14, color: "#888" }}>({merchant.reviewCount} reviews)</span>
              </div>
            )}
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
            {t.storeBookRepair}
          </Link>
        </div>

        <div style={styles.twoCol}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Opening hours */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>{t.storeOpeningHours}</h2>
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
                      {h.dayOfWeek === today ? t.storeToday : ""}
                    </span>
                    <span style={styles.hourTime}>
                      {h.isClosed
                        ? t.storeClosed
                        : `${h.openTime ?? "?"} – ${h.closeTime ?? "?"}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {merchant.lat && merchant.lng && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}>{t.storeLocation}</h2>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${merchant.lat},${merchant.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${merchant.lat},${merchant.lng}&zoom=15&size=480x240&scale=2&markers=color:0x146345%7C${merchant.lat},${merchant.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt={`Map of ${merchant.name}`}
                    style={{ width: "100%", borderRadius: 8, display: "block" }}
                  />
                </a>
                {merchant.address && (
                  <div style={{ marginTop: 10, fontSize: 13, color: "#555" }}>
                    {merchant.address}
                    {merchant.eircode ? `, ${merchant.eircode}` : ""}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Services */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>
                {t.storeServices} ({merchant.services.length})
              </h2>
              {merchant.services.length === 0 ? (
                <div style={{ color: "#888", fontSize: 14 }}>{t.storeNoServices}</div>
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
                          {t.storeBook}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reviews */}
            {merchant.reviews.length > 0 && (
              <div style={styles.card}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ ...styles.cardTitle, margin: 0 }}>
                    {t.storeReviews} ({merchant.reviewCount})
                  </h2>
                  {merchant.avgRating !== null && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Stars rating={merchant.avgRating} />
                      <span style={{ fontWeight: 700, fontSize: 15, color: "#1d1d1f" }}>{merchant.avgRating}</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {merchant.reviews.map((review) => (
                    <div key={review.id} style={{ borderBottom: "1px solid #f5f5f5", paddingBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "#1d1d1f" }}>{review.userName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Stars rating={review.rating} />
                          <span style={{ fontSize: 12, color: "#aaa" }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {review.comment && (
                        <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{review.comment}</div>
                      )}
                    </div>
                  ))}
                </div>
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
  galleryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gridTemplateRows: "160px 160px",
    gap: 6,
    marginBottom: 28,
    borderRadius: 16,
    overflow: "hidden",
  },
  galleryCell: {
    position: "relative" as const,
    overflow: "hidden",
    cursor: "pointer",
    background: "#f0f0f0",
  },
  galleryImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "transform 0.2s",
  },
  moreOverlay: {
    position: "absolute" as const,
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    fontWeight: 700,
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
