# Reado

A minimalist, black-and-white highlight reader. Import your book highlights
(Kindle `My Clippings.txt`, CSV exports, or the REST API), review a random
handful every day, and get an email digest on a schedule.

---

## 1. Tech stack

| Layer         | What it is                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| Framework     | **Next.js (App Router)** — React 19, server components, server actions           |
| Build tool    | **Turbopack** (bundled with Next.js)                                             |
| Routing       | **Next.js App Router** (file-based, `app/`)                                      |
| Data fetching | Tiny dependency-free client cache (`src/lib/data.tsx`)           |
| Auth          | **Clerk** (`@clerk/nextjs`) — email/password + social sign-in, middleware guard  |
| Styling       | **Tailwind CSS v4** (config-less; tokens live in `src/styles.css`)               |
| UI primitives | shadcn-style components in `src/components/ui`, `sonner` for toasts              |
| Database      | **PostgreSQL** (Supabase) with Row Level Security                                |
| Backend logic | Server actions acting as an internal RPC layer + route handlers under `app/api/` |
| Book metadata | Open Library search API → Google Books API fallback (both keyless)               |
| Email         | Server-rendered HTML digest, sent through the configured mail provider           |
| Deploy target | Vercel by default; any Node host or Docker container works (`next start`)        |

There is no separate Express/FastAPI process: Next.js _is_ the server. Anything
that would be an Express route is either an app-internal server action (the RPC
layer in `src/lib/rpc.ts`) or a route handler under `app/api/`. Route protection
runs in `src/middleware.ts` via Clerk's middleware.

---

## 2. Folder architecture

```text
app/                          # App Router routes (URL == folder path)
  layout.tsx                  # root shell: fonts, ClerkProvider, query client, Toaster
  page.tsx                    # "/"           Daily Review feed
  books/page.tsx              # "/books"      cover grid of every book
  book/[bookId]/page.tsx      # "/book/:id"   one book: cover, author, highlights
  highlights/page.tsx         # "/highlights" searchable archive grouped by book
  import/page.tsx             # "/import"     Kindle/CSV upload + paste
  read/[documentId]/page.tsx  # "/read/:id"   distraction-free reader
  settings/page.tsx           # "/settings"   digest schedule, API key, typography
  auth/page.tsx               # "/auth"       sign in / sign up
  api/public/highlights/route.ts    # POST /api/public/highlights   (X-API-Key intake)
  api/public/hooks/digest/route.ts  # POST /api/public/hooks/digest (cron target)
  api/public/checkout/route.ts      # POST /api/public/checkout     (billing)
src/
  middleware.ts               # Clerk auth middleware (protects app routes)
  lib/
    focus.functions.ts        # ALL authenticated server functions (RPC layer)
    clerk.functions.ts        # profile sync / billing server functions
    rpc.ts + rpc.actions.ts   # RPC transport: one server action, named handlers
    next-server-fn.ts         # client bridge, typed like the old createServerFn
    book-metadata.server.ts   # Open Library + Google Books lookup (server only)
    digest.server.ts          # picks highlights, renders the digest email
    parse-highlights.ts       # Kindle "My Clippings.txt" + CSV parser (pure)
  components/
    AppShell.tsx              # header, nav, measured column
    BookCover.tsx             # cover image with typographic fallback
    TypeControls.tsx          # font size / line height / measure / theme
    RequireAuth.tsx           # client-side auth gate
  hooks/
    useAuth.tsx               # Clerk session context
    useReaderPrefs.tsx        # typography + theme, persisted to localStorage
  integrations/supabase/      # browser client, admin client, generated types
  styles.css                  # design tokens (monochrome themes) + utilities
supabase/migrations/          # SQL schema history
```

---

## 3. Database schema

All tables live in `public`, all have RLS enabled, and every policy scopes rows
to `auth.uid()`.

- **profiles** — one row per user: `digest_frequency`, `digest_hour`, `api_key`,
  typography defaults.
- **documents** — saved reading material: `title`, `author`, `content`,
  `progress`.
- **highlights** — `text`, `note`, `book_title`, `author`, `location`,
  `highlighted_at`, `document_id`, `book_id`.
- **books** — cached metadata per `(user_id, title, author)`: `cover_url`,
  `open_library_key`, `published_year`, `description`, `subjects`,
  `match_source`, `matched_at`.

A trigger (`on_auth_user_created`) seeds new accounts with a profile, a sample
document, and a couple of highlights.

To recreate the schema elsewhere, apply everything in `supabase/migrations/`
in filename order:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

---

## 4. Environment variables

Client-visible (must use the `NEXT_PUBLIC_` prefix):

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<pk_...>
```

Server-only (never prefixed, read on the server):

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
CLERK_SECRET_KEY=<sk_...>
CRON_SECRET=<random string; required by the digest hook>
POLAR_ACCESS_TOKEN=<billing, if you use checkout>
NEXT_PUBLIC_APP_URL=https://yourdomain
```

Book metadata needs **no** keys — Open Library and Google Books are called
anonymously.

---

## 5. Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production bundle
npm run start      # serve the build
```

Deploy paths:

- **Vercel** (default target): push the repo, add the variables from section 4,
  deploy — zero config needed.
- **Node**: `npm run build`, then `npm run start` behind a reverse proxy.
- **Docker**: a plain `node:22-alpine` image running `npm run build && npm start`
  works; pass every variable from section 4 as env vars.
- **Database**: Supabase Cloud, or self-hosted Supabase / plain Postgres with
  PostgREST + GoTrue if you want no vendor at all.

---

## 6. Feature map (where to look)

| Feature                                         | Implementation                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------- |
| Distraction-free reader, `[` / `]` focus toggle | `app/read/[documentId]/page.tsx`                                    |
| Typography + theme controls                     | `src/components/TypeControls.tsx`, `src/hooks/useReaderPrefs.tsx`   |
| Select-to-highlight                             | `saveHighlight` in `src/lib/focus.functions.ts`                     |
| Kindle / CSV import                             | `src/lib/parse-highlights.ts` + `importHighlights`                  |
| Programmatic intake                             | `POST /api/public/highlights` with `X-API-Key`                      |
| Book covers & author lookup                     | `src/lib/book-metadata.server.ts` + `enrichBooks`                   |
| Daily review                                    | `getReview` server function, rendered by `app/page.tsx`             |
| Email digest                                    | `src/lib/digest.server.ts`, triggered by `/api/public/hooks/digest` |

### Scheduling the digest yourself

The digest is a plain HTTP endpoint, so any scheduler works:

```bash
curl -X POST https://yourdomain/api/public/hooks/digest \
  -H "x-cron-secret: $CRON_SECRET"
```

Wire it to cron, GitHub Actions, `pg_cron`, or a Cloudflare Cron Trigger —
whatever your host offers.

### Sending a highlight from anywhere

```bash
curl -X POST https://yourdomain/api/public/highlights \
  -H "content-type: application/json" \
  -H "x-api-key: $READO_API_KEY" \
  -d '{"text":"The lantern did not go out.","book_title":"The Lantern Room","author":"A. Vale"}'
```

Your key is on the Settings page.
