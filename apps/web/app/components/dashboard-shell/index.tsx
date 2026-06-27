"use client";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Search, User as UserIcon, Coins } from "lucide-react";
import { useSession } from "../../lib/supabase";
import { useCredits } from "../../lib/use-credits";
const DASHBOARD_LINKS = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/dashboard/new", label: "New check", Icon: PlusCircle },
    { href: "/dashboard/listings", label: "Listings", Icon: Search },
    { href: "/dashboard/profile", label: "Profile", Icon: UserIcon },
] as const;
interface DashboardShellProps {
    children: ReactNode;
}
function getInitials(email: string): string {
    const parts = email.split("@")[0].split(/[._-]/);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}
export default function DashboardShell({ children }: DashboardShellProps) {
    const pathname = usePathname() ?? "/dashboard";
    const { data: user } = useSession();
    const { data: credits = 0, isLoading: loadingCredits } = useCredits();
    const initials = user?.email ? getInitials(user.email) : "?";
    const activeLink = DASHBOARD_LINKS.find((l) => l.href === pathname);
    const pageTitle = activeLink?.label ?? (pathname.startsWith("/reports/") ? "Report" : "Dashboard");
    return (<div className="dashboard-layout">

      
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <Link className="brand" href="/" aria-label="Ask Ralph home">
            <span className="brand-mark">R</span>
            <span>Ask<br />Ralph</span>
          </Link>
        </div>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard sections">
          {DASHBOARD_LINKS.map((link) => {
            const Icon = link.Icon;
            const isActive = pathname === link.href;
            return (<Link key={link.label} href={link.href} className={`dashboard-nav-item ${isActive ? "active" : ""}`}>
                <Icon size={18} aria-hidden="true"/>
                {link.label}
              </Link>);
        })}
        </nav>

        <div className="dashboard-sidebar-footer">
          {user && (<div className="dashboard-credits-widget">
              <div className="dashboard-credits-info">
                <Coins size={16} className="dashboard-credits-icon"/>
                <div className="dashboard-credits-text">
                  <span className="dashboard-credits-count">
                    {loadingCredits ? "…" : credits} checks left
                  </span>
                  <Link href="/#pricing" className="dashboard-credits-link">
                    Buy more
                  </Link>
                </div>
              </div>
            </div>)}

          {user && (<Link href="/dashboard/profile" className="dashboard-user-widget">
              <div className="dashboard-user-avatar" aria-hidden="true">{initials}</div>
              <span className="dashboard-user-email" title={user.email ?? user.id}>
                {user.email ?? user.id}
              </span>
            </Link>)}
        </div>
      </aside>

      
      <div className="dashboard-main-wrap">

        
        <header className="dashboard-topbar">
          <p className="dashboard-topbar-page">{pageTitle}</p>
          <div className="dashboard-topbar-right">
            <Link href="/dashboard/new" className="dashboard-topbar-cta">
              <PlusCircle size={15} aria-hidden="true"/>
              New check
            </Link>
            {user && (<Link href="/dashboard/profile" className="dashboard-topbar-avatar" aria-label="Profile">
                {initials}
              </Link>)}
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>);
}
