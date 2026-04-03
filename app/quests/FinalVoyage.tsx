"use client";
import { useState, useEffect } from "react";
import { TrainingData, getConfidence, CATEGORIES } from "./data";
import BubblesBuddy from "./BubblesBuddy";
import { sfxCorrect, sfxTap, sfxCelebrate } from "./sfx";
import { speak, stopSpeaking } from "./speak";
import { VOICE } from "./voice";
import Confetti from "./Confetti";
import { useSpeakLock } from "./useSpeakLock";

const STEPS = [
  { label: "🚤 Set sail!", desc: "Leaving the harbor..." },
  { label: "🪸 Coral reef zone", desc: "Scanning for creatures..." },
  { label: "🌊 Deep sea dive", desc: "Going deeper..." },
  { label: "🏖️ Shoreline patrol", desc: "Checking tide pools..." },
  { label: "🧊 Arctic waters", desc: "Braving the cold..." },
  { label: "🏆 Mission complete!", desc: "All animals accounted for!" },
];

export default function FinalVoyage({ training, onComplete }: { training: TrainingData; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [auto, setAuto] = useState(false);
  const locked = useSpeakLock();

  // Intro voice — button stays locked until it finishes (via useSpeakLock)
  useEffect(() => { speak(VOICE.q5Start); return () => { stopSpeaking(); }; }, []);

  // Auto-advance through steps, wait for voice to finish between each
  useEffect(() => {
    if (!auto || done) return;
    const t = setTimeout(() => {
      sfxCorrect();
      if (step + 1 >= STEPS.length) {
        setDone(true);
        sfxCelebrate();
        speak(VOICE.q5Done);
      } else {
        setStep((s) => s + 1);
      }
    }, 3000);
    return () => clearTimeout(t);
  }, [auto, step, done]);

  const avgConf = Math.round(CATEGORIES.reduce((sum, c) => sum + getConfidence(training, c), 0) / CATEGORIES.length);

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8 fade-in">
        <Confetti active={true} />
        <BubblesBuddy mood="celebrate" size={160} />
        <h2 className="text-3xl font-bold text-center">🎉 Ocean Rescue Successful!</h2>
        <p className="text-xl">AI Confidence: <b>{avgConf}%</b></p>
        <p className="text-lg opacity-80 text-center max-w-md">Your training data helped Bubbles protect the whole ocean!</p>
        <button className="btn btn-success mt-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.q5Learned); onComplete(); }}>🏠 Mission Complete!</button>
      </div>
    );
  }

  const current = STEPS[step];
  const pct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-5 p-4 sm:p-8 fade-in">
      <h2 className="text-2xl sm:text-3xl font-bold">🌊 Quest 4: Final Voyage!</h2>
      <BubblesBuddy mood={auto ? "happy" : "idle"} size={100} />
      <div className="text-sm opacity-60">AI Confidence: {avgConf}%</div>
      <div className="w-72">
        <div className="progress-track"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <div className="text-center text-sm mt-1 opacity-70">Step {step + 1} / {STEPS.length}</div>
      </div>
      <div className="text-4xl my-2">{current.label}</div>
      <div className="text-lg font-semibold">{current.desc}</div>
      <div className="flex flex-col gap-1 w-72 max-h-32 overflow-y-auto text-sm opacity-60">
        {STEPS.slice(0, step + 1).map((s, i) => <div key={i}>✅ {s.label}</div>)}
      </div>
      {!auto ? (
        <button className="btn btn-primary text-xl mt-4" disabled={locked} onClick={() => { sfxTap(); speak(VOICE.q5Launch).then(() => setAuto(true)); }}>🚤 Set Sail!</button>
      ) : (
        <div className="text-sm opacity-50 mt-4">🤖 Bubbles is navigating...</div>
      )}
    </div>
  );
}
