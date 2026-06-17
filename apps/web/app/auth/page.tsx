"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookmarkCheck, History, Lock, ScrollText, Warehouse } from "lucide-react";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
  useSession,
} from "../lib/supabase";
import { authPlatforms, signInBenefits } from "../constants";

const platformIcon = {
  copart: Warehouse,
  iaa: ScrollText
} as const;

const benefitIcon = {
  BookmarkCheck,
  History,
  Lock
} as const;

export default function AuthPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: user, isLoading } = useSession();

  // Redirect when a session is resolved.
  useEffect(() => {
    if (user) {
      router.replace(getNextPath());
    }
  }, [user, router]);

  if (isLoading) {
    return <main className="auth-page-shell">Loading Ralph auth...</main>;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage(
          "Sign-in isn't configured on this deployment. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the dev server.",
        );
        return;
      }

      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Redirect back to /auth so the client-side useEffect can process
          // the URL hash fragment and detect the session before navigating to
          // the final destination. Redirecting directly to a server component
          // (e.g. /dashboard) would cause a redirect loop because the server
          // cannot see the hash fragment.
          emailRedirectTo: `${getSiteUrl()}/auth?next=${encodeURIComponent(getNextPath())}`,
        },
      });

      if (result.error) {
        throw result.error;
      }

      setMessage("Magic link sent. Check your email to continue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!configured) {
    return (
      <main className="auth-page-shell">
        <section className="auth-card setup-card">
          <div className="auth-card-header">
            <Link className="auth-home-link" href="/">
              Ralph
            </Link>
            <span className="auth-badge">Setup required</span>
          </div>
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
      </main>
    );
  }

  return (
    <main className="auth-page-shell">
      <section className="auth-card">
        <div className="auth-card-header">
          <Link className="auth-home-link" href="/">
            Ralph
          </Link>
          <span className="auth-badge">Magic link</span>
        </div>
        <h1>Sign in to Ask Ralph</h1>
        <p className="auth-card-copy">
          Magic-link sign in. Your reports and history stay in sync across devices.
        </p>

        <div className="auth-platforms">
          <p className="auth-platforms-kicker">
            Ralph reads live listings from these auction platforms
          </p>
          <ul className="auth-platforms-grid">
            {authPlatforms.map((platform) => {
              const Icon = platformIcon[platform.id];
              return (
                <li
                  key={platform.id}
                  className="auth-platform-tile"
                  data-platform={platform.id}
                >
                  <span
                    className={`auth-platform-icon auth-platform-icon--${platform.id}`}
                    aria-hidden="true"
                  >
                    <Icon />
                  </span>
                  <div>
                    <strong>{platform.name}</strong>
                    <span>{platform.subtitle}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <div className="auth-actions">
            <button type="submit" disabled={submitting}>
              {submitting ? "Working..." : "Send magic link"}
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
            return (
              <li key={benefit.title}>
                <span className="auth-benefits-icon" aria-hidden="true">
                  <Icon />
                </span>
                <div className="auth-benefits-text">
                  <strong>{benefit.title}</strong>
                  <span>{benefit.body}</span>
                </div>
              </li>
            );
          })}
        </ul>
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
