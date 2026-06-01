"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

const stores = [
  {
    id: 1,
    name: "IERepair Dublin City",
    address: "14 Henry Street, Dublin 1",
    eircode: "D01 P2F3",
    distance: "0.4 km",
    rating: 4.9,
    reviewCount: 312,
    status: "Open" as const,
    closesAt: "7:00 PM",
    tags: ["Screen Repair", "Battery", "Accessories"],
  },
  {
    id: 2,
    name: "IERepair Cork",
    address: "22 Oliver Plunkett St, Cork",
    eircode: "T12 YX44",
    distance: "1.2 km",
    rating: 4.8,
    reviewCount: 187,
    status: "Open" as const,
    closesAt: "6:30 PM",
    tags: ["Screen Repair", "Data Recovery"],
  },
  {
    id: 3,
    name: "IERepair Galway",
    address: "8 Shop Street, Galway",
    eircode: "H91 RV22",
    distance: "2.8 km",
    rating: 4.7,
    reviewCount: 143,
    status: "Closes soon" as const,
    closesAt: "5:00 PM",
    tags: ["Battery", "Charging Port", "Camera Repair"],
  },
];

export default function NearbyStores() {
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  const statusLabel: Record<string, string> = {
    "Open": t.nearbyOpen,
    "Closes soon": t.nearbyClosesSoon,
  };

  const statusStyle: Record<string, { background: string; color: string }> = {
    "Open": { background: "#f0faf4", color: "#428445" },
    "Closes soon": { background: "#fffbeb", color: "#b45309" },
  };

  return (
    <section style={{ padding: "64px 0", background: "#fafafa" }}>
      <div className="wrapper">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#1d1d1f",
                letterSpacing: "-0.5px",
                marginBottom: "6px",
              }}
            >
              {t.nearbyTitle}
            </h2>
            <p style={{ color: "#888", fontSize: "14px" }}>
              {t.nearbySubtitle}
            </p>
          </div>
          <Link href="/stores" className="view-all-link">
            {t.nearbyViewAll}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="stores-grid">
          {stores.map((store) => (
            <Link
              key={store.id}
              href={`/stores/${store.id}`}
              className="store-card"
            >
              {/* Store header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>
                    {store.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#888" }}>{store.address}</p>
                </div>
                <div
                  style={{
                    flexShrink: 0,
                    background: statusStyle[store.status]?.background ?? "#fff5f5",
                    color: statusStyle[store.status]?.color ?? "#dc2626",
                    borderRadius: "60px",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  {statusLabel[store.status] ?? store.status}
                </div>
              </div>

              {/* Rating + distance */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#17db66"
                    stroke="#17db66"
                    strokeWidth="1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <span style={{ fontWeight: 700 }}>{store.rating}</span>
                  <span style={{ color: "#aaa" }}>({store.reviewCount})</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#888" }}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {store.distance}
                </div>
                <div style={{ color: "#aaa" }}>{t.nearbyUntil} {store.closesAt}</div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {store.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "#f5f5f5",
                      color: "#555",
                      borderRadius: "60px",
                      padding: "3px 10px",
                      fontSize: "11px",
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .stores-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .store-card {
          background: #ffffff;
          border: 1.5px solid #efefef;
          border-radius: 16px;
          padding: 24px;
          text-decoration: none;
          color: #1d1d1f;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .store-card:hover {
          border-color: #146345;
          box-shadow: 0 4px 20px rgba(20,99,69,0.1);
          transform: translateY(-2px);
        }
        .view-all-link {
          font-size: 14px;
          font-weight: 600;
          color: #146345;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        @media (max-width: 900px) {
          .stores-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .stores-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
