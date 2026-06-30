import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { EmailModule } from "../email/email.module";

@Module({
    imports: [EmailModule],
    controllers: [WebhooksController],
})
export class WebhooksModule {}
