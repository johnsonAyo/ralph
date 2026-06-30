"use client";
import "../../dashboard/dashboard.css";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReportPreview from "../../components/report-preview";

export default function ReportPreviewDevPage() {
  return (
    <div className="dashboard-page" style={{ paddingTop: "calc(var(--nav-offset, 96px) + 32px)" }}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[0.82rem] font-[800] text-[#625c52] transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          Back home
        </Link>
        <ReportPreview />
      </div>
    </div>
  );
}
