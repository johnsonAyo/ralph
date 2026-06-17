"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LogOut,
  Plus,
  User as UserIcon,
} from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../lib/supabase";

interface DashboardShellProps {
  user: SupabaseUser;
  children: ReactNode;
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const router = useRouter();

  async function handleSignOut() {
    if (!isSupabaseConfigured()) {
      router.push("/");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.push("/");
      return;
    }
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="dashboard-layout">
      <header className="nav dashboard-nav">
        <Link
          className="brand"
          href="/dashboard"
          aria-label="Ralph dashboard home"
        >
          <span className="brand-mark">R</span>
          <span>
            Ask
            <br />
            Ralph
          </span>
        </Link>

        <nav aria-label="Dashboard sections">
          <Link href="/dashboard">
            <LayoutDashboard size={16} aria-hidden="true" />
            Dashboard
          </Link>
          <Link href="#check">
            <Plus size={16} aria-hidden="true" />
            New report
          </Link>
          <Link href="/dashboard/profile">
            <UserIcon size={16} aria-hidden="true" />
            Profile
          </Link>
        </nav>

        <div className="nav-actions">
          <span className="dashboard-nav-email" title={user.email ?? user.id}>
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
        </div>
      </header>

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
