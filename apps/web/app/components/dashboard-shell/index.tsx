"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, User as UserIcon, LogOut, Coins } from "lucide-react";
import { useSession, getSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase";
import { useCredits } from "../../lib/use-credits";

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/dashboard/listings", label: "Listings", Icon: Search },
  { href: "/dashboard/profile", label: "Profile", Icon: UserIcon },
] as const;

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname() ?? "/dashboard";
  const { data: user } = useSession();
  const { data: credits = 0, isLoading: loadingCredits } = useCredits();

  async function handleSignOut() {
    if (!isSupabaseConfigured()) {
      window.location.href = "/";
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      window.location.href = "/";
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <Link className="brand" href="/" aria-label="Ask Ralph home">
            <span className="brand-mark">R</span>
            <span>
              Ask<br />Ralph
            </span>
          </Link>
        </div>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard sections">
          {DASHBOARD_LINKS.map((link) => {
            const Icon = link.Icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.label} 
                href={link.href} 
                className={`dashboard-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="dashboard-sidebar-footer">
          {user && (
            <div className="dashboard-credits-widget">
              <div className="dashboard-credits-info">
                <Coins size={16} className="dashboard-credits-icon" />
                <div className="dashboard-credits-text">
                  <span className="dashboard-credits-count">
                    {loadingCredits ? "..." : credits} checks left
                  </span>
                  <Link href="/dashboard/profile" className="dashboard-credits-link">
                    Buy more
                  </Link>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="dashboard-user-widget">
              <span className="dashboard-user-email" title={user.email ?? user.id}>
                {user.email ?? user.id}
              </span>
              <button
                type="button"
                className="button dashboard-logout-btn"
                onClick={handleSignOut}
              >
                <LogOut size={14} aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
      
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
