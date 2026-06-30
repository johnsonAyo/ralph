"use client";
import "../check-form/check-form.css";
import { useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Gauge, Loader2, ShieldQuestion } from "lucide-react";
import type { MotTest, VehicleProfile } from "@ralph/shared";
import { Button } from "@ralph/ui";
import { API_BASE_URL } from "../../constants";

type Severity = "alert" | "warn" | "good";

interface ReadLine {
  severity: Severity;
  text: string;
}

const nf = new Intl.NumberFormat("en-GB");

function formatMileage(value?: number): string | null {
  if (value == null) return null;
  return `${nf.format(value)} mi`;
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function titleCase(value?: string): string | null {
  if (!value) return null;
  return value
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Deterministic plain-English read of the free signals — no AI call, no cost.
// This previews the value of the paid AI verdict without spending a token.
function buildRalphRead(profile: VehicleProfile): ReadLine[] {
  const { derived } = profile;
  const lines: ReadLine[] = [];

  if (derived.mileageAnomaly) {
    lines.push({
      severity: "alert",
      text: "The recorded mileage drops at one point in the history — a classic clocking red flag. Ask the seller to explain it before going further.",
    });
  }

  if (derived.recurringAdvisories.length > 0) {
    const list = derived.recurringAdvisories.slice(0, 3).map(titleCase).join("; ");
    lines.push({
      severity: "warn",
      text: `The same issue keeps reappearing at MOT: ${list}. That usually means an ongoing cost you'd inherit.`,
    });
  }

  if (derived.motPassRate != null && derived.motPassRate < 0.6) {
    lines.push({
      severity: "warn",
      text: `This car fails its MOT more often than it passes (${Math.round(derived.motPassRate * 100)}% pass rate). Budget for repairs.`,
    });
  }

  if (derived.estimatedAnnualMileage != null) {
    const annual = Math.round(derived.estimatedAnnualMileage);
    const band = annual > 12000 ? "high" : annual < 6000 ? "low" : "about average";
    lines.push({
      severity: "good",
      text: `Covers roughly ${nf.format(annual)} miles a year — ${band} for a UK car.`,
    });
  }

  if (lines.length === 0 || lines.every((l) => l.severity === "good")) {
    lines.unshift({
      severity: "good",
      text: "Nothing alarming jumps out of the MOT record — mileage looks consistent and the advisories are routine.",
    });
  }

  return lines;
}

function worstSeverity(lines: ReadLine[]): Severity {
  if (lines.some((l) => l.severity === "alert")) return "alert";
  if (lines.some((l) => l.severity === "warn")) return "warn";
  return "good";
}

const SEVERITY_DOT: Record<Severity, string> = {
  alert: "bg-red-500",
  warn: "bg-amber-500",
  good: "bg-emerald-500",
};

const SEVERITY_HEADLINE: Record<Severity, string> = {
  alert: "Ralph spotted something worth questioning",
  warn: "A couple of things to keep an eye on",
  good: "Looks clean on the free record",
};

function MotRow({ test }: { test: MotTest }) {
  const date = formatDate(test.completedDate);
  const mileage = formatMileage(test.odometerValue);
  const pass = (test.testResult ?? "").toUpperCase().startsWith("PASS");
  const advisories = test.defects.filter((d) => d.type === "ADVISORY" || d.type === "MINOR");
  const fails = test.defects.filter(
    (d) => d.type === "MAJOR" || d.type === "DANGEROUS" || d.type === "FAIL",
  );

  return (
    <li className="relative pl-6">
      <span
        className={`absolute left-0 top-1.5 size-3 rounded-full ring-2 ring-white ${pass ? "bg-emerald-500" : "bg-red-500"}`}
        aria-hidden
      />
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="text-[0.92rem] font-extrabold text-[var(--ink)]">{date ?? "Unknown date"}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[0.72rem] font-extrabold uppercase tracking-wide ${pass ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}
        >
          {pass ? "Pass" : "Fail"}
        </span>
        {mileage && <span className="text-[0.85rem] font-semibold text-[var(--muted)]">{mileage}</span>}
      </div>
      {(fails.length > 0 || advisories.length > 0) && (
        <ul className="mt-1.5 flex flex-col gap-1">
          {fails.map((d, i) => (
            <li key={`f${i}`} className="text-[0.8rem] leading-snug text-red-700">
              ✕ {d.text}
            </li>
          ))}
          {advisories.map((d, i) => (
            <li key={`a${i}`} className="text-[0.8rem] leading-snug text-[var(--muted)]">
              • {d.text}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function PublicRegCheck() {
  const [reg, setReg] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [profile, setProfile] = useState<VehicleProfile | null>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const registration = reg.replace(/\s+/g, "").toUpperCase();
    if (registration.length < 2) return;

    setStatus("loading");
    setError("");
    setProfile(null);

    try {
      const res = await fetch(`${API_BASE_URL}/vehicle/lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const message =
          (body && (body.message as string)) ||
          "We couldn't find that registration. Check it, or use a listing link / the manual form below.";
        throw new Error(Array.isArray(message) ? message[0] : message);
      }

      const data = (await res.json()) as VehicleProfile;
      setProfile(data);
      setStatus("done");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  const read = profile ? buildRalphRead(profile) : [];
  const headlineSeverity = read.length ? worstSeverity(read) : "good";
  const identity = profile?.identity;
  const tests = profile ? [...profile.motHistory].sort((a, b) => (b.completedDate ?? "").localeCompare(a.completedDate ?? "")) : [];

  const specs: Array<[string, string | null]> = identity
    ? [
        ["Make", titleCase(identity.make)],
        ["Model", titleCase(identity.model)],
        ["Year", identity.yearOfManufacture ? String(identity.yearOfManufacture) : null],
        ["Fuel", titleCase(identity.fuelType)],
        ["Colour", titleCase(identity.colour)],
        ["Latest mileage", formatMileage(profile?.derived.latestMileage)],
      ]
    : [];

  return (
    <div className="mx-auto w-full max-w-[560px]">
      {/* Free reg box — the no-login funnel, like the big check sites do it */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 rounded-[24px] border border-[#e6ded0] bg-white p-6 text-center shadow-[0_22px_60px_rgba(60,45,26,0.10)] sm:p-8"
      >
        <div className="flex flex-col items-center gap-1.5">
          <span className="rounded-full bg-[rgba(47,98,233,0.1)] px-3 py-1 text-[0.72rem] font-extrabold uppercase tracking-wide text-[var(--blue)]">
            Free · no sign-up
          </span>
          <h3 className="m-0 text-[1.35rem] font-black text-[var(--ink)]">Check any car in seconds</h3>
          <p className="m-0 max-w-[42ch] text-[0.92rem] leading-relaxed text-[var(--muted)]">
            Enter a number plate and Ralph reads its full MOT and mileage history — then tells you what it means.
          </p>
        </div>

        <div className="flex w-full max-w-[420px] flex-col gap-3 sm:flex-row">
          <input
            value={reg}
            onChange={(e) => setReg(e.target.value.toUpperCase())}
            placeholder="ENTER REG"
            aria-label="Vehicle registration"
            maxLength={9}
            className="h-[58px] flex-1 rounded-[12px] border-[3px] border-[#1d1d1f] bg-[#ffdb16] text-center text-[1.5rem] font-black uppercase tracking-[0.12em] text-[#111] placeholder:text-[#9a8a16] placeholder:tracking-normal focus:outline-none focus:ring-4 focus:ring-[rgba(47,98,233,0.25)]"
          />
          <Button type="submit" size="lg" disabled={status === "loading" || reg.trim().length < 2}>
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden /> Checking…
              </>
            ) : (
              <>
                Check it <ArrowRight className="size-4" aria-hidden />
              </>
            )}
          </Button>
        </div>

        {status === "error" && (
          <p className="m-0 max-w-[44ch] text-[0.88rem] font-semibold text-red-600">{error}</p>
        )}

        {/* No reg? Signpost the other two ways in */}
        <p className="m-0 text-[0.85rem] text-[var(--muted)]">
          No registration number?{" "}
          <Link href="/dashboard/new" className="font-bold text-[var(--blue)] underline-offset-2 hover:underline">
            Paste a listing link
          </Link>{" "}
          or{" "}
          <Link href="/dashboard/new" className="font-bold text-[var(--blue)] underline-offset-2 hover:underline">
            enter the details yourself
          </Link>
          .
        </p>
      </form>

      {/* Free results */}
      {status === "done" && profile && (
        <div ref={resultRef} className="mt-5 flex flex-col gap-4 scroll-mt-24">
          {/* Ralph's read */}
          <div className="rounded-[24px] border border-[#e6ded0] bg-[#fffdf9] p-5 shadow-[0_18px_48px_rgba(60,45,26,0.08)] sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className={`size-3 shrink-0 rounded-full ${SEVERITY_DOT[headlineSeverity]}`} aria-hidden />
              <h4 className="m-0 text-[1.05rem] font-black text-[var(--ink)]">
                {SEVERITY_HEADLINE[headlineSeverity]}
              </h4>
            </div>
            <ul className="mt-3 flex flex-col gap-2.5">
              {read.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-[0.92rem] leading-relaxed text-[var(--ink)]">
                  {line.severity === "alert" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" aria-hidden />
                  ) : line.severity === "warn" ? (
                    <Gauge className="mt-0.5 size-4 shrink-0 text-amber-500" aria-hidden />
                  ) : (
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
                  )}
                  <span>{line.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Vehicle snapshot */}
          {specs.some(([, v]) => v) && (
            <div className="rounded-[24px] border border-[#e6ded0] bg-white p-5 sm:p-6">
              <h4 className="m-0 mb-3 text-[0.78rem] font-extrabold uppercase tracking-wide text-[var(--muted)]">
                The car
              </h4>
              <dl className="grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                {specs
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label} className="flex flex-col gap-0.5">
                      <dt className="text-[0.74rem] font-bold uppercase tracking-wide text-[var(--muted)]">{label}</dt>
                      <dd className="m-0 text-[0.98rem] font-extrabold text-[var(--ink)]">{value}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          )}

          {/* MOT timeline */}
          {tests.length > 0 && (
            <div className="rounded-[24px] border border-[#e6ded0] bg-white p-5 sm:p-6">
              <h4 className="m-0 mb-4 text-[0.78rem] font-extrabold uppercase tracking-wide text-[var(--muted)]">
                MOT history · {tests.length} test{tests.length === 1 ? "" : "s"}
              </h4>
              <ul className="flex flex-col gap-4 border-l border-[#e6ded0] pl-1">
                {tests.map((t, i) => (
                  <MotRow key={t.motTestNumber ?? i} test={t} />
                ))}
              </ul>
            </div>
          )}

          {/* Upgrade CTA — the paywall, after value is shown */}
          <div className="rounded-[24px] border-2 border-[var(--blue)] bg-[rgba(47,98,233,0.05)] p-5 text-center sm:p-6">
            <ShieldQuestion className="mx-auto mb-2 size-7 text-[var(--blue)]" aria-hidden />
            <h4 className="m-0 text-[1.05rem] font-black text-[var(--ink)]">Want the full picture before you buy?</h4>
            <p className="mx-auto mt-1.5 max-w-[46ch] text-[0.9rem] leading-relaxed text-[var(--muted)]">
              A Deep Check adds outstanding finance, insurance write-off and stolen markers, cross-checks the seller's
              listing against the data, and gives you Ralph's buy / don't-buy verdict with a sensible price.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/dashboard/new">
                Run a Deep Check <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
