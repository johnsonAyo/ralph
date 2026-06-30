import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { isDevAuthBypassEnabled } from "./app/lib/dev-auth";
const publicPaths = ["/", "/dashboard", "/opengraph-image"];
const staticPathPrefixes = ["/_next", "/favicon.ico", "/images", "/fonts", "/dev"];
function isPublicPath(pathname: string): boolean {
    return (publicPaths.includes(pathname) ||
        staticPathPrefixes.some((prefix) => pathname.startsWith(prefix)));
}
export async function proxy(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    
    if (isDevAuthBypassEnabled()) {
        return response;
    }
    const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!hasSupabaseConfig) {
        return response;
    }
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
        cookies: {
            get(name) {
                return request.cookies.get(name)?.value;
            },
            set(name, value, options) {
                response.cookies.set({ name, value, ...options });
            },
            remove(name, options) {
                response.cookies.set({ name, value: "", ...options, maxAge: 0 });
            },
        },
    });
    const { data: { user }, } = await supabase.auth.getUser();
    if (user && request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (isPublicPath(request.nextUrl.pathname)) {
        return response;
    }
    if (!user) {
        const authUrl = new URL("/?login=true", request.url);
        authUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
        return NextResponse.redirect(authUrl);
    }
    return response;
}
export const config = {
    matcher: ["/((?!api).*)"],
};
