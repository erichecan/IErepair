import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, REPAIR_PRODUCTS } from "@/data/fonfix/products";

export function generateStaticParams() {
  return REPAIR_PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-[var(--fonfix-text-muted)] mb-8">
          <Link href="/" className="hover:text-[var(--fonfix-blue)]">Home</Link>
          <span className="mx-2">/</span>
          <Link href={`/collections/${product.brandSlug}`} className="hover:text-[var(--fonfix-blue)]">
            {product.brand} Repairs
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--fonfix-text)]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: image placeholder */}
          <div className="bg-[var(--fonfix-blue-light)] rounded-2xl aspect-square flex items-center justify-center">
            <div className="text-center text-[var(--fonfix-text-muted)]">
              <div className="text-6xl mb-3">📱</div>
              <p className="text-sm font-medium">{product.deviceModel}</p>
            </div>
          </div>

          {/* Right: details */}
          <div className="flex flex-col gap-6">
            {product.badge && (
              <span className="self-start text-xs font-semibold text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)] rounded-full px-3 py-1">
                {product.badge}
              </span>
            )}

            <div>
              <p className="text-sm text-[var(--fonfix-text-muted)] mb-1">{product.brand} · {product.deviceModel}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--fonfix-text)] leading-snug">
                {product.repairType}
              </h1>
            </div>

            <p className="text-[var(--fonfix-text-muted)] leading-relaxed">{product.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Repair time", value: `~${product.estimatedMin} min` },
                { label: "Warranty", value: product.warranty },
                { label: "Deposit", value: `€${product.depositAmount}` },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border border-[var(--fonfix-border)] p-3 text-center">
                  <p className="text-xs text-[var(--fonfix-text-muted)] mb-1">{stat.label}</p>
                  <p className="font-bold text-[var(--fonfix-text)] text-sm">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Price + CTA */}
            <div className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-6 flex flex-col gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[var(--fonfix-text)]">€{product.price}</span>
                <span className="text-[var(--fonfix-text-muted)] text-sm">total price</span>
              </div>
              <p className="text-sm text-[var(--fonfix-text-muted)]">
                Pay just €{product.depositAmount} now to secure your booking. Remaining balance due in-store.
              </p>
              <Link
                href="/repair/book"
                className="block text-center px-6 py-4 bg-[var(--fonfix-blue)] text-white font-bold rounded-xl hover:bg-[var(--fonfix-blue-dark)] transition-colors"
              >
                Book This Repair →
              </Link>
              <p className="text-xs text-center text-[var(--fonfix-text-muted)]">
                No Fix, No Fee · 180-day warranty · Free diagnostics
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
