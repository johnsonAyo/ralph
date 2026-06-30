"use client";
import Link from "next/link";
import "./site-header/site-header.css";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Moon, Search, Sun, User as UserIcon } from "lucide-react";
import { Button } from "@ralph/ui";
import { getSupabaseBrowserClient, isSupabaseConfigured, useSession, } from "../lib/supabase";
import { useCredits } from "../lib/use-credits";
import { useTheme } from "../lib/use-theme";
import { openAuth } from "../lib/use-auth-dialog";
import { getUserDisplayName } from "../lib/user-display";
const HOME_ANCHORS = [
    { href: "#why", label: "Why" },
    { href: "#pricing", label: "Pricing" },
    { href: "#faqs", label: "FAQs" },
] as const;
const DASHBOARD_LINKS = [
    { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
    { href: "/dashboard/listings", label: "Listings", Icon: Search },
    { href: "/dashboard/profile", label: "Profile", Icon: UserIcon },
] as const;
export default function SiteHeader() {
    const pathname = usePathname() ?? "/";
    const isHome = pathname === "/";
    const isOnDashboard = pathname.startsWith("/dashboard");
    const isAuthPage = pathname.startsWith("/auth");
    const { data: user } = useSession();
    const { data: creditInfo, isLoading: loadingCredits } = useCredits(user?.id);
    const credits = creditInfo?.balance ?? 0;
    const creditTotal = creditInfo?.total ?? 0;
    const { theme, toggle: toggleTheme } = useTheme();
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
    if (!isSupabaseConfigured() || isOnDashboard || isAuthPage) {
        return null;
    }
    return (<header className={`nav ${isOnDashboard ? "dashboard-nav" : ""}`}>
      <Link className="brand" href="/" aria-label="Ask Ralph home">
        <span className="brand-mark">R</span>
        <span>
          Ask
          <br />
          Ralph
        </span>
      </Link>

      {isOnDashboard ? (<nav aria-label="Dashboard sections">
          {DASHBOARD_LINKS.map((link) => {
                const Icon = link.Icon;
                return (<Link key={link.label} href={link.href}>
                <Icon size={16} aria-hidden="true"/>
                {link.label}
              </Link>);
            })}
        </nav>) : (<nav aria-label="Marketing sections">
          {HOME_ANCHORS.map((link) => (<Link key={link.label} href={{ pathname: "/", hash: link.href }}>
              {link.label}
            </Link>))}
        </nav>)}

      {!isAuthPage ? (<div className="nav-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Light report preview" : "Dark report preview"}
            title={theme === "dark" ? "Light report" : "Dark report"}
          >
            {theme === "dark" ? <Sun size={16} aria-hidden="true"/> : <Moon size={16} aria-hidden="true"/>}
          </button>
          {user ? (<>
              <span className="dashboard-nav-credits" style={{ opacity: 0.8, fontSize: "0.85rem", fontWeight: 500 }}>
                {loadingCredits ? "..." : `${credits} / ${creditTotal} checks left`}
              </span>
              <span className="dashboard-nav-email" title={getUserDisplayName(user)}>
                {getUserDisplayName(user)}
              </span>
              <Button type="button" className="dashboard-logout" onClick={handleSignOut}>
                <LogOut size={14} aria-hidden="true"/>
                Logout
              </Button>
            </>) : (<>
              <button type="button" className="auth-pill auth-link" onClick={() => openAuth("drawer")}>
                Sign in
              </button>
              {isHome ? (<Button type="button" size="md" className="min-h-[44px] rounded-[14px]" onClick={() => openAuth("modal")}>
                  Ask Ralph
                </Button>) : null}
            </>)}
        </div>) : null}
    </header>);
}
