"use client";

import { useEffect, useState } from "react";
import { GenerationPhase } from "@/lib/types";

interface LoadingStateProps {
  phase: GenerationPhase;
}

const steps = [
  { key: "analyzing", label: "Analyzing creative brief..." },
  { key: "writing", label: "Writing scene scripts..." },
  { key: "generating", label: "Generating storyboard images..." },
  { key: "assembling", label: "Assembling storyboard..." },
];

export default function LoadingState({ phase }: LoadingStateProps) {
  const [visibleSteps, setVisibleSteps] = useState(0);

  useEffect(() => {
    setVisibleSteps(1);

    const timers = [
      setTimeout(() => setVisibleSteps(2), 1800),
      setTimeout(() => setVisibleSteps(3), 3600),
      setTimeout(() => setVisibleSteps(4), 5400),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const completedStepIndex =
    phase === "generating-images" ? 1 : phase === "complete" ? 3 : -1;

  return (
    <div className="w-full max-w-[640px] mx-auto px-6">
      <div className="flex flex-col items-center py-16">
        {/* Spinner */}
        <div className="w-12 h-12 border-[3px] border-border border-t-accent rounded-full animate-[spin_0.8s_linear_infinite] mb-8" />

        <p className="text-[15px] text-text-secondary mb-8">
          Creating your storyboard...
        </p>

        {/* Step indicators */}
        <div className="flex flex-col gap-3 w-full max-w-[320px]">
          {steps.map((step, index) => {
            if (index >= visibleSteps) return null;

            const isCompleted = index <= completedStepIndex;

            return (
              <div
                key={step.key}
                className="animate-fade-in-up flex items-center gap-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span
                  className={`text-[13px] font-medium transition-colors duration-300 ${
                    isCompleted ? "text-accent" : "text-text-secondary"
                  }`}
                >
                  {isCompleted ? "\u2713" : "\u2022"}
                </span>
                <span
                  className={`text-[13px] transition-colors duration-300 ${
                    isCompleted ? "text-text" : "text-text-secondary"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
