"use client";

import { useState, useRef, useCallback } from "react";
import { StoryboardInput, ReferenceImage } from "@/lib/types";

interface InputFormProps {
  onGenerate: (input: StoryboardInput) => void;
  disabled: boolean;
}

export default function InputForm({ onGenerate, disabled }: InputFormProps) {
  const [productName, setProductName] = useState("");
  const [talent, setTalent] = useState("");
  const [creativeTone, setCreativeTone] = useState("");
  const [duration, setDuration] = useState<"15" | "30" | "60">("30");
  const [targetAudience, setTargetAudience] = useState("");
  const [keyMessage, setKeyMessage] = useState("");
  const [setting, setSetting] = useState("");
  const [storyline, setStoryline] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);

  const productFileRef = useRef<HTMLInputElement>(null);
  const talentFileRef = useRef<HTMLInputElement>(null);
  const toneFileRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback(
    (purpose: "product" | "talent" | "visual-tone") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
          if (!file.type.startsWith("image/")) return;
          if (file.size > 10 * 1024 * 1024) return; // 10MB limit

          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            setReferenceImages((prev) => {
              // Max 3 images per purpose
              const existing = prev.filter((img) => img.purpose === purpose);
              if (existing.length >= 3) return prev;
              return [...prev, { name: file.name, base64, purpose }];
            });
          };
          reader.readAsDataURL(file);
        });

        // Reset input so same file can be re-selected
        e.target.value = "";
      },
    []
  );

  const removeImage = useCallback((index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) return;

    const input: StoryboardInput = {
      productName: productName.trim(),
      ...(talent.trim() && { talent: talent.trim() }),
      ...(creativeTone.trim() && { creativeTone: creativeTone.trim() }),
      duration,
      ...(targetAudience.trim() && {
        targetAudience: targetAudience.trim(),
      }),
      ...(keyMessage.trim() && { keyMessage: keyMessage.trim() }),
      ...(setting.trim() && { setting: setting.trim() }),
      ...(storyline.trim() && { storyline: storyline.trim() }),
      ...(additionalNotes.trim() && {
        additionalNotes: additionalNotes.trim(),
      }),
      ...(referenceImages.length > 0 && { referenceImages }),
    };

    onGenerate(input);
  };

  const productImages = referenceImages.filter(
    (img) => img.purpose === "product"
  );
  const talentImages = referenceImages.filter(
    (img) => img.purpose === "talent"
  );
  const toneImages = referenceImages.filter(
    (img) => img.purpose === "visual-tone"
  );

  return (
    <div className="w-full max-w-[640px] mx-auto px-6">
      <div className="bg-card border border-border rounded-xl p-10 max-sm:p-6">
        <h2 className="text-[22px] font-bold text-text mb-1">
          Storyboard Generator
        </h2>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          Enter your creative brief to generate a complete storyboard with
          AI-powered scene descriptions and illustrations.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Product/Service Name - Required */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Product / Service Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Toyota Prius, Nike Air Max, Coca-Cola Zero"
              required
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Product/Service Reference Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Product / Service Reference
            </label>
            <input
              ref={productFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload("product")}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => productFileRef.current?.click()}
              className="w-full px-3 py-3 bg-bg border border-dashed border-border rounded-md text-[13px] text-text-secondary hover:border-accent hover:text-text transition-colors"
            >
              {productImages.length === 0
                ? "+ Upload product/service photos (max 3)"
                : "+ Add more photos"}
            </button>
            {productImages.length > 0 && (
              <div className="flex gap-2 mt-1">
                {productImages.map((img, i) => {
                  const globalIndex = referenceImages.indexOf(img);
                  return (
                    <div key={i} className="relative group">
                      <img
                        src={img.base64}
                        alt={img.name}
                        className="w-16 h-16 object-cover rounded-md border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(globalIndex)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                      <span className="block text-[9px] text-text-secondary/50 mt-0.5 truncate w-16 text-center">
                        Product
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-[12px] text-text-secondary/70">
              Optional — upload photos of the product, packaging, or logo
            </span>
          </div>

          {/* Talent/Cast */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Talent / Cast
            </label>
            <input
              type="text"
              value={talent}
              onChange={(e) => setTalent(e.target.value)}
              placeholder="e.g. Timothée Chalamet, Emma Stone"
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
            <span className="text-[12px] text-text-secondary/70">
              Optional — name of talent or actor appearing in the ad
            </span>
          </div>

          {/* Talent Reference Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Talent / Cast Reference
            </label>
            <input
              ref={talentFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload("talent")}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => talentFileRef.current?.click()}
              className="w-full px-3 py-3 bg-bg border border-dashed border-border rounded-md text-[13px] text-text-secondary hover:border-accent hover:text-text transition-colors"
            >
              {talentImages.length === 0
                ? "+ Upload talent/cast reference photos (max 3)"
                : "+ Add more photos"}
            </button>
            {talentImages.length > 0 && (
              <div className="flex gap-2 mt-1">
                {talentImages.map((img, i) => {
                  const globalIndex = referenceImages.indexOf(img);
                  return (
                    <div key={i} className="relative group">
                      <img
                        src={img.base64}
                        alt={img.name}
                        className="w-16 h-16 object-cover rounded-md border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(globalIndex)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                      <span className="block text-[9px] text-text-secondary/50 mt-0.5 truncate w-16 text-center">
                        Cast
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-[12px] text-text-secondary/70">
              Optional — upload photos of the talent/cast for visual reference
            </span>
          </div>

          {/* Creative Tone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Creative Tone
            </label>
            <input
              type="text"
              value={creativeTone}
              onChange={(e) => setCreativeTone(e.target.value)}
              placeholder="e.g. Warm and heartfelt, Energetic and bold, Cinematic"
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Visual Tone Reference Image Upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Visual Tone Reference
            </label>
            <input
              ref={toneFileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload("visual-tone")}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => toneFileRef.current?.click()}
              className="w-full px-3 py-3 bg-bg border border-dashed border-border rounded-md text-[13px] text-text-secondary hover:border-accent hover:text-text transition-colors"
            >
              {toneImages.length === 0
                ? "+ Upload mood/tone reference images (max 3)"
                : "+ Add more references"}
            </button>
            {toneImages.length > 0 && (
              <div className="flex gap-2 mt-1">
                {toneImages.map((img, i) => {
                  const globalIndex = referenceImages.indexOf(img);
                  return (
                    <div key={i} className="relative group">
                      <img
                        src={img.base64}
                        alt={img.name}
                        className="w-16 h-16 object-cover rounded-md border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(globalIndex)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                      <span className="block text-[9px] text-text-secondary/50 mt-0.5 truncate w-16 text-center">
                        Tone
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-[12px] text-text-secondary/70">
              Optional — upload mood boards, color palettes, or style references
            </span>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) =>
                setDuration(e.target.value as "15" | "30" | "60")
              }
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text focus:outline-none focus:border-accent transition-colors"
            >
              <option value="15">15 seconds</option>
              <option value="30">30 seconds</option>
              <option value="60">60 seconds</option>
            </select>
          </div>

          {/* Target Audience */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Young professionals aged 25-35, Families with kids"
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Key Message */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Key Message
            </label>
            <input
              type="text"
              value={keyMessage}
              onChange={(e) => setKeyMessage(e.target.value)}
              placeholder="e.g. Experience the future of driving, Taste the difference"
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Setting/Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Setting / Location
            </label>
            <input
              type="text"
              value={setting}
              onChange={(e) => setSetting(e.target.value)}
              placeholder="e.g. Modern kitchen, Downtown Tokyo, Beach at sunset"
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Storyline / Prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Storyline / Prompt
            </label>
            <textarea
              value={storyline}
              onChange={(e) => setStoryline(e.target.value)}
              placeholder={"e.g. A tired office worker discovers our product and her day transforms.\nScene 1: She struggles at her desk...\nScene 2: She notices the product in the fridge...\nScene 3: After trying it, she's full of energy..."}
              rows={5}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-y min-h-[120px]"
            />
            <span className="text-[12px] text-text-secondary/70">
              Optional — describe the story arc or specific scenes you want. The AI will follow your storyline.
            </span>
          </div>

          {/* Additional Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.05em] text-text-secondary">
              Additional Notes
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any extra creative direction, references, or requirements..."
              rows={3}
              className="w-full px-3 py-2.5 bg-bg border border-border rounded-md text-[15px] text-text placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-y min-h-[80px]"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={disabled || !productName.trim()}
            className="w-full mt-2 py-3 bg-accent text-white text-[15px] font-bold rounded-lg hover:opacity-85 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Generate Storyboard
          </button>
        </form>
      </div>
    </div>
  );
}
