import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { AssessmentProvider, useAssessment } from "@/context/assessment";
import {
  BUDGET_OPTIONS,
  COUNSELING_OPTIONS,
  DEGREE_MODES,
  INTEREST_OPTIONS,
  SKILL_OPTIONS,
} from "@/lib/assessment";
import { submitAssessment } from "@/lib/career.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Career Assessment | PathwayAI" },
      {
        name: "description",
        content:
          "Complete a 6-step assessment covering education, skills, interests, goals and higher education plans to get your AI career report.",
      },
      { property: "og:title", content: "Career Assessment | PathwayAI" },
      {
        property: "og:description",
        content: "Six quick steps to your personalized AI career report.",
      },
    ],
  }),
  component: () => (
    <AssessmentProvider>
      <AssessmentPage />
    </AssessmentProvider>
  ),
});

const STEP_TITLES = [
  "Personal Information",
  "Education Details",
  "Skills Assessment",
  "Your Interests",
  "Career Goals",
  "Higher Education",
];

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="glass h-11 rounded-xl border-transparent"
      />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200",
        active
          ? "hero-gradient border-transparent text-primary-foreground shadow-md"
          : "glass border-transparent text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function OptionCard({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "glass rounded-2xl px-4 py-4 text-left text-sm font-medium transition-all",
        active ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : "hover:-translate-y-0.5",
      )}
    >
      {label}
    </button>
  );
}

