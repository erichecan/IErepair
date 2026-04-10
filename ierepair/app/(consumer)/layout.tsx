import Link from "next/link";
import { Search, Store, Wrench, User } from "lucide-react";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop header — hidden on mobile */}
      <header className="hidden md:block sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <span className="font-heading font-bold text-primary text-lg tracking-tight">IERepair</span>
          <nav className="flex items-center gap-1">
            <NavItem href="/"                      icon={<Search size={17} />} label="Search"  />
            <NavItem href="/repair"                icon={<Wrench size={17} />} label="Repair"  />
            <NavItem href="/search?type=merchant"  icon={<Store  size={17} />} label="Stores"  />
            <NavItem href="/account"               icon={<User   size={17} />} label="Account" />
          </nav>
        </div>
      </header>

      {/* Content — narrow on mobile, wide on desktop */}
      <main className="flex-1 pb-20 md:pb-8 w-full max-w-[430px] md:max-w-5xl mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          <NavItem href="/"                      icon={<Search size={22} />} label="Search"  />
          <NavItem href="/repair"                icon={<Wrench size={22} />} label="Repair"  />
          <NavItem href="/search?type=merchant"  icon={<Store  size={22} />} label="Stores"  />
          <NavItem href="/account"               icon={<User   size={22} />} label="Account" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 text-muted-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] justify-center md:flex-row md:gap-2 md:px-3 md:py-2 md:rounded-lg md:hover:bg-secondary md:text-sm md:font-medium"
    >
      {icon}
      <span className="text-[10px] font-medium md:text-sm">{label}</span>
    </Link>
  );
}
