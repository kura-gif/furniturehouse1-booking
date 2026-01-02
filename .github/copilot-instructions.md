# GitHub Copilot instructions for this repo

Purpose: Give AI coding agents the minimal, actionable context to be immediately productive in this codebase.

---

## High-level architecture 🔧
- Framework: **Nuxt 3** (SSR + server API via `server/api/*`). See `nuxt.config.ts`.
- Frontend: Vue 3 + Tailwind (components under `components/` and pages under `pages/`).
- Backend: Nuxt Server API handlers in `server/api/` (file -> route mapping). Use `defineEventHandler`.
- Database & Auth: **Firebase** (Firestore + Firebase Auth). Server helpers in `server/utils/firebase-admin.ts`.
- Functions: Firebase Cloud Functions live in `functions/` (TS compiled with `tsc`).
- Payments: **Stripe** (server-side secret usage in `server/api/stripe/*.ts`, client in `plugins/stripe.client.ts`).
- Email: Nodemailer via Gmail (see `server/api/emails/*` and `plugins` usage).

---

## Key developer workflows & commands ⚙️
- Install deps: `npm install`
- Run dev server: `npm run dev` (local site uses SITE_URL `http://localhost:3001` by convention; see `.env.example` / `DEVELOPMENT.md`).
- Build & preview: `npm run build` && `npm run preview`
- Seed sample data: `npm run seed` (calls `scripts/seedSampleData.ts`), and `npm run seed:email-templates`.
- Firebase Functions (local): `cd functions && npm run serve` (runs `tsc` then `firebase emulators:start --only functions`).
- Deploy web: `vercel --prod` (see `DEPLOYMENT.md` and `VERCEL_SETUP.md`).
- Deploy Firestore rules/indexes: `firebase deploy --only firestore`.
- Deploy functions: `npm --prefix functions run deploy` or `firebase deploy --only functions` (firebase.json predeploy runs `npm --prefix "$RESOURCE_DIR" run build`).

---

## Project-specific conventions & patterns ✅
- API file naming: `server/api/<path>/<name>.<method>.ts` (e.g., `server/api/stripe/webhook.post.ts`) — the filename suffix (.get/.post/.put/.delete) maps to the HTTP method.
- Use helpers from `server/utils/*`:
  - `getFirestoreAdmin()` to access Firestore (handles credential init). See `server/utils/firebase-admin.ts`.
  - `validateInput(schema, data)` and Zod schemas in `server/utils/validation.ts` for request validation.
- Internal-only endpoints require an internal secret header: header `x-internal-secret` must equal `runtimeConfig.internalApiSecret`. Example: `server/api/emails/send-booking-confirmation.post.ts`.
- Stripe webhooks must use raw body and signature verification: read raw body via `readRawBody(event)` and verify using `stripe.webhooks.constructEvent(body, sig, config.stripeWebhookSecret)` (see `server/api/stripe/webhook.post.ts`). Do not apply typical CSRF protections to webhook endpoints; they are excluded in `nuxt.config.ts` csurf `excludedUrls`.
- Error handling pattern: throw `createError({ statusCode, message })` and many server handlers log errors to Firestore (`errorLogs`) for observability.
- Use `generateBookingReference()` and `generateSecureToken()` from `server/utils/firebase-admin.ts` when creating booking records.

---

## Environment / secret patterns 🔒
- Runtime config keys are in `nuxt.config.ts` under `runtimeConfig` (server-side) and `runtimeConfig.public` (exposed to client).
- Important env vars (discoverable in `README.md` and `.env.example`):
  - `FIREBASE_*` (API key, project id, storage bucket, etc.)
  - `FIREBASE_ADMIN_KEY` (Base64-encoded service account JSON, preferred in production)
  - `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL` (alternative for local/dev)
  - `GOOGLE_APPLICATION_CREDENTIALS` (path to JSON file)
  - `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
  - `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_REPLY_TO` (Gmail app password used by Nodemailer)
  - `INTERNAL_API_SECRET` (mapped to `runtimeConfig.internalApiSecret`) — used by internal APIs (header `x-internal-secret`).

Note: `server/utils/firebase-admin.ts` shows the three supported credential patterns; prefer `FIREBASE_ADMIN_KEY` for CI / production.

---

## Quick actionable examples (copy-paste friendly) ✂️
- Validate request with Zod:

```ts
const raw = await readBody(event)
const data = validateInput(createBookingSchema, raw)
```

- Internal API auth check:

```ts
const authHeader = getHeader(event, 'x-internal-secret')
if (!authHeader || authHeader !== useRuntimeConfig().internalApiSecret) throw createError({ statusCode: 403 })
```

- Stripe webhook raw verification:

```ts
const sig = getHeader(event, 'stripe-signature')
const body = await readRawBody(event)
stripe.webhooks.constructEvent(body, sig, config.stripeWebhookSecret)
```

- Get Firestore admin:

```ts
const db = getFirestoreAdmin()
await db.collection('bookings')... 
```

---

## Where to look for common changes / risks 🔎
- Payment flow: `server/api/stripe/*` (create, update, webhook) — high risk for regressions.
- Booking flow & validation: `server/api/bookings/*` and `server/utils/validation.ts`.
- Email templates and internals: `server/api/emails/*` and `scripts/seedEmailTemplates.ts`.
- Firebase Auth interactions & sample data: `scripts/seedSampleData.ts`.
- CSRF exclusions & security-related runtime values: `nuxt.config.ts` (csurf config), `.env.example`, and `VERCEL_SETUP.md`.

---

If anything here is unclear or you'd like more examples (e.g., typical PR changes for adding a new API endpoint or adding a new env var), tell me which section to expand and I’ll iterate. 🙏
