"use server";

import { createServerFn } from "@/lib/next-server-fn";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { dedupe, parseHighlightFile } from "@/lib/parse-highlights";
import { entitlementsFor, FREE_HIGHLIGHT_LIMIT } from "@/lib/plan";

async function getEntitlements(supabase: any, userId: string) {
  const [profile, highlights] = await Promise.all([
    supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
    supabase.from("highlights").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);
  if (profile.error) throw new Error(profile.error.message);
  if (highlights.error) throw new Error(highlights.error.message);
  return entitlementsFor(profile.data?.plan, highlights.count ?? 0);
}

export const listDocuments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("documents").select("id, title, author, source, progress, created_at").eq("user_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const getDocument = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const [doc, highlights] = await Promise.all([
      context.supabase.from("documents").select("*").eq("id", data.id).eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("highlights").select("*").eq("document_id", data.id).eq("user_id", context.userId).order("created_at", { ascending: true }),
    ]);
    if (doc.error) throw new Error(doc.error.message);
    if (!doc.data) throw new Error("Document not found");
    if (highlights.error) throw new Error(highlights.error.message);
    return { document: doc.data, highlights: highlights.data };
  });

export const createDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ title: z.string().min(1).max(300), author: z.string().max(200).optional(), content: z.string().min(1).max(400_000) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("documents").insert({ user_id: context.userId, title: data.title, author: data.author || null, content: data.content, source: "paste" }).select("id").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const saveProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid(), progress: z.number().min(0).max(100) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("documents").update({ progress: Math.round(data.progress) }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("documents").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listHighlights = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("highlights").select("*").eq("user_id", context.userId).order("highlighted_at", { ascending: false }).limit(500);
    if (error) throw new Error(error.message);
    return data;
  });

export const saveHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ document_id: z.string().uuid().nullish(), book_title: z.string().min(1).max(300), author: z.string().max(200).nullish(), text: z.string().min(1).max(10_000), note: z.string().max(5_000).nullish(), location: z.string().max(120).nullish() }).parse(data))
  .handler(async ({ data, context }) => {
    const text = data.text.trim();
    const { data: existing } = await context.supabase.from("highlights").select("*").eq("user_id", context.userId).eq("book_title", data.book_title).eq("text", text).maybeSingle();
    if (existing) return existing;
    const entitlements = await getEntitlements(context.supabase, context.userId);
    if (entitlements.highlightLimit !== null && entitlements.highlightCount >= entitlements.highlightLimit) {
      throw new Error(`Free plan limit reached (${FREE_HIGHLIGHT_LIMIT} highlights). Upgrade to keep adding highlights.`);
    }
    const { data: row, error } = await context.supabase.from("highlights").insert({ user_id: context.userId, document_id: data.document_id ?? null, book_title: data.book_title, author: data.author ?? null, text, note: data.note ?? null, location: data.location ?? null, source: "reader" }).select("*").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateHighlightNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid(), note: z.string().max(5_000) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("highlights").update({ note: data.note || null }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteHighlight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("highlights").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const importHighlights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ filename: z.string().min(1).max(300), contents: z.string().min(1).max(4_000_000) }).parse(data))
  .handler(async ({ data, context }) => {
    const parsed = dedupe(parseHighlightFile(data.filename, data.contents));
    if (parsed.length === 0) return { imported: 0, skipped: 0, parsed: 0, books: [] as string[], limit_reached: false };
    const rows = parsed.map((h) => ({ user_id: context.userId, book_title: h.book_title, author: h.author, text: h.text, note: h.note, location: h.location, highlighted_at: h.highlighted_at ?? new Date().toISOString(), source: /\.csv$/i.test(data.filename) ? "csv" : "kindle" }));
    const books = Array.from(new Set(rows.map((r) => r.book_title)));
    const { data: known } = await context.supabase.from("highlights").select("book_title, text").eq("user_id", context.userId).in("book_title", books);
    const seen = new Set((known ?? []).map((h) => `${h.book_title}\u0000${h.text}`));
    let fresh = rows.filter((r) => !seen.has(`${r.book_title}\u0000${r.text}`));
    const entitlements = await getEntitlements(context.supabase, context.userId);
    const limitReached = entitlements.highlightLimit !== null && entitlements.highlightCount >= entitlements.highlightLimit;
    if (entitlements.highlightLimit !== null) fresh = fresh.slice(0, Math.max(0, entitlements.highlightLimit - entitlements.highlightCount));
    if (fresh.length === 0) return { parsed: parsed.length, imported: 0, skipped: parsed.length, books, limit_reached: limitReached || rows.length > 0 };
    const { data: inserted, error } = await context.supabase.from("highlights").insert(fresh).select("id, book_title");
    if (error) throw new Error(error.message);
    return { parsed: parsed.length, imported: inserted?.length ?? 0, skipped: parsed.length - (inserted?.length ?? 0), books, limit_reached: limitReached || fresh.length < rows.filter((r) => !seen.has(`${r.book_title}\u0000${r.text}`)).length };
  });

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, highlights] = await Promise.all([
      context.supabase.from("profiles").select("id, email, digest_email, linked_emails, display_name, reading_goals, onboarding_completed, digest_enabled, digest_frequency, last_digest_at, api_key, plan, plan_source, plan_renews_at").eq("id", context.userId).maybeSingle(),
      context.supabase.from("highlights").select("id", { count: "exact", head: true }).eq("user_id", context.userId),
    ]);
    if (profile.error) throw new Error(profile.error.message);
    if (highlights.error) throw new Error(highlights.error.message);
    return { ...profile.data, entitlements: entitlementsFor(profile.data?.plan, highlights.count ?? 0) };
  });

