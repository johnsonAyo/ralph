"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "../lib/supabase";

export default function AuthMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
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
  }, []);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
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
    <div className="auth-pill auth-user">
      <span>{user.email ?? user.id}</span>
      <button className="auth-signout" type="button" onClick={handleSignOut}>
        Sign out
      </button>
    </div>
  );
}
