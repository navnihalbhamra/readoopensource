import { z } from "zod";

import type { RpcContext, RpcRegistry, ServerSupabase } from "@/lib/rpc";
import { FREE_HIGHLIGHT_LIMIT, entitlementsFor } from "@/lib/plan";
import { bifurcateParagraph, dedupe, parseHighlightFile } from "@/lib/parse-highlights";
import { parseDigestSchedule, DEFAULT_DIGEST_SCHEDULE } from "@/lib/digest-schedule";

async function getEntitlements(supabase: ServerSupabase, userId: string) {
  try {
    const [profile, highlights] = await Promise.all([
      supabase.from("profiles").select("plan").eq("id", userId).maybeSingle(),
      supabase.from("highlights").select("id", { count: "exact", head: true }).eq("user_id", userId),
    ]);
    return entitlementsFor(profile.data?.plan, highlights.count ?? 0);
  } catch {
    return entitlementsFor("free", 0);
  }
}

export async function listDocuments(ctx: RpcContext, _data: unknown) {
  const [docsResult, highlightsResult] = await Promise.all([
    ctx.supabase
      .from("documents")
      .select("id, title, author, source, progress, content, created_at")
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: false }),
    ctx.supabase
      .from("highlights")
      .select("id, document_id")
      .eq("user_id", ctx.userId)
      .not("document_id", "is", null),
  ]);

  if (docsResult.error) throw new Error(docsResult.error.message);
  const docs = docsResult.data ?? [];
  const highlightCounts = new Map<string, number>();
  for (const h of highlightsResult.data ?? []) {
    if (h.document_id) {
      highlightCounts.set(h.document_id, (highlightCounts.get(h.document_id) ?? 0) + 1);
    }
  }

  return docs.map((doc) => {
    const words = doc.content ? doc.content.trim().split(/\s+/).filter(Boolean).length : 0;
    const readingTimeMinutes = Math.max(1, Math.round(words / 220));
    return {
      id: doc.id,
      title: doc.title,
      author: doc.author,
      source: doc.source,
      progress: doc.progress ?? 0,
      created_at: doc.created_at,
      word_count: words,
      reading_time_minutes: readingTimeMinutes,
      highlight_count: highlightCounts.get(doc.id) ?? 0,
    };
  });
}

export async function saveArticleUrl(ctx: RpcContext, data: unknown) {
  const input = z.object({ url: z.string().url() }).parse(data);
  const { extractArticleFromUrl } = await import("@/lib/article-scraper.server");
  const scraped = await extractArticleFromUrl(input.url);

  const { data: row, error } = await ctx.supabase
    .from("documents")
    .insert({
      user_id: ctx.userId,
      title: scraped.title,
      author: scraped.author || null,
      content: scraped.content,
      source: scraped.source,
      progress: 0,
    })
    .select("id, title, author, source, created_at")
    .single();

  if (error) throw new Error(error.message);

  return {
    ...row,
    word_count: scraped.wordCount,
    reading_time_minutes: scraped.readingTimeMinutes,
  };
}

export async function importOmnivore(ctx: RpcContext, data: unknown) {
  const input = z
    .object({
      contents: z.string().min(1),
      filename: z.string().optional(),
    })
    .parse(data);

  const { parseOmnivoreExport } = await import("@/lib/omnivore-importer");
  const parsed = parseOmnivoreExport(input.contents, input.filename);

  if (parsed.articles.length === 0 && parsed.totalHighlights === 0) {
    return { articles: 0, highlights: 0 };
  }

  let importedArticles = 0;
  let importedHighlights = 0;

  for (const art of parsed.articles) {
    const { data: docRow } = await ctx.supabase
      .from("documents")
      .insert({
        user_id: ctx.userId,
        title: art.title,
        author: art.author || null,
        content: art.content || "Imported from Omnivore",
        source: art.url || "omnivore",
        progress: 0,
      })
      .select("id")
      .single();

    if (docRow?.id) {
      importedArticles++;
      if (art.highlights.length > 0) {
        const highlightRows = art.highlights.map((h) => ({
          user_id: ctx.userId,
          document_id: docRow.id,
          book_title: art.title,
          author: art.author || null,
          text: h.text,
          note: h.note || null,
          source: "omnivore",
          highlighted_at: h.createdAt || new Date().toISOString(),
        }));

        const { error } = await ctx.supabase.from("highlights").insert(highlightRows);
        if (!error) {
          importedHighlights += art.highlights.length;
        }
      }
    }
  }

  return {
    articles: importedArticles,
    highlights: importedHighlights,
  };
}

