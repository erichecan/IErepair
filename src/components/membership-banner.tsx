"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

export default function MembershipBanner() {
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  const perks = [
    { icon: "🛡️", title: t.perkFreeScreen, desc: t.perkFreeScreenDesc },
    { icon: "⚡", title: t.perkPriority, desc: t.perkPriorityDesc },
    { icon: "💰", title: t.perkDiscount, desc: t.perkDiscountDesc },
    { icon: "📦", title: t.perkAccessories, desc: t.perkAccessoriesDesc },
  ];

  return (
    <section style={{ padding: "72px 0", background: "#f9f9f9" }}>
      <div className="wrapper">
        <div className="membership-grid">
          {/* Left: text */}
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                background: "#f0faf4",
                border: "1px solid #c3e8d3",
                borderRadius: "60px",
                padding: "5px 14px",
                marginBottom: "20px",
              }}
            >
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
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#146345" }}>
                {t.membershipTag}
              </span>
            </div>

            <h2
              style={{
                fontSize: "clamp(28px, 3vw, 40px)",
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: "16px",
                letterSpacing: "-0.5px",
                color: "#1d1d1f",
              }}
            >
              {t.membershipTitle1}
              <br />
              <span style={{ color: "#146345" }}>{t.membershipTitle2}</span>
            </h2>

            <p
              style={{
                fontSize: "16px",
                color: "#666",
                lineHeight: 1.7,
                marginBottom: "32px",
                maxWidth: "440px",
              }}
            >
              Join our membership plan and get free screen replacement, discounted
              repairs, and priority service across all IERepair partner stores in
              Ireland.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href="/membership" className="btn-primary">
                {t.membershipCta}
              </Link>
              <Link href="/membership#plans" className="btn-outline">
                {t.membershipCompare}
              </Link>
            </div>
          </div>

          {/* Right: perks */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            {perks.map((perk) => (
              <div
                key={perk.title}
                style={{
                  background: "#ffffff",
                  border: "1.5px solid #efefef",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>{perk.icon}</div>
                <div style={{ fontSize: "14px", fontWeight: 700, marginBottom: "4px", color: "#1d1d1f" }}>
                  {perk.title}
                </div>
                <div style={{ fontSize: "13px", color: "#888" }}>
                  {perk.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .membership-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .membership-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
