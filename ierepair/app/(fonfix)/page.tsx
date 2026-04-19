import HeroSection from "@/components/fonfix/sections/HeroSection";
import HowItWorks from "@/components/fonfix/sections/HowItWorks";
import WhyChooseUs from "@/components/fonfix/sections/WhyChooseUs";
import ReviewsSection from "@/components/fonfix/sections/ReviewsSection";
import BlogPreview from "@/components/fonfix/sections/BlogPreview";
import BusinessCTA from "@/components/fonfix/sections/BusinessCTA";
import NewsletterSection from "@/components/fonfix/sections/NewsletterSection";
import { COLLECTIONS } from "@/data/fonfix/products";
import Link from "next/link";

export default function FonfixHomePage() {
  return (
    <>
      <HeroSection />

      {/* Brand collections */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-[var(--fonfix-text)] mb-8 text-center">
            Repair by brand
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {COLLECTIONS.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/${c.slug}`}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-[var(--fonfix-border)] hover:border-[var(--fonfix-blue)] hover:bg-[var(--fonfix-blue-light)] transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-xs font-semibold text-[var(--fonfix-text)] group-hover:text-[var(--fonfix-blue)] transition-colors text-center">
                  {c.name.replace(" Repairs", "")}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <WhyChooseUs />
      <ReviewsSection />
      <BusinessCTA />
      <BlogPreview />
      <NewsletterSection />
    </>
  );
}
