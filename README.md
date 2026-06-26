# Auction Car Risk Checker

names.co.uk

Monorepo for the Auction Car Risk Checker product.

## Apps

- `apps/web`: Next.js landing page and future user app.
- `apps/api`: NestJS backend for Supabase Auth, report creation, extraction, credits, and Ralph AI analysis.
- `packages/shared`: Shared Zod schemas and TypeScript types.

## Commands

```bash
npm run dev:web
npm run dev:api
npm run build
```

## Backend

Copy `apps/api/.env.example` to `apps/api/.env` and fill Supabase/OpenAI values. Apply `apps/api/supabase/schema.sql` in Supabase SQL editor before using the report endpoints.

## Web

Copy `apps/web/.env.example` to `apps/web/.env.local` and set the Supabase public URL and anon key. Ralph's browser session uses Supabase Auth directly, while the API validates the access token on protected report routes.
