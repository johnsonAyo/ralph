"use client";
import "./dashboard.css";
import { ReactNode, useEffect, useState } from "react";
import DashboardShell from "../components/dashboard-shell";
import { useSession } from "../lib/supabase";
import { DashboardLayoutSkeleton } from "../components/skeleton";
import { isDevAuthBypassEnabled } from "../lib/dev-auth";
export default function DashboardLayout({ children }: {
    children: ReactNode;
}) {
    // Render the skeleton until mounted so the first client render matches the server (avoids a hydration mismatch).
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const devAuthDisabled = isDevAuthBypassEnabled();
    const { data: user, isLoading } = useSession();
    if (!mounted) {
        return <DashboardLayoutSkeleton />;
    }
    if (!devAuthDisabled) {
        if (isLoading) {
            return <DashboardLayoutSkeleton />;
        }
        if (!user) {
            return null;
        }
    }
    return <DashboardShell>{children}</DashboardShell>;
}
