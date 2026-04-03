"use client";

const BASE = typeof window !== "undefined"
  ? window.location.pathname.replace(/\/$/, "") + "/images/"
  : "/images/";

export default function GameImg({ img, emoji, size = 80 }: { img?: string; emoji: string; size?: number }) {
  if (!img) return <span style={{ fontSize: size * 0.9 }}>{emoji}</span>;
  return <img src={`${BASE}${img}`} alt={emoji} width={size} height={size} style={{ display: "inline-block" }} />;
}
