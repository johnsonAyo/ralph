"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "../../lib/supabase";

export default function AuthMenu() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setIsReady(true);
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setIsReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) {
        return;
      }

      setUser(data.session?.user ?? null);
      setIsReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsReady(true);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [configured]);

  async function handleSignOut() {
    if (!configured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  }

  if (!isReady) {
    return <span className="auth-pill">Checking session...</span>;
  }

  if (!user) {
    return (
      <Link className="auth-pill auth-link" href="/auth">
        Sign in
      </Link>
    );
  }

  return (
    <div className="auth-menu-trigger">
      <Link className="auth-pill auth-user" href="/dashboard">
        <UserIcon size={14} aria-hidden="true" />
        <span>{user.email ?? user.id}</span>
      </Link>
      <button
        type="button"
        className="auth-pill auth-icon-button"
        onClick={handleSignOut}
        aria-label="Sign out"
      >
        <LogOut size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
