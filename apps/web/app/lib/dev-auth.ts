/**
 * Dev-only auth bypass. When enabled, the proxy, dashboard layout, and the
 * global AuthGate all skip their redirect/guard logic so authenticated
 * surfaces can be viewed without a session.
 *
 * Single source of truth for the flag. Guarded by NODE_ENV so it can never
 * disable auth in production, even if the public flag is accidentally set.
 *
 * Enable locally with `NEXT_PUBLIC_DISABLE_AUTH_FOR_DEV=true` in
 * `apps/web/.env.local`.
 */
export function isDevAuthBypassEnabled(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DISABLE_AUTH_FOR_DEV === "true"
  );
}
