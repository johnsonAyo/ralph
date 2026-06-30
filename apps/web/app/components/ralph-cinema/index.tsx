"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Hash, ImageIcon, Link2, PencilLine, ShieldCheck, TrendingDown, UploadCloud } from "lucide-react";
import { useTheme } from "../../lib/use-theme";

// Dark/light, glassy "Ralph turns an input into a report" hero rendering — HTML,
// not a video, in the spirit of mytabulon.com's hero. Ralph is NOT a chat, and
// NOT a data dump: every finding leads with what it MEANS for the buyer, with
// the raw data as evidence underneath. The reg path shows the full rich report
// (interpretation-led, with a mileage chart) and auto-scrolls through it.

type Palette = {
  text: string;
  muted: string;
  faint: string;
  accent: string;
  accentChipBg: string;
  accentChipBorder: string;
  iconWrapBg: string;
  iconWrapBorder: string;
  border: string;
  innerBorder: string;
  innerCard: string;
  chipBg: string;
  windowBg: string;
  backdrop: string;
  verdictBg: string;
  gridLine: string;
};

const PALETTES: Record<"light" | "dark", Palette> = {
  dark: {
    text: "#eef3f1",
    muted: "#8b9c97",
    faint: "#6b7d78",
    accent: "#5eead4",
    accentChipBg: "rgba(45,212,191,0.08)",
    accentChipBorder: "rgba(94,234,212,0.3)",
    iconWrapBg: "rgba(45,212,191,0.15)",
    iconWrapBorder: "rgba(94,234,212,0.4)",
    border: "rgba(255,255,255,0.08)",
    innerBorder: "rgba(255,255,255,0.07)",
    innerCard: "rgba(255,255,255,0.03)",
    chipBg: "rgba(255,255,255,0.05)",
    windowBg: "linear-gradient(160deg,#0c1a17 0%,#070f0d 100%)",
    backdrop: "radial-gradient(120% 80% at 50% -10%, rgba(45,212,191,0.14), transparent 60%), linear-gradient(180deg,#05100e,#040a09)",
    verdictBg: "linear-gradient(150deg,rgba(45,212,191,0.08),rgba(255,255,255,0.02))",
    gridLine: "rgba(255,255,255,0.08)",
  },
  light: {
    text: "#16221f",
    muted: "#5b6b66",
    faint: "#8a978f",
    accent: "#0e9384",
    accentChipBg: "rgba(13,148,136,0.10)",
    accentChipBorder: "rgba(13,148,136,0.35)",
    iconWrapBg: "rgba(13,148,136,0.12)",
    iconWrapBorder: "rgba(13,148,136,0.4)",
    border: "rgba(0,0,0,0.10)",
    innerBorder: "rgba(0,0,0,0.08)",
    innerCard: "rgba(0,0,0,0.025)",
    chipBg: "rgba(0,0,0,0.05)",
    windowBg: "linear-gradient(160deg,#ffffff 0%,#f3f8f6 100%)",
    backdrop: "radial-gradient(120% 80% at 50% -10%, rgba(45,212,191,0.16), transparent 60%), linear-gradient(180deg,#e9f3f1,#dcebe8)",
    verdictBg: "linear-gradient(150deg,rgba(13,148,136,0.08),rgba(0,0,0,0.015))",
    gridLine: "rgba(0,0,0,0.08)",
  },
};

const PILL_TEAL = "#5eead4";
const PILL_AMBER = "#e6b873";
// Warm amber for "worth noting" — adviser caution, not an alarm.
const FLAG = "#d9943f";

function CarThumb({ width = 84, height = 62 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 100 72" aria-hidden style={{ display: "block", borderRadius: 9 }}>
      <defs>
        <linearGradient id="rc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d3f5f" />
          <stop offset="1" stopColor="#13283a" />
        </linearGradient>
      </defs>
      <rect width="100" height="72" fill="url(#rc-sky)" />
      <rect y="52" width="100" height="20" fill="#0f1b27" />
      <path d="M10 50 Q12 34 30 31 L41 21 Q46 17 58 18 L72 21 Q83 24 88 35 L91 44 Q92 49 86 50 Z" fill="#dbe7ee" />
      <path d="M42 23 Q46 20 56 21 L68 23 Q76 26 80 34 L46 34 Q42 33 42 28 Z" fill="#6f8aa0" />
      <circle cx="31" cy="50" r="8" fill="#0a121b" stroke="#dbe7ee" strokeWidth="2.5" />
      <circle cx="74" cy="50" r="8" fill="#0a121b" stroke="#dbe7ee" strokeWidth="2.5" />
    </svg>
  );
}

