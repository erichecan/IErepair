"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n/useLang";
import { useConsumerT } from "@/lib/i18n/consumer";

export default function Hero() {
  const [keyword, setKeyword] = useState("");
  const [eircode, setEircode] = useState("");
  const [lang] = useLang("en");
  const t = useConsumerT(lang);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.set("q", keyword);
    if (eircode) params.set("eircode", eircode);
    window.location.href = `/search?${params.toString()}`;
  }

  return (
    <section
      style={{
        background: "#ffffff",
        color: "#1d1d1f",
        padding: "80px 0 72px",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <div className="wrapper">
        <div className="hero-grid">
          {/* Left: text + search */}
          <div>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#f0faf4",
                border: "1px solid #c3e8d3",
                borderRadius: "60px",
                padding: "5px 14px",
                marginBottom: "24px",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#17db66",
                  display: "inline-block",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#146345" }}>
                {t.heroBadge}
              </span>
            </div>

            <h1
              style={{
                fontSize: "clamp(36px, 4vw, 52px)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "18px",
                letterSpacing: "-1px",
                color: "#1d1d1f",
              }}
            >
              {t.heroHeading1}{" "}
              <span style={{ color: "#1a7a4a" }}>{t.heroHeading2}</span>
              <br />
              {t.heroHeading3}
            </h1>
            <p
              style={{
                fontSize: "17px",
                color: "#666",
                marginBottom: "36px",
                lineHeight: 1.7,
                maxWidth: "480px",
              }}
            >
              {t.heroSub}
            </p>

            {/* Search form */}
            <form
              onSubmit={handleSearch}
              style={{
                display: "flex",
                gap: "0",
                background: "#ffffff",
                borderRadius: "60px",
                border: "1.5px solid #e0e0e0",
                padding: "6px",
                maxWidth: "540px",
                boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  gap: "10px",
                  borderRight: "1px solid #e8e8e8",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder={t.heroKeywordPlaceholder}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "14px",
                    color: "#1d1d1f",
                    width: "100%",
                    background: "transparent",
                    fontFamily: "inherit",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0 16px",
                  gap: "10px",
                  minWidth: "140px",
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  type="text"
                  placeholder={t.heroEircodePlaceholder}
                  value={eircode}
                  onChange={(e) => setEircode(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "14px",
                    color: "#1d1d1f",
                    width: "100%",
                    background: "transparent",
                    fontFamily: "inherit",
                    textTransform: "uppercase",
                  }}
                  maxLength={7}
                />
              </div>
              <button
                type="submit"
                style={{
                  background: "#1d1d1f",
                  color: "#17db66",
                  border: "none",
                  borderRadius: "54px",
                  padding: "13px 24px",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#146345")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#1d1d1f")}
              >
                {t.heroSearchBtn}
              </button>
            </form>

            <p style={{ marginTop: "14px", fontSize: "13px", color: "#aaa" }}>
              {t.heroPopular}{" "}
              {t.heroTags.map((tag, i) => (
                <span key={tag}>
                  <a
                    href={`/search?q=${encodeURIComponent(tag)}`}
                    style={{
                      color: "#555",
                      textDecoration: "underline",
                      textDecorationColor: "#ddd",
                    }}
                  >
                    {tag}
                  </a>
                  {i < t.heroTags.length - 1 && (
                    <span style={{ margin: "0 6px", opacity: 0.4 }}>·</span>
                  )}
                </span>
              ))}
            </p>
          </div>

          {/* Right: device image */}
          <div className="hero-image-col">
            <div
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                aspectRatio: "4/3",
              }}
            >
              <img
                src="/fonfix/apple-mobile.jpg"
                alt="Phone repair service"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 56px;
          align-items: center;
        }
        .hero-image-col {
          display: block;
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-image-col { display: none !important; }
        }
      `}</style>
    </section>
  );
}
