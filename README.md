# Reado

A minimalist, black-and-white highlight reader. Import your book highlights
(Kindle `My Clippings.txt`, CSV exports, or the REST API), review a random
handful every day, and get an email digest on a schedule.

---

## 1. Tech stack

| Layer | What it is |
| --- | --- |
| Framework | **TanStack Start v1** — full-stack React 19 with SSR and typed server functions |
| Build tool | **Vite 7** |
| Routing | **TanStack Router** (file-based, `src/routes`) |
| Data fetching | **TanStack Query** |
| Styling | **Tailwind CSS v4** (config-less; tokens live in `src/styles.css`) |
| UI primitives | shadcn-style components in `src/components/ui`, `sonner` for toasts |
| Database | **PostgreSQL** (Supabase) with Row Level Security |
| Auth | **Supabase Auth** (email/password + Google OAuth) |
| Backend logic | `createServerFn` server functions + server routes under `src/routes/api` |
| Book metadata | Open Library search API → Google Books API fallback (both keyless) |
| Email | Server-rendered HTML digest, sent through the configured mail provider |
| Deploy target | Edge runtime (Cloudflare Workers) by default; Node or Docker also work |

There is no Express/FastAPI process: TanStack Start *is* the server. Anything
that would be an Express route is either a server function (app-internal RPC)
or a file route under `src/routes/api/`.

---

## 2. Folder architecture

```text
src/
  routes/                     # file-based routes (URL == file path)
    __root.tsx                # html shell, fonts, providers, Toaster
    index.tsx                 # "/"           Daily Review feed
    books.tsx                 # "/books"      cover grid of every book
    book.$bookId.tsx          # "/book/:id"   one book: cover, author, highlights
    highlights.tsx            # "/highlights" searchable archive grouped by book
    import.tsx                # "/import"     Kindle/CSV upload + paste
    read.$documentId.tsx      # "/read/:id"   distraction-free reader
    settings.tsx              # "/settings"   digest schedule, API key, typography
    auth.tsx                  # "/auth"       sign in / sign up
    api/public/
      highlights.ts           # POST /api/public/highlights  (X-API-Key intake)
      hooks/digest.ts         # POST /api/public/hooks/digest (cron target)
  lib/
    focus.functions.ts        # ALL authenticated server functions (RPC layer)
    book-metadata.server.ts   # Open Library + Google Books lookup (server only)
    digest.server.ts          # picks highlights, renders the digest email
    parse-highlights.ts       # Kindle "My Clippings.txt" + CSV parser (pure)
  components/
    AppShell.tsx              # header, nav, measured column
    BookCover.tsx             # cover image with typographic fallback
    TypeControls.tsx          # font size / line height / measure / theme
    RequireAuth.tsx           # client-side auth gate
  hooks/
    useAuth.tsx               # Supabase session context
    useReaderPrefs.tsx        # typography + theme, persisted to localStorage
  integrations/supabase/      # generated client, admin client, auth middleware
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

Client-visible (must keep the `VITE_` prefix):

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
VITE_SUPABASE_PROJECT_ID=<ref>
```

Server-only (never prefixed, read inside handlers):

```
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable/anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
CRON_SECRET=<random string; required by the digest hook>
RESEND_API_KEY=<or your provider's key, for digest email>
DIGEST_FROM="Reado <digest@yourdomain>"
```

Book metadata needs **no** keys — Open Library and Google Books are called
anonymously.

---

## 5. Running it

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # production bundle
npm run start      # serve the build
```

Deploy paths:

- **Cloudflare Workers / Pages** (default target): `npm run build`, then deploy
  the generated output with `wrangler deploy`. Keep in mind the Worker runtime
  has no child processes and no real filesystem.
- **Node**: switch the Vite/Nitro target to `node-server` and run
  `node .output/server/index.mjs` behind a reverse proxy.
- **Docker**: a plain `node:22-alpine` image running the Node output works;
  pass every variable from section 4 as env vars.
- **Database**: Supabase Cloud, or self-hosted Supabase / plain Postgres with
  PostgREST + GoTrue if you want no vendor at all.

---

## 6. Feature map (where to look)

| Feature | Implementation |
| --- | --- |
| Distraction-free reader, `[` / `]` focus toggle | `src/routes/read.$documentId.tsx` |
| Typography + theme controls | `src/components/TypeControls.tsx`, `src/hooks/useReaderPrefs.tsx` |
| Select-to-highlight | `saveHighlight` in `src/lib/focus.functions.ts` |
| Kindle / CSV import | `src/lib/parse-highlights.ts` + `importHighlights` |
| Programmatic intake | `POST /api/public/highlights` with `X-API-Key` |
| Book covers & author lookup | `src/lib/book-metadata.server.ts` + `enrichBooks` |
| Daily review | `getReview` server function, rendered by `src/routes/index.tsx` |
| Email digest | `src/lib/digest.server.ts`, triggered by `/api/public/hooks/digest` |

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
