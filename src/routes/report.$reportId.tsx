import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import {
  Award,
  Building2,
  Download,
  GraduationCap,
  Mail,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SiteHeader } from "@/components/site-header";
import { ChatAssistant } from "@/components/chat-assistant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReport } from "@/lib/career.functions";
import { downloadReportPdf } from "@/lib/report-pdf";
import type { CareerReport } from "@/lib/assessment";

const reportQuery = (id: string) =>
  queryOptions({
    queryKey: ["report", id],
    queryFn: () => getReport({ data: { id } }) as Promise<CareerReport>,
    staleTime: 5 * 60 * 1000,
  });

export const Route = createFileRoute("/report/$reportId")({
  head: () => ({
    meta: [
      { title: "Your AI Career Report | PathwayAI" },
      {
        name: "description",
        content:
          "Personalized career matches, skill roadmap, degree and university recommendations, and a step-by-step action plan.",
      },
      { property: "og:title", content: "Your AI Career Report | PathwayAI" },
      {
        property: "og:description",
        content: "Career matches, skill gaps, degrees, universities and your action plan.",
      },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(reportQuery(params.reportId)),
  component: ReportPage,
});

function Section({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
          <Icon className="size-5 text-primary" /> {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function ReportPage() {
  const { reportId } = Route.useParams();
  const { data: report } = useSuspenseQuery(reportQuery(reportId));

  const careers = report.career_paths ?? [];
  const chartData = careers.map((c) => ({
    name: c.career.length > 18 ? `${c.career.slice(0, 17)}…` : c.career,
    match: c.match_percentage,
  }));
  const radarData = (report.skills_recommendation?.priority_skills ?? [])
    .slice(0, 6)
    .map((s, i) => ({ skill: s.length > 14 ? `${s.slice(0, 13)}…` : s, value: 90 - i * 8 }));

  function emailReport() {
    const subject = encodeURIComponent("My AI Career Report — PathwayAI");
    const body = encodeURIComponent(
      `Here is my career report link:\n${typeof window !== "undefined" ? window.location.href : ""}\n\nOverall recommendation:\n${report.overall_recommendation ?? ""}`,
    );
    window.location.href = `mailto:${report.student?.email ?? ""}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="aurora min-h-screen pb-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SiteHeader />
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Header / profile */}
        <div className="glass-strong animate-rise rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Career Report
              </p>
              <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">
                {report.student?.name ?? "Your"} <span className="gradient-text">career blueprint</span>
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {report.student?.city}
                {report.student?.state ? `, ${report.student.state}` : ""} ·{" "}
                {new Date(report.created_at).toLocaleDateString()}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="rounded-xl" onClick={() => downloadReportPdf(report)}>
                  <Download className="size-4" /> Download PDF
                </Button>
                <Button variant="outline" className="glass rounded-xl" onClick={emailReport}>
                  <Mail className="size-4" /> Email Report
                </Button>
                <Button asChild variant="ghost" className="rounded-xl">
                  <Link to="/assessment">Retake assessment</Link>
                </Button>
              </div>
            </div>

            <div className="glass w-full max-w-[15rem] rounded-2xl p-5 text-center">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Career match score</p>
              <div className="font-display gradient-text mt-2 text-5xl font-extrabold">
                {report.match_score ?? 0}%
              </div>
              <Progress value={report.match_score ?? 0} className="mt-4 h-2 rounded-full" />
              <p className="mt-3 text-xs text-muted-foreground">
                Readiness for your target career track
              </p>
            </div>
          </div>
        </div>

        {/* Overall recommendation */}
        <div className="hero-gradient mt-6 rounded-3xl p-[1.5px]">
          <div className="glass-strong rounded-[1.4rem] p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="size-5 text-accent" /> Overall AI Recommendation
            </h2>
            <p className="mt-3 leading-relaxed text-pretty text-muted-foreground">
              {report.overall_recommendation}
            </p>
          </div>
        </div>

        {/* Profile analysis */}
        <Section icon={Award} title="Career Profile">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["Strengths", report.profile_analysis?.strengths, "text-accent"],
              ["Areas to Improve", report.profile_analysis?.weaknesses, "text-destructive"],
              ["Opportunities", report.profile_analysis?.opportunities, "text-primary"],
            ].map(([title, items, color]) => (
              <div key={title as string} className="glass rounded-3xl p-6">
                <h3 className={`font-semibold ${color as string}`}>{title as string}</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {((items as string[]) ?? []).map((s) => (
                    <li key={s} className="flex gap-2">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-current" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* Career matches */}
        <Section icon={TrendingUp} title="Recommended Career Paths">
          <div className="glass mb-5 rounded-3xl p-5">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-popover)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    color: "var(--color-popover-foreground)",
                  }}
                />
                <Bar dataKey="match" radius={[8, 8, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {careers.map((c, i) => (
              <article key={c.career} className="glass rounded-3xl p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="secondary" className="mb-2 rounded-full">
                      Priority #{i + 1}
                    </Badge>
                    <h3 className="text-lg font-bold">{c.career}</h3>
                  </div>
                  <div className="text-right">
                    <div className="font-display gradient-text text-2xl font-extrabold">
                      {c.match_percentage}%
                    </div>
                    <span className="text-[0.7rem] text-muted-foreground">match</span>
                  </div>
                </div>
                <Progress value={c.match_percentage} className="mt-3 h-1.5 rounded-full" />
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.why_suitable}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="glass rounded-2xl p-3">
                    <p className="text-[0.7rem] text-muted-foreground uppercase">Salary</p>
                    <p className="font-medium">{c.expected_salary}</p>
                  </div>
                  <div className="glass rounded-2xl p-3">
                    <p className="text-[0.7rem] text-muted-foreground uppercase">Growth</p>
                    <p className="font-medium">{c.growth_potential}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(c.job_roles ?? []).map((r) => (
                    <Badge key={r} variant="outline" className="rounded-full font-normal">
                      {r}
                    </Badge>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Section>

        {/* Skills */}
        <Section icon={Target} title="Skills to Learn">
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            <div className="glass rounded-3xl p-6">
              <h3 className="font-semibold">Priority skills</h3>
              {radarData.length > 2 && (
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="var(--color-border)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
                    <Radar
                      dataKey="value"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {(report.skills_recommendation?.missing_skills ?? []).map((s) => (
                  <Badge key={s} variant="secondary" className="rounded-full font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              {(
                [
                  ["Beginner", report.skills_recommendation?.learning_path?.beginner],
                  ["Intermediate", report.skills_recommendation?.learning_path?.intermediate],
                  ["Advanced", report.skills_recommendation?.learning_path?.advanced],
                ] as const
              ).map(([level, items]) => (
                <div key={level} className="glass rounded-3xl p-5">
                  <h4 className="text-sm font-bold tracking-wide text-primary uppercase">{level}</h4>
                  <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    {(items ?? []).map((s) => (
                      <li key={s}>• {s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Degrees */}
        <Section icon={GraduationCap} title="Degree Recommendations">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(report.degree_recommendation ?? []).map((d) => (
              <article key={`${d.degree}-${d.specialization}`} className="glass rounded-3xl p-6">
                <h3 className="text-lg font-bold">{d.degree}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{d.specialization}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="rounded-full font-normal">
                    {d.duration}
                  </Badge>
                  <Badge variant="outline" className="rounded-full font-normal">
                    {d.mode}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d.why_it_fits}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* Universities */}
        <Section icon={Building2} title="University Suggestions">
          <div className="glass overflow-hidden rounded-3xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>University</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Estimated fees</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(report.university_recommendation ?? []).map((u) => (
                  <TableRow key={`${u.name}-${u.program}`}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">{u.location}</TableCell>
                    <TableCell className="text-muted-foreground">{u.program}</TableCell>
                    <TableCell className="text-muted-foreground">{u.mode}</TableCell>
                    <TableCell className="text-muted-foreground">{u.estimated_fees}</TableCell>
                    <TableCell>
                      <Badge
                        variant={u.source === "Verified Institution" ? "default" : "secondary"}
                        className="rounded-full font-normal"
                      >
                        {u.source}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* Action plan timeline */}
        <Section icon={Sparkles} title="Your Action Plan">
          <div className="grid gap-5 lg:grid-cols-2">
            {(
              [
                [
                  "Short-Term Plan · 3-6 Months",
                  [
                    ["Skills to learn", report.short_term_plan?.skills_to_learn],
                    ["Projects to build", report.short_term_plan?.projects_to_build],
                    ["Resume improvements", report.short_term_plan?.resume_improvements],
                    ["Internship preparation", report.short_term_plan?.internship_preparation],
                  ],
                ],
                [
                  "Long-Term Plan · 1-3 Years",
                  [
                    ["Degree path", report.long_term_plan?.degree_path],
                    ["Certifications", report.long_term_plan?.certifications],
                    ["Career progression", report.long_term_plan?.career_progression],
                    ["Higher education goals", report.long_term_plan?.higher_education_goals],
                  ],
                ],
              ] as const
            ).map(([title, groups]) => (
              <div key={title} className="glass rounded-3xl p-6">
                <h3 className="font-bold">{title}</h3>
                <div className="mt-5 border-l border-border pl-5">
                  {groups.map(([label, items]) => (
                    <div key={label} className="relative pb-6 last:pb-0">
                      <span className="hero-gradient absolute top-1.5 -left-[1.65rem] size-3 rounded-full ring-4 ring-background" />
                      <p className="text-sm font-semibold">{label}</p>
                      <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                        {((items as string[] | undefined) ?? []).map((s) => (
                          <li key={s}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      </main>

      <ChatAssistant reportId={reportId} />
    </div>
  );
}
