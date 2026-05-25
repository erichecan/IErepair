import AnnouncementBar from "@/components/fonfix/layout/AnnouncementBar";
import IErepairHeader from "@/components/fonfix/layout/Header";
import IErepairFooter from "@/components/fonfix/layout/Footer";
import ChatWidget from "@/components/fonfix/layout/ChatWidget";
import { CartProvider } from "@/contexts/CartContext";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-white">
        <AnnouncementBar />
        <IErepairHeader />
        <main className="flex-1">{children}</main>
        <IErepairFooter />
        <ChatWidget />
      </div>
    </CartProvider>
  );
}
