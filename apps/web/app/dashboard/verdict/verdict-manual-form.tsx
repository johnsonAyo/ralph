"use client";
import { useState, useRef } from "react";
import { Button, Input } from "@ralph/ui";
import { ImagePlus, Loader2, X, ArrowLeft, ChevronDown, Plus, Minus, Car, Camera, Wallet, ShieldCheck, AlertTriangle, HelpCircle } from "lucide-react";
import type { ManualDetails } from "@ralph/shared";
import { uploadListingPhotos } from "../../lib/upload-listing-photos";
import { useSession } from "../../lib/supabase";
import { LABEL_TEXT, HINT_TEXT, CONTROL_CLASS, SELECT_CLASS, PANEL_CLASS } from "../../components/check-form/styles";

const POPULAR_MAKES = [
  "Audi", "BMW", "Citroen", "Fiat", "Ford", "Honda", "Hyundai", "Kia",
  "Land Rover", "Lexus", "Mazda", "Mercedes-Benz", "Mini", "Nissan",
  "Peugeot", "Porsche", "Renault", "SEAT", "Skoda", "Tesla", "Toyota",
  "Vauxhall", "Volkswagen", "Volvo", "Other"
];

const FUEL_TYPES = [
  "Petrol", "Diesel", "Hybrid", "Plug-in Hybrid", "Electric", "Other"
];

const TRANSMISSIONS = [
  "Manual", "Automatic", "Semi-Automatic", "Other", "Unknown"
];

const SERVICE_HISTORY_OPTIONS = [
  "Full", "Partial", "None", "Unknown"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => (currentYear - i).toString());
YEARS.push("Older");

type FaultState = "none" | "yes" | "unsure";

const FAULT_OPTIONS: { value: FaultState; label: string; Icon: typeof ShieldCheck }[] = [
  { value: "none", label: "Looks clean", Icon: ShieldCheck },
  { value: "yes", label: "Damage / faults", Icon: AlertTriangle },
  { value: "unsure", label: "Not sure yet", Icon: HelpCircle },
];

export interface ManualDraft {
  manual: ManualDetails;
  totalBudget: number;
  askingPrice?: number;
}

interface ManualFormProps {
  initial?: ManualDraft;
  onReview: (data: ManualDraft) => void;
  isLoading: boolean;
  error?: string;
  // Label for the price field — adapts to the source (dealer price / bid / ask).
  priceLabel?: string;
  onBack?: () => void;
}

/** Small blue dot that marks a required field — replaces "(required)"/"(optional)" text noise. */
function ReqDot() {
  return <span className="size-[7px] shrink-0 rounded-full bg-[var(--blue)]" title="Required" aria-label="Required" />;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={LABEL_TEXT}>{children}</span>
      {required && <ReqDot />}
    </span>
  );
}

function SectionHeader({ icon: Icon, title, sub }: { icon: typeof Car; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[rgba(47,98,233,0.09)] text-[var(--blue)]">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col">
        <h3 className="m-0 text-[1.05rem] font-[850] leading-tight text-foreground">{title}</h3>
        {sub && <p className="m-0 text-[0.85rem] leading-snug text-[var(--muted)]">{sub}</p>}
      </div>
    </div>
  );
}

