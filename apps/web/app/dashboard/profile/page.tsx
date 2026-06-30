"use client";
import "./profile.css";
import "../dashboard.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Mail, Coins, CalendarDays, FileText, ShieldCheck, BadgeCheck } from "lucide-react";
import { getSupabaseBrowserClient, isSupabaseConfigured, useSession } from "../../lib/supabase";
import { Button } from "@ralph/ui";
import { ReportStatusCode } from "@ralph/shared";
import { useCredits } from "../../lib/use-credits";
import { getUserDisplayName, getUserInitials } from "../../lib/user-display";
import { useReports } from "../../lib/use-reports";
import { ProfileBlockSkeleton, ProfileHeaderSkeleton } from "../../components/skeleton";

export default function ProfilePage() {
    const router = useRouter();
    const { data: user } = useSession();
    const { data: creditInfo, isLoading: loadingCredits } = useCredits(user?.id);
    const credits = creditInfo?.balance ?? 0;
    const creditTotal = creditInfo?.total ?? 0;
    const { data: reports = [], isLoading: loadingReports } = useReports();
    const checksRun = reports.length;
    const completedChecks = reports.filter((r) => r.status === ReportStatusCode.Completed).length;
    const initials = getUserInitials(user);
    const displayName = getUserDisplayName(user);
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
        <p className="profile-subtitle">Your account, credits and check history.</p>
      </header>

      {user ? (<section className="profile-identity-card">
          <div className="profile-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-identity-body">
            <p className="profile-identity-email">{displayName}</p>
            <div className="profile-identity-meta">
              <span className="profile-meta-pill">
                <CalendarDays size={12} aria-hidden="true"/>
                Member since {memberSince}
              </span>
              <span className="profile-meta-pill">
                <BadgeCheck size={12} aria-hidden="true"/>
                Free plan
              </span>
            </div>
          </div>
        </section>) : (<ProfileHeaderSkeleton />)}

      {/* Stats overview */}
      <section className="profile-stats" aria-label="Account overview">
        <div className="profile-stat">
          <span className="profile-stat-label">Credits left</span>
          <span className="profile-stat-value">
            {loadingCredits ? "…" : `${credits} / ${creditTotal}`}
          </span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-label">Checks run</span>
          <span className="profile-stat-value">
            {loadingReports ? "…" : checksRun}
          </span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat-label">Completed</span>
          <span className="profile-stat-value">
            {loadingReports ? "…" : completedChecks}
          </span>
        </div>
      </section>

      {loadingCredits ? (<ProfileBlockSkeleton />) : (<section className="profile-block">
          <div className="profile-block-icon profile-block-icon--gold">
            <Coins size={18} aria-hidden="true"/>
          </div>
          <div className="profile-block-body">
            <p className="profile-block-label">Credits balance</p>
            <p className="profile-block-value">
              {`${credits} / ${creditTotal} checks remaining`}
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

      <section className="profile-block">
        <div className="profile-block-icon profile-block-icon--blue">
          <FileText size={18} aria-hidden="true"/>
        </div>
        <div className="profile-block-body">
          <p className="profile-block-label">Check history</p>
          <p className="profile-block-value">
            {loadingReports ? "—" : `${checksRun} check${checksRun === 1 ? "" : "s"} run · ${completedChecks} completed`}
          </p>
        </div>
        <Link className="profile-block-action" href="/dashboard">
          View
        </Link>
      </section>

      <section className="profile-block">
        <div className="profile-block-icon profile-block-icon--blue">
          <ShieldCheck size={18} aria-hidden="true"/>
        </div>
        <div className="profile-block-body">
          <p className="profile-block-label">Data &amp; privacy</p>
          <p className="profile-block-value">Independent checks — Ralph is paid by you, not the seller.</p>
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