type MilePoint = { label: string; mi: number; anomaly?: boolean };

function MileageChart({ data, C }: { data: MilePoint[]; C: Palette }) {
  const W = 320;
  const H = 132;
  const padX = 26;
  const padTop = 14;
  const padBottom = 26;
  const miles = data.map((d) => d.mi);
  const min = Math.min(...miles) * 0.96;
  const max = Math.max(...miles) * 1.03;
  const x = (i: number) => padX + (i * (W - 2 * padX)) / (data.length - 1);
  const y = (mi: number) => H - padBottom - ((mi - min) / (max - min)) * (H - padTop - padBottom);
  const line = data.map((d, i) => `${x(i)},${y(d.mi)}`).join(" ");
  const fmt = (n: number) => n.toLocaleString("en-GB");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Recorded mileage over time" style={{ display: "block" }}>
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1={padX} x2={W - padX} y1={padTop + g * (H - padTop - padBottom)} y2={padTop + g * (H - padTop - padBottom)} stroke={C.gridLine} strokeWidth="1" />
      ))}
      <polyline points={line} fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.mi)} r={d.anomaly ? 5 : 3.5} fill={d.anomaly ? FLAG : C.accent} />
          {d.anomaly && <circle cx={x(i)} cy={y(d.mi)} r={9} fill="none" stroke={FLAG} strokeWidth="1.5" opacity="0.5" />}
          <text x={x(i)} y={H - 9} fontSize="8" fill={C.faint} textAnchor="middle">{d.label}</text>
          <text x={x(i)} y={y(d.mi) - (d.anomaly ? 13 : 9)} fontSize="8" fontWeight="700" fill={d.anomaly ? FLAG : C.muted} textAnchor="middle">{fmt(d.mi)}</text>
        </g>
      ))}
    </svg>
  );
}

type Finding = { title: string; meaning: string; evidence: string; chart?: MilePoint[] };
type GridTone = "good" | "note" | "flag";
type GridCell = { label: string; value: string; tone: GridTone };

const GRID_DOT: Record<GridTone, string> = { good: "#34d399", note: "#e6b873", flag: "#e06a6a" };

type Workflow = {
  id: "link" | "reg" | "manual";
  tab: string;
  Icon: typeof Link2;
  inputKind: "url" | "plate" | "manual";
  value: string;
  listing?: { title: string; sub: string; price: string; meta: string[] };
  fields?: [string, string][];
  steps: string[];
  rich?: {
    verdict: string;
    summary: string;
    grid: GridCell[];
    findings: Finding[];
    clear: string;
    money: { meaning: string; rows: [string, string][] };
    source: string;
  };
  report?: {
    kind: string;
    verdict: string;
    note: string;
    decision?: { left: string; leftLabel: string; mid: string; midLabel: string; risk: string };
    caveat?: string;
    insights: { title: string; meaning: string }[];
    source: string;
  };
};

const MILEAGE: MilePoint[] = [
  { label: "2019", mi: 25827 },
  { label: "2020", mi: 29963 },
  { label: "2021", mi: 35735 },
  { label: "Nov '21", mi: 24315, anomaly: true },
  { label: "2022", mi: 36994 },
];

