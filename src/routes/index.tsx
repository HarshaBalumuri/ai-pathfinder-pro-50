import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain,
  GraduationCap,
  Building2,
  Route as RouteIcon,
  Target,
  Headphones,
  ArrowRight,
  Sparkles,
  ClipboardList,
  Cpu,
  FileText,
  Users,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PathwayAI — Discover Your Ideal Career Path with AI" },
      {
        name: "description",
        content:
          "Personalized AI career guidance, degree recommendations, skill roadmaps and higher education counseling for students.",
      },
      { property: "og:title", content: "Discover Your Ideal Career Path with AI" },
      {
        property: "og:description",
        content:
          "Get an AI career report with skill gaps, degree and university recommendations, and a personalized action plan.",
      },
    ],
  }),
  component: Index,
});

const FEATURES = [
  {
    icon: Brain,
    title: "AI Career Analysis",
    body: "Deep analysis of your education, skills, interests and ambitions to surface the roles you'll thrive in.",
  },
  {
    icon: Target,
    title: "Skill Gap Assessment",
    body: "See exactly which skills you're missing and the priority order to close the gap fast.",
  },
  {
    icon: GraduationCap,
    title: "Degree Recommendations",
    body: "Matched degree programs and specializations for your goals, budget and preferred study mode.",
  },
  {
    icon: Building2,
    title: "University Suggestions",
    body: "Shortlisted institutions with fees, mode and location fit — verified info kept separate from AI ideas.",
  },
  {
    icon: RouteIcon,
    title: "Personalized Roadmap",
    body: "A 3-6 month sprint plan plus a 1-3 year progression path with certifications and milestones.",
  },
  {
    icon: Headphones,
    title: "Counseling Support",
    body: "Want a human? Our counselors pick up where the AI leaves off for admissions and specialization advice.",
  },
];

const STEPS = [
  { icon: ClipboardList, title: "Complete Assessment", body: "Six quick steps — under 4 minutes." },
  { icon: Cpu, title: "AI Analyzes Profile", body: "Six specialised AI models read your profile." },
  { icon: FileText, title: "Receive Career Report", body: "Matches, roadmap, degrees and universities." },
  { icon: Users, title: "Connect with Counselors", body: "Optional 1:1 higher-education guidance." },
];

function Index() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SiteHeader />
      </div>

      <main>
        {/* Hero */}
        <section className="aurora relative overflow-hidden px-4 pt-16 pb-24 sm:pt-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="glass animate-rise inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Sparkles className="size-3.5 text-accent" /> AI career intelligence for students
            </span>
            <h1 className="animate-rise font-display mt-6 text-4xl leading-[1.05] font-extrabold text-balance sm:text-6xl">
              Discover Your Ideal <span className="gradient-text">Career Path</span> with AI
            </h1>
            <p className="animate-rise mx-auto mt-6 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
              Get personalized career guidance, degree recommendations, skill roadmaps, and higher
              education counseling.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="rounded-xl px-7 text-base shadow-lg">
                <Link to="/assessment">
                  Start Assessment <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass rounded-xl px-7 text-base">
                <a href="#features">Learn More</a>
              </Button>
            </div>

            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-3 gap-3">
              {[
                ["5", "career matches"],
                ["6", "AI analysis engines"],
                ["<4 min", "to your report"],
              ].map(([big, small]) => (
                <div key={small} className="glass rounded-2xl px-3 py-5">
                  <div className="font-display gradient-text text-2xl font-extrabold sm:text-3xl">
                    {big}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{small}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold sm:text-4xl">Everything a career counselor does</h2>
              <p className="mt-3 text-muted-foreground">
                Built for students who want a decision, not a chatbot conversation.
              </p>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className="glass group rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <span className="hero-gradient mb-5 flex size-11 items-center justify-center rounded-2xl text-primary-foreground shadow-md">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="aurora relative px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">How it works</h2>
            <div className="mt-12 grid gap-5 md:grid-cols-4">
              {STEPS.map((s, i) => (
                <div key={s.title} className="glass relative rounded-3xl p-6">
                  <span className="font-display absolute -top-3 -left-2 flex size-9 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-foreground shadow">
                    {i + 1}
                  </span>
                  <s.icon className="mt-2 size-6 text-primary" />
                  <h3 className="mt-4 font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              ))}
            </div>

            <div className="glass-strong mt-16 flex flex-col items-center gap-5 rounded-[2rem] px-6 py-12 text-center">
              <h2 className="max-w-xl text-2xl font-bold text-balance sm:text-3xl">
                Your career report is 6 steps away
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Free, personalized, and instantly downloadable as a PDF.
              </p>
              <Button asChild size="lg" className="rounded-xl px-8">
                <Link to="/assessment">
                  Start Assessment <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} PathwayAI — AI Career Guidance & Counseling.</span>
          <Link to="/admin" className="hover:text-foreground">
            Counselor login
          </Link>
        </div>
      </footer>
    </div>
  );
}
