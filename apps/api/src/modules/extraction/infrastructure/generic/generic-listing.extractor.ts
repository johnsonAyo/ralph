import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { z } from "zod";
import { AuctionPlatformCode, ListingSnapshot } from "@ralph/shared";
import { AppError } from "@/common/errors/app.error";
import { OPENAI_CLIENT } from "@/common/tokens";
import { detectPlatform } from "@/modules/extraction/application/detect-platform";
import { PlatformListingExtractor } from "@/modules/extraction/domain/interfaces/platform-listing-extractor.interface";
import { ScrapeClient } from "@/modules/extraction/infrastructure/scrape/scrape.client";
import { genericExtractionSchema } from "./generic-extraction.schema";
import { buildGenericListingSnapshot } from "./generic-snapshot.mapper";
import { reduceListingPage } from "./html-reducer";

const EXTRACTION_MODEL_FALLBACK = "gpt-4.1-mini";
const EXTRACTION_OLLAMA_MODEL_FALLBACK = "llama3.2";
const EXTRACTION_MAX_OUTPUT_TOKENS = 1200;
const EXTRACTION_RESPONSE_NAME = "listing_extraction";

const EXTRACTION_INSTRUCTIONS = [
    "You extract structured data from a UK vehicle auction / salvage listing page.",
    "You are given the page's visible text and a list of candidate image URLs.",
    "Return ONLY data supported by the page. Use null for any field you cannot determine — never guess.",
    "mileage is an integer with no units; mileageUnit is 'MI' or 'KM'.",
    "Money fields are plain numbers with no currency symbol; currency is an ISO code (default 'GBP').",
    "saleDate should be ISO 8601 if a date/time is present, otherwise the raw text, otherwise null.",
    "For imageUrls: pick ONLY actual photographs of THIS vehicle from the candidate list, in display order.",
    "Exclude logos, banners, icons, flags, placeholder/stock images, and anything that is not a photo of the car.",
    "Only return image URLs that appear verbatim in the candidate list.",
].join(" ");

/**
 * Site-agnostic extractor: render the page, reduce it to text + image candidates,
 * then let the LLM map it onto the listing schema. This is the default for every
 * platform that does not need bespoke handling (i.e. everything except Copart's
 * WAF-gated gallery). Adding a new auction site needs zero code here.
 */
@Injectable()
export class GenericListingExtractor implements PlatformListingExtractor {
    // Sentinel: this extractor handles many platforms; the real platform is
    // re-detected per URL so the snapshot is labelled correctly.
    readonly platform = AuctionPlatformCode.Other;
    private readonly logger = new Logger(GenericListingExtractor.name);

    constructor(
        private readonly scrapeClient: ScrapeClient,
        @Inject(OPENAI_CLIENT) private readonly openai: OpenAI | null,
        private readonly config: ConfigService,
    ) { }

    async extract(listingUrl: string): Promise<ListingSnapshot> {
        const platform = detectPlatform(listingUrl);
        try {
            const html = await this.scrapeClient.fetchHtml(listingUrl, { renderJs: true, residential: true });
            const { text, imageCandidates } = reduceListingPage(html, listingUrl);
            this.logger.log(`Generic extract ${platform}: ${text.length} text chars, ${imageCandidates.length} image candidates.`);

            const extraction = await this.runExtraction(listingUrl, text, imageCandidates);

            return buildGenericListingSnapshot({ platform, listingUrl, extraction, imageCandidates });
        } catch (error) {
            this.logger.error(`Generic extraction failed for ${listingUrl}: ${error}`);
            throw error;
        }
    }

    private async runExtraction(listingUrl: string, pageText: string, imageCandidates: string[]) {
        const hasOllama = Boolean(this.config.get<string>("OLLAMA_URL"));
        
        if (hasOllama) {
            try {
                return await this.runOllamaExtraction(listingUrl, pageText, imageCandidates);
            } catch (err) {
                this.logger.warn(`Ollama generic extraction failed, falling back to OpenAI: ${err}`);
            }
        }

        return await this.runOpenAiExtraction(listingUrl, pageText, imageCandidates);
    }

