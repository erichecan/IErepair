import { getMerchantSession } from "@/lib/merchant-auth";
import { redirect } from "next/navigation";
import MerchantSidebar from "@/components/merchant/MerchantSidebar";

export default async function ProtectedMerchantLayout({ children }: { children: React.ReactNode }) {
  const session = await getMerchantSession();
  if (!session) redirect("/merchant/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f7" }}>
      <MerchantSidebar session={session} />
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
