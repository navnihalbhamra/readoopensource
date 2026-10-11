"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/Spinner";
import {
  ALL_DAYS,
  DEFAULT_DIGEST_SCHEDULE,
  TIME_PRESETS,
  formatScheduleSummary,
  formatTimeDisplay,
  serializeDigestSchedule,
  type DigestCadence,
  type DigestSchedule,
} from "@/lib/digest-schedule";

interface Props {
  initialEnabled: boolean;
  initialSchedule: DigestSchedule;
  destinationEmail: string;
  linkedEmails: string[];
  isPendingSave: boolean;
  isPendingTest: boolean;
  lastDigestAt?: string | null;
  onSave: (payload: {
    digest_enabled: boolean;
    digest_frequency: string;
    digest_email?: string;
  }) => void;
  onSendTest: (count: number) => void;
}

export function DigestScheduleSettings({
  initialEnabled,
  initialSchedule,
  destinationEmail,
  linkedEmails,
  isPendingSave,
  isPendingTest,
  lastDigestAt,
  onSave,
  onSendTest,
}: Props) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [schedule, setSchedule] = useState<DigestSchedule>(initialSchedule);
  const [email, setEmail] = useState(destinationEmail);
  const [customTime, setCustomTime] = useState(initialSchedule.time);

  // Auto-detect browser timezone
  const [timeZone, setTimeZone] = useState("UTC");
  useEffect(() => {
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    setEnabled(initialEnabled);
    setSchedule(initialSchedule);
    setCustomTime(initialSchedule.time);
    setEmail(destinationEmail);
  }, [initialEnabled, initialSchedule, destinationEmail]);

  const handleCadenceChange = (cadence: DigestCadence) => {
    if (cadence === "daily") {
      setSchedule((prev) => ({
        ...prev,
        cadence: "daily",
        emailsPerWeek: 7,
        days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      }));
    } else if (cadence === "weekdays") {
      setSchedule((prev) => ({
        ...prev,
        cadence: "weekdays",
        emailsPerWeek: 5,
        days: ["mon", "tue", "wed", "thu", "fri"],
      }));
    } else if (cadence === "3x_week") {
      setSchedule((prev) => ({
        ...prev,
        cadence: "3x_week",
        emailsPerWeek: 3,
        days: ["mon", "wed", "fri"],
      }));
    } else if (cadence === "weekly") {
      setSchedule((prev) => ({
        ...prev,
        cadence: "weekly",
        emailsPerWeek: 1,
        days: ["sun"],
      }));
    } else {
      setSchedule((prev) => ({
        ...prev,
        cadence: "custom",
      }));
    }
  };

  const toggleDay = (dayId: string) => {
    setSchedule((prev) => {
      const exists = prev.days.includes(dayId);
      const newDays = exists
        ? prev.days.filter((d) => d !== dayId)
        : [...prev.days, dayId];
      // Keep at least one day
      if (newDays.length === 0) return prev;
      return {
        ...prev,
        cadence: "custom",
        days: newDays,
        emailsPerWeek: newDays.length,
      };
    });
  };

  const handleSave = () => {
    onSave({
      digest_enabled: enabled,
      digest_frequency: serializeDigestSchedule({ ...schedule, timezone: timeZone }),
      digest_email: email,
    });
  };

  return (
    <div className="space-y-6">
      {/* Enable toggle */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
        <div>
          <h3 className="font-display text-base font-semibold">Email reflections</h3>
          <p className="mt-0.5 font-body text-xs text-muted-foreground">
            Resurface passages directly in your inbox to keep thoughts alive.
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-border transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-foreground after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-background" />
        </label>
      </div>

      {enabled && (
        <div className="space-y-6 rounded-xl border border-border/80 bg-surface/20 p-5">
          {/* 1. Delivery Time */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="font-display text-sm font-semibold tracking-tight">
                Delivery time
              </label>
              <span className="text-[11px] font-medium text-muted-foreground">
                Timezone: <span className="text-foreground">{timeZone.replace("_", " ")}</span>
              </span>
            </div>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              When would you like your reading memory spark to land in your inbox?
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {TIME_PRESETS.map((preset) => {
                const isSelected = schedule.time === preset.time;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => {
                      setSchedule((prev) => ({ ...prev, time: preset.time }));
                      setCustomTime(preset.time);
                    }}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-surface/60 hover:border-border/80 hover:bg-surface"
                    }`}
                  >
                    <span className="font-display text-sm font-semibold text-foreground">
                      {preset.label}
                    </span>
                    <span className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      {preset.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Time Selector */}
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-border/60 bg-surface/30 p-2.5">
              <span className="font-body text-xs text-muted-foreground">Or pick exact time:</span>
              <input
                type="time"
                value={customTime}
                onChange={(e) => {
                  setCustomTime(e.target.value);
                  setSchedule((prev) => ({ ...prev, time: e.target.value }));
                }}
                className="rounded border border-border bg-surface px-2.5 py-1 font-mono text-xs text-foreground outline-none focus:border-primary"
              />
              <span className="font-body text-xs font-semibold text-accent">
                {formatTimeDisplay(schedule.time)}
              </span>
            </div>
          </div>

          {/* 2. Number of Emails per week / Frequency */}
          <div className="border-t border-border/60 pt-5">
            <div className="flex items-center justify-between">
              <label className="font-display text-sm font-semibold tracking-tight">
                Email frequency & rhythm
              </label>
              <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-display text-[11px] font-semibold text-accent">
                {schedule.emailsPerWeek} {schedule.emailsPerWeek === 1 ? "email" : "emails"} / week
              </span>
            </div>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              Choose how often you want to revisit your highlights.
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-4">
              {[
                { id: "daily", label: "Every day", sub: "7 emails / week", desc: "Best for deep retention" },
                { id: "weekdays", label: "Weekdays", sub: "5 emails / week", desc: "Mon – Fri cadence" },
                { id: "3x_week", label: "3x a week", sub: "3 emails / week", desc: "Mon, Wed, Fri" },
                { id: "weekly", label: "Once a week", sub: "1 email / week", desc: "Quiet weekend review" },
              ].map((cad) => {
                const isSelected = schedule.cadence === cad.id;
                return (
                  <button
                    key={cad.id}
                    type="button"
                    onClick={() => handleCadenceChange(cad.id as DigestCadence)}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-surface/60 hover:border-border/80 hover:bg-surface"
                    }`}
                  >
                    <span className="font-display text-sm font-semibold text-foreground">
                      {cad.label}
                    </span>
                    <span className="text-[11px] font-medium text-accent">{cad.sub}</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">{cad.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Day-of-Week Picker */}
            <div className="mt-3 rounded-lg border border-border/60 bg-surface/30 p-3">
              <p className="font-body text-xs text-muted-foreground">
                Or select exact days to receive emails:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ALL_DAYS.map((day) => {
                  const isActive = schedule.days.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`h-8 w-11 rounded font-display text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-background shadow"
                          : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Number of Highlights per Email */}
          <div className="border-t border-border/60 pt-5">
            <div className="flex items-center justify-between">
              <label className="font-display text-sm font-semibold tracking-tight">
                Passages per email
              </label>
              <span className="font-display text-xs font-semibold text-accent">
                {schedule.highlightsPerEmail} quotes
              </span>
            </div>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              How many highlights should surface in each reflection email?
            </p>

            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { count: 3, label: "3 quotes", time: "~2 min read", desc: "Quick memory spark" },
                { count: 5, label: "5 quotes", time: "~5 min read", desc: "Balanced daily reflection" },
                { count: 10, label: "10 quotes", time: "~10 min read", desc: "Deep recall session" },
              ].map((item) => {
                const isSelected = schedule.highlightsPerEmail === item.count;
                return (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setSchedule((prev) => ({ ...prev, highlightsPerEmail: item.count }))}
                    className={`flex flex-col items-start rounded-lg border p-3 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-surface/60 hover:border-border/80 hover:bg-surface"
                    }`}
                  >
                    <span className="font-display text-sm font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="text-[11px] font-medium text-accent">{item.time}</span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Destination Inbox */}
          <div className="border-t border-border/60 pt-5">
            <label className="font-display text-sm font-semibold tracking-tight">
              Destination inbox
            </label>
            <p className="mt-1 font-body text-xs text-muted-foreground">
              Choose which of your email addresses receives these digests.
            </p>

            <select
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2.5 w-full rounded-lg bg-surface px-3.5 py-2.5 font-body text-xs ring-1 ring-border outline-none focus:ring-primary"
            >
              {linkedEmails.map((addr) => (
                <option key={addr} value={addr}>
                  {addr}
                </option>
              ))}
              {!linkedEmails.includes(email) && email && (
                <option value={email}>{email}</option>
              )}
            </select>
          </div>

          {/* Schedule Summary Banner */}
          <div className="rounded-lg border border-accent/40 bg-accent/10 p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-accent">
                Your Memory Schedule
              </span>
            </div>
            <p className="mt-1 font-display text-sm font-semibold text-foreground">
              {formatScheduleSummary(schedule)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Delivered to <strong className="text-foreground/90">{email}</strong>
              {lastDigestAt && ` · Last sent ${new Date(lastDigestAt).toLocaleDateString()}`}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPendingSave}
              className="brass-btn"
            >
              {isPendingSave && <Spinner label="Saving schedule" />}
              {isPendingSave ? "Saving…" : "Save schedule"}
            </button>

            <button
              type="button"
              onClick={() => onSendTest(schedule.highlightsPerEmail)}
              disabled={isPendingTest}
              className="chrome-btn"
            >
              {isPendingTest && <Spinner label="Sending test digest" />}
              {isPendingTest
                ? "Sending…"
                : `Send test email now (${schedule.highlightsPerEmail} quotes)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
