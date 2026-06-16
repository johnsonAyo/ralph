"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../lib/supabase";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        router.replace(getNextPath());
        return;
      }

      setLoading(false);
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${getSiteUrl()}${getNextPath()}`,
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

  if (loading) {
    return <main className="auth-page-shell">Loading Ralph auth...</main>;
  }

  return (
    <main className="auth-page-shell">
      <section className="auth-card">
        <div className="auth-card-header">
          <Link className="auth-home-link" href="/">
            Ralph
          </Link>
          <span className="auth-badge">Supabase Auth</span>
        </div>
        <h1>Get a magic link for Ralph</h1>
        <p>
          Ralph signs you in by email link, then keeps the session in the browser and on the server.
        </p>

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
