import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { RequireAuth } from "@/components/RequireAuth";
import { Spinner } from "@/components/Spinner";
import { TypeControls } from "@/components/TypeControls";
import { DigestScheduleSettings } from "@/components/DigestScheduleSettings";
import { useReaderPrefs } from "@/hooks/useReaderPrefs";
import { planLabel } from "@/lib/plan";
import { DEFAULT_DIGEST_SCHEDULE } from "@/lib/digest-schedule";

export function Settings() {
  const { prefs, update } = useReaderPrefs();
  const queryClient = useQueryClient();
  const profile = useQuery({ queryKey: ["profile"], queryFn: useServerFn("getProfile") });
  const sync = useMutation({
    mutationFn: useServerFn("syncClerkProfile"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
    onError: () => undefined,
  });
  const changeEmail = useMutation({
    mutationFn: useServerFn("updateDigestEmail"),
    onSuccess: () => {
      toast.success("Digest inbox updated");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  // Sync Clerk's profile once on mount; `mutate` is stable across renders.
  const { mutate: syncMutate } = sync;
  useEffect(() => {
    syncMutate(undefined);
  }, [syncMutate]);
  const save = useMutation({
    mutationFn: useServerFn("updateDigestSettings"),
    onSuccess: () => {
      toast.success("Digest settings saved");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const testSend = useMutation({
    mutationFn: useServerFn("sendTestDigest"),
    onSuccess: (result: { sent: boolean; to?: string; reason?: string }) => {
      if (result.sent) toast.success(`Digest sent to ${result.to}`);
      else
        toast.error(
          result.reason === "email_not_configured"
            ? "Email sending isn't verified yet — DNS is still propagating."
            : `Not sent: ${result.reason}`,
        );
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const emails = profile.data?.linked_emails ?? [];
  const entitlements = profile.data?.entitlements;
  return (
    <AppShell prefs={prefs} update={update} eyebrow="Settings">
      <div className="pt-8 pb-6">
        <p className="eyebrow">Preferences</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance">
          Settings
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          {profile.data?.display_name || profile.data?.email}
        </p>
      </div>
      <section className="border-t border-border py-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Your plan</p>
            <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
              {planLabel(profile.data?.plan)}
            </h2>
            <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
              {entitlements?.highlightLimit === null
                ? `${entitlements.highlightCount} highlights saved · unlimited lifetime access`
                : `${entitlements?.highlightCount ?? 0} of ${entitlements?.highlightLimit ?? 5} free preview highlights saved`}
            </p>
          </div>
          {entitlements?.highlightLimit !== null ? (
            <Link href="/pricing" className="brass-btn">
              Get Founder Pass ($49)
            </Link>
          ) : (
            <span className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              Lifetime Member
            </span>
          )}
        </div>
        {entitlements?.highlightLimit !== null && (
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-inkwash">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{
                width: `${Math.min(100, ((entitlements?.highlightCount ?? 0) / (entitlements?.highlightLimit ?? 5)) * 100)}%`,
              }}
            />
          </div>
        )}
      </section>
      <section className="border-t border-border py-7">
        <h2 className="font-display text-xl font-semibold tracking-tight">Memory routine & schedule</h2>
        <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
          Reado exists for one purpose: helping you remember what you read. Customize your delivery
          time, number of emails, and how many quotes to reflect upon.
        </p>
        <div className="mt-6">
          <DigestScheduleSettings
            initialEnabled={profile.data?.digest_enabled ?? true}
            initialSchedule={profile.data?.schedule ?? DEFAULT_DIGEST_SCHEDULE}
            destinationEmail={profile.data?.digest_email ?? profile.data?.email ?? ""}
            linkedEmails={emails}
            isPendingSave={save.isPending}
            isPendingTest={testSend.isPending}
            lastDigestAt={profile.data?.last_digest_at}
            onSave={(payload) => save.mutate({ data: payload })}
            onSendTest={(count) => testSend.mutate({ data: { highlightsCount: count } })}
          />
        </div>
      </section>
      <section className="border-t border-border py-7 pb-16">
        <h2 className="font-display text-xl font-semibold tracking-tight">Reading comfort</h2>
        <p className="mt-1.5 font-body text-[13px] text-muted-foreground">
          Calm typography and measure settings for focused reading.
        </p>
        <div className="mt-4">
          <TypeControls prefs={prefs} update={update} />
        </div>
      </section>
    </AppShell>
  );
}
