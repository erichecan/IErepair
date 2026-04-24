import Link from "next/link";

const FOOTER_LINKS = {
  Repairs: [
    { label: "Apple",            href: "/repair/browse?type=phone&brand=Apple" },
    { label: "Samsung",          href: "/repair/browse?type=phone&brand=Samsung" },
    { label: "Google Pixel",     href: "/repair/browse?type=phone&brand=Google" },
    { label: "OnePlus",          href: "/repair/browse?type=phone&brand=OnePlus" },
    { label: "All devices",      href: "/repair/browse" },
  ],
  Services: [
    { label: "Screen repair",       href: "/repair/list/screen" },
    { label: "Battery replacement", href: "/repair/list/battery" },
    { label: "Back glass",          href: "/repair/list/back-glass" },
    { label: "Charging port",       href: "/repair/list/charging" },
  ],
  Company: [
    { label: "About IErepair",   href: "/pages/about" },
    { label: "Business repairs", href: "/pages/business" },
    { label: "Our stores",       href: "/pages/stores" },
    { label: "Blog",             href: "/blogs" },
  ],
  Support: [
    { label: "Help Centre",     href: "/help" },
    { label: "How it works",    href: "/pages/how-it-works" },
    { label: "FAQ",             href: "/pages/faq" },
    { label: "Contact us",      href: "/pages/contact" },
    { label: "Warranty policy", href: "/pages/warranty" },
  ],
  Legal: [
    { label: "Privacy policy",    href: "/pages/privacy-policy" },
    { label: "Terms of service", href: "/pages/terms-of-service" },
  ],
};

export default function IErepairFooter() {
  return (
    <footer className="bg-[var(--fonfix-footer-bg)] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <span className="text-white font-extrabold text-2xl">IErepair</span>
            <p className="mt-3 text-sm text-white/60 leading-relaxed max-w-[220px]">
              Ireland&apos;s trusted phone repair network. Same-day service, 180-day warranty.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { name: "facebook",  href: "https://facebook.com" },
                { name: "instagram", href: "https://instagram.com" },
                { name: "twitter",   href: "https://twitter.com" },
                { name: "youtube",   href: "https://youtube.com" },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  aria-label={s.name}
                  className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 transition-colors text-xs font-semibold uppercase"
                >
                  {s.name[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

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

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>
            © {new Date().getFullYear()} IErepair Ltd. Registered in Ireland.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
