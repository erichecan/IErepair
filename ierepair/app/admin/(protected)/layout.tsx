import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Store, Package, Tag, LogOut, BarChart3 } from "lucide-react";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="px-5 py-6 border-b border-border">
          <div className="text-xl font-heading font-bold text-primary">IERepair</div>
          <div className="text-xs text-muted-foreground mt-0.5">Admin HQ</div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <SidebarLink href="/admin/merchants"  icon={<Store size={18} />}     label="Merchants" />
          <SidebarLink href="/admin/products"   icon={<Package size={18} />}   label="Product Library" />
          <SidebarLink href="/admin/categories" icon={<Tag size={18} />}       label="Categories" />
          <SidebarLink href="/admin/finance"    icon={<BarChart3 size={18} />} label="Finance" />
        </nav>
        <div className="px-3 py-4 border-t border-border">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <LogOut size={18} />Sign Out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 min-w-0 bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
      {icon}{label}
    </Link>
  );
}
