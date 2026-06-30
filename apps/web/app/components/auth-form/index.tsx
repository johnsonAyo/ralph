"use client";

import { FormEvent, useState } from "react";
import { Mail } from "lucide-react";
import { Button, Input } from "@ralph/ui";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase";

const SENT = "Sign-in link sent. Check your email to continue.";

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}

// Compact sign-in form shared by the drawer, the modal and the /auth route.
export default function AuthForm() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sent = message === SENT;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setMessage("Sign-in isn't configured on this deployment.");
        return;
      }
      const result = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${getSiteUrl()}/auth?next=/` },
      });
      if (result.error) throw result.error;
      setMessage(SENT);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOAuth() {
    setMessage("");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Sign-in isn't configured on this deployment.");
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${getSiteUrl()}/auth?next=/` },
    });
    if (error) setMessage(error.message);
  }

  if (!configured) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="m-0 text-[1.3rem] font-[900] tracking-[-0.03em] text-foreground">Sign in to Ask Ralph</h2>
        <p className="m-0 text-[0.9rem] font-[650] leading-[1.4] text-[#625c52]">
          Sign-in isn&rsquo;t configured on this deployment yet.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <span className="grid size-10 place-items-center rounded-2xl bg-foreground text-[1.1rem] font-[900] text-background">R</span>
        <h2 className="m-0 mt-1.5 text-[1.4rem] font-[900] leading-[1.05] tracking-[-0.04em] text-foreground">Sign in to Ask Ralph</h2>
        <p className="m-0 text-[0.9rem] font-[650] leading-[1.4] text-[#625c52]">
          Enter your email and we&rsquo;ll send a secure sign-in link. No password to remember.
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-0 bottom-0 my-auto size-4 text-[#9a9286]" aria-hidden />
          <Input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="min-h-[52px] rounded-[14px] pl-10 text-[0.95rem]"
          />
        </div>
        <Button type="submit" disabled={submitting} className="min-h-[52px] w-full">
          {submitting ? "Sending link…" : "Send sign-in link"}
        </Button>
      </form>

      {message ? (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-[14px] px-4 py-3 text-[0.85rem] font-[700] leading-[1.4] ${
            sent ? "bg-success-subtle text-success-subtle-foreground" : "bg-[rgba(47,98,233,0.08)] text-foreground"
          }`}
        >
          {sent ? <Mail className="mt-0.5 size-4 shrink-0 text-success" aria-hidden /> : null}
          <span>{message}</span>
        </div>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-[#e6ded0]" />
        <span className="text-[0.66rem] font-[900] uppercase tracking-[0.08em] text-[#9a9286]">or</span>
        <span className="h-px flex-1 bg-[#e6ded0]" />
      </div>

      <button
        type="button"
        onClick={handleOAuth}
        className="inline-flex h-[52px] w-full items-center justify-center gap-3 rounded-[14px] border border-[#e6ded0] bg-white text-[0.95rem] font-[800] text-foreground transition-colors hover:bg-[#faf8f3]"
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <p className="m-0 text-center text-[0.78rem] font-[600] text-[#9a9286]">
        Passwordless · your reports stay in sync across devices.
      </p>
    </div>
  );
}
