"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import SearchBar from "@/components/consumer/SearchBar";
import ServiceCard from "@/components/consumer/ServiceCard";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

interface SearchResult {
  merchantId: number;
  merchantName: string;
  address: string | null;
  eircode: string | null;
  phone: string | null;
  distanceKm: number | null;
  serviceId: number;
  repairServiceId: number;
  serviceName: string;
  deviceModel: string;
  deviceBrand: string;
  deviceCategory: string;
  price: number;
  durationMinutes: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("q") ?? "";
  const eircode = searchParams?.get("eircode") ?? "";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (eircode) params.set("eircode", eircode);
      const res = await fetch(`/api/public/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [q, eircode]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div style={{ minHeight: "100vh", background: "#fafafa" }}>
      {/* Header bar */}
      <div style={styles.headerBar}>
        <div className="wrapper" style={styles.headerInner}>
          <Link href="/" style={styles.logo}>IERepair</Link>
          <div style={{ flex: 1, maxWidth: 640 }}>
            <SearchBar initialQ={q} initialEircode={eircode} compact />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="wrapper" style={styles.content}>
        <div style={styles.meta}>
          {loading ? (
            <span>{t.searching}</span>
          ) : (
            <span>
              {total > 0
                ? `${t.servicesFound(total)}${q ? ` for "${q}"` : ""}${eircode ? ` near ${eircode}` : ""}`
                : `${t.noRepairsTitle}${q ? ` for "${q}"` : ""}${eircode ? ` near ${eircode}` : ""}`}
            </span>
          )}
        </div>

        {loading ? (
          <div style={styles.skeletonGrid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>🔍</div>
            <div style={styles.emptyTitle}>{t.noRepairsTitle}</div>
            <div style={styles.emptyText}>
              {t.noRepairsDesc}
            </div>
            <Link href="/" style={styles.homeLink}>{t.backToHome}</Link>
          </div>
        ) : (
          <div style={styles.grid}>
            {results.map((r) => (
              <ServiceCard
                key={`${r.merchantId}-${r.repairServiceId}`}
                merchantId={r.merchantId}
                merchantName={r.merchantName}
                address={r.address}
                eircode={r.eircode}
                distanceKm={r.distanceKm}
                serviceName={r.serviceName}
                deviceBrand={r.deviceBrand}
                deviceModel={r.deviceModel}
                price={r.price}
                durationMinutes={r.durationMinutes}
                repairServiceId={r.repairServiceId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  headerBar: {
    background: "#1c3830",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    padding: "14px 0",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: 24,
  },
  logo: {
    color: "#17db66",
    fontWeight: 800,
    fontSize: 22,
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
  },
  content: {
    paddingTop: 32,
    paddingBottom: 64,
  },
  meta: {
    color: "#555",
    fontSize: 15,
    marginBottom: 20,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
  skeletonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 16,
  },
  skeleton: {
    height: 140,
    borderRadius: 16,
    background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
  },
  empty: {
    textAlign: "center" as const,
    padding: "80px 24px",
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
  },
  homeLink: {
    display: "inline-block",
    padding: "12px 28px",
    borderRadius: 40,
    background: "#1d1d1f",
    color: "#17db66",
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 15,
  },
};
