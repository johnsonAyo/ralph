"use client";
import "./dashboard-shell.css";
import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PlusCircle, Search, User as UserIcon, Coins, PanelLeftClose, PanelLeftOpen, Clock } from "lucide-react";
import { Button } from "@ralph/ui";
import { useSession } from "../../lib/supabase";
import { useCredits } from "../../lib/use-credits";
import { getUserDisplayName, getUserInitials } from "../../lib/user-display";
const SIDEBAR_STORAGE_KEY = "ralph:sidebar-collapsed";
const DASHBOARD_LINKS = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/dashboard/new", label: "New check", Icon: PlusCircle },
    { href: "/dashboard/history", label: "History", Icon: Clock },
    { href: "/dashboard/listings", label: "Listings", Icon: Search },
    { href: "/dashboard/profile", label: "Profile", Icon: UserIcon },
] as const;
interface DashboardShellProps {
    children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
    const pathname = usePathname() ?? "/dashboard";
    const { data: user } = useSession();
    const { data: creditInfo, isLoading: loadingCredits } = useCredits(user?.id);
    const credits = creditInfo?.balance ?? 0;
    const creditTotal = creditInfo?.total ?? 0;
    const initials = getUserInitials(user);
    const displayName = getUserDisplayName(user);
    const activeLink = DASHBOARD_LINKS.find((l) => l.href === pathname);
    const pageTitle = activeLink?.label ?? (pathname.includes("/reports/") ? "Report" : "Dashboard");
    const [collapsed, setCollapsed] = useState(false);
    useEffect(() => {
        try {
            setCollapsed(window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
        }
        catch {
            /* ignore */
        }
    }, []);
    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                window.localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
            }
            catch {
                /* ignore */
            }
            return next;
        });
    };
    return (<div className="dashboard-layout" data-collapsed={collapsed}>


      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <Link className="brand" href="/" aria-label="Ask Ralph home">
            <span className="brand-mark">R</span>
            <span className="dashboard-collapse-hide">Ask<br />Ralph</span>
          </Link>
          <button type="button" className="dashboard-collapse-toggle" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <PanelLeftOpen size={18} aria-hidden="true"/> : <PanelLeftClose size={18} aria-hidden="true"/>}
          </button>
        </div>

        <nav className="dashboard-sidebar-nav" aria-label="Dashboard sections">
          {DASHBOARD_LINKS.map((link) => {
            const Icon = link.Icon;
            const isActive = pathname === link.href;
            return (<Link key={link.label} href={link.href} className={`dashboard-nav-item ${isActive ? "active" : ""}`} title={collapsed ? link.label : undefined}>
                <Icon size={18} aria-hidden="true"/>
                <span className="dashboard-collapse-hide">{link.label}</span>
              </Link>);
        })}
        </nav>

        <div className="dashboard-sidebar-footer">
          {user && (<div className="dashboard-credits-widget">
              <div className="dashboard-credits-info">
                <Coins size={16} className="dashboard-credits-icon"/>
                <div className="dashboard-credits-text dashboard-collapse-hide">
                  <span className="dashboard-credits-count">
                    {loadingCredits ? "…" : `${credits} / ${creditTotal}`} checks left
                  </span>
                  <Link href="/#pricing" className="dashboard-credits-link">
                    Buy more
                  </Link>
                </div>
              </div>
            </div>)}

          {user && (<Link href="/dashboard/profile" className="dashboard-user-widget" title={collapsed ? displayName : undefined}>
              <div className="dashboard-user-avatar" aria-hidden="true">{initials}</div>
              <span className="dashboard-user-email dashboard-collapse-hide" title={displayName}>
                {displayName}
              </span>
            </Link>)}
        </div>
      </aside>

      
      <div className="dashboard-main-wrap">

        
        <header className="dashboard-topbar">
          <p className="dashboard-topbar-page">{pageTitle}</p>
          <div className="dashboard-topbar-right">
            <Button asChild size="none" className="dashboard-topbar-cta">
              <Link href="/dashboard/new">
                <PlusCircle size={15} aria-hidden="true"/>
                New check
              </Link>
            </Button>
            {user && (<Link href="/dashboard/profile" className="dashboard-topbar-avatar" aria-label="Profile">
                {initials}
              </Link>)}
          </div>
        </header>

        <main className="dashboard-main">{children}</main>
      </div>
    </div>);
}
