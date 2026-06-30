"use client";
import "./confirm-listing.css";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Gauge,
  ImageOff,
  KeyRound,
  MapPin,
  Pencil,
  ReceiptText,
  Tag,
} from "lucide-react";
import { Badge, Button, Input } from "@ralph/ui";

interface ListingImage {
  fullUrl?: string;
  highResUrl?: string;
  thumbnailUrl?: string;
  label?: string;
}

interface ConfirmListingProps {
  listing: any;
  submitting: boolean;
  error?: string | null;
  onBack: () => void;
  onConfirm: (event: FormEvent, edited: any) => void;
}

const confidenceVariant: Record<string, "success" | "warning" | "danger"> = {
  high: "success",
  medium: "warning",
  low: "danger",
};

function money(value: unknown): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `£${n.toLocaleString("en-GB")}` : "—";
}
function number(value: unknown, unit = ""): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString("en-GB")}${unit}` : "—";
}
function text(value: unknown): string {
  const s = (value ?? "").toString().trim();
  return s.length ? s : "—";
}

/** One image tile that gracefully falls back when the source fails to load. */
function GalleryImage({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-1.5 bg-[#f4f0e7] text-[#9a9286] ${className ?? ""}`}
      >
        <ImageOff className="size-6" aria-hidden />
        <span className="text-[0.72rem] font-[700]">No image</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      // max-w-full guards against overflow since Tailwind preflight is off app-wide.
      className={`max-w-full ${className ?? ""}`}
    />
  );
}

