export interface ReferenceImage {
  name: string;
  base64: string; // data URL (data:image/...;base64,...)
  purpose: "product" | "talent" | "visual-tone";
}

export interface StoryboardInput {
  productName: string;
  talent?: string;
  creativeTone?: string;
  duration?: "15" | "30" | "60";
  targetAudience?: string;
  keyMessage?: string;
  setting?: string;
  storyline?: string;
  additionalNotes?: string;
  referenceImages?: ReferenceImage[];
}

export interface StoryboardFrame {
  sceneNumber: number;
  timestamp: string;
  imageUrl: string;
  sceneDescription: string;
  dialogue: string;
  cameraWork: string;
  sound: string;
  directionNotes: string;
}

export interface StoryboardData {
  title: string;
  productName: string;
  duration: string;
  totalFrames: number;
  frames: StoryboardFrame[];
}

export type GenerationPhase =
  | "idle"
  | "generating-script"
  | "generating-images"
  | "complete"
  | "error";

export interface ClaudeFrame {
  sceneNumber: number;
  timestamp: string;
  sceneDescription: string;
  dialogue: string;
  cameraWork: string;
  sound: string;
  directionNotes: string;
  imagePrompt: string;
}

export interface ClaudeResponse {
  title: string;
  frames: ClaudeFrame[];
}
