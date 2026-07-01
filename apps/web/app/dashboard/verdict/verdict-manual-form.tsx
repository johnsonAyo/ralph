"use client";
import { useState, useRef } from "react";
import { Button, Input } from "@ralph/ui";
import { ImagePlus, Loader2, X } from "lucide-react";
import type { ManualDetails } from "@ralph/shared";
import { uploadListingPhotos } from "../../lib/upload-listing-photos";
import { useSession } from "../../lib/supabase";
import { LABEL_TEXT, HINT_TEXT, CONTROL_CLASS, PANEL_CLASS } from "../../components/check-form/styles";

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
}

export function ManualForm({ initial, onReview, isLoading, error }: ManualFormProps) {
  const [make, setMake] = useState(initial?.manual.make ?? "");
  const [model, setModel] = useState(initial?.manual.model ?? "");
  const [year, setYear] = useState(initial?.manual.year?.toString() ?? "");
  const [mileage, setMileage] = useState(initial?.manual.mileage?.toString() ?? "");
  const [fuelType, setFuelType] = useState(initial?.manual.fuelType ?? "");
  const [notes, setNotes] = useState(initial?.manual.notes ?? "");
  const [totalBudget, setTotalBudget] = useState(initial?.totalBudget?.toString() ?? "");
  const [askingPrice, setAskingPrice] = useState(initial?.askingPrice?.toString() ?? "");

  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>(
    initial?.manual.images?.map((img) => img.fullUrl) ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: user } = useSession();

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

    onReview({
      manual: {
        make: make.trim() || undefined,
        model: model.trim() || undefined,
        year: year ? parseInt(year, 10) : undefined,
        mileage: mileage ? parseInt(mileage.replace(/,/g, ""), 10) : undefined,
        fuelType: fuelType.trim() || undefined,
        notes: notes.trim() || undefined,
        images: imageUrls.length > 0 ? imageUrls.map(url => ({ fullUrl: url })) : undefined,
      },
      totalBudget: Number(totalBudget.replace(/,/g, "")),
      askingPrice: askingPrice ? Number(askingPrice.replace(/,/g, "")) : undefined,
    });
  };

  return (
    <form className={PANEL_CLASS} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <span className={LABEL_TEXT}>Photos (Optional)</span>
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
          <span className={HINT_TEXT}>Photos help Ralph spot damage or features. JPG or PNG.</span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Make</span>
            <Input value={make} onChange={(e) => setMake(e.target.value)} placeholder="e.g. Ford" className={CONTROL_CLASS} disabled={isLoading} required />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Model</span>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Focus 1.0 EcoBoost" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Year</span>
            <Input type="text" inputMode="numeric" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2015" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Mileage</span>
            <Input type="text" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="e.g. 78,000" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Fuel</span>
            <Input value={fuelType} onChange={(e) => setFuelType(e.target.value)} placeholder="e.g. Petrol" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
        </div>

        <label className="flex flex-col gap-2">
          <span className={LABEL_TEXT}>Anything else Ralph should know? (Optional)</span>
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. one owner, service history, known faults…" className={CONTROL_CLASS} disabled={isLoading} />
        </label>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Your Total Budget (£)</span>
            <Input type="text" inputMode="numeric" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)} placeholder="e.g. 5,000" className={CONTROL_CLASS} disabled={isLoading} required />
            <span className={HINT_TEXT}>The most you can spend, including initial repairs.</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className={LABEL_TEXT}>Asking Price (£) (Optional)</span>
            <Input type="text" inputMode="numeric" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} placeholder="e.g. 4,500" className={CONTROL_CLASS} disabled={isLoading} />
          </label>
        </div>
      </div>

      {(error || uploadError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-[0.92rem] font-medium text-red-800">
          {error || uploadError}
        </div>
      )}

      <Button type="submit" disabled={!isReady || isLoading || uploading} className="w-full">
        {uploading ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Uploading photos…
          </>
        ) : (
          "Review details"
        )}
      </Button>
    </form>
  );
}