export const updateDigestSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ digest_enabled: z.boolean(), digest_frequency: z.enum(["daily", "weekly"]) }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").update(data).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sendTestDigest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase.from("profiles").select("email, digest_email").eq("id", context.userId).maybeSingle();
    const recipient = profile?.digest_email ?? profile?.email;
    if (!recipient) throw new Error("No email address on your account");
    const { data: pool } = await context.supabase.from("highlights").select("text, note, book_title, author, location").eq("user_id", context.userId).limit(500);
    const { pickDigestHighlights, sendDigestEmail } = await import("@/lib/digest.server");
    const picks = pickDigestHighlights((pool ?? []) as never);
    if (picks.length === 0) throw new Error("Import a few highlights first");
    const appUrl = process.env["VITE_PUBLIC_APP_URL"] ?? "https://reado.lol";
    const result = await sendDigestEmail(recipient, picks, appUrl);
    if (!result.sent) return { sent: false as const, reason: result.reason };
    return { sent: true as const, to: recipient };
  });

export const getReview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("highlights").select("id, text, note, book_title, author, location, book_id").eq("user_id", context.userId).limit(500);
    if (error) throw new Error(error.message);
    const pool = data ?? [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(pool.length, pool.length >= 5 ? 5 : pool.length));
  });

export const listBooks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [books, highlights] = await Promise.all([
      context.supabase.from("books").select("id, title, author, cover_url, published_year, description, subjects, match_source, matched_at").eq("user_id", context.userId).order("title", { ascending: true }),
      context.supabase.from("highlights").select("book_id").eq("user_id", context.userId).limit(5000),
    ]);
    if (books.error) throw new Error(books.error.message);
    const counts = new Map<string, number>();
    for (const row of highlights.data ?? []) if (row.book_id) counts.set(row.book_id, (counts.get(row.book_id) ?? 0) + 1);
    return (books.data ?? []).map((b) => ({ ...b, highlight_count: counts.get(b.id) ?? 0 }));
  });

export const getBook = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const [book, highlights] = await Promise.all([
      context.supabase.from("books").select("*").eq("id", data.id).eq("user_id", context.userId).maybeSingle(),
      context.supabase.from("highlights").select("*").eq("book_id", data.id).eq("user_id", context.userId).order("highlighted_at", { ascending: false }),
    ]);
    if (book.error) throw new Error(book.error.message);
    if (!book.data) throw new Error("Book not found");
    return { book: book.data, highlights: highlights.data ?? [] };
  });

