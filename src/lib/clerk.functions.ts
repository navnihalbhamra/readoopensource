import { z } from "zod";

import type { RpcContext, RpcRegistry } from "@/lib/rpc";

const onboardingSchema = z.object({
  display_name: z.string().trim().min(1).max(120),
  digest_frequency: z.string().trim().min(1).max(2000),
  reading_goals: z.array(z.string().trim().min(1).max(80)).max(6),
});

async function getVerifiedEmails(userId: string) {
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const emails = clerkUser.emailAddresses
    .filter((address) => address.verification?.status === "verified")
    .map((address) => address.emailAddress);
  const primary =
    clerkUser.emailAddresses.find((address) => address.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? null;
  return {
    emails,
    primary: primary && emails.includes(primary) ? primary : (emails[0] ?? null),
  };
}

export async function syncClerkProfile(ctx: RpcContext, _data: unknown) {
  try {
    const { emails, primary } = await getVerifiedEmails(ctx.userId);
    try {
      const { data: existing } = await ctx.supabase
        .from("profiles")
        .select("display_name, digest_frequency, reading_goals, onboarding_completed, digest_email")
        .eq("id", ctx.userId)
        .maybeSingle();
      const selectedEmail =
        existing?.digest_email && emails.includes(existing.digest_email)
          ? existing.digest_email
          : primary;
      await ctx.supabase
        .from("profiles")
        .upsert(
          { id: ctx.userId, email: primary, linked_emails: emails, digest_email: selectedEmail },
          { onConflict: "id" },
        );
      return { email: primary, linked_emails: emails, digest_email: selectedEmail };
    } catch {
      return { email: primary, linked_emails: emails, digest_email: primary };
    }
  } catch (err) {
    console.warn("[Clerk Sync] Error:", (err as Error).message);
    return { email: null, linked_emails: [], digest_email: null };
  }
}

export async function updateDigestEmail(ctx: RpcContext, data: unknown) {
  const input = z.object({ email: z.string().email().max(320) }).parse(data);
  const { emails } = await getVerifiedEmails(ctx.userId);
  if (!emails.includes(input.email))
    throw new Error("Choose a verified email linked to your Clerk account.");
  const { error } = await ctx.supabase
    .from("profiles")
    .update({ digest_email: input.email, email: input.email, linked_emails: emails })
    .eq("id", ctx.userId);
  if (error) throw new Error(error.message);
  return { email: input.email, linked_emails: emails };
}

export async function getOnboarding(ctx: RpcContext, _data: unknown) {
  const { data, error } = await ctx.supabase
    .from("profiles")
    .select("display_name, digest_frequency, reading_goals, onboarding_completed")
    .eq("id", ctx.userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function saveOnboarding(ctx: RpcContext, data: unknown) {
  const input = onboardingSchema.parse(data);
  const { emails, primary } = await getVerifiedEmails(ctx.userId);
  const { data: existing } = await ctx.supabase
    .from("profiles")
    .select("digest_email")
    .eq("id", ctx.userId)
    .maybeSingle();
  const digestEmail =
    existing?.digest_email && emails.includes(existing.digest_email)
      ? existing.digest_email
      : primary;
  const { error } = await ctx.supabase.from("profiles").upsert(
    {
      id: ctx.userId,
      email: digestEmail ?? primary,
      digest_email: digestEmail,
      linked_emails: emails,
      display_name: input.display_name,
      digest_frequency: input.digest_frequency,
      reading_goals: input.reading_goals,
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
  return { ok: true };
}

export const serverFunctions = {
  syncClerkProfile: { method: "POST", handler: syncClerkProfile },
  updateDigestEmail: { method: "POST", handler: updateDigestEmail },
  getOnboarding: { method: "GET", handler: getOnboarding },
  saveOnboarding: { method: "POST", handler: saveOnboarding },
} satisfies RpcRegistry;
