import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "fs";
import { join } from "path";
import { StoryboardInput, ClaudeResponse, ReferenceImage } from "./types";

function getApiKey(): string {
  if (
    process.env.ANTHROPIC_API_KEY &&
    process.env.ANTHROPIC_API_KEY.length > 10
  ) {
    return process.env.ANTHROPIC_API_KEY;
  }
  // Fallback: read directly from .env.local
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^ANTHROPIC_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  throw new Error("ANTHROPIC_API_KEY not found");
}

function getClient() {
  return new Anthropic({
    apiKey: getApiKey(),
  });
}

function buildTextPrompt(input: StoryboardInput): string {
  const durationSeconds = input.duration || "30";
  const parts: string[] = [
    `Create a storyboard for a ${durationSeconds}-second commercial advertisement.`,
    `Product/Service: ${input.productName}`,
  ];

  if (input.talent) parts.push(`Talent/Cast: ${input.talent}`);
  if (input.creativeTone) parts.push(`Creative Tone: ${input.creativeTone}`);
  if (input.targetAudience)
    parts.push(`Target Audience: ${input.targetAudience}`);
  if (input.keyMessage) parts.push(`Key Message: ${input.keyMessage}`);
  if (input.setting) parts.push(`Setting/Location: ${input.setting}`);
  if (input.storyline)
    parts.push(
      `\nStoryline / Prompt (IMPORTANT — follow this storyline closely):\n${input.storyline}`
    );
  if (input.additionalNotes)
    parts.push(`Additional Notes: ${input.additionalNotes}`);

  // Reference image context
  const refs = input.referenceImages || [];
  const productRefs = refs.filter((r) => r.purpose === "product");
  const talentRefs = refs.filter((r) => r.purpose === "talent");
  const toneRefs = refs.filter((r) => r.purpose === "visual-tone");

  if (productRefs.length > 0) {
    parts.push(
      `\n[PRODUCT/SERVICE REFERENCE IMAGES ATTACHED] — Use these images to understand the product's actual appearance, packaging, logo, and branding. Accurately describe the product's visual details in each scene's imagePrompt so the image generator can reproduce the product faithfully.`
    );
  }
  if (talentRefs.length > 0) {
    parts.push(
      `\n[TALENT REFERENCE IMAGES ATTACHED] — Use these images as visual reference for the talent/cast appearance. Describe the person's look in each scene's imagePrompt so the image generator can reproduce a similar appearance.`
    );
  }
  if (toneRefs.length > 0) {
    parts.push(
      `\n[VISUAL TONE REFERENCE IMAGES ATTACHED] — Use these images as reference for the overall visual style, color palette, mood, and atmosphere. Incorporate this aesthetic into each scene's imagePrompt.`
    );
  }

  return parts.join("\n");
}

function parseDataUrl(dataUrl: string): {
  mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp";
  data: string;
} {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return {
    mediaType: match[1] as
      | "image/jpeg"
      | "image/png"
      | "image/gif"
      | "image/webp",
    data: match[2],
  };
}

function buildMessageContent(
  input: StoryboardInput
): Anthropic.MessageCreateParams["messages"][0]["content"] {
  const refs = input.referenceImages || [];

  // If no reference images, just send text
  if (refs.length === 0) {
    return buildTextPrompt(input);
  }

  // Build multimodal content with images + text
  const contentParts: Anthropic.ContentBlockParam[] = [];

  // Add product reference images
  const productRefs = refs.filter((r) => r.purpose === "product");
  if (productRefs.length > 0) {
    contentParts.push({
      type: "text",
      text: "Product/Service Reference Photos:",
    });
    for (const ref of productRefs) {
      const { mediaType, data } = parseDataUrl(ref.base64);
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data },
      });
    }
  }

  // Add talent reference images
  const talentRefs = refs.filter((r) => r.purpose === "talent");
  if (talentRefs.length > 0) {
    contentParts.push({
      type: "text",
      text: "Talent/Cast Reference Photos:",
    });
    for (const ref of talentRefs) {
      const { mediaType, data } = parseDataUrl(ref.base64);
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data },
      });
    }
  }

  // Add visual tone reference images
  const toneRefs = refs.filter((r) => r.purpose === "visual-tone");
  if (toneRefs.length > 0) {
    contentParts.push({
      type: "text",
      text: "Visual Tone / Mood Reference Images:",
    });
    for (const ref of toneRefs) {
      const { mediaType, data } = parseDataUrl(ref.base64);
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data },
      });
    }
  }

  // Add the main text prompt
  contentParts.push({
    type: "text",
    text: buildTextPrompt(input),
  });

  return contentParts;
}

function getFrameCount(duration: string): string {
  switch (duration) {
    case "15":
      return "3 to 4";
    case "60":
      return "7 to 8";
    default:
      return "5 to 6";
  }
}

export async function generateStoryboardScript(
  input: StoryboardInput
): Promise<ClaudeResponse> {
  const duration = input.duration || "30";
  const frameCount = getFrameCount(duration);

  const client = getClient();
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: `You are a senior creative director at a top advertising agency. You create compelling, visually rich storyboards for TV commercials.

You must respond with valid JSON only, no markdown, no code fences, no explanation. The JSON must follow this exact structure:

{
  "title": "A creative title for the storyboard",
  "frames": [
    {
      "sceneNumber": 1,
      "timestamp": "0:00 - 0:05",
      "sceneDescription": "Detailed description of what's happening visually in this scene",
      "dialogue": "Any spoken dialogue or narration. Use '(No dialogue)' if none",
      "cameraWork": "Camera angle, movement, and framing instructions",
      "sound": "Sound effects, music, or ambient audio notes",
      "directionNotes": "Additional creative direction for this scene",
      "imagePrompt": "A detailed, visual prompt for generating an illustration of this scene. Describe the composition, lighting, colors, characters, and setting. Style: advertising storyboard illustration, clean pencil sketch style with light watercolor wash. If talent reference photos were provided, describe the person's physical appearance (hair, build, clothing style, ethnicity) in detail so the image generator can reproduce a similar look. If visual tone references were provided, incorporate that color palette, mood, and style."
    }
  ]
}

Generate exactly ${frameCount} frames for a ${duration}-second commercial. Ensure timestamps cover the full duration. Make the imagePrompt highly descriptive and visual for each frame.

IMPORTANT:
- If a "Storyline / Prompt" is provided, follow it closely as the narrative backbone. Structure your frames to match the story arc described. If specific scenes are mentioned, use them as the basis for your frames.
- If reference images are attached, carefully analyze them and incorporate their visual details into your imagePrompt for each frame. For product images, describe the exact product appearance, packaging, colors, and logo. For talent images, describe their physical features. For visual tone images, match the mood, palette, and style.`,
    messages: [
      {
        role: "user",
        content: buildMessageContent(input),
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";

  try {
    return JSON.parse(text) as ClaudeResponse;
  } catch {
    // Fallback: try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as ClaudeResponse;
    }
    throw new Error("Failed to parse Claude response as JSON");
  }
}
