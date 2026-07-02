import { CanActivate, ExecutionContext, Inject, Injectable, } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ADMIN } from "@/modules/supabase/supabase.module";
import { UnauthorizedError } from "@/common/errors/app.error";
import { AuthenticatedUser } from "./types";
export { AuthenticatedUser };
@Injectable()
export class SupabaseJwtGuard implements CanActivate {
    constructor(
    @Inject(SUPABASE_ADMIN)
    private readonly supabase: SupabaseClient) { }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<{
            headers: Record<string, string | undefined>;
            user?: AuthenticatedUser;
        }>();
        // TEMP DEV-ONLY BYPASS — remove after local testing. Guarded by NODE_ENV
        // so it can never authenticate in production even if the flag leaks.
        if (process.env.NODE_ENV !== "production" && process.env.DISABLE_AUTH_FOR_DEV === "true") {
            request.user = {
                id: "00000000-0000-4000-8000-000000000001",
                email: "dev@local.test",
            };
            return true;
        }
        const authHeader = request.headers.authorization;
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!token) {
            throw new UnauthorizedError("Missing Supabase access token.");
        }
        const { data, error } = await this.supabase.auth.getUser(token);
        if (error || !data.user) {
            throw new UnauthorizedError("Invalid Supabase access token.");
        }
        request.user = {
            id: data.user.id,
            email: data.user.email ?? undefined,
        };
        return true;
    }
}