function AssessmentPage() {
  const { data, update, toggle, step, setStep } = useAssessment();
  const [customSkill, setCustomSkill] = useState("");
  const navigate = useNavigate();
  const submit = useServerFn(submitAssessment);

  const mutation = useMutation({
    mutationFn: (payload: typeof data) => submit({ data: payload }),
    onSuccess: (res) => {
      toast.success("Your AI career report is ready");
      navigate({ to: "/report/$reportId", params: { reportId: res.reportId } });
    },
    onError: (e: Error) => toast.error(e.message || "Something went wrong. Please try again."),
  });

  const progress = ((step + 1) / 6) * 100;

  function validate() {
    if (step === 0) {
      if (!data.name.trim() || !data.email.trim() || !data.phone.trim() || !data.city.trim() || !data.state.trim()) {
        toast.error("Please fill in all required fields");
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        toast.error("Please enter a valid email address");
        return false;
      }
    }
    if (step === 2 && data.skills.length === 0) {
      toast.error("Select at least one skill");
      return false;
    }
    if (step === 3 && data.interests.length === 0) {
      toast.error("Select at least one interest");
      return false;
    }
    if (step === 5 && (!data.degreeMode || !data.counseling)) {
      toast.error("Please answer the higher education questions");
      return false;
    }
    return true;
  }

  function next() {
    if (!validate()) return;
    if (step === 5) {
      mutation.mutate(data);
      return;
    }
    setStep(step + 1);
  }

  return (
    <div className="aurora min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Step {step + 1} of 6
            </p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{STEP_TITLES[step]}</h1>
          </div>
          <span className="font-display text-2xl font-extrabold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2 rounded-full" />

        <div className="glass-strong animate-rise mt-8 rounded-3xl p-6 sm:p-8">
          {step === 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Full Name" required value={data.name} onChange={(v) => update({ name: v })} placeholder="Ananya Sharma" />
              </div>
              <Field label="Email" required type="email" value={data.email} onChange={(v) => update({ email: v })} placeholder="you@example.com" />
              <Field label="Phone Number" required value={data.phone} onChange={(v) => update({ phone: v })} placeholder="+91 98765 43210" />
              <Field label="City" required value={data.city} onChange={(v) => update({ city: v })} placeholder="Bengaluru" />
              <Field label="State" required value={data.state} onChange={(v) => update({ state: v })} placeholder="Karnataka" />
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Current Education" value={data.education} onChange={(v) => update({ education: v })} placeholder="Undergraduate" />
              <Field label="Degree / Course" value={data.course} onChange={(v) => update({ course: v })} placeholder="B.Tech Computer Science" />
              <div className="sm:col-span-2">
                <Field label="College / University" value={data.college} onChange={(v) => update({ college: v })} placeholder="VIT Vellore" />
              </div>
              <Field label="Current Year / Semester" value={data.year} onChange={(v) => update({ year: v })} placeholder="3rd Year / 6th Sem" />
              <Field label="CGPA / Percentage" value={data.cgpa} onChange={(v) => update({ cgpa: v })} placeholder="8.4 CGPA" />
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">
                Select every skill you already have some experience with.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {[...SKILL_OPTIONS, ...data.skills.filter((s) => !SKILL_OPTIONS.includes(s))].map((s) => (
                  <Chip key={s} label={s} active={data.skills.includes(s)} onClick={() => toggle("skills", s)} />
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Input
                  value={customSkill}
                  placeholder="Add a custom skill"
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (customSkill.trim()) {
                        toggle("skills", customSkill.trim());
                        setCustomSkill("");
                      }
                    }
                  }}
                  className="glass h-11 rounded-xl border-transparent"
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-xl"
                  onClick={() => {
                    if (customSkill.trim()) {
                      toggle("skills", customSkill.trim());
                      setCustomSkill("");
                    }
                  }}
                >
                  <Plus className="size-4" /> Add
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">What genuinely excites you?</p>
              <div className="flex flex-wrap gap-2.5">
                {INTEREST_OPTIONS.map((s) => (
                  <Chip key={s} label={s} active={data.interests.includes(s)} onClick={() => toggle("interests", s)} />
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-medium">What is your dream career?</Label>
                <Textarea
                  value={data.dreamCareer}
                  onChange={(e) => update({ dreamCareer: e.target.value })}
                  placeholder="I want to build AI products that solve real problems..."
                  className="glass min-h-24 rounded-xl border-transparent"
                />
              </div>
              <Field label="Preferred job role" value={data.jobRole} onChange={(v) => update({ jobRole: v })} placeholder="Machine Learning Engineer" />
              <Field label="Preferred industry" value={data.industry} onChange={(v) => update({ industry: v })} placeholder="Technology / Product" />
              <Field label="Preferred work location" value={data.workLocation} onChange={(v) => update({ workLocation: v })} placeholder="Bengaluru or Remote" />
              <Field label="Expected salary range" value={data.salaryRange} onChange={(v) => update({ salaryRange: v })} placeholder="₹8-15 LPA" />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div>
                <Label className="text-sm font-semibold">
                  How are you planning to pursue your next degree?
                </Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {DEGREE_MODES.map((m) => (
                    <OptionCard key={m} label={m} active={data.degreeMode === m} onClick={() => update({ degreeMode: m })} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">
                  Would you like help choosing the right degree, university, or specialization?
                </Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {COUNSELING_OPTIONS.map((m) => (
                    <OptionCard key={m} label={m} active={data.counseling === m} onClick={() => update({ counseling: m })} />
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold">Preferred budget</Label>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {BUDGET_OPTIONS.map((m) => (
                    <OptionCard key={m} label={m} active={data.budget === m} onClick={() => update({ budget: m })} />
                  ))}
                </div>
              </div>
              <Field
                label="Specialization you're curious about (optional)"
                value={data.specialization}
                onChange={(v) => update({ specialization: v })}
                placeholder="Data Science, Cloud, Finance..."
              />
            </div>
          )}

          <div className="mt-9 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              disabled={step === 0 || mutation.isPending}
              onClick={() => setStep(step - 1)}
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button type="button" className="rounded-xl px-6" onClick={next} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Building your report…
                </>
              ) : step === 5 ? (
                <>
                  <Sparkles className="size-4" /> Generate AI Report
                </>
              ) : (
                <>
                  Continue <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {mutation.isPending && (
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Six AI engines are analysing your profile — this usually takes 20-40 seconds.
          </p>
        )}
      </main>
    </div>
  );
}
