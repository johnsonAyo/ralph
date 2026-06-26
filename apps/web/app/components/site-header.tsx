"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Search, User as UserIcon } from "lucide-react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
  useSession,
} from "../lib/supabase";
import { useCredits } from "../lib/use-credits";

const HOME_ANCHORS = [
  { href: "#check", label: "Check" },
  { href: "#answers", label: "Report" },
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

  if (!isSupabaseConfigured() || isOnDashboard) {
    return null;
  }

  return (
    <header className={`nav ${isOnDashboard ? "dashboard-nav" : ""}`}>
      <Link className="brand" href="/" aria-label="Ask Ralph home">
        <span className="brand-mark">R</span>
        <span>
          Ask
          <br />
          Ralph
        </span>
      </Link>

      {isOnDashboard ? (
        <nav aria-label="Dashboard sections">
          {DASHBOARD_LINKS.map((link) => {
            const Icon = link.Icon;
            return (
              <Link key={link.label} href={link.href}>
                <Icon size={16} aria-hidden="true" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      ) : (
        <nav aria-label="Marketing sections">
          {HOME_ANCHORS.map((link) => (
            <Link key={link.label} href={{ pathname: "/", hash: link.href }}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}

      {!isAuthPage ? (
        <div className="nav-actions">
          {user ? (
            <>
              <span
                className="dashboard-nav-credits"
                style={{ opacity: 0.8, fontSize: "0.85rem", fontWeight: 500 }}
              >
                {loadingCredits ? "..." : `${credits} check${credits === 1 ? "" : "s"} left`}
              </span>
              <span
                className="dashboard-nav-email"
                title={user.email ?? user.id}
              >
                {user.email ?? user.id}
              </span>
              <button
                type="button"
                className="button dashboard-logout"
                onClick={handleSignOut}
              >
                <LogOut size={14} aria-hidden="true" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="auth-pill auth-link" href="/auth">
                Sign in
              </Link>
              {isHome ? (
                <a className="button primary" href="#check">
                  Ask Ralph
                </a>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}
