import { NextRequest, NextResponse } from "next/server";
import { generateStoryboardScript } from "@/lib/claude";
import { generateImages } from "@/lib/dalle";
import { StoryboardInput, StoryboardData } from "@/lib/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = body as StoryboardInput;

    if (!input.productName || input.productName.trim().length === 0) {
      return NextResponse.json(
        { error: "Product/Service Name is required" },
        { status: 400 }
      );
    }

    if (input.productName.length > 200) {
      return NextResponse.json(
        { error: "Product/Service Name is too long (max 200 characters)" },
        { status: 400 }
      );
    }

    // Step 1: Generate storyboard script with Claude
    const script = await generateStoryboardScript(input);

    // Step 2: Generate images for each frame with Gemini
    const imagePrompts = script.frames.map((frame) => frame.imagePrompt);
    const images = await generateImages(imagePrompts, input.referenceImages);

    // Step 3: Combine script and images into final storyboard
    const storyboard: StoryboardData = {
      title: script.title,
      productName: input.productName,
      duration: `${input.duration || "30"}s`,
      totalFrames: script.frames.length,
      frames: script.frames.map((frame, index) => ({
        sceneNumber: frame.sceneNumber,
        timestamp: frame.timestamp,
        imageUrl: images[index] || "",
        sceneDescription: frame.sceneDescription,
        dialogue: frame.dialogue,
        cameraWork: frame.cameraWork,
        sound: frame.sound,
        directionNotes: frame.directionNotes,
      })),
    };

    return NextResponse.json(storyboard);
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
