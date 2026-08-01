# Antonic Full-Stack Website

Production-ready full-stack website for the Antonic creator brand.

## Technology Stack
- Next.js (App Router)
- React, TypeScript, Tailwind CSS
- PostgreSQL & Prisma ORM
- Auth.js
- Vitest & Playwright

## Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/antonic?schema=public"
AUTH_SECRET="generate-a-secure-secret-here"

ADMIN_INITIAL_EMAIL="admin@antonic.ca"
ADMIN_INITIAL_PASSWORD="AdminPassword123!"

FOURTHWALL_STORE_URL="https://antonic.fourthwall.com"
NEXT_PUBLIC_SITE_URL="https://antonic.ca"

STORAGE_PROVIDER="local" # or 's3' in production
ANALYTICS_RETENTION_DAYS="30"
```

## Setup & Development
1. **Install dependencies:**
   `npm install`
2. **Setup Database:**
   Ensure PostgreSQL is running.
   `npx prisma db push` (or `npx prisma migrate dev` when using migrations)
3. **Seed Database:**
   `npx ts-node prisma/seed.ts`
4. **Run Development Server:**
   `npm run dev`

## Deployment
1. **Vercel**: Connect the GitHub repository to Vercel. Ensure all environment variables are set in the Vercel dashboard.
2. **Database**: Use a managed PostgreSQL provider (e.g. Supabase, Vercel Postgres, Neon) and set the `DATABASE_URL`.
3. **Domain & DNS (Cloudflare)**:
   - Map `antonic.ca` to Vercel via A/CNAME records in Cloudflare.
   - For `/store`, the current setup uses a Next.js `NextResponse.redirect`. Long-term, you can set up a Cloudflare Worker or Page Rule to redirect `/store` directly to Fourthwall for better performance.
4. **Domain Migration Notes**:
   - For `antonic.store` and `antoniccommands.info`, you can set up 301 redirects in Cloudflare pointing them to `https://antonic.ca/store` and `https://antonic.ca/commands`.

## Testing
- **Unit Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npx playwright test` (Playwright)
