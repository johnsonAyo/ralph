"use client";
import { ReactNode } from "react";
import DashboardShell from "../components/dashboard-shell";
import { useSession } from "../lib/supabase";
import { DashboardLayoutSkeleton } from "../components/skeleton";
export default function DashboardLayout({ children }: {
    children: ReactNode;
}) {
    const { data: user, isLoading } = useSession();
    if (isLoading) {
        return <DashboardLayoutSkeleton />;
    }
    if (!user) {
        return null;
    }
    return <DashboardShell>{children}</DashboardShell>;
}
