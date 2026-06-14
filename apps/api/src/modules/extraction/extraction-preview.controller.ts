import { Body, Controller, Inject, Post } from "@nestjs/common";
import { LISTING_EXTRACTOR } from "@/common/tokens";
import { ListingExtractorPort } from "./domain/listing-extractor.port";
import {
  ExtractPreviewRequest,
  extractPreviewRequestSchema,
} from "./application/dto/extract-preview.dto";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";


@Controller("extraction")
export class ExtractionPreviewController {
  constructor(
    @Inject(LISTING_EXTRACTOR) private readonly extractor: ListingExtractorPort,
  ) {}

  @Post("preview")
  async preview(
    @Body(new ZodValidationPipe(extractPreviewRequestSchema))
    body: ExtractPreviewRequest,
  ) {
    return this.extractor.extract(body.listingUrl);
  }
}
