import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { CareerReport } from "./assessment";

export function downloadReportPdf(report: CareerReport) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 44;
  const width = doc.internal.pageSize.getWidth();
  let y = 0;

  doc.setFillColor(76, 61, 200);
  doc.rect(0, 0, width, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("AI Career Report", margin, 46);
  doc.setFontSize(11);
  doc.text(`${report.student?.name ?? "Student"} · Match score ${report.match_score ?? 0}%`, margin, 68);
  y = 120;

  doc.setTextColor(30, 30, 45);

  const section = (title: string) => {
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.setFontSize(14);
    doc.text(title, margin, y);
    y += 16;
    doc.setFontSize(10);
  };

  const paragraph = (text: string) => {
    const lines = doc.splitTextToSize(text, width - margin * 2);
    for (const line of lines) {
      if (y > 780) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, margin, y);
      y += 14;
    }
    y += 10;
  };

  const bullets = (items: string[] = []) => {
    for (const item of items) {
      const lines = doc.splitTextToSize(`• ${item}`, width - margin * 2 - 8);
      for (const line of lines) {
        if (y > 780) {
          doc.addPage();
          y = 60;
        }
        doc.text(line, margin + 8, y);
        y += 14;
      }
    }
    y += 10;
  };

  section("Overall Recommendation");
  paragraph(report.overall_recommendation || "—");

  section("Strengths");
  bullets(report.profile_analysis?.strengths);
  section("Areas to Improve");
  bullets(report.profile_analysis?.weaknesses);
  section("Opportunities");
  bullets(report.profile_analysis?.opportunities);

  if (y > 620) {
    doc.addPage();
    y = 60;
  }
  section("Recommended Career Paths");
  autoTable(doc, {
    startY: y,
    head: [["Career", "Match", "Salary", "Growth"]],
    body: (report.career_paths ?? []).map((c) => [
      c.career,
      `${c.match_percentage}%`,
      c.expected_salary,
      c.growth_potential,
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [76, 61, 200] },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;

  section("Priority Skills");
  bullets(report.skills_recommendation?.priority_skills);
  section("Learning Path — Beginner");
  bullets(report.skills_recommendation?.learning_path?.beginner);
  section("Learning Path — Intermediate");
  bullets(report.skills_recommendation?.learning_path?.intermediate);
  section("Learning Path — Advanced");
  bullets(report.skills_recommendation?.learning_path?.advanced);

  doc.addPage();
  y = 60;
  section("Degree Recommendations");
  autoTable(doc, {
    startY: y,
    head: [["Degree", "Specialization", "Duration", "Mode"]],
    body: (report.degree_recommendation ?? []).map((d) => [
      d.degree,
      d.specialization,
      d.duration,
      d.mode,
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [76, 61, 200] },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;

  section("University Suggestions");
  autoTable(doc, {
    startY: y,
    head: [["University", "Location", "Program", "Fees", "Source"]],
    body: (report.university_recommendation ?? []).map((u) => [
      u.name,
      u.location,
      u.program,
      u.estimated_fees,
      u.source,
    ]),
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [76, 61, 200] },
    margin: { left: margin, right: margin },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;

  section("Short-Term Plan (3-6 Months)");
  bullets([
    ...(report.short_term_plan?.skills_to_learn ?? []),
    ...(report.short_term_plan?.projects_to_build ?? []),
    ...(report.short_term_plan?.resume_improvements ?? []),
    ...(report.short_term_plan?.internship_preparation ?? []),
  ]);
  section("Long-Term Plan (1-3 Years)");
  bullets([
    ...(report.long_term_plan?.degree_path ?? []),
    ...(report.long_term_plan?.certifications ?? []),
    ...(report.long_term_plan?.career_progression ?? []),
    ...(report.long_term_plan?.higher_education_goals ?? []),
  ]);

  doc.save(`career-report-${report.student?.name?.replace(/\s+/g, "-").toLowerCase() ?? "student"}.pdf`);
}
