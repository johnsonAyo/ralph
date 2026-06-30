import { Controller, Post, Body, Headers, UnauthorizedException, HttpCode, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "../email/email.service";

interface SupabaseWebhookPayload {
    type: "INSERT" | "UPDATE" | "DELETE";
    table: string;
    schema: string;
    record: {
        id?: string;
        email?: string;
        [key: string]: any;
    };
    old_record: any;
}

@Controller("webhooks/supabase")
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly emailService: EmailService,
    ) {}

    @Post("user-created")
    @HttpCode(200)
    async handleUserCreated(
        @Headers("authorization") authorization: string,
        @Body() payload: SupabaseWebhookPayload,
    ) {
        // 1. Verify Secret
        const secret = this.configService.get<string>("SUPABASE_WEBHOOK_SECRET");
        if (secret) {
            const token = authorization?.replace("Bearer ", "")?.trim();
            if (token !== secret) {
                this.logger.warn("Invalid webhook secret received.");
                throw new UnauthorizedException("Invalid webhook secret");
            }
        } else {
            this.logger.warn("SUPABASE_WEBHOOK_SECRET is not configured; skipping verification.");
        }

        // 2. Validate Payload
        if (payload.type !== "INSERT" || payload.table !== "users" || payload.schema !== "auth") {
            this.logger.warn("Received unexpected webhook payload. Ignoring.");
            return { received: true };
        }

        const email = payload.record.email;
        if (!email) {
            this.logger.error("User created without an email address in the payload.");
            return { received: true };
        }

        this.logger.log(`New user signed up: ${email}. Sending welcome email.`);
        await this.emailService.sendWelcomeEmail(email);

        return { success: true };
    }
}
