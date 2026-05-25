import Link from "next/link";
import { BRANDS } from "@/data/fonfix/brands";

export default function HeroSection() {
  return (
    <section className="bg-[var(--fonfix-blue)] text-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          Same-day repairs at 4 Irish locations
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
          Your phone fixed,<br />
          <span className="text-white/80">today.</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
          Expert repairs for all major brands. OEM-quality parts, 180-day warranty,
          and a 20% deposit to book your slot.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/repair/browse"
            className="px-8 py-4 bg-white text-[var(--fonfix-blue)] font-bold rounded-xl hover:bg-white/90 transition-colors text-base"
          >
            Book a Repair →
          </Link>
          <Link
            href="/repair/browse"
            className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors text-base border border-white/20"
          >
            View All Services
          </Link>
        </div>

        {/* Brand logos */}
        <div className="flex items-center justify-center flex-wrap gap-6 opacity-70">
          {BRANDS.map((b) => (
            <Link key={b.slug} href={`/collections/${b.slug}`} className="hover:opacity-100 transition-opacity">
              <span className="text-sm font-semibold text-white">{b.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