export const deleteBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid(), keep_highlights: z.boolean().optional() }).parse(data))
  .handler(async ({ data, context }) => {
    const bookFilter = context.supabase.from("highlights").update({ book_id: null }).eq("book_id", data.id).eq("user_id", context.userId);
    const { error: highlightError } = data.keep_highlights ? await bookFilter : await context.supabase.from("highlights").delete().eq("book_id", data.id).eq("user_id", context.userId);
    if (highlightError) throw new Error(highlightError.message);
    const { error } = await context.supabase.from("books").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateBook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid(), title: z.string().min(1).max(300).optional(), author: z.string().max(200).nullish(), cover_url: z.string().url().max(1000).nullish() }).parse(data))
  .handler(async ({ data, context }) => {
    const patch: { title?: string; author?: string | null; cover_url?: string | null; match_source?: string | null; matched_at?: string | null } = {};
    if (data.title !== undefined) patch.title = data.title;
    if (data.author !== undefined) patch.author = data.author || null;
    if (data.cover_url !== undefined) { patch.cover_url = data.cover_url || null; patch.match_source = data.cover_url ? "manual" : null; patch.matched_at = data.cover_url ? new Date().toISOString() : null; }
    const { error } = await context.supabase.from("books").update(patch).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const enrichBooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ force_book_id: z.string().uuid().nullish() }).nullish().parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { lookupBook } = await import("@/lib/book-metadata.server");
    const entitlements = await getEntitlements(context.supabase, context.userId);
    if (!entitlements.canEnrichBooks) throw new Error("Book covers and author details are available on Pro.");
    const { data: highlights } = await context.supabase.from("highlights").select("id, book_title, author, book_id").eq("user_id", context.userId).limit(5000);
    const { data: existingBooks } = await context.supabase.from("books").select("*").eq("user_id", context.userId);
    const key = (title: string, author?: string | null) => `${title.trim().toLowerCase()}\u0000${(author ?? "").trim().toLowerCase()}`;
    const byKey = new Map((existingBooks ?? []).map((b) => [key(b.title, b.author), b]));
    const missing = new Map<string, { title: string; author: string | null }>();
    for (const h of highlights ?? []) { const k = key(h.book_title, h.author); if (!byKey.has(k) && !missing.has(k)) missing.set(k, { title: h.book_title, author: h.author ?? null }); }
    if (missing.size > 0) {
      const { data: created } = await context.supabase.from("books").insert([...missing.values()].map((b) => ({ user_id: context.userId, title: b.title, author: b.author }))).select("*");
      for (const b of created ?? []) byKey.set(key(b.title, b.author), b);
    }
    const links = (highlights ?? []).filter((h) => !h.book_id);
    for (const h of links) { const book = byKey.get(key(h.book_title, h.author)); if (book) await context.supabase.from("highlights").update({ book_id: book.id }).eq("id", h.id).eq("user_id", context.userId); }
    const forced = data?.force_book_id ?? null;
    const targets = [...byKey.values()].filter((b) => forced ? b.id === forced : !b.matched_at && b.match_source !== "manual");
    let matched = 0;
    for (const book of targets.slice(0, 12)) {
      const match = await lookupBook(book.title, book.author);
      const patch = match ? { cover_url: match.cover_url, author: book.author ?? match.author, open_library_key: match.open_library_key, published_year: match.published_year, description: match.description, subjects: match.subjects, match_source: match.match_source, matched_at: new Date().toISOString() } : { match_source: "unmatched", matched_at: new Date().toISOString() };
      const { error } = await context.supabase.from("books").update(patch).eq("id", book.id).eq("user_id", context.userId);
      if (!error && match?.cover_url) matched += 1;
    }
    return { books: byKey.size, linked: links.length, matched, attempted: targets.length };
  });
