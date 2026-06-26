import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import Stripe from "stripe";
import { STRIPE_CLIENT } from "@/common/tokens";
import { SupabaseJwtGuard } from "@/modules/auth/supabase-jwt.guard";
import { AuthenticatedUser } from "@/modules/auth/types";
import { CurrentUser } from "@/modules/auth/current-user.decorator";
import { AppError } from "@/common/errors/app.error";
import { StripeWebhookService } from "./stripe-webhook.service";
import { StripePriceLookupKey, CreateCheckoutRequest } from "./types";
import {
  STRIPE_CHECKOUT_CANCEL_PATH,
  STRIPE_CHECKOUT_SUCCESS_PATH,
} from "./payments.constants";

@Controller("payments")
export class PaymentsController {
  constructor(
    @Inject(STRIPE_CLIENT) private readonly stripe: Stripe,
    private readonly config: ConfigService,
    private readonly webhookService: StripeWebhookService,
  ) {}

  
  @UseGuards(SupabaseJwtGuard)
  @Post("checkout")
  async createCheckout(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateCheckoutRequest,
  ): Promise<{ url: string }> {
    const { tier } = body;

    if (!(["starter", "buyer", "protected"] as const).includes(tier)) {
      throw new AppError(`Invalid tier: ${tier}`, 400, "INVALID_TIER");
    }

    const webUrl = this.config.get<string>("WEB_URL") ?? "http://localhost:3000";
    const lineItems = await this.buildLineItems(tier as StripePriceLookupKey);

    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      ...lineItems,
      metadata: {
        userId: user.id,
        tier,
      } satisfies Record<string, string>,
      success_url: `${webUrl}${STRIPE_CHECKOUT_SUCCESS_PATH}?tier=${tier}`,
      cancel_url: `${webUrl}${STRIPE_CHECKOUT_CANCEL_PATH}`,
      customer_email: user.email,
    });

    if (!session.url) {
      throw new AppError("Stripe did not return a checkout URL.", 502, "STRIPE_NO_URL");
    }

    return { url: session.url };
  }

  
  @Post("webhook")
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string,
  ): Promise<{ received: boolean }> {
    if (!req.rawBody) {
      throw new AppError("Missing raw body.", 400, "MISSING_RAW_BODY");
    }

    const event = this.webhookService.constructEvent(req.rawBody, signature);
    await this.webhookService.handleEvent(event);

    return { received: true };
  }

  
  private async buildLineItems(tier: StripePriceLookupKey) {
    const prices = await this.stripe.prices.list({
      lookup_keys: [tier],
      expand: ["data.product"],
    });

    const price = prices.data[0];

    if (!price) {
      throw new AppError(
        `No Stripe price found for lookup key "${tier}". Create it in the Stripe dashboard.`,
        500,
        "STRIPE_PRICE_NOT_FOUND",
      );
    }

    return {
      line_items: [{ price: price.id, quantity: 1 }],
    };
  }
}
