import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { classifyLead, type AssessmentData, type CareerReport } from "./assessment";
import { analyseProfileAndCareers, recommendEducationAndPlan, chatWithAdvisor } from "./ai.server";

const assessmentSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  city: z.string().min(1),
  state: z.string().min(1),
  education: z.string().default(""),
  course: z.string().default(""),
  college: z.string().default(""),
  year: z.string().default(""),
  cgpa: z.string().default(""),
  skills: z.array(z.string()).default([]),
  interests: z.array(z.string()).default([]),
  dreamCareer: z.string().default(""),
  jobRole: z.string().default(""),
  industry: z.string().default(""),
  workLocation: z.string().default(""),
  salaryRange: z.string().default(""),
  degreeMode: z.string().default(""),
  counseling: z.string().default(""),
  budget: z.string().default(""),
  specialization: z.string().default(""),
});

export const submitAssessment = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => assessmentSchema.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const d = data as AssessmentData;

    const [part1, part2] = await Promise.all([
      analyseProfileAndCareers(d, apiKey),
      recommendEducationAndPlan(d, apiKey),
    ]);

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students")
      .insert({
        name: d.name,
        email: d.email,
        phone: d.phone,
        city: d.city,
        state: d.state,
        education: d.education,
        course: d.course,
        college: d.college,
        year: d.year,
        cgpa: d.cgpa,
        skills: d.skills,
        interests: d.interests,
        career_goals: {
          dream_career: d.dreamCareer,
          job_role: d.jobRole,
          industry: d.industry,
          work_location: d.workLocation,
          salary_range: d.salaryRange,
        },
        higher_education: {
          degree_mode: d.degreeMode,
          counseling: d.counseling,
          budget: d.budget,
          specialization: d.specialization,
        },
      })
      .select("id")
      .single();

    if (studentError || !student) throw new Error(studentError?.message ?? "Could not save profile");

    const { isLead, leadType } = classifyLead(d);
    if (isLead) {
      await supabaseAdmin.from("leads").upsert(
        {
          student_id: student.id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          degree_mode: d.degreeMode,
          counseling_required: d.counseling,
          lead_type: leadType,
          specialization: d.specialization || part2.degree_recommendation?.[0]?.specialization || null,
          budget: d.budget,
        },
        { onConflict: "email,lead_type", ignoreDuplicates: true },
      );
    }

    const { data: report, error: reportError } = await supabaseAdmin
      .from("ai_reports")
      .insert({
        student_id: student.id,
        profile_analysis: part1.profile_analysis,
        career_paths: part1.career_paths,
        skills_recommendation: part1.skills_recommendation,
        degree_recommendation: part2.degree_recommendation,
        university_recommendation: part2.university_recommendation,
        short_term_plan: part2.short_term_plan,
        long_term_plan: part2.long_term_plan,
        overall_recommendation: part2.overall_recommendation,
        match_score: Math.round(part1.match_score ?? 70),
      })
      .select("id")
      .single();

    if (reportError || !report) throw new Error(reportError?.message ?? "Could not save report");

    return { reportId: report.id as string, isLead, leadType };
  });

export const getReport = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: report, error } = await supabaseAdmin
      .from("ai_reports")
      .select("*, students(name,email,city,state,skills,interests,career_goals)")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!report) throw new Error("Report not found");
    const { students, ...rest } = report as Record<string, unknown> & { students: unknown };
    return { ...rest, student: students } as unknown as CareerReport;
  });

export const askAdvisor = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        reportId: z.string().uuid().nullable(),
        messages: z
          .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
          .max(20),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured for this project.");
    let context = "No report loaded yet.";
    if (data.reportId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: report } = await supabaseAdmin
        .from("ai_reports")
        .select("career_paths, skills_recommendation, degree_recommendation, overall_recommendation")
        .eq("id", data.reportId)
        .maybeSingle();
      if (report) context = JSON.stringify(report).slice(0, 6000);
    }
    const reply = await chatWithAdvisor(data.messages, context, apiKey);
    return { reply };
  });
