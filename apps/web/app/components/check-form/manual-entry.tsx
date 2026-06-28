"use client";

import { FormEvent, useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ralph/ui";
import { AuctionPlatformCode } from "@ralph/shared";
import { uploadListingPhotos } from "../../lib/upload-listing-photos";
import { CONTROL_CLASS, HINT_TEXT, LABEL_TEXT } from "./styles";

interface ManualEntryProps {
  paramsReady: boolean;
  submitting: boolean;
  error?: string | null;
  userId?: string;
  onAnalyse: (event: FormEvent, listing: Record<string, unknown>) => void;
}

const DAMAGE_OPTIONS = [
  "None",
  "Front",
  "Rear",
  "Side / wing",
  "All over",
  "Minor dents & scratches",
  "Undercarriage",
  "Mechanical",
  "Water / flood",
  "Fire",
  "Vandalism",
  "Hail",
  "Unknown",
];
const RUN_CONDITION_OPTIONS = [
  "Starts & drives",
  "Starts, doesn't drive",
  "Non-runner",
  "Unknown",
];
const V5_OPTIONS = ["Present (V5C)", "Not present", "Applied for", "Unknown"];
const KEYS_OPTIONS = ["Yes", "No", "Unknown"];
const CATEGORY_OPTIONS = [
  "Clean / unrecorded",
  "Cat N",
  "Cat S",
  "Cat B",
  "Cat A",
  "Unknown",
];

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={LABEL_TEXT}>{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={CONTROL_CLASS}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  inputMode?: "numeric";
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={LABEL_TEXT}>{label}</span>
      <Input
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={CONTROL_CLASS}
      />
    </label>
  );
}

function toInt(v: string): number | undefined {
  const n = parseInt(v.replace(/[^0-9]/g, ""), 10);
  return Number.isFinite(n) ? n : undefined;
}
function toNum(v: string): number | undefined {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : undefined;
}

export default function ManualEntry({
  paramsReady,
  submitting,
  error,
  userId,
  onAnalyse,
}: ManualEntryProps) {
  const [title, setTitle] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [currentBid, setCurrentBid] = useState("");
  const [estimatedRetail, setEstimatedRetail] = useState("");
  const [location, setLocation] = useState("");
  const [listingUrl, setListingUrl] = useState("");
  const [primaryDamage, setPrimaryDamage] = useState("");
  const [secondaryDamage, setSecondaryDamage] = useState("");
  const [runCondition, setRunCondition] = useState("");
  const [keys, setKeys] = useState("");
  const [v5Status, setV5Status] = useState("");
  const [category, setCategory] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const listingReady = title.trim().length > 0 || (make.trim().length > 0 && model.trim().length > 0);
  const ready = paramsReady && listingReady && !uploading && !submitting;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...next]);
    setPreviews((prev) => [...prev, ...next.map((f) => URL.createObjectURL(f))]);
  };
  const removeFile = (i: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setUploadError("");
    let imageUrls: string[] = [];
    if (files.length > 0) {
      if (!userId) {
        setUploadError("Sign in to upload photos.");
        return;
      }
      setUploading(true);
      try {
        imageUrls = await uploadListingPhotos(files, userId);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Photo upload failed.");
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const listing: Record<string, unknown> = {
      platform: AuctionPlatformCode.Other,
      listingUrl: listingUrl.trim() || undefined,
      title: title.trim() || undefined,
      make: make.trim() || undefined,
      model: model.trim() || undefined,
      year: toInt(year),
      mileage: toInt(mileage),
      mileageUnit: "mi",
      currentBid: toNum(currentBid),
      estimatedRetailValue: toNum(estimatedRetail),
      currency: "GBP",
      location: location.trim() || undefined,
      category: category || undefined,
      primaryDamage: primaryDamage || undefined,
      secondaryDamage: secondaryDamage || undefined,
      runCondition: runCondition || undefined,
      hasKeys: keys === "Yes" ? true : keys === "No" ? false : undefined,
      v5Status: v5Status || undefined,
      images: imageUrls.map((url) => ({ fullUrl: url })),
      extractionConfidence: "high",
      missingFields: [],
    };
    onAnalyse(event, listing);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      <div className="flex flex-col gap-2.5">
        <span className={LABEL_TEXT}>Photos</span>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {previews.map((src, i) => (
            <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--line)] bg-[#f4f0e7]">
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
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed border-[var(--line)] bg-[#fefdfb] text-[var(--muted)] transition hover:border-[var(--blue)] hover:text-[var(--blue)]"
          >
            <ImagePlus className="size-5" aria-hidden />
            <span className="text-[0.72rem] font-bold">Add photos</span>
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
        <span className={HINT_TEXT}>Photos help Ralph spot damage. JPG or PNG.</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <TextField label="Vehicle title" value={title} onChange={setTitle} placeholder="e.g. 2017 Ford Fiesta Zetec" />
        </div>
        <TextField label="Make" value={make} onChange={setMake} placeholder="Ford" />
        <TextField label="Model" value={model} onChange={setModel} placeholder="Fiesta" />
        <TextField label="Year" value={year} onChange={setYear} placeholder="2017" inputMode="numeric" />
        <TextField label="Mileage (mi)" value={mileage} onChange={setMileage} placeholder="48,000" inputMode="numeric" />
        <TextField label="Current bid / price (£)" value={currentBid} onChange={setCurrentBid} placeholder="2,150" inputMode="numeric" />
        <TextField label="Est. retail value (£)" value={estimatedRetail} onChange={setEstimatedRetail} placeholder="4,500" inputMode="numeric" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Primary damage" value={primaryDamage} onChange={setPrimaryDamage} options={DAMAGE_OPTIONS} placeholder="Select damage" />
        <SelectField label="Secondary damage" value={secondaryDamage} onChange={setSecondaryDamage} options={DAMAGE_OPTIONS} placeholder="Select damage" />
        <SelectField label="Runs & drives" value={runCondition} onChange={setRunCondition} options={RUN_CONDITION_OPTIONS} placeholder="Select condition" />
        <SelectField label="Salvage category" value={category} onChange={setCategory} options={CATEGORY_OPTIONS} placeholder="Select category" />
        <SelectField label="Keys" value={keys} onChange={setKeys} options={KEYS_OPTIONS} placeholder="Select" />
        <SelectField label="V5 logbook" value={v5Status} onChange={setV5Status} options={V5_OPTIONS} placeholder="Select status" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Location" value={location} onChange={setLocation} placeholder="e.g. Manchester" />
        <TextField label="Listing link (optional)" value={listingUrl} onChange={setListingUrl} placeholder="https://…" type="url" />
      </div>

      {(uploadError || error) && (
        <p className="form-error">{uploadError || error}</p>
      )}
      {!listingReady && (
        <p className={HINT_TEXT}>Add a vehicle title, or a make and model, to continue.</p>
      )}

      <Button type="submit" className="w-full" disabled={!ready}>
        {uploading ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Uploading photos…
          </>
        ) : submitting ? (
          "Analysing…"
        ) : (
          "Analyse this car"
        )}
      </Button>
    </form>
  );
}
