"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Mail, Coins, CalendarDays } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured, useSession } from "../../lib/supabase";
import { Button } from "@ralph/ui";
import { useCredits } from "../../lib/use-credits";
import { ProfileBlockSkeleton, ProfileHeaderSkeleton } from "../../components/skeleton";
function getInitials(email: string): string {
    const parts = email.split("@")[0].split(/[._-]/);
    return parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}
export default function ProfilePage() {
    const router = useRouter();
    const { data: user } = useSession();
    const { data: credits = 0, isLoading: loadingCredits } = useCredits();
    const initials = user?.email ? getInitials(user.email) : "?";
    const memberSince = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" })
        : "—";
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
    return (<div className="profile-page">

      
      <header className="profile-header">
        <h1 className="dash-title">Profile</h1>
      </header>

      
      {user ? (<section className="profile-identity-card">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-identity-body">
            <p className="profile-identity-email">{user.email}</p>
            <div className="profile-identity-meta">
              <span className="profile-meta-pill">
                <CalendarDays size={12} aria-hidden="true"/>
                Member since {memberSince}
              </span>
            </div>
          </div>
        </section>) : (<ProfileHeaderSkeleton />)}

      
      {loadingCredits ? (<ProfileBlockSkeleton />) : (<section className="profile-block">
          <div className="profile-block-icon profile-block-icon--gold">
            <Coins size={18} aria-hidden="true"/>
          </div>
          <div className="profile-block-body">
            <p className="profile-block-label">Credits balance</p>
            <p className="profile-block-value">
              {`${credits} check${credits === 1 ? "" : "s"} remaining`}
            </p>
          </div>
          <Link className="profile-block-action" href="/#pricing">
            Buy credits
          </Link>
        </section>)}

      
      <section className="profile-block">
        <div className="profile-block-icon profile-block-icon--blue">
          <Mail size={18} aria-hidden="true"/>
        </div>
        <div className="profile-block-body">
          <p className="profile-block-label">Email address</p>
          <p className="profile-block-value">{user?.email ?? "—"}</p>
        </div>
      </section>

      <div className="profile-divider"/>

      
      <section className="profile-action-section profile-action-section--danger">
        <div className="profile-action-text">
          <p className="profile-action-title">
            <LogOut size={14} aria-hidden="true"/>
            Sign out
          </p>
        </div>
        <Button type="button" variant="ghost" size="none" className="profile-action-btn profile-action-btn--danger" onClick={handleSignOut}>
          Sign out
        </Button>
      </section>

    </div>);
}
