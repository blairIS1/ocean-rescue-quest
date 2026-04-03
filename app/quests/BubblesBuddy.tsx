"use client";

type Mood = "idle" | "happy" | "thinking" | "scared" | "celebrate";

export default function BubblesBuddy({ mood = "idle", size = 120, talking = false }: { mood?: Mood; size?: number; talking?: boolean }) {
  const eyes = mood === "happy" || mood === "celebrate" ? "◡" : mood === "scared" ? "●" : mood === "thinking" ? "◑" : "●";
  const mouth = mood === "happy" || mood === "celebrate" ? "◡" : mood === "scared" ? "○" : mood === "thinking" ? "—" : "◡";
  const bounce = mood === "celebrate" ? "animate-bounce" : mood === "happy" ? "animate-pulse" : "";
  const wiggle = mood === "scared" ? { animation: "wiggle 0.3s infinite alternate" } : {};

  return (
    <div className={`flex flex-col items-center ${bounce}`} style={{ ...wiggle, fontSize: size * 0.6 }}>
      <div style={{ fontSize: size * 0.8 }}>🐙</div>
      <div className="flex gap-2 -mt-2" style={{ fontSize: size * 0.15 }}>
        <span>{eyes}</span>
        <span>{eyes}</span>
      </div>
      <div style={{ fontSize: size * 0.12 }}>{mouth}</div>
      {mood === "celebrate" && <div className="text-xs mt-1">✨🫧✨</div>}
      {talking && (
        <div className="flex gap-1 mt-1">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "200ms" }} />
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--accent)", animationDelay: "400ms" }} />
        </div>
      )}
    </div>
  );
}
