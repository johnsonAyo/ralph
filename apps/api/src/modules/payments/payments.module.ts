import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import { STRIPE_CLIENT } from "@/common/tokens";
import { PaymentsController } from "./payments.controller";
import { StripeWebhookService } from "./stripe-webhook.service";

@Module({
  controllers: [PaymentsController],
  providers: [
    {
      provide: STRIPE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Stripe => {
        const secretKey = config.get<string>("STRIPE_SECRET_KEY");

        if (!secretKey) {
          
          
          return new Stripe("sk_test_placeholder");
        }

        return new Stripe(secretKey);
      },
    },
    StripeWebhookService,
  ],
})
export class PaymentsModule {}
