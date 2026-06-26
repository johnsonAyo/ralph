"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LogOut, Mail, Coins } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured, useSession } from "../../lib/supabase";
import { useCredits } from "../../lib/use-credits";
import { useMagicLinkResend } from "../../lib/use-magic-link-resend";
import { getSiteUrl } from "../../lib/site-url";
import { profileLabels } from "../../labels";

export default function ProfilePage() {
  const router = useRouter();
  const { data: user } = useSession();
  const { data: credits = 0, isLoading: loadingCredits } = useCredits();
  const { resendMessage, resendSuccess, isSubmitting, submit } = useMagicLinkResend({
    email: user?.email,
    emailRedirectTo: `${getSiteUrl()}/auth?next=/dashboard`,
  });

  async function handleSignOut() {
    if (!isSupabaseConfigured()) {
      router.push("/");
      return;
    }
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.push("/");
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
  }

  return (
    <div className="profile-page">
      <header className="profile-header">
        <p className="dash-kicker">Account</p>
        <h1 className="dash-title">Profile</h1>
      </header>

      <section className="profile-card">
        <div className="profile-card-row">
          <Mail size={18} aria-hidden="true" className="profile-icon" />
          <div>
            <p className="profile-label">Signed in as</p>
            <p className="profile-value">{user?.email ?? user?.id ?? "—"}</p>
          </div>
        </div>

        <div className="profile-card-row">
          <Coins size={18} aria-hidden="true" className="profile-icon" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div>
              <p className="profile-label">Credits balance</p>
              <p className="profile-value">{loadingCredits ? "..." : `${credits} check${credits === 1 ? "" : "s"} remaining`}</p>
            </div>
            <Link className="button secondary small" href="/#pricing" style={{ fontSize: "0.8rem", padding: "0.3rem 0.6rem" }}>
              Buy credits
            </Link>
          </div>
        </div>

        <div className="profile-card-row">
          <p className="profile-label">
            Member since{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
      </section>

      
      {user?.email && (
        <section className="profile-section">
          <h2>Sign-in link</h2>
          <p className="profile-section-copy">
            {profileLabels.magicLinkCopy}
          </p>
          <form onSubmit={submit} className="profile-resend-form">
            <button type="submit" className="button secondary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Resend magic link"}
            </button>
          </form>
          {resendMessage && (
            <p className={`profile-message ${resendSuccess ? "profile-message--ok" : ""}`}>
              {resendSuccess && (
                <CheckCircle2 size={15} aria-hidden="true" />
              )}
              {resendMessage}
            </p>
          )}
        </section>
      )}

      
      <section className="profile-section">
        <h2>Sign out</h2>
        <p className="profile-section-copy">
          {profileLabels.signOutCopy}
        </p>
        <button
          type="button"
          className="button secondary profile-signout"
          onClick={handleSignOut}
        >
          <LogOut size={15} aria-hidden="true" />
          Sign out
        </button>
      </section>
    </div>
  );
}