    private async runOllamaExtraction(listingUrl: string, pageText: string, imageCandidates: string[]) {
        const ollamaUrl = this.config.getOrThrow<string>("OLLAMA_URL").replace(/\/$/, "");
        const apiKey = this.config.get<string>("OLLAMA_API_KEY");
        const model = this.config.get<string>("OLLAMA_MODEL") ?? EXTRACTION_OLLAMA_MODEL_FALLBACK;
        const jsonSchema = z.toJSONSchema(genericExtractionSchema) as Record<string, unknown>;
        const userPayload = JSON.stringify({ listingUrl, pageText, imageCandidates }, null, 2);

        const response = await fetch(`${ollamaUrl}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({
                model,
                stream: false,
                format: jsonSchema,
                messages: [
                    { role: "system", content: EXTRACTION_INSTRUCTIONS },
                    { role: "user", content: userPayload },
                ],
                options: {
                    num_predict: EXTRACTION_MAX_OUTPUT_TOKENS,
                    temperature: 0.1,
                },
            }),
        });

        if (!response.ok) {
            const bodyText = await response.text().catch(() => "");
            throw new AppError(`Ollama returned ${response.status} for extraction.`, 502, "OLLAMA_EXTRACTION_FAILED", bodyText.slice(0, 500));
        }

        const payload = (await response.json()) as any;
        const text = payload.message?.content;
        
        if (!text) {
            throw new AppError("Ollama returned an empty extraction response.", 502, "OLLAMA_EMPTY_RESPONSE");
        }

        try {
            return genericExtractionSchema.parse(JSON.parse(text));
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new AppError("Ollama returned malformed JSON for listing extraction.", 502, "OLLAMA_INVALID_JSON", error.message);
            }
            throw new AppError("Ollama returned a payload that did not match the extraction schema.", 502, "OLLAMA_INVALID_SCHEMA", error instanceof Error ? error.message : String(error));
        }
    }

    private async runOpenAiExtraction(listingUrl: string, pageText: string, imageCandidates: string[]) {
        if (!this.openai) {
            throw new AppError("OpenAI listing extraction is not configured. Set OPENAI_API_KEY in apps/api/.env.", 500, "OPENAI_NOT_CONFIGURED");
        }
        const model = this.config.get<string>("OPENAI_EXTRACTION_MODEL")
            ?? this.config.get<string>("OPENAI_MODEL")
            ?? EXTRACTION_MODEL_FALLBACK;
        const jsonSchema = z.toJSONSchema(genericExtractionSchema) as Record<string, unknown>;
        const userPayload = JSON.stringify({ listingUrl, pageText, imageCandidates }, null, 2);

        try {
            const response = await this.openai.responses.create({
                model,
                instructions: EXTRACTION_INSTRUCTIONS,
                input: [{ role: "user", content: [{ type: "input_text", text: userPayload }] }],
                text: {
                    format: {
                        type: "json_schema",
                        name: EXTRACTION_RESPONSE_NAME,
                        schema: jsonSchema,
                        strict: true,
                        description: "Structured fields and selected vehicle photos from a UK auction listing.",
                    },
                },
                max_output_tokens: EXTRACTION_MAX_OUTPUT_TOKENS,
            });
            if (!response.output_text) {
                throw new AppError("LLM returned an empty extraction response.", 502, "EXTRACTION_EMPTY_RESPONSE");
            }
            return genericExtractionSchema.parse(JSON.parse(response.output_text));
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new AppError("LLM returned malformed JSON for listing extraction.", 502, "EXTRACTION_INVALID_JSON", error.message);
            }
            if (error instanceof AppError) {
                throw error;
            }
            const message = error instanceof Error ? error.message : "Unknown extraction error.";
            console.error("OpenAI Extraction Error:", error);
            throw new AppError("Unable to extract the listing.", 502, "EXTRACTION_FAILED", message);
        }
    }
}
