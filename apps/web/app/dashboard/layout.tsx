"use client";
import { ReactNode } from "react";
import DashboardShell from "../components/dashboard-shell";
import { useSession } from "../lib/supabase";
import { DashboardLayoutSkeleton } from "../components/skeleton";
export default function DashboardLayout({ children }: {
    children: ReactNode;
}) {
    // DEV MODE: temporarily disable auth gate. Set NEXT_PUBLIC_DISABLE_AUTH_FOR_DEV=true in apps/web/.env.local.
    const devAuthDisabled = process.env.NEXT_PUBLIC_DISABLE_AUTH_FOR_DEV === "true";
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
