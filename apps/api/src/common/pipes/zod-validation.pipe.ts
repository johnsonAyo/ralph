import { Injectable, PipeTransform } from "@nestjs/common";
import { ZodTypeAny, z } from "zod";
import { ValidationError } from "@/common/errors/app.error";
@Injectable()
export class ZodValidationPipe<TSchema extends ZodTypeAny> implements PipeTransform<unknown, z.output<TSchema>> {
    constructor(private readonly schema: TSchema) { }
    transform(value: unknown): z.output<TSchema> {
        const parsed = this.schema.safeParse(value);
        if (!parsed.success) {
            const issues = parsed.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
                code: issue.code,
            }));
            throw new ValidationError("Request validation failed.", issues);
        }
        return parsed.data;
    }
}
