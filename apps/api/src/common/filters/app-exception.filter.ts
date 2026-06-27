import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger, } from "@nestjs/common";
import { AppError } from "@/common/errors/app.error";
const DEFAULT_ERROR_STATUS = HttpStatus.INTERNAL_SERVER_ERROR;
const DEFAULT_ERROR_CODE = "INTERNAL_SERVER_ERROR";
const DEFAULT_ERROR_MESSAGE = "An unexpected error occurred.";
interface NestResponse {
    status(statusCode: number): {
        json(data: unknown): void;
    };
}
interface NestRequest {
    method: string;
    url: string;
}
@Catch()
export class AppExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(AppExceptionFilter.name);
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<NestResponse>();
        const request = ctx.getRequest<NestRequest>();
        let statusCode = DEFAULT_ERROR_STATUS;
        let errorCode = DEFAULT_ERROR_CODE;
        let message = DEFAULT_ERROR_MESSAGE;
        let details: unknown = undefined;
        if (exception instanceof AppError) {
            statusCode = exception.statusCode;
            errorCode = exception.code;
            message = exception.message;
            details = exception.details;
            this.logger.warn(`[${request.method}] ${request.url} - ${errorCode} (${statusCode}): ${message}`);
        }
        else if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const responseBody = exception.getResponse();
            if (typeof responseBody === "object" && responseBody !== null) {
                const bodyObj = responseBody as Record<string, unknown>;
                message = typeof bodyObj.message === "string"
                    ? bodyObj.message
                    : (Array.isArray(bodyObj.message) ? bodyObj.message.join(", ") : exception.message);
                errorCode = typeof bodyObj.error === "string"
                    ? bodyObj.error.toUpperCase().replace(/\s+/g, "_")
                    : "HTTP_EXCEPTION";
                details = bodyObj;
            }
            else {
                message = exception.message;
                errorCode = "HTTP_EXCEPTION";
            }
            this.logger.warn(`[${request.method}] ${request.url} - ${errorCode} (${statusCode}): ${message}`);
        }
        else {
            const err = exception as Error;
            message = err.message || DEFAULT_ERROR_MESSAGE;
            this.logger.error(`[${request.method}] ${request.url} - Unhandled Exception: ${message}`, err.stack);
            const isProd = process.env.NODE_ENV === "production";
            if (isProd) {
                message = DEFAULT_ERROR_MESSAGE;
            }
        }
        response.status(statusCode).json({
            statusCode,
            errorCode,
            message,
            path: request.url,
            timestamp: new Date().toISOString(),
            ...(details ? { details } : {}),
        });
    }
}
