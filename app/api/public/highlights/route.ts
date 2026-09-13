/** POST /api/public/highlights — programmatic highlight intake. */
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { dedupe, parseHighlightFile } from "@/lib/parse-highlights";
import { FREE_HIGHLIGHT_LIMIT, entitlementsFor } from "@/lib/plan";

const highlightSchema = z.object({
  book_title: z.string().min(1).max(300),
  author: z.string().max(200).nullish(),
  text: z.string().min(1).max(10_000),
  note: z.string().max(5_000).nullish(),
  location: z.string().max(120).nullish(),
  highlighted_at: z.string().datetime().nullish(),
});
const bodySchema = z.union([
  z.object({ highlights: z.array(highlightSchema).min(1).max(500) }),
  z.object({ filename: z.string().min(1).max(300), contents: z.string().min(1).max(4_000_000) }),
  highlightSchema,
]);

export async function POST(request: NextRequest) {
  const key =
    request.headers.get("x-api-key") ??
    /^Bearer ([^\s,]+)$/.exec(request.headers.get("authorization") ?? "")?.[1] ??
    null;
  if (!key || key.length < 20)
    return NextResponse.json({ error: "Missing or malformed API key" }, { status: 401 });

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, plan")
    .eq("api_key", key)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: "Invalid API key" }, { status: 401 });

  let parsedBody: z.infer<typeof bodySchema>;
  try {
    parsedBody = bodySchema.parse(await request.json());
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid payload", details: error instanceof Error ? error.message : null },
      { status: 400 },
    );
  }

  let incoming: z.infer<typeof highlightSchema>[];
  let source = "api";
  if ("contents" in parsedBody) {
    source = /\.csv$/i.test(parsedBody.filename) ? "csv" : "kindle";
    incoming = dedupe(parseHighlightFile(parsedBody.filename, parsedBody.contents));
  } else if ("highlights" in parsedBody) {
    incoming = parsedBody.highlights;
  } else {
    incoming = [parsedBody];
  }

  if (incoming.length === 0) return NextResponse.json({ imported: 0, skipped: 0, parsed: 0 });

  const rows = incoming.map((h) => ({
    user_id: profile.id,
    book_title: h.book_title,
    author: h.author ?? null,
    text: h.text.trim(),
    note: h.note ?? null,
    location: h.location ?? null,
    highlighted_at: h.highlighted_at ?? new Date().toISOString(),
    source,
  }));
  const books = Array.from(new Set(rows.map((r) => r.book_title)));
  const { data: known } = await supabaseAdmin
    .from("highlights")
    .select("book_title, text")
    .eq("user_id", profile.id)
    .in("book_title", books);
  const seen = new Set((known ?? []).map((h) => `${h.book_title}\u0000${h.text}`));
  let fresh = rows.filter((r) => !seen.has(`${r.book_title}\u0000${r.text}`));
  const { count } = await supabaseAdmin
    .from("highlights")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);
  const entitlements = entitlementsFor(profile.plan, count ?? 0);
  if (entitlements.highlightLimit !== null)
    fresh = fresh.slice(0, Math.max(0, entitlements.highlightLimit - entitlements.highlightCount));
  if (fresh.length === 0)
    return NextResponse.json({
      parsed: rows.length,
      imported: 0,
      skipped: rows.length,
      limit_reached: entitlements.highlightLimit !== null,
    });

  const { data: inserted, error } = await supabaseAdmin
    .from("highlights")
    .insert(fresh)
    .select("id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    parsed: rows.length,
    imported: inserted?.length ?? 0,
    skipped: rows.length - (inserted?.length ?? 0),
    limit_reached:
      entitlements.highlightLimit !== null &&
      fresh.length < rows.filter((r) => !seen.has(`${r.book_title}\u0000${r.text}`)).length,
    free_limit: entitlements.highlightLimit === null ? null : FREE_HIGHLIGHT_LIMIT,
  });
}
