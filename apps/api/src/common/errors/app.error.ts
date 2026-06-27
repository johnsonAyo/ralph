const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
export class AppError extends Error {
    constructor(public readonly message: string, public readonly statusCode: number = HTTP_STATUS_INTERNAL_SERVER_ERROR, public readonly code: string = "INTERNAL_SERVER_ERROR", public readonly details?: unknown) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
export class ValidationError extends AppError {
    constructor(message: string, details?: unknown) {
        super(message, HTTP_STATUS_BAD_REQUEST, "VALIDATION_ERROR", details);
    }
}
export class DomainError extends AppError {
    constructor(message: string, code = "DOMAIN_ERROR", details?: unknown) {
        super(message, HTTP_STATUS_BAD_REQUEST, code, details);
    }
}
export class UnauthorizedError extends AppError {
    constructor(message: string = "Unauthorized access.") {
        super(message, HTTP_STATUS_UNAUTHORIZED, "UNAUTHORIZED");
    }
}
export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found.") {
        super(message, HTTP_STATUS_NOT_FOUND, "NOT_FOUND");
    }
}
