import { notFound } from "next/navigation";
import Link from "next/link";
import { getCollectionBySlug, getProductsByBrand, COLLECTIONS } from "@/data/fonfix/products";

export function generateStaticParams() {
  return COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const products = getProductsByBrand(slug);

  return (
    <div className="min-h-screen bg-[#F8FAFD]">
      {/* Header */}
      <div className="bg-white border-b border-[var(--fonfix-border)]">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <nav className="text-sm text-[var(--fonfix-text-muted)] mb-4">
            <Link href="/" className="hover:text-[var(--fonfix-blue)]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--fonfix-text)]">{collection.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--fonfix-text)] mb-2">
            {collection.name}
          </h1>
          <p className="text-[var(--fonfix-text-muted)] text-lg">{collection.description}</p>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {products.length === 0 ? (
          <div className="text-center py-24 text-[var(--fonfix-text-muted)]">
            No repairs listed yet. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="bg-white rounded-2xl border border-[var(--fonfix-border)] p-6 hover:shadow-md transition-shadow group flex flex-col gap-4"
              >
                {/* Badge */}
                {product.badge && (
                  <span className="self-start text-xs font-semibold text-[var(--fonfix-blue)] bg-[var(--fonfix-blue-light)] rounded-full px-3 py-1">
                    {product.badge}
                  </span>
                )}

                <div>
                  <p className="text-xs text-[var(--fonfix-text-muted)] mb-1">{product.deviceModel}</p>
                  <h2 className="font-bold text-[var(--fonfix-text)] text-lg leading-snug group-hover:text-[var(--fonfix-blue)] transition-colors">
                    {product.repairType}
                  </h2>
                </div>

                <p className="text-sm text-[var(--fonfix-text-muted)] flex-1 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-end justify-between pt-2 border-t border-[var(--fonfix-border)]">
                  <div>
                    <p className="text-2xl font-extrabold text-[var(--fonfix-text)]">€{product.price}</p>
                    <p className="text-xs text-[var(--fonfix-text-muted)]">
                      €{product.depositAmount} deposit · {product.warranty} warranty
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[var(--fonfix-blue)]">
                    ~{product.estimatedMin} min →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
