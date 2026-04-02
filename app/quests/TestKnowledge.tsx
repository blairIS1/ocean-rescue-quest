"use client";
import { useState, useEffect } from "react";
import { TrainingData, generateTestRounds, CAT_LABELS } from "./data";
import BubblesBuddy from "./BubblesBuddy";
import { sfxCorrect, sfxWrong, sfxTap } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";

export default function TestKnowledge({ training, onComplete }: { training: TrainingData; onComplete: (needsRetrain: boolean) => void }) {
  const [rounds] = useState(() => generateTestRounds(training));
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [mood, setMood] = useState<"thinking" | "happy" | "scared">("thinking");
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { speak(VOICE.q3Start); return () => { stopSpeaking(); }; }, []);
  const scene = rounds[idx];
  const confColor = scene?.confidence >= 70 ? "#4ade80" : scene?.confidence >= 45 ? "#fbbf24" : "#ef4444";

  const advance = () => { setPicked(null); setMood("thinking"); setShowConfetti(false); if (idx + 1 < rounds.length) setIdx(idx + 1); else setDone(true); };

  const choose = (c: string) => {
    setPicked(c);
    if (c === scene.correct) { sfxCorrect(); setMood("happy"); setShowConfetti(true); setTimeout(advance, 1000); }
    else { sfxWrong(); setMood("scared"); setMistakes((m) => m + 1); setTimeout(advance, 1000); }
  };

  if (done) {
    const needsRetrain = mistakes >= 3;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={!needsRetrain} />
        <BubblesBuddy mood={needsRetrain ? "scared" : "celebrate"} size={120} />
        <h2 className="text-3xl font-bold">Test Complete!</h2>
        <p className="text-lg opacity-80">{mistakes === 0 ? "Perfect!" : `${mistakes} mistake${mistakes > 1 ? "s" : ""}. ${needsRetrain ? "Need more training!" : "Not bad!"}`}</p>
        {needsRetrain ? (
          <div className="flex gap-3 mt-4">
            <button className="btn" style={{ background: "var(--accent)", color: "#0f172a" }} onClick={() => { stopSpeaking(); sfxTap(); speak(VOICE.q3Retrain); onComplete(true); }}>🔄 Retrain</button>
            <button className="btn" style={{ background: "var(--card)" }} onClick={() => { stopSpeaking(); sfxTap(); onComplete(false); }}>Continue →</button>
          </div>
        ) : <button className="btn btn-success mt-4" onClick={() => { stopSpeaking(); sfxTap(); speak(VOICE.q3Learned); onComplete(false); }}>Next Quest →</button>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 sm:p-8 fade-in">
      <Confetti active={showConfetti} />
      <h2 className="text-2xl sm:text-3xl font-bold">🧪 Quest 2: Test the AI!</h2>
      <BubblesBuddy mood={mood} size={80} />
      <div className="text-sm opacity-70">{idx + 1} / {rounds.length}</div>
      <div className="text-7xl my-2">{scene.emoji}</div>
      <div className="text-xl font-semibold">{scene.label}</div>
      <div className="rounded-xl p-3 text-sm max-w-xs" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="text-xs opacity-50 mb-1">🤖 AI sensors:</div>
        <div className="flex flex-wrap gap-1">{scene.features.map((f) => <span key={f} className="rounded-full px-2 py-0.5 text-xs" style={{ background: "rgba(56,189,248,0.2)", color: "#38bdf8" }}>{f}</span>)}</div>
        <div className="mt-2 text-xs">AI says: <b style={{ color: scene.aiChoice === scene.correct ? "#4ade80" : "#ef4444" }}>{CAT_LABELS[scene.aiChoice]?.label || scene.aiChoice}</b> ({scene.confidence}%)</div>
      </div>
      <div className="flex items-center gap-2 w-48">
        <span className="text-xs opacity-60 w-20">Confidence:</span>
        <div className="progress-track flex-1"><div className="progress-fill" style={{ width: `${scene.confidence}%`, background: confColor }} /></div>
        <span className="text-sm font-bold" style={{ color: confColor }}>{scene.confidence}%</span>
      </div>
      {picked ? (
        <div className="text-lg text-center fade-in" style={{ color: picked === scene.correct ? "var(--success)" : "var(--warn)" }}>
          {picked === scene.correct ? "✅ Correct!" : `Oops! It's ${CAT_LABELS[scene.correct]?.label}! 😅`}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 justify-center max-w-sm fade-in">
          {Object.entries(CAT_LABELS).map(([key, { emoji, label }]) => (
            <button key={key} className="btn text-sm" onClick={() => { stopSpeaking(); sfxTap(); choose(key); }}>{emoji} {label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
