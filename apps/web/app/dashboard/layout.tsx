"use client";
import { ReactNode } from "react";
import DashboardShell from "../components/dashboard-shell";
import { useSession } from "../lib/supabase";
import { DashboardLayoutSkeleton } from "../components/skeleton";
import { isDevAuthBypassEnabled } from "../lib/dev-auth";
export default function DashboardLayout({ children }: {
    children: ReactNode;
}) {
    // DEV MODE: temporarily disable auth gate (see lib/dev-auth).
    const devAuthDisabled = isDevAuthBypassEnabled();
    const { data: user, isLoading } = useSession();
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
