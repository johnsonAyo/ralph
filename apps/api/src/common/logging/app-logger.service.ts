import { Injectable, LoggerService, ConsoleLogger } from "@nestjs/common";
const ENV_PRODUCTION = "production";
@Injectable()
export class AppLoggerService extends ConsoleLogger implements LoggerService {
    private readonly isProduction = process.env.NODE_ENV === ENV_PRODUCTION;
    log(message: unknown, context?: string) {
        if (this.isProduction) {
            this.printJson("info", message, context);
        }
        else {
            super.log(message, context);
        }
    }
    error(message: unknown, stack?: string, context?: string) {
        if (this.isProduction) {
            this.printJson("error", message, context, stack);
        }
        else {
            super.error(message, stack, context);
        }
    }
    warn(message: unknown, context?: string) {
        if (this.isProduction) {
            this.printJson("warn", message, context);
        }
        else {
            super.warn(message, context);
        }
    }
    debug(message: unknown, context?: string) {
        if (this.isProduction) {
            this.printJson("debug", message, context);
        }
        else {
            super.debug(message, context);
        }
    }
    verbose(message: unknown, context?: string) {
        if (this.isProduction) {
            this.printJson("verbose", message, context);
        }
        else {
            super.verbose(message, context);
        }
    }
    private printJson(level: string, message: unknown, context?: string, stack?: string) {
        let serializedMessage: unknown;
        if (message instanceof Error) {
            serializedMessage = { name: message.name, message: message.message, stack: message.stack };
        } else if (typeof message === "object" && message !== null) {
            serializedMessage = message;
        } else {
            serializedMessage = String(message);
        }
        const logObject = {
            timestamp: new Date().toISOString(),
            level,
            context: context || "Application",
            message: serializedMessage,
            ...(stack ? { stack } : {}),
        };
        if (level === "error") {
            process.stderr.write(JSON.stringify(logObject) + "\n");
        }
        else {
            process.stdout.write(JSON.stringify(logObject) + "\n");
        }
    }
}
