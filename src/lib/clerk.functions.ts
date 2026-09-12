"use server";

import { createServerFn } from "@/lib/next-server-fn";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const onboardingSchema = z.object({
  display_name: z.string().trim().min(1).max(120),
  digest_frequency: z.enum(["daily", "weekly"]),
  reading_goals: z.array(z.string().trim().min(1).max(80)).max(6),
});

async function getVerifiedEmails(userId: string) {
  const loadClerkServer = new Function("return import('@clerk/nextjs/server')") as () => Promise<typeof import("@clerk/nextjs/server")>;
  const { clerkClient } = await loadClerkServer();
  const clerkUser = await (await clerkClient()).users.getUser(userId);
  const emails = clerkUser.emailAddresses
    .filter((address) => address.verification?.status === "verified")
    .map((address) => address.emailAddress);
  const primary = clerkUser.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)?.emailAddress ?? null;
  return { emails, primary: primary && emails.includes(primary) ? primary : emails[0] ?? null };
}

export const syncClerkProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { emails, primary } = await getVerifiedEmails(context.userId);
    const { data: existing, error: readError } = await context.supabase
      .from("profiles")
      .select("display_name, digest_frequency, reading_goals, onboarding_completed, digest_email")
      .eq("id", context.userId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    const selectedEmail = existing?.digest_email && emails.includes(existing.digest_email) ? existing.digest_email : primary;
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        email: primary,
        linked_emails: emails,
        digest_email: selectedEmail,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { email: primary, linked_emails: emails, digest_email: selectedEmail };
  });

export const updateDigestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ email: z.string().email().max(320) }).parse(data))
  .handler(async ({ data, context }) => {
    const { emails } = await getVerifiedEmails(context.userId);
    if (!emails.includes(data.email)) throw new Error("Choose a verified email linked to your Clerk account.");
    const { error } = await context.supabase.from("profiles").update({ digest_email: data.email, email: data.email, linked_emails: emails }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { email: data.email, linked_emails: emails };
  });

export const getOnboarding = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("display_name, digest_frequency, reading_goals, onboarding_completed")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const saveOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => onboardingSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { emails, primary } = await getVerifiedEmails(context.userId);
    const { data: existing } = await context.supabase.from("profiles").select("digest_email").eq("id", context.userId).maybeSingle();
    const digestEmail = existing?.digest_email && emails.includes(existing.digest_email) ? existing.digest_email : primary;
    const { error } = await context.supabase.from("profiles").upsert(
      {
        id: context.userId,
        email: digestEmail ?? primary,
        digest_email: digestEmail,
        linked_emails: emails,
        display_name: data.display_name,
        digest_frequency: data.digest_frequency,
        reading_goals: data.reading_goals,
        onboarding_completed: true,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
