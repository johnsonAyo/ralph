import { toNumber } from "@/modules/extraction/infrastructure/shared/parsing.utils";


export function parseIaaVehicleTitle(value?: string): {
  year?: number;
  make?: string;
  model?: string;
} {
  if (!value) {
    return {};
  }

  const parts = value.trim().split(/\s+/);
  const year = toNumber(parts[0]);
  const make = parts[1];
  const modelWords = parts.slice(2);
  const bodyStart = modelWords.findIndex((word, index) => {
    return /^\d+$/.test(word) && modelWords[index + 1]?.toUpperCase() === "DOOR";
  });

  const model =
    bodyStart > 0 ? modelWords.slice(0, bodyStart).join(" ") : modelWords.slice(0, 4).join(" ");

  return {
    year,
    make,
    model: model || undefined,
  };
}

export function formatIaaSaleDate(rawSaleDate: string | undefined, html: string): string | undefined {
  if (!rawSaleDate) {
    return undefined;
  }

  const match = rawSaleDate.match(
    /^[A-Z][a-z]{2}\s+(\d{2})\/(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/,
  );

  if (!match) {
    return rawSaleDate;
  }

  const copyrightYear = html.match(/Copyright\s+IAA UK Auctions Ltd\s+(\d{4})/i)?.[1];
  const year = Number.parseInt(copyrightYear ?? String(new Date().getUTCFullYear()), 10);
  const [, day, month, hour, minute, second] = match;
  const parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}+01:00`);

  return Number.isNaN(parsed.getTime()) ? rawSaleDate : parsed.toISOString();
}
