"use client";

import { useStoryboardGenerator } from "@/hooks/useStoryboardGenerator";
import InputForm from "@/components/InputForm";
import LoadingState from "@/components/LoadingState";
import StoryboardDisplay from "@/components/StoryboardDisplay";

export default function Home() {
  const { phase, storyboard, error, generate, reset } =
    useStoryboardGenerator();

  const isGenerating =
    phase === "generating-script" || phase === "generating-images";

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="pt-12 pb-8 text-center">
        <p className="text-[13px] font-medium uppercase tracking-[0.1em] text-text-secondary mb-1">
          Storyboard Generator
        </p>
        <p className="text-[13px] text-text-secondary/60">
          AI-powered storyboard creation for advertising creatives
        </p>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {phase === "idle" && (
          <InputForm onGenerate={generate} disabled={false} />
        )}

        {isGenerating && <LoadingState phase={phase} />}

        {phase === "complete" && storyboard && (
          <StoryboardDisplay storyboard={storyboard} onBack={reset} />
        )}

        {phase === "error" && (
          <div className="w-full max-w-[640px] mx-auto px-6">
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-[15px] text-text mb-2">
                Something went wrong
              </p>
              <p className="text-[13px] text-text-secondary mb-6">
                {error || "An unexpected error occurred. Please try again."}
              </p>
              <button
                onClick={reset}
                className="px-5 py-2.5 bg-accent text-white text-[13px] font-medium rounded-lg hover:opacity-85 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
