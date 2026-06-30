import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN } from "@/modules/supabase/supabase.module";
import { STRIPE_CLIENT } from "@/common/tokens";
import { AppError } from "@/common/errors/app.error";
import { CREDIT_TOPUP_EVENT_TYPE, CREDITS_BY_TIER } from "./payments.constants";
import { CheckoutSessionMetadata } from "./types";
import { EmailService } from "@/modules/email/email.service";
@Injectable()
export class StripeWebhookService {
    constructor(
    @Inject(STRIPE_CLIENT)
    private readonly stripe: Stripe, 
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient, 
    private readonly config: ConfigService,
    private readonly emailService: EmailService) { }
    constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
        const webhookSecret = this.config.getOrThrow<string>("STRIPE_WEBHOOK_SECRET");
        try {
            return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
        }
        catch {
            throw new AppError("Invalid Stripe webhook signature.", 400, "STRIPE_WEBHOOK_INVALID_SIGNATURE");
        }
    }
    async handleEvent(event: Stripe.Event): Promise<void> {
        if (event.type === "checkout.session.completed") {
            await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        }
    }
    private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        const metadata = session.metadata as CheckoutSessionMetadata | null;
        if (!metadata?.userId || !metadata?.tier) {
            throw new AppError("Stripe session missing userId or tier metadata.", 400, "STRIPE_MISSING_METADATA");
        }
        const credits = CREDITS_BY_TIER[metadata.tier];
        if (!credits) {
            throw new AppError(`Unknown Stripe tier in metadata: ${metadata.tier}`, 400, "STRIPE_UNKNOWN_TIER");
        }
        const { error } = await this.supabase.from("credits_ledger").insert({
            user_id: metadata.userId,
            event_type: CREDIT_TOPUP_EVENT_TYPE,
            amount: credits,
            metadata: {
                source: "stripe_checkout",
                tier: metadata.tier,
                stripeSessionId: session.id,
            },
        });
        if (error) {
            throw new AppError("Failed to top-up credits after Stripe payment.", 500, "CREDITS_TOPUP_FAILED", error.message);
        }

        // Try to fetch the user's email to send a receipt
        let userEmail = session.customer_details?.email;
        if (!userEmail) {
            const { data: userData } = await this.supabase.auth.admin.getUserById(metadata.userId);
            userEmail = userData.user?.email;
        }

        if (userEmail) {
            await this.emailService.sendPurchaseReceiptEmail(userEmail, credits, metadata.tier);
        }
    }
}
