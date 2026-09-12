/** POST /api/public/hooks/digest — scheduled review digest. */
import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { pickDigestHighlights, sendDigestEmail, type DigestHighlight } from "@/lib/digest.server";

const BATCH_SIZE = 25;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export const Route = createFileRoute("/api/public/hooks/digest")({
  server: { handlers: { POST: async ({ request }) => {
    const denied = await authenticateCronRequest(request);
    if (denied) return denied;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const appUrl = new URL(request.url).origin;
    const now = Date.now();
    const { data: profiles, error } = await supabaseAdmin.from("profiles").select("id, email, digest_email, digest_frequency, plan, last_digest_at").eq("digest_enabled", true).order("last_digest_at", { ascending: true, nullsFirst: true }).limit(BATCH_SIZE);
    if (error) return json({ error: error.message }, 500);
    let sent = 0; let skipped = 0; let halted: string | null = null;
    for (const profile of profiles ?? []) {
      const recipient = profile.digest_email ?? profile.email;
      if (!recipient) { skipped++; continue; }
      const isPro = profile.plan === "pro" || profile.plan === "lifetime";
      const intervalMs = isPro && profile.digest_frequency === "daily" ? 20 * 3600_000 : 7 * 24 * 3600_000;
      const last = profile.last_digest_at ? new Date(profile.last_digest_at).getTime() : 0;
      if (now - last < intervalMs) { skipped++; continue; }
      const { data: pool } = await supabaseAdmin.from("highlights").select("text, note, book_title, author, location").eq("user_id", profile.id).limit(500);
      const picks = pickDigestHighlights((pool ?? []) as DigestHighlight[]);
      if (picks.length < 3) { skipped++; continue; }
      const result = await sendDigestEmail(recipient, picks, appUrl);
      if (result.sent) { sent++; await supabaseAdmin.from("profiles").update({ last_digest_at: new Date().toISOString() }).eq("id", profile.id); continue; }
      if (result.reason === "recipient_suppressed") { skipped++; await supabaseAdmin.from("profiles").update({ last_digest_at: new Date().toISOString() }).eq("id", profile.id); continue; }
      halted = result.reason; break;
    }
    return json({ sent, skipped, halted, considered: profiles?.length ?? 0 });
  }}},
});
