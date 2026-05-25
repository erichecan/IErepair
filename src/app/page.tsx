import Header from "@/components/header";
import Hero from "@/components/hero";
import QuickLinks from "@/components/quick-links";
import PromoCards from "@/components/promo-cards";
import NearbyStores from "@/components/nearby-stores";
import PopularProducts from "@/components/popular-products";
import MembershipBanner from "@/components/membership-banner";
import Footer from "@/components/footer";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Hero />
        <QuickLinks />
        <PromoCards />
        <NearbyStores />
        <PopularProducts />
        <MembershipBanner />
      </main>
      <Footer />
    </div>
  );
}
