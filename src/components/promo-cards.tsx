"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

export default function PromoCards() {
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  return (
    <section style={{ padding: "0 0 0" }}>
      <div className="wrapper" style={{ paddingTop: "0", paddingBottom: "0" }}>
        <div className="promo-grid">
          {/* Card 1: For Business */}
          <Link href="/business" className="promo-card">
            <img
              src="/fonfix/for-business-new.jpg"
              alt="For Business"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
            />
            <div className="promo-overlay" />
            <div className="promo-content">
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#17db66", marginBottom: "10px" }}>
                {t.promoEnterpriseTag}
              </div>
              <h3 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, lineHeight: 1.2, marginBottom: "12px", letterSpacing: "-0.5px" }}>
                {t.promoEnterpriseTitle}
              </h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: "24px", maxWidth: "320px" }}>
                {t.promoEnterpriseDesc}
              </p>
              <div className="promo-cta">
                {t.promoEnterpriseBtn}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Card 2: Free Warranty Repair */}
          <Link href="/warranty" className="promo-card">
            <img
              src="/fonfix/warranty-repair.jpg"
              alt="Free Warranty Repair"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", position: "absolute", inset: 0 }}
            />
            <div className="promo-overlay" />
            <div className="promo-content">
              <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#17db66", marginBottom: "10px" }}>
                {t.promoMemberTag}
              </div>
              <h3 style={{ fontSize: "clamp(22px, 2.5vw, 30px)", fontWeight: 800, lineHeight: 1.2, marginBottom: "12px", letterSpacing: "-0.5px" }}>
                {t.promoMemberTitle}
              </h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: "24px", maxWidth: "320px" }}>
                {t.promoMemberDesc}
              </p>
              <div className="promo-cta">
                {t.promoMemberBtn}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <style>{`
        .promo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 40px 0 56px;
        }
        .promo-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          min-height: 360px;
          display: flex;
          text-decoration: none;
          color: #ffffff;
        }
        .promo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.15) 100%);
          transition: background 0.3s;
        }
        .promo-card:hover .promo-overlay {
          background: linear-gradient(160deg, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.50) 55%, rgba(0,0,0,0.22) 100%);
        }
        .promo-content {
          position: relative;
          z-index: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          width: 100%;
        }
        .promo-cta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: #1c3830;
          font-size: 13px;
          font-weight: 700;
          padding: 10px 20px;
          border-radius: 60px;
          width: fit-content;
          transition: background 0.2s, color 0.2s;
        }
        .promo-card:hover .promo-cta {
          background: #17db66;
          color: #1c3830;
        }
        @media (max-width: 768px) {
          .promo-grid { grid-template-columns: 1fr !important; }
          .promo-card { min-height: 280px !important; }
        }
      `}</style>
    </section>
  );
}
