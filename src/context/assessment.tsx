import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { emptyAssessment, type AssessmentData } from "@/lib/assessment";

type Ctx = {
  data: AssessmentData;
  update: (patch: Partial<AssessmentData>) => void;
  toggle: (key: "skills" | "interests", value: string) => void;
  step: number;
  setStep: (n: number) => void;
  reset: () => void;
};

const AssessmentContext = createContext<Ctx | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessmentData>(emptyAssessment);
  const [step, setStep] = useState(0);

  const value = useMemo<Ctx>(
    () => ({
      data,
      step,
      setStep,
      update: (patch) => setData((d) => ({ ...d, ...patch })),
      toggle: (key, val) =>
        setData((d) => ({
          ...d,
          [key]: d[key].includes(val) ? d[key].filter((v) => v !== val) : [...d[key], val],
        })),
      reset: () => {
        setData(emptyAssessment);
        setStep(0);
      },
    }),
    [data, step],
  );

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used inside AssessmentProvider");
  return ctx;
}
