"use client";
import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isSupabaseConfigured, useSession } from "./supabase";
import { isDevAuthBypassEnabled } from "./dev-auth";
const PUBLIC_ONLY_PATHS = new Set(["/", "/auth"]);
function isPublicOnly(pathname: string): boolean {
    return PUBLIC_ONLY_PATHS.has(pathname);
}
function getNextTarget(): string {
    if (typeof window === "undefined") {
        return "/dashboard";
    }
    const next = new URL(window.location.href).searchParams.get("next");
    if (!next || next === "/auth" || next === "/") {
        return "/dashboard";
    }
    return next;
}
export default function AuthGate({ children }: {
    children: ReactNode;
}) {
    const { data: user, isLoading } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    useEffect(() => {
        // DEV MODE: skip the redirect gate so authenticated surfaces are
        // viewable without a session (see lib/dev-auth).
        if (isDevAuthBypassEnabled()) {
            return;
        }
        if (!isSupabaseConfigured()) {
            return;
        }
        if (isLoading) {
            return;
        }
        if (!pathname) {
            return;
        }
        if (user && isPublicOnly(pathname)) {
            router.replace(getNextTarget());
            return;
        }
        if (!user && !isPublicOnly(pathname)) {
            const search = typeof window !== "undefined" ? window.location.search : "";
            const next = encodeURIComponent(pathname + search);
            router.replace(`/auth?next=${next}`);
        }
    }, [user, isLoading, pathname, router]);
    return <>{children}</>;
}
