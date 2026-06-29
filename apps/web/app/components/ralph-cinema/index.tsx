"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, FileText, Hash, ImageIcon, Link2, PencilLine, ShieldCheck, UploadCloud } from "lucide-react";

// Dark, glassy "Ralph turns an input into a report" hero rendering — HTML, not a
// video, in the spirit of mytabulon.com's hero. Ralph is NOT a chat. Each of the
// three workflows has its own choreography (link: paste → fetched listing →
// confirm; reg: plate; manual: fill form + upload photos → confirm) then reads
// and produces its own report. Content is top-aligned and crossfades per phase.

const C = {
  white: "#eef3f1",
  muted: "#8b9c97",
  faint: "#6b7d78",
  teal: "#2dd4bf",
  tealSoft: "#5eead4",
  amber: "#e6b873",
  border: "rgba(255,255,255,0.08)",
  innerBorder: "rgba(255,255,255,0.07)",
  innerCard: "rgba(255,255,255,0.03)",
};

function CarThumb({ width = 84, height = 62 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 72" aria-hidden style={{ display: "block", borderRadius: 9 }}>
      <defs>
        <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#13302b" />
          <stop offset="1" stopColor="#0a1a17" />
        </linearGradient>
      </defs>
      <rect width="100" height="72" fill="url(#rc-sky)" />
      <rect y="52" width="100" height="20" fill="#0c1714" />
      <path d="M10 50 Q12 34 30 31 L41 21 Q46 17 58 18 L72 21 Q83 24 88 35 L91 44 Q92 49 86 50 Z" fill="#cfe9e3" />
      <path d="M42 23 Q46 20 56 21 L68 23 Q76 26 80 34 L46 34 Q42 33 42 28 Z" fill="#5b7d77" />
      <circle cx="31" cy="50" r="8" fill="#06100e" stroke="#cfe9e3" strokeWidth="2.5" />
      <circle cx="74" cy="50" r="8" fill="#06100e" stroke="#cfe9e3" strokeWidth="2.5" />
    </svg>
  );
}

type Stat = readonly [string, string];
type Row = { title: string; sub: string; tag: string; tone: "amber" | "teal" };

type Workflow = {
  id: "link" | "reg" | "manual";
  tab: string;
  Icon: typeof Link2;
  inputKind: "url" | "plate" | "manual";
  value: string;
  listing?: { title: string; sub: string; price: string; meta: string[] };
  fields?: [string, string][];
  steps: string[];
  report: {
    kind: string;
    verdict: string;
    note: string;
    verified?: string;
    caveat?: string;
    stats: Stat[];
    rows: Row[];
  };
};

const WORKFLOWS: Workflow[] = [
  {
    id: "link",
    tab: "Paste a link",
    Icon: Link2,
    inputKind: "url",
    value: "copart.co.uk/lot/52914-ford-focus",
    listing: {
      title: "Ford Focus 1.0 EcoBoost",
      sub: "Copart UK · Cat S · Nottingham",
      price: "£2,150",
      meta: ["78,000 mi", "2015", "Front damage"],
    },
    steps: ["Fetching the listing", "Reading the photos", "Estimating repair cost", "Working out a fair price"],
    report: {
      kind: "Listing analysis",
      verdict: "Consider below £1,850",
      note: "Workable if bidding stays controlled — the front-left damage may need more than cosmetic work.",
      caveat: "No reg on this listing — MOT history couldn’t be verified.",
      stats: [
        ["TARGET RANGE", "£1,600–1,850"],
        ["SKIP ABOVE", "£1,900"],
        ["REPAIR ALLOW.", "£700–1,200"],
      ],
      rows: [
        { title: "Front-left damage", sub: "May be more than cosmetic", tag: "Watch", tone: "amber" },
        { title: "Asking price", sub: "£300 over Ralph’s target", tag: "High", tone: "amber" },
      ],
    },
  },
  {
    id: "reg",
    tab: "Enter a reg",
    Icon: Hash,
    inputKind: "plate",
    value: "AB12 CDE",
    steps: ["DVLA vehicle lookup", "Full MOT history", "Mileage & advisories", "Known recalls"],
    report: {
      kind: "Vehicle record check",
      verdict: "Sound history — 2 to watch",
      note: "MOT and mileage check out. Two recurring advisories are worth budgeting for.",
      verified: "MOT & mileage verified via DVLA",
      stats: [
        ["MOT", "Passed"],
        ["MILEAGE", "78,000"],
        ["ADVISORIES", "2 recurring"],
      ],
      rows: [
        { title: "Mileage record", sub: "Steady, no jumps", tag: "Clean", tone: "teal" },
        { title: "Brake advisory", sub: "Flagged 2 years running", tag: "Recurring", tone: "amber" },
      ],
    },
  },
  {
    id: "manual",
    tab: "Fill it in",
    Icon: PencilLine,
    inputKind: "manual",
    value: "",
    fields: [
      ["Make", "Ford"],
      ["Model", "Focus 1.0 EcoBoost"],
      ["Year", "2015"],
      ["Mileage", "78,000 mi"],
    ],
    steps: ["Reading your details", "Comparable prices", "Typical faults for this model", "Working out a fair price"],
    report: {
      kind: "From your details",
      verdict: "Looks fair around £2,000",
      note: "Priced in line with similar cars. Add a reg and Ralph can verify the MOT and mileage.",
      caveat: "Based on what you entered — MOT not verified.",
      stats: [
        ["FAIR PRICE", "~£2,000"],
        ["MILEAGE", "78,000"],
        ["MODEL FAULTS", "2 common"],
      ],
      rows: [
        { title: "EcoBoost wet belt", sub: "Common on this engine", tag: "Check", tone: "amber" },
        { title: "Mileage for age", sub: "About average", tag: "Normal", tone: "teal" },
      ],
    },
  },
];

