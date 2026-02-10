"use client";

import { StoryboardFrame } from "@/lib/types";

interface FrameCardProps {
  frame: StoryboardFrame;
}

export default function FrameCard({ frame }: FrameCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Frame Header */}
      <div className="px-6 py-3 border-b border-border bg-bg">
        <div className="flex items-center justify-between">
          <h3 className="text-[14px] font-bold text-text">
            Scene {frame.sceneNumber}
          </h3>
          <span className="text-[12px] font-medium text-text-secondary tracking-wide">
            {frame.timestamp}
          </span>
        </div>
      </div>

      {/* Frame Content */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr]">
        {/* Image */}
        <div className="aspect-square md:aspect-auto md:min-h-[280px] bg-bg border-b md:border-b-0 md:border-r border-border flex items-center justify-center overflow-hidden">
          {frame.imageUrl ? (
            <img
              src={frame.imageUrl}
              alt={`Scene ${frame.sceneNumber}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-text-secondary/40">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21,15 16,10 5,21" />
              </svg>
              <span className="text-[11px]">Image unavailable</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5 flex flex-col gap-4">
          <DetailSection label="Scene Description" content={frame.sceneDescription} />
          <DetailSection label="Dialogue / Narration" content={frame.dialogue} />
          <DetailSection label="Camera Work" content={frame.cameraWork} />
          <DetailSection label="Sound / BGM" content={frame.sound} />
          <DetailSection label="Direction Notes" content={frame.directionNotes} />
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  label,
  content,
}: {
  label: string;
  content: string;
}) {
  return (
    <div>
      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-secondary block mb-1">
        {label}
      </span>
      <p className="text-[14px] text-text leading-relaxed">{content}</p>
    </div>
  );
}
