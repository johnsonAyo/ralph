import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import { getWelcomeEmailHtml } from "./templates/welcome";
import { getPurchaseReceiptHtml } from "./templates/receipt";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly resend: Resend | null = null;
    private readonly senderEmail = "hello@askralph.co.uk";

    constructor(private readonly configService: ConfigService) {
        const apiKey = this.configService.get<string>("RESEND_API_KEY");
        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            this.logger.warn("RESEND_API_KEY is not set. Emails will not be sent.");
        }
    }

    async sendWelcomeEmail(toEmail: string): Promise<void> {
        if (!this.resend) {
            this.logger.warn(`Would have sent welcome email to ${toEmail}, but RESEND_API_KEY is missing.`);
            return;
        }

        try {
            await this.resend.emails.send({
                from: `Ask Ralph <${this.senderEmail}>`,
                to: toEmail,
                subject: "Welcome to Ask Ralph \uD83D\uDC4B",
                html: getWelcomeEmailHtml(),
            });
            this.logger.log(`Welcome email sent to ${toEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${toEmail}`, error);
        }
    }

    async sendPurchaseReceiptEmail(toEmail: string, credits: number, tierName: string): Promise<void> {
        if (!this.resend) {
            this.logger.warn(`Would have sent receipt to ${toEmail}, but RESEND_API_KEY is missing.`);
            return;
        }

        try {
            await this.resend.emails.send({
                from: `Ask Ralph <${this.senderEmail}>`,
                to: toEmail,
                subject: `Your ${credits} credits have been added! \uD83C\uDF89`,
                html: getPurchaseReceiptHtml(credits, tierName),
            });
            this.logger.log(`Purchase receipt email sent to ${toEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send purchase receipt to ${toEmail}`, error);
        }
    }
}
