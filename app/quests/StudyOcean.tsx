"use client";
import { useState, useEffect } from "react";
import { TRAIN_ITEMS, TrainingData, CAT_LABELS } from "./data";
import BubblesBuddy from "./BubblesBuddy";
import GameImg from "./GameImg";
import { sfxCorrect, sfxWrong, sfxTap } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";
import { useSpeakLock } from "./useSpeakLock";

export default function StudyOcean({ onComplete }: { onComplete: (data: TrainingData) => void }) {
  const [items] = useState(() => [...TRAIN_ITEMS].sort(() => Math.random() - 0.5));
  const [idx, setIdx] = useState(0);
  const [training, setTraining] = useState<TrainingData>({});
  const [feedback, setFeedback] = useState("");
  const [mood, setMood] = useState<"idle" | "happy" | "scared">("idle");
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);
  const locked = useSpeakLock();

  useEffect(() => { speak(VOICE.q1Start); return () => { stopSpeaking(); }; }, []);

  const current = items[idx];
  const cats = Object.entries(CAT_LABELS);

  const advance = () => {
    setFeedback(""); setMood("idle"); setShowConfetti(false);
    if (idx + 1 < items.length) setIdx(idx + 1); else setDone(true);
  };

  const answer = (choice: string) => {
    const correct = choice === current.answer;
    if (correct) {
      sfxCorrect(); setMood("happy"); setShowConfetti(true);
      setTraining((t) => ({ ...t, [current.category]: (t[current.category] || 0) + 1 }));
      setFeedback("✅ Correct! " + current.label + " lives in the " + CAT_LABELS[current.answer].label + "!");
      speak(current.voiceCorrect).then(advance);
    } else {
      sfxWrong(); setMood("scared");
      setFeedback("Oops! That's actually " + CAT_LABELS[current.answer].label + " 😅");
      speak(current.voiceWrong).then(advance);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={true} />
        <BubblesBuddy mood="celebrate" size={120} />
        <h2 className="text-3xl font-bold">🧠 Training Complete!</h2>
        <button className="btn btn-success mt-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.q1Learned); onComplete(training); }}>
          See Results →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 sm:p-8 fade-in">
      <Confetti active={showConfetti} />
      <h2 className="text-2xl sm:text-3xl font-bold text-center">🔬 Quest 1: Study the Ocean!</h2>
      <BubblesBuddy mood={mood} size={80} />
      <p className="opacity-70 text-center max-w-md text-sm">Where does this creature live?</p>
      <div className="text-sm opacity-70">{idx + 1} / {items.length}</div>
      <div className="progress-track w-64"><div className="progress-fill" style={{ width: `${(idx / items.length) * 100}%` }} /></div>
      <div className="my-2"><GameImg img={current.img} emoji={current.emoji} size={96} /></div>
      <div className="text-xl font-semibold">{current.label}</div>
      <div className="text-lg min-h-[2em] font-semibold text-center">{feedback}</div>
      {!feedback && (
        <div className="flex flex-wrap gap-2 justify-center max-w-sm fade-in">
          {cats.map(([key, { emoji, label }]) => (
            <button key={key} className="btn text-sm" disabled={locked} onClick={() => { sfxTap(); answer(key); }}>
              {emoji} {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
