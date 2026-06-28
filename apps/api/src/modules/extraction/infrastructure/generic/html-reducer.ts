import * as cheerio from "cheerio";
import { isRecord } from "@/modules/extraction/infrastructure/shared/parsing.utils";

/**
 * URL fragments that mark an image as site chrome rather than a vehicle photo
 * (logos, icons, flags, lazy-load placeholders, sprites, tracking pixels...).
 * Generic on purpose — works across auction sites we have never seen.
 */
const CHROME_IMAGE_PATTERNS: RegExp[] = [
    /\/assets\//i,
    /\/templates\//i,
    /\/static\//i,
    /\/theme/i,
    /logo/i,
    /favicon/i,
    /\/flags?\//i,
    /sprite/i,
    /icon/i,
    /placeholder/i,
    /avatar/i,
    /banner/i,
    /img-\d+x\d+/i,
    /\d+x\d+\.(?:jpe?g|png|webp)$/i,
    /1x1|pixel|spacer|blank/i,
    /loading|spinner/i,
];

const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp)(?:[?#].*)?$/i;
const MAX_TEXT_CHARS = 16000;
const MAX_IMAGE_CANDIDATES = 60;

export interface ReducedListingPage {
    /** Cleaned, flattened page text for the LLM (scripts/styles/chrome removed). */
    text: string;
    /** De-duplicated, chrome-filtered absolute image URLs the LLM can pick from. */
    imageCandidates: string[];
}

function absolutize(raw: string | undefined, base: string): string | undefined {
    if (!raw) {
        return undefined;
    }
    const value = raw.trim();
    if (!value || value.startsWith("data:")) {
        return undefined;
    }
    try {
        return new URL(value, base).href;
    } catch {
        return undefined;
    }
}

function isLikelyPhoto(url: string): boolean {
    if (!IMAGE_EXTENSION.test(url)) {
        return false;
    }
    return !CHROME_IMAGE_PATTERNS.some((pattern) => pattern.test(url));
}

/** Walks arbitrary JSON-LD looking for schema.org image URLs. */
function collectJsonLdImages(node: unknown, add: (raw?: string) => void): void {
    if (typeof node === "string") {
        if (IMAGE_EXTENSION.test(node)) {
            add(node);
        }
        return;
    }
    if (Array.isArray(node)) {
        node.forEach((child) => collectJsonLdImages(child, add));
        return;
    }
    if (isRecord(node)) {
        for (const [key, value] of Object.entries(node)) {
            if (key === "image" || key === "thumbnailUrl" || key === "contentUrl") {
                collectJsonLdImages(value, add);
            } else if (isRecord(value) || Array.isArray(value)) {
                collectJsonLdImages(value, add);
            }
        }
    }
}

/**
 * Turns a rendered listing page into the two things the LLM needs: clean text
 * and a candidate set of vehicle-photo URLs. Site-agnostic — no per-platform
 * selectors. The LLM makes the final photo selection from imageCandidates.
 */
export function reduceListingPage(html: string, listingUrl: string): ReducedListingPage {
    const $ = cheerio.load(html);
    const candidates = new Set<string>();
    const add = (raw?: string) => {
        const url = absolutize(raw, listingUrl);
        if (url && isLikelyPhoto(url)) {
            candidates.add(url);
        }
    };

    // <img> in all its lazy-loaded disguises.
    $("img").each((_, el) => {
        const $el = $(el);
        add($el.attr("src"));
        add($el.attr("data-src"));
        add($el.attr("data-lazy"));
        add($el.attr("data-original"));
        const srcset = $el.attr("srcset") ?? $el.attr("data-srcset");
        srcset?.split(",").forEach((part) => add(part.trim().split(/\s+/)[0]));
    });
    $("source[srcset], source[data-srcset]").each((_, el) => {
        const srcset = $(el).attr("srcset") ?? $(el).attr("data-srcset");
        srcset?.split(",").forEach((part) => add(part.trim().split(/\s+/)[0]));
    });

    // Social + structured-data images.
    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => add($(el).attr("content")));
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            collectJsonLdImages(JSON.parse($(el).text() || "{}"), add);
        } catch {
            /* ignore malformed JSON-LD */
        }
    });

    // Raw sweep catches CSS background-image and URLs buried in JSON blobs.
    for (const match of html.matchAll(/https?:\/\/[^\s"'<>\\)]+\.(?:jpe?g|png|webp)/gi)) {
        add(match[0]);
    }

    // Now strip everything non-textual and flatten to readable lines for the LLM.
    $("script, style, noscript, svg, header nav, footer, iframe").remove();
    const text = $("body").text()
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n")
        .trim()
        .slice(0, MAX_TEXT_CHARS);

    return {
        text,
        imageCandidates: [...candidates].slice(0, MAX_IMAGE_CANDIDATES),
    };
}
