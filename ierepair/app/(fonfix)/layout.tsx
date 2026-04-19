import AnnouncementBar from "@/components/fonfix/layout/AnnouncementBar";
import FonfixHeader from "@/components/fonfix/layout/Header";
import FonfixFooter from "@/components/fonfix/layout/Footer";
import ChatWidget from "@/components/fonfix/layout/ChatWidget";
import { CartProvider } from "@/contexts/CartContext";

export default function FonfixLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <AnnouncementBar />
        <FonfixHeader />
        <main className="flex-1">{children}</main>
        <FonfixFooter />
        <ChatWidget />
      </div>
    </CartProvider>
  );
}
