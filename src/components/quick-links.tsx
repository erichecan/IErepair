"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

export default function QuickLinks() {
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  const services = [
    {
      label: t.qlScreenRepair,
      href: "/search?q=screen+repair",
      image: "/fonfix/service-screen.png",
      icon: null,
    },
    {
      label: t.qlBatteryReplacement,
      href: "/search?q=battery+replacement",
      image: "/fonfix/service-battery.png",
      icon: null,
    },
    {
      label: t.qlPhoneCases,
      href: "/accessories?category=cases",
      image: null,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="7" y="1" width="10" height="22" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      label: t.qlChargersAndCables,
      href: "/accessories?category=chargers",
      image: "/fonfix/service-charging.png",
      icon: null,
    },
    {
      label: t.qlMembership,
      href: "/membership",
      image: null,
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <section style={{ padding: "48px 0", borderBottom: "1px solid #f5f5f5" }}>
      <div className="wrapper">
        <div className="quick-links-grid">
          {services.map((service) => (
            <Link key={service.label} href={service.href} className="quick-link-card">
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#f0faf4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#146345",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {service.image ? (
                  <img
                    src={service.image}
                    alt={service.label}
                    style={{ width: "100%", height: "100%", objectFit: "contain", padding: "10px" }}
                  />
                ) : (
                  service.icon
                )}
              </div>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {service.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        .quick-links-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        .quick-link-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 28px 16px;
          background: #ffffff;
          border: 1.5px solid #f0f0f0;
          border-radius: 16px;
          text-decoration: none;
          color: #1d1d1f;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .quick-link-card:hover {
          border-color: #146345;
          box-shadow: 0 4px 20px rgba(20,99,69,0.12);
          transform: translateY(-2px);
        }
        @media (max-width: 768px) {
          .quick-links-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .quick-links-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  );
}
