"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n/useLang";
import { useMerchantT } from "@/lib/i18n/merchant";

interface Review {
  id: number;
  userName: string;
  rating: number;
  comment: string | null;
  isVisible: boolean;
  createdAt: string;
  booking: { orderNumber: string; appointmentTime: string } | null;
}

interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
  avgRating: number | null;
  reviewCount: number;
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ fontSize: size, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= rating ? "#f5a623" : "#ddd" }}>★</span>
      ))}
    </span>
  );
}

export default function MerchantReviewsPage() {
  const [lang] = useLang("en");
  const t = useMerchantT(lang);
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/merchant/reviews?page=${page}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1d1d1f", margin: 0 }}>{t.reviewsTitle}</h1>
      </div>

      {/* Summary card */}
      {data && (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1.5px solid #f0f0f0", marginBottom: 24, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: "#1d1d1f", lineHeight: 1 }}>
              {data.avgRating ?? "—"}
            </div>
            <Stars rating={Math.round(data.avgRating ?? 0)} size={20} />
          </div>
          <div style={{ borderLeft: "1.5px solid #f0f0f0", paddingLeft: 24 }}>
            <div style={{ fontSize: 15, color: "#555" }}>
              {data.reviewCount} {t.reviewsTotalUnit}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>{t.loadingText}</div>
      ) : data?.reviews.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, padding: 48, textAlign: "center", color: "#888", border: "1.5px solid #f0f0f0" }}>
          {t.reviewsNoReviews}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data?.reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "#fff",
                borderRadius: 14,
                padding: "18px 22px",
                border: "1.5px solid #f0f0f0",
                opacity: review.isVisible ? 1 : 0.55,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 15, color: "#1d1d1f" }}>{review.userName}</span>
                  {!review.isVisible && (
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#888", background: "#f5f5f5", padding: "2px 8px", borderRadius: 20 }}>
                      {t.reviewsHidden}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <Stars rating={review.rating} />
                  <span style={{ fontSize: 12, color: "#aaa" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {review.comment && (
                <div style={{ fontSize: 14, color: "#444", lineHeight: 1.6 }}>{review.comment}</div>
              )}
              {review.booking && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#aaa" }}>
                  {t.reviewsFromOrder} #{review.booking.orderNumber}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e0e0e0", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.4 : 1, fontSize: 14 }}
          >
            {t.prevPage}
          </button>
          <span style={{ padding: "8px 16px", fontSize: 14, color: "#555" }}>
            {page} / {data.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            style={{ padding: "8px 20px", borderRadius: 8, border: "1.5px solid #e0e0e0", background: "#fff", cursor: page === data.pages ? "not-allowed" : "pointer", opacity: page === data.pages ? 0.4 : 1, fontSize: 14 }}
          >
            {t.nextPage}
          </button>
        </div>
      )}
    </div>
  );
}