type Phase = "input" | "fetched" | "reading" | "report";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export default function RalphCinema() {
  const reduced = usePrefersReducedMotion();
  const [started, setStarted] = useState(false);
  const [wi, setWi] = useState(0);
  const [phase, setPhase] = useState<Phase>("input");
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0); // sub-step for manual fill + upload + confirm
  const rootRef = useRef<HTMLDivElement>(null);

  const w = WORKFLOWS[wi];
  const manualSteps = (w.fields?.length ?? 0) + 2; // fields + photos + confirm

  useEffect(() => {
    if (started) return;
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    setPhase("input");
    setTyped("");
    setStep(0);

    if (reduced) {
      if (w.inputKind === "manual") setStep(manualSteps);
      else setTyped(w.value);
      setPhase("report");
      const t = setTimeout(() => setWi((x) => (x + 1) % WORKFLOWS.length), 5500);
      return () => clearTimeout(t);
    }

    const run = async () => {
      if (w.inputKind === "manual") {
        for (let s = 1; s <= manualSteps; s++) {
          await sleep(s <= (w.fields?.length ?? 0) ? 620 : 900);
          if (cancelled) return;
          setStep(s);
        }
        await sleep(1500);
        if (cancelled) return;
      } else {
        for (let i = 1; i <= w.value.length; i++) {
          if (cancelled) return;
          setTyped(w.value.slice(0, i));
          await sleep(58);
        }
        await sleep(1300);
        if (cancelled) return;
        if (w.listing) {
          setPhase("fetched");
          await sleep(3800);
          if (cancelled) return;
        }
      }

      setPhase("reading");
      await sleep(w.steps.length * 700 + 1400);
      if (cancelled) return;

      setPhase("report");
      await sleep(5400);
      if (cancelled) return;

      setWi((x) => (x + 1) % WORKFLOWS.length);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [started, wi, reduced, w.value, w.steps.length, w.listing, w.inputKind, w.fields, manualSteps]);

  const typing = phase === "input" && w.inputKind !== "manual" && typed.length < w.value.length;
  const fieldCount = w.fields?.length ?? 0;

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        padding: "clamp(20px,4vw,48px) 0",
        background:
          "radial-gradient(120% 80% at 50% -10%, rgba(45,212,191,0.14), transparent 60%), linear-gradient(180deg,#05100e,#040a09)",
        borderRadius: 28,
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes ralphBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes ralphFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .ralph-cine-body::-webkit-scrollbar{width:0;height:0}`}</style>

      <div
        style={{
          width: "min(560px,92%)",
          height: "clamp(560px,76vh,632px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 22,
          border: `1px solid ${C.border}`,
          background: "linear-gradient(160deg,#0c1a17 0%,#070f0d 100%)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        {/* Title bar */}
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: `1px solid ${C.innerBorder}` }}>
          <div style={{ display: "flex", gap: 7 }}>
            <span style={{ width: 11, height: 11, borderRadius: 99, background: "#f0b429" }} />
            <span style={{ width: 11, height: 11, borderRadius: 99, background: "#34d399" }} />
            <span style={{ width: 11, height: 11, borderRadius: 99, background: "#f87171" }} />
          </div>
          <span style={{ color: C.white, fontWeight: 800, fontSize: 13 }}>Ask Ralph</span>
          <span style={{ color: C.tealSoft, fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 99, border: "1px solid rgba(94,234,212,0.3)", background: "rgba(45,212,191,0.08)" }}>
            Live
          </span>
        </div>

        {/* Entry tabs (always visible; active = current workflow) */}
        <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "14px 18px 6px" }}>
          {WORKFLOWS.map((opt, i) => {
            const active = i === wi;
            const Icon = opt.Icon;
            return (
              <span key={opt.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 10, fontSize: 12, fontWeight: 700, color: active ? "#03201d" : C.muted, background: active ? C.tealSoft : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "transparent" : C.innerBorder}`, transition: "all .35s ease" }}>
                <Icon size={13} aria-hidden /> {opt.tab}
              </span>
            );
          })}
        </div>

        {/* Phase screen (top-aligned, crossfades; mounts fresh so the top is never cut) */}
        <div key={`${w.id}-${phase}`} className="ralph-cine-body" style={{ flex: 1, overflowY: "auto", padding: "12px 18px 18px", display: "flex", flexDirection: "column", justifyContent: "flex-start", animation: reduced ? undefined : "ralphFade .5s both" }}>
          {/* INPUT — url / plate */}
          {phase === "input" && w.inputKind === "url" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px", borderRadius: 12, border: `1px solid ${C.innerBorder}`, background: C.innerCard, minHeight: 24 }}>
              <Link2 size={16} color={C.muted} aria-hidden />
              <span style={{ color: C.white, fontSize: 14.5, fontWeight: 600 }}>
                {typed}
                {typing && <span style={{ display: "inline-block", width: 8, height: 16, marginLeft: 1, verticalAlign: "text-bottom", background: C.teal, borderRadius: 2, animation: "ralphBlink 1s steps(1) infinite" }} />}
              </span>
            </div>
          )}
          {phase === "input" && w.inputKind === "plate" && (
            <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "3px solid #1d1d1f", background: "#ffdb16", color: "#111", fontWeight: 900, fontSize: 24, letterSpacing: "0.14em" }}>
              {typed || " "}
              {typing && <span style={{ display: "inline-block", width: 3, height: 26, marginLeft: 2, background: "#111", animation: "ralphBlink 1s steps(1) infinite" }} />}
            </div>
          )}

          {/* INPUT — manual form fill + photo upload + confirm */}
          {phase === "input" && w.inputKind === "manual" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {w.fields?.map(([label, val], i) =>
                step >= i + 1 ? (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.innerBorder}`, background: C.innerCard, animation: "ralphFade .4s both" }}>
                    <span style={{ color: C.faint, fontSize: 12.5, fontWeight: 700 }}>{label}</span>
                    <span style={{ color: C.white, fontSize: 13.5, fontWeight: 700 }}>{val}</span>
                  </div>
                ) : null,
              )}

              {step >= fieldCount + 1 && (
                <div style={{ marginTop: 4, animation: "ralphFade .4s both" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, color: C.faint, fontSize: 11.5, fontWeight: 800, letterSpacing: 0.6, marginBottom: 9 }}>
                    <UploadCloud size={14} aria-hidden /> UPLOADING PHOTOS
                  </div>
                  <div style={{ display: "flex", gap: 9 }}>
                    {[0, 1, 2].map((n) => (
                      <div key={n} style={{ position: "relative", animation: "ralphFade .45s both", animationDelay: `${n * 0.18}s` }}>
                        <CarThumb width={92} height={60} />
                        <span style={{ position: "absolute", top: 5, right: 5, width: 16, height: 16, borderRadius: 99, display: "grid", placeItems: "center", background: C.tealSoft }}>
                          <Check size={10} color="#062b27" aria-hidden />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step >= fieldCount + 2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: C.tealSoft, fontWeight: 700, fontSize: 13, animation: "ralphFade .4s both" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 99, display: "grid", placeItems: "center", background: "rgba(45,212,191,0.15)", border: "1px solid rgba(94,234,212,0.4)" }}>
                    <Check size={12} aria-hidden />
                  </span>
                  Details + 3 photos ready — analysing
                </div>
              )}
            </div>
          )}

          {/* FETCHED listing — confirm the car (with picture) before analysing */}
          {phase === "fetched" && w.listing && (
            <div>
              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>FOUND THIS LISTING</div>
              <div style={{ display: "flex", gap: 13, padding: "14px", borderRadius: 14, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                <div style={{ flexShrink: 0, position: "relative" }}>
                  <CarThumb width={92} height={68} />
                  <span style={{ position: "absolute", bottom: 4, left: 4, display: "flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 6, background: "rgba(0,0,0,0.55)", color: C.white, fontSize: 9, fontWeight: 700 }}>
                    <ImageIcon size={9} aria-hidden /> 1/8
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: C.white, fontWeight: 800, fontSize: 14.5 }}>{w.listing.title}</span>
                    <span style={{ color: C.tealSoft, fontWeight: 800, fontSize: 14.5 }}>{w.listing.price}</span>
                  </div>
                  <div style={{ color: C.faint, fontSize: 12, margin: "3px 0 8px" }}>{w.listing.sub}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {w.listing.meta.map((mt) => (
                      <span key={mt} style={{ fontSize: 11, fontWeight: 700, color: C.muted, padding: "3px 8px", borderRadius: 99, background: "rgba(255,255,255,0.05)" }}>{mt}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, color: C.tealSoft, fontWeight: 700, fontSize: 13 }}>
                <span style={{ width: 20, height: 20, borderRadius: 99, display: "grid", placeItems: "center", background: "rgba(45,212,191,0.15)", border: "1px solid rgba(94,234,212,0.4)" }}>
                  <Check size={12} aria-hidden />
                </span>
                Confirmed — analysing this car
              </div>
            </div>
          )}

          {/* READING log */}
          {phase === "reading" && (
            <div>
              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 12 }}>RALPH IS READING</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {w.steps.map((s, i) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, animation: `ralphFade .45s both`, animationDelay: `${i * 0.7}s` }}>
                    <span style={{ width: 18, height: 18, borderRadius: 99, display: "grid", placeItems: "center", background: "rgba(45,212,191,0.15)", border: "1px solid rgba(94,234,212,0.4)" }}>
                      <Check size={11} color={C.tealSoft} aria-hidden />
                    </span>
                    <span style={{ color: C.muted, fontSize: 13.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REPORT */}
          {phase === "report" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{w.report.kind.toUpperCase()}</div>

              <div style={{ padding: "15px 17px", borderRadius: 16, border: `1px solid ${C.innerBorder}`, background: "linear-gradient(150deg,rgba(45,212,191,0.08),rgba(255,255,255,0.02))", animation: "ralphFade .5s both" }}>
                <span style={{ color: C.tealSoft, fontSize: 11, fontWeight: 800, letterSpacing: 1.2 }}>VERDICT</span>
                <div style={{ color: C.white, fontWeight: 800, fontSize: 19, margin: "4px 0 6px" }}>{w.report.verdict}</div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{w.report.note}</p>
                {(w.report.verified || w.report.caveat) && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 11, padding: "5px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, color: w.report.verified ? "#062b27" : "#2e2410", background: w.report.verified ? "rgba(94,234,212,0.85)" : "rgba(230,184,115,0.85)" }}>
                    {w.report.verified ? <ShieldCheck size={13} aria-hidden /> : <AlertTriangle size={13} aria-hidden />}
                    {w.report.verified ?? w.report.caveat}
                  </div>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, animation: "ralphFade .5s both", animationDelay: ".12s" }}>
                {w.report.stats.map(([label, value]) => (
                  <div key={label} style={{ padding: "12px 12px", borderRadius: 13, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                    <div style={{ color: C.white, fontWeight: 800, fontSize: 15 }}>{value}</div>
                    <div style={{ color: C.faint, fontSize: 10, fontWeight: 700, letterSpacing: 0.7, marginTop: 3 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9, animation: "ralphFade .5s both", animationDelay: ".22s" }}>
                {w.report.rows.map((r) => (
                  <div key={r.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 13, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                    <div>
                      <div style={{ color: C.white, fontWeight: 700, fontSize: 13.5 }}>{r.title}</div>
                      <div style={{ color: C.faint, fontSize: 12, marginTop: 2 }}>{r.sub}</div>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 800, padding: "5px 11px", borderRadius: 99, color: r.tone === "teal" ? "#062b27" : "#2e2410", background: r.tone === "teal" ? C.tealSoft : C.amber }}>{r.tag}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 4, animation: "ralphFade .5s both", animationDelay: ".32s" }}>
                <span style={{ color: C.faint, fontSize: 12 }}>Free read · deep insight after login</span>
                <span style={{ fontWeight: 800, fontSize: 13, padding: "10px 16px", borderRadius: 12, color: "#03201d", background: "linear-gradient(135deg,#5eead4,#38bdf8)", boxShadow: "0 8px 26px rgba(56,189,248,0.3)" }}>
                  See full report →
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
