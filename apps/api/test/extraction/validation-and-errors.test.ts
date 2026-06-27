import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import { ZodValidationPipe } from "@/common/pipes/zod-validation.pipe";
import { ValidationError } from "@/common/errors/app.error";
test("ZodValidationPipe throws ValidationError on invalid inputs", () => {
    const schema = z.object({
        name: z.string().min(3),
        age: z.number().int().positive(),
    });
    const pipe = new ZodValidationPipe(schema);
    const validInput = { name: "Alice", age: 30 };
    const result = pipe.transform(validInput);
    assert.deepEqual(result, validInput);
    const invalidInput = { name: "Al", age: -5 };
    assert.throws(() => pipe.transform(invalidInput), (err: any) => {
        assert(err instanceof ValidationError);
        assert.equal(err.statusCode, 400);
        assert.equal(err.code, "VALIDATION_ERROR");
        assert.equal(err.message, "Request validation failed.");
        assert(Array.isArray(err.details));
        assert.equal(err.details.length, 2);
        return true;
    });
});
