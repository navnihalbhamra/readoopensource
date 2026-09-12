# Book covers + author info, and a self-hosting guide

Two things: (1) every imported highlight gets matched to a real book with a cover image and author details, (2) a written guide so you can run Reado on your own server.

## 1. Book metadata enrichment

Use the **Open Library API** (free, no API key, no rate-limit signup) to look up a book by title + author and pull back cover image, author name, first publish year, subjects, and description. Google Books is used as a fallback when Open Library has no match (also keyless).

Flow when you import highlights (file, paste, or the public API):

```text
highlight rows  ->  group by book_title/author  ->  for each unknown book:
   Open Library search  ->  best match by title similarity
   (miss) Google Books search  ->  best match
   store cover URL + author + year + description in `books`
```

- Lookups run in a server function, cached in a new `books` table, so each book is fetched once and never re-fetched on later imports.
- If nothing matches, the book stays "unmatched" and shows a typographic fallback cover (initials on black) — no broken images.
- A book detail page listing all highlights for that book, with cover, author, year and description.
- A "Find book" button on unmatched books to retry, plus manual override (edit title/author, or paste a cover URL) so wrong matches can be fixed.

## 2. Where covers show up

- **Review** — small cover thumbnail beside each highlight, clicking it opens the book.
- **Highlights** — book groups become cards with cover + author + highlight count.
- **Import** — after an import, a summary strip of the books it matched.
- Covers stay monochrome-consistent: rendered with a subtle grayscale + contrast treatment so they fit the black-and-white theme (toggleable in settings if you want them in full colour).

## 3. Tech stack + self-hosting guide

A `README.md` at the project root written for someone deploying this elsewhere, covering:

- **Framework**: React 19 + TanStack Start v1 (file-based routing in `src/routes`, SSR), Vite 7 build, Tailwind CSS v4 via `src/styles.css` tokens, shadcn/ui + Radix primitives, TanStack Query for data.
- **Backend**: no separate server — server logic is TanStack `createServerFn` RPCs in `src/lib/*.functions.ts`; HTTP endpoints (public highlight intake, digest cron hook) are file routes under `src/routes/api/`.
- **Database/auth**: Postgres via Supabase, with RLS policies per user; SQL lives in `supabase/migrations/` and can be applied to any Supabase project or plain Postgres (auth pieces need Supabase or a swap).
- **Env vars**: which `VITE_*` client vars and which server-only vars are needed, and what each does.
- **Self-host paths**: (a) Node/Docker — `vite build` then run the Node server output; (b) Cloudflare Workers/Vercel/Netlify edge; (c) your own Supabase or self-hosted Supabase for the DB.
- **Email digest**: how the digest job works and how to point it at your own SMTP/SendGrid instead of Lovable's sender, plus how to schedule the cron hook (pg_cron or any external scheduler hitting the endpoint with the shared secret).
- Runtime caveats to respect when self-hosting on edge (no native modules, read env inside handlers).

## Technical details

- New migration: `public.books` (id, user_id, title, author, cover_url, open_library_key, published_year, description, subjects, match_source, matched_at) with GRANTs for `authenticated`/`service_role`, RLS scoped to `auth.uid()`, unique on (user_id, lower(title), lower(coalesce(author,''))). `highlights.book_id` FK added and backfilled from existing `book_title`/`author` pairs.
- New `src/lib/book-metadata.server.ts` with the Open Library / Google Books clients and title-similarity scoring; called from `enrichBooks` / `relookupBook` server fns in `src/lib/focus.functions.ts`.
- Enrichment is fired after import completes (non-blocking) and by the retry button; failures are logged server-side and never break an import.
- New route `src/routes/book.$bookId.tsx` with its own `head()` metadata; existing routes updated to render covers.
- Cover images are hot-linked from Open Library/Google (no storage bucket) and lazy-loaded.