/** Read display row: icon + label + value. */
function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-[14px] border border-[#e6ded0] bg-white px-3.5 py-3">
      <span className="flex items-center gap-1.5 text-[0.66rem] font-[900] uppercase tracking-[0.05em] text-[#9a9286]">
        <Icon className="size-3.5" aria-hidden />
        {label}
      </span>
      <span className="text-[0.95rem] font-[850] tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

export default function ConfirmListing({
  listing,
  submitting,
  error,
  onBack,
  onConfirm,
}: ConfirmListingProps) {
  const images: ListingImage[] = Array.isArray(listing?.images)
    ? listing.images
    : [];
  const [active, setActive] = useState(0);
  const [editing, setEditing] = useState(false);

  // Editable fields, seeded from the scraped listing. Display reflects these
  // live, so corrections show immediately and flow through on confirm.
  const [title, setTitle] = useState<string>(listing?.title ?? "");
  const [year, setYear] = useState<string>(listing?.year?.toString() ?? "");
  const [mileage, setMileage] = useState<string>(
    listing?.mileage?.toString() ?? "",
  );
  const [currentBid, setCurrentBid] = useState<string>(
    listing?.currentBid?.toString() ?? "",
  );
  const [location, setLocation] = useState<string>(listing?.location ?? "");
  const [primaryDamage, setPrimaryDamage] = useState<string>(
    listing?.primaryDamage ?? "",
  );
  const [secondaryDamage, setSecondaryDamage] = useState<string>(
    listing?.secondaryDamage ?? "",
  );
  const [runCondition, setRunCondition] = useState<string>(
    listing?.runCondition ?? "",
  );
  const [hasKeys, setHasKeys] = useState<boolean>(listing?.hasKeys ?? true);
  const [v5Status, setV5Status] = useState<string>(listing?.v5Status ?? "");

  const activeImage = images[active];
  const mainSrc =
    activeImage?.fullUrl || activeImage?.highResUrl || activeImage?.thumbnailUrl;

  const confidence = (listing?.extractionConfidence ?? "low") as string;
  const missing: string[] = Array.isArray(listing?.missingFields)
    ? listing.missingFields
    : [];
  const lot = listing?.lotNumber;
  const platform = (listing?.platform ?? "").toString().replace(/_/g, " ");

  const step = (delta: number) =>
    setActive((i) => (i + delta + images.length) % images.length);

  const handleSubmit = (e: FormEvent) => {
    onConfirm(e, {
      ...listing,
      title,
      year: year ? parseInt(year, 10) : undefined,
      mileage: mileage ? parseInt(mileage, 10) : undefined,
      currentBid: currentBid ? parseFloat(currentBid) : undefined,
      location,
      primaryDamage,
      secondaryDamage,
      runCondition,
      hasKeys,
      v5Status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          size="none"
          onClick={onBack}
          className="-ml-2 inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-[0.82rem] font-[800] text-[#625c52] hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to form
        </Button>
        {confidence ? (
          <Badge
            variant={confidenceVariant[confidence] ?? "neutral"}
            className="font-[800] capitalize"
          >
            {confidence} confidence read
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 font-serif text-[clamp(1.4rem,2.4vw,1.9rem)] font-[900] leading-[1.05] tracking-[-0.04em] text-foreground">
          Is this the right car?
        </h2>
        <p className="m-0 max-w-[60ch] text-[0.9rem] font-[650] leading-[1.4] text-[#625c52]">
          Check the photos and details Ralph pulled from the listing. If
          anything looks wrong, correct it or go back to the form — Ralph only
          analyses once you confirm.
        </p>
      </div>

      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="relative overflow-hidden rounded-[20px] border border-[#e6ded0] bg-[#f4f0e7]">
          <GalleryImage
            src={mainSrc}
            alt={text(title) === "—" ? "Car listing photo" : title}
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

      {/* Details */}
      <div className="flex flex-col gap-4 rounded-[20px] border border-[#e6ded0] bg-[#fcfbf8] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="m-0 truncate font-serif text-[1.2rem] font-[900] leading-tight tracking-[-0.03em] text-foreground">
              {text(title) === "—" ? "Untitled listing" : title}
            </h3>
            <span className="text-[0.74rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">
              {platform || "Listing"}
              {lot ? ` · Lot ${lot}` : ""}
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="none"
            onClick={() => setEditing((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border-[#e6ded0] px-3 py-2 text-[0.78rem] font-[800] text-foreground hover:bg-[#f4f0e7]"
          >
            <Pencil className="size-3.5" aria-hidden />
            {editing ? "Done editing" : "Correct details"}
          </Button>
        </div>

        {/* Spec grid (display) */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          <Spec icon={ReceiptText} label="Current bid" value={money(currentBid)} />
          <Spec icon={Gauge} label="Mileage" value={number(mileage, " mi")} />
          <Spec icon={Calendar} label="Year" value={text(year)} />
          <Spec icon={MapPin} label="Location" value={text(location)} />
          {listing?.estimatedRetailValue != null ? (
            <Spec icon={Tag} label="Est. retail" value={money(listing.estimatedRetailValue)} />
          ) : null}
          {listing?.saleDate ? (
            <Spec icon={Calendar} label="Sale date" value={text(listing.saleDate)} />
          ) : null}
        </div>

        {/* Damage + condition chips */}
        <div className="flex flex-wrap gap-2">
          {text(primaryDamage) !== "—" ? (
            <Badge variant="danger" className="font-[800]">
              Primary: {primaryDamage}
            </Badge>
          ) : null}
          {text(secondaryDamage) !== "—" ? (
            <Badge variant="warning" className="font-[800]">
              Secondary: {secondaryDamage}
            </Badge>
          ) : null}
          {text(runCondition) !== "—" ? (
            <Badge variant="neutral" className="font-[800]">
              {runCondition}
            </Badge>
          ) : null}
          <Badge variant={hasKeys ? "success" : "neutral"} className="font-[800]">
            <KeyRound className="size-3.5" aria-hidden />
            {hasKeys ? "Has keys" : "No keys"}
          </Badge>
          {text(v5Status) !== "—" ? (
            <Badge variant="info" className="font-[800]">
              V5: {v5Status}
            </Badge>
          ) : null}
        </div>

        {/* Inline correction panel */}
        {editing ? (
          <div className="mt-1 grid gap-3 rounded-[14px] border border-dashed border-[#e6ded0] bg-white p-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Vehicle title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Year</span>
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Mileage (mi)</span>
                <Input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Current bid (£)</span>
                <Input type="number" step="0.01" value={currentBid} onChange={(e) => setCurrentBid(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Location</span>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Primary damage</span>
                <Input value={primaryDamage} onChange={(e) => setPrimaryDamage(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Secondary damage</span>
                <Input value={secondaryDamage} onChange={(e) => setSecondaryDamage(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">Run condition</span>
                <Input value={runCondition} onChange={(e) => setRunCondition(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[0.72rem] font-[800] uppercase tracking-[0.04em] text-[#9a9286]">V5 logbook status</span>
                <Input value={v5Status} onChange={(e) => setV5Status(e.target.value)} />
              </label>
            </div>
            <label className="flex cursor-pointer items-center gap-2 pt-1">
              <input
                type="checkbox"
                checked={hasKeys}
                onChange={(e) => setHasKeys(e.target.checked)}
                className="size-4 accent-[#2f62e9]"
              />
              <span className="text-[0.82rem] font-[800] text-foreground">Has keys</span>
            </label>
          </div>
        ) : null}
      </div>

      {missing.length ? (
        <p className="m-0 text-[0.8rem] font-[700] text-[#9a6b00]">
          Ralph couldn&rsquo;t read: {missing.join(", ")}. Add them via
          &ldquo;Correct details&rdquo; for a sharper analysis.
        </p>
      ) : null}

      {error ? (
        <p className="m-0 text-[0.85rem] font-[800] text-destructive">{error}</p>
      ) : null}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-[#e6ded0] pt-5 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" size="md" onClick={onBack}>
          Back to form
        </Button>
        <Button type="submit" size="md" disabled={submitting}>
          <Check className="size-4" aria-hidden />
          {submitting ? "Starting analysis…" : "Confirm — analyse this car"}
        </Button>
      </div>
    </form>
  );
}
