"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import {
  Button,
  Container,
  Separator,
} from "@ralph/ui";
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

function BrandMark() {
  return (
    <Link
      href="/"
      aria-label="Ask Ralph home"
      className="flex items-center gap-2.5"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-primary font-serif text-lg font-semibold text-primary-foreground">
        R
      </span>
      <span className="text-sm font-semibold leading-none tracking-tight">
        Ask
        <br />
        Ralph
      </span>
    </Link>
  );
}

export default function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const isHome = pathname === "/";
  const isOnDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = pathname.startsWith("/auth");
  const { data: user } = useSession();
  const { data: credits = 0, isLoading: loadingCredits } = useCredits();

  async function handleSignOut() {
    const supabase = isSupabaseConfigured() ? getSupabaseBrowserClient() : null;
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/";
  }

  if (!isSupabaseConfigured() || isOnDashboard) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <BrandMark />

        <nav
          aria-label="Marketing sections"
          className="hidden items-center gap-1 md:flex"
        >
          {HOME_ANCHORS.map((link) => (
            <Link
              key={link.label}
              href={{ pathname: "/", hash: link.href }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {!isAuthPage ? (
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden text-sm text-muted-foreground sm:inline tabular">
                  {loadingCredits
                    ? "…"
                    : `${credits} check${credits === 1 ? "" : "s"} left`}
                </span>
                <Separator
                  orientation="vertical"
                  className="hidden h-5 sm:block"
                />
                <span
                  className="hidden max-w-[14ch] truncate text-sm text-muted-foreground lg:inline"
                  title={user.email ?? user.id}
                >
                  {user.email ?? user.id}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth">Sign in</Link>
                </Button>
                {isHome ? (
                  <Button asChild size="sm">
                    <a href="#check">Ask Ralph</a>
                  </Button>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </Container>
    </header>
  );
}
