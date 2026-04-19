import Link from "next/link";

const FOOTER_LINKS = {
  Repairs: [
    { label: "Apple", href: "/collections/apple" },
    { label: "Samsung", href: "/collections/samsung" },
    { label: "Google Pixel", href: "/collections/google" },
    { label: "OnePlus", href: "/collections/oneplus" },
    { label: "All Brands", href: "/repair/browse" },
  ],
  Company: [
    { label: "About Fonfix", href: "/pages/about" },
    { label: "Careers", href: "/pages/careers" },
    { label: "Press", href: "/pages/press" },
    { label: "Partners", href: "/pages/partners" },
    { label: "Blog", href: "/blogs" },
  ],
  Support: [
    { label: "FAQ", href: "/pages/faq" },
    { label: "Find a Store", href: "/pages/stores" },
    { label: "Contact Us", href: "/pages/contact" },
    { label: "Warranty Policy", href: "/pages/warranty" },
    { label: "Business Repairs", href: "/pages/business" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/pages/privacy-policy" },
    { label: "Terms of Service", href: "/pages/terms-of-service" },
    { label: "Cookie Policy", href: "/pages/cookie-policy" },
    { label: "Sitemap", href: "/pages/sitemap" },
  ],
};

export default function FonfixFooter() {
  return (
    <footer className="bg-[var(--fonfix-footer-bg)] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        {/* Top row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-white font-extrabold text-2xl">Fonfix</span>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-[200px]">
              Ireland's trusted phone repair network. Same-day service, 180-day warranty.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {["facebook", "instagram", "twitter", "youtube"].map((s) => (
                <a
                  key={s}
                  href={`https://${s}.com`}
                  aria-label={s}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors text-xs font-semibold uppercase"
                >
                  {s[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-4">
                {title}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Fonfix Ltd. Registered in Ireland. Company No. 123456.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
