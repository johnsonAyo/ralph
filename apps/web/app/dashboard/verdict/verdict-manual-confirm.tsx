import { useState } from "react";
import { Button } from "@ralph/ui";
import { Pencil, Check, ImageOff, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import type { ManualDraft } from "./verdict-manual-form";

function GalleryImage({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 bg-[#f4f0e7] text-[#9a9286] ${className ?? ""}`}>
        <ImageOff className="size-6" aria-hidden />
        <span className="text-[0.72rem] font-[700]">No image</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`max-w-full ${className ?? ""}`} />;
}

interface ManualConfirmProps {
  draft: ManualDraft;
  submitting: boolean;
  error?: string | null;
  onEdit: () => void;
  onConfirm: () => void;
}

function money(n?: number): string {
  return n != null ? `£${n.toLocaleString("en-GB")}` : "—";
}

export function ManualConfirm({ draft, submitting, error, onEdit, onConfirm }: ManualConfirmProps) {
  const { manual } = draft;
  const rows: [string, string][] = [
    ["Make", manual.make || "—"],
    ["Model", manual.model || "—"],
    ["Year", manual.year?.toString() || "—"],
    ["Mileage", manual.mileage != null ? `${manual.mileage.toLocaleString("en-GB")} mi` : "—"],
    ["Fuel", manual.fuelType || "—"],
    ["Gearbox", manual.transmission || "—"],
    ["Owners", manual.previousOwners != null ? manual.previousOwners.toString() : "—"],
    ["Service history", manual.serviceHistory || "—"],
    ["Your budget", money(draft.totalBudget)],
    ["Asking price", money(draft.askingPrice)],
  ];

  const images = manual.images || [];
  const [active, setActive] = useState(0);
  const activeImage = images[active];
  const mainSrc = activeImage?.fullUrl || activeImage?.highResUrl || activeImage?.thumbnailUrl;
  const step = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  return (
    <section className="flex flex-col gap-5 rounded-[24px] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7">
      <div className="flex flex-col gap-1 items-center text-center">
        <h2 className="m-0 text-[1.5rem] sm:text-[1.8rem] font-[900] text-foreground">Confirm details</h2>
      </div>

      {images.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-[20px] border border-[#e6ded0] bg-[#f4f0e7]">
            <GalleryImage
              src={mainSrc}
              alt="Uploaded photo"
              className="aspect-[4/3] w-full object-cover"
            />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-white"
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground shadow-[0_4px_12px_rgba(0,0,0,0.12)] backdrop-blur transition hover:bg-white"
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[0.72rem] font-[800] text-white">
                  <Camera className="size-3.5" aria-hidden />
                  {active + 1} / {images.length}
                </div>
              </>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View photo ${i + 1}`}
                  aria-current={i === active}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-[10px] border-2 transition ${
                    i === active
                      ? "border-[#2f62e9]"
                      : "border-transparent opacity-80 hover:opacity-100"
                  }`}
                >
                  <GalleryImage
                    src={img.thumbnailUrl || img.fullUrl || img.highResUrl}
                    alt={`Photo ${i + 1}`}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {manual.knownFaults && (
        <div className="rounded-[14px] border border-[var(--line)] bg-[#fbfaf6] px-4 py-3 text-[0.9rem]">
          <strong className="block text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286] mb-1">Known Faults / Damage</strong>
          <span className="text-[var(--ink)] font-semibold">{manual.knownFaults}</span>
        </div>
      )}

      {manual.notes && (
        <div className="rounded-[14px] border border-[var(--line)] bg-[#fbfaf6] px-4 py-3 text-[0.9rem]">
          <strong className="block text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286] mb-1">Additional Notes</strong>
          <p className="m-0 italic text-[var(--muted)]">&ldquo;{manual.notes}&rdquo;</p>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5 rounded-[14px] border border-[var(--line)] bg-[#fefdfb] px-3.5 py-3">
            <dt className="text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286]">{label}</dt>
            <dd className="m-0 text-[0.95rem] font-[850] text-foreground">{value}</dd>
          </div>
        ))}
      </dl>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.92rem] font-medium text-red-800">{error}</div>
      )}

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button type="button" variant="secondary" onClick={onEdit} disabled={submitting} className="sm:w-auto">
          <Pencil className="size-4" aria-hidden /> Edit details
        </Button>
        <Button type="button" onClick={onConfirm} disabled={submitting} className="sm:flex-1">
          {submitting ? "Analysing…" : (<><Check className="size-4" aria-hidden /> Looks right — ask Ralph</>)}
        </Button>
      </div>
    </section>
  );
}
