"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useLang("en");
  const t = useConsumerT(lang);

  return (
    <header
      style={{
        backgroundColor: "#ffffff",
        color: "#1d1d1f",
        position: "sticky",
        top: 0,
        zIndex: 100,
        borderBottom: "1px solid #e8e8e8",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="wrapper"
        style={{
          display: "flex",
          alignItems: "center",
          height: "64px",
          gap: "32px",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "34px",
              height: "34px",
              backgroundColor: "#1c3830",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "15px",
              color: "#17db66",
            }}
          >
            IE
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: "17px",
              color: "#1d1d1f",
              letterSpacing: "-0.3px",
            }}
          >
            IERepair
          </span>
        </Link>

        {/* Nav links — desktop */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            flex: 1,
          }}
          className="nav-desktop"
        >
          {[
            { label: t.navRepair, href: "/services" },
            { label: t.navAccessories, href: "/accessories" },
            { label: t.navFindStore, href: "/stores" },
            { label: t.navMembership, href: "/membership" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginLeft: "auto",
          }}
        >
          {/* Search icon */}
          <button
            aria-label="Search"
            className="icon-btn"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          {/* Account icon */}
          <Link
            href="/account"
            aria-label="Account"
            className="icon-btn"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Cart icon */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="icon-btn"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              position: "relative",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span
              style={{
                position: "absolute",
                top: "4px",
                right: "4px",
                width: "14px",
                height: "14px",
                backgroundColor: "#146345",
                color: "#ffffff",
                borderRadius: "50%",
                fontSize: "9px",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              0
            </span>
          </Link>

          {/* Lang toggle */}
          <button
            onClick={() => setLang(lang === "en" ? "zh" : "en")}
            style={{
              background: "none",
              border: "1px solid #e0e0e0",
              borderRadius: "60px",
              padding: "5px 12px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#555",
              cursor: "pointer",
              fontFamily: "inherit",
              marginLeft: "4px",
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#146345";
              e.currentTarget.style.color = "#146345";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#e0e0e0";
              e.currentTarget.style.color = "#555";
            }}
          >
            {t.langToggle}
          </button>

          {/* Book Repair CTA */}
          <Link
            href="/book"
            style={{
              background: "#1c3830",
              color: "#17db66",
              borderRadius: "8px",
              padding: "9px 18px",
              fontSize: "13px",
              fontWeight: 700,
              textDecoration: "none",
              marginLeft: "8px",
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
            className="book-btn"
          >
            {t.navBookRepair}
          </Link>
        </div>
      </div>

      <style>{`
        .nav-link {
          color: #444;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          padding: 7px 13px;
          border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover {
          color: #146345;
          background: #f0faf4;
        }
        .icon-btn {
          color: #444;
          transition: color 0.15s, background 0.15s;
        }
        .icon-btn:hover {
          color: #146345;
          background: #f5f5f5;
        }
        .book-btn:hover {
          background: #146345 !important;
        }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
        }
      `}</style>
    </header>
  );
}
