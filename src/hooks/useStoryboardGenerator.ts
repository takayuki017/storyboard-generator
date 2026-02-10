"use client";

import { useState, useCallback } from "react";
import { StoryboardInput, StoryboardData, GenerationPhase } from "@/lib/types";

export function useStoryboardGenerator() {
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [storyboard, setStoryboard] = useState<StoryboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (input: StoryboardInput) => {
    setError(null);
    setPhase("generating-script");

    try {
      // Simulate phase transition for UX (script phase shown first)
      const scriptPhaseTimer = new Promise<void>((resolve) =>
        setTimeout(resolve, 2000)
      );

      const fetchPromise = fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      // Wait at least 2s before switching to image phase
      const [response] = await Promise.all([fetchPromise, scriptPhaseTimer]);

      setPhase("generating-images");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Generation failed");
      }

      const data: StoryboardData = await response.json();
      setStoryboard(data);
      setPhase("complete");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setPhase("error");
    }
  }, []);

  const reset = useCallback(() => {
    setPhase("idle");
    setStoryboard(null);
    setError(null);
  }, []);

  return { phase, storyboard, error, generate, reset };
}
