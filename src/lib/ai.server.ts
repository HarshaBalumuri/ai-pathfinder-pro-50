import type { AssessmentData, CareerPath, Degree, University } from "./assessment";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

function profileText(d: AssessmentData) {
  return `Student profile:
Name: ${d.name}
Location: ${d.city}, ${d.state}
Current education: ${d.education} | Course: ${d.course} | College: ${d.college} | Year: ${d.year} | CGPA/%: ${d.cgpa}
Skills: ${d.skills.join(", ") || "none listed"}
Interests: ${d.interests.join(", ") || "none listed"}
Dream career: ${d.dreamCareer}
Preferred job role: ${d.jobRole}
Preferred industry: ${d.industry}
Preferred work location: ${d.workLocation}
Expected salary: ${d.salaryRange}
Higher education plan: ${d.degreeMode} | Counseling: ${d.counseling} | Budget: ${d.budget} | Specialization interest: ${d.specialization || "not specified"}`;
}

async function callGateway(system: string, user: string, apiKey: string): Promise<string> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429)
      throw new Error("Our AI engine is busy right now. Please retry in a moment.");
    if (res.status === 402)
      throw new Error("AI credits are exhausted for this workspace. Please add credits to continue.");
    throw new Error(`AI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "{}";
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "");
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

const BASE_SYSTEM =
  "You are an expert Indian career counselor and higher-education advisor working for a premium EdTech platform. " +
  "You give practical, specific, India-aware guidance (INR salaries, Indian universities and online degree providers). " +
  "Always reply with valid JSON only, matching the requested schema exactly. No markdown, no commentary.";

/** Functions 1-3: profile analysis, career recommendation, skill recommendation. */
export async function analyseProfileAndCareers(d: AssessmentData, apiKey: string) {
  const raw = await callGateway(
    BASE_SYSTEM,
    `${profileText(d)}

Return JSON with this exact shape:
{
  "profile_analysis": { "summary": string, "strengths": string[5], "weaknesses": string[4], "opportunities": string[4] },
  "career_paths": [ { "career": string, "match_percentage": number (55-98), "why_suitable": string, "growth_potential": string, "expected_salary": string (INR ranges), "job_roles": string[4] } ] (exactly 5, sorted by match_percentage desc),
  "skills_recommendation": {
    "missing_skills": string[6],
    "priority_skills": string[4],
    "learning_path": { "beginner": string[4], "intermediate": string[4], "advanced": string[4] }
  },
  "match_score": number (overall readiness score 0-100)
}`,
    apiKey,
  );
  return parseJson(raw, {
    profile_analysis: {
      summary: "",
      strengths: [] as string[],
      weaknesses: [] as string[],
      opportunities: [] as string[],
    },
    career_paths: [] as CareerPath[],
    skills_recommendation: {
      missing_skills: [] as string[],
      priority_skills: [] as string[],
      learning_path: {
        beginner: [] as string[],
        intermediate: [] as string[],
        advanced: [] as string[],
      },
    },
    match_score: 70,
  });
}

/** Functions 4-6: degree recommendation, university recommendation, action plan. */
export async function recommendEducationAndPlan(d: AssessmentData, apiKey: string) {
  const raw = await callGateway(
    BASE_SYSTEM,
    `${profileText(d)}

Return JSON with this exact shape:
{
  "degree_recommendation": [ { "degree": string, "specialization": string, "duration": string, "mode": string, "why_it_fits": string } ] (3-4 items matching the student's preferred study mode and budget),
  "university_recommendation": [ { "name": string, "location": string, "program": string, "mode": string, "estimated_fees": string, "source": "Verified Institution" | "AI Suggestion" } ] (6 items; mark well-known real Indian universities/UGC-approved online degree providers as "Verified Institution" and speculative fits as "AI Suggestion"; respect the stated budget and location),
  "short_term_plan": { "skills_to_learn": string[4], "projects_to_build": string[3], "resume_improvements": string[3], "internship_preparation": string[3] },
  "long_term_plan": { "degree_path": string[3], "certifications": string[4], "career_progression": string[4], "higher_education_goals": string[3] },
  "overall_recommendation": string (a confident 4-6 sentence personalised recommendation)
}`,
    apiKey,
  );
  return parseJson(raw, {
    degree_recommendation: [] as Degree[],
    university_recommendation: [] as University[],
    short_term_plan: {
      skills_to_learn: [] as string[],
      projects_to_build: [] as string[],
      resume_improvements: [] as string[],
      internship_preparation: [] as string[],
    },
    long_term_plan: {
      degree_path: [] as string[],
      certifications: [] as string[],
      career_progression: [] as string[],
      higher_education_goals: [] as string[],
    },
    overall_recommendation: "",
  });
}

export async function chatWithAdvisor(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  context: string,
  apiKey: string,
): Promise<string> {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a friendly, concise AI career counselor for Indian students. Answer in 2-5 short sentences. " +
            "Use the student's report context when relevant.\n\nContext:\n" +
            context,
        },
        ...messages,
      ],
    }),
  });
  if (!res.ok) {
    if (res.status === 429) throw new Error("Too many messages right now — try again shortly.");
    if (res.status === 402) throw new Error("AI credits are exhausted for this workspace.");
    throw new Error(`AI request failed (${res.status})`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? "Sorry, I couldn't answer that.";
}
