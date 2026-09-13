import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { RequireAuth } from "@/components/RequireAuth";
import { getOnboarding, saveOnboarding } from "@/lib/clerk.functions";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up Reado" },
      { name: "description", content: "Choose your Reado reading goals and email review schedule." },
      { property: "og:title", content: "Set up Reado" },
      { property: "og:description", content: "Choose your Reado reading goals and email review schedule." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OnboardingPage,
});

const GOALS = ["Read more consistently", "Remember what I read", "Build a personal library", "Think more deeply"];

function OnboardingPage() {
  return <RequireAuth><OnboardingForm /></RequireAuth>;
}

function OnboardingForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const getOnboardingFn = useServerFn(getOnboarding);
  const saveOnboardingFn = useServerFn(saveOnboarding);
  const profile = useQuery({ queryKey: ["onboarding"], queryFn: () => getOnboardingFn() });
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [goals, setGoals] = useState<string[]>([]);
  const save = useMutation({
    mutationFn: saveOnboardingFn,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["onboarding"] });
      toast.success("Your reading room is ready");
      navigate({ to: "/review", replace: true });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not save your preferences"),
  });

  if (profile.isLoading) return <div className="flex min-h-screen items-center justify-center bg-background"><p className="eyebrow">Reado</p></div>;
  if (profile.data?.onboarding_completed) {
    navigate({ to: "/review", replace: true });
    return null;
  }

  function toggleGoal(goal: string) {
    setGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]);
  }

  return (
    <div className="min-h-screen bg-background px-5 py-12 text-foreground">
      <div className="mx-auto max-w-xl">
        <p className="eyebrow">Welcome to Reado</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">Make it yours.</h1>
        <p className="mt-3 font-body text-base leading-relaxed text-muted-foreground">A couple of choices, then you can start importing the words worth keeping.</p>
        <form className="mt-10 space-y-8" onSubmit={(event) => { event.preventDefault(); save.mutate({ data: { display_name: name, digest_frequency: frequency, reading_goals: goals } }); }}>
          <label className="block"><span className="eyebrow">Your name</span><input required value={name} onChange={(event) => setName(event.target.value)} placeholder="What should we call you?" className="mt-3 w-full rounded-lg bg-surface px-3.5 py-3 text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground/70 focus:ring-primary" /></label>
          <fieldset><legend className="eyebrow">Email review</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{(["daily", "weekly"] as const).map((value) => <label key={value} className={`cursor-pointer rounded-lg border p-4 transition-colors ${frequency === value ? "border-primary bg-surface" : "border-border"}`}><input type="radio" name="frequency" value={value} checked={frequency === value} onChange={() => setFrequency(value)} className="sr-only" /><span className="font-display text-base font-semibold capitalize">{value}</span><span className="mt-1 block text-sm text-muted-foreground">{value === "daily" ? "A small reminder every day" : "A slower weekly reflection"}</span></label>)}</div></fieldset>
          <fieldset><legend className="eyebrow">What are you reading for?</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">{GOALS.map((goal) => <label key={goal} className={`cursor-pointer rounded-lg border p-4 text-sm transition-colors ${goals.includes(goal) ? "border-primary bg-surface" : "border-border"}`}><input type="checkbox" checked={goals.includes(goal)} onChange={() => toggleGoal(goal)} className="sr-only" /><span>{goal}</span></label>)}</div></fieldset>
          <button type="submit" disabled={save.isPending} className="brass-btn w-full py-3 text-[13px]">{save.isPending ? "Saving…" : "Enter your reading room"}</button>
        </form>
      </div>
    </div>
  );
}
