/** POST /api/public/hooks/digest — scheduled review digest. */
import { NextRequest, NextResponse } from "next/server";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { pickDigestHighlights, sendDigestEmail, type DigestHighlight } from "@/lib/digest.server";

import { parseDigestSchedule } from "@/lib/digest-schedule";

const BATCH_SIZE = 25;

export async function POST(request: NextRequest) {
  const denied = await authenticateCronRequest(request);
  if (denied) return denied;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const appUrl = new URL(request.url).origin;
  const now = Date.now();

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, digest_email, digest_frequency, plan, last_digest_at")
    .eq("digest_enabled", true)
    .order("last_digest_at", { ascending: true, nullsFirst: true })
    .limit(BATCH_SIZE);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let sent = 0;
  let skipped = 0;
  let halted: string | null = null;

  for (const profile of profiles ?? []) {
    const recipient = profile.digest_email ?? profile.email;
    if (!recipient) {
      skipped++;
      continue;
    }

    const schedule = parseDigestSchedule(profile.digest_frequency);
    const intervalMs = Math.floor((7 / Math.max(1, schedule.emailsPerWeek)) * 24 * 3600_000 * 0.85);
    const last = profile.last_digest_at ? new Date(profile.last_digest_at).getTime() : 0;
    if (now - last < intervalMs) {
      skipped++;
      continue;
    }

    const { data: pool } = await supabaseAdmin
      .from("highlights")
      .select("text, note, book_title, author, location")
      .eq("user_id", profile.id)
      .limit(500);
    const picks = pickDigestHighlights((pool ?? []) as DigestHighlight[], schedule.highlightsPerEmail);
    if (picks.length < 1) {
      skipped++;
      continue;
    }
    const result = await sendDigestEmail(recipient, picks, appUrl);
    if (result.sent) {
      sent++;
      await supabaseAdmin
        .from("profiles")
        .update({ last_digest_at: new Date().toISOString() })
        .eq("id", profile.id);
      continue;
    }
    if (result.reason === "recipient_suppressed") {
      skipped++;
      await supabaseAdmin
        .from("profiles")
        .update({ last_digest_at: new Date().toISOString() })
        .eq("id", profile.id);
      continue;
    }
    halted = result.reason;
    break;
  }

  return NextResponse.json({ sent, skipped, halted, considered: profiles?.length ?? 0 });
}
