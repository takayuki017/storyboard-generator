import { GoogleGenAI, Part } from "@google/genai";
import { readFileSync } from "fs";
import { join } from "path";
import { ReferenceImage } from "./types";

function getApiKey(): string {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
    return process.env.GEMINI_API_KEY;
  }
  // Fallback: read directly from .env.local
  try {
    const envPath = join(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^GEMINI_API_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  throw new Error("GEMINI_API_KEY not found");
}

function getClient() {
  return new GoogleGenAI({ apiKey: getApiKey() });
}

function parseDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL");
  return { mimeType: match[1], data: match[2] };
}

export async function generateImage(
  prompt: string,
  referenceImages?: ReferenceImage[]
): Promise<string> {
  const ai = getClient();

  // Build content parts
  const parts: Part[] = [];

  // Add reference images if provided
  if (referenceImages && referenceImages.length > 0) {
    for (const ref of referenceImages) {
      try {
        const { mimeType, data } = parseDataUrl(ref.base64);
        parts.push({
          inlineData: { mimeType, data },
        });
      } catch {
        // Skip invalid images
      }
    }
  }

  // Add text prompt
  parts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: parts,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  // Find the image part in the response
  const responseParts = response.candidates?.[0]?.content?.parts;
  if (!responseParts) {
    throw new Error("No response parts from Gemini");
  }

  for (const part of responseParts) {
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || "image/png";
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from Gemini");
}

export async function generateImages(
  prompts: string[],
  referenceImages?: ReferenceImage[]
): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    prompts.map((prompt) => generateImage(prompt, referenceImages))
  );

  return results.map((result) => {
    if (result.status === "fulfilled") return result.value;
    console.error("Image generation failed:", result.reason);
    return null;
  });
}