export async function getDocument(ctx: RpcContext, data: unknown) {
  const input = z.object({ id: z.string().uuid() }).parse(data);
  const [doc, highlights] = await Promise.all([
    ctx.supabase
      .from("documents")
      .select("*")
      .eq("id", input.id)
      .eq("user_id", ctx.userId)
      .maybeSingle(),
    ctx.supabase
      .from("highlights")
      .select("*")
      .eq("document_id", input.id)
      .eq("user_id", ctx.userId)
      .order("created_at", { ascending: true }),
  ]);
  if (doc.error) throw new Error(doc.error.message);
  if (!doc.data) throw new Error("Document not found");
  if (highlights.error) throw new Error(highlights.error.message);
  return { document: doc.data, highlights: highlights.data };
}

export async function createDocument(ctx: RpcContext, data: unknown) {
  const input = z
    .object({
      title: z.string().min(1).max(300),
      author: z.string().max(200).optional(),
      content: z.string().min(1).max(400_000),
    })
    .parse(data);
  const { data: row, error } = await ctx.supabase
    .from("documents")
    .insert({
      user_id: ctx.userId,
      title: input.title,
      author: input.author || null,
      content: input.content,
      source: "paste",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return row;
}

export async function saveProgress(ctx: RpcContext, data: unknown) {
  const input = z
    .object({ id: z.string().uuid(), progress: z.number().min(0).max(100) })
    .parse(data);
  const { error } = await ctx.supabase
    .from("documents")
    .update({ progress: Math.round(input.progress) })
    .eq("id", input.id)
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function deleteDocument(ctx: RpcContext, data: unknown) {
  const input = z.object({ id: z.string().uuid() }).parse(data);
  const { error } = await ctx.supabase
    .from("documents")
    .delete()
    .eq("id", input.id)
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listHighlights(ctx: RpcContext, _data: unknown) {
  try {
    const { data, error } = await ctx.supabase
      .from("highlights")
      .select("*")
      .eq("user_id", ctx.userId)
      .order("highlighted_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  } catch (err) {
    console.warn("[Highlights] Database offline or error:", (err as Error).message);
    return [];
  }
}

export async function saveHighlight(ctx: RpcContext, data: unknown) {
  const input = z
    .object({
      document_id: z.string().uuid().nullish(),
      book_title: z.string().min(1).max(300),
      author: z.string().max(200).nullish(),
      text: z.string().min(1).max(10_000),
      note: z.string().max(5_000).nullish(),
      location: z.string().max(120).nullish(),
    })
    .parse(data);
  const text = input.text.trim();
  const quotes = bifurcateParagraph(text);
  if (quotes.length === 0) throw new Error("Highlight text is empty");

  const entitlements = await getEntitlements(ctx.supabase, ctx.userId);
  if (
    entitlements.highlightLimit !== null &&
    entitlements.highlightCount >= entitlements.highlightLimit
  ) {
    throw new Error(
      `Free preview limit reached (${FREE_HIGHLIGHT_LIMIT} highlights). Upgrade to the Founder Pass ($49 lifetime) for unlimited highlights.`,
    );
  }

  // Filter out any quotes that already exist for this book
  const { data: known } = await ctx.supabase
    .from("highlights")
    .select("text")
    .eq("user_id", ctx.userId)
    .eq("book_title", input.book_title);
  const knownSet = new Set((known ?? []).map((k) => k.text));
  const freshQuotes = quotes.filter((q) => !knownSet.has(q));

  if (freshQuotes.length === 0) {
    const { data: existing } = await ctx.supabase
      .from("highlights")
      .select("*")
      .eq("user_id", ctx.userId)
      .eq("book_title", input.book_title)
      .eq("text", quotes[0]!)
      .maybeSingle();
    return existing;
  }

  const allowedQuotes =
    entitlements.highlightLimit !== null
      ? freshQuotes.slice(0, Math.max(0, entitlements.highlightLimit - entitlements.highlightCount))
      : freshQuotes;

  if (allowedQuotes.length === 0) {
    throw new Error(
      `Free preview limit reached (${FREE_HIGHLIGHT_LIMIT} highlights). Upgrade to the Founder Pass ($49 lifetime) for unlimited highlights.`,
    );
  }

  const rowsToInsert = allowedQuotes.map((q) => ({
    user_id: ctx.userId,
    document_id: input.document_id ?? null,
    book_title: input.book_title,
    author: input.author ?? null,
    text: q,
    note: input.note ?? null,
    location: input.location ?? null,
    source: "reader",
  }));

  const { data: rows, error } = await ctx.supabase
    .from("highlights")
    .insert(rowsToInsert)
    .select("*");
  if (error) throw new Error(error.message);
  return rows?.[0];
}

export async function deleteHighlight(ctx: RpcContext, data: unknown) {
  const input = z.object({ id: z.string().uuid() }).parse(data);
  const { error } = await ctx.supabase
    .from("highlights")
    .delete()
    .eq("id", input.id)
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function importHighlights(ctx: RpcContext, data: unknown) {
  const input = z
    .object({ filename: z.string().min(1).max(300), contents: z.string().min(1).max(4_000_000) })
    .parse(data);
  const parsed = dedupe(parseHighlightFile(input.filename, input.contents));
  if (parsed.length === 0)
    return { imported: 0, skipped: 0, parsed: 0, books: [] as string[], limit_reached: false };
  const rows = parsed.map((h) => ({
    user_id: ctx.userId,
    book_title: h.book_title,
    author: h.author,
    text: h.text,
    note: h.note,
    location: h.location,
    highlighted_at: h.highlighted_at ?? new Date().toISOString(),
    source: /\.csv$/i.test(input.filename) ? "csv" : "kindle",
  }));
  const books = Array.from(new Set(rows.map((r) => r.book_title)));
  const { data: known } = await ctx.supabase
    .from("highlights")
    .select("book_title, text")
    .eq("user_id", ctx.userId)
    .in("book_title", books);
  const seen = new Set((known ?? []).map((h) => `${h.book_title}\u0000${h.text}`));
  let fresh = rows.filter((r) => !seen.has(`${r.book_title}\u0000${r.text}`));
  const entitlements = await getEntitlements(ctx.supabase, ctx.userId);
  const limitReached =
    entitlements.highlightLimit !== null &&
    entitlements.highlightCount >= entitlements.highlightLimit;
  if (entitlements.highlightLimit !== null)
    fresh = fresh.slice(0, Math.max(0, entitlements.highlightLimit - entitlements.highlightCount));
  if (fresh.length === 0)
    return {
      parsed: parsed.length,
      imported: 0,
      skipped: parsed.length,
      books,
      limit_reached: limitReached || rows.length > 0,
    };
  const chunkSize = 250;
  let importedCount = 0;
  for (let i = 0; i < fresh.length; i += chunkSize) {
    const chunk = fresh.slice(i, i + chunkSize);
    const { data: inserted, error } = await ctx.supabase
      .from("highlights")
      .insert(chunk)
      .select("id, book_title");
    if (error) throw new Error(error.message);
    importedCount += inserted?.length ?? 0;
  }
  return {
    parsed: parsed.length,
    imported: importedCount,
    skipped: parsed.length - importedCount,
    books,
    limit_reached:
      limitReached ||
      fresh.length < rows.filter((r) => !seen.has(`${r.book_title}\u0000${r.text}`)).length,
  };
}

export async function getProfile(ctx: RpcContext, _data: unknown) {
  try {
    const [profile, highlights] = await Promise.all([
      ctx.supabase
        .from("profiles")
        .select(
          "id, email, digest_email, linked_emails, display_name, reading_goals, onboarding_completed, digest_enabled, digest_frequency, last_digest_at, plan, plan_source, plan_renews_at",
        )
        .eq("id", ctx.userId)
        .maybeSingle(),
      ctx.supabase
        .from("highlights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", ctx.userId),
    ]);
    if (profile.error) throw new Error(profile.error.message);
    const schedule = parseDigestSchedule(profile.data?.digest_frequency);
    return {
      ...profile.data,
      schedule,
      entitlements: entitlementsFor(profile.data?.plan, highlights.count ?? 0),
    };
  } catch (err) {
    console.warn("[Profile] Database offline or error:", (err as Error).message);
    return {
      id: ctx.userId,
      email: null,
      digest_email: null,
      linked_emails: [],
      display_name: null,
      plan: "free",
      schedule: DEFAULT_DIGEST_SCHEDULE,
      entitlements: entitlementsFor("free", 0),
    };
  }
}

export async function updateDigestSettings(ctx: RpcContext, data: unknown) {
  const input = z
    .object({
      digest_enabled: z.boolean(),
      digest_frequency: z.string().min(1).max(2000),
      digest_email: z.string().email().optional(),
    })
    .parse(data);
  const patch: {
    digest_enabled: boolean;
    digest_frequency: string;
    digest_email?: string;
  } = {
    digest_enabled: input.digest_enabled,
    digest_frequency: input.digest_frequency,
  };
  if (input.digest_email) patch.digest_email = input.digest_email;
  const { error } = await ctx.supabase.from("profiles").update(patch).eq("id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function sendTestDigest(ctx: RpcContext, data: unknown) {
  const input = z
    .object({
      highlightsCount: z.number().min(1).max(10).optional(),
    })
    .optional()
    .parse(data);

  const { data: profile } = await ctx.supabase
    .from("profiles")
    .select("email, digest_email, digest_frequency")
    .eq("id", ctx.userId)
    .maybeSingle();
  const recipient = profile?.digest_email ?? profile?.email;
  if (!recipient) throw new Error("No email address on your account");

  const schedule = parseDigestSchedule(profile?.digest_frequency);
  const targetCount = input?.highlightsCount ?? schedule.highlightsPerEmail;

  const { data: pool } = await ctx.supabase
    .from("highlights")
    .select("text, note, book_title, author, location")
    .eq("user_id", ctx.userId)
    .limit(500);
  const { pickDigestHighlights, sendDigestEmail } = await import("@/lib/digest.server");
  const picks = pickDigestHighlights((pool ?? []) as never, targetCount);
  if (picks.length === 0) throw new Error("Import a few highlights first");
  const appUrl =
    process.env["NEXT_PUBLIC_APP_URL"] ?? process.env["VITE_PUBLIC_APP_URL"] ?? "https://reado.lol";
  const result = await sendDigestEmail(recipient, picks, appUrl);
  if (!result.sent) return { sent: false as const, reason: result.reason };
  return { sent: true as const, to: recipient, count: picks.length };
}

export async function getReview(ctx: RpcContext, _data: unknown) {
  try {
    const { data, error } = await ctx.supabase
      .from("highlights")
      .select("id, text, note, book_title, author, location, book_id")
      .eq("user_id", ctx.userId)
      .limit(500);
    if (error) throw new Error(error.message);
    const pool = data ?? [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(pool.length, pool.length >= 5 ? 5 : pool.length));
  } catch (err) {
    console.warn("[Review] Database offline or error:", (err as Error).message);
    return [];
  }
}

export async function listBooks(ctx: RpcContext, _data: unknown) {
  try {
    const [books, highlights] = await Promise.all([
      ctx.supabase
        .from("books")
        .select(
          "id, title, author, cover_url, published_year, description, subjects, match_source, matched_at",
        )
        .eq("user_id", ctx.userId)
        .order("title", { ascending: true }),
      ctx.supabase.from("highlights").select("book_id").eq("user_id", ctx.userId).limit(5000),
    ]);
    if (books.error) throw new Error(books.error.message);
    const counts = new Map<string, number>();
    for (const row of highlights.data ?? [])
      if (row.book_id) counts.set(row.book_id, (counts.get(row.book_id) ?? 0) + 1);
    return (books.data ?? []).map((b) => ({ ...b, highlight_count: counts.get(b.id) ?? 0 }));
  } catch (err) {
    console.warn("[Books] Database offline or error:", (err as Error).message);
    return [];
  }
}

export async function getBook(ctx: RpcContext, data: unknown) {
  const input = z.object({ id: z.string().uuid() }).parse(data);
  const [book, highlights] = await Promise.all([
    ctx.supabase
      .from("books")
      .select("*")
      .eq("id", input.id)
      .eq("user_id", ctx.userId)
      .maybeSingle(),
    ctx.supabase
      .from("highlights")
      .select("*")
      .eq("book_id", input.id)
      .eq("user_id", ctx.userId)
      .order("highlighted_at", { ascending: false }),
  ]);
  if (book.error) throw new Error(book.error.message);
  if (!book.data) throw new Error("Book not found");
  return { book: book.data, highlights: highlights.data ?? [] };
}

export async function deleteBook(ctx: RpcContext, data: unknown) {
  const input = z
    .object({ id: z.string().uuid(), keep_highlights: z.boolean().optional() })
    .parse(data);
  const highlightFilter = ctx.supabase
    .from("highlights")
    .update({ book_id: null })
    .eq("book_id", input.id)
    .eq("user_id", ctx.userId);
  const { error: highlightError } = input.keep_highlights
    ? await highlightFilter
    : await ctx.supabase
        .from("highlights")
        .delete()
        .eq("book_id", input.id)
        .eq("user_id", ctx.userId);
  if (highlightError) throw new Error(highlightError.message);
  const { error } = await ctx.supabase
    .from("books")
    .delete()
    .eq("id", input.id)
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function updateBook(ctx: RpcContext, data: unknown) {
  const input = z
    .object({
      id: z.string().uuid(),
      title: z.string().min(1).max(300).optional(),
      author: z.string().max(200).nullish(),
      cover_url: z.string().url().max(1000).nullish(),
    })
    .parse(data);
  const patch: {
    title?: string;
    author?: string | null;
    cover_url?: string | null;
    match_source?: string | null;
    matched_at?: string | null;
  } = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.author !== undefined) patch.author = input.author || null;
  if (input.cover_url !== undefined) {
    patch.cover_url = input.cover_url || null;
    patch.match_source = input.cover_url ? "manual" : null;
    patch.matched_at = input.cover_url ? new Date().toISOString() : null;
  }
  const { error } = await ctx.supabase
    .from("books")
    .update(patch)
    .eq("id", input.id)
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function enrichBooks(ctx: RpcContext, data: unknown) {
  const input = z.object({ force_book_id: z.string().uuid().nullish() }).parse(data ?? {});
  const { lookupBook } = await import("@/lib/book-metadata.server");
  const entitlements = await getEntitlements(ctx.supabase, ctx.userId);
  if (!entitlements.canEnrichBooks)
    throw new Error("Book covers and author details are available on Pro.");
  const { data: highlights } = await ctx.supabase
    .from("highlights")
    .select("id, book_title, author, book_id")
    .eq("user_id", ctx.userId)
    .limit(5000);
  const { data: existingBooks } = await ctx.supabase
    .from("books")
    .select("*")
    .eq("user_id", ctx.userId);
  const key = (title: string, author?: string | null) =>
    `${title.trim().toLowerCase()}\u0000${(author ?? "").trim().toLowerCase()}`;
  const byKey = new Map((existingBooks ?? []).map((b) => [key(b.title, b.author), b]));
  const missing = new Map<string, { title: string; author: string | null }>();
  for (const h of highlights ?? []) {
    const k = key(h.book_title, h.author);
    if (!byKey.has(k) && !missing.has(k))
      missing.set(k, { title: h.book_title, author: h.author ?? null });
  }
  if (missing.size > 0) {
    const { data: created } = await ctx.supabase
      .from("books")
      .insert(
        [...missing.values()].map((b) => ({
          user_id: ctx.userId,
          title: b.title,
          author: b.author,
        })),
      )
      .select("*");
    for (const b of created ?? []) byKey.set(key(b.title, b.author), b);
  }
  const links = (highlights ?? []).filter((h) => !h.book_id);
  const bookHighlightIds = new Map<string, string[]>();
  for (const h of links) {
    const book = byKey.get(key(h.book_title, h.author));
    if (book) {
      const ids = bookHighlightIds.get(book.id) ?? [];
      ids.push(h.id);
      bookHighlightIds.set(book.id, ids);
    }
  }
  // Batch update highlights per book instead of single-row loops
  await Promise.all(
    [...bookHighlightIds.entries()].map(([bookId, ids]) =>
      ctx.supabase
        .from("highlights")
        .update({ book_id: bookId })
        .in("id", ids)
        .eq("user_id", ctx.userId),
    ),
  );
  const forced = input.force_book_id ?? null;
  const targets = [...byKey.values()].filter((b) =>
    forced ? b.id === forced : !b.matched_at && b.match_source !== "manual",
  );
  let matched = 0;
  // Look up OpenLibrary books concurrently in parallel chunks
  const lookups = await Promise.all(
    targets.slice(0, 12).map(async (book) => {
      try {
        const match = await lookupBook(book.title, book.author);
        return { book, match };
      } catch {
        return { book, match: null };
      }
    }),
  );
  await Promise.all(
    lookups.map(async ({ book, match }) => {
      const patch = match
        ? {
            cover_url: match.cover_url,
            author: book.author ?? match.author,
            open_library_key: match.open_library_key,
            published_year: match.published_year,
            description: match.description,
            subjects: match.subjects,
            match_source: match.match_source,
            matched_at: new Date().toISOString(),
          }
        : { match_source: "unmatched", matched_at: new Date().toISOString() };
      const { error } = await ctx.supabase
        .from("books")
        .update(patch)
        .eq("id", book.id)
        .eq("user_id", ctx.userId);
      if (!error && match?.cover_url) matched += 1;
    }),
  );
  return { books: byKey.size, linked: links.length, matched, attempted: targets.length };
}

export async function updateHighlightNote(ctx: RpcContext, data: unknown) {
  const input = z.object({ id: z.string().uuid(), note: z.string().max(5_000) }).parse(data);
  const { error } = await ctx.supabase
    .from("highlights")
    .update({ note: input.note || null })
    .eq("id", input.id)
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function claimFounderPass(ctx: RpcContext, data: unknown) {
  const input = z.object({ checkoutId: z.string().optional() }).parse(data);
  if (input.checkoutId) {
    try {
      const { getCheckoutSession } = await import("@/lib/polar.server");
      const session = await getCheckoutSession(input.checkoutId);
      if (session) {
        await ctx.supabase
          .from("profiles")
          .update({ plan: "lifetime", plan_source: "polar" })
          .eq("id", ctx.userId);
        return { success: true, plan: "lifetime" };
      }
    } catch (err) {
      console.error("Failed to verify checkout session:", err);
    }
  }
  return { success: false };
}

export const serverFunctions = {
  listDocuments: { method: "GET", handler: listDocuments },
  getDocument: { method: "GET", handler: getDocument },
  createDocument: { method: "POST", handler: createDocument },
  saveArticleUrl: { method: "POST", handler: saveArticleUrl },
  importOmnivore: { method: "POST", handler: importOmnivore },
  saveProgress: { method: "POST", handler: saveProgress },
  deleteDocument: { method: "POST", handler: deleteDocument },
  listHighlights: { method: "GET", handler: listHighlights },
  saveHighlight: { method: "POST", handler: saveHighlight },
  updateHighlightNote: { method: "POST", handler: updateHighlightNote },
  deleteHighlight: { method: "POST", handler: deleteHighlight },
  importHighlights: { method: "POST", handler: importHighlights },
  getProfile: { method: "GET", handler: getProfile },
  claimFounderPass: { method: "POST", handler: claimFounderPass },
  updateDigestSettings: { method: "POST", handler: updateDigestSettings },
  sendTestDigest: { method: "POST", handler: sendTestDigest },
  getReview: { method: "GET", handler: getReview },
  listBooks: { method: "GET", handler: listBooks },
  getBook: { method: "GET", handler: getBook },
  deleteBook: { method: "POST", handler: deleteBook },
  updateBook: { method: "POST", handler: updateBook },
  enrichBooks: { method: "POST", handler: enrichBooks },
} satisfies RpcRegistry;

