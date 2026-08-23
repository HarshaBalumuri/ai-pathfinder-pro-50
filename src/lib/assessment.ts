export const SKILL_OPTIONS = [
  "Programming",
  "Communication",
  "Leadership",
  "Data Analysis",
  "Design",
  "Marketing",
  "Problem Solving",
  "AI/ML",
  "Web Development",
  "Cybersecurity",
];

export const INTEREST_OPTIONS = [
  "Artificial Intelligence",
  "Software Development",
  "Data Science",
  "Cybersecurity",
  "Cloud Computing",
  "Business",
  "Finance",
  "Marketing",
  "UI/UX Design",
  "Entrepreneurship",
];

export const DEGREE_MODES = [
  "Online Degree",
  "Offline Degree",
  "Hybrid",
  "Distance Learning",
  "Not Sure Yet",
];

export const COUNSELING_OPTIONS = [
  "Yes, I want counseling",
  "Yes, I want more information",
  "Maybe, I'm exploring options",
  "No, I just want career guidance",
];

export const BUDGET_OPTIONS = ["Below ₹1 Lakh", "₹1-3 Lakhs", "₹3-5 Lakhs", "₹5+ Lakhs"];

export type AssessmentData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  education: string;
  course: string;
  college: string;
  year: string;
  cgpa: string;
  skills: string[];
  interests: string[];
  dreamCareer: string;
  jobRole: string;
  industry: string;
  workLocation: string;
  salaryRange: string;
  degreeMode: string;
  counseling: string;
  budget: string;
  specialization: string;
};

export const emptyAssessment: AssessmentData = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  education: "",
  course: "",
  college: "",
  year: "",
  cgpa: "",
  skills: [],
  interests: [],
  dreamCareer: "",
  jobRole: "",
  industry: "",
  workLocation: "",
  salaryRange: "",
  degreeMode: "",
  counseling: "",
  budget: "",
  specialization: "",
};

export type CareerPath = {
  career: string;
  match_percentage: number;
  why_suitable: string;
  growth_potential: string;
  expected_salary: string;
  job_roles: string[];
};

export type Degree = {
  degree: string;
  specialization: string;
  duration: string;
  mode: string;
  why_it_fits: string;
};

export type University = {
  name: string;
  location: string;
  program: string;
  mode: string;
  estimated_fees: string;
  source: "AI Suggestion" | "Verified Institution" | string;
};

export type CareerReport = {
  id: string;
  student_id: string;
  match_score: number;
  overall_recommendation: string;
  profile_analysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    summary: string;
  };
  career_paths: CareerPath[];
  skills_recommendation: {
    missing_skills: string[];
    priority_skills: string[];
    learning_path: { beginner: string[]; intermediate: string[]; advanced: string[] };
  };
  degree_recommendation: Degree[];
  university_recommendation: University[];
  short_term_plan: {
    skills_to_learn: string[];
    projects_to_build: string[];
    resume_improvements: string[];
    internship_preparation: string[];
  };
  long_term_plan: {
    degree_path: string[];
    certifications: string[];
    career_progression: string[];
    higher_education_goals: string[];
  };
  created_at: string;
  student?: { name: string; email: string; city: string | null; state: string | null };
};

export function classifyLead(data: {
  degreeMode: string;
  counseling: string;
}): { isLead: boolean; leadType: string } {
  const { degreeMode, counseling } = data;
  const wantsCounseling =
    counseling === "Yes, I want counseling" || counseling === "Yes, I want more information";
  const degreeLead = degreeMode === "Online Degree" || degreeMode === "Distance Learning";

  let leadType = "Career Guidance Only";
  if (degreeMode === "Online Degree" || degreeMode === "Distance Learning") {
    leadType = "Online Degree Lead";
  } else if (degreeMode === "Offline Degree") {
    leadType = "Offline Degree Lead";
  } else if (degreeMode === "Hybrid") {
    leadType = "Hybrid Degree Lead";
  } else if (degreeMode === "Not Sure Yet") {
    leadType = "Undecided";
  }

  if (counseling === "Yes, I want counseling") leadType = "Counseling Interested";
  else if (counseling === "Yes, I want more information" && leadType === "Career Guidance Only")
    leadType = "Degree Explorer";
  else if (counseling === "Maybe, I'm exploring options" && !degreeLead)
    leadType = leadType === "Career Guidance Only" ? "Degree Explorer" : leadType;

  return { isLead: wantsCounseling || degreeLead, leadType };
}
