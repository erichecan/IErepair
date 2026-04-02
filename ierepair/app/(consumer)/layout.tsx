import Link from "next/link";
import { Search, Store, Wrench, User } from "lucide-react";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen max-w-[430px] mx-auto relative">
      <main className="flex-1 pb-20">{children}</main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          <NavItem href="/"           icon={<Search size={22} />}  label="Search"  />
          <NavItem href="/repair"     icon={<Wrench size={22} />}  label="Repair"  />
          <NavItem href="/search?type=merchant" icon={<Store size={22} />}   label="Stores"  />
          <NavItem href="/account"    icon={<User size={22} />}    label="Account" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] justify-center"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
