"use client";
import { useState, useEffect } from "react";
import StudyOcean from "./quests/StudyOcean";
import TrainingSummary from "./quests/TrainingSummary";
import TestKnowledge from "./quests/TestKnowledge";
import RescueMission from "./quests/RescueMission";
import FinalVoyage from "./quests/FinalVoyage";
import BubblesBuddy from "./quests/BubblesBuddy";
import Confetti from "./quests/Confetti";
import SessionTimer, { useSessionTimer } from "./quests/SessionTimer";
import SpeakingIndicator from "./quests/SpeakingIndicator";
import { sfxTap, sfxCelebrate } from "./quests/sfx";
import { speak, stopSpeaking } from "./quests/speak";
import { startMusic, stopMusic } from "./quests/music";
import type { MusicStyle } from "./quests/music";
import { recordCompletion, getCompletions } from "./quests/scores";
import { TrainingData } from "./quests/data";
import { VOICE } from "./quests/voice";

const PARTS = [
  { emoji: "🔬", label: "Microscope" },
  { emoji: "🧪", label: "Lab Kit" },
  { emoji: "🗺️", label: "Ocean Map" },
  { emoji: "🚢", label: "Rescue Boat" },
  { emoji: "🏆", label: "Medal" },
];
const QUESTS = [
  { name: "🔬 Study the Ocean" },
  { name: "🧪 Test Knowledge" },
  { name: "🚢 Rescue Mission" },
  { name: "🌊 Final Voyage" },
];

type Phase = "start" | "menu" | "q1" | "summary" | "q2" | "q3" | "q4";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("start");
  const [completed, setCompleted] = useState([false, false, false, false]);
  const [training, setTraining] = useState<TrainingData>({});
  const [completions, setCompletions] = useState(0);
  const { expired, dismiss } = useSessionTimer();

  useEffect(() => { setCompletions(getCompletions()); }, []);

  const markDone = (i: number) => setCompleted((p) => { const n = [...p]; n[i] = true; return n; });

  const startGame = () => { stopSpeaking(); sfxTap(); startMusic("ocean"); speak(VOICE.welcome).then(() => { setPhase("menu"); speak(VOICE.menuSubtitle); }); };
  const startQuest = (p: Phase) => { stopSpeaking(); sfxTap(); setPhase(p); };

  if (expired) { stopMusic(); return <SessionTimer onDismiss={dismiss} />; }

  if (phase === "start") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 sm:p-8 fade-in">
        <SpeakingIndicator />
        <BubblesBuddy mood="idle" size={160} />
        <h1 className="text-3xl sm:text-5xl font-bold text-center">🌊 Ocean Rescue Quest</h1>
        <p className="text-base sm:text-xl text-center opacity-80 max-w-2xl px-4">Help Bubbles the octopus train an AI to protect ocean animals!</p>
        <button className="btn btn-primary text-xl sm:text-2xl px-8 py-4" onClick={startGame}>🎮 Start Adventure!</button>
        {completions > 0 && <p className="text-sm opacity-40">🏆 Completed {completions} time{completions > 1 ? "s" : ""}!</p>}
      </div>
    );
  }

  if (phase === "menu") {
    const phases: Phase[] = ["q1", "q2", "q3", "q4"];
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 sm:p-8 fade-in">
        <SpeakingIndicator />
        <Confetti active={completed.every(Boolean)} />
        <BubblesBuddy mood={completed.every(Boolean) ? "celebrate" : "idle"} size={140} />
        <h1 className="text-3xl sm:text-4xl font-bold text-center">Ocean Rescue Quest!</h1>
        <p className="text-base sm:text-lg text-center opacity-70 max-w-md px-4">Collect all tools and save the ocean!</p>
        <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
          {PARTS.map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1" style={{ opacity: completed[Math.min(i, 3)] ? 1 : 0.3 }}>
              <span className="text-2xl sm:text-3xl" style={{ filter: completed[Math.min(i, 3)] ? "none" : "grayscale(1)" }}>{p.emoji}</span>
              <span className="text-xs">{p.label}</span>
            </div>
          ))}
        </div>
        <div className="text-sm opacity-60">{completed.filter(Boolean).length}/4 quests</div>
        <div className="flex flex-col gap-3 w-full max-w-sm px-4">
          {QUESTS.map((q, i) => (
            <button key={i} className="btn btn-primary flex justify-between items-center text-sm sm:text-base"
              style={{ opacity: i === 0 || completed[i - 1] ? 1 : 0.4 }}
              disabled={i > 0 && !completed[i - 1]}
              onClick={() => startQuest(phases[i])}>
              <span>{q.name}</span>
              {completed[i] ? <span>✅</span> : <span className="opacity-40">{PARTS[i].emoji}</span>}
            </button>
          ))}
        </div>
        {completed.every(Boolean) && <div className="text-lg sm:text-xl font-bold text-center fade-in px-4" style={{ color: "var(--success)" }}>🎉 Ocean saved! All animals are safe!</div>}
      </div>
    );
  }

  return <>
    {phase === "q1" && <StudyOcean onComplete={(data) => {
      setTraining((prev) => { const m = { ...prev }; for (const [k, v] of Object.entries(data)) m[k] = (m[k] || 0) + v; return m; });
      markDone(0); setPhase("summary");
    }} />}
    {phase === "summary" && <TrainingSummary training={training} onComplete={() => setPhase("q2")} />}
    {phase === "q2" && <TestKnowledge training={training} onComplete={(retrain) => { if (retrain) setPhase("q1"); else { markDone(1); setPhase("q3"); } }} />}
    {phase === "q3" && <RescueMission onComplete={() => { markDone(2); setPhase("q4"); }} />}
    {phase === "q4" && <FinalVoyage training={training} onComplete={() => { markDone(3); setCompletions(recordCompletion()); sfxCelebrate(); setPhase("menu"); }} />}
  </>;
}
