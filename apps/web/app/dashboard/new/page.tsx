"use client";
import "../dashboard.css";
import CheckForm from "../../components/check-form";

export default function NewCheckPage() {
  return (
    <div className="dashboard-page">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] sm:text-[1.7rem]">
            Run a new check
          </h1>
          <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Paste a UK auction or dealer listing and Ralph will assess the risk and a safe bid.
          </p>
        </header>
        <CheckForm variant="dashboard" hideIntro />
      </div>
    </div>
  );
}
