import Link from "next/link";

const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Screen Replacement",
    category: "Screen Repair",
    priceFrom: 89,
    storeCount: 8,
    badge: "Best Seller",
    badgeColor: "#1d1d1f",
    badgeBg: "#17db66",
    image: "/fonfix/apple-mobile.jpg",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Battery",
    category: "Battery Replacement",
    priceFrom: 49,
    storeCount: 6,
    badge: null,
    badgeColor: null,
    badgeBg: null,
    image: "/fonfix/samsung-mobile.jpg",
  },
  {
    id: 3,
    name: "Universal USB-C Charging Cable 2m",
    category: "Accessories",
    priceFrom: 12,
    storeCount: 15,
    badge: "Popular",
    badgeColor: "#fff",
    badgeBg: "#146345",
    image: null,
  },
  {
    id: 4,
    name: "iPhone 14 / 15 Tempered Glass Screen Protector",
    category: "Accessories",
    priceFrom: 8,
    storeCount: 12,
    badge: null,
    badgeColor: null,
    badgeBg: null,
    image: "/fonfix/apple-mobile.jpg",
  },
  {
    id: 5,
    name: "iPhone 15 Battery Replacement",
    category: "Battery Replacement",
    priceFrom: 59,
    storeCount: 9,
    badge: null,
    badgeColor: null,
    badgeBg: null,
    image: "/fonfix/apple-mobile.jpg",
  },
  {
    id: 6,
    name: "Magsafe Compatible Phone Case",
    category: "Phone Cases",
    priceFrom: 19,
    storeCount: 7,
    badge: "New",
    badgeColor: "#fff",
    badgeBg: "#17db66",
    image: "/fonfix/apple-mobile.jpg",
  },
  {
    id: 7,
    name: "Samsung S23 Charging Port Repair",
    category: "Repair Services",
    priceFrom: 45,
    storeCount: 5,
    badge: null,
    badgeColor: null,
    badgeBg: null,
    image: "/fonfix/samsung-galaxy-s22.png",
  },
  {
    id: 8,
    name: "65W GaN Fast Charger",
    category: "Accessories",
    priceFrom: 28,
    storeCount: 11,
    badge: null,
    badgeColor: null,
    badgeBg: null,
    image: null,
  },
];

function ProductCard({ product }: { product: (typeof products)[0] }) {
  return (
    <Link href={`/products/${product.id}`} className="product-card">
      <div
        style={{
          height: "180px",
          background: "#f5f5f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cccccc"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        )}
        {product.badge && (
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: product.badgeBg!,
              color: product.badgeColor!,
              borderRadius: "60px",
              padding: "3px 10px",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            {product.badge}
          </div>
        )}
      </div>

      <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {product.category}
        </span>
        <h3
          style={{
            fontSize: "14px",
            fontWeight: 600,
            lineHeight: 1.4,
            color: "#1d1d1f",
            flex: 1,
          }}
        >
          {product.name}
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "4px",
          }}
        >
          <div>
            <span style={{ fontSize: "13px", color: "#888" }}>From </span>
            <span style={{ fontSize: "16px", fontWeight: 800, color: "#1d1d1f" }}>
              €{product.priceFrom}
            </span>
          </div>
          <span
            style={{
              fontSize: "12px",
              color: "#888",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            {product.storeCount} stores
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PopularProducts() {
  return (
    <section style={{ padding: "64px 0" }}>
      <div className="wrapper">
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#1d1d1f",
                letterSpacing: "-0.5px",
                marginBottom: "6px",
              }}
            >
              Popular Services & Products
            </h2>
            <p style={{ color: "#888", fontSize: "14px" }}>
              Most booked this week across Ireland
            </p>
          </div>
          <Link href="/search" className="view-all-link">
            View all
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <style>{`
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .product-card {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1.5px solid #efefef;
          border-radius: 16px;
          overflow: hidden;
          text-decoration: none;
          color: #1d1d1f;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
        }
        .product-card:hover {
          border-color: #146345;
          box-shadow: 0 4px 20px rgba(20,99,69,0.1);
          transform: translateY(-2px);
        }
        .view-all-link {
          font-size: 14px;
          font-weight: 600;
          color: #146345;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        @media (max-width: 1100px) {
          .products-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 768px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .products-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
