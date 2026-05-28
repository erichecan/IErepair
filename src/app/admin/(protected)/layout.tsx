import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f7" }}>
      <AdminSidebar session={session} />
      <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto", minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
