import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@/lib/data";
import { useServerFn } from "@/lib/next-server-fn";
import { useState } from "react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/RequireAuth";
import {
  ALL_DAYS,
  TIME_PRESETS,
  serializeDigestSchedule,
  formatTimeDisplay,
  type DigestSchedule,
  type DigestCadence,
} from "@/lib/digest-schedule";

const GOALS = [
  "Remember what I read",
  "Build lasting reading habits",
  "Connect ideas across books",
  "Think more deeply",
];

export function OnboardingPage() {
  return (
    <RequireAuth>
      <OnboardingForm />
    </RequireAuth>
  );
}

function OnboardingForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const getOnboardingFn = useServerFn("getOnboarding");
  const saveOnboardingFn = useServerFn("saveOnboarding");
  const profile = useQuery({ queryKey: ["onboarding"], queryFn: () => getOnboardingFn() });

  const [name, setName] = useState("");
  const [goals, setGoals] = useState<string[]>(["Remember what I read"]);

  // Digest schedule preferences
  const [cadence, setCadence] = useState<DigestCadence>("daily");
  const [selectedTime, setSelectedTime] = useState("08:00");
  const [isCustomTime, setIsCustomTime] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "mon", "tue", "wed", "thu", "fri", "sat", "sun",
  ]);
  const [quotesPerEmail, setQuotesPerEmail] = useState<number>(5);

  const save = useMutation({
    mutationFn: saveOnboardingFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Your memory routine is set. Welcome to Reado!");
      router.replace("/review");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not save your preferences"),
  });

  if (profile.isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="eyebrow">Reado</p>
      </div>
    );
  if (profile.data?.onboarding_completed) {
    router.replace("/review");
    return null;
  }

  function handleCadenceChange(next: DigestCadence) {
    setCadence(next);
    if (next === "daily") {
      setSelectedDays(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]);
    } else if (next === "weekdays") {
      setSelectedDays(["mon", "tue", "wed", "thu", "fri"]);
    } else if (next === "3x_week") {
      setSelectedDays(["mon", "wed", "fri"]);
    } else if (next === "weekly") {
      setSelectedDays(["sun"]);
    }
  }

  function toggleDay(dayId: string) {
    let next: string[];
    if (selectedDays.includes(dayId)) {
      if (selectedDays.length === 1) {
        toast.error("Choose at least 1 day per week");
        return;
      }
      next = selectedDays.filter((d) => d !== dayId);
    } else {
      next = [...selectedDays, dayId];
    }
    setSelectedDays(next);
    setCadence("custom");
  }

  function toggleGoal(goal: string) {
    setGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const schedule: DigestSchedule = {
      cadence,
      time: selectedTime,
      emailsPerWeek: selectedDays.length,
      highlightsPerEmail: quotesPerEmail,
      days: selectedDays,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };

    save.mutate({
      data: {
        display_name: name,
        digest_frequency: serializeDigestSchedule(schedule),
        reading_goals: goals,
      },
    });
  }

  const isPresetTime = TIME_PRESETS.some((p) => p.time === selectedTime);

  return (
    <div className="min-h-screen bg-background px-5 py-12 text-foreground">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Welcome to Reado</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
          Remember what you read.
        </h1>
        <p className="mt-3 font-body text-base leading-relaxed text-muted-foreground">
          Reado quietly brings back the quotes you found meaningful, delivered on your exact rhythm.
        </p>

        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          {/* Name */}
          <label className="block">
            <span className="eyebrow">Your name</span>
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="What should we call you?"
              className="mt-3 w-full rounded-lg bg-surface px-3.5 py-3 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground/70 focus:ring-primary"
            />
          </label>

          {/* Delivery Time */}
          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow">Delivery time</span>
              <span className="font-mono text-xs text-primary font-medium">
                {formatTimeDisplay(selectedTime)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              What time of day do you want your review email to arrive?
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {TIME_PRESETS.map((preset) => {
                const active = selectedTime === preset.time && !isCustomTime;
                return (
                  <button
                    key={preset.time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(preset.time);
                      setIsCustomTime(false);
                    }}
                    className={`rounded-lg border p-2.5 text-center transition-all ${
                      active
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border bg-surface/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    <span className="block font-mono text-sm">{preset.label}</span>
                    <span className="mt-0.5 block text-[10px] opacity-80">{preset.desc.split(" ")[0]}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className={`text-xs underline-offset-4 transition-colors hover:underline ${
                  isCustomTime ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {isCustomTime ? "Using exact custom time:" : "Choose a custom exact time"}
              </button>
              {isCustomTime && (
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value || "08:00")}
                  className="rounded-md border border-border bg-surface px-2.5 py-1 font-mono text-xs text-foreground outline-none focus:border-primary"
                />
              )}
            </div>
          </div>

          {/* Number of emails / frequency */}
          <fieldset>
            <div className="flex items-center justify-between">
              <legend className="eyebrow">Email frequency</legend>
              <span className="text-xs text-muted-foreground font-mono">
                {selectedDays.length} {selectedDays.length === 1 ? "email" : "emails"} / week
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              How many times a week should Reado resurface your highlights?
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {[
                { id: "daily", label: "Every day", desc: "7 emails / week (morning routine)" },
                { id: "weekdays", label: "Weekdays", desc: "5 emails / week (Mon–Fri)" },
                { id: "3x_week", label: "3 days / week", desc: "3 emails / week (Mon, Wed, Fri)" },
                { id: "weekly", label: "Weekly digest", desc: "1 email / week (Sunday calm)" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`cursor-pointer rounded-lg border p-3.5 transition-colors ${
                    cadence === opt.id ? "border-primary bg-surface" : "border-border bg-surface/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="cadence"
                    checked={cadence === opt.id}
                    onChange={() => handleCadenceChange(opt.id as DigestCadence)}
                    className="sr-only"
                  />
                  <span className="font-display text-sm font-semibold">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{opt.desc}</span>
                </label>
              ))}
            </div>

            {/* Custom Days Picker */}
            <div className="mt-3 rounded-lg border border-border bg-surface/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Or customize days:</span>
                <span className="text-[11px] text-muted-foreground">
                  Click any day to toggle
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {ALL_DAYS.map((day) => {
                  const active = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`h-8 w-11 rounded-md text-xs font-mono font-medium transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-surface text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </fieldset>

          {/* Quotes per email */}
          <div>
            <div className="flex items-center justify-between">
              <span className="eyebrow">Highlights per email</span>
              <span className="font-mono text-xs text-primary font-medium">
                {quotesPerEmail} quotes
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Small doses stick best. Pick how many quotes to reflect on per email.
            </p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuotesPerEmail(num)}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    quotesPerEmail === num
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-border bg-surface/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  <span className="block font-mono text-base">{num}</span>
                  <span className="text-[11px] opacity-80">
                    {num === 3 ? "Bite-sized" : num === 5 ? "Recommended" : "Deep dive"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <fieldset>
            <legend className="eyebrow">What are you reading for?</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {GOALS.map((goal) => (
                <label
                  key={goal}
                  className={`cursor-pointer rounded-lg border p-3 text-xs transition-colors ${
                    goals.includes(goal) ? "border-primary bg-surface" : "border-border"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={goals.includes(goal)}
                    onChange={() => toggleGoal(goal)}
                    className="sr-only"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={save.isPending}
            className="brass-btn w-full py-3 text-[13px]"
          >
            {save.isPending ? "Saving your routine…" : "Enter your reading room"}
          </button>
        </form>
      </div>
    </div>
  );
}
