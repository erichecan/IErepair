import Link from "next/link";
import { Search, Store, Wrench, User } from "lucide-react";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Desktop header */}
      <header className="hidden md:block sticky top-0 z-50 bg-white border-b border-[rgba(34,42,53,0.08)]">
        <div className="max-w-5xl mx-auto px-8 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold text-[#242424] text-lg tracking-tight" style={{ fontFamily: "'Cal Sans', Inter, sans-serif" }}>
            IERepair
          </Link>
          <nav className="flex items-center gap-1">
            <NavItem href="/search"               label="Search"  />
            <NavItem href="/repair"               label="Repair"  />
            <NavItem href="/search?type=merchant" label="Stores"  />
            <NavItem href="/account"              label="Account" />
          </nav>
          <Link
            href="/repair/book"
            className="px-4 py-2 bg-[#242424] text-white text-sm font-semibold rounded-lg hover:opacity-80 transition-opacity"
          >
            Book Repair
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 md:pb-0 w-full max-w-[430px] md:max-w-5xl mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-[rgba(34,42,53,0.08)] z-50">
        <div className="flex items-center justify-around py-2">
          <MobileNavItem href="/"                      icon={<Search size={22} />} label="Search"  />
          <MobileNavItem href="/repair"                icon={<Wrench size={22} />} label="Repair"  />
          <MobileNavItem href="/search?type=merchant"  icon={<Store  size={22} />} label="Stores"  />
          <MobileNavItem href="/account"               icon={<User   size={22} />} label="Account" />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-lg text-sm font-medium text-[#111111] hover:bg-[#f5f5f5] transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileNavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1 px-4 py-1 text-[#898989] hover:text-[#242424] transition-colors min-w-[44px] min-h-[44px] justify-center"
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
