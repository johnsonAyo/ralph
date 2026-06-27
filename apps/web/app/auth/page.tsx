"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { BookmarkCheck, History, ScrollText, Warehouse } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured, useSession, } from "../lib/supabase";
import { authPlatforms, signInBenefits } from "../constants";
import { AuthShellSkeleton } from "../components/skeleton";
const platformIcon = {
    copart: Warehouse,
    iaa: ScrollText
} as const;
const benefitIcon = {
    BookmarkCheck,
    History,
} as const;
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
          <h1>Sign-in isn't configured on this deployment.</h1>
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
    return (<main className="auth-page-shell">
      <section className="auth-card">
        <h1>Sign in to Ask Ralph</h1>
        <p className="auth-card-copy">
          Sign-in link. Your reports and history stay in sync across devices.
        </p>

        <div className="auth-platforms">
          <p className="auth-platforms-kicker">
            Ralph reads live listings from these auction platforms
          </p>
          <ul className="auth-platforms-grid">
            {authPlatforms.map((platform) => {
            const Icon = platformIcon[platform.id];
            return (<li key={platform.id} className="auth-platform-tile" data-platform={platform.id}>
                  <span className={`auth-platform-icon auth-platform-icon--${platform.id}`} aria-hidden="true">
                    <Icon />
                  </span>
                  <div>
                    <strong>{platform.name}</strong>
                    <span>{platform.subtitle}</span>
                  </div>
                </li>);
        })}
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/>
          </label>

          <div className="auth-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Working..." : "Send sign-in link"}
            </button>
          </div>
        </form>

        {message ? <p className="auth-message">{message}</p> : null}

        <div className="auth-divider">
          <h2>Why sign in</h2>
        </div>

        <ul className="auth-benefits" aria-label="What you get when you sign in">
          {signInBenefits.map((benefit) => {
            const Icon = benefitIcon[benefit.iconName];
            return (<li key={benefit.title}>
                <span className="auth-benefits-icon" aria-hidden="true">
                  <Icon />
                </span>
                <div className="auth-benefits-text">
                  <strong>{benefit.title}</strong>
                  <span>{benefit.body}</span>
                </div>
              </li>);
        })}
        </ul>
      </section>
    </main>);
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
