"use client";

import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

export default function Footer() {
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  return (
    <footer
      style={{
        background: "#1a1a1a",
        color: "rgba(255,255,255,0.75)",
        padding: "56px 0 0",
      }}
    >
      <div className="wrapper">
        {/* Top section */}
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#17db66",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "16px",
                  color: "#1c3830",
                }}
              >
                IE
              </div>
              <span style={{ fontWeight: 700, fontSize: "18px", color: "#fff" }}>
                IERepair
              </span>
            </div>
            <p
              style={{
                fontSize: "14px",
                lineHeight: 1.7,
                maxWidth: "280px",
                marginBottom: "20px",
              }}
            >
              {t.footerDesc}
            </p>
            <div style={{ display: "flex", gap: "12px" }}>
              {[
                {
                  href: "#",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  ),
                },
                {
                  href: "#",
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                    </svg>
                  ),
                },
              ].map((social, i) => (
                <a key={i} href={social.href} className="social-icon">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {[
            {
              title: t.footerServices,
              links: [
                { label: "Screen Repair", href: "/search?q=screen+repair" },
                { label: "Battery Replacement", href: "/search?q=battery" },
                { label: "Charging Port Repair", href: "/search?q=charging+port" },
                { label: "Camera Repair", href: "/search?q=camera" },
                { label: "Data Recovery", href: "/search?q=data+recovery" },
              ],
            },
            {
              title: t.footerAccessories,
              links: [
                { label: "Phone Cases", href: "/accessories?category=cases" },
                { label: "Screen Protectors", href: "/accessories?category=protectors" },
                { label: "Chargers", href: "/accessories?category=chargers" },
                { label: "Cables", href: "/accessories?category=cables" },
                { label: "View All", href: "/accessories" },
              ],
            },
            {
              title: t.footerCompany,
              links: [
                { label: "About IERepair", href: "/about" },
                { label: "Find a Store", href: "/stores" },
                { label: "Membership Plans", href: "/membership" },
                { label: "Partner with Us", href: "/partner" },
                { label: "Contact", href: "/contact" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: "16px",
                }}
              >
                {col.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p style={{ color: "rgba(255,255,255,0.45)" }}>
            {t.footerLegal}
          </p>
          <div style={{ display: "flex", gap: "20px" }}>
            {[
              { label: t.footerPrivacy, href: "/privacy" },
              { label: t.footerTerms, href: "/terms" },
              { label: t.footerCookies, href: "/cookies" },
            ].map((link) => (
              <Link key={link.label} href={link.href} className="footer-legal-link">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 0;
          font-size: 13px;
        }
        .footer-link {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-link:hover { color: #17db66; }
        .footer-legal-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.15s;
        }
        .footer-legal-link:hover { color: #17db66; }
        .social-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.7);
          transition: border-color 0.2s, color 0.2s;
        }
        .social-icon:hover {
          border-color: #17db66;
          color: #17db66;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .footer-grid { grid-template-columns: 1fr !important; }
          .footer-bottom { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>
    </footer>
  );
}