export function ManualForm({ initial, onReview, isLoading, error, priceLabel = "Asking price (£)", onBack }: ManualFormProps) {
  const [make, setMake] = useState(initial?.manual.make ?? "");
  const [model, setModel] = useState(initial?.manual.model ?? "");
  const [year, setYear] = useState(initial?.manual.year?.toString() ?? "");
  const [mileage, setMileage] = useState(initial?.manual.mileage?.toString() ?? "");
  const [fuelType, setFuelType] = useState(initial?.manual.fuelType ?? "");
  const [transmission, setTransmission] = useState(initial?.manual.transmission ?? "");
  const [previousOwners, setPreviousOwners] = useState(initial?.manual.previousOwners?.toString() ?? "");
  const [serviceHistory, setServiceHistory] = useState(initial?.manual.serviceHistory ?? "");
  const [knownFaults, setKnownFaults] = useState(initial?.manual.knownFaults ?? "");
  const [notes, setNotes] = useState(initial?.manual.notes ?? "");
  const [totalBudget, setTotalBudget] = useState(initial?.totalBudget?.toString() ?? "");
  const [askingPrice, setAskingPrice] = useState(initial?.askingPrice?.toString() ?? "");

  // Progressive disclosure — the extra spec grid starts collapsed unless the
  // draft already has something in it, so a first-time form stays short.
  const [moreOpen, setMoreOpen] = useState(
    Boolean(
      initial?.manual.fuelType || initial?.manual.transmission ||
      initial?.manual.previousOwners || initial?.manual.serviceHistory
    )
  );
  // Condition is asked as a friendly toggle; the free-text box only appears on "yes".
  const [faults, setFaults] = useState<FaultState>(initial?.manual.knownFaults ? "yes" : "unsure");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    initial?.manual.images?.map((img) => img.fullUrl) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: user } = useSession();

  // Electric cars are single-speed — lock the gearbox so nobody picks "Manual".
  const isEV = fuelType === "Electric";

  const isReady = make.trim().length > 0 && Number(totalBudget.replace(/,/g, "")) > 0 && !uploading;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...next]);
    setPreviews((prev) => [...prev, ...next.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      // Only revoke object URLs we created, not fullUrls from initial
      if (prev[i].startsWith("blob:")) {
        URL.revokeObjectURL(prev[i]);
      }
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady) return;
    setUploadError("");

    let imageUrls: string[] = initial?.manual.images?.map(img => img.fullUrl) ?? [];

    if (files.length > 0) {
      if (!user?.id) {
        setUploadError("Sign in to upload photos.");
        return;
      }
      setUploading(true);
      try {
        const newUrls = await uploadListingPhotos(files, user.id);
        imageUrls = [...imageUrls, ...newUrls];
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Photo upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Resolve the condition toggle into a knownFaults signal Ralph can reason about.
    const resolvedFaults =
      faults === "yes" ? (knownFaults.trim() || undefined)
      : faults === "none" ? "None reported by seller"
      : undefined;

    onReview({
      manual: {
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        year: year ? parseInt(year, 10) : undefined,
        mileage: mileage ? parseInt(mileage.replace(/,/g, ""), 10) : undefined,
        fuelType: fuelType.trim() || undefined,
        transmission: isEV ? "Automatic" : (transmission.trim() || undefined),
        previousOwners: previousOwners ? parseInt(previousOwners.replace(/,/g, ""), 10) : undefined,
        serviceHistory: serviceHistory.trim() || undefined,
        knownFaults: resolvedFaults,
        notes: notes.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls.map(url => ({ fullUrl: url })) : undefined,
      },
      totalBudget: Number(totalBudget.replace(/,/g, "")),
      askingPrice: askingPrice ? Number(askingPrice.replace(/,/g, "")) : undefined,
    });
  };

  return (
    <form className={PANEL_CLASS} onSubmit={handleSubmit}>
      {/* ─── The car ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <SectionHeader icon={Car} title="The car" sub="Just the basics to start — only the make is required." />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          <label className="col-span-2 flex flex-col gap-2 sm:col-span-1">
            <FieldLabel required>Make</FieldLabel>
            <select
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className={SELECT_CLASS}
              disabled={isLoading}
              required
            >
              <option value="" disabled>Select make</option>
              {POPULAR_MAKES.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="col-span-2 flex flex-col gap-2 sm:col-span-1">
            <FieldLabel>Model</FieldLabel>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Focus 1.0 EcoBoost" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel>Year</FieldLabel>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={SELECT_CLASS}
              disabled={isLoading}
            >
              <option value="">Any</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel>Mileage</FieldLabel>
            <Input type="text" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="78,000" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
        </div>
      </div>

      {/* ─── More about the car (progressive) ────────────────────── */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="group flex items-center gap-4 rounded-2xl border-[1.5px] border-dashed border-[rgba(47,98,233,0.4)] bg-[rgba(47,98,233,0.04)] px-4 py-4 text-left transition hover:border-[var(--blue)] hover:bg-[rgba(47,98,233,0.08)] sm:px-5"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--blue)] text-white transition-transform group-hover:scale-105">
            {moreOpen ? <Minus className="size-[18px]" aria-hidden /> : <Plus className="size-[18px]" aria-hidden />}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-[1rem] font-[850] text-foreground">Add more about the car</span>
            <span className="text-[0.85rem] leading-snug text-[var(--muted)]">Fuel, gearbox, service history — the more Ralph knows, the sharper the verdict.</span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[rgba(47,98,233,0.1)] px-3 py-1.5 text-[0.8rem] font-[800] text-[var(--blue)]">
            <span className="hidden sm:inline">{moreOpen ? "Hide" : "Show"}</span>
            <ChevronDown className={`size-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} aria-hidden />
          </span>
        </button>

        {moreOpen && (
          <div className="grid grid-cols-2 gap-4 duration-300 animate-in fade-in slide-in-from-top-2 sm:gap-5">
            <label className="flex flex-col gap-2">
              <FieldLabel>Fuel</FieldLabel>
              <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className={SELECT_CLASS} disabled={isLoading}>
                <option value="">Any</option>
                {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <FieldLabel>Gearbox</FieldLabel>
              <select
                value={isEV ? "Automatic" : transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className={`${SELECT_CLASS} ${isEV ? "opacity-60" : ""}`}
                disabled={isLoading || isEV}
              >
                <option value="">Any</option>
                {TRANSMISSIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {isEV && <span className={HINT_TEXT}>Electric cars are single-speed.</span>}
            </label>
            <label className="flex flex-col gap-2">
              <FieldLabel>Owners</FieldLabel>
              <Input type="number" min={1} step={1} value={previousOwners} onChange={(e) => setPreviousOwners(e.target.value)} placeholder="2" className={CONTROL_CLASS} disabled={isLoading} />
            </label>
            <label className="flex flex-col gap-2">
              <FieldLabel>Service history</FieldLabel>
              <select value={serviceHistory} onChange={(e) => setServiceHistory(e.target.value)} className={SELECT_CLASS} disabled={isLoading}>
                <option value="">Any</option>
                {SERVICE_HISTORY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      {/* ─── Condition & photos ──────────────────────────────────── */}
      <div className="flex flex-col gap-5">
        <SectionHeader icon={Camera} title="Condition & photos" sub="How does it look? Photos help Ralph spot damage." />

        {/* Condition toggle — reveals a detail box only when there's damage */}
        <div className="grid grid-cols-3 gap-3">
          {FAULT_OPTIONS.map(({ value, label, Icon }) => {
            const active = faults === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFaults(value)}
                aria-pressed={active}
                className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center text-[0.9rem] font-[800] transition sm:flex-row sm:gap-2.5 ${
                  active
                    ? "border-[var(--blue)] bg-[rgba(47,98,233,0.08)] text-[var(--blue)]"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--blue)] hover:text-foreground"
                }`}
              >
                <Icon className="size-[18px] shrink-0" aria-hidden /> {label}
              </button>
            );
          })}
        </div>

        {faults === "yes" && (
          <label className="flex flex-col gap-2 duration-300 animate-in fade-in slide-in-from-top-2">
            <FieldLabel>What&rsquo;s wrong with it?</FieldLabel>
            <textarea
              value={knownFaults}
              onChange={(e) => setKnownFaults(e.target.value)}
              placeholder="e.g. front-end damage, airbags intact, drives and starts. Slow oil leak, passenger mirror stuck…"
              rows={3}
              className="min-h-[96px] w-full resize-none rounded-[16px] border-[1.5px] border-[var(--line)] bg-[#fefdfb] px-4 py-3 text-[1rem] font-semibold leading-relaxed text-[var(--ink)] shadow-none outline-none transition-[border-color,box-shadow] placeholder:font-medium placeholder:text-[#c4bdb4] focus:border-[var(--blue)] focus:ring-4 focus:ring-[rgba(47,98,233,0.14)]"
              disabled={isLoading}
              autoFocus
            />
          </label>
        )}

        {/* Photos */}
        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6">
            {previews.map((src, i) => (
              <div key={src} className="group relative aspect-square w-full overflow-hidden rounded-xl border border-[var(--line)] bg-[#f4f0e7]">
                <img src={src} alt={`Photo ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/65 text-white transition hover:bg-black/80"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border-[1.5px] border-dashed border-[var(--line)] bg-[#fefdfb] text-[var(--muted)] transition hover:border-[var(--blue)] hover:text-[var(--blue)]"
            >
              <ImagePlus className="size-5" aria-hidden />
              <span className="text-[0.7rem] font-bold">Add</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {/* Free-form catch-all */}
        <label className="flex flex-col gap-2">
          <FieldLabel>Anything else Ralph should know?</FieldLabel>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. one owner from new, drives well, MOT until March…" className={CONTROL_CLASS} disabled={isLoading} />
        </label>
      </div>

      {/* ─── The money ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-5 rounded-[22px] border border-[rgba(47,98,233,0.22)] bg-[rgba(47,98,233,0.04)] p-5 sm:p-6">
        <SectionHeader icon={Wallet} title="Budget & price" sub="Ralph weighs the price against what you can spend." />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <FieldLabel required>Your total budget (£)</FieldLabel>
            <Input type="text" inputMode="numeric" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="5,000" className={CONTROL_CLASS} disabled={isLoading} required />
            <span className={HINT_TEXT}>The most you can spend, including any early repairs.</span>
          </label>
          <label className="flex flex-col gap-2">
            <FieldLabel>{priceLabel}</FieldLabel>
            <Input type="text" inputMode="numeric" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="4,500" className={CONTROL_CLASS} disabled={isLoading} />
            <span className={HINT_TEXT}>Leave blank if there&rsquo;s no price yet.</span>
          </label>
        </div>
      </div>

      {(error || uploadError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.92rem] font-medium text-red-800">
          {error || uploadError}
        </div>
      )}

      <Button type="submit" disabled={!isReady || isLoading || uploading} className="h-[56px] w-full rounded-[20px] text-[1.1rem]">
        {uploading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Uploading photos…
          </>
        ) : (
          "Review details"
        )}
      </Button>

      {onBack && (
        <div className="flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-[44px] items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-transparent px-5 text-[0.95rem] font-bold text-[var(--muted)] transition-all hover:border-[var(--muted)] hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden /> Back
          </button>
        </div>
      )}
    </form>
  );
}
