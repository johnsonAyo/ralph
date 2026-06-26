"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import DashboardShell from "../components/dashboard-shell";
import { useSession } from "../lib/supabase";

const DASHBOARD_REDIRECT_TARGET = "/auth?next=/dashboard";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading } = useSession();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(DASHBOARD_REDIRECT_TARGET);
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <main className="auth-page-shell">Loading Ralph...</main>;
  }

  if (!user) {
    
    return null;
  }

  return <DashboardShell>{children}</DashboardShell>;
}
