"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  BookmarkCheck,
  History,
  Mail,
  ScrollText,
  ShieldCheck,
  Warehouse,
} from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured, useSession, } from "../lib/supabase";
import { Badge, Button, Card, CardContent, Input, Separator } from "@ralph/ui";
import { authPlatforms, signInBenefits } from "../constants";
import { AuthShellSkeleton } from "../components/skeleton";

const platformIcon = {
  copart: Warehouse,
  iaa: ScrollText,
} as const;
const benefitIcon = {
  BookmarkCheck,
  History,
} as const;

const sampleCosts: Array<[string, string]> = [
  ["Current price", "£2,150"],
  ["Fees / admin", "£570"],
  ["Delivery", "£290"],
  ["Repair allowance", "£1,450"],
];

/** Brand mark for the panel. */
function BrandMark() {
  return (
    <Link href="/" aria-label="Ask Ralph home" className="inline-flex items-center gap-2.5">
      <span className="grid size-11 place-items-center rounded-2xl bg-foreground text-[1.25rem] font-[900] text-background">
        R
      </span>
      <span className="text-[0.95rem] font-[900] leading-[0.9] tracking-[-0.04em] text-foreground">
        Ask
        <br />
        Ralph
      </span>
    </Link>
  );
}

/** Compact sample report — the value proof on the brand panel. */
function SampleReportCard() {
  return (
    <Card className="w-full max-w-sm rounded-[24px] border-[#e6ded0] shadow-[0_22px_60px_rgba(60,45,26,0.12)]">
      <CardContent className="flex flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-[0.66rem] font-[900] uppercase tracking-[0.06em] text-[#625c52]">
              Ralph&rsquo;s verdict
            </span>
            <strong className="text-[1.15rem] font-[900] leading-tight tracking-[-0.03em] text-foreground">
              Consider below £1,850
            </strong>
          </div>
          <Badge variant="warning" className="shrink-0 font-[800]">
            Medium certainty
          </Badge>
        </div>

        <div className="flex gap-1.5" aria-hidden>
          <span className="h-1.5 flex-1 rounded-full bg-warning" />
          <span className="h-1.5 flex-1 rounded-full bg-warning" />
          <span className="h-1.5 flex-1 rounded-full bg-[#e6ded0]" />
        </div>

        <Separator className="bg-[#e6ded0]" />

        <div className="flex flex-col gap-2">
          {sampleCosts.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-[0.82rem]">
              <span className="text-[#625c52]">{label}</span>
              <strong className="font-[800] tabular-nums text-foreground">{value}</strong>
            </div>
          ))}
          <Separator className="my-1 bg-[#e6ded0]" />
          <div className="flex items-center justify-between">
            <span className="text-[0.82rem] font-[800] text-foreground">Estimated total</span>
            <strong className="text-[1.1rem] font-[900] tabular-nums text-[#2f62e9]">£4,460</strong>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { isLoading } = useSession();
  if (isLoading) {
    return <AuthShellSkeleton />;
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage("Sign-in isn't configured on this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server.");
        return;
      }
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${getSiteUrl()}/auth?next=${encodeURIComponent(getNextPath())}`,
        },
      });
      if (result.error) {
        throw result.error;
      }
      setMessage("Sign-in link sent. Check your email to continue.");
    }
    catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    }
    finally {
      setSubmitting(false);
    }
  }
  if (!configured) {
    return (<main className="auth-page-shell">
      <section className="auth-card setup-card">
        <h1>Sign-in isn&apos;t configured on this deployment.</h1>
        <p>
          Add the Supabase keys below to <code>apps/web/.env.local</code>, then restart <code>next dev</code>:
        </p>
        <ul className="setup-card-keys">
          <li>
            <code>NEXT_PUBLIC_SUPABASE_URL</code>
          </li>
          <li>
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          </li>
        </ul>
        <p>
          See <code>apps/web/.env.example</code> for the full template.
        </p>
        <Link className="auth-back-link" href="/">
          Back to Ralph
        </Link>
      </section>
    </main>);
  }

  const sent = message === "Sign-in link sent. Check your email to continue.";

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside
        className="relative hidden flex-col justify-between overflow-hidden p-12 xl:p-16 lg:flex"
        style={{ background: "linear-gradient(158deg,#eef3ff 0%,#fbfaf6 52%,#fff4d8 100%)" }}
      >
        <span className="pointer-events-none absolute -left-10 top-[42%] size-40 rounded-full bg-[#2f62e9]/10" aria-hidden />
        <span className="pointer-events-none absolute right-16 top-16 size-24 rounded-full bg-[#ffd84d]/30" aria-hidden />

        <BrandMark />

        <div className="relative flex flex-col gap-7">
          <h2 className="m-0 max-w-[14ch] text-[clamp(1.6rem,2.5vw,2.15rem)] font-[900] leading-[1.06] tracking-[-0.045em] text-foreground">
            Check the car before the auction price decides for you.
          </h2>
          <SampleReportCard />
        </div>

        <div className="relative flex flex-col gap-4">
          <div className="flex flex-wrap gap-2.5">
            {authPlatforms.map((platform) => {
              const Icon = platformIcon[platform.id];
              return (
                <div
                  key={platform.id}
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#e6ded0] bg-white/70 py-1.5 pl-1.5 pr-4 backdrop-blur"
                >
                  <span className="grid size-8 place-items-center rounded-full bg-[#2f62e9]/10 text-[#2f62e9] [&_svg]:size-4">
                    <Icon />
                  </span>
                  <span className="text-[0.8rem] font-[800] text-foreground">{platform.name}</span>
                </div>
              );
            })}
          </div>
          <p className="m-0 flex items-center gap-2 text-[0.8rem] font-[700] text-[#625c52]">
            <ShieldCheck className="size-4 text-[#2f62e9]" aria-hidden />
            Independent of every auction house — Ralph is paid by you, not the seller.
          </p>
        </div>
      </aside>

      {/* Form */}
      <section className="flex items-center justify-center bg-[#fbfaf6] px-5 py-10 sm:px-10 sm:py-12">
        <div className="flex w-full max-w-md flex-col gap-7 sm:gap-8">
          {/* Brand mark — the panel carries it on desktop, so show here only on mobile */}
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-[900] leading-[1.05] tracking-[-0.045em] text-foreground">
              Sign in to Ask Ralph
            </h1>
            <p className="m-0 text-[0.95rem] font-[650] leading-[1.4] text-[#625c52]">
              Enter your email and we&rsquo;ll send a secure sign-in link. No password to remember — your reports stay in sync across devices.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label htmlFor="auth-email" className="text-[0.8rem] font-[800] text-foreground">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9a9286]" aria-hidden />
                <Input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="min-h-[52px] rounded-[14px] pl-10 text-[0.95rem]"
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="min-h-[52px] w-full">
              {submitting ? "Sending link…" : "Send sign-in link"}
            </Button>
          </form>

          {message ? (
            <div
              role="status"
              className={`flex items-start gap-2.5 rounded-[14px] border px-4 py-3 text-[0.85rem] font-[700] leading-[1.4] ${
                sent
                  ? "border-transparent bg-success-subtle text-success-subtle-foreground"
                  : "border-transparent bg-[rgba(47,98,233,0.08)] text-foreground"
              }`}
            >
              {sent ? <Mail className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> : null}
              <span>{message}</span>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <Separator className="flex-1 bg-[#e6ded0]" />
            <span className="text-[0.68rem] font-[900] uppercase tracking-[0.08em] text-[#9a9286]">
              Why sign in
            </span>
            <Separator className="flex-1 bg-[#e6ded0]" />
          </div>

          <ul className="m-0 flex list-none flex-col gap-3 p-0" aria-label="What you get when you sign in">
            {signInBenefits.map((benefit) => {
              const Icon = benefitIcon[benefit.iconName];
              return (
                <li key={benefit.title} className="flex items-start gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-[12px] bg-white text-[#2f62e9] shadow-[0_2px_8px_rgba(60,45,26,0.06)] [&_svg]:size-[18px]">
                    <Icon />
                  </span>
                  <div className="flex flex-col">
                    <strong className="text-[0.86rem] font-[800] text-foreground">{benefit.title}</strong>
                    <span className="text-[0.8rem] font-[600] leading-[1.35] text-[#625c52]">{benefit.body}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </main>
  );
}
function getNextPath(): string {
  if (typeof window === "undefined") {
    return "/";
  }
  return new URL(window.location.href).searchParams.get("next") ?? "/";
}
function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
