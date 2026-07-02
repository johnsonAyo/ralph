"use client";
import { useState } from "react";
import { Camera, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export interface GalleryImageData {
  fullUrl?: string;
  highResUrl?: string;
  thumbnailUrl?: string;
  label?: string;
}

/** One image tile that gracefully falls back when the source fails to load. */
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
  // max-w-full guards against overflow since Tailwind preflight is off app-wide.
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`max-w-full ${className ?? ""}`} />;
}

/**
 * The vehicle photo carousel: a main image with prev/next controls and a
 * counter, plus a thumbnail strip. Used on the listing-confirm step and on the
 * report. Renders a graceful empty state when there are no photos.
 */
export function ListingGallery({ images, alt = "Vehicle photo", className }: { images: GalleryImageData[]; alt?: string; className?: string }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-1.5 rounded-[20px] border border-[#e6ded0] bg-[#f4f0e7] text-[#9a9286] ${className ?? ""}`}>
        <ImageOff className="size-7" aria-hidden />
        <span className="text-[0.78rem] font-[700]">No photos</span>
      </div>
    );
  }

  const safeActive = Math.min(active, images.length - 1);
  const activeImage = images[safeActive];
  const mainSrc = activeImage?.fullUrl || activeImage?.highResUrl || activeImage?.thumbnailUrl;
  const step = (delta: number) => setActive((i) => (i + delta + images.length) % images.length);

  return (
    <div className={`flex min-w-0 flex-col gap-3 ${className ?? ""}`}>
      <div className="relative overflow-hidden rounded-[20px] border border-[#e6ded0] bg-[#f4f0e7]">
        <GalleryImage src={mainSrc} alt={alt} className="aspect-[4/3] w-full object-cover" />
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
              {safeActive + 1} / {images.length}
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
              aria-current={i === safeActive}
              className={`relative size-16 shrink-0 overflow-hidden rounded-[10px] border-2 transition ${
                i === safeActive ? "border-[#2f62e9]" : "border-transparent opacity-80 hover:opacity-100"
              }`}
            >
              <GalleryImage src={img.thumbnailUrl || img.fullUrl || img.highResUrl} alt={`Photo ${i + 1}`} className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
