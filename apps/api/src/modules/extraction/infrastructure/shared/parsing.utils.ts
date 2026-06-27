import { ExtractedImage, ExtractionConfidence } from "@ralph/shared";
import { JsonRecord } from "@/modules/extraction/domain/types/json-record.type";
export function valueAfter(lines: string[], label: string): string | undefined {
    const target = label.toLowerCase();
    const index = lines.findIndex((line) => {
        const normalized = line.toLowerCase();
        return normalized === target || normalized.startsWith(target);
    });
    if (index < 0) {
        return undefined;
    }
    const line = lines[index];
    const inlineValue = line.slice(label.length).trim();
    return inlineValue || lines[index + 1];
}
export function findLineStarting(lines: string[], prefix: string): string | undefined {
    const target = prefix.toLowerCase();
    return lines.find((line) => line.toLowerCase().startsWith(target));
}
export function firstMatch(lines: string[], pattern: RegExp): string | undefined {
    return lines.find((line) => pattern.test(line));
}
export function stripInfoPrefix(value?: string): string | undefined {
    return value?.replace(/^Info\s+/i, "").trim();
}
export function parseMoney(value?: string): number | undefined {
    if (!value) {
        return undefined;
    }
    return parseInteger(value.replace(/\.\d{2}\b/, ""));
}
export function parseInteger(value?: string): number | undefined {
    if (!value) {
        return undefined;
    }
    const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(parsed) ? parsed : undefined;
}
export function lotNumberFromCopartUrl(url: string): string | undefined {
    const match = url.match(/\/lot\/(\d+)/);
    return match?.[1];
}
export function lastNumericPathSegment(url: string): string | undefined {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).at(-1);
    return segment && /^\d+$/.test(segment) ? segment : undefined;
}
export function toNumber(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value.replace(/[^\d.]/g, ""));
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
export function toStringValue(value: unknown): string | undefined {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }
    if (typeof value === "number") {
        return String(value);
    }
    return undefined;
}
export function recordValue<T = unknown>(record: unknown, key: string): T | undefined {
    if (!isRecord(record)) {
        return undefined;
    }
    return record[key] as T | undefined;
}
export function isRecord(value: unknown): value is JsonRecord {
    return typeof value === "object" && value !== null;
}
export function uniqueImages(images: ExtractedImage[]): ExtractedImage[] {
    const seen = new Set<string>();
    return images.filter((image) => {
        if (seen.has(image.fullUrl)) {
            return false;
        }
        seen.add(image.fullUrl);
        return true;
    });
}
export function confidenceFromMissingFields(missingFields: string[]): ExtractionConfidence {
    if (missingFields.length === 0) {
        return ExtractionConfidence.High;
    }
    return missingFields.length <= 3 ? ExtractionConfidence.Medium : ExtractionConfidence.Low;
}
export function missingRequiredFields<TSnapshot extends Record<string, unknown>>(snapshot: TSnapshot, requiredFields: readonly string[]): string[] {
    return requiredFields.filter((field) => {
        const value = snapshot[field];
        return Array.isArray(value) ? value.length === 0 : value === undefined || value === "";
    });
}
