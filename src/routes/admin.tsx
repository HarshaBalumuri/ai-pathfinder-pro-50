import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Download, LogOut, ShieldCheck, Users, Target, Percent, Search } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { claimAdminRole, getAdminOverview, isCurrentUserAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Counselor Admin | PathwayAI" },
      {
        name: "description",
        content: "Protected admin dashboard for student assessments, lead pipeline and conversion analytics.",
      },
      { property: "og:title", content: "Counselor Admin | PathwayAI" },
      { property: "og:description", content: "Manage students, leads and conversions." },
    ],
  }),
  component: AdminPage,
});

function toCsv(rows: Record<string, unknown>[], filename: string) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) =>
    `"${String(v ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function AuthCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const { error } =
        mode === "signin"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: `${window.location.origin}/admin` },
            });
      if (error) throw error;
      if (mode === "signup") toast.success("Account created. Check your email if confirmation is required.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
  }

  return (
    <div className="mx-auto mt-16 max-w-md">
      <div className="glass-strong rounded-3xl p-8">
        <ShieldCheck className="size-8 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Counselor sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Protected area — lead pipeline and student analytics.
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="glass h-11 rounded-xl border-transparent"
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="glass h-11 rounded-xl border-transparent"
            />
          </div>
          <Button className="w-full rounded-xl" onClick={submit} disabled={busy}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
          <Button variant="outline" className="glass w-full rounded-xl" onClick={google}>
            Continue with Google
          </Button>
          <button
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="glass rounded-3xl p-6">
      <Icon className="size-5 text-primary" />
      <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-display mt-1 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Dashboard({ onSignOut }: { onSignOut: () => void }) {
  const overview = useServerFn(getAdminOverview);
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => overview({}),
  });

  const students = data?.students ?? [];
  const leads = data?.leads ?? [];
  const conversion = students.length ? Math.round((leads.length / students.length) * 100) : 0;

  const leadChart = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of leads) counts.set(l.lead_type, (counts.get(l.lead_type) ?? 0) + 1);
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [leads]);

  const dailyChart = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      const day = new Date(s.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return [...counts.entries()].slice(-14).map(([name, value]) => ({ name, value }));
  }, [students]);

  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.email} ${s.college ?? ""} ${s.city ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  if (error) {
    return (
      <div className="glass mx-auto mt-16 max-w-md rounded-3xl p-8 text-center">
        <p className="font-semibold">{(error as Error).message}</p>
        <Button variant="ghost" className="mt-4 rounded-xl" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Counselor Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Student assessments, lead pipeline and conversion analytics.
          </p>
        </div>
        <Button variant="ghost" className="rounded-xl" onClick={onSignOut}>
          <LogOut className="size-4" /> Sign out
        </Button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Total students" value={isLoading ? "…" : students.length} />
        <Stat icon={Target} label="Total leads" value={isLoading ? "…" : leads.length} />
        <Stat icon={Percent} label="Conversion rate" value={isLoading ? "…" : `${conversion}%`} />
        <Stat
          icon={ShieldCheck}
          label="Counseling interested"
          value={isLoading ? "…" : leads.filter((l) => l.lead_type === "Counseling Interested").length}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold">Lead classification</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={leadChart} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {leadChart.map((_, i) => (
                  <Cell key={i} fill={`var(--color-chart-${(i % 5) + 1})`} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-3xl p-6">
          <h2 className="font-semibold">Assessments over time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dailyChart} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--color-chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Tabs defaultValue="students" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="glass rounded-xl">
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
          </TabsList>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute top-3 left-3 size-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students"
                className="glass h-10 rounded-xl border-transparent pl-9"
              />
            </div>
            <Button
              variant="outline"
              className="glass rounded-xl"
              onClick={() => toCsv(students, "students.csv")}
            >
              <Download className="size-4" /> Export students
            </Button>
            <Button
              variant="outline"
              className="glass rounded-xl"
              onClick={() => toCsv(leads, "leads.csv")}
            >
              <Download className="size-4" /> Export leads
            </Button>
          </div>
        </div>

        <TabsContent value="students" className="mt-5">
          <div className="glass overflow-x-auto rounded-3xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.email}</TableCell>
                    <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {s.city}
                      {s.state ? `, ${s.state}` : ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{s.course}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-5">
          <div className="glass overflow-x-auto rounded-3xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Lead type</TableHead>
                  <TableHead>Degree mode</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {l.email}
                      <br />
                      {l.phone}
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-full font-normal">{l.lead_type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{l.degree_mode}</TableCell>
                    <TableCell className="text-muted-foreground">{l.budget}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{l.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const claim = useServerFn(claimAdminRole);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const adminQuery = useQuery({
    queryKey: ["is-admin", session?.user.id],
    queryFn: () => checkAdmin({}),
    enabled: Boolean(session),
  });

  const claimMutation = useMutation({
    mutationFn: () => claim({}),
    onSuccess: () => {
      toast.success("You are now the workspace administrator");
      queryClient.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await supabase.auth.signOut();
    queryClient.clear();
  }

  return (
    <div className="aurora min-h-screen pb-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <SiteHeader />
      </div>
      <main className="mx-auto max-w-6xl px-4 py-10">
        {!ready ? (
          <p className="mt-20 text-center text-muted-foreground">Loading…</p>
        ) : !session ? (
          <AuthCard />
        ) : adminQuery.isLoading ? (
          <p className="mt-20 text-center text-muted-foreground">Checking access…</p>
        ) : adminQuery.data?.isAdmin ? (
          <Dashboard onSignOut={signOut} />
        ) : (
          <div className="glass-strong mx-auto mt-16 max-w-md rounded-3xl p-8 text-center">
            <ShieldCheck className="mx-auto size-8 text-primary" />
            <h1 className="mt-4 text-xl font-bold">Admin access required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account doesn't have counselor access yet. If you're setting this platform up,
              claim the first administrator seat.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button
                className="rounded-xl"
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
              >
                Claim admin access
              </Button>
              <Button variant="ghost" className="rounded-xl" onClick={signOut}>
                <LogOut className="size-4" /> Sign out
              </Button>
              <Button asChild variant="link">
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