const WORKFLOWS: Workflow[] = [
  {
    id: "reg",
    tab: "Enter a reg",
    Icon: Hash,
    inputKind: "plate",
    value: "AB12 CDE",
    steps: ["DVLA + MOT history", "Finance & write-off (Experian)", "Cross-checking the mileage", "What it's really worth"],
    rich: {
      verdict: "Worth it on the right terms",
      summary: "Audi Q3 S Line · a few things here change what it's worth and what you'd take on. The call's yours — here's what to weigh.",
      grid: [
        { label: "Finance", value: "Owed", tone: "flag" },
        { label: "Write-off", value: "Cat N", tone: "flag" },
        { label: "Stolen", value: "Clear", tone: "good" },
        { label: "Mileage", value: "Doesn't add up", tone: "flag" },
        { label: "MOT", value: "Valid", tone: "good" },
        { label: "Tax", value: "SORN", tone: "note" },
        { label: "Damage", value: "Repaired", tone: "note" },
        { label: "Value", value: "~£19,600", tone: "good" },
        { label: "Budget fit", value: "On terms", tone: "note" },
      ],
      findings: [
        {
          title: "There's finance still owed on it",
          meaning: "Until that's settled, the lender — not the seller — has a claim on the car. Worth getting written confirmation it's cleared before any money changes hands.",
          evidence: "Log Book Loan · Example Bank · taken 27 Nov 2021",
        },
        {
          title: "The mileage doesn't fully add up",
          meaning: "The recorded reading dips at one point, so the true mileage is hard to be sure of. Worth allowing for a little more wear than the clock suggests.",
          evidence: "Reading fell from 35,735 to 24,315 mi in Nov 2021",
          chart: MILEAGE,
        },
        {
          title: "It's been repaired after a write-off",
          meaning: "Recorded as a Cat N following engine water damage. Perfectly legal to drive, though it usually means a lower resale value and fewer insurers to choose from.",
          evidence: "Cat N · engine · water · 09 Jan 2022",
        },
        {
          title: "It used to be a taxi",
          meaning: "That tends to mean harder miles and more interior wear than a private car of the same age — worth a close look in person.",
          evidence: "Licensed in Peterborough, 2017–2023",
        },
      ],
      clear: "On the plus side: not stolen, not scrapped, not exported.",
      money: {
        meaning: "Clean, this Q3 is around £19,600 privately. With finance owed, the mileage question and the write-off on record, it's worth noticeably less — worth reflecting that in the price, and settling the finance, before you consider it.",
        rows: [
          ["Private, if it were clean", "£19,600"],
          ["Auction", "£16,350"],
          ["Ralph's take", "Settle finance, then negotiate"],
        ],
      },
      source: "Checked against DVLA, DVSA MOT and Experian",
    },
  },
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
    steps: ["Reading the photos", "Assessing the damage", "Estimating repair cost", "What it's really worth"],
    report: {
      kind: "Listing analysis",
      verdict: "Negotiate — or walk",
      note: "The asking price doesn't leave room for the repair this damage really needs.",
      decision: { left: "£1,850", leftLabel: "Max sensible bid", mid: "£1,900", midLabel: "Walk away above", risk: "Front-left damage" },
      caveat: "No reg on this listing, so Ralph couldn't verify the MOT — ask the seller for it.",
      insights: [
        { title: "The damage is likely more than cosmetic", meaning: "The wheel sits at an angle in the photos — budget for suspension, not just a bumper." },
        { title: "It's priced £300 over the mark", meaning: "At £2,150 you'd spend your repair money before you've fixed a thing." },
      ],
      source: "Read from the listing photos and price",
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
    steps: ["Reading your details", "Comparable prices", "Typical faults for this model", "What it's really worth"],
    report: {
      kind: "From your details",
      verdict: "Fair around £2,000",
      note: "Priced in line with similar cars — but there's one thing to check before you commit.",
      caveat: "Add a reg and Ralph can verify the MOT and mileage you entered.",
      insights: [
        { title: "Watch the wet timing belt on this engine", meaning: "The 1.0 EcoBoost is known for it — a failure is engine-out money, so ask when it was last done." },
        { title: "The mileage is normal for the age", meaning: "About 6,000 a year — nothing that should worry you on its own." },
      ],
      source: "Based on the details you entered",
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
  const { theme } = useTheme();
  const C = PALETTES[theme];
  const [started, setStarted] = useState(false);
  const [wi, setWi] = useState(0);
  const [phase, setPhase] = useState<Phase>("input");
  const [typed, setTyped] = useState("");
  const [step, setStep] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const w = WORKFLOWS[wi];
  const manualSteps = (w.fields?.length ?? 0) + 2;

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
      const t = setTimeout(() => setWi((x) => (x + 1) % WORKFLOWS.length), 6000);
      return () => clearTimeout(t);
    }

    const run = async () => {
      if (w.inputKind === "manual") {
        for (let s = 1; s <= manualSteps; s++) {
          await sleep(s <= (w.fields?.length ?? 0) ? 620 : 1000);
          if (cancelled) return;
          setStep(s);
        }
        await sleep(2700);
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
      await sleep(w.rich ? 9500 : 6000);
      if (cancelled) return;

      setWi((x) => (x + 1) % WORKFLOWS.length);
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [started, wi, reduced, w.value, w.steps.length, w.listing, w.inputKind, w.fields, w.rich, manualSteps]);

  // Auto-scroll the rich report so the whole thing is seen (it's taller than the frame).
  useEffect(() => {
    if (phase !== "report" || !w.rich || reduced) return;
    const el = bodyRef.current;
    if (!el) return;
    let raf = 0;
    const hold = 1400;
    const dur = 7000;
    const start = performance.now();
    const tick = (now: number) => {
      const t = now - start - hold;
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (t > 0 && maxScroll > 0) el.scrollTop = maxScroll * Math.min(1, t / dur);
      if (now - start < hold + dur) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, wi, reduced, w.rich]);

  const typing = phase === "input" && w.inputKind !== "manual" && typed.length < w.value.length;
  const fieldCount = w.fields?.length ?? 0;

  return (
    <div
      ref={rootRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 600,
        margin: "0 auto",
        display: "flex",
        justifyContent: "center",
        padding: "clamp(20px,4vw,40px) clamp(16px,3vw,26px)",
        background: C.backdrop,
        borderRadius: 28,
        overflow: "hidden",
      }}
    >
      <style>{`@keyframes ralphBlink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes ralphFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        .ralph-cine-body::-webkit-scrollbar{width:0;height:0}`}</style>

      <div
        style={{
          width: "min(560px,100%)",
          height: "clamp(560px,76vh,632px)",
          display: "flex",
          flexDirection: "column",
          borderRadius: 22,
          border: `1px solid ${C.border}`,
          background: C.windowBg,
          boxShadow: theme === "dark" ? "0 40px 120px rgba(0,0,0,0.55)" : "0 40px 90px rgba(20,40,35,0.18)",
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
          <span style={{ color: C.text, fontWeight: 800, fontSize: 13 }}>Ask Ralph</span>
          <span style={{ color: C.accent, fontSize: 11, fontWeight: 800, padding: "3px 9px", borderRadius: 99, border: `1px solid ${C.accentChipBorder}`, background: C.accentChipBg }}>
            Live
          </span>
        </div>

        {/* Entry tabs */}
        <div style={{ flexShrink: 0, display: "flex", gap: 8, padding: "14px 18px 6px" }}>
          {WORKFLOWS.map((opt, i) => {
            const active = i === wi;
            const Icon = opt.Icon;
            return (
              <span key={opt.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 11px", borderRadius: 10, fontSize: 12, fontWeight: 700, color: active ? "#03201d" : C.muted, background: active ? PILL_TEAL : C.chipBg, border: `1px solid ${active ? "transparent" : C.innerBorder}`, transition: "all .35s ease" }}>
                <Icon size={13} aria-hidden /> {opt.tab}
              </span>
            );
          })}
        </div>

        {/* Phase screen */}
        <div ref={bodyRef} key={`${w.id}-${phase}`} className="ralph-cine-body" style={{ flex: 1, overflowY: "auto", padding: "12px 18px 18px", display: "flex", flexDirection: "column", justifyContent: "flex-start", animation: reduced ? undefined : "ralphFade .5s both" }}>
          {/* INPUT — url / plate */}
          {phase === "input" && w.inputKind === "url" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px", borderRadius: 12, border: `1px solid ${C.innerBorder}`, background: C.innerCard, minHeight: 24 }}>
              <Link2 size={16} color={C.muted} aria-hidden />
              <span style={{ color: C.text, fontSize: 14.5, fontWeight: 600 }}>
                {typed}
                {typing && <span style={{ display: "inline-block", width: 8, height: 16, marginLeft: 1, verticalAlign: "text-bottom", background: C.accent, borderRadius: 2, animation: "ralphBlink 1s steps(1) infinite" }} />}
              </span>
            </div>
          )}
          {phase === "input" && w.inputKind === "plate" && (
            <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: "3px solid #1d1d1f", background: "#ffdb16", color: "#111", fontWeight: 900, fontSize: 24, letterSpacing: "0.14em" }}>
              {typed || " "}
              {typing && <span style={{ display: "inline-block", width: 3, height: 26, marginLeft: 2, background: "#111", animation: "ralphBlink 1s steps(1) infinite" }} />}
            </div>
          )}

          {/* INPUT — manual fill + upload + confirm */}
          {phase === "input" && w.inputKind === "manual" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {w.fields?.map(([label, val], i) =>
                step >= i + 1 ? (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 11, border: `1px solid ${C.innerBorder}`, background: C.innerCard, animation: "ralphFade .4s both" }}>
                    <span style={{ color: C.faint, fontSize: 12.5, fontWeight: 700 }}>{label}</span>
                    <span style={{ color: C.text, fontSize: 13.5, fontWeight: 700 }}>{val}</span>
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
                        <span style={{ position: "absolute", top: 5, right: 5, width: 16, height: 16, borderRadius: 99, display: "grid", placeItems: "center", background: PILL_TEAL }}>
                          <Check size={10} color="#062b27" aria-hidden />
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step >= fieldCount + 2 && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, color: C.accent, fontWeight: 700, fontSize: 13, animation: "ralphFade .4s both" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 99, display: "grid", placeItems: "center", background: C.iconWrapBg, border: `1px solid ${C.iconWrapBorder}` }}>
                    <Check size={12} aria-hidden />
                  </span>
                  Details + 3 photos ready — analysing
                </div>
              )}
            </div>
          )}

          {/* FETCHED listing */}
          {phase === "fetched" && w.listing && (
            <div>
              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginBottom: 10 }}>FOUND THIS LISTING</div>
              <div style={{ display: "flex", gap: 13, padding: "14px", borderRadius: 14, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                <div style={{ flexShrink: 0, position: "relative" }}>
                  <CarThumb width={92} height={68} />
                  <span style={{ position: "absolute", bottom: 4, left: 4, display: "flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 6, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 9, fontWeight: 700 }}>
                    <ImageIcon size={9} aria-hidden /> 1/8
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ color: C.text, fontWeight: 800, fontSize: 14.5 }}>{w.listing.title}</span>
                    <span style={{ color: C.accent, fontWeight: 800, fontSize: 14.5 }}>{w.listing.price}</span>
                  </div>
                  <div style={{ color: C.faint, fontSize: 12, margin: "3px 0 8px" }}>{w.listing.sub}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {w.listing.meta.map((mt) => (
                      <span key={mt} style={{ fontSize: 11, fontWeight: 700, color: C.muted, padding: "3px 8px", borderRadius: 99, background: C.chipBg }}>{mt}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, color: C.accent, fontWeight: 700, fontSize: 13 }}>
                <span style={{ width: 20, height: 20, borderRadius: 99, display: "grid", placeItems: "center", background: C.iconWrapBg, border: `1px solid ${C.iconWrapBorder}` }}>
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
                    <span style={{ width: 18, height: 18, borderRadius: 99, display: "grid", placeItems: "center", background: C.iconWrapBg, border: `1px solid ${C.iconWrapBorder}` }}>
                      <Check size={11} color={C.accent} aria-hidden />
                    </span>
                    <span style={{ color: C.muted, fontSize: 13.5 }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RICH REPORT (reg) — interpretation-led, not a data dump */}
          {phase === "report" && w.rich && (
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <div style={{ padding: "15px 17px", borderRadius: 16, border: `1px solid ${C.innerBorder}`, background: C.verdictBg, animation: "ralphFade .5s both" }}>
                <span style={{ color: C.accent, fontSize: 11, fontWeight: 800, letterSpacing: 1.2 }}>RALPH'S VERDICT</span>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 21, margin: "5px 0 5px" }}>{w.rich.verdict}</div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{w.rich.summary}</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, animation: "ralphFade .5s both", animationDelay: ".08s" }}>
                {w.rich.grid.map((g) => (
                  <div key={g.label} style={{ padding: "9px 10px", borderRadius: 11, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: GRID_DOT[g.tone], flexShrink: 0 }} />
                      <span style={{ color: C.faint, fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase" }}>{g.label}</span>
                    </div>
                    <div style={{ color: C.text, fontSize: 12, fontWeight: 700, marginTop: 4 }}>{g.value}</div>
                  </div>
                ))}
              </div>

              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1, marginTop: 2 }}>WORTH WEIGHING UP</div>

              {w.rich.findings.map((f) => (
                <div key={f.title} style={{ padding: "13px 15px", borderRadius: 14, border: `1px solid ${C.innerBorder}`, borderLeft: `3px solid ${PILL_AMBER}`, background: C.innerCard }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <AlertTriangle size={16} color={FLAG} style={{ marginTop: 1, flexShrink: 0 }} aria-hidden />
                    <div>
                      <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>{f.title}</div>
                      <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: "4px 0 0" }}>{f.meaning}</p>
                    </div>
                  </div>
                  {f.chart && (
                    <div style={{ marginTop: 12, padding: "10px 8px 4px", borderRadius: 10, background: theme === "dark" ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.faint, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, padding: "0 6px 2px" }}>
                        <TrendingDown size={12} color={FLAG} aria-hidden /> RECORDED MILEAGE
                      </div>
                      <MileageChart data={f.chart} C={C} />
                    </div>
                  )}
                  <div style={{ color: C.faint, fontSize: 11.5, marginTop: 10, paddingTop: 9, borderTop: `1px solid ${C.innerBorder}` }}>{f.evidence}</div>
                </div>
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.accent, fontSize: 12.5, fontWeight: 600 }}>
                <ShieldCheck size={15} aria-hidden /> {w.rich.clear}
              </div>

              <div style={{ padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 14, marginBottom: 5 }}>What it's actually worth</div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: "0 0 12px" }}>{w.rich.money.meaning}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {w.rich.money.rows.map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ color: C.faint, fontSize: 12.5 }}>{k}</span>
                      <span style={{ color: C.text, fontSize: 13.5, fontWeight: 800 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ color: C.faint, fontSize: 11, textAlign: "center", marginTop: 2 }}>{w.rich.source}</div>
            </div>
          )}

          {/* COMPACT REPORT (link / manual) — still meaning-first */}
          {phase === "report" && w.report && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>{w.report.kind.toUpperCase()}</div>
              <div style={{ padding: "15px 17px", borderRadius: 16, border: `1px solid ${C.innerBorder}`, background: C.verdictBg, animation: "ralphFade .5s both" }}>
                <span style={{ color: C.accent, fontSize: 11, fontWeight: 800, letterSpacing: 1.2 }}>RALPH'S VERDICT</span>
                <div style={{ color: C.text, fontWeight: 800, fontSize: 19, margin: "4px 0 6px" }}>{w.report.verdict}</div>
                <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: 0 }}>{w.report.note}</p>
              </div>

              {w.report.decision && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, animation: "ralphFade .5s both", animationDelay: ".08s" }}>
                  <div style={{ padding: "13px 14px", borderRadius: 13, border: `1px solid ${C.accentChipBorder}`, background: C.accentChipBg }}>
                    <div style={{ color: C.text, fontWeight: 800, fontSize: 18 }}>{w.report.decision.left}</div>
                    <div style={{ color: C.accent, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, marginTop: 3, textTransform: "uppercase" }}>{w.report.decision.leftLabel}</div>
                  </div>
                  <div style={{ padding: "13px 14px", borderRadius: 13, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                    <div style={{ color: C.text, fontWeight: 800, fontSize: 18 }}>{w.report.decision.mid}</div>
                    <div style={{ color: C.faint, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, marginTop: 3, textTransform: "uppercase" }}>{w.report.decision.midLabel}</div>
                  </div>
                  <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, padding: "10px 13px", borderRadius: 12, border: `1px solid ${C.innerBorder}`, background: C.innerCard }}>
                    <AlertTriangle size={14} color={FLAG} aria-hidden />
                    <span style={{ color: C.muted, fontSize: 12.5 }}><span style={{ color: C.faint, fontWeight: 700 }}>Main risk: </span>{w.report.decision.risk}</span>
                  </div>
                </div>
              )}

              <div style={{ color: C.faint, fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>WHAT THIS MEANS FOR YOU</div>
              {w.report.insights.map((it) => (
                <div key={it.title} style={{ padding: "13px 15px", borderRadius: 14, border: `1px solid ${C.innerBorder}`, borderLeft: `3px solid ${PILL_AMBER}`, background: C.innerCard }}>
                  <div style={{ color: C.text, fontWeight: 800, fontSize: 14 }}>{it.title}</div>
                  <p style={{ color: C.muted, fontSize: 13, lineHeight: 1.5, margin: "4px 0 0" }}>{it.meaning}</p>
                </div>
              ))}

              {w.report.caveat && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "11px 13px", borderRadius: 12, background: "rgba(230,184,115,0.12)", color: C.muted, fontSize: 12.5, lineHeight: 1.45 }}>
                  <AlertTriangle size={14} color={PILL_AMBER} style={{ marginTop: 1, flexShrink: 0 }} aria-hidden />
                  {w.report.caveat}
                </div>
              )}

              <div style={{ color: C.faint, fontSize: 11, textAlign: "center", marginTop: 2 }}>{w.report.source}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
