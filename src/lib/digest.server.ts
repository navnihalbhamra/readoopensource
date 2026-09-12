import { sendTemplateEmail } from "@/lib/email-templates/send-email";

/**
 * Daily/weekly review digest: selection + email rendering.
 *
 * Server-only (`.server.ts` is blocked from client bundles).
 */

export interface DigestHighlight {
  text: string;
  note: string | null;
  book_title: string;
  author: string | null;
  location: string | null;
}

/** Pick 3–5 highlights at random, biased to spread across different books. */
export function pickDigestHighlights(pool: DigestHighlight[], max = 5): DigestHighlight[] {
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const picked: DigestHighlight[] = [];
  const usedBooks = new Set<string>();

  // First pass: one per book, so a single heavily-highlighted book can't fill
  // the whole digest.
  for (const h of shuffled) {
    if (picked.length >= max) break;
    if (usedBooks.has(h.book_title)) continue;
    usedBooks.add(h.book_title);
    picked.push(h);
  }
  // Second pass: top up to at least 3 when there aren't enough books.
  for (const h of shuffled) {
    if (picked.length >= Math.min(max, pool.length)) break;
    if (picked.includes(h)) continue;
    picked.push(h);
  }
  return picked.slice(0, max);
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** Plain-HTML digest in the app's velvet palette (email clients need inline CSS). */
export function renderDigestHtml(highlights: DigestHighlight[], appUrl: string): string {
  const items = highlights
    .map(
      (h) => `
      <tr><td style="padding:0 0 26px 0">
        <div style="border-left:2px solid #c69a4e;padding-left:16px">
          <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.65;color:#241a2b">${escape(h.text)}</p>
          ${h.note ? `<p style="margin:10px 0 0 0;font-family:Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b6070"><em>Note:</em> ${escape(h.note)}</p>` : ""}
          <p style="margin:10px 0 0 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.04em;color:#8a7f92">
            ${escape(h.book_title)}${h.author ? ` &middot; ${escape(h.author)}` : ""}${h.location ? ` &middot; ${escape(h.location)}` : ""}
          </p>
        </div>
      </td></tr>`,
    )
    .join("");

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#ffffff">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff">
    <tr><td align="center" style="padding:32px 20px">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px">
        <tr><td style="padding-bottom:8px">
          <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#a9853f">Daily review</p>
          <h1 style="margin:8px 0 0 0;font-family:Georgia,serif;font-size:26px;font-weight:600;color:#1c1220">Things worth keeping</h1>
          <p style="margin:8px 0 24px 0;font-family:Arial,sans-serif;font-size:13px;color:#6b6070">${highlights.length} highlights from your library.</p>
        </td></tr>
        ${items}
        <tr><td style="padding-top:8px;border-top:1px solid #e6dfd6">
          <p style="margin:16px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8a7f92">
            <a href="${appUrl}/highlights" style="color:#a9853f;text-decoration:none">Open your library in Reado</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function renderDigestText(highlights: DigestHighlight[]): string {
  return highlights
    .map(
      (h) =>
        `"${h.text}"\n  — ${h.book_title}${h.author ? `, ${h.author}` : ""}${h.location ? ` (${h.location})` : ""}${h.note ? `\n  Note: ${h.note}` : ""}`,
    )
    .join("\n\n");
}

export type DigestSendResult =
  | { sent: true }
  | { sent: false; reason: string };

/**
 * Hand the digest to Lovable's managed email sender.
 *
 * The template registry is scaffolded once an email sender domain is set up;
 * until then this reports `email_not_configured` instead of throwing, so the
 * scheduled job stays healthy and the in-app review page keeps working.
 */
export async function sendDigestEmail(
  to: string,
  highlights: DigestHighlight[],
  appUrl: string,
): Promise<DigestSendResult> {
  try {
    const result = await sendTemplateEmail("daily-review", to, {
      templateData: { highlights, appUrl },
      idempotencyKey: `digest-${to}-${new Date().toISOString().slice(0, 10)}`,
    });
    return result.sent ? { sent: true } : { sent: false, reason: result.reason ?? "not_sent" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Cannot find module|Failed to (resolve|load)/i.test(message)) {
      return { sent: false, reason: "email_not_configured" };
    }
    return { sent: false, reason: message };
  }
}
